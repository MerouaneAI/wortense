import type { Feedback } from '../types'
import { useGame } from '../state/GameProvider'
import { useSettings } from '../state/SettingsProvider'

function squareClass(feedback: Feedback, hc: boolean): string {
	if (feedback === 'correct') return hc ? 'bg-hc-correct' : 'bg-correct'
	if (feedback === 'close') return hc ? 'bg-hc-close' : 'bg-close'
	return hc ? 'bg-hc-far' : 'bg-far'
}

/** A compact, colour-blind-safe grid of the player's submitted guesses. */
export function HistorySheet() {
	const { state } = useGame()
	const { settings } = useSettings()
	if (state.attempts.length === 0) return null

	return (
		<div
			aria-label="Your guesses, top to bottom, mildest to most intense"
			className="flex flex-col items-center gap-1.5"
		>
			{state.attempts.map((attempt, row) => (
				<div key={row} className="flex justify-center gap-1.5">
					{attempt.feedback.map((feedback, col) => (
						<span
							key={col}
							aria-hidden="true"
							className={`h-4 w-4 rounded-sm ${squareClass(
								feedback,
								settings.highContrast,
							)}`}
						/>
					))}
				</div>
			))}
		</div>
	)
}