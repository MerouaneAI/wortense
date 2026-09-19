// Pure game engine (spec §1.1–§1.4). No React, no DOM — fully unit-tested.
// The reducer owns arrangement, locks, per-word feedback memory, attempts and
// win/lose status. UI dispatches actions and reads the exported selectors.

import type { Feedback, Mode, Puzzle } from '../types'
import { MAX_ATTEMPTS } from '../config'
import { evaluateGuess } from '../lib/evaluate'
import { seededDerangement } from '../lib/shuffle'
import { moveUnlocked, moveUnlockedBy } from '../lib/reorder'

export type GameStatus = 'playing' | 'won' | 'lost'

/** One submitted attempt: the arrangement and its per-slot feedback. */
export interface AttemptRecord {
	arrangement: string[]
	feedback: Feedback[]
}

/**
 * Per-word feedback memory. The tint is only shown while the word still sits in
 * the slot where it was evaluated (spec §1.3); once it leaves, the selector
 * returns null and the card reverts to neutral.
 */
export interface WordState {
	feedback: Feedback | null
	evaluatedSlot: number | null
}

export interface GameState {
	puzzleId: string
	mode: Mode
	/** Word ids in rank order: solution[0] has rank 1 (mildest). */
	solution: string[]
	/** Current arrangement of word ids, indexed by slot (0 = top). */
	arrangement: string[]
	/** Correct-and-locked word ids, kept in slot order. */
	lockedIds: string[]
	/** Feedback memory keyed by word id. */
	wordStates: Record<string, WordState>
	attempts: AttemptRecord[]
	status: GameStatus
	isDragging: boolean
	isRevealing: boolean
	/**
	 * Bumped whenever a duplicate submission is rejected (spec §1.4). UI effects
	 * watch this to shake the ladder and show the toast; it consumes no attempt.
	 */
	duplicateNonce: number
}

export type GameAction =
	| { type: 'moveOver'; activeId: string; overId: string }
	| { type: 'moveBy'; id: string; delta: 1 | -1 }
	| { type: 'setDragging'; dragging: boolean }
	| { type: 'setRevealing'; revealing: boolean }
	| { type: 'submit' }
	| { type: 'hydrate'; state: GameState }

/** Word ids sorted by rank (rank 1 first). The app never relies on array order. */
function buildSolution(puzzle: Puzzle): string[] {
	return [...puzzle.words].sort((a, b) => a.rank - b.rank).map((w) => w.text)
}

function sameOrder(a: readonly string[], b: readonly string[]): boolean {
	if (a.length !== b.length) return false
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false
	}
	return true
}

function freshWordStates(ids: readonly string[]): Record<string, WordState> {
	const states: Record<string, WordState> = {}
	for (const id of ids) {
		states[id] = { feedback: null, evaluatedSlot: null }
	}
	return states
}

/** Deterministic new game for a puzzle: seeded derangement, no locks, no attempts. */
export function createInitialGameState(puzzle: Puzzle, mode: Mode): GameState {
	const solution = buildSolution(puzzle)
	const arrangement = seededDerangement(solution, puzzle.id)
	return {
		puzzleId: puzzle.id,
		mode,
		solution,
		arrangement,
		lockedIds: [],
		wordStates: freshWordStates(solution),
		attempts: [],
		status: 'playing',
		isDragging: false,
		isRevealing: false,
		duplicateNonce: 0,
	}
}

/** A harmless placeholder used only when no puzzle is available (empty rotation). */
export function emptyGameState(mode: Mode): GameState {
	return {
		puzzleId: '',
		mode,
		solution: [],
		arrangement: [],
		lockedIds: [],
		wordStates: {},
		attempts: [],
		status: 'playing',
		isDragging: false,
		isRevealing: false,
		duplicateNonce: 0,
	}
}

export function gameReducer(state: GameState, action: GameAction): GameState {
	switch (action.type) {
		case 'hydrate':
			return action.state

		case 'setDragging':
			if (state.isDragging === action.dragging) return state
			return { ...state, isDragging: action.dragging }

		case 'setRevealing':
			if (state.isRevealing === action.revealing) return state
			return { ...state, isRevealing: action.revealing }

		case 'moveOver': {
			if (state.status !== 'playing' || state.isRevealing) return state
			const next = moveUnlocked(
				state.arrangement,
				state.lockedIds,
				action.activeId,
				action.overId,
			)
			if (sameOrder(next, state.arrangement)) return state
			return { ...state, arrangement: next }
		}

		case 'moveBy': {
			if (state.status !== 'playing' || state.isRevealing) return state
			const next = moveUnlockedBy(
				state.arrangement,
				state.lockedIds,
				action.id,
				action.delta,
			)
			if (sameOrder(next, state.arrangement)) return state
			return { ...state, arrangement: next }
		}

		case 'submit': {
			if (state.status !== 'playing' || state.isDragging || state.isRevealing) {
				return state
			}
			const duplicate = state.attempts.some((a) =>
				sameOrder(a.arrangement, state.arrangement),
			)
			if (duplicate) {
				// No attempt consumed; signal the UI to shake + toast.
				return { ...state, duplicateNonce: state.duplicateNonce + 1 }
			}

			const feedback = evaluateGuess(state.arrangement, state.solution)

			const wordStates: Record<string, WordState> = { ...state.wordStates }
			state.arrangement.forEach((id, slot) => {
				wordStates[id] = { feedback: feedback[slot], evaluatedSlot: slot }
			})

			// Accumulate locks: every correct word stays locked in its slot.
			const lockedSet = new Set(state.lockedIds)
			state.arrangement.forEach((id, slot) => {
				if (feedback[slot] === 'correct') lockedSet.add(id)
			})
			const lockedIds = state.arrangement.filter((id) => lockedSet.has(id))

			const attempts: AttemptRecord[] = [
				...state.attempts,
				{ arrangement: state.arrangement.slice(), feedback },
			]

			const allCorrect = feedback.every((f) => f === 'correct')
			const status: GameStatus = allCorrect
				? 'won'
				: attempts.length >= MAX_ATTEMPTS
					? 'lost'
					: 'playing'

			return { ...state, wordStates, lockedIds, attempts, status, isRevealing: true }
		}

		default:
			return state
	}
}

// --- Selectors --------------------------------------------------------------

/** Tint for a slot, or null if the word there is not in its evaluated slot. */
export function feedbackForSlot(state: GameState, slot: number): Feedback | null {
	const id = state.arrangement[slot]
	if (id === undefined) return null
	const ws = state.wordStates[id]
	if (!ws || ws.feedback === null || ws.evaluatedSlot !== slot) return null
	return ws.feedback
}

export function isLocked(state: GameState, id: string): boolean {
	return state.lockedIds.includes(id)
}

/** Guaranteed never exactly 1 (a corollary of "never exactly N-1 correct"). */
export function unlockedCount(state: GameState): number {
	return state.arrangement.length - state.lockedIds.length
}

export function attemptsRemaining(state: GameState): number {
	return Math.max(0, MAX_ATTEMPTS - state.attempts.length)
}