// Synthesized sound via the Web Audio API (spec §5.5). No audio files. Off by
// default. The AudioContext is created lazily on the first user gesture and
// every call is wrapped in try/catch so it can never throw.

export type SoundName =
	| 'pick'
	| 'drop'
	| 'flipCorrect'
	| 'flipClose'
	| 'flipFar'
	| 'lock'
	| 'win'
	| 'lose'
	| 'error'

type AudioContextConstructor = typeof AudioContext

interface AudioWindow extends Window {
	webkitAudioContext?: AudioContextConstructor
}

function getAudioContextCtor(): AudioContextConstructor | null {
	if (typeof window === 'undefined') return null
	const w = window as AudioWindow
	return window.AudioContext ?? w.webkitAudioContext ?? null
}

interface BeepOptions {
	freq: number
	duration: number
	type?: OscillatorType
	gain?: number
	delay?: number
	endFreq?: number
}

function beep(context: AudioContext, options: BeepOptions): void {
	try {
		const now = context.currentTime + (options.delay ?? 0)
		const osc = context.createOscillator()
		const gain = context.createGain()
		osc.type = options.type ?? 'sine'
		osc.frequency.setValueAtTime(options.freq, now)
		if (options.endFreq !== undefined) {
			osc.frequency.exponentialRampToValueAtTime(
				options.endFreq,
				now + options.duration,
			)
		}
		const peak = options.gain ?? 0.06
		gain.gain.setValueAtTime(0.0001, now)
		gain.gain.exponentialRampToValueAtTime(peak, now + 0.012)
		gain.gain.exponentialRampToValueAtTime(0.0001, now + options.duration)
		osc.connect(gain)
		gain.connect(context.destination)
		osc.start(now)
		osc.stop(now + options.duration + 0.03)
	} catch {
		/* ignore scheduling / audio errors */
	}
}

export interface AudioEngine {
	/** Call on the first user gesture to create/resume the context. */
	unlock(): void
	/** Play a sound if enabled. `index` raises the pitch for successive correct cards. */
	play(sound: SoundName, options?: { index?: number }): void
	setEnabled(enabled: boolean): void
}

export function createAudioEngine(initialEnabled = false): AudioEngine {
	let enabled = initialEnabled
	let context: AudioContext | null = null

	function ensureContext(): AudioContext | null {
		if (context) return context
		const Ctor = getAudioContextCtor()
		if (!Ctor) return null
		try {
			context = new Ctor()
		} catch {
			context = null
		}
		return context
	}

	function resumeIfNeeded(c: AudioContext): void {
		if (c.state === 'suspended') {
			void c.resume().catch(() => undefined)
		}
	}

	return {
		unlock(): void {
			const c = ensureContext()
			if (c) resumeIfNeeded(c)
		},
		setEnabled(next: boolean): void {
			enabled = next
		},
		play(sound: SoundName, options?: { index?: number }): void {
			if (!enabled) return
			const c = ensureContext()
			if (!c) return
			resumeIfNeeded(c)
			const index = options?.index ?? 0

			switch (sound) {
				case 'pick':
					beep(c, { freq: 320, duration: 0.08, type: 'triangle', gain: 0.05 })
					break
				case 'drop':
					beep(c, { freq: 200, duration: 0.1, type: 'triangle', gain: 0.05 })
					break
				case 'flipCorrect':
					beep(c, {
						freq: 440 + index * 70,
						duration: 0.16,
						type: 'sine',
						gain: 0.06,
					})
					break
				case 'flipClose':
					beep(c, { freq: 340, duration: 0.14, type: 'sine', gain: 0.05 })
					break
				case 'flipFar':
					beep(c, { freq: 190, duration: 0.16, type: 'sine', gain: 0.05 })
					break
				case 'lock':
					beep(c, { freq: 660, duration: 0.12, type: 'square', gain: 0.04 })
					break
				case 'win':
					beep(c, { freq: 523, duration: 0.16, gain: 0.06 })
					beep(c, { freq: 659, duration: 0.16, gain: 0.06, delay: 0.14 })
					beep(c, { freq: 784, duration: 0.28, gain: 0.06, delay: 0.28 })
					break
				case 'lose':
					beep(c, {
						freq: 330,
						duration: 0.2,
						type: 'sine',
						gain: 0.05,
						endFreq: 180,
					})
					break
				case 'error':
					beep(c, { freq: 160, duration: 0.18, type: 'sawtooth', gain: 0.045 })
					break
			}
		},
	}
}