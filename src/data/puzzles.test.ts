import { describe, it, expect } from 'vitest'
import { allPuzzles, dailyRotation, practiceOnlyPuzzles } from './index'
import type { PartOfSpeech } from '../types'

const WORD_RE = /^[a-z]{3,13}$/
const CEFR_BY_DIFFICULTY = {
	easy: 'B1',
	medium: 'B2',
	hard: 'C1',
} as const

function wordCount(text: string): number {
	return text.trim().split(/\s+/).length
}

function containsWholeWord(sentence: string, word: string): boolean {
	return new RegExp(`\\b${word}\\b`).test(sentence.toLowerCase())
}

describe('batch puzzle data (per-puzzle integrity)', () => {
	it('loads at least one puzzle', () => {
		expect(allPuzzles.length).toBeGreaterThan(0)
	})

	it('splits into daily rotation and practiceOnly cleanly', () => {
		expect(dailyRotation.every((p) => p.practiceOnly !== true)).toBe(true)
		expect(practiceOnlyPuzzles.every((p) => p.practiceOnly === true)).toBe(true)
		expect(dailyRotation.length + practiceOnlyPuzzles.length).toBe(
			allPuzzles.length,
		)
	})

	it('has globally unique puzzle ids', () => {
		const ids = allPuzzles.map((p) => p.id)
		expect(new Set(ids).size).toBe(ids.length)
	})

	for (const puzzle of allPuzzles) {
		describe(`puzzle ${puzzle.id}`, () => {
			it('has a non-empty theme and axis labels', () => {
				expect(puzzle.theme.trim().length).toBeGreaterThan(0)
				expect(puzzle.axisLabels.low.trim().length).toBeGreaterThan(0)
				expect(puzzle.axisLabels.high.trim().length).toBeGreaterThan(0)
			})

			it('has 4 or 5 words matching the difficulty rule', () => {
				const n = puzzle.words.length
				expect(n === 4 || n === 5).toBe(true)
				if (puzzle.difficulty === 'easy') expect(n).toBe(4)
				if (puzzle.difficulty === 'hard') expect(n).toBe(5)
			})

			it('uses the CEFR level implied by its difficulty', () => {
				expect(puzzle.cefr).toBe(CEFR_BY_DIFFICULTY[puzzle.difficulty])
			})

			it('has ranks exactly 1..N', () => {
				const ranks = puzzle.words.map((w) => w.rank).sort((a, b) => a - b)
				const expected = Array.from(
					{ length: puzzle.words.length },
					(_v, i) => i + 1,
				)
				expect(ranks).toEqual(expected)
			})

			it('uses a single part of speech across all words', () => {
				const parts = new Set<PartOfSpeech>(
					puzzle.words.map((w) => w.partOfSpeech),
				)
				expect(parts.size).toBe(1)
			})

			it('has unique, well-formed word texts', () => {
				const texts = puzzle.words.map((w) => w.text)
				expect(new Set(texts).size).toBe(texts.length)
				for (const text of texts) {
					expect(WORD_RE.test(text)).toBe(true)
				}
			})

			it('respects length limits and embeds the word in every example', () => {
				for (const word of puzzle.words) {
					expect(wordCount(word.definition)).toBeLessThanOrEqual(20)
					expect(wordCount(word.example)).toBeLessThanOrEqual(18)
					expect(wordCount(word.whyHere)).toBeLessThanOrEqual(22)
					expect(containsWholeWord(word.example, word.text)).toBe(true)
				}
			})
		})
	}
})