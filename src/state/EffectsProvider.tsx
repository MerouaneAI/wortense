import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	type ReactNode,
} from 'react'
import {
	createAudioEngine,
	type AudioEngine,
	type SoundName,
} from '../lib/audio'
import { vibrate, type HapticPattern } from '../lib/haptics'
import { primeVoices, speak, supportsSpeech } from '../lib/speech'
import { useSettings } from './SettingsProvider'

export interface EffectsContextValue {
	/** Play a synthesized sound (no-op unless the sound setting is on). */
	playSound: (sound: SoundName, options?: { index?: number }) => void
	/** Fire a haptic pattern (no-op unless the haptics setting is on / unsupported). */
	haptic: (pattern: HapticPattern) => void
	/** Speak a phrase aloud (best-effort; never throws). */
	speakText: (text: string) => void
	/** Whether speech synthesis is available in this browser. */
	canSpeak: boolean
}

const EffectsContext = createContext<EffectsContextValue | null>(null)

/**
 * Owns the single AudioEngine, unlocks it on the first user gesture, and gates
 * haptics/speech behind settings + feature detection. Sound is off by default,
 * and the AudioContext is only created lazily inside the engine, so nothing is
 * constructed until the user actually interacts.
 */
export function EffectsProvider({ children }: { children: ReactNode }) {
	const { settings } = useSettings()

	const engineRef = useRef<AudioEngine | null>(null)
	if (engineRef.current === null) {
		engineRef.current = createAudioEngine(settings.sound)
	}

	const hapticsEnabledRef = useRef(settings.haptics)

	// Keep the engine's enabled flag in step with the setting.
	useEffect(() => {
		engineRef.current?.setEnabled(settings.sound)
	}, [settings.sound])

	useEffect(() => {
		hapticsEnabledRef.current = settings.haptics
	}, [settings.haptics])

	// Unlock audio + prime speech voices on the first gesture (StrictMode-safe).
	useEffect(() => {
		const unlock = () => {
			engineRef.current?.unlock()
			primeVoices()
		}
		window.addEventListener('pointerdown', unlock, { once: true })
		window.addEventListener('keydown', unlock, { once: true })
		return () => {
			window.removeEventListener('pointerdown', unlock)
			window.removeEventListener('keydown', unlock)
		}
	}, [])

	const playSound = useCallback(
		(sound: SoundName, options?: { index?: number }) => {
			engineRef.current?.play(sound, options)
		},
		[],
	)

	const haptic = useCallback((pattern: HapticPattern) => {
		if (hapticsEnabledRef.current) vibrate(pattern)
	}, [])

	const speakText = useCallback((text: string) => {
		speak(text)
	}, [])

	const value = useMemo<EffectsContextValue>(
		() => ({ playSound, haptic, speakText, canSpeak: supportsSpeech() }),
		[playSound, haptic, speakText],
	)

	return (
		<EffectsContext.Provider value={value}>{children}</EffectsContext.Provider>
	)
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEffectsChannel(): EffectsContextValue {
	const ctx = useContext(EffectsContext)
	if (!ctx) {
		throw new Error('useEffectsChannel must be used within an EffectsProvider')
	}
	return ctx
}