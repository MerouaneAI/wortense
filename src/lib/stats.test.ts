import { describe, it, expect } from 'vitest'
import { updateStats, getDisplayStreak, initialStats } from './stats'

describe('updateStats', () => {
	it('records a win and starts a streak', () => {
		const s = updateStats(initialStats, {
			won: true,
			attempts: 3,
			dateKey: '2026-10-01',
		})
		expect(s.played).toBe(1)
		expect(s.wins).toBe(1)
		expect(s.currentStreak).toBe(1)
		expect(s.maxStreak).toBe(1)
		expect(s.distribution[3]).toBe(1)
		expect(s.lastWinDate).toBe('2026-10-01')
		expect(s.lastCompletedDate).toBe('2026-10-01')
	})

	it('extends the streak on consecutive-day wins', () => {
		let s = updateStats(initialStats, {
			won: true,
			attempts: 2,
			dateKey: '2026-10-01',
		})
		s = updateStats(s, { won: true, attempts: 1, dateKey: '2026-10-02' })
		expect(s.currentStreak).toBe(2)
		expect(s.maxStreak).toBe(2)
	})

	it('resets the streak after a missed day but keeps maxStreak', () => {
		let s = updateStats(initialStats, {
			won: true,
			attempts: 2,
			dateKey: '2026-10-01',
		})
		s = updateStats(s, { won: true, attempts: 1, dateKey: '2026-10-02' })
		s = updateStats(s, { won: true, attempts: 1, dateKey: '2026-10-04' })
		expect(s.currentStreak).toBe(1)
		expect(s.maxStreak).toBe(2)
	})

	it('a loss counts as played and zeroes the streak', () => {
		let s = updateStats(initialStats, {
			won: true,
			attempts: 2,
			dateKey: '2026-10-01',
		})
		s = updateStats(s, { won: false, attempts: 4, dateKey: '2026-10-02' })
		expect(s.played).toBe(2)
		expect(s.wins).toBe(1)
		expect(s.currentStreak).toBe(0)
	})

	it('is idempotent per date (StrictMode-safe)', () => {
		const first = updateStats(initialStats, {
			won: true,
			attempts: 2,
			dateKey: '2026-10-01',
		})
		const second = updateStats(first, {
			won: true,
			attempts: 2,
			dateKey: '2026-10-01',
		})
		expect(second).toBe(first)
	})
})

describe('getDisplayStreak', () => {
	it('shows the streak when the last win was today or yesterday', () => {
		const s = { ...initialStats, currentStreak: 5, lastWinDate: '2026-10-10' }
		expect(getDisplayStreak(s, '2026-10-10')).toBe(5)
		expect(getDisplayStreak(s, '2026-10-11')).toBe(5)
	})

	it('shows zero when the last win is older than yesterday', () => {
		const s = { ...initialStats, currentStreak: 5, lastWinDate: '2026-10-10' }
		expect(getDisplayStreak(s, '2026-10-12')).toBe(0)
	})

	it('shows zero when there is no recorded win', () => {
		expect(getDisplayStreak(initialStats, '2026-10-10')).toBe(0)
	})
})