// Text-to-speech for the end-screen 🔊 buttons (spec §5.5). Feature-detected;
// prefers an English voice, handles async voice loading, and cancels any
// pending utterance before speaking. Never throws.

export function supportsSpeech(): boolean {
	return (
		typeof window !== 'undefined' &&
		'speechSynthesis' in window &&
		typeof window.SpeechSynthesisUtterance === 'function'
	)
}

let voicesPrimed = false

/**
 * Warm the voice list. Some browsers populate voices asynchronously, so we also
 * refresh on the 'voiceschanged' event. Safe to call multiple times.
 */
export function primeVoices(): void {
	if (!supportsSpeech() || voicesPrimed) return
	voicesPrimed = true
	try {
		const synth = window.speechSynthesis
		synth.getVoices()
		synth.addEventListener('voiceschanged', () => {
			synth.getVoices()
		})
	} catch {
		/* ignore */
	}
}

function pickEnglishVoice(): SpeechSynthesisVoice | null {
	try {
		const voices = window.speechSynthesis.getVoices()
		if (voices.length === 0) return null
		const enUS = voices.find((v) => v.lang === 'en-US')
		if (enUS) return enUS
		const anyEnglish = voices.find((v) => v.lang.toLowerCase().startsWith('en'))
		return anyEnglish ?? null
	} catch {
		return null
	}
}

export function speak(text: string): void {
	if (!supportsSpeech()) return
	try {
		const synth = window.speechSynthesis
		synth.cancel()
		const utterance = new SpeechSynthesisUtterance(text)
		utterance.lang = 'en-US'
		const voice = pickEnglishVoice()
		if (voice) utterance.voice = voice
		synth.speak(utterance)
	} catch {
		/* ignore — speech is best-effort */
	}
}