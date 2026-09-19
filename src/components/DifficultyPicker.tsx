import type { Difficulty } from '../types'
import { useGame } from '../state/GameProvider'

const OPTIONS: ReadonlyArray<{ value: Difficulty | null; label: string }> = [
	{ value: null, label: 'All' },
	{ value: 'easy', label: 'Easy' },
	{ value: 'medium', label: 'Medium' },
	{ value: 'hard', label: 'Hard' },
]

/** Segmented difficulty filter shown only in practice mode. */
export function DifficultyPicker() {
	const { mode, practiceDifficulty, setPracticeDifficulty } = useGame()

	if (mode !== 'practice') return null

	return (
		<div className="flex flex-col items-center gap-1">
			<p className="text-xs font-semibold uppercase tracking-wide text-muted">
				Difficulty
			</p>
			<div
				role="radiogroup"
				aria-label="Practice difficulty"
				className="inline-flex rounded-full border border-line bg-surface p-1"
			>
				{OPTIONS.map((opt) => {
					const active = opt.value === practiceDifficulty
					return (
						<button
							key={opt.label}
							type="button"
							role="radio"
							aria-checked={active}
							onClick={() => setPracticeDifficulty(opt.value)}
							className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
								active
									? 'bg-brand text-white'
									: 'text-muted hover:text-ink'
							}`}
						>
							{opt.label}
						</button>
					)
				})}
			</div>
		</div>
	)
}
