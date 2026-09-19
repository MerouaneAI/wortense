import { Fragment, type ReactNode } from 'react'
import type { WordEntry } from '../types'

export interface WordRevealProps {
	entry: WordEntry
	position: number
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Render `sentence` with whole-word occurrences of `word` visually marked. */
function highlight(sentence: string, word: string): ReactNode {
	const regex = new RegExp(`\\b(${escapeRegExp(word)})\\b`, 'gi')
	const parts = sentence.split(regex)
	return parts.map((part, index) => {
		if (part.toLowerCase() === word.toLowerCase()) {
			return (
				<mark
					key={index}
					className="rounded bg-brand/15 px-0.5 font-semibold text-brand"
				>
					{part}
				</mark>
			)
		}
		return <Fragment key={index}>{part}</Fragment>
	})
}

/** One entry in the answer ladder: rank, word, definition, example, why-here. */
export function WordReveal({ entry, position }: WordRevealProps) {
	return (
		<li className="rounded-xl border border-line bg-surface p-3">
			<div className="flex items-baseline gap-2">
				<span
					aria-hidden="true"
					className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white"
				>
					{position}
				</span>
				<span className="text-base font-semibold text-ink">{entry.text}</span>
				<span className="text-xs italic text-muted">{entry.partOfSpeech}</span>
			</div>
			<p className="mt-1.5 text-sm text-ink">{entry.definition}</p>
			<p className="mt-1 text-sm text-muted">
				“{highlight(entry.example, entry.text)}”
			</p>
			<p className="mt-1 text-xs text-muted">{entry.whyHere}</p>
		</li>
	)
}