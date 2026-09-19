import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
	children: ReactNode
}

interface ErrorBoundaryState {
	hasError: boolean
}

/** Catches render errors so the whole app never shows a blank screen. */
export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	state: ErrorBoundaryState = { hasError: false }

	static getDerivedStateFromError(): ErrorBoundaryState {
		return { hasError: true }
	}

	componentDidCatch(error: Error, info: ErrorInfo): void {
		// The single deliberate console.error allowed by the quality bar (§8.8).
		console.error('Wortense crashed:', error, info.componentStack)
	}

	handleReload = (): void => {
		if (typeof window !== 'undefined') window.location.reload()
	}

	render(): ReactNode {
		if (this.state.hasError) {
			return (
				<main className="mx-auto flex min-h-[100svh] max-w-[480px] flex-col items-center justify-center gap-4 px-5 text-center">
					<h1 className="font-display text-3xl font-semibold text-ink">
						Something went wrong
					</h1>
					<p className="text-muted">
						Wortense hit an unexpected error. Reloading usually fixes it.
					</p>
					<button
						type="button"
						onClick={this.handleReload}
						className="rounded-2xl bg-brand px-5 py-2.5 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
					>
						Reload
					</button>
				</main>
			)
		}
		return this.props.children
	}
}