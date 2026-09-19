import { useEffect } from 'react'

/**
 * A one-shot celebration. canvas-confetti is dynamically imported so it never
 * enters the initial bundle. The caller renders this only for a live win with
 * motion enabled, so there is no reduced-motion path to add here.
 */
export function Confetti() {
	useEffect(() => {
		let cancelled = false
		let reset: (() => void) | null = null

		void import('canvas-confetti').then((module) => {
			if (cancelled) return
			const confetti = module.default
			reset = () => confetti.reset()

			const colors = ['#15803d', '#c2410c', '#1a85ff', '#fbbf24']
			const end = Date.now() + 900

			const frame = () => {
				if (cancelled) return
				void confetti({
					particleCount: 3,
					angle: 60,
					spread: 55,
					startVelocity: 45,
					origin: { x: 0, y: 0.7 },
					colors,
				})
				void confetti({
					particleCount: 3,
					angle: 120,
					spread: 55,
					startVelocity: 45,
					origin: { x: 1, y: 0.7 },
					colors,
				})
				if (Date.now() < end) requestAnimationFrame(frame)
			}
			frame()
		})

		return () => {
			cancelled = true
			if (reset) reset()
		}
	}, [])

	return null
}