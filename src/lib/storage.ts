// Namespaced localStorage wrapper (spec §5.7). Every access is try/catch'd with
// an in-memory fallback (Safari private mode, quota). Every parsed value passes
// a hand-written type guard; invalid data is discarded, never crashed on.

import { STORAGE_NAMESPACE } from '../config'
import { initialStats, type Distribution, type Stats } from './stats'

export type ThemePreference = 'system' | 'light' | 'dark'

export interface Settings {
	theme: ThemePreference
	highContrast: boolean
	sound: boolean
	haptics: boolean
	reduceMotion: boolean
	showMoveButtons: boolean
}

export const defaultSettings: Settings = {
	theme: 'system',
	highContrast: false,
	sound: false, // off by default (§5.5)
	haptics: true, // on by default (§5.5)
	reduceMotion: false,
	showMoveButtons: false, // off by default (§5.3)
}

export const STORAGE_KEYS = {
	settings: 'settings',
	stats: 'stats',
	daily: 'daily',
	practice: 'practice',
	onboarded: 'onboarded',
} as const

// --- Low-level storage with in-memory fallback -----------------------------

const memory = new Map<string, string>()
let cachedAvailable: boolean | null = null

function storageAvailable(): boolean {
	if (cachedAvailable !== null) return cachedAvailable
	try {
		const probe = `${STORAGE_NAMESPACE}:__probe__`
		localStorage.setItem(probe, '1')
		localStorage.removeItem(probe)
		cachedAvailable = true
	} catch {
		cachedAvailable = false
	}
	return cachedAvailable
}

function namespaced(key: string): string {
	return `${STORAGE_NAMESPACE}:${key}`
}

function rawGet(fullKey: string): string | null {
	if (storageAvailable()) {
		try {
			const value = localStorage.getItem(fullKey)
			if (value !== null) return value
		} catch {
			/* fall through to the in-memory store */
		}
	}
	return memory.get(fullKey) ?? null
}

function rawSet(fullKey: string, value: string): void {
	if (storageAvailable()) {
		try {
			localStorage.setItem(fullKey, value)
			return
		} catch {
			/* quota or private mode: fall through to the in-memory store */
		}
	}
	memory.set(fullKey, value)
}

function rawRemove(fullKey: string): void {
	if (storageAvailable()) {
		try {
			localStorage.removeItem(fullKey)
		} catch {
			/* ignore */
		}
	}
	memory.delete(fullKey)
}

// --- Generic JSON helpers ---------------------------------------------------

/** Read + parse + validate. Returns null on missing, corrupt, or wrong-shape data. */
export function readJSON<T>(
	key: string,
	guard: (value: unknown) => value is T,
): T | null {
	const raw = rawGet(namespaced(key))
	if (raw === null) return null
	let parsed: unknown
	try {
		parsed = JSON.parse(raw)
	} catch {
		return null
	}
	return guard(parsed) ? parsed : null
}

/** Serialize + write. Silently no-ops if the value cannot be stringified. */
export function writeJSON<T>(key: string, value: T): void {
	let serialized: string
	try {
		serialized = JSON.stringify(value)
	} catch {
		return
	}
	rawSet(namespaced(key), serialized)
}

export function removeKey(key: string): void {
	rawRemove(namespaced(key))
}

/** Remove every Wortense key (used by "reset all data" in Settings). */
export function clearAllData(): void {
	for (const key of Object.values(STORAGE_KEYS)) {
		rawRemove(namespaced(key))
	}
}

// --- Type guards ------------------------------------------------------------

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

function isThemePreference(value: unknown): value is ThemePreference {
	return value === 'system' || value === 'light' || value === 'dark'
}

function isSettings(value: unknown): value is Settings {
	if (!isObject(value)) return false
	return (
		isThemePreference(value.theme) &&
		typeof value.highContrast === 'boolean' &&
		typeof value.sound === 'boolean' &&
		typeof value.haptics === 'boolean' &&
		typeof value.reduceMotion === 'boolean' &&
		typeof value.showMoveButtons === 'boolean'
	)
}

function isDistribution(value: unknown): value is Distribution {
	if (!isObject(value)) return false
	return (['1', '2', '3', '4'] as const).every(
		(k) => typeof value[k] === 'number',
	)
}

function isStats(value: unknown): value is Stats {
	if (!isObject(value)) return false
	return (
		typeof value.played === 'number' &&
		typeof value.wins === 'number' &&
		typeof value.currentStreak === 'number' &&
		typeof value.maxStreak === 'number' &&
		isDistribution(value.distribution) &&
		(value.lastWinDate === null || typeof value.lastWinDate === 'string') &&
		(value.lastCompletedDate === null ||
			typeof value.lastCompletedDate === 'string')
	)
}

function isOnboarded(value: unknown): value is true {
	return value === true
}

// --- Typed accessors --------------------------------------------------------

export function loadSettings(): Settings {
	return readJSON(STORAGE_KEYS.settings, isSettings) ?? defaultSettings
}

export function saveSettings(settings: Settings): void {
	writeJSON(STORAGE_KEYS.settings, settings)
}

export function loadStats(): Stats {
	return readJSON(STORAGE_KEYS.stats, isStats) ?? initialStats
}

export function saveStats(stats: Stats): void {
	writeJSON(STORAGE_KEYS.stats, stats)
}

export function loadOnboarded(): boolean {
	return readJSON(STORAGE_KEYS.onboarded, isOnboarded) === true
}

export function saveOnboarded(): void {
	writeJSON(STORAGE_KEYS.onboarded, true)
}