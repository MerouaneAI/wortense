import type { Mode } from '../types'
import { useGame } from '../state/GameProvider'

const MODES: ReadonlyArray<{ value: Mode; label: string }> = [
	{ value: 'daily', label: 'Daily' },
	{ value: 'practice', label: 'Practice' },
]

/** Segmented control that switches between Daily and Practice modes. */
export function ModeSwitch() {
	const { mode, setMode } = useGame()

	return (
		<div
			role="tablist"
			aria-label="Game mode"
			className="inline-flex rounded-full border border-line bg-surface p-1"
		>
			{MODES.map((m) => {
				const active = m.value === mode
				return (
					<button
						key={m.value}
						role="tab"
						type="button"
						aria-selected={active}
						onClick={() => setMode(m.value)}
						className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
							active
								? 'bg-brand text-white'
								: 'text-muted hover:text-ink'
						}`}
					>
						{m.label}
					</button>
				)
			})}
		</div>
	)
}