// Global configuration constants (see README for how to change these).

// The production origin is the single placeholder domain
// https://wortense.vercel.app — swap it for the real domain before launch.
export const SHARE_URL = 'https://wortense.vercel.app'

/** First day of the daily rotation (local calendar day). YYYY-MM-DD. */
export const LAUNCH_DATE = '2026-10-01'

/** Attempts allowed per puzzle (§1.1). */
export const MAX_ATTEMPTS = 4

/** localStorage key namespace (§5.7): wortense:v1:<key>. */
export const STORAGE_NAMESPACE = 'wortense:v1'