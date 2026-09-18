// Puzzle data loader (spec §3). Batches are discovered with import.meta.glob so
// the app still runs even if only some batch files exist. Filename order defines
// the daily rotation order; practiceOnly puzzles are excluded from the rotation.

import type { Puzzle } from '../types'

const batchModules = import.meta.glob<Puzzle[]>('./puzzles/batch-*.json', {
	eager: true,
	import: 'default',
})

// Sort by path so batch-01, batch-02 … load in a stable, predictable order.
const orderedBatches: Puzzle[][] = Object.keys(batchModules)
	.sort()
	.map((path) => batchModules[path])

/** Every puzzle from every batch, in filename → array order. */
export const allPuzzles: readonly Puzzle[] = orderedBatches.flat()

/** Daily rotation: non-practiceOnly puzzles, in file order (spec §1.5, §3). */
export const dailyRotation: readonly Puzzle[] = allPuzzles.filter(
	(puzzle) => puzzle.practiceOnly !== true,
)

/** The practiceOnly puzzles; passed to getPracticePool alongside dailyRotation. */
export const practiceOnlyPuzzles: readonly Puzzle[] = allPuzzles.filter(
	(puzzle) => puzzle.practiceOnly === true,
)