import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
	type Dispatch,
	type ReactNode,
} from 'react'
import type { Mode, Puzzle } from '../types'
import {
	createInitialGameState,
	emptyGameState,
	gameReducer,
	type GameAction,
	type GameState,
} from './gameReducer'
import { allPuzzles, dailyRotation, practiceOnlyPuzzles } from '../data'
import {
	getDailyNumber,
	getDayIndex,
	selectDailyPuzzle,
} from '../lib/daily'
import { getPracticePool, pickPracticePuzzle } from '../lib/practice'
import { getLocalDateKey } from '../lib/dates'
import { readJSON, writeJSON, STORAGE_KEYS } from '../lib/storage'
import { useStats } from './StatsProvider'
import { useSettings } from './SettingsProvider'
import { useDateRollover } from '../hooks/useDateRollover'
import { useReducedMotionSetting } from '../hooks/useReducedMotionSetting'
import { useToast, type ToastMessage } from '../hooks/useToast'

export interface GameContextValue {
	mode: Mode
	setMode: (mode: Mode) => void
	puzzle: Puzzle | null
	dailyNumber: number
	state: GameState
	dispatch: Dispatch<GameAction>
	newPractice: () => void
	toast: ToastMessage | null
	shakeNonce: number
	reducedMotion: boolean
}

const GameContext = createContext<GameContextValue | null>(null)

interface PersistedDaily {
	dateKey: string
	puzzleId: string
	game: GameState
}

interface PersistedPractice {
	game: GameState
	seenIds: string[]
}

function isStringArray(value: unknown): value is string[] {
	return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isGameState(value: unknown): value is GameState {
	if (typeof value !== 'object' || value === null) return false
	const g = value as Record<string, unknown>
	return (
		typeof g.puzzleId === 'string' &&
		(g.mode === 'daily' || g.mode === 'practice') &&
		isStringArray(g.solution) &&
		isStringArray(g.arrangement) &&
		isStringArray(g.lockedIds) &&
		typeof g.wordStates === 'object' &&
		g.wordStates !== null &&
		Array.isArray(g.attempts) &&
		(g.status === 'playing' || g.status === 'won' || g.status === 'lost') &&
		typeof g.isDragging === 'boolean' &&
		typeof g.isRevealing === 'boolean' &&
		typeof g.duplicateNonce === 'number'
	)
}

function isPersistedDaily(value: unknown): value is PersistedDaily {
	if (typeof value !== 'object' || value === null) return false
	const p = value as Record<string, unknown>
	return (
		typeof p.dateKey === 'string' &&
		typeof p.puzzleId === 'string' &&
		isGameState(p.game)
	)
}

function isPersistedPractice(value: unknown): value is PersistedPractice {
	if (typeof value !== 'object' || value === null) return false
	const p = value as Record<string, unknown>
	return isGameState(p.game) && isStringArray(p.seenIds)
}

/** Reset transient flags so a reload can never leave Submit disabled. */
function rehydrate(game: GameState): GameState {
	return { ...game, isDragging: false, isRevealing: false }
}

interface DailyInitArg {
	dailyPuzzle: Puzzle | null
	todayKey: string
}

function initDaily(arg: DailyInitArg): GameState {
	const stored = readJSON(STORAGE_KEYS.daily, isPersistedDaily)
	if (
		stored &&
		arg.dailyPuzzle &&
		stored.dateKey === arg.todayKey &&
		stored.puzzleId === arg.dailyPuzzle.id
	) {
		return rehydrate(stored.game)
	}
	return arg.dailyPuzzle
		? createInitialGameState(arg.dailyPuzzle, 'daily')
		: emptyGameState('daily')
}

function initPractice(): GameState {
	const stored = readJSON(STORAGE_KEYS.practice, isPersistedPractice)
	return stored ? rehydrate(stored.game) : emptyGameState('practice')
}

export function GameProvider({ children }: { children: ReactNode }) {
	const { recordDailyResult } = useStats()
	const { settings } = useSettings()

	const [todayKey, setTodayKey] = useState<string>(() => getLocalDateKey())
	const dayIndex = useMemo(() => getDayIndex(todayKey), [todayKey])
	const dailyPuzzle = useMemo(
		() => selectDailyPuzzle(dailyRotation, dayIndex),
		[dayIndex],
	)
	const dailyNumber = getDailyNumber(dayIndex)

	const [mode, setModeState] = useState<Mode>('daily')

	const [dailyGame, dailyDispatch] = useReducer(
		gameReducer,
		{ dailyPuzzle, todayKey },
		initDaily,
	)

	const [seenIds, setSeenIds] = useState<string[]>(() => {
		const stored = readJSON(STORAGE_KEYS.practice, isPersistedPractice)
		return stored ? stored.seenIds : []
	})

	const [practiceGame, practiceDispatch] = useReducer(
		gameReducer,
		undefined,
		initPractice,
	)

	const puzzleById = useMemo(() => {
		const map = new Map<string, Puzzle>()
		for (const puzzle of allPuzzles) map.set(puzzle.id, puzzle)
		return map
	}, [])

	// Persist the daily game.
	useEffect(() => {
		if (!dailyPuzzle) return
		const payload: PersistedDaily = {
			dateKey: todayKey,
			puzzleId: dailyPuzzle.id,
			game: dailyGame,
		}
		writeJSON(STORAGE_KEYS.daily, payload)
	}, [dailyGame, dailyPuzzle, todayKey])

	// Persist the practice game and its seen-id cursor.
	useEffect(() => {
		const payload: PersistedPractice = { game: practiceGame, seenIds }
		writeJSON(STORAGE_KEYS.practice, payload)
	}, [practiceGame, seenIds])

	// Record a completed daily exactly once per date (idempotent downstream too).
	const recordedRef = useRef<string | null>(null)
	useEffect(() => {
		if (!dailyPuzzle || dailyGame.status === 'playing') return
		const marker = `${todayKey}:${dailyGame.status}`
		if (recordedRef.current === marker) return
		recordedRef.current = marker
		recordDailyResult({
			won: dailyGame.status === 'won',
			attempts: dailyGame.attempts.length,
			dateKey: todayKey,
		})
	}, [
		dailyGame.status,
		dailyGame.attempts.length,
		dailyPuzzle,
		todayKey,
		recordDailyResult,
	])

	// Roll the daily puzzle over at local midnight.
	useDateRollover(
		useCallback(() => {
			setTodayKey(getLocalDateKey())
		}, []),
	)

	const lastDayRef = useRef(todayKey)
	useEffect(() => {
		if (lastDayRef.current === todayKey) return
		lastDayRef.current = todayKey
		recordedRef.current = null
		const fresh = dailyPuzzle
			? createInitialGameState(dailyPuzzle, 'daily')
			: emptyGameState('daily')
		dailyDispatch({ type: 'hydrate', state: fresh })
	}, [todayKey, dailyPuzzle])

	const newPractice = useCallback(() => {
		const pool = getPracticePool(dailyRotation, practiceOnlyPuzzles, dayIndex)
		const pick = pickPracticePuzzle(pool, seenIds, () => Math.random())
		if (!pick.puzzle) {
			practiceDispatch({ type: 'hydrate', state: emptyGameState('practice') })
			setSeenIds(pick.seenIds)
			return
		}
		practiceDispatch({
			type: 'hydrate',
			state: createInitialGameState(pick.puzzle, 'practice'),
		})
		setSeenIds(pick.seenIds)
	}, [dayIndex, seenIds])

	// Auto-pick the first practice puzzle when practice mode has none yet.
	useEffect(() => {
		if (mode !== 'practice' || practiceGame.puzzleId !== '') return
		const pool = getPracticePool(dailyRotation, practiceOnlyPuzzles, dayIndex)
		if (pool.length === 0) return
		newPractice()
	}, [mode, practiceGame.puzzleId, dayIndex, newPractice])

	const state = mode === 'daily' ? dailyGame : practiceGame
	const dispatch = mode === 'daily' ? dailyDispatch : practiceDispatch

	const currentPuzzle: Puzzle | null =
		mode === 'daily'
			? dailyPuzzle
			: (puzzleById.get(practiceGame.puzzleId) ?? null)

	// Duplicate-order feedback: toast + shake, no attempt consumed.
	const { toast, showToast } = useToast()
	const [shakeNonce, setShakeNonce] = useState(0)
	const dupRef = useRef(state.duplicateNonce)
	useEffect(() => {
		if (state.duplicateNonce === dupRef.current) return
		const grew = state.duplicateNonce > dupRef.current
		dupRef.current = state.duplicateNonce
		if (grew) {
			showToast('You already tried that order')
			setShakeNonce((n) => n + 1)
		}
	}, [state.duplicateNonce, showToast])

	const setMode = useCallback((next: Mode) => {
		setModeState(next)
	}, [])

	const reducedMotion = useReducedMotionSetting(settings.reduceMotion)

	const value = useMemo<GameContextValue>(
		() => ({
			mode,
			setMode,
			puzzle: currentPuzzle,
			dailyNumber,
			state,
			dispatch,
			newPractice,
			toast,
			shakeNonce,
			reducedMotion,
		}),
		[
			mode,
			setMode,
			currentPuzzle,
			dailyNumber,
			state,
			dispatch,
			newPractice,
			toast,
			shakeNonce,
			reducedMotion,
		],
	)

	return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame(): GameContextValue {
	const ctx = useContext(GameContext)
	if (!ctx) {
		throw new Error('useGame must be used within a GameProvider')
	}
	return ctx
}