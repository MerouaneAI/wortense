import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Lock } from 'lucide-react'

export interface LockedRowProps {
	id: string
	slot: number
	label: string
	highContrast: boolean
}

/** A correct, locked word: pinned in place, never draggable, jumped over. */
export function LockedRow({ id, slot, label, highContrast }: LockedRowProps) {
	// Registered as a disabled sortable so the list geometry stays consistent.
	const { setNodeRef, transform, transition } = useSortable({
		id,
		disabled: true,
	})

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	const tint = highContrast ? 'bg-hc-correct' : 'bg-correct'

	return (
		<li
			ref={setNodeRef}
			style={style}
			aria-label={`${label}, locked in position ${slot + 1}`}
			className={`flex h-12 items-center gap-2 rounded-xl border border-transparent px-3 text-white shadow-sm ${tint}`}
		>
			<Lock size={18} aria-hidden="true" className="text-white/90" />
			<span className="min-w-0 flex-1 truncate text-base font-semibold">
				{label}
			</span>
			<span aria-hidden="true" className="text-base font-bold leading-none">
				✓
			</span>
			<span className="sr-only">correct and locked</span>
		</li>
	)
}