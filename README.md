# Wortense

A mobile-first daily word game that teaches English learners the **shades of
meaning (intensity)** of near-synonyms. Arrange 4–5 words from mildest to most
intense, get colour-coded feedback, and learn from a beautiful end screen.
Wordle-inspired, fully offline-capable, no backend.

## Requirements

- **Node LTS** (Node 20.11+; see `.nvmrc` → `20`).
- npm (plain `npm install`, no `--legacy-peer-deps`).

## Setup

```bash
nvm use          # optional; reads .nvmrc
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server. |
| `npm run build` | Type-check (`tsc -b`) then build to `dist/`. |
| `npm run preview` | Serve the production build (PWA + offline testable). |
| `npm run lint` | ESLint 9 flat config, `--max-warnings 0`. |
| `npm run typecheck` | `tsc -b` across the project references. |
| `npm test` | Run the Vitest suite once. |
| `npm run test:watch` | Vitest in watch mode. |
| `npm run verify` | `lint` + `typecheck` + `test` + `build`. |
| `npm run icons` | One-time icon generation (see below). **Not part of build.** |

## Project structure

```
public/            Static assets: favicon.svg, icon.svg, og-image.svg, robots.txt,
                   and the generated PNG icons (after `npm run icons`).
scripts/           generate-icons.mjs (sharp; manual, never in build).
docs/              PUZZLE_REVIEW.md (human ordering sign-off).
src/
  lib/             Pure, DOM-free game logic (unit-tested): prng, shuffle,
                   evaluate, reorder, dates, daily, practice, stats, share,
                   plus the isolated effect modules storage/audio/haptics/speech.
  data/            Puzzle JSON batches + the import.meta.glob loader and tests.
  state/           useReducer game engine + Settings/Stats/Effects/Game providers.
  hooks/           Countdown, date rollover, reduced-motion, toast.
  components/      Presentational UI (ladder, cards, modals, end screen).
  App.tsx          Provider composition + screen switch.
```

Pure logic lives in `src/lib` and never imports React or the DOM; the UI only
calls it. `localStorage` is touched **only** in `src/lib/storage.ts`.

## How to add or edit puzzles

Puzzles live in `src/data/puzzles/batch-0N.json` as arrays of `Puzzle` objects.
The loader (`src/data/index.ts`) discovers every `batch-*.json` via
`import.meta.glob`, sorts by filename, and builds the daily rotation from all
non-`practiceOnly` puzzles in file order.

Each puzzle:

```jsonc
{
  "id": "anger-01",                 // globally unique
  "theme": "Anger",                 // non-empty
  "axisLabels": { "low": "Least angry", "high": "Most angry" },
  "difficulty": "medium",           // easy | medium | hard
  "cefr": "B2",                     // B1 | B2 | C1
  "practiceOnly": false,            // optional; true = excluded from daily rotation
  "reviewNote": "…",                // optional; dev-only, NEVER rendered
  "words": [                        // stored in ascending rank order
    { "text": "annoyed", "rank": 1, "partOfSpeech": "adjective",
      "definition": "…", "example": "… annoyed …", "whyHere": "…" }
    // …
  ]
}
```

### Rules the tests enforce

`src/data/puzzles.test.ts` (per-puzzle) and `src/data/data.test.ts` (corpus):

- **Counts:** 4 or 5 words; `easy ⇒ 4`, `hard ⇒ 5`, `medium ⇒ 4 or 5`.
- **Ranks:** exactly `1..N`, strict order, no ties.
- **Words:** lowercase `[a-z]{3,13}`, unique within a puzzle, one part of speech,
  and **no word appears in more than two puzzles** across the whole corpus.
- **Lengths:** definition ≤ 20 words, example ≤ 18 words, whyHere ≤ 22 words.
- **Example** contains its word as a **whole word**.
- **Ids** are globally unique; the daily/practice split is disjoint by `practiceOnly`.
- **Totals:** exactly 60 puzzles — 44 daily + 16 practice.
- **Rotation spacing:** no two `hard` daily puzzles adjacent (wrap-around), and
  no theme repeats within any 7-puzzle daily window (wrap-around).

> ⚠️ The tests prove **structure**, not that an ordering is *correct*. Have a
> fluent speaker review every ordering — see `docs/PUZZLE_REVIEW.md`.

After any edit: `npm test`.

## Changing the launch date

`src/config.ts` exports `LAUNCH_DATE = '2026-10-01'`. The daily index is the
number of whole local days from `LAUNCH_DATE` to today (clamped to ≥ 0,
DST-proof via `Date.UTC(...)` on integer y/m/d). The displayed number is
`dayIndex + 1`. Edit the constant to move launch day; puzzle `#1` is served on
`LAUNCH_DATE`.

## Icon generation

Icons are **not** built automatically (binaries can't be committed here). After
editing `public/icon.svg` or `public/og-image.svg`, run once:

```bash
npm run icons
```

This writes `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`,
`apple-touch-icon.png` (180), and `og-image.png` (1200×630) into `public/`.
Commit those PNGs so deploys and the PWA manifest have them.

## Deploy

Any static host works; the build output is `dist/`.

- **Vercel:** import the repo. `vercel.json` sets long-cache for `/assets/*`,
  `no-cache` for `index.html` / `sw.js` / `manifest.webmanifest`, and the
  security headers. No settings changes needed.
- **Netlify:** `netlify.toml` sets `build = npm run build`, `publish = dist`,
  the same cache/security headers, and an SPA fallback.
- **GitHub Pages / Cloudflare Pages:** if you deploy under a sub-path (e.g.
  `https://user.github.io/wortense/`), set Vite's `base` to `'/wortense/'` in
  `vite.config.ts` and rebuild; the PWA `scope`/`start_url` will need the same
  base. At a root domain no base change is required.

### Pre-launch checklist

- [ ] Replace the placeholder domain `https://wortense.example` everywhere it
      appears (see below) with your real domain.
- [ ] Set `LAUNCH_DATE` in `src/config.ts`.
- [ ] Review every puzzle ordering (`docs/PUZZLE_REVIEW.md`).
- [ ] Run `npm run icons` and commit the PNGs.
- [ ] `npm run verify` is clean.
- [ ] Test offline via `npm run preview` (load, then go offline, then reload).

### Placeholder-domain locations

`https://wortense.example` appears in exactly these places (one clearly
commented spot per file):

1. `src/config.ts` — `SHARE_URL`.
2. `vite.config.ts` — top-of-file comment.
3. `index.html` — `<link rel="canonical">`, `og:url`, `og:image`,
   `twitter:image`.
4. `public/robots.txt` — the `Sitemap:` line.

## Known limitations

- **Answers are in the client bundle.** There is no backend, so a determined
  player can read the day's solution from the JS. This is by design (offline,
  zero-infra). Do not treat scores as tamper-proof.
- **No content security policy.** A strict CSP would break the inline no-flash
  theme script in `index.html`, so the deploy configs intentionally omit CSP
  and keep the other security headers. Add a nonce-based CSP later if desired.
- **Stats are local only.** Progress lives in `localStorage`; clearing site
  data or switching devices resets it.

## Decisions

Where the spec left room, the simplest robust option was chosen:

1. Reveal timing: 140 ms flip stagger, ~360 ms flip, lock-in pop, ~1.2 s
   win→end-screen delay; reduced motion collapses all to ≤120 ms fades.
2. Modals: native `<dialog>` + `showModal()` with added scroll-lock,
   backdrop-click close, and explicit return-focus.
3. PRNG: FNV-1a (32-bit) over the puzzle id → mulberry32; derangement via a
   bounded shuffle, falling back to a cyclic rotation by 1.
4. Dates: `YYYY-MM-DD` keys, all arithmetic through `Date.UTC(...)`, index
   clamped to ≥ 0.
5. High-contrast palette: orange `#E66100` / blue `#1A85FF`, with glyphs
   (✓ ≈ ✕) so colour is never the only signal.
6. Practice counters live in a separate storage key from daily stats.
7. Theme: inline no-flash script sets the `.dark` class; a runtime effect keeps
   `<meta name="theme-color">` in sync.
8. Confetti and confetti-heavy paths are dynamically imported to keep initial
   JS ≤ 220 kB gzip; framer-motion is loaded via `LazyMotion` + `domAnimation`.
9. `eslint-plugin-react-hooks` pinned to stable `5.0.0` (not the RC).
10. Data loader tolerates missing batches — the app still runs if only some
    `batch-*.json` files exist.
11. Storage namespace `wortense:v1:{settings|stats|daily|practice|onboarded}`,
    every read guarded, invalid data discarded with an in-memory fallback.