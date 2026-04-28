# Design: Step 3 — Keyboard Input

**Date:** 2026-04-26  
**Status:** Approved

---

## Overview

Allow typing letters, Backspace, and Enter directly from the keyboard — no tile click required. The feature must match NYT Spelling Bee behaviour exactly: only hive letters are accepted, letter animations fire on each accepted keystroke, and all submission/deletion logic is reused from the existing `InteractionHandlerSystem`.

---

## Approach

Add a static `handleKeydown` method to `InteractionHandlerSystem`. `src/index.ts` wires a single `keydown` listener that delegates entirely to this method. No logic is duplicated between keyboard and click paths.

---

## New Method: `InteractionHandlerSystem.handleKeydown`

```ts
static handleKeydown(
  e: KeyboardEvent,
  state: GameState,
  answerEl: HTMLElement
): void
```

### Dispatch table

| Key condition | Action |
|---|---|
| `e.key` is a single letter AND matches a hive letter (case-insensitive) | Append uppercase letter to `state.answer`, set `answerEl.innerText`, call `triggerLetterAddedAnimation()` |
| `e.key === 'Backspace'` | Call `deleteLastLetter(state)`, set `answerEl.innerText` |
| `e.key === 'Enter'` | Call `enterWord(state)`, set `answerEl.innerText` |
| Anything else | No-op |

### Hive letter check

```ts
const hiveLetters = new Set([
  state.puzzle.centerLetter,
  ...state.puzzle.outerLetters,
]);
const upper = e.key.toUpperCase();
if (e.key.length === 1 && hiveLetters.has(upper)) { ... }
```

---

## Wiring in `src/index.ts`

One line added after the existing button listeners:

```ts
document.addEventListener('keydown', (e) => {
  InteractionHandlerSystem.handleKeydown(e, state, answerEl);
});
```

No other changes to `index.ts`.

---

## Tests (`interactionHandlerSystem.spec.ts`)

| Scenario | Expected result |
|---|---|
| Hive letter (uppercase) pressed | Appended to `state.answer`; `answerEl.innerText` updated; animation triggered |
| Hive letter (lowercase) pressed | Same — letter stored as uppercase |
| Non-hive letter pressed | `state.answer` unchanged |
| Non-letter key (e.g. digit, space) pressed | `state.answer` unchanged |
| `Backspace` pressed | Delegates to `deleteLastLetter` |
| `Enter` pressed | Delegates to `enterWord` |

Animation triggering is verified via a spy on `InteractionHandlerSystem.triggerLetterAddedAnimation`.

---

## Files Changed

| File | Change |
|---|---|
| `src/systems/interactionHandlerSystem.ts` | Add `static handleKeydown(...)` method |
| `src/systems/interactionHandlerSystem.spec.ts` | Add tests for `handleKeydown` |
| `src/index.ts` | Add `document.addEventListener('keydown', ...)` |

---

## Out of Scope

- Modifier keys (Ctrl, Meta, Alt) — ignored; no special handling needed
- IME / composition events — not considered; NYT game does not support them
- Mobile virtual keyboards — no additional work; `keydown` fires on most mobile keyboards but is not the primary input path there (tiles remain available for mobile)
