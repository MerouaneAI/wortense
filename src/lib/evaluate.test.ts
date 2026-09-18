import { describe, it, expect } from 'vitest'
import { evaluateGuess } from './evaluate'
import type { Feedback } from '../types'

function permutations<T>(items: readonly T[]): T[][] {
	if (items.length <= 1) return [items.slice()]
	const result: T[][] = []
	for (let i = 0; i < items.length; i++) {
		const rest = items.slice(0, i).concat(items.slice(i + 1))
		for (const perm of permutations(rest)) {
			result.push([items[i], ...perm])
		}
	}
	return result
}

function countCorrect(fb: readonly Feedback[]): number {
	return fb.filter((f) => f === 'correct').length
}

const solution4 = ['a', 'b', 'c', 'd']
const solution5 = ['a', 'b', 'c', 'd', 'e']

describe('evaluateGuess', () => {
	it('marks every slot correct when arrangement equals solution', () => {
		expect(evaluateGuess(solution4, solution4)).toEqual([
			'correct',
			'correct',
			'correct',
			'correct',
		])
	})

	it('applies the distance definition (close vs far)', () => {
		// [b,a,d,c] → each word is exactly one slot off.
		expect(evaluateGuess(['b', 'a', 'd', 'c'], solution4)).toEqual([
			'close',
			'close',
			'close',
			'close',
		])
		// [d,b,c,a] → d and a are 3 slots off (far); b,c correct.
		expect(evaluateGuess(['d', 'b', 'c', 'a'], solution4)).toEqual([
			'far',
			'correct',
			'correct',
			'far',
		])
	})

	it('over all permutations (N=4): never exactly N-1 correct; correct == fixed points', () => {
		for (const perm of permutations(solution4)) {
			const fb = evaluateGuess(perm, solution4)
			const correct = countCorrect(fb)
			expect(correct).not.toBe(solution4.length - 1)
			const fixed = perm.filter((id, i) => id === solution4[i]).length
			expect(correct).toBe(fixed)
		}
	})

	it('over all permutations (N=5): never exactly N-1 correct; correct == fixed points', () => {
		for (const perm of permutations(solution5)) {
			const fb = evaluateGuess(perm, solution5)
			const correct = countCorrect(fb)
			expect(correct).not.toBe(solution5.length - 1)
			const fixed = perm.filter((id, i) => id === solution5[i]).length
			expect(correct).toBe(fixed)
		}
	})
})