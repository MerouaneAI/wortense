import { useEffect, useRef } from 'react'
import { getLocalDateKey } from '../lib/dates'

/**
 * Calls onRollover whenever the local calendar day changes. Checks on an
 * interval and when the tab becomes visible again, so a backgrounded PWA still
 * rolls over promptly. StrictMode-safe: the timer and listener are cleaned up.
 */
export function useDateRollover(onRollover: () => void): void {
	const savedRef = useRef(onRollover)

	useEffect(() => {
		savedRef.current = onRollover
	}, [onRollover])

	useEffect(() => {
		let currentKey = getLocalDateKey()
		const check = () => {
			const key = getLocalDateKey()
			if (key !== currentKey) {
				currentKey = key
				savedRef.current()
			}
		}
		const interval = setInterval(check, 30_000)
		const onVisibility = () => {
			if (!document.hidden) check()
		}
		document.addEventListener('visibilitychange', onVisibility)
		return () => {
			clearInterval(interval)
			document.removeEventListener('visibilitychange', onVisibility)
		}
	}, [])
}