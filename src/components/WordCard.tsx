import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import type { Feedback } from '../types'

export interface WordCardProps {
	id: string
	slot: number
	label: string
	feedback: Feedback | null
	highContrast: boolean
	interactive: boolean
	showMoveButtons: boolean
	disableUp: boolean
	disableDown: boolean
	onMove: (id: string, delta: 1 | -1) => void
}

const FEEDBACK_SR: Record<Feedback, string> = {
	correct: 'correct position',
	close: 'one place away',
	far: 'far from correct',
}

function tintClasses(feedback: Feedback | null, hc: boolean): string {
	if (feedback === null) {
		return 'bg-surface text-ink border-line'
	}
	if (feedback === 'correct') {
		return hc
			? 'bg-hc-correct text-white border-transparent'
			: 'bg-correct text-white border-transparent'
	}
	if (feedback === 'close') {
		return hc
			? 'bg-hc-close text-white border-transparent'
			: 'bg-close text-white border-transparent'
	}
	return hc
		? 'bg-hc-far text-white border-transparent'
		: 'bg-far text-white border-transparent'
}

function FeedbackGlyph({ feedback }: { feedback: Feedback }) {
	if (feedback === 'correct') {
		return (
			<span aria-hidden="true" className="text-base font-bold leading-none">
				✓
			</span>
		)
	}
	if (feedback === 'close') {
		return (
			<span aria-hidden="true" className="text-base font-bold leading-none">
				≈
			</span>
		)
	}
	return (
		<span aria-hidden="true" className="text-base font-bold leading-none">
			✕
		</span>
	)
}

/** A draggable, unlocked word row. Locked rows use LockedRow instead. */
export function WordCard({
	id,
	slot,
	label,
	feedback,
	highContrast,
	interactive,
	showMoveButtons,
	disableUp,
	disableDown,
	onMove,
}: WordCardProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id, disabled: !interactive })

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	return (
		<li
			ref={setNodeRef}
			style={style}
			className={`flex h-12 items-center gap-2 rounded-xl border pl-2 pr-2 shadow-sm ${tintClasses(
				feedback,
				highContrast,
			)} ${isDragging ? 'z-10 opacity-90 shadow-lg' : ''}`}
		>
			<button
				type="button"
				{...attributes}
				{...listeners}
				disabled={!interactive}
				style={{ touchAction: 'none' }}
				aria-label={`Reorder ${label}, position ${slot + 1}`}
				className="flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1 pl-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-default"
			>
				<GripVertical
					size={18}
					aria-hidden="true"
					className={feedback === null ? 'text-muted' : 'text-white/80'}
				/>
				<span className="truncate text-base font-semibold">{label}</span>
			</button>

			{feedback !== null ? (
				<span className="flex items-center gap-1">
					<FeedbackGlyph feedback={feedback} />
					<span className="sr-only">{FEEDBACK_SR[feedback]}</span>
				</span>
			) : null}

			{interactive && showMoveButtons ? (
				<span className="flex flex-col">
					<button
						type="button"
						onClick={() => onMove(id, -1)}
						disabled={disableUp}
						aria-label={`Move ${label} up`}
						className="rounded p-0.5 text-current opacity-80 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-30"
					>
						<ChevronUp size={16} aria-hidden="true" />
					</button>
					<button
						type="button"
						onClick={() => onMove(id, 1)}
						disabled={disableDown}
						aria-label={`Move ${label} down`}
						className="rounded p-0.5 text-current opacity-80 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-30"
					>
						<ChevronDown size={16} aria-hidden="true" />
					</button>
				</span>
			) : null}
		</li>
	)
}