// Spoiler-free share grid (spec §1.7). Pure and DOM-free — the clipboard /
// navigator.share side effects live in the ShareButton component (Phase 10).

import type { Feedback, Mode } from '../types'
import { MAX_ATTEMPTS, SHARE_URL } from '../config'

const EMOJI: Record<Feedback, string> = {
	correct: '🟩',
	close: '🟨',
	far: '⬜',
}

export interface ShareInput {
	mode: Mode
	theme: string
	/** Daily number to show (#N); ignored in practice mode. */
	puzzleNumber: number
	/** One row of feedback per attempt, each column a slot top→bottom. */
	attempts: ReadonlyArray<readonly Feedback[]>
	won: boolean
	maxAttempts?: number
}

/**
 * Build the shareable text block:
 *   Wortense #12 · Anger · 3/4   (or "Wortense Practice · Anger · 3/4")
 *   <blank line>
 *   emoji grid, one line per attempt
 *   share url
 * A loss uses "X/<max>".
 */
export function buildShareText(input: ShareInput): string {
	const { mode, theme, puzzleNumber, attempts, won } = input
	const maxAttempts = input.maxAttempts ?? MAX_ATTEMPTS

	const score = won ? `${attempts.length}/${maxAttempts}` : `X/${maxAttempts}`
	const title =
		mode === 'practice'
			? `Wortense Practice · ${theme} · ${score}`
			: `Wortense #${puzzleNumber} · ${theme} · ${score}`

	const grid = attempts
		.map((row) => row.map((feedback) => EMOJI[feedback]).join(''))
		.join('\n')

	return `${title}\n\n${grid}\n${SHARE_URL}`
}