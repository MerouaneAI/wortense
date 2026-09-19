import { useCallback, useEffect, useRef, useState } from 'react'
import { loadOnboarded, saveOnboarded } from './lib/storage'
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
import { ResultsScreen } from './components/ResultsScreen'
import { HowToPlayModal } from './components/HowToPlayModal'
import { StatsModal } from './components/StatsModal'
import { SettingsModal } from './components/SettingsModal'

/** The playable screen plus the end screen and all modals. */
function GameScreen() {
	const { puzzle, state } = useGame()

	const [howToOpen, setHowToOpen] = useState<boolean>(() => !loadOnboarded())
	const [statsOpen, setStatsOpen] = useState(false)
	const [settingsOpen, setSettingsOpen] = useState(false)

	// Celebrate only on a live playing -> won transition, never on reload.
	const [celebrate, setCelebrate] = useState(false)
	const prevStatus = useRef(state.status)
	useEffect(() => {
		if (prevStatus.current === 'playing' && state.status === 'won') {
			setCelebrate(true)
		} else if (
			state.status === 'playing' &&
			prevStatus.current !== 'playing'
		) {
			setCelebrate(false)
		}
		prevStatus.current = state.status
	}, [state.status])

	const handleHowToClose = useCallback(() => {
		setHowToOpen(false)
		saveOnboarded()
	}, [])

	const playing = state.status === 'playing'

	return (
		<main className="mx-auto flex min-h-[100svh] w-full max-w-[480px] flex-col gap-4 px-4 pb-6 pt-2">
			<Header
				onHowToPlay={() => setHowToOpen(true)}
				onStats={() => setStatsOpen(true)}
				onSettings={() => setSettingsOpen(true)}
			/>
			<div className="flex justify-center">
				<ModeSwitch />
			</div>

			{puzzle ? (
				<div className="flex flex-1 flex-col gap-4">
					<PuzzleHeader />
					{playing ? (
						<>
							<Ladder />
							<div className="mt-auto flex flex-col gap-3">
								<AttemptBar />
								<SubmitButton />
							</div>
						</>
					) : (
						<ResultsScreen celebrate={celebrate} />
					)}
				</div>
			) : (
				<div className="flex flex-1 items-center justify-center text-center text-muted">
					No puzzles are available yet. Please check back soon.
				</div>
			)}

			<Toast />

			<HowToPlayModal open={howToOpen} onClose={handleHowToClose} />
			<StatsModal open={statsOpen} onClose={() => setStatsOpen(false)} />
			<SettingsModal
				open={settingsOpen}
				onClose={() => setSettingsOpen(false)}
			/>
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