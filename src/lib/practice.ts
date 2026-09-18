// Practice-mode pool + picker (spec §1.5). Pure and DOM-free.
// Pool = practiceOnly puzzles ∪ daily-rotation puzzles already in the past.
// Today's and future dailies are excluded so nothing is spoiled.

import type { Puzzle } from '../types'

/**
 * Build the practice pool for a given day index.
 * Past dailies = rotation[0 .. min(dayIndex, rotationLength) - 1].
 */
export function getPracticePool(
	dailyRotation: readonly Puzzle[],
	practiceOnlyPuzzles: readonly Puzzle[],
	dayIndex: number,
): Puzzle[] {
	const pastCount = Math.max(0, Math.min(dayIndex, dailyRotation.length))
	const pastDailies = dailyRotation.slice(0, pastCount)
	return [...practiceOnlyPuzzles, ...pastDailies]
}

export interface PracticePick {
	/** The chosen puzzle, or null when the pool is empty. */
	puzzle: Puzzle | null
	/** The updated seen-id list to persist (reset then seeded when exhausted). */
	seenIds: string[]
}

/**
 * Pick a random practice puzzle, avoiding repeats via `seenIds`. When every
 * puzzle has been seen the list resets, then the freshly picked id seeds it.
 * `rng` is injected so selection is testable and deterministic.
 */
export function pickPracticePuzzle(
	pool: readonly Puzzle[],
	seenIds: readonly string[],
	rng: () => number,
): PracticePick {
	if (pool.length === 0) return { puzzle: null, seenIds: [] }

	const seen = new Set(seenIds)
	let candidates = pool.filter((p) => !seen.has(p.id))
	let baseSeen: string[] = seenIds.slice()

	if (candidates.length === 0) {
		// Pool exhausted: reset the seen list and start a fresh cycle.
		candidates = pool.slice()
		baseSeen = []
	}

	const index = Math.floor(rng() * candidates.length)
	const puzzle = candidates[index]
	return { puzzle, seenIds: [...baseSeen, puzzle.id] }
}