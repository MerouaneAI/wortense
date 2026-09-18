// Haptic feedback via navigator.vibrate (spec §5.5). Feature-detected, on by
// default, and it never throws (iOS Safari has no vibrate support).

export type HapticPattern = 'light' | 'medium' | 'success' | 'error'

const PATTERNS: Record<HapticPattern, number | number[]> = {
	light: 10,
	medium: 20,
	success: [12, 40, 12],
	error: [30, 40, 30],
}

export function supportsHaptics(): boolean {
	return (
		typeof navigator !== 'undefined' &&
		typeof navigator.vibrate === 'function'
	)
}

export function vibrate(pattern: HapticPattern): void {
	if (!supportsHaptics()) return
	try {
		navigator.vibrate(PATTERNS[pattern])
	} catch {
		/* ignore — vibration is best-effort */
	}
}