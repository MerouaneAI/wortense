// Deterministic PRNG: FNV-1a (32-bit) hash of a seed string → mulberry32.
// Pure, dependency-free (spec §1.1).

/** FNV-1a 32-bit hash. Returns an unsigned 32-bit integer. */
export function fnv1a(str: string): number {
	let hash = 0x811c9dc5
	for (let i = 0; i < str.length; i++) {
		hash ^= str.charCodeAt(i)
		hash = Math.imul(hash, 0x01000193)
	}
	return hash >>> 0
}

/** mulberry32 PRNG. Returns a function producing floats in [0, 1). */
export function mulberry32(seed: number): () => number {
	let a = seed >>> 0
	return function next(): number {
		a = (a + 0x6d2b79f5) | 0
		let t = Math.imul(a ^ (a >>> 15), 1 | a)
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

/** Convenience: seed a mulberry32 stream from a string via FNV-1a. */
export function createRng(seedStr: string): () => number {
	return mulberry32(fnv1a(seedStr))
}