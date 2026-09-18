import { describe, it, expect } from 'vitest'
import { buildShareText } from './share'
import type { Feedback } from '../types'

const winAttempts: Feedback[][] = [
	['close', 'far', 'correct', 'correct'],
	['correct', 'close', 'close', 'correct'],
	['correct', 'correct', 'correct', 'correct'],
]

const loseAttempts: Feedback[][] = [
	['far', 'far', 'far', 'far'],
	['close', 'far', 'far', 'close'],
	['close', 'close', 'far', 'close'],
	['close', 'close', 'close', 'close'],
]

describe('buildShareText', () => {
	it('builds the daily win grid exactly', () => {
		const text = buildShareText({
			mode: 'daily',
			theme: 'Anger',
			puzzleNumber: 12,
			attempts: winAttempts,
			won: true,
		})
		expect(text).toBe(
			'Wortense #12 · Anger · 3/4\n\n🟨⬜🟩🟩\n🟩🟨🟨🟩\n🟩🟩🟩🟩\nhttps://wortense.example',
		)
	})

	it('uses X/4 on a loss', () => {
		const text = buildShareText({
			mode: 'daily',
			theme: 'Anger',
			puzzleNumber: 12,
			attempts: loseAttempts,
			won: false,
		})
		expect(text.startsWith('Wortense #12 · Anger · X/4')).toBe(true)
	})

	it('uses the practice header', () => {
		const text = buildShareText({
			mode: 'practice',
			theme: 'Anger',
			puzzleNumber: 12,
			attempts: winAttempts,
			won: true,
		})
		expect(text.startsWith('Wortense Practice · Anger · 3/4')).toBe(true)
	})

	it('ends with the share url on its own line', () => {
		const text = buildShareText({
			mode: 'daily',
			theme: 'Anger',
			puzzleNumber: 1,
			attempts: winAttempts,
			won: true,
		})
		expect(text.endsWith('\nhttps://wortense.example')).toBe(true)
	})
})