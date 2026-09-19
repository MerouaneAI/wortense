import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react'
import {
	initialStats,
	updateStats,
	type DailyResult,
	type Stats,
} from '../lib/stats'
import { loadStats, saveStats } from '../lib/storage'

export interface StatsContextValue {
	stats: Stats
	recordDailyResult: (result: DailyResult) => void
	resetStats: () => void
}

const StatsContext = createContext<StatsContextValue | null>(null)

export function StatsProvider({ children }: { children: ReactNode }) {
	const [stats, setStats] = useState<Stats>(() => loadStats())

	// Persist whenever stats change (updateStats is idempotent per date).
	useEffect(() => {
		saveStats(stats)
	}, [stats])

	const recordDailyResult = useCallback((result: DailyResult) => {
		setStats((prev) => updateStats(prev, result))
	}, [])

	const resetStats = useCallback(() => {
		setStats(initialStats)
	}, [])

	const value = useMemo<StatsContextValue>(
		() => ({ stats, recordDailyResult, resetStats }),
		[stats, recordDailyResult, resetStats],
	)

	return (
		<StatsContext.Provider value={value}>{children}</StatsContext.Provider>
	)
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStats(): StatsContextValue {
	const ctx = useContext(StatsContext)
	if (!ctx) {
		throw new Error('useStats must be used within a StatsProvider')
	}
	return ctx
}