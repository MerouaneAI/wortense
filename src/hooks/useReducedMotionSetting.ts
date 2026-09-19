import { useEffect, useState } from 'react'

function systemReducedMotion(): boolean {
	if (typeof window === 'undefined' || !window.matchMedia) return false
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Effective reduced-motion flag: true when either the in-app setting is on or
 * the OS requests reduced motion. StrictMode-safe media-query subscription.
 */
export function useReducedMotionSetting(settingEnabled: boolean): boolean {
	const [systemReduced, setSystemReduced] = useState<boolean>(() =>
		systemReducedMotion(),
	)

	useEffect(() => {
		if (typeof window === 'undefined' || !window.matchMedia) return
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
		const onChange = (event: MediaQueryListEvent) => {
			setSystemReduced(event.matches)
		}
		setSystemReduced(mq.matches)
		mq.addEventListener('change', onChange)
		return () => {
			mq.removeEventListener('change', onChange)
		}
	}, [])

	return settingEnabled || systemReduced
}