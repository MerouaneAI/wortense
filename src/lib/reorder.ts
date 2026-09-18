// Pure reordering that respects locked rows (spec §1.3, §5.3). Both functions
// operate on the compacted unlocked subsequence and write the result back into
// the unlocked slot indices, so locked rows never move and are jumped over.

/** Immutable array move (self-contained; no dnd-kit dependency in pure lib). */
function arrayMove<T>(items: readonly T[], from: number, to: number): T[] {
	const result = items.slice()
	const [moved] = result.splice(from, 1)
	result.splice(to, 0, moved)
	return result
}

/**
 * Move `activeId` to the position of `overId` within the unlocked subsequence.
 * Returns a new arrangement (a copy unchanged if the move is a no-op).
 */
export function moveUnlocked(
	arrangement: readonly string[],
	lockedIds: readonly string[],
	activeId: string,
	overId: string,
): string[] {
	const locked = new Set(lockedIds)
	const unlockedIds: string[] = []
	const unlockedSlots: number[] = []
	arrangement.forEach((id, slot) => {
		if (!locked.has(id)) {
			unlockedIds.push(id)
			unlockedSlots.push(slot)
		}
	})

	const from = unlockedIds.indexOf(activeId)
	const to = unlockedIds.indexOf(overId)
	if (from === -1 || to === -1 || from === to) return arrangement.slice()

	const reordered = arrayMove(unlockedIds, from, to)
	const result = arrangement.slice()
	unlockedSlots.forEach((slot, i) => {
		result[slot] = reordered[i]
	})
	return result
}

/**
 * Move `id` by one step within the unlocked subsequence (delta +1 = down,
 * -1 = up). Boundaries and unknown ids yield an unchanged copy.
 */
export function moveUnlockedBy(
	arrangement: readonly string[],
	lockedIds: readonly string[],
	id: string,
	delta: 1 | -1,
): string[] {
	const locked = new Set(lockedIds)
	const unlockedIds: string[] = []
	const unlockedSlots: number[] = []
	arrangement.forEach((wid, slot) => {
		if (!locked.has(wid)) {
			unlockedIds.push(wid)
			unlockedSlots.push(slot)
		}
	})

	const from = unlockedIds.indexOf(id)
	if (from === -1) return arrangement.slice()
	const to = from + delta
	if (to < 0 || to >= unlockedIds.length) return arrangement.slice()

	const reordered = arrayMove(unlockedIds, from, to)
	const result = arrangement.slice()
	unlockedSlots.forEach((slot, i) => {
		result[slot] = reordered[i]
	})
	return result
}