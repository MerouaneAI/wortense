import { BarChart3, HelpCircle, Settings } from 'lucide-react'
import { Wordmark } from './Wordmark'

export interface HeaderProps {
	onHowToPlay?: () => void
	onStats?: () => void
	onSettings?: () => void
}

/**
 * Top bar: the wordmark and optional actions. Buttons render only when their
 * handler is supplied, so Phase 9 (no modals yet) shows just the wordmark and
 * Phase 10 lights up the actions by passing handlers.
 */
export function Header({ onHowToPlay, onStats, onSettings }: HeaderProps) {
	return (
		<header className="flex w-full items-center justify-between py-2">
			<Wordmark />
			<div className="flex items-center gap-1">
				{onHowToPlay ? (
					<IconButton label="How to play" onClick={onHowToPlay}>
						<HelpCircle size={20} aria-hidden="true" />
					</IconButton>
				) : null}
				{onStats ? (
					<IconButton label="Statistics" onClick={onStats}>
						<BarChart3 size={20} aria-hidden="true" />
					</IconButton>
				) : null}
				{onSettings ? (
					<IconButton label="Settings" onClick={onSettings}>
						<Settings size={20} aria-hidden="true" />
					</IconButton>
				) : null}
			</div>
		</header>
	)
}

interface IconButtonProps {
	label: string
	onClick: () => void
	children: React.ReactNode
}

function IconButton({ label, onClick, children }: IconButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			title={label}
			className="rounded-full p-2 text-muted transition-colors hover:bg-line/50 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
		>
			{children}
		</button>
	)
}