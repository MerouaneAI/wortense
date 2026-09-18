// Daily stats & streaks (spec §1.6). Pure and DOM-free. updateStats is
// idempotent per date (guarded by lastCompletedDate) so it is StrictMode-safe.

import { addDays } from './dates'

export interface Distribution {
	1: number
	2: number
	3: number
	4: number
}

export interface Stats {
	played: number
	wins: number
	currentStreak: number
	maxStreak: number
	distribution: Distribution
	/** Date key of the most recent win, or null. */
	lastWinDate: string | null
	/** Date key of the most recently completed daily, or null (idempotency guard). */
	lastCompletedDate: string | null
}

export const initialStats: Stats = {
	played: 0,
	wins: 0,
	currentStreak: 0,
	maxStreak: 0,
	distribution: { 1: 0, 2: 0, 3: 0, 4: 0 },
	lastWinDate: null,
	lastCompletedDate: null,
}

export interface DailyResult {
	won: boolean
	/** Attempts used (1..4); only meaningful for the distribution on a win. */
	attempts: number
	/** Local date key (YYYY-MM-DD) the daily was completed on. */
	dateKey: string
}

/**
 * Apply a completed daily to the stats. Returns the SAME reference unchanged if
 * this date was already recorded (idempotent; safe under StrictMode double-run).
 */
export function updateStats(stats: Stats, result: DailyResult): Stats {
	const { won, attempts, dateKey } = result
	if (stats.lastCompletedDate === dateKey) return stats

	const next: Stats = {
		...stats,
		distribution: { ...stats.distribution },
		played: stats.played + 1,
		lastCompletedDate: dateKey,
	}

	if (won) {
		next.wins += 1
		if (attempts >= 1 && attempts <= 4) {
			const bucket = attempts as 1 | 2 | 3 | 4
			next.distribution[bucket] += 1
		}
		const yesterday = addDays(dateKey, -1)
		next.currentStreak =
			stats.lastWinDate === yesterday ? stats.currentStreak + 1 : 1
		next.maxStreak = Math.max(stats.maxStreak, next.currentStreak)
		next.lastWinDate = dateKey
	} else {
		next.currentStreak = 0
	}

	return next
}

/**
 * The streak to display today: 0 unless the last win was today or yesterday
 * (spec §1.6), otherwise the stored current streak.
 */
export function getDisplayStreak(stats: Stats, todayKey: string): number {
	if (stats.lastWinDate === null) return 0
	const yesterday = addDays(todayKey, -1)
	if (stats.lastWinDate === todayKey || stats.lastWinDate === yesterday) {
		return stats.currentStreak
	}
	return 0
}