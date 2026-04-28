# Polish & Quality Roadmap

Third-wave improvements: accessibility, player experience, statistics, and developer workflow.

---

## Step 1 — Accessibility (ARIA + screen reader)

**What:** Make the game usable with a screen reader and keyboard-only navigation.

**Changes needed:**
- Add `aria-label` to each `.hex-tile` button: `"Letter A"`, `"Letter C (center)"`.
- Add `role="status" aria-live="polite"` to `#message` so toast messages are announced.
- Add `aria-label="Found words"` to `#foundWordsList` and `aria-live="polite"` so newly added words are announced.
- Add `aria-label` to the Delete, Scramble, and Enter buttons.
- Ensure the candidate answer span has `aria-label="Current answer"` and `aria-live="polite"`.

**Why first:** Accessibility changes are cheap at this stage and touch the same elements as later UI work; retrofitting later costs more.

---

## Step 2 — Rank progress bar

**What:** Show a visual progress bar between the player's current rank and the next rank threshold, mirroring the official game's UI.

**Design:**
- A narrow bar below the rank label showing `score / nextThresholdScore` (0–100%).
- Labels at each end: current rank on the left, next rank on the right (or "Queen Bee 👑" at max).
- Fills with the same gold (`#f8cd05`) used for the center tile.

**State changes needed:** none — `getRank` and `maxScore` already exist; derive next threshold from the `RANKS` table.

**Suggested approach:** Export a `getNextRankThreshold(score, max)` helper from `InteractionHandlerSystem` and add it to the rank display logic in `index.ts`.

---

## Step 3 — Tile keypress highlight

**What:** When the player types a hive letter, briefly flash the matching hex tile to confirm the keypress visually.

**Why:** Provides immediate tactile-style feedback so players know the keystroke registered, especially useful on keyboards without haptic feedback.

**Approach:** In `handleKeydown`, after appending the letter, call a new `InteractionHandlerSystem.triggerTileHighlight(letter, tiles)` that finds the matching tile element and adds a short CSS class (e.g. `key-pressed`, 150 ms).

---

## Step 4 — Shuffle animation

**What:** Animate the outer tiles flying to their new positions when Scramble is pressed, instead of text values swapping instantly.

**Approach:** Assign stable `data-slot` attributes to each tile element. On scramble, compute old vs. new positions with `getBoundingClientRect()`, apply a brief CSS transition using the FLIP technique (First–Last–Invert–Play).

---

## Step 5 — Game statistics

**What:** Track cumulative play stats in `localStorage` and display them in a modal or panel.

**Stats to record:**
| Stat | Description |
|---|---|
| Games played | Puzzles started (any word found) |
| Words found (all time) | Running total |
| Pangrams found | Running total |
| Queen Bee days | Times score reached 100% |
| Current streak | Consecutive days a word was found |

**State changes needed:** a new `src/stats.ts` module with `recordGameResult` and `loadStats`.

---

## Step 6 — CI/CD with GitHub Actions

**What:** Add a `.github/workflows/ci.yml` that runs on every push and PR:
1. `npm run lint`
2. `npm test -- --run` (Vitest unit tests)
3. `npm run test:e2e` (Playwright, using installed Chromium)

**Why:** Prevents regressions from landing silently. The Playwright setup already handles `webServer` startup so CI needs no extra orchestration.

**Suggested job matrix:**
```yaml
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install chromium --with-deps
      - run: npm run lint
      - run: npm test -- --run
      - run: npm run test:e2e
```

---

## Step 7 — Share / copy result

**What:** A "Share" button that copies the day's result to the clipboard in the same style as NYT games:

```
Spelling Bee — 2026-04-28
Score: 42  Rank: Genius  Words: 11 / 38
```

**Approach:** Compose the string from `state.score`, `getRank(state.score, max)`, `state.foundWords.size`, and `puzzle.validWords.length`. Call `navigator.clipboard.writeText()` and show a "Copied!" toast using the existing `showMessage` infrastructure.

**State changes needed:** none.
