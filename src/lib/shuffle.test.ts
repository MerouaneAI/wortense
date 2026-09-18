import { describe, it, expect } from 'vitest'
import { seededDerangement, shuffleWithRng, rotateByOne } from './shuffle'
import { mulberry32 } from './prng'

const solution = ['a', 'b', 'c', 'd']

describe('rotateByOne', () => {
	it('produces a derangement for N >= 2', () => {
		const rotated = rotateByOne(solution)
		expect(rotated).toHaveLength(solution.length)
		rotated.forEach((id, i) => {
			expect(id).not.toBe(solution[i])
		})
		expect([...rotated].sort()).toEqual([...solution].sort())
	})

	it('returns a copy for length <= 1', () => {
		expect(rotateByOne(['only'])).toEqual(['only'])
		expect(rotateByOne([])).toEqual([])
	})
})

describe('shuffleWithRng', () => {
	it('preserves the exact multiset of elements', () => {
		const shuffled = shuffleWithRng(solution, mulberry32(42))
		expect([...shuffled].sort()).toEqual([...solution].sort())
	})
})

describe('seededDerangement', () => {
	it('is deterministic per seed string', () => {
		const a = seededDerangement(solution, 'anger-01')
		const b = seededDerangement(solution, 'anger-01')
		expect(a).toEqual(b)
	})

	it('is never the solved order and has no fixed points', () => {
		const ids4 = ['w1', 'w2', 'w3', 'w4']
		const ids5 = ['w1', 'w2', 'w3', 'w4', 'w5']
		for (let seed = 0; seed < 300; seed++) {
			for (const ids of [ids4, ids5]) {
				const result = seededDerangement(ids, `seed-${seed}`)
				expect([...result].sort()).toEqual([...ids].sort())
				expect(result).not.toEqual(ids)
				result.forEach((id, i) => {
					expect(id).not.toBe(ids[i])
				})
			}
		}
	})

	it('returns arrays of length <= 1 unchanged', () => {
		expect(seededDerangement(['only'], 'x')).toEqual(['only'])
		expect(seededDerangement([], 'x')).toEqual([])
	})
})