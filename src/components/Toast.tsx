import { useGame } from '../state/GameProvider'

/** A single transient, politely-announced message anchored near the bottom. */
export function Toast() {
	const { toast } = useGame()

	return (
		<div
			aria-live="polite"
			className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
		>
			{toast ? (
				<div
					key={toast.id}
					className="pointer-events-auto rounded-full bg-ink px-4 py-2 text-sm font-medium text-bg shadow-lg"
				>
					{toast.text}
				</div>
			) : null}
		</div>
	)
}