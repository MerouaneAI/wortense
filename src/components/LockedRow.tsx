import { m } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Lock } from 'lucide-react'

export interface LockedRowProps {
	id: string
	slot: number
	label: string
	highContrast: boolean
	reducedMotion: boolean
}

/** A correct, locked word: pinned in place, never draggable, jumped over. */
export function LockedRow({
	id,
	slot,
	label,
	highContrast,
	reducedMotion,
}: LockedRowProps) {
	// Registered as a disabled sortable so the list geometry stays consistent.
	const { setNodeRef, transform, transition } = useSortable({
		id,
		disabled: true,
	})

	// dnd-kit transform stays on the outer <li>; the pop lives on the inner node.
	const liStyle: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	const tint = highContrast ? 'bg-hc-correct' : 'bg-correct'

	return (
		<li
			ref={setNodeRef}
			style={liStyle}
			aria-label={`${label}, locked in position ${slot + 1}`}
			className="list-none"
		>
			<m.div
				initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
				animate={
					reducedMotion ? { opacity: 1 } : { opacity: 1, scale: [0.85, 1.06, 1] }
				}
				transition={{
					duration: reducedMotion ? 0.12 : 0.4,
					times: reducedMotion ? undefined : [0, 0.6, 1],
				}}
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
			</m.div>
		</li>
	)
}