import { useEffect, useId, useRef } from 'react'
import { m, useAnimationControls } from 'framer-motion'
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	TouchSensor,
	closestCenter,
	useSensor,
	useSensors,
	type DragEndEvent,
} from '@dnd-kit/core'
import {
	restrictToParentElement,
	restrictToVerticalAxis,
} from '@dnd-kit/modifiers'
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useGame } from '../state/GameProvider'
import { useSettings } from '../state/SettingsProvider'
import { useEffectsChannel } from '../state/EffectsProvider'
import { feedbackForSlot, isLocked } from '../state/gameReducer'
import type { Feedback } from '../types'
import {
	REVEAL_FLIP_S,
	REVEAL_STAGGER_S,
	WordCard,
} from './WordCard'
import { LockedRow } from './LockedRow'

function flipSound(feedback: Feedback): 'flipCorrect' | 'flipClose' | 'flipFar' {
	if (feedback === 'correct') return 'flipCorrect'
	if (feedback === 'close') return 'flipClose'
	return 'flipFar'
}

/** The interactive vertical ladder with endpoint labels above and below. */
export function Ladder() {
	const { puzzle, state, dispatch, reducedMotion, shakeNonce } = useGame()
	const { settings } = useSettings()
	const { playSound, haptic } = useEffectsChannel()
	const dndId = useId()
	const shakeControls = useAnimationControls()

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 120, tolerance: 8 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	)

	// The real reveal: schedule per-slot flip sounds/haptics, then the win/lose
	// cue, then clear isRevealing after the flips (plus a ~1.2s pause on a win).
	useEffect(() => {
		if (!state.isRevealing) return
		const timers: ReturnType<typeof setTimeout>[] = []
		const n = state.arrangement.length
		const last = state.attempts[state.attempts.length - 1]
		const staggerMs = reducedMotion ? 0 : REVEAL_STAGGER_S * 1000
		const flipMs = reducedMotion ? 120 : REVEAL_FLIP_S * 1000

		if (last) {
			let correctIndex = 0
			last.feedback.forEach((fb, slot) => {
				const soundIndex = fb === 'correct' ? correctIndex++ : 0
				timers.push(
					setTimeout(() => {
						playSound(flipSound(fb), { index: soundIndex })
						if (fb === 'correct') {
							playSound('lock')
							haptic('light')
						}
					}, slot * staggerMs),
				)
			})
		}

		const revealDone = staggerMs * n + flipMs
		if (state.status === 'won') {
			timers.push(
				setTimeout(
					() => {
						playSound('win')
						haptic('success')
					},
					Math.max(0, revealDone - 120),
				),
			)
		} else if (state.status === 'lost') {
			timers.push(
				setTimeout(() => {
					playSound('lose')
					haptic('error')
				}, revealDone),
			)
		}

		const endPause = state.status !== 'playing' ? (reducedMotion ? 0 : 520) : 0
		timers.push(
			setTimeout(() => {
				dispatch({ type: 'setRevealing', revealing: false })
			}, revealDone + endPause),
		)

		return () => {
			timers.forEach(clearTimeout)
		}
	}, [
		state.isRevealing,
		state.arrangement.length,
		state.attempts,
		state.status,
		reducedMotion,
		dispatch,
		playSound,
		haptic,
	])

	// Shake + error cue when a duplicate order is rejected (no attempt consumed).
	const shakeSeen = useRef(shakeNonce)
	useEffect(() => {
		if (shakeSeen.current === shakeNonce) return
		shakeSeen.current = shakeNonce
		playSound('error')
		haptic('error')
		if (reducedMotion) return
		void shakeControls.start({
			x: [0, -8, 8, -6, 6, -3, 3, 0],
			transition: { duration: 0.45 },
		})
	}, [shakeNonce, reducedMotion, shakeControls, playSound, haptic])

	if (!puzzle) {
		return (
			<p className="text-center text-muted">
				No puzzles are available yet. Please check back soon.
			</p>
		)
	}

	const interactive = state.status === 'playing' && !state.isRevealing

	const unlocked = state.arrangement.filter((id) => !isLocked(state, id))
	const firstUnlocked = unlocked[0]
	const lastUnlocked = unlocked[unlocked.length - 1]

	function handleDragEnd(event: DragEndEvent) {
		dispatch({ type: 'setDragging', dragging: false })
		playSound('drop')
		const { active, over } = event
		if (!over || active.id === over.id) return
		dispatch({
			type: 'moveOver',
			activeId: String(active.id),
			overId: String(over.id),
		})
	}

	function handleMove(id: string, delta: 1 | -1) {
		dispatch({ type: 'moveBy', id, delta })
	}

	return (
		<div className="flex w-full flex-col gap-2">
			<p className="text-center text-xs font-semibold uppercase tracking-wide text-muted">
				{puzzle.axisLabels.low}
			</p>

			<DndContext
				id={dndId}
				sensors={sensors}
				collisionDetection={closestCenter}
				modifiers={[restrictToVerticalAxis, restrictToParentElement]}
				onDragStart={() => {
					dispatch({ type: 'setDragging', dragging: true })
					playSound('pick')
					haptic('light')
				}}
				onDragCancel={() => dispatch({ type: 'setDragging', dragging: false })}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={state.arrangement}
					strategy={verticalListSortingStrategy}
				>
					<m.ol
						animate={shakeControls}
						className="flex list-none flex-col gap-2 p-0"
					>
						{state.arrangement.map((id, slot) => {
							if (isLocked(state, id)) {
								return (
									<LockedRow
										key={id}
										id={id}
										slot={slot}
										label={id}
										highContrast={settings.highContrast}
										reducedMotion={reducedMotion}
									/>
								)
							}
							return (
								<WordCard
									key={id}
									id={id}
									slot={slot}
									label={id}
									feedback={feedbackForSlot(state, slot)}
									highContrast={settings.highContrast}
									interactive={interactive}
									revealing={state.isRevealing}
									reducedMotion={reducedMotion}
									showMoveButtons={settings.showMoveButtons}
									disableUp={id === firstUnlocked}
									disableDown={id === lastUnlocked}
									onMove={handleMove}
								/>
							)
						})}
					</m.ol>
				</SortableContext>
			</DndContext>

			<p className="text-center text-xs font-semibold uppercase tracking-wide text-muted">
				{puzzle.axisLabels.high}
			</p>
		</div>
	)
}