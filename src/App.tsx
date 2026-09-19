import { SettingsProvider } from './state/SettingsProvider'
import { StatsProvider } from './state/StatsProvider'
import { GameProvider, useGame } from './state/GameProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Header } from './components/Header'
import { ModeSwitch } from './components/ModeSwitch'
import { PuzzleHeader } from './components/PuzzleHeader'
import { Ladder } from './components/Ladder'
import { AttemptBar } from './components/AttemptBar'
import { SubmitButton } from './components/SubmitButton'
import { Toast } from './components/Toast'

/** The playable screen. Modals and the end screen arrive in Phase 10. */
function GameScreen() {
	const { puzzle } = useGame()

	return (
		<main className="mx-auto flex min-h-[100svh] w-full max-w-[480px] flex-col gap-4 px-4 pb-6 pt-2">
			<Header />
			<div className="flex justify-center">
				<ModeSwitch />
			</div>

			{puzzle ? (
				<div className="flex flex-1 flex-col gap-4">
					<PuzzleHeader />
					<Ladder />
					<div className="mt-auto flex flex-col gap-3">
						<AttemptBar />
						<SubmitButton />
					</div>
				</div>
			) : (
				<div className="flex flex-1 items-center justify-center text-center text-muted">
					No puzzles are available yet. Please check back soon.
				</div>
			)}

			<Toast />
		</main>
	)
}

export default function App() {
	return (
		<ErrorBoundary>
			<SettingsProvider>
				<StatsProvider>
					<GameProvider>
						<GameScreen />
					</GameProvider>
				</StatsProvider>
			</SettingsProvider>
		</ErrorBoundary>
	)
}