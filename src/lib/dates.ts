// Local-date helpers (spec §1.5, §1.6). Date keys are "YYYY-MM-DD" strings.
// All arithmetic uses integer year/month/day triples through Date.UTC(...),
// so results are DST-proof by construction.

function pad2(n: number): string {
	return n < 10 ? `0${n}` : `${n}`
}

interface DateTriple {
	y: number
	m: number
	d: number
}

function parseKey(key: string): DateTriple {
	const parts = key.split('-')
	return {
		y: Number(parts[0]),
		m: Number(parts[1]),
		d: Number(parts[2]),
	}
}

/** Local calendar day of `date` as "YYYY-MM-DD" (uses local getters). */
export function getLocalDateKey(date: Date = new Date()): string {
	const y = date.getFullYear()
	const m = date.getMonth() + 1
	const d = date.getDate()
	return `${y}-${pad2(m)}-${pad2(d)}`
}

/**
 * Whole days from `fromKey` to `toKey`, clamped to >= 0 (spec §1.5).
 * dayIndexFromKey(LAUNCH_DATE, todayKey) === today's daily index.
 */
export function dayIndexFromKey(fromKey: string, toKey: string): number {
	const from = parseKey(fromKey)
	const to = parseKey(toKey)
	const fromMs = Date.UTC(from.y, from.m - 1, from.d)
	const toMs = Date.UTC(to.y, to.m - 1, to.d)
	const diff = Math.floor((toMs - fromMs) / 86_400_000)
	return diff < 0 ? 0 : diff
}

/** Add `n` days (may be negative) to a date key, returning a new date key. */
export function addDays(dateKey: string, n: number): string {
	const { y, m, d } = parseKey(dateKey)
	const ms = Date.UTC(y, m - 1, d) + n * 86_400_000
	const dt = new Date(ms)
	return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(
		dt.getUTCDate(),
	)}`
}