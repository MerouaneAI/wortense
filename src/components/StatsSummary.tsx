import { getDisplayStreak } from '../lib/stats'
import { getLocalDateKey } from '../lib/dates'
import { useStats } from '../state/StatsProvider'

export interface StatsSummaryProps {
	/** The distribution bucket (1..4) to highlight, or null for none. */
	highlightBucket: number | null
}

const BUCKETS = [1, 2, 3, 4] as const

/** Headline stats plus a guess-distribution histogram. */
export function StatsSummary({ highlightBucket }: StatsSummaryProps) {
	const { stats } = useStats()
	const winPct =
		stats.played === 0 ? 0 : Math.round((stats.wins / stats.played) * 100)
	const streak = getDisplayStreak(stats, getLocalDateKey())
	const maxCount = Math.max(1, ...BUCKETS.map((b) => stats.distribution[b]))

	return (
		<div className="flex flex-col gap-3">
			<dl className="grid grid-cols-4 gap-2 text-center">
				<Stat label="Played" value={stats.played} />
				<Stat label="Win %" value={winPct} />
				<Stat label="Streak" value={streak} />
				<Stat label="Max" value={stats.maxStreak} />
			</dl>

			<div>
				<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
					Guess distribution
				</p>
				<div className="flex flex-col gap-1">
					{BUCKETS.map((bucket) => {
						const count = stats.distribution[bucket]
						const pct = Math.round((count / maxCount) * 100)
						const active = bucket === highlightBucket
						return (
							<div key={bucket} className="flex items-center gap-2">
								<span className="w-3 text-xs font-semibold text-muted">
									{bucket}
								</span>
								<div className="h-5 flex-1 overflow-hidden rounded bg-line/50">
									<div
										className={`flex h-full items-center justify-end rounded px-2 text-xs font-bold text-white ${
											active ? 'bg-brand' : 'bg-muted'
										}`}
										style={{ width: `${Math.max(pct, count > 0 ? 12 : 0)}%` }}
									>
										{count > 0 ? count : null}
									</div>
								</div>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}

function Stat({ label, value }: { label: string; value: number }) {
	return (
		<div className="flex flex-col">
			<dd className="text-2xl font-bold text-ink">{value}</dd>
			<dt className="text-xs text-muted">{label}</dt>
		</div>
	)
}