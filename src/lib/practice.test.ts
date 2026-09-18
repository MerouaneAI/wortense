import { describe, it, expect } from 'vitest'
import { getPracticePool, pickPracticePuzzle } from './practice'
import type { Puzzle } from '../types'

function makePuzzle(id: string, practiceOnly = false): Puzzle {
	return {
		id,
		theme: 'Anger',
		axisLabels: { low: 'Least angry', high: 'Most angry' },
		difficulty: 'easy',
		cefr: 'B1',
		practiceOnly,
		words: [],
	}
}

const dailyRotation = [
	makePuzzle('d0'),
	makePuzzle('d1'),
	makePuzzle('d2'),
	makePuzzle('d3'),
]
const practiceOnly = [makePuzzle('x0', true), makePuzzle('x1', true)]

function ids(puzzles: Puzzle[]): string[] {
	return puzzles.map((p) => p.id).sort()
}

describe('getPracticePool', () => {
	it('excludes today and future dailies (dayIndex 0)', () => {
		expect(ids(getPracticePool(dailyRotation, practiceOnly, 0))).toEqual([
			'x0',
			'x1',
		])
	})

	it('includes only past dailies', () => {
		expect(ids(getPracticePool(dailyRotation, practiceOnly, 2))).toEqual([
			'd0',
			'd1',
			'x0',
			'x1',
		])
	})

	it('clamps the past count to the rotation length', () => {
		expect(ids(getPracticePool(dailyRotation, practiceOnly, 99))).toEqual([
			'd0',
			'd1',
			'd2',
			'd3',
			'x0',
			'x1',
		])
	})
})

describe('pickPracticePuzzle', () => {
	it('picks an unseen puzzle and appends it to the seen list', () => {
		const pool = [makePuzzle('a'), makePuzzle('b')]
		const rng = () => 0
		const first = pickPracticePuzzle(pool, [], rng)
		expect(first.puzzle?.id).toBe('a')
		expect(first.seenIds).toEqual(['a'])

		const second = pickPracticePuzzle(pool, first.seenIds, rng)
		expect(second.puzzle?.id).toBe('b')
		expect(second.seenIds).toEqual(['a', 'b'])
	})

	it('resets the seen list when the pool is exhausted', () => {
		const pool = [makePuzzle('a'), makePuzzle('b')]
		const result = pickPracticePuzzle(pool, ['a', 'b'], () => 0)
		expect(result.puzzle?.id).toBe('a')
		expect(result.seenIds).toEqual(['a'])
	})

	it('returns null for an empty pool', () => {
		expect(pickPracticePuzzle([], [], () => 0).puzzle).toBeNull()
	})
})