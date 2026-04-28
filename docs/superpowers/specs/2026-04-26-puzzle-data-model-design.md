# Puzzle Data Model — Design Spec

**Date:** 2026-04-26  
**Roadmap step:** 1 — Puzzle data model  
**Status:** Awaiting approval

---

## Context

All puzzle data is currently hardcoded in two places:

- `src/systems/interactionHandlerSystem.ts` — `private static readonly validWords` (~44 words)
- `src/index.ts` — the string literal `'ALCOVES'` passed to `TextGenerationSystem.shuffleWord`

`GameState` has no concept of a puzzle. `TextGenerationSystem.applyLetters` takes a raw string and has no way to enforce the center letter constraint. This blocks every remaining roadmap step.

---

## Decision

**Option A — Store `Puzzle` on `GameState`.**

The puzzle is runtime game data (like `answer`). Storing it on `GameState` means all systems receive it through the same object they already receive today, requires zero new parameters beyond `createScene`, and keeps tests simple (pass a mock puzzle in the state object).

---

## Interface

New file: `src/puzzle.ts`

```typescript
export interface Puzzle {
  centerLetter: string;   // single uppercase letter, e.g. 'C'
  outerLetters: string[]; // exactly 6 uppercase letters, e.g. ['A','L','O','V','E','S']
  validWords: string[];   // all accepted answers, uppercase
  pangrams: string[];     // subset of validWords using all 7 letters
}
```

Exported constant (same file):

```typescript
export const ALCOVES_PUZZLE: Puzzle = {
  centerLetter: 'C',
  outerLetters: ['A', 'L', 'O', 'V', 'E', 'S'],
  validWords: [
    'ALOE', 'ALOES', 'ALCOVE', 'ALCOVES', 'CAVE', 'CAVES', 'COVE', 'COVES',
    'CLOVE', 'CLOVES', 'LACE', 'LACES', 'LAVE', 'LAVES', 'VALE', 'VALES',
    'LOVE', 'LOVES', 'VOLE', 'VOLES', 'SLAVE', 'SALVE', 'SOLVE', 'SOLACE',
    'SCALE', 'VOCAL', 'VOCALS', 'COLA', 'COLAS', 'COAL', 'COALS', 'SOLE',
    'SLOE', 'CLOSE', 'VALVE', 'VALVES', 'LOAVES', 'LOCAL', 'LOCALE',
    'LOCALS', 'COLES', 'ACES', 'LOCO',
  ],
  pangrams: ['ALCOVES'],
};
```

> `OAVES` is in the current hardcoded list but is not a real English word. It is **dropped** in this migration.

---

## File-by-file changes

### 1. `src/puzzle.ts` (new)

Create the file with the interface and `ALCOVES_PUZZLE` constant above.

---

### 2. `src/game-state.ts`

Add `puzzle: Puzzle` to `GameState`.

**Before:**
```typescript
export interface GameState {
  tiles: HexTile[];
  answer: string;
}
```

**After:**
```typescript
import { Puzzle } from './puzzle';

export interface GameState {
  tiles: HexTile[];
  answer: string;
  puzzle: Puzzle;
}
```

---

### 3. `src/systems/scene-creator.system.ts`

Update `createScene` signature to accept a `puzzle` and store it in the returned state.

**Before:**
```typescript
export function createScene(container: HTMLElement): GameState {
  // ...
  return { tiles, answer: '' };
}
```

**After:**
```typescript
import { Puzzle } from '../puzzle';

export function createScene(container: HTMLElement, puzzle: Puzzle): GameState {
  // ...
  return { tiles, answer: '', puzzle };
}
```

---

### 4. `src/systems/interactionHandlerSystem.ts`

Remove the `private static readonly validWords` field. Replace the `validWords.has(word)` check in `enterWord` with `state.puzzle.validWords.includes(word)`.

**Before:**
```typescript
private static readonly validWords = new Set([/* ... */]);

// inside enterWord:
if (InteractionHandlerSystem.validWords.has(word)) {
```

**After:**
```typescript
// private static readonly validWords — DELETED

// inside enterWord:
if (state.puzzle.validWords.includes(word)) {
```

---

### 5. `src/index.ts`

Replace the hardcoded `'ALCOVES'` string with data derived from the puzzle.

**Before:**
```typescript
const state = createScene(honeycombEl);
TextGenerationSystem.applyLetters(
  state.tiles,
  TextGenerationSystem.shuffleWord('ALCOVES')
);
```

**After:**
```typescript
import { ALCOVES_PUZZLE } from './puzzle';

const state = createScene(honeycombEl, ALCOVES_PUZZLE);
const shuffledOuter = TextGenerationSystem.shuffleWord(
  ALCOVES_PUZZLE.outerLetters.join('')
);
TextGenerationSystem.applyLetters(
  state.tiles,
  ALCOVES_PUZZLE.centerLetter + shuffledOuter
);
```

Note: `TextGenerationSystem.applyLetters(tiles, word)` is **unchanged**. `tiles[0]` (center) always receives `centerLetter` because it is prepended before the shuffled outer letters.

---

### 6. `src/systems/interactionHandlerSystem.spec.ts`

The `makeState` helper currently returns `{ tiles, answer }`. It must also provide a `puzzle`.  
Add a `mockPuzzle` fixture and update `makeState` (or create an overloaded helper).

```typescript
const mockPuzzle: Puzzle = {
  centerLetter: 'C',
  outerLetters: ['A', 'L', 'O', 'V', 'E', 'S'],
  validWords: ['CAVE', 'CLOVE', 'ALCOVE', 'ALCOVES'],
  pangrams: ['ALCOVES'],
};

function makeState(answer: string, ...tiles: HexTile[]): GameState {
  return { tiles, answer, puzzle: mockPuzzle };
}
```

New `enterWord` tests should be added:
- word shorter than 4 letters → does not clear `state.answer`... wait, currently `enterWord` *does* clear `state.answer` after every valid/invalid attempt. Tests should verify: valid word → `state.answer` is cleared; invalid word → `state.answer` is cleared; too-short word → `state.answer` is cleared.

---

## What does NOT change

| Item | Reason |
|---|---|
| `TextGenerationSystem.applyLetters` signature | Still takes `(tiles, word)` — caller constructs the word |
| `TextGenerationSystem.shuffleWord` | Used for outer letters only; center is always prepended |
| `InteractionHandlerSystem.scramble` | Already only shuffles `tiles.slice(1)` |
| `InteractionHandlerSystem.deleteLastLetter` | No puzzle dependency |
| CSS, HTML, `styles.css` | No change needed |

---

## Test plan

All 13 existing tests should continue to pass after updating `makeState`.  
New tests to add (TDD — write failing tests first):

1. `enterWord` with a word in `puzzle.validWords` → clears answer
2. `enterWord` with a word not in `puzzle.validWords` → clears answer  
3. `enterWord` with a word < 4 letters → does NOT clear answer (short-circuit return)
4. `TextGenerationSystem.applyLetters` with center + shuffled outer → `tiles[0].letter === centerLetter`

---

## Open questions

None — all resolved in brainstorming.
