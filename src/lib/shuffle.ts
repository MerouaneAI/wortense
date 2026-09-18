// Seeded derangement of a solution array (spec §1.1): no element keeps its
// original index, so the start is never the solved order and never gifts a
// free green. Bounded Fisher–Yates loop, falling back to a cyclic rotation
// by 1 (always a derangement for N >= 2).

import { createRng } from './prng'

const MAX_DERANGEMENT_TRIES = 100

/** Fisher–Yates shuffle driven by an external RNG. Returns a new array. */
export function shuffleWithRng<T>(items: readonly T[], rng: () => number): T[] {
	const result = items.slice()
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1))
		const tmp = result[i]
		result[i] = result[j]
		result[j] = tmp
	}
	return result
}

/** Cyclic rotation by one: result[i] = items[i - 1]. A derangement for N >= 2. */
export function rotateByOne<T>(items: readonly T[]): T[] {
	const n = items.length
	if (n <= 1) return items.slice()
	const result = new Array<T>(n)
	for (let i = 0; i < n; i++) {
		result[i] = items[(i - 1 + n) % n]
	}
	return result
}

/**
 * Deterministic derangement of `solution` seeded by `seedStr`.
 * Guarantees: same seed → same output; no fixed points; never equals `solution`
 * (for N >= 2). Arrays of length <= 1 are returned as a copy unchanged.
 */
export function seededDerangement<T>(
	solution: readonly T[],
	seedStr: string,
): T[] {
	const n = solution.length
	if (n <= 1) return solution.slice()

	const rng = createRng(seedStr)
	for (let attempt = 0; attempt < MAX_DERANGEMENT_TRIES; attempt++) {
		const candidate = shuffleWithRng(solution, rng)
		let isDerangement = true
		for (let i = 0; i < n; i++) {
			if (candidate[i] === solution[i]) {
				isDerangement = false
				break
			}
		}
		if (isDerangement) return candidate
	}
	return rotateByOne(solution)
}