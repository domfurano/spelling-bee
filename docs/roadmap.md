# Feature Parity Roadmap

Steps to reach parity with the official NYT Spelling Bee, ordered by dependency.

---

## Step 1 — Puzzle data model

**What:** Replace the hardcoded `'ALCOVES'` word list and letter string with a typed `Puzzle` interface that drives the whole game.

```ts
interface Puzzle {
  centerLetter: string;   // e.g. 'C'
  outerLetters: string[]; // 6 letters, e.g. ['A','L','O','V','E','S']
  validWords: string[];   // all accepted answers
  pangrams: string[];     // subset of validWords that use all 7 letters
}
```

**Why first:** Every other feature depends on knowing which letter is the center and which words are valid.

---

## Step 2 — Input validation rules

Three checks the official game enforces before looking up the word list, implemented in `InteractionHandlerSystem.enterWord`:

| Check | Message |
|---|---|
| Word uses a letter not in the hive | "Not in the list" |
| Word does not include the center letter | "Missing center letter" |
| Word already found this session | "Already found!" |

**State changes needed:** add `foundWords: Set<string>` to `GameState`.

---

## Step 3 — Keyboard input

**What:** Allow typing letters, Backspace, and Enter directly from the keyboard — no click required.

Wire a `keydown` listener in `src/index.ts`. Only accept key presses that match one of the 7 hive letters (case-insensitive). Reuse the existing `InteractionHandlerSystem` methods so no logic is duplicated.

---

## Step 4 — Scoring

**What:** Compute a running score as words are found.

| Word length | Points |
|---|---|
| 4 letters | 1 |
| 5+ letters | 1 per letter |
| Pangram bonus | +7 (on top of length points) |

Add `score: number` to `GameState`. Display it in the UI near the answer input.

---

## Step 5 — Rank system

**What:** Show the player's current rank, updating whenever `score` changes.

The official ranks (as % of max possible score):

| % | Rank |
|---|---|
| 0 | Beginner |
| 2 | Good Start |
| 5 | Moving Up |
| 8 | Good |
| 15 | Solid |
| 25 | Nice |
| 40 | Great |
| 50 | Amazing |
| 70 | Genius |
| 100 | Queen Bee |

Max score = sum of points for all `validWords` in the puzzle.

---

## Step 6 — Found words list

**What:** Show the words found so far, sorted alphabetically, in a panel beside (or below) the hive. Pangrams should be visually distinguished (e.g. bold or colored text).

**State changes needed:** `foundWords` from Step 2 already provides the data; this step is purely UI.

---

## Step 7 — Daily puzzle

**What:** Serve a different puzzle each day, matching the cadence of the official game.

Options (pick one):

- **Static JSON file** — a `puzzles.json` array indexed by date, bundled with the build. Simple, no backend required.
- **Fetch from an API** — call a remote endpoint for the day's puzzle. Requires a server or third-party data source.

The selected puzzle is determined by `today's date → index → Puzzle` and set once on startup.

---

## Step 8 — Pangram celebration

**What:** When the player's entered word is a pangram, show a distinct success message and/or visual effect (e.g. a golden flash on the hive) in addition to awarding the bonus points.

This is a small polish step that relies on the pangram data from Step 1 and the scoring from Step 4.
