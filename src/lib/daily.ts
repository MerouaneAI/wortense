// Daily-puzzle selection (spec §1.5). Pure and DOM-free: given the daily
// rotation and a day index, pick the puzzle and compute its display number.

import type { Puzzle } from '../types'
import { LAUNCH_DATE } from '../config'
import { dayIndexFromKey, getLocalDateKey } from './dates'

/**
 * Whole days from LAUNCH_DATE to `todayKey`, clamped to >= 0 (via dates.ts).
 * This is the canonical daily index; `dailyRotation[dayIndex % length]` is today.
 */
export function getDayIndex(
	todayKey: string = getLocalDateKey(),
	launchDate: string = LAUNCH_DATE,
): number {
	return dayIndexFromKey(launchDate, todayKey)
}

/** The number shown to the player, e.g. "#12" for dayIndex 11 (spec §1.5). */
export function getDailyNumber(dayIndex: number): number {
	return dayIndex + 1
}

/**
 * Select the daily puzzle for `dayIndex`, wrapping around the rotation.
 * Returns null only when the rotation is empty (app still runs if no batches
 * are present — spec §3).
 */
export function selectDailyPuzzle(
	rotation: readonly Puzzle[],
	dayIndex: number,
): Puzzle | null {
	const n = rotation.length
	if (n === 0) return null
	const index = ((dayIndex % n) + n) % n
	return rotation[index]
}