import { Fragment, type ReactNode } from 'react'
import { m } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import type { WordEntry } from '../types'
import { useEffectsChannel } from '../state/EffectsProvider'

export interface WordRevealProps {
	entry: WordEntry
	position: number
	index: number
	reducedMotion: boolean
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
export function WordReveal({
	entry,
	position,
	index,
	reducedMotion,
}: WordRevealProps) {
	const { speakText, canSpeak } = useEffectsChannel()

	return (
		<m.li
			initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: reducedMotion ? 0.12 : 0.32,
				delay: reducedMotion ? 0 : index * 0.06,
			}}
			className="rounded-xl border border-line bg-surface p-3"
		>
			<div className="flex items-baseline gap-2">
				<span
					aria-hidden="true"
					className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white"
				>
					{position}
				</span>
				<span className="text-base font-semibold text-ink">{entry.text}</span>
				<span className="text-xs italic text-muted">{entry.partOfSpeech}</span>
				{canSpeak ? (
					<button
						type="button"
						onClick={() => speakText(`${entry.text}. ${entry.definition}`)}
						aria-label={`Hear ${entry.text}`}
						className="ml-auto rounded-full p-1 text-muted transition-colors hover:bg-line/50 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
					>
						<Volume2 size={16} aria-hidden="true" />
					</button>
				) : null}
			</div>
			<p className="mt-1.5 text-sm text-ink">{entry.definition}</p>
			<p className="mt-1 text-sm text-muted">
				“{highlight(entry.example, entry.text)}”
			</p>
			<p className="mt-1 text-xs text-muted">{entry.whyHere}</p>
		</m.li>
	)
}