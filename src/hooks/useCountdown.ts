import { useEffect, useState } from 'react'

export interface Countdown {
	hours: number
	minutes: number
	seconds: number
	totalMs: number
}

function msUntilNextMidnight(now: Date): number {
	const next = new Date(now)
	next.setHours(24, 0, 0, 0)
	return next.getTime() - now.getTime()
}

function toCountdown(totalMs: number): Countdown {
	const clamped = Math.max(0, totalMs)
	const totalSeconds = Math.floor(clamped / 1000)
	return {
		hours: Math.floor(totalSeconds / 3600),
		minutes: Math.floor((totalSeconds % 3600) / 60),
		seconds: totalSeconds % 60,
		totalMs: clamped,
	}
}

/** Live countdown to the next local midnight; ticks once per second. */
export function useCountdown(): Countdown {
	const [countdown, setCountdown] = useState<Countdown>(() =>
		toCountdown(msUntilNextMidnight(new Date())),
	)

	useEffect(() => {
		const tick = () => {
			setCountdown(toCountdown(msUntilNextMidnight(new Date())))
		}
		tick()
		const interval = setInterval(tick, 1000)
		return () => {
			clearInterval(interval)
		}
	}, [])

	return countdown
}