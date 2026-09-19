interface WordmarkProps {
	className?: string
}

/** The Wortense wordmark: four stacked bars (cool→hot) plus the name. */
export function Wordmark({ className }: WordmarkProps) {
	return (
		<span
			className={`inline-flex items-center gap-2 ${className ?? ''}`}
			aria-label="Wortense"
		>
			<svg
				viewBox="0 0 64 64"
				width="26"
				height="26"
				role="img"
				aria-hidden="true"
				className="shrink-0"
			>
				<rect width="64" height="64" rx="14" className="fill-ink" />
				<rect x="14" y="15" width="16" height="7" rx="3.5" className="fill-correct" />
				<rect x="14" y="26" width="23" height="7" rx="3.5" className="fill-brand" />
				<rect x="14" y="37" width="30" height="7" rx="3.5" className="fill-close" />
				<rect x="14" y="48" width="36" height="7" rx="3.5" className="fill-far" />
			</svg>
			<span className="font-display text-xl font-semibold tracking-tight text-ink">
				Wortense
			</span>
		</span>
	)
}