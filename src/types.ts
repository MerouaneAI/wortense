// Source-of-truth types for Wortense (spec §4.1). The app never relies on the
// array order of `words`; ranks are the single source of ordering truth.

export type Difficulty = 'easy' | 'medium' | 'hard'
export type PartOfSpeech = 'adjective' | 'verb' | 'noun' | 'adverb'
export type Feedback = 'correct' | 'close' | 'far'
export type Cefr = 'B1' | 'B2' | 'C1'
export type Mode = 'daily' | 'practice'

export interface WordEntry {
	/** lowercase a–z, 3–13 letters, unique in puzzle; also serves as the word id. */
	text: string
	/** 1 = mildest … N = most intense. */
	rank: number
	partOfSpeech: PartOfSpeech
	/** ≤ 20 words, simple learner English. */
	definition: string
	/** ≤ 18 words, contains `text` as a whole word (for highlighting). */
	example: string
	/** ≤ 22 words: why this word sits at this intensity vs its neighbours. */
	whyHere: string
}

export interface AxisLabels {
	low: string
	high: string
}

export interface Puzzle {
	/** e.g. "anger-01", globally unique. */
	id: string
	/** shown as the clue, e.g. "Anger". */
	theme: string
	axisLabels: AxisLabels
	difficulty: Difficulty
	cefr: Cefr
	practiceOnly?: boolean
	/** dev-only note for borderline ordering; NEVER rendered in the UI. */
	reviewNote?: string
	/** stored in ascending rank order; the app never relies on array order. */
	words: WordEntry[]
}