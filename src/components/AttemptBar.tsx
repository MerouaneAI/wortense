import { MAX_ATTEMPTS } from '../config'
import { useGame } from '../state/GameProvider'

/** A row of pips showing how many of the four attempts have been used. */
export function AttemptBar() {
	const { state } = useGame()
	const used = state.attempts.length
	const remaining = Math.max(0, MAX_ATTEMPTS - used)

	return (
		<div
			className="flex items-center justify-center gap-2"
			aria-label={`${remaining} of ${MAX_ATTEMPTS} attempts remaining`}
		>
			{Array.from({ length: MAX_ATTEMPTS }, (_, i) => {
				const spent = i < used
				return (
					<span
						key={i}
						aria-hidden="true"
						className={`h-2.5 w-2.5 rounded-full ${
							spent ? 'bg-muted' : 'bg-brand'
						}`}
					/>
				)
			})}
		</div>
	)
}