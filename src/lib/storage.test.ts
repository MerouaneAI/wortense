import { describe, it, expect, beforeEach } from 'vitest'
import {
	loadSettings,
	saveSettings,
	defaultSettings,
	loadStats,
	saveStats,
	loadOnboarded,
	saveOnboarded,
	clearAllData,
	readJSON,
	writeJSON,
} from './storage'
import { initialStats, updateStats } from './stats'

beforeEach(() => {
	localStorage.clear()
	clearAllData()
})

describe('defaults', () => {
	it('returns defaults when nothing is stored', () => {
		expect(loadSettings()).toEqual(defaultSettings)
		expect(loadStats()).toEqual(initialStats)
		expect(loadOnboarded()).toBe(false)
	})
})

describe('round trips', () => {
	it('round-trips settings', () => {
		const custom = { ...defaultSettings, theme: 'dark' as const, sound: true }
		saveSettings(custom)
		expect(loadSettings()).toEqual(custom)
	})

	it('round-trips stats', () => {
		const s = updateStats(initialStats, {
			won: true,
			attempts: 2,
			dateKey: '2026-10-01',
		})
		saveStats(s)
		expect(loadStats()).toEqual(s)
	})

	it('records onboarding', () => {
		saveOnboarded()
		expect(loadOnboarded()).toBe(true)
	})
})

describe('validators', () => {
	it('discards corrupt JSON without throwing', () => {
		localStorage.setItem('wortense:v1:stats', '{ not valid json')
		expect(() => loadStats()).not.toThrow()
		expect(loadStats()).toEqual(initialStats)
	})

	it('discards wrong-shape settings', () => {
		localStorage.setItem('wortense:v1:settings', JSON.stringify({ theme: 'neon' }))
		expect(loadSettings()).toEqual(defaultSettings)
	})

	it('discards wrong-shape stats', () => {
		localStorage.setItem(
			'wortense:v1:stats',
			JSON.stringify({ played: 'lots', wins: 1 }),
		)
		expect(loadStats()).toEqual(initialStats)
	})
})

describe('clearAllData', () => {
	it('removes every stored key', () => {
		saveSettings({ ...defaultSettings, sound: true })
		saveOnboarded()
		clearAllData()
		expect(loadSettings()).toEqual(defaultSettings)
		expect(loadOnboarded()).toBe(false)
	})
})

describe('generic JSON helpers', () => {
	it('validates parsed data with the supplied guard', () => {
		writeJSON('daily', { hello: 'world' })
		const guard = (v: unknown): v is { hello: string } =>
			typeof v === 'object' &&
			v !== null &&
			typeof (v as { hello?: unknown }).hello === 'string'
		expect(readJSON('daily', guard)).toEqual({ hello: 'world' })

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const rejectAll = (_v: unknown): _v is never => false
		expect(readJSON('daily', rejectAll)).toBeNull()
	})
})