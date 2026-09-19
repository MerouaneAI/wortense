import { Modal } from './Modal'
import { StatsSummary } from './StatsSummary'

export interface StatsModalProps {
	open: boolean
	onClose: () => void
}

/** On-demand statistics view (daily results). */
export function StatsModal({ open, onClose }: StatsModalProps) {
	return (
		<Modal open={open} onClose={onClose} title="Statistics">
			<StatsSummary highlightBucket={null} />
			<p className="mt-4 text-xs text-muted">
				Statistics track the Daily puzzle. Practice rounds do not affect them.
			</p>
		</Modal>
	)
}