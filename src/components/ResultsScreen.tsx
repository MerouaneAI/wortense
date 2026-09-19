import { m } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { MAX_ATTEMPTS } from '../config'
import { useGame } from '../state/GameProvider'
import { useCountdown, type Countdown } from '../hooks/useCountdown'
import { WordReveal } from './WordReveal'
import { HistorySheet } from './HistorySheet'
import { StatsSummary } from './StatsSummary'
import { ShareButton } from './ShareButton'
import { Confetti } from './Confetti'

export interface ResultsScreenProps {
	celebrate: boolean
}

function pad2(n: number): string {
	return n < 10 ? `0${n}` : `${n}`
}

function formatCountdown(c: Countdown): string {
	return `${pad2(c.hours)}:${pad2(c.minutes)}:${pad2(c.seconds)}`
}

/** The end screen: outcome, answer ladder, history, stats, share and CTA. */
export function ResultsScreen({ celebrate }: ResultsScreenProps) {
	const { puzzle, mode, state, reducedMotion, newPractice } = useGame()
	const countdown = useCountdown()
	if (!puzzle) return null

	const won = state.status === 'won'
	const solution = [...puzzle.words].sort((a, b) => a.rank - b.rank)
	const showConfetti = celebrate && won && !reducedMotion
	const highlightBucket = mode === 'daily' && won ? state.attempts.length : null

	return (
		<m.div
			initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: reducedMotion ? 0.12 : 0.35 }}
			className="flex flex-1 flex-col gap-5"
		>
			{showConfetti ? <Confetti /> : null}

			<div className="text-center">
				<h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
					{won ? 'Solved!' : 'Out of tries'}
				</h2>
				<p className="mt-1 text-sm text-muted">
					{won
						? `You found the order in ${state.attempts.length}/${MAX_ATTEMPTS}.`
						: 'Here is the correct order — from mildest to most intense.'}
				</p>
			</div>

			<HistorySheet />

			<div className="flex flex-col gap-2">
				<p className="text-xs font-semibold uppercase tracking-wide text-muted">
					{puzzle.theme}: mildest → most intense
				</p>
				<ol className="flex list-none flex-col gap-2 p-0">
					{solution.map((entry, index) => (
						<WordReveal
							key={entry.text}
							entry={entry}
							position={index + 1}
							index={index}
							reducedMotion={reducedMotion}
						/>
					))}
				</ol>
			</div>

			<StatsSummary highlightBucket={highlightBucket} />

			<div className="mt-auto flex flex-col gap-3">
				<ShareButton />
				{mode === 'daily' ? (
					<p className="text-center text-sm text-muted">
						Next puzzle in{' '}
						<span className="font-semibold tabular-nums text-ink">
							{formatCountdown(countdown)}
						</span>
					</p>
				) : (
					<button
						type="button"
						onClick={newPractice}
						className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-surface py-3 text-base font-semibold text-ink transition-colors hover:bg-line/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
					>
						<RotateCcw size={18} aria-hidden="true" />
						New practice puzzle
					</button>
				)}
			</div>
		</m.div>
	)
}