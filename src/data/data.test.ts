// Corpus-wide integrity suite (spec §6). This complements the per-puzzle
// suite in puzzles.test.ts by asserting the whole-collection rules: totals,
// the daily/practice split, difficulty-to-word-count, rotation spacing with
// wrap-around, the 7-puzzle theme window with wrap-around, no word in more
// than two puzzles, and globally unique ids.

import { describe, it, expect } from 'vitest'
import { allPuzzles, dailyRotation, practiceOnlyPuzzles } from './index'
import type { Difficulty } from '../types'

const TOTAL_PUZZLES = 60
const DAILY_COUNT = 44
const PRACTICE_COUNT = 16
const THEME_WINDOW = 7
const MAX_WORD_USES = 2

const WORD_COUNT_BY_DIFFICULTY: Record<Difficulty, readonly number[]> = {
	easy: [4],
	medium: [4, 5],
	hard: [5],
}

describe('corpus-wide puzzle integrity', () => {
	it('contains exactly 60 puzzles', () => {
		expect(allPuzzles.length).toBe(TOTAL_PUZZLES)
	})

	it('splits into 44 daily and 16 practice puzzles', () => {
		expect(dailyRotation.length).toBe(DAILY_COUNT)
		expect(practiceOnlyPuzzles.length).toBe(PRACTICE_COUNT)
		expect(dailyRotation.length + practiceOnlyPuzzles.length).toBe(
			allPuzzles.length,
		)
	})

	it('matches word count to difficulty for every puzzle', () => {
		for (const puzzle of allPuzzles) {
			expect(WORD_COUNT_BY_DIFFICULTY[puzzle.difficulty]).toContain(
				puzzle.words.length,
			)
		}
	})

	it('never places two hard daily puzzles adjacent (with wrap-around)', () => {
		const n = dailyRotation.length
		for (let i = 0; i < n; i++) {
			const current = dailyRotation[i]
			const next = dailyRotation[(i + 1) % n]
			expect(current.difficulty === 'hard' && next.difficulty === 'hard').toBe(
				false,
			)
		}
	})

	it('never repeats a theme within any 7-puzzle daily window (with wrap-around)', () => {
		const n = dailyRotation.length
		for (let start = 0; start < n; start++) {
			const seen = new Set<string>()
			for (let offset = 0; offset < THEME_WINDOW; offset++) {
				const theme = dailyRotation[(start + offset) % n].theme.toLowerCase()
				expect(seen.has(theme)).toBe(false)
				seen.add(theme)
			}
		}
	})

	it('uses no word in more than two puzzles', () => {
		const counts = new Map<string, number>()
		for (const puzzle of allPuzzles) {
			for (const word of puzzle.words) {
				counts.set(word.text, (counts.get(word.text) ?? 0) + 1)
			}
		}
		for (const [, count] of counts) {
			expect(count).toBeLessThanOrEqual(MAX_WORD_USES)
		}
	})

	it('has globally unique puzzle ids', () => {
		const ids = allPuzzles.map((puzzle) => puzzle.id)
		expect(new Set(ids).size).toBe(ids.length)
	})

	it('keeps every daily puzzle out of the practice-only set and vice versa', () => {
		expect(dailyRotation.every((p) => p.practiceOnly !== true)).toBe(true)
		expect(practiceOnlyPuzzles.every((p) => p.practiceOnly === true)).toBe(true)
	})
})