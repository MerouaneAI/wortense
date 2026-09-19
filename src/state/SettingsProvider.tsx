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
	defaultSettings,
	loadSettings,
	saveSettings,
	type Settings,
} from '../lib/storage'

export interface SettingsContextValue {
	settings: Settings
	updateSettings: (partial: Partial<Settings>) => void
	resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

const LIGHT_THEME_COLOR = '#faf7f2'
const DARK_THEME_COLOR = '#16130f'

function systemPrefersDark(): boolean {
	if (typeof window === 'undefined' || !window.matchMedia) return false
	return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** Keep a single runtime-managed <meta name="theme-color"> in sync. */
function syncThemeColor(isDark: boolean): void {
	if (typeof document === 'undefined') return
	let meta = document.head.querySelector<HTMLMetaElement>(
		'meta[name="theme-color"][data-runtime="true"]',
	)
	if (!meta) {
		meta = document.createElement('meta')
		meta.setAttribute('name', 'theme-color')
		meta.setAttribute('data-runtime', 'true')
		document.head.appendChild(meta)
	}
	meta.setAttribute('content', isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR)
}

export function SettingsProvider({ children }: { children: ReactNode }) {
	const [settings, setSettings] = useState<Settings>(() => loadSettings())
	const [prefersDark, setPrefersDark] = useState<boolean>(() =>
		systemPrefersDark(),
	)

	// Track the OS colour-scheme preference (StrictMode-safe listener).
	useEffect(() => {
		if (typeof window === 'undefined' || !window.matchMedia) return
		const mq = window.matchMedia('(prefers-color-scheme: dark)')
		const onChange = (event: MediaQueryListEvent) => {
			setPrefersDark(event.matches)
		}
		setPrefersDark(mq.matches)
		mq.addEventListener('change', onChange)
		return () => {
			mq.removeEventListener('change', onChange)
		}
	}, [])

	// Apply the .dark and .hc classes and refresh the theme-color meta.
	useEffect(() => {
		const isDark =
			settings.theme === 'dark' ||
			(settings.theme === 'system' && prefersDark)
		const root = document.documentElement
		root.classList.toggle('dark', isDark)
		root.classList.toggle('hc', settings.highContrast)
		syncThemeColor(isDark)
	}, [settings.theme, settings.highContrast, prefersDark])

	// Persist whenever settings change.
	useEffect(() => {
		saveSettings(settings)
	}, [settings])

	const updateSettings = useCallback((partial: Partial<Settings>) => {
		setSettings((prev) => ({ ...prev, ...partial }))
	}, [])

	const resetSettings = useCallback(() => {
		setSettings(defaultSettings)
	}, [])

	const value = useMemo<SettingsContextValue>(
		() => ({ settings, updateSettings, resetSettings }),
		[settings, updateSettings, resetSettings],
	)

	return (
		<SettingsContext.Provider value={value}>
			{children}
		</SettingsContext.Provider>
	)
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
	const ctx = useContext(SettingsContext)
	if (!ctx) {
		throw new Error('useSettings must be used within a SettingsProvider')
	}
	return ctx
}