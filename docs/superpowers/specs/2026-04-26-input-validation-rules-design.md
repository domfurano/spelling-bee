# Input Validation Rules — Design Spec

**Date:** 2026-04-26  
**Roadmap step:** 2 — Input validation rules  
**Status:** Awaiting approval

---

## Context

`InteractionHandlerSystem.enterWord` currently has two checks:

1. Word length < 4 → "Too short!" + shake
2. `state.puzzle.validWords.includes(word)` → "Nice! 🎉" or "Not in word list" + shake

The NYT game enforces three additional checks *before* the word-list lookup, and tracks which words have already been found this session. None of these are currently implemented.

---

## Decisions

- **Check order:** letters → center → already found → word list (matches NYT)
- **Structure:** all checks inline inside `enterWord` (Option A — no extracted helpers)
- **Shake on all failures:** yes — all error paths trigger `triggerShakeAnimation()`, matching NYT behaviour
- **`foundWords` location:** `GameState` field (consistent with `puzzle`, `answer`)

---

## State Changes

### `src/game-state.ts`

Add `foundWords: Set<string>` to `GameState`:

```typescript
export interface GameState {
  tiles: HexTile[];
  answer: string;
  puzzle: Puzzle;
  foundWords: Set<string>;
}
```

### `src/systems/scene-creator.system.ts`

Initialise `foundWords` in the returned state:

```typescript
return { tiles, answer: '', puzzle, foundWords: new Set() };
```

---

## `enterWord` Logic

Complete updated check sequence (inline, in order):

```
1. word.length < 4
   → "Too short!" + shake + return (answer NOT cleared — existing behaviour preserved)

2. word contains a letter not in hive letters
   hive = new Set([puzzle.centerLetter, ...puzzle.outerLetters])
   → "Not in the list" + shake + clear answer + return

3. word does not include puzzle.centerLetter
   → "Missing center letter" + shake + clear answer + return

4. foundWords.has(word)
   → "Already found!" + shake + clear answer + return

5. puzzle.validWords.includes(word)
   → "Nice! 🎉" + add to foundWords + clear answer

6. else
   → "Not in word list" + shake + clear answer
```

**Note on step 1:** "Too short" currently does not clear the answer (early return before `state.answer = ''`). This is preserved — the player can keep typing.

**Note on step 2 message:** The roadmap spec says `"Not in the list"` for bad-letter words. This is distinct from the existing `"Not in word list"` message used for step 6. Both are kept as-is.

---

## File-by-file changes

| File | Change |
|------|--------|
| `src/game-state.ts` | Add `foundWords: Set<string>` to `GameState` |
| `src/systems/scene-creator.system.ts` | Add `foundWords: new Set()` to returned state |
| `src/systems/interactionHandlerSystem.ts` | Add 3 new checks inline in `enterWord`; add to `foundWords` on success |
| `src/systems/interactionHandlerSystem.spec.ts` | Add tests for all 3 new checks + foundWords tracking |

`src/index.ts` — no changes needed. It calls `enterWord(state)` which already has the full state object.

---

## Test Plan (TDD — failing tests first)

All new tests go in `interactionHandlerSystem.spec.ts`. `makeState` already provides `mockPuzzle`; it needs `foundWords` added.

### Update `makeState`

```typescript
function makeState(answer: string, ...tiles: HexTile[]): GameState {
  return { tiles, answer, puzzle: mockPuzzle, foundWords: new Set() };
}
```

### New test cases

**Bad letter check:**
- Word with a letter not in the hive (e.g. `'CATZ'`) → `state.answer` is cleared
- Word with a letter not in the hive → does not add to `foundWords`

**Missing center letter check:**
- Word using only outer letters (e.g. `'SLAVE'`) → `state.answer` is cleared
- Word using only outer letters → does not add to `foundWords`

**Already found check:**
- Valid word entered twice → second call leaves `state.answer` cleared
- Valid word entered twice → `foundWords` has exactly one entry

**foundWords tracking:**
- Valid word entered → `foundWords.has('CAVE')` is true after `enterWord`
- Invalid word entered → `foundWords` remains empty

---

## What does NOT change

| Item | Reason |
|------|--------|
| "Too short" behaviour | Still early-returns without clearing answer |
| `triggerLetterAddedAnimation` | No change |
| `scramble`, `deleteLastLetter` | No puzzle/foundWords dependency |
| `src/index.ts` | No new wiring needed |
| UI / CSS / HTML | No visual changes in this step |
