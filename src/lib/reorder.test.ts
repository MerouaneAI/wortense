import { describe, it, expect } from 'vitest'
import { moveUnlocked, moveUnlockedBy } from './reorder'

describe('moveUnlocked', () => {
	it('reorders freely when there are no locks', () => {
		expect(moveUnlocked(['a', 'b', 'c', 'd'], [], 'a', 'c')).toEqual([
			'b',
			'c',
			'a',
			'd',
		])
	})

	it('keeps a locked row at the start fixed', () => {
		expect(moveUnlocked(['a', 'b', 'c', 'd'], ['a'], 'b', 'd')).toEqual([
			'a',
			'c',
			'd',
			'b',
		])
	})

	it('keeps a locked row in the middle fixed', () => {
		expect(moveUnlocked(['a', 'b', 'c', 'd'], ['c'], 'a', 'd')).toEqual([
			'b',
			'd',
			'c',
			'a',
		])
	})

	it('keeps a locked row at the end fixed', () => {
		expect(moveUnlocked(['a', 'b', 'c', 'd'], ['d'], 'a', 'c')).toEqual([
			'b',
			'c',
			'a',
			'd',
		])
	})

	it('returns an unchanged copy for no-op or unknown ids', () => {
		const arr = ['a', 'b', 'c']
		expect(moveUnlocked(arr, [], 'a', 'a')).toEqual(arr)
		expect(moveUnlocked(arr, [], 'x', 'b')).toEqual(arr)
	})
})

describe('moveUnlockedBy', () => {
	it('moves a card down and up by one', () => {
		expect(moveUnlockedBy(['a', 'b', 'c', 'd'], [], 'b', 1)).toEqual([
			'a',
			'c',
			'b',
			'd',
		])
		expect(moveUnlockedBy(['a', 'b', 'c', 'd'], [], 'c', -1)).toEqual([
			'a',
			'c',
			'b',
			'd',
		])
	})

	it('jumps over a locked row', () => {
		expect(moveUnlockedBy(['a', 'b', 'c', 'd'], ['c'], 'b', 1)).toEqual([
			'a',
			'd',
			'c',
			'b',
		])
	})

	it('does nothing at the boundaries or for unknown ids', () => {
		expect(moveUnlockedBy(['a', 'b', 'c'], [], 'a', -1)).toEqual([
			'a',
			'b',
			'c',
		])
		expect(moveUnlockedBy(['a', 'b', 'c'], [], 'c', 1)).toEqual([
			'a',
			'b',
			'c',
		])
		expect(moveUnlockedBy(['a', 'b', 'c'], [], 'z', 1)).toEqual([
			'a',
			'b',
			'c',
		])
	})
})