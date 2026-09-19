import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
	open: boolean
	onClose: () => void
	title: string
	children: ReactNode
}

/**
 * Accessible dialog built on native <dialog> + showModal(): focus trap and Esc
 * come from the platform; scroll-lock, backdrop-click close and return-focus
 * are added here. Esc is intercepted (cancel event) so React state stays in sync.
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
	const dialogRef = useRef<HTMLDialogElement>(null)
	const previouslyFocused = useRef<HTMLElement | null>(null)
	const onCloseRef = useRef(onClose)
	const titleId = useId()

	useEffect(() => {
		onCloseRef.current = onClose
	}, [onClose])

	// Open/close the native dialog in step with the `open` prop.
	useEffect(() => {
		const dialog = dialogRef.current
		if (!dialog) return
		if (open && !dialog.open) {
			previouslyFocused.current =
				document.activeElement instanceof HTMLElement
					? document.activeElement
					: null
			dialog.showModal()
			document.body.style.overflow = 'hidden'
		} else if (!open && dialog.open) {
			dialog.close()
		}
	}, [open])

	// Wire cancel (Esc) and close (cleanup + return focus). Registered once.
	useEffect(() => {
		const dialog = dialogRef.current
		if (!dialog) return
		const handleCancel = (event: Event) => {
			event.preventDefault()
			onCloseRef.current()
		}
		const handleClose = () => {
			document.body.style.overflow = ''
			const prev = previouslyFocused.current
			if (prev && typeof prev.focus === 'function') prev.focus()
		}
		dialog.addEventListener('cancel', handleCancel)
		dialog.addEventListener('close', handleClose)
		return () => {
			dialog.removeEventListener('cancel', handleCancel)
			dialog.removeEventListener('close', handleClose)
		}
	}, [])

	// Restore scroll if the modal unmounts while open.
	useEffect(() => {
		return () => {
			document.body.style.overflow = ''
		}
	}, [])

	function handleClick(event: React.MouseEvent<HTMLDialogElement>) {
		if (event.target === dialogRef.current) onClose()
	}

	return (
		<dialog
			ref={dialogRef}
			aria-labelledby={titleId}
			onClick={handleClick}
			className="m-auto w-[92%] max-w-md rounded-2xl border border-line bg-surface p-0 text-ink shadow-xl backdrop:bg-black/40"
		>
			<div className="flex max-h-[85vh] flex-col">
				<div className="flex items-center justify-between border-b border-line px-5 py-4">
					<h2
						id={titleId}
						className="font-display text-xl font-semibold tracking-tight text-ink"
					>
						{title}
					</h2>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close"
						className="rounded-full p-1.5 text-muted transition-colors hover:bg-line/50 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
					>
						<X size={20} aria-hidden="true" />
					</button>
				</div>
				<div className="overflow-y-auto px-5 py-4">{children}</div>
			</div>
		</dialog>
	)
}