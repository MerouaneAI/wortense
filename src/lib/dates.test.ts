import { describe, it, expect } from 'vitest'
import { getLocalDateKey, dayIndexFromKey, addDays } from './dates'

describe('getLocalDateKey', () => {
	it('formats a date as zero-padded YYYY-MM-DD', () => {
		expect(getLocalDateKey(new Date(2026, 0, 5))).toBe('2026-01-05')
		expect(getLocalDateKey(new Date(2026, 11, 31))).toBe('2026-12-31')
	})
})

describe('addDays', () => {
	it('adds within a month', () => {
		expect(addDays('2026-10-01', 5)).toBe('2026-10-06')
	})
	it('crosses month boundaries', () => {
		expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
	})
	it('crosses year boundaries', () => {
		expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
	})
	it('handles the leap day', () => {
		expect(addDays('2024-02-28', 1)).toBe('2024-02-29')
		expect(addDays('2024-02-29', 1)).toBe('2024-03-01')
	})
	it('subtracts days', () => {
		expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
		expect(addDays('2027-01-01', -1)).toBe('2026-12-31')
	})
})

describe('dayIndexFromKey', () => {
	it('is zero on launch day', () => {
		expect(dayIndexFromKey('2026-10-01', '2026-10-01')).toBe(0)
	})
	it('counts whole days forward', () => {
		expect(dayIndexFromKey('2026-10-01', '2026-10-11')).toBe(10)
	})
	it('clamps to zero before launch', () => {
		expect(dayIndexFromKey('2026-10-01', '2026-09-30')).toBe(0)
		expect(dayIndexFromKey('2026-10-01', '2020-01-01')).toBe(0)
	})
	it('crosses month/year/leap boundaries correctly', () => {
		expect(dayIndexFromKey('2026-12-31', '2027-01-01')).toBe(1)
		expect(dayIndexFromKey('2024-02-28', '2024-03-01')).toBe(2)
	})
	it('increments by exactly one across >= 800 consecutive days', () => {
		let key = '2026-01-01'
		for (let i = 0; i < 800; i++) {
			const next = addDays(key, 1)
			const before = dayIndexFromKey('2026-01-01', key)
			const after = dayIndexFromKey('2026-01-01', next)
			expect(after - before).toBe(1)
			key = next
		}
	})
})