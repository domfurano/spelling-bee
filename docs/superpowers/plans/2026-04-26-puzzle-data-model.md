# Puzzle Data Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all hardcoded puzzle data with a typed `Puzzle` interface stored on `GameState`, enabling every downstream roadmap step.

**Architecture:** A new `src/puzzle.ts` module exports the `Puzzle` interface and the `ALCOVES_PUZZLE` constant. `GameState` gains a `puzzle: Puzzle` field. `createScene` is updated to accept and store the puzzle. `InteractionHandlerSystem.enterWord` reads valid words from `state.puzzle.validWords` instead of a private static set. `index.ts` derives letters from the puzzle object.

**Tech Stack:** TypeScript (strict), Vite, Vitest (jsdom), ESLint/Prettier

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/puzzle.ts` | `Puzzle` interface + `ALCOVES_PUZZLE` constant |
| Modify | `src/game-state.ts` | Add `puzzle: Puzzle` to `GameState` |
| Modify | `src/systems/scene-creator.system.ts` | Accept `puzzle`, store in returned state |
| Modify | `src/systems/interactionHandlerSystem.ts` | Remove static `validWords`; read from `state.puzzle` |
| Modify | `src/systems/interactionHandlerSystem.spec.ts` | Add `mockPuzzle` fixture; add `enterWord` tests |
| Modify | `src/index.ts` | Import puzzle; derive letters from puzzle fields |

---

## Task 1: Create `src/puzzle.ts`

**Files:**
- Create: `src/puzzle.ts`

- [ ] **Step 1: Write the failing test**

Create `src/puzzle.spec.ts`:

```typescript
import { expect, describe, it } from 'vitest';
import { ALCOVES_PUZZLE } from './puzzle';

describe('ALCOVES_PUZZLE', () => {
  it('has a single uppercase centerLetter', () => {
    expect(ALCOVES_PUZZLE.centerLetter).toMatch(/^[A-Z]$/);
  });

  it('has exactly 6 outerLetters, all uppercase', () => {
    expect(ALCOVES_PUZZLE.outerLetters).toHaveLength(6);
    for (const l of ALCOVES_PUZZLE.outerLetters) {
      expect(l).toMatch(/^[A-Z]$/);
    }
  });

  it('centerLetter is not in outerLetters', () => {
    expect(ALCOVES_PUZZLE.outerLetters).not.toContain(ALCOVES_PUZZLE.centerLetter);
  });

  it('pangrams are a subset of validWords', () => {
    const wordSet = new Set(ALCOVES_PUZZLE.validWords);
    for (const p of ALCOVES_PUZZLE.pangrams) {
      expect(wordSet.has(p)).toBe(true);
    }
  });

  it('ALCOVES is the only pangram', () => {
    expect(ALCOVES_PUZZLE.pangrams).toEqual(['ALCOVES']);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --run src/puzzle.spec.ts
```

Expected: 5 failures — module not found.

- [ ] **Step 3: Create `src/puzzle.ts`**

```typescript
export interface Puzzle {
  centerLetter: string;
  outerLetters: string[];
  validWords: string[];
  pangrams: string[];
}

export const ALCOVES_PUZZLE: Puzzle = {
  centerLetter: 'C',
  outerLetters: ['A', 'L', 'O', 'V', 'E', 'S'],
  validWords: [
    'ALOE',
    'ALOES',
    'ALCOVE',
    'ALCOVES',
    'CAVE',
    'CAVES',
    'COVE',
    'COVES',
    'CLOVE',
    'CLOVES',
    'LACE',
    'LACES',
    'LAVE',
    'LAVES',
    'VALE',
    'VALES',
    'LOVE',
    'LOVES',
    'VOLE',
    'VOLES',
    'SLAVE',
    'SALVE',
    'SOLVE',
    'SOLACE',
    'SCALE',
    'VOCAL',
    'VOCALS',
    'COLA',
    'COLAS',
    'COAL',
    'COALS',
    'SOLE',
    'SLOE',
    'CLOSE',
    'VALVE',
    'VALVES',
    'LOAVES',
    'LOCAL',
    'LOCALE',
    'LOCALS',
    'COLES',
    'ACES',
    'LOCO',
  ],
  pangrams: ['ALCOVES'],
};
```

Note: `OAVES` (present in the old hardcoded list) is intentionally omitted — it is not a real English word.

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --run src/puzzle.spec.ts
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/puzzle.ts src/puzzle.spec.ts
git commit -m "feat: add Puzzle interface and ALCOVES_PUZZLE constant"
```

---

## Task 2: Add `puzzle` to `GameState`

**Files:**
- Modify: `src/game-state.ts`

> TypeScript strict mode is on — adding a required field will cause compile errors in `scene-creator.system.ts` and `interactionHandlerSystem.spec.ts`. That is intentional; those are fixed in Tasks 3 and 4.

- [ ] **Step 1: Edit `src/game-state.ts`**

Replace the entire file contents with:

```typescript
import { Puzzle } from './puzzle';

export interface HexTile {
  letter: string;
  isCenter: boolean;
  element: HTMLButtonElement;
}

export interface GameState {
  tiles: HexTile[];
  answer: string;
  puzzle: Puzzle;
}
```

- [ ] **Step 2: Confirm expected compile errors**

```bash
npm run build 2>&1 | grep "error TS"
```

Expected: errors in `scene-creator.system.ts` (missing `puzzle` in return) and `interactionHandlerSystem.spec.ts` (`makeState` returns incomplete object). These are fixed in the next tasks.

- [ ] **Step 3: Commit the interface change**

```bash
git add src/game-state.ts
git commit -m "feat: add puzzle field to GameState interface"
```

---

## Task 3: Update `createScene` to accept and store `puzzle`

**Files:**
- Modify: `src/systems/scene-creator.system.ts`

- [ ] **Step 1: Edit `src/systems/scene-creator.system.ts`**

Replace the entire file contents with:

```typescript
import { GameState, HexTile } from '../game-state';
import { Puzzle } from '../puzzle';

// Flat-top hexagon: width=110px, height=96px
// Positions are top-left corners of each tile within a 300×310px container.
// Tile order: [center, bottom, bottom-left, top-left, top, top-right, bottom-right]
const TILE_POSITIONS = [
  { x: 95, y: 107 },
  { x: 95, y: 207 },
  { x: 8, y: 157 },
  { x: 8, y: 57 },
  { x: 95, y: 7 },
  { x: 182, y: 57 },
  { x: 182, y: 157 },
];

export function createScene(container: HTMLElement, puzzle: Puzzle): GameState {
  const tiles: HexTile[] = [];

  TILE_POSITIONS.forEach((pos, i) => {
    const isCenter = i === 0;
    const button = document.createElement('button');
    button.className = 'hex-tile' + (isCenter ? ' center' : '');
    button.style.left = `${pos.x}px`;
    button.style.top = `${pos.y}px`;
    container.appendChild(button);
    tiles.push({ letter: '', isCenter, element: button });
  });

  return { tiles, answer: '', puzzle };
}
```

- [ ] **Step 2: Run existing tests**

```bash
npm test -- --run
```

Expected: all tests except those in `interactionHandlerSystem.spec.ts` pass. That spec's `makeState` helper still doesn't include `puzzle` — fixed in Task 4.

- [ ] **Step 3: Commit**

```bash
git add src/systems/scene-creator.system.ts
git commit -m "feat: createScene accepts Puzzle and stores it on GameState"
```

---

## Task 4: Update `InteractionHandlerSystem` — remove static word list, read from state

**Files:**
- Modify: `src/systems/interactionHandlerSystem.ts`
- Modify: `src/systems/interactionHandlerSystem.spec.ts`

- [ ] **Step 1: Write the new `enterWord` tests first**

Open `src/systems/interactionHandlerSystem.spec.ts`. At the top of the file, add the `Puzzle` import and a `mockPuzzle` fixture. Then update the `makeState` helper and add three new tests.

Replace this block:

```typescript
import { expect, describe, it } from 'vitest';
import { InteractionHandlerSystem } from './interactionHandlerSystem';
import { HexTile, GameState } from '../game-state';

function makeTile(letter: string, isCenter = false): HexTile {
  const element = document.createElement('button');
  element.textContent = letter;
  return { letter, isCenter, element };
}

function makeState(answer: string, ...tiles: HexTile[]): GameState {
  return { tiles, answer };
}
```

With:

```typescript
import { expect, describe, it } from 'vitest';
import { InteractionHandlerSystem } from './interactionHandlerSystem';
import { HexTile, GameState } from '../game-state';
import { Puzzle } from '../puzzle';

const mockPuzzle: Puzzle = {
  centerLetter: 'C',
  outerLetters: ['A', 'L', 'O', 'V', 'E', 'S'],
  validWords: ['CAVE', 'CLOVE', 'ALCOVE', 'ALCOVES'],
  pangrams: ['ALCOVES'],
};

function makeTile(letter: string, isCenter = false): HexTile {
  const element = document.createElement('button');
  element.textContent = letter;
  return { letter, isCenter, element };
}

function makeState(answer: string, ...tiles: HexTile[]): GameState {
  return { tiles, answer, puzzle: mockPuzzle };
}
```

Then add a new `describe('enterWord', ...)` block at the end of the outer `describe('InteractionHandlerSystem', ...)` block (before the closing `}`):

```typescript
  describe('enterWord', () => {
    it('clears the answer after a valid word', () => {
      const state = makeState('CAVE');
      InteractionHandlerSystem.enterWord(state);
      expect(state.answer).toBe('');
    });

    it('clears the answer after a word not in the list', () => {
      const state = makeState('ZZZZ');
      InteractionHandlerSystem.enterWord(state);
      expect(state.answer).toBe('');
    });

    it('does not clear the answer when the word is too short', () => {
      const state = makeState('CAV');
      InteractionHandlerSystem.enterWord(state);
      expect(state.answer).toBe('CAV');
    });
  });
```

- [ ] **Step 2: Run new tests to verify they fail**

```bash
npm test -- --run src/systems/interactionHandlerSystem.spec.ts
```

Expected: the three new `enterWord` tests fail (TypeScript error — `puzzle` missing from `makeState`); the existing tests may also error. That's the expected red state.

- [ ] **Step 3: Edit `src/systems/interactionHandlerSystem.ts`**

Remove the `private static readonly validWords` field and update the `enterWord` method to read from `state.puzzle.validWords`.

Replace:

```typescript
  private static readonly validWords = new Set([
    'ALOE',
    'ALOES',
    'ALCOVE',
    'ALCOVES',
    'CAVE',
    'CAVES',
    'COVE',
    'COVES',
    'CLOVE',
    'CLOVES',
    'LACE',
    'LACES',
    'LAVE',
    'LAVES',
    'VALE',
    'VALES',
    'LOVE',
    'LOVES',
    'VOLE',
    'VOLES',
    'SLAVE',
    'SALVE',
    'SOLVE',
    'SOLACE',
    'SCALE',
    'VOCAL',
    'VOCALS',
    'COLA',
    'COLAS',
    'COAL',
    'COALS',
    'SOLE',
    'SLOE',
    'CLOSE',
    'VALVE',
    'VALVES',
    'LOAVES',
    'LOCAL',
    'LOCALE',
    'LOCALS',
    'COLES',
    'OAVES',
    'ACES',
    'LOCO',
  ]);

  static deleteLastLetter(state: GameState): void {
```

With:

```typescript
  static deleteLastLetter(state: GameState): void {
```

Then replace:

```typescript
    if (InteractionHandlerSystem.validWords.has(word)) {
```

With:

```typescript
    if (state.puzzle.validWords.includes(word)) {
```

- [ ] **Step 4: Run all tests**

```bash
npm test -- --run
```

Expected: all tests pass, including the three new `enterWord` tests.

- [ ] **Step 5: Commit**

```bash
git add src/systems/interactionHandlerSystem.ts src/systems/interactionHandlerSystem.spec.ts
git commit -m "feat: enterWord reads valid words from state.puzzle instead of static set"
```

---

## Task 5: Update `src/index.ts` to use puzzle data

**Files:**
- Modify: `src/index.ts`

There are no unit tests for `index.ts` (it's a DOM wiring file). Verification is done by running the dev server.

- [ ] **Step 1: Edit `src/index.ts`**

Replace the entire file contents with:

```typescript
import { createScene } from './systems/scene-creator.system';
import { TextGenerationSystem } from './systems/text-generation.system';
import { InteractionHandlerSystem } from './systems/interactionHandlerSystem';
import { ALCOVES_PUZZLE } from './puzzle';

const honeycombEl = document.getElementById('honeycomb')!;
const answerEl = document.getElementById('spnCandidateAnswer')!;

const state = createScene(honeycombEl, ALCOVES_PUZZLE);
const shuffledOuter = TextGenerationSystem.shuffleWord(
  ALCOVES_PUZZLE.outerLetters.join('')
);
TextGenerationSystem.applyLetters(
  state.tiles,
  ALCOVES_PUZZLE.centerLetter + shuffledOuter
);

for (const tile of state.tiles) {
  tile.element.addEventListener('click', () => {
    state.answer += tile.letter;
    answerEl.innerText = state.answer;
    InteractionHandlerSystem.triggerLetterAddedAnimation();
  });
}

document.getElementById('btnDelete')?.addEventListener('click', () => {
  InteractionHandlerSystem.deleteLastLetter(state);
  answerEl.innerText = state.answer;
});
document.getElementById('btnScramble')?.addEventListener('click', () => {
  InteractionHandlerSystem.scramble(state.tiles);
});
document.getElementById('btnEnter')?.addEventListener('click', () => {
  InteractionHandlerSystem.enterWord(state);
  answerEl.innerText = state.answer;
});
```

- [ ] **Step 2: Run the full test suite**

```bash
npm test -- --run
```

Expected: all tests pass.

- [ ] **Step 3: Build to verify no TypeScript errors**

```bash
npm run build
```

Expected: exits 0, outputs to `dist/`.

- [ ] **Step 4: Smoke-test the dev server**

```bash
npm run dev
```

Open http://localhost:3000. Verify:
- 7 hex tiles render with letters (C always in the center, 6 outer letters from ALCOVES)
- Clicking tiles appends letters to the answer display
- Delete/Scramble/Enter buttons work
- Entering `CAVE` shows "Nice! 🎉" and clears the answer
- Entering `ZZZZZ` shows "Not in word list" and clears the answer

- [ ] **Step 5: Commit**

```bash
git add src/index.ts
git commit -m "feat: index.ts derives letters and puzzle from ALCOVES_PUZZLE"
```

---

## Self-Review

**Spec coverage:**
- ✅ `src/puzzle.ts` with `Puzzle` interface and `ALCOVES_PUZZLE` — Task 1
- ✅ `puzzle: Puzzle` on `GameState` — Task 2
- ✅ `createScene(container, puzzle)` — Task 3
- ✅ `InteractionHandlerSystem.enterWord` reads `state.puzzle.validWords` — Task 4
- ✅ `index.ts` derives letters from puzzle — Task 5
- ✅ `OAVES` removed — Task 1 (not included in `ALCOVES_PUZZLE.validWords`)
- ✅ `mockPuzzle` fixture + 3 `enterWord` tests — Task 4

**Placeholder scan:** No TBD/TODO/similar patterns present.

**Type consistency:**
- `Puzzle` defined in Task 1 (`src/puzzle.ts`), imported in Tasks 2, 3, 4, 5 — consistent
- `createScene(container: HTMLElement, puzzle: Puzzle): GameState` — consistent across Task 3 and Task 5 call site
- `state.puzzle.validWords.includes(word)` — `validWords` is `string[]` in the interface; `Array.prototype.includes` is correct ✅
- `makeState` in spec returns `{ tiles, answer, puzzle: mockPuzzle }` — matches `GameState` shape ✅
