import { useEffect, useId } from 'react'
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
import { feedbackForSlot, isLocked } from '../state/gameReducer'
import { WordCard } from './WordCard'
import { LockedRow } from './LockedRow'

/** The interactive vertical ladder with endpoint labels above and below. */
export function Ladder() {
	const { puzzle, state, dispatch, reducedMotion } = useGame()
	const { settings } = useSettings()
	const dndId = useId()

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 120, tolerance: 8 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	)

	// Clear the reveal flag so Submit re-enables (Phase 11 adds the flip anim).
	useEffect(() => {
		if (!state.isRevealing) return
		const delay = reducedMotion ? 0 : 140 * state.arrangement.length + 320
		const timer = setTimeout(() => {
			dispatch({ type: 'setRevealing', revealing: false })
		}, delay)
		return () => {
			clearTimeout(timer)
		}
	}, [state.isRevealing, state.arrangement.length, reducedMotion, dispatch])

	if (!puzzle) {
		return (
			<p className="text-center text-muted">
				No puzzles are available yet. Please check back soon.
			</p>
		)
	}

	const interactive = state.status === 'playing'

	const unlocked = state.arrangement.filter((id) => !isLocked(state, id))
	const firstUnlocked = unlocked[0]
	const lastUnlocked = unlocked[unlocked.length - 1]

	function handleDragEnd(event: DragEndEvent) {
		dispatch({ type: 'setDragging', dragging: false })
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
				onDragStart={() => dispatch({ type: 'setDragging', dragging: true })}
				onDragCancel={() => dispatch({ type: 'setDragging', dragging: false })}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={state.arrangement}
					strategy={verticalListSortingStrategy}
				>
					<ol className="flex list-none flex-col gap-2 p-0">
						{state.arrangement.map((id, slot) => {
							if (isLocked(state, id)) {
								return (
									<LockedRow
										key={id}
										id={id}
										slot={slot}
										label={id}
										highContrast={settings.highContrast}
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
									showMoveButtons={settings.showMoveButtons}
									disableUp={id === firstUnlocked}
									disableDown={id === lastUnlocked}
									onMove={handleMove}
								/>
							)
						})}
					</ol>
				</SortableContext>
			</DndContext>

			<p className="text-center text-xs font-semibold uppercase tracking-wide text-muted">
				{puzzle.axisLabels.high}
			</p>
		</div>
	)
}