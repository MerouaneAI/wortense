import { useGame } from '../state/GameProvider'
import { unlockedCount } from '../state/gameReducer'

/** The primary action: evaluate the current arrangement. */
export function SubmitButton() {
	const { state, dispatch } = useGame()

	const gameOver = state.status !== 'playing'
	const disabled =
		gameOver ||
		state.isDragging ||
		state.isRevealing ||
		unlockedCount(state) === 0

	let label = 'Submit'
	if (state.status === 'won') label = 'Solved!'
	else if (state.status === 'lost') label = 'Out of tries'

	return (
		<button
			type="button"
			onClick={() => dispatch({ type: 'submit' })}
			disabled={disabled}
			className="w-full rounded-2xl bg-brand py-3 text-base font-semibold text-white shadow-sm transition-colors hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
		>
			{label}
		</button>
	)
}