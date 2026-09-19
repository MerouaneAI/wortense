import type { Difficulty } from '../types'
import { useGame } from '../state/GameProvider'

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
	easy: 'Easy',
	medium: 'Medium',
	hard: 'Hard',
}

const DIFFICULTY_CHIP: Record<Difficulty, string> = {
	easy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
	medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
	hard: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
}

/** The theme, mode/number line, and difficulty chip shown above the ladder. */
export function PuzzleHeader() {
	const { puzzle, mode, dailyNumber } = useGame()
	if (!puzzle) return null

	const subtitle =
		mode === 'daily' ? `Daily #${dailyNumber}` : 'Practice'

	return (
		<div className="flex w-full flex-col items-center gap-2 text-center">
			<p className="text-xs font-semibold uppercase tracking-widest text-muted">
				{subtitle}
			</p>
			<div className="flex items-center gap-2">
				<h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
					{puzzle.theme}
				</h2>
				<span
					className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${DIFFICULTY_CHIP[puzzle.difficulty]}`}
				>
					{DIFFICULTY_LABEL[puzzle.difficulty]}
				</span>
			</div>
			<p className="text-sm text-muted">
				Order the words from mildest to most intense.
			</p>
		</div>
	)
}