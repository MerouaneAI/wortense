import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'
import { buildShareText } from '../lib/share'
import { useGame } from '../state/GameProvider'

function fallbackCopy(text: string): boolean {
	try {
		const textarea = document.createElement('textarea')
		textarea.value = text
		textarea.setAttribute('readonly', '')
		textarea.style.position = 'fixed'
		textarea.style.opacity = '0'
		document.body.appendChild(textarea)
		textarea.focus()
		textarea.select()
		const ok = document.execCommand('copy')
		document.body.removeChild(textarea)
		return ok
	} catch {
		return false
	}
}

/** Shares the spoiler-free grid: share sheet → clipboard → execCommand. */
export function ShareButton() {
	const { puzzle, mode, dailyNumber, state } = useGame()
	const [copied, setCopied] = useState(false)
	if (!puzzle) return null

	function buildText(): string {
		return buildShareText({
			mode,
			theme: puzzle!.theme,
			puzzleNumber: dailyNumber,
			attempts: state.attempts.map((attempt) => attempt.feedback),
			won: state.status === 'won',
		})
	}

	async function handleShare(): Promise<void> {
		const text = buildText()

		if (typeof navigator !== 'undefined' && navigator.share) {
			try {
				await navigator.share({ text })
				return
			} catch (error) {
				// The user dismissed the share sheet: not an error, do nothing.
				if (error instanceof DOMException && error.name === 'AbortError') {
					return
				}
				// Any other failure falls through to the clipboard path.
			}
		}

		let ok = false
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			try {
				await navigator.clipboard.writeText(text)
				ok = true
			} catch {
				ok = false
			}
		}
		if (!ok) ok = fallbackCopy(text)

		if (ok) {
			setCopied(true)
			window.setTimeout(() => setCopied(false), 2000)
		}
	}

	return (
		<button
			type="button"
			onClick={() => {
				void handleShare()
			}}
			className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3 text-base font-semibold text-white shadow-sm transition-colors hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
		>
			{copied ? (
				<>
					<Check size={18} aria-hidden="true" />
					Copied to clipboard
				</>
			) : (
				<>
					<Share2 size={18} aria-hidden="true" />
					Share
				</>
			)}
		</button>
	)
}