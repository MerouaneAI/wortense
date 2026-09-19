import { useCallback, useEffect, useRef, useState } from 'react'

export interface ToastMessage {
	id: number
	text: string
}

export interface UseToastResult {
	toast: ToastMessage | null
	showToast: (text: string, durationMs?: number) => void
	clearToast: () => void
}

const DEFAULT_DURATION = 2200

/** Single transient toast with auto-dismiss; the timer is always cleaned up. */
export function useToast(): UseToastResult {
	const [toast, setToast] = useState<ToastMessage | null>(null)
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const idRef = useRef(0)

	const clearTimer = useCallback(() => {
		if (timerRef.current !== null) {
			clearTimeout(timerRef.current)
			timerRef.current = null
		}
	}, [])

	const showToast = useCallback(
		(text: string, durationMs: number = DEFAULT_DURATION) => {
			clearTimer()
			idRef.current += 1
			setToast({ id: idRef.current, text })
			timerRef.current = setTimeout(() => {
				setToast(null)
				timerRef.current = null
			}, durationMs)
		},
		[clearTimer],
	)

	const clearToast = useCallback(() => {
		clearTimer()
		setToast(null)
	}, [clearTimer])

	useEffect(() => clearTimer, [clearTimer])

	return { toast, showToast, clearToast }
}