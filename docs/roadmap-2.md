# Feature Improvement Roadmap

Post-parity improvements, ordered by player impact.

---

## Step 1 — Expand puzzle library

**What:** Grow `puzzles.json` beyond the current 7 entries so the daily rotation doesn't repeat weekly.

**Why first:** Content is the most visible gap. Every other improvement below is worthless if players see the same puzzle every week.

**Approach:**
- Curate additional puzzles manually, each with `centerLetter`, `outerLetters`, `validWords`, and `pangrams`.
- Optionally script a validator that checks authoring invariants (see Step 4) before committing new entries.

---

## Step 2 — Session persistence

**What:** Save `foundWords` and `score` to `localStorage` keyed by the current puzzle date, and restore them on page load. A refresh mid-session should resume exactly where the player left off.

**State changes needed:** none to `GameState` — serialize/deserialize the existing fields.

**Suggested API:**
```ts
// src/persistence.ts
function saveProgress(dateKey: string, foundWords: Set<string>, score: number): void
function loadProgress(dateKey: string): { foundWords: Set<string>; score: number } | null
function clearProgress(dateKey: string): void
```

---

## Step 3 — Word count display

**What:** Show a live count of words found vs. total available, e.g. `"3 / 42 words"`, near the score or found-words panel.

**Why:** Players can't gauge how far through the puzzle they are without it.

**State changes needed:** none — `state.foundWords.size` and `puzzle.validWords.length` already exist.

---

## Step 4 — Puzzle validation at startup

**What:** Assert puzzle integrity when the game loads. Fail loudly (throw or log a clear error) rather than silently misbehaving.

**Checks:**
| Rule | Description |
|---|---|
| Center letter is a single uppercase letter | `centerLetter.length === 1` |
| Exactly 6 outer letters, all single uppercase | `outerLetters.length === 6` |
| All `validWords` use only the 7 hive letters | no character outside `centerLetter ∪ outerLetters` |
| All `validWords` include the center letter | every word contains `centerLetter` |
| All `pangrams` are in `validWords` | subset check |
| All `pangrams` use every hive letter at least once | pangram definition |

**Suggested location:** `src/puzzle.ts` — a standalone `assertValidPuzzle(puzzle: Puzzle): void` function, called in `index.ts` after puzzle selection.

---

## Step 5 — "Already found" highlight in found-words list

**What:** When the player re-enters an already-found word, briefly highlight that word in the found-words panel (e.g. a yellow background flash) in addition to the existing toast message.

**Why:** The toast is easy to miss; the highlight directs the player's eye to the word they already have.

**Approach:** `InteractionHandlerSystem.enterWord` returns a result type (or fires a callback) indicating `'already-found'`; `index.ts` then scrolls to and flashes the matching `<li>` element.

---

## Step 6 — Responsive honeycomb

**What:** Scale `#honeycomb` and `.hex-tile` with the viewport so the game is usable on mobile screens.

**Approach:** Replace the hardcoded `300px × 310px` container and `110px × 96px` tile dimensions with CSS `clamp()` or a viewport-relative unit. The `clip-path` percentages are already viewport-independent, so only sizes need to change.

---

## Step 7 — Playwright end-to-end tests

**What:** Add a Playwright test suite covering the critical user flows that unit tests can't exercise — full browser rendering, DOM interaction, and localStorage persistence across page loads.

**Why:** The existing Vitest suite covers pure logic well, but has no coverage of: tile layout rendering, click/keyboard input reaching the DOM, the found-words panel updating, or saved progress surviving a reload.

**Setup:**
```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

Add `playwright.config.ts` at the project root pointing at the Vite dev server (`http://localhost:3000`).

**Test scenarios:**

| Scenario | What to assert |
|---|---|
| Page loads | Hive renders 7 tiles; center tile has `center` class |
| Click a hive letter | Letter appears in the answer display |
| Type a hive letter | Letter appears in the answer display |
| Enter a valid word | Word appears in found-words list; score increases |
| Enter a pangram | "Pangram! 🌟" toast appears; all tiles flash |
| Enter a duplicate | "Already found!" toast appears; word count unchanged |
| Delete key | Last letter removed from answer display |
| Persistence | Enter a word, reload page — word still in found-words list and score restored |

**Suggested location:** `e2e/` folder at the project root, e.g. `e2e/game.spec.ts`.
