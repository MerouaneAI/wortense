import { describe, it, expect } from 'vitest'
import { fnv1a, mulberry32, createRng } from './prng'

describe('fnv1a', () => {
	it('is deterministic and returns an unsigned 32-bit integer', () => {
		const a = fnv1a('anger-01')
		const b = fnv1a('anger-01')
		expect(a).toBe(b)
		expect(Number.isInteger(a)).toBe(true)
		expect(a).toBeGreaterThanOrEqual(0)
		expect(a).toBeLessThanOrEqual(0xffffffff)
	})

	it('differs for different inputs', () => {
		expect(fnv1a('anger-01')).not.toBe(fnv1a('anger-02'))
		expect(fnv1a('')).not.toBe(fnv1a('a'))
	})
})

describe('mulberry32', () => {
	it('is deterministic for a given seed', () => {
		const r1 = mulberry32(12_345)
		const r2 = mulberry32(12_345)
		expect([r1(), r1(), r1()]).toEqual([r2(), r2(), r2()])
	})

	it('produces floats in [0, 1)', () => {
		const r = mulberry32(999)
		for (let i = 0; i < 1000; i++) {
			const v = r()
			expect(v).toBeGreaterThanOrEqual(0)
			expect(v).toBeLessThan(1)
		}
	})
})

describe('createRng', () => {
	it('is deterministic per seed string', () => {
		const a = createRng('puzzle-x')
		const b = createRng('puzzle-x')
		expect([a(), a(), a()]).toEqual([b(), b(), b()])
	})

	it('yields different streams for different seed strings', () => {
		const a = createRng('puzzle-x')
		const b = createRng('puzzle-y')
		expect([a(), a(), a()]).not.toEqual([b(), b(), b()])
	})
})