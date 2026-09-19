import type { ThemePreference } from '../lib/storage'
import { clearAllData } from '../lib/storage'
import { useSettings } from '../state/SettingsProvider'
import { Modal } from './Modal'

export interface SettingsModalProps {
	open: boolean
	onClose: () => void
}

const THEME_OPTIONS: ReadonlyArray<{ value: ThemePreference; label: string }> = [
	{ value: 'system', label: 'System' },
	{ value: 'light', label: 'Light' },
	{ value: 'dark', label: 'Dark' },
]

/** User preferences: theme, accessibility toggles and a data reset. */
export function SettingsModal({ open, onClose }: SettingsModalProps) {
	const { settings, updateSettings } = useSettings()

	function handleReset(): void {
		const confirmed = window.confirm(
			'Reset all Wortense data? This clears your stats, settings and progress, then reloads.',
		)
		if (!confirmed) return
		clearAllData()
		window.location.reload()
	}

	return (
		<Modal open={open} onClose={onClose} title="Settings">
			<div className="flex flex-col gap-5">
				<div>
					<p className="mb-2 text-sm font-semibold text-ink">Theme</p>
					<div
						role="radiogroup"
						aria-label="Theme"
						className="inline-flex rounded-full border border-line bg-bg p-1"
					>
						{THEME_OPTIONS.map((option) => {
							const active = settings.theme === option.value
							return (
								<button
									key={option.value}
									type="button"
									role="radio"
									aria-checked={active}
									onClick={() => updateSettings({ theme: option.value })}
									className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
										active ? 'bg-brand text-white' : 'text-muted hover:text-ink'
									}`}
								>
									{option.label}
								</button>
							)
						})}
					</div>
				</div>

				<div className="flex flex-col gap-1">
					<Toggle
						label="High contrast"
						description="Colour-blind-safe palette with clearer glyphs."
						checked={settings.highContrast}
						onChange={(v) => updateSettings({ highContrast: v })}
					/>
					<Toggle
						label="Move buttons"
						description="Show up/down arrows on each card."
						checked={settings.showMoveButtons}
						onChange={(v) => updateSettings({ showMoveButtons: v })}
					/>
					<Toggle
						label="Sound"
						description="Subtle tones on drag, reveal and win."
						checked={settings.sound}
						onChange={(v) => updateSettings({ sound: v })}
					/>
					<Toggle
						label="Haptics"
						description="Vibration feedback where supported."
						checked={settings.haptics}
						onChange={(v) => updateSettings({ haptics: v })}
					/>
					<Toggle
						label="Reduce motion"
						description="Replace animations with quick fades."
						checked={settings.reduceMotion}
						onChange={(v) => updateSettings({ reduceMotion: v })}
					/>
				</div>

				<button
					type="button"
					onClick={handleReset}
					className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-far transition-colors hover:bg-line/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
				>
					Reset all data
				</button>
			</div>
		</Modal>
	)
}

interface ToggleProps {
	label: string
	description: string
	checked: boolean
	onChange: (value: boolean) => void
}

function Toggle({ label, description, checked, onChange }: ToggleProps) {
	return (
		<div className="flex items-center justify-between gap-4 py-2">
			<span className="flex flex-col">
				<span className="text-sm font-medium text-ink">{label}</span>
				<span className="text-xs text-muted">{description}</span>
			</span>
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				aria-label={label}
				onClick={() => onChange(!checked)}
				className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
					checked ? 'bg-brand' : 'bg-line'
				}`}
			>
				<span
					aria-hidden="true"
					className={`absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
						checked ? 'translate-x-[22px]' : 'translate-x-0.5'
					}`}
				/>
			</button>
		</div>
	)
}