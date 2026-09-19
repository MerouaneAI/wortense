import { describe, it, expect } from 'vitest'
import {
	attemptsRemaining,
	createInitialGameState,
	emptyGameState,
	feedbackForSlot,
	gameReducer,
	isLocked,
	unlockedCount,
	type GameState,
} from './gameReducer'
import type { Puzzle } from '../types'

function makePuzzle(id: string, texts: string[]): Puzzle {
	return {
		id,
		theme: 'Test',
		axisLabels: { low: 'Least', high: 'Most' },
		difficulty: texts.length === 5 ? 'hard' : 'easy',
		cefr: 'B1',
		words: texts.map((text, i) => ({
			text,
			rank: i + 1,
			partOfSpeech: 'adjective' as const,
			definition: 'A test word.',
			example: `We use ${text} here.`,
			whyHere: 'Test ordering note.',
		})),
	}
}

const PUZZLE = makePuzzle('p', ['a', 'b', 'c', 'd'])

function withArrangement(state: GameState, arrangement: string[]): GameState {
	return { ...state, arrangement }
}

/** Submit as if the reveal from any previous attempt has already finished. */
function submitOrder(state: GameState, arrangement: string[]): GameState {
	const ready = { ...withArrangement(state, arrangement), isRevealing: false }
	return gameReducer(ready, { type: 'submit' })
}

describe('createInitialGameState', () => {
	it('produces a seeded derangement with no fixed points', () => {
		const s = createInitialGameState(PUZZLE, 'daily')
		expect([...s.arrangement].sort()).toEqual(['a', 'b', 'c', 'd'])
		s.arrangement.forEach((id, i) => {
			expect(id).not.toBe(s.solution[i])
		})
	})

	it('is deterministic per puzzle id', () => {
		const a = createInitialGameState(PUZZLE, 'daily')
		const b = createInitialGameState(PUZZLE, 'practice')
		expect(a.arrangement).toEqual(b.arrangement)
	})

	it('starts playing with no locks and four attempts remaining', () => {
		const s = createInitialGameState(PUZZLE, 'daily')
		expect(s.status).toBe('playing')
		expect(s.lockedIds).toEqual([])
		expect(s.attempts).toEqual([])
		expect(attemptsRemaining(s)).toBe(4)
		expect(s.duplicateNonce).toBe(0)
	})
})

describe('submit', () => {
	it('wins and locks every word when the order is correct', () => {
		const s = submitOrder(createInitialGameState(PUZZLE, 'daily'), [
			'a',
			'b',
			'c',
			'd',
		])
		expect(s.status).toBe('won')
		expect(s.lockedIds).toEqual(['a', 'b', 'c', 'd'])
		expect(s.isRevealing).toBe(true)
		expect(s.attempts).toHaveLength(1)
		expect(unlockedCount(s)).toBe(0)
	})

	it('locks only correct words and remembers per-slot feedback', () => {
		// a,b correct; d in slot 2 (close), c in slot 3 (close).
		const s = submitOrder(createInitialGameState(PUZZLE, 'daily'), [
			'a',
			'b',
			'd',
			'c',
		])
		expect(s.status).toBe('playing')
		expect(s.lockedIds).toEqual(['a', 'b'])
		expect(feedbackForSlot(s, 0)).toBe('correct')
		expect(feedbackForSlot(s, 1)).toBe('correct')
		expect(feedbackForSlot(s, 2)).toBe('close')
		expect(feedbackForSlot(s, 3)).toBe('close')
		expect(attemptsRemaining(s)).toBe(3)
		expect(unlockedCount(s)).toBe(2)
	})

	it('reverts a tint once the word leaves its evaluated slot', () => {
		let s = submitOrder(createInitialGameState(PUZZLE, 'daily'), [
			'a',
			'b',
			'd',
			'c',
		])
		s = { ...s, isRevealing: false }
		const moved = gameReducer(s, { type: 'moveBy', id: 'd', delta: 1 })
		expect(moved.arrangement).toEqual(['a', 'b', 'c', 'd'])
		expect(feedbackForSlot(moved, 3)).toBeNull()
		expect(feedbackForSlot(moved, 2)).toBeNull()
	})

	it('does not consume an attempt for a repeated order', () => {
		let s = submitOrder(createInitialGameState(PUZZLE, 'daily'), [
			'b',
			'a',
			'd',
			'c',
		])
		const attemptsBefore = s.attempts.length
		const nonceBefore = s.duplicateNonce
		s = { ...s, isRevealing: false }
		const dup = gameReducer(s, { type: 'submit' })
		expect(dup.attempts).toHaveLength(attemptsBefore)
		expect(dup.duplicateNonce).toBe(nonceBefore + 1)
		expect(dup.status).toBe('playing')
	})

	it('loses after four non-winning attempts', () => {
		let s = createInitialGameState(PUZZLE, 'daily')
		const tries = [
			['b', 'a', 'd', 'c'],
			['b', 'c', 'd', 'a'],
			['c', 'd', 'a', 'b'],
			['d', 'c', 'b', 'a'],
		]
		for (const t of tries) {
			s = submitOrder(s, t)
		}
		expect(s.status).toBe('lost')
		expect(s.attempts).toHaveLength(4)
		expect(attemptsRemaining(s)).toBe(0)
	})

	it('is ignored while dragging or revealing', () => {
		const base = withArrangement(createInitialGameState(PUZZLE, 'daily'), [
			'a',
			'b',
			'c',
			'd',
		])
		const dragging = { ...base, isDragging: true }
		expect(gameReducer(dragging, { type: 'submit' })).toBe(dragging)
		const revealing = { ...base, isRevealing: true }
		expect(gameReducer(revealing, { type: 'submit' })).toBe(revealing)
	})
})

describe('movement', () => {
	it('jumps an unlocked card over a locked row', () => {
		const s: GameState = {
			...createInitialGameState(PUZZLE, 'daily'),
			arrangement: ['a', 'b', 'c', 'd'],
			lockedIds: ['b'],
		}
		const moved = gameReducer(s, { type: 'moveBy', id: 'a', delta: 1 })
		expect(moved.arrangement).toEqual(['c', 'b', 'a', 'd'])
		expect(isLocked(moved, 'b')).toBe(true)
	})

	it('reorders freely via moveOver when nothing is locked', () => {
		const s = withArrangement(createInitialGameState(PUZZLE, 'daily'), [
			'a',
			'b',
			'c',
			'd',
		])
		const moved = gameReducer(s, {
			type: 'moveOver',
			activeId: 'a',
			overId: 'c',
		})
		expect(moved.arrangement).toEqual(['b', 'c', 'a', 'd'])
	})

	it('is ignored once the game is over', () => {
		const won: GameState = {
			...withArrangement(createInitialGameState(PUZZLE, 'daily'), [
				'a',
				'b',
				'c',
				'd',
			]),
			status: 'won',
		}
		expect(gameReducer(won, { type: 'moveBy', id: 'a', delta: 1 })).toBe(won)
	})
})

describe('flags and hydration', () => {
	it('toggles drag/reveal flags and returns the same reference on no-op', () => {
		const base = createInitialGameState(PUZZLE, 'daily')
		expect(gameReducer(base, { type: 'setDragging', dragging: true }).isDragging).toBe(
			true,
		)
		expect(gameReducer(base, { type: 'setDragging', dragging: false })).toBe(base)
		expect(gameReducer(base, { type: 'setRevealing', revealing: true }).isRevealing).toBe(
			true,
		)
		expect(gameReducer(base, { type: 'setRevealing', revealing: false })).toBe(base)
	})

	it('hydrate replaces the whole state', () => {
		const base = createInitialGameState(PUZZLE, 'daily')
		const target = emptyGameState('practice')
		expect(gameReducer(base, { type: 'hydrate', state: target })).toBe(target)
	})
})