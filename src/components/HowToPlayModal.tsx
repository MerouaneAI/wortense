import { Modal } from './Modal'

export interface HowToPlayModalProps {
	open: boolean
	onClose: () => void
}

/** First-run and on-demand explainer for the game rules. */
export function HowToPlayModal({ open, onClose }: HowToPlayModalProps) {
	return (
		<Modal open={open} onClose={onClose} title="How to play">
			<div className="flex flex-col gap-3 text-sm text-ink">
				<p>
					Every puzzle gives you 4 or 5 words that mean almost the same thing
					but differ in <strong>intensity</strong>.
				</p>
				<p>
					Drag the cards so they run from the <strong>mildest</strong> at the
					top to the <strong>most intense</strong> at the bottom, then tap{' '}
					<strong>Submit</strong>. You get 4 tries.
				</p>
				<ul className="flex flex-col gap-2">
					<li className="flex items-center gap-2">
						<span className="h-4 w-4 shrink-0 rounded-sm bg-correct" aria-hidden="true" />
						<span>
							<strong>Green (✓)</strong> — this word is in the correct spot and
							is now locked.
						</span>
					</li>
					<li className="flex items-center gap-2">
						<span className="h-4 w-4 shrink-0 rounded-sm bg-close" aria-hidden="true" />
						<span>
							<strong>Amber (≈)</strong> — one place away from correct.
						</span>
					</li>
					<li className="flex items-center gap-2">
						<span className="h-4 w-4 shrink-0 rounded-sm bg-far" aria-hidden="true" />
						<span>
							<strong>Grey (✕)</strong> — two or more places away.
						</span>
					</li>
				</ul>
				<p className="text-muted">
					A tint only counts while the card stays in the slot where it was
					checked. Move it and the tint clears. Come back every day for a new
					puzzle, or switch to Practice for unlimited rounds.
				</p>
			</div>
		</Modal>
	)
}