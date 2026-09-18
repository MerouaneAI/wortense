// Pure feedback function (spec §1.2). For each word:
//   d = |currentSlot - correctSlot| (0-based; correctSlot = rank - 1)
//   d = 0 → correct, d = 1 → close, d >= 2 → far
// Feedback is indexed by slot. Because the result is based on fixed points of a
// permutation, the count of "correct" is never exactly N - 1 (unit-tested).

import type { Feedback } from '../types'

export function evaluateGuess(
	arrangement: readonly string[],
	solution: readonly string[],
): Feedback[] {
	const correctSlot = new Map<string, number>()
	solution.forEach((id, index) => {
		correctSlot.set(id, index)
	})

	return arrangement.map((id, slot): Feedback => {
		const target = correctSlot.get(id)
		if (target === undefined) {
			// Word not present in the solution — should not occur with valid data.
			return 'far'
		}
		const d = Math.abs(slot - target)
		if (d === 0) return 'correct'
		if (d === 1) return 'close'
		return 'far'
	})
}