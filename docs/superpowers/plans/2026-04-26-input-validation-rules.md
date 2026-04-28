# Input Validation Rules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three pre-lookup validation checks to `enterWord` and track found words in `GameState`, matching NYT Spelling Bee behaviour.

**Architecture:** `GameState` gains a `foundWords: Set<string>` field, initialised in `createScene`. `InteractionHandlerSystem.enterWord` gets three new inline checks (bad letters → missing center → already found) inserted before the existing word-list lookup. All error paths trigger the shake animation. On success, the word is added to `foundWords`.

**Tech Stack:** TypeScript (strict), Vite, Vitest (jsdom environment), ESLint/Prettier

---

## File Map

| Action | File | Change |
|--------|------|--------|
| Modify | `src/game-state.ts` | Add `foundWords: Set<string>` to `GameState` |
| Modify | `src/systems/scene-creator.system.ts` | Add `foundWords: new Set()` to returned state |
| Modify | `src/systems/interactionHandlerSystem.ts` | Add 3 inline checks + add to `foundWords` on success |
| Modify | `src/systems/interactionHandlerSystem.spec.ts` | Update `makeState`, add 8 new tests |

---

## Task 1: Add `foundWords` to `GameState` and `createScene`

**Files:**
- Modify: `src/game-state.ts`
- Modify: `src/systems/scene-creator.system.ts`

- [ ] **Step 1: Edit `src/game-state.ts`**

Replace the entire file with:

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
  foundWords: Set<string>;
}
```

- [ ] **Step 2: Edit `src/systems/scene-creator.system.ts`**

Replace only the return statement (last line of the function body):

Before:
```typescript
  return { tiles, answer: '', puzzle };
```

After:
```typescript
  return { tiles, answer: '', puzzle, foundWords: new Set() };
```

- [ ] **Step 3: Run tests to see expected failures**

```bash
npm test -- --run
```

Expected: `interactionHandlerSystem.spec.ts` will fail because `makeState` no longer returns a complete `GameState` (missing `foundWords`). All other test files should still pass. This is the expected red state — fixed in Task 2.

- [ ] **Step 4: Commit**

```bash
git add src/game-state.ts src/systems/scene-creator.system.ts
git commit -m "feat: add foundWords to GameState, initialise in createScene"
```

---

## Task 2: Update spec fixture and add new failing tests

**Files:**
- Modify: `src/systems/interactionHandlerSystem.spec.ts`

- [ ] **Step 1: Update `makeState` and add new tests**

Replace this block at the top of the file:

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
  return { tiles, answer, puzzle: mockPuzzle, foundWords: new Set() };
}
```

Then add this new `describe` block at the end of the outer `describe('InteractionHandlerSystem', ...)` block, before the closing `}`:

```typescript
  describe('enterWord — new validation checks', () => {
    it('clears the answer when the word contains a letter not in the hive', () => {
      const state = makeState('CATZ');
      InteractionHandlerSystem.enterWord(state);
      expect(state.answer).toBe('');
    });

    it('does not add to foundWords when the word contains a letter not in the hive', () => {
      const state = makeState('CATZ');
      InteractionHandlerSystem.enterWord(state);
      expect(state.foundWords.size).toBe(0);
    });

    it('clears the answer when the word is missing the center letter', () => {
      const state = makeState('SLAVE');
      InteractionHandlerSystem.enterWord(state);
      expect(state.answer).toBe('');
    });

    it('does not add to foundWords when the word is missing the center letter', () => {
      const state = makeState('SLAVE');
      InteractionHandlerSystem.enterWord(state);
      expect(state.foundWords.size).toBe(0);
    });

    it('clears the answer when the word was already found', () => {
      const state = makeState('CAVE');
      InteractionHandlerSystem.enterWord(state);   // first — succeeds
      state.answer = 'CAVE';
      InteractionHandlerSystem.enterWord(state);   // second — already found
      expect(state.answer).toBe('');
    });

    it('does not add a duplicate to foundWords when the word was already found', () => {
      const state = makeState('CAVE');
      InteractionHandlerSystem.enterWord(state);   // first — succeeds
      state.answer = 'CAVE';
      InteractionHandlerSystem.enterWord(state);   // second — already found
      expect(state.foundWords.size).toBe(1);
    });

    it('adds a valid word to foundWords on success', () => {
      const state = makeState('CAVE');
      InteractionHandlerSystem.enterWord(state);
      expect(state.foundWords.has('CAVE')).toBe(true);
    });

    it('does not add an invalid word to foundWords', () => {
      const state = makeState('ZZZZ');
      InteractionHandlerSystem.enterWord(state);
      expect(state.foundWords.size).toBe(0);
    });
  });
```

- [ ] **Step 2: Run tests to verify new tests fail**

```bash
npm test -- --run src/systems/interactionHandlerSystem.spec.ts
```

Expected: the 8 new tests in `enterWord — new validation checks` fail (checks not yet implemented). The existing tests should now pass (fixture is fixed).

- [ ] **Step 3: Commit the failing tests**

```bash
git add src/systems/interactionHandlerSystem.spec.ts
git commit -m "test: add failing tests for input validation rules and foundWords"
```

---

## Task 3: Implement the three validation checks in `enterWord`

**Files:**
- Modify: `src/systems/interactionHandlerSystem.ts`

- [ ] **Step 1: Replace `enterWord` in `src/systems/interactionHandlerSystem.ts`**

Find and replace the entire `enterWord` method:

Before:
```typescript
  static enterWord(state: GameState): void {
    const word = state.answer.toUpperCase();
    if (word.length < 4) {
      InteractionHandlerSystem.showMessage('Too short!', false);
      InteractionHandlerSystem.triggerShakeAnimation();
      return;
    }
    if (state.puzzle.validWords.includes(word)) {
      InteractionHandlerSystem.showMessage('Nice! 🎉', true);
    } else {
      InteractionHandlerSystem.showMessage('Not in word list', false);
      InteractionHandlerSystem.triggerShakeAnimation();
    }
    state.answer = '';
  }
```

After:
```typescript
  static enterWord(state: GameState): void {
    const word = state.answer.toUpperCase();

    if (word.length < 4) {
      InteractionHandlerSystem.showMessage('Too short!', false);
      InteractionHandlerSystem.triggerShakeAnimation();
      return;
    }

    const hiveLetters = new Set([
      state.puzzle.centerLetter,
      ...state.puzzle.outerLetters,
    ]);

    if ([...word].some((ch) => !hiveLetters.has(ch))) {
      InteractionHandlerSystem.showMessage('Not in the list', false);
      InteractionHandlerSystem.triggerShakeAnimation();
      state.answer = '';
      return;
    }

    if (!word.includes(state.puzzle.centerLetter)) {
      InteractionHandlerSystem.showMessage('Missing center letter', false);
      InteractionHandlerSystem.triggerShakeAnimation();
      state.answer = '';
      return;
    }

    if (state.foundWords.has(word)) {
      InteractionHandlerSystem.showMessage('Already found!', false);
      InteractionHandlerSystem.triggerShakeAnimation();
      state.answer = '';
      return;
    }

    if (state.puzzle.validWords.includes(word)) {
      InteractionHandlerSystem.showMessage('Nice! 🎉', true);
      state.foundWords.add(word);
    } else {
      InteractionHandlerSystem.showMessage('Not in word list', false);
      InteractionHandlerSystem.triggerShakeAnimation();
    }
    state.answer = '';
  }
```

- [ ] **Step 2: Run all tests**

```bash
npm test -- --run
```

Expected: all 31 tests pass (23 existing + 8 new).

- [ ] **Step 3: Build to verify no TypeScript errors**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/systems/interactionHandlerSystem.ts
git commit -m "feat: add bad-letter, missing-center, and already-found checks to enterWord"
```

---

## Self-Review

**Spec coverage:**
- ✅ `foundWords: Set<string>` added to `GameState` — Task 1
- ✅ `foundWords` initialised in `createScene` — Task 1
- ✅ Bad-letter check ("Not in the list") + shake — Task 3
- ✅ Missing center check ("Missing center letter") + shake — Task 3
- ✅ Already-found check ("Already found!") + shake — Task 3
- ✅ Check order: letters → center → already found → word list — Task 3
- ✅ "Too short" behaviour unchanged (no answer clear, early return) — Task 3
- ✅ Valid word added to `foundWords` — Task 3
- ✅ All 8 new tests with correct fixture — Task 2

**Placeholder scan:** None found.

**Type consistency:**
- `foundWords: Set<string>` defined in Task 1, used in Tasks 2 and 3 — consistent ✅
- `state.foundWords.has(word)` / `state.foundWords.add(word)` — correct `Set` methods ✅
- `[...word].some((ch) => !hiveLetters.has(ch))` — spread string to `string[]`, `hiveLetters` is `Set<string>` — consistent ✅
- `makeState` returns `{ ..., foundWords: new Set() }` matching `GameState` shape ✅
