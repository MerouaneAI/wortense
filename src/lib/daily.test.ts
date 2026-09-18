import { describe, it, expect } from 'vitest'
import { selectDailyPuzzle, getDailyNumber, getDayIndex } from './daily'
import type { Puzzle } from '../types'

function makePuzzle(id: string): Puzzle {
	return {
		id,
		theme: 'Anger',
		axisLabels: { low: 'Least angry', high: 'Most angry' },
		difficulty: 'easy',
		cefr: 'B1',
		words: [],
	}
}

const rotation = [makePuzzle('p0'), makePuzzle('p1'), makePuzzle('p2')]

describe('selectDailyPuzzle', () => {
	it('selects by index', () => {
		expect(selectDailyPuzzle(rotation, 0)?.id).toBe('p0')
		expect(selectDailyPuzzle(rotation, 1)?.id).toBe('p1')
		expect(selectDailyPuzzle(rotation, 2)?.id).toBe('p2')
	})

	it('wraps around the rotation', () => {
		expect(selectDailyPuzzle(rotation, 3)?.id).toBe('p0')
		expect(selectDailyPuzzle(rotation, 4)?.id).toBe('p1')
		expect(selectDailyPuzzle(rotation, 7)?.id).toBe('p1')
	})

	it('returns null for an empty rotation', () => {
		expect(selectDailyPuzzle([], 0)).toBeNull()
	})
})

describe('getDailyNumber', () => {
	it('is the day index plus one', () => {
		expect(getDailyNumber(0)).toBe(1)
		expect(getDailyNumber(11)).toBe(12)
	})
})

describe('getDayIndex', () => {
	it('counts whole days from launch and clamps before it', () => {
		expect(getDayIndex('2026-10-01', '2026-10-01')).toBe(0)
		expect(getDayIndex('2026-10-11', '2026-10-01')).toBe(10)
		expect(getDayIndex('2026-09-30', '2026-10-01')).toBe(0)
	})
})