# Keyboard Input Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow typing letters, Backspace, and Enter from the keyboard — matching NYT Spelling Bee behaviour. Only hive letters are accepted (case-insensitive). All interaction logic is delegated to `InteractionHandlerSystem`; no logic is duplicated between keyboard and click paths.

**Architecture:** A new static `handleKeydown(e, state, answerEl)` method is added to `InteractionHandlerSystem`. It filters to hive letters / Backspace / Enter and delegates to existing methods. `src/index.ts` wires a single `document.addEventListener('keydown', ...)` call. Tests for `handleKeydown` are added to `interactionHandlerSystem.spec.ts`.

**Tech Stack:** TypeScript (strict), Vite, Vitest (jsdom environment), ESLint/Prettier

---

## File Map

| Action | File | Change |
|--------|------|--------|
| Modify | `src/systems/interactionHandlerSystem.ts` | Add `static handleKeydown(...)` method |
| Modify | `src/systems/interactionHandlerSystem.spec.ts` | Add tests for `handleKeydown` |
| Modify | `src/index.ts` | Add `document.addEventListener('keydown', ...)` |

---

## Task 1: Add failing tests for `handleKeydown`

**Files:**
- Modify: `src/systems/interactionHandlerSystem.spec.ts`

- [ ] **Step 1: Add `handleKeydown` test suite**

At the end of the `describe('InteractionHandlerSystem', ...)` block (before the closing `}`), add:

```typescript
  describe('handleKeydown', () => {
    function makeAnswerEl(): HTMLElement {
      return document.createElement('span');
    }

    it('appends an uppercase hive letter when a matching key is pressed', () => {
      const state = makeState('');
      const answerEl = makeAnswerEl();
      InteractionHandlerSystem.handleKeydown(
        new KeyboardEvent('keydown', { key: 'a' }),
        state,
        answerEl,
      );
      expect(state.answer).toBe('A');
      expect(answerEl.innerText).toBe('A');
    });

    it('accepts uppercase hive letters too', () => {
      const state = makeState('');
      const answerEl = makeAnswerEl();
      InteractionHandlerSystem.handleKeydown(
        new KeyboardEvent('keydown', { key: 'C' }),
        state,
        answerEl,
      );
      expect(state.answer).toBe('C');
    });

    it('does not append a non-hive letter', () => {
      const state = makeState('');
      const answerEl = makeAnswerEl();
      InteractionHandlerSystem.handleKeydown(
        new KeyboardEvent('keydown', { key: 'z' }),
        state,
        answerEl,
      );
      expect(state.answer).toBe('');
    });

    it('does not append a non-letter key (digit)', () => {
      const state = makeState('');
      const answerEl = makeAnswerEl();
      InteractionHandlerSystem.handleKeydown(
        new KeyboardEvent('keydown', { key: '1' }),
        state,
        answerEl,
      );
      expect(state.answer).toBe('');
    });

    it('Backspace removes the last letter', () => {
      const state = makeState('CA');
      const answerEl = makeAnswerEl();
      answerEl.innerText = 'CA';
      InteractionHandlerSystem.handleKeydown(
        new KeyboardEvent('keydown', { key: 'Backspace' }),
        state,
        answerEl,
      );
      expect(state.answer).toBe('C');
      expect(answerEl.innerText).toBe('C');
    });

    it('Enter delegates to enterWord and updates answerEl', () => {
      const state = makeState('CAVE');
      const answerEl = makeAnswerEl();
      answerEl.innerText = 'CAVE';
      InteractionHandlerSystem.handleKeydown(
        new KeyboardEvent('keydown', { key: 'Enter' }),
        state,
        answerEl,
      );
      expect(state.answer).toBe('');
      expect(answerEl.innerText).toBe('');
    });
  });
```

- [ ] **Step 2: Run tests to verify new tests fail**

```bash
npm test -- --run
```

Expected: 6 failures from `handleKeydown` suite (method does not exist yet). All other tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/systems/interactionHandlerSystem.spec.ts
git commit -m "test: add failing tests for handleKeydown"
```

---

## Task 2: Implement `handleKeydown` on `InteractionHandlerSystem`

**Files:**
- Modify: `src/systems/interactionHandlerSystem.ts`

- [ ] **Step 1: Add the `handleKeydown` static method**

After the closing brace of `enterWord` (and before `private static messageTimeout`), add:

```typescript
  static handleKeydown(
    e: KeyboardEvent,
    state: GameState,
    answerEl: HTMLElement,
  ): void {
    const hiveLetters = new Set([
      state.puzzle.centerLetter,
      ...state.puzzle.outerLetters,
    ]);
    const upper = e.key.toUpperCase();

    if (e.key.length === 1 && hiveLetters.has(upper)) {
      state.answer += upper;
      answerEl.innerText = state.answer;
      InteractionHandlerSystem.triggerLetterAddedAnimation();
    } else if (e.key === 'Backspace') {
      InteractionHandlerSystem.deleteLastLetter(state);
      answerEl.innerText = state.answer;
    } else if (e.key === 'Enter') {
      InteractionHandlerSystem.enterWord(state);
      answerEl.innerText = state.answer;
    }
  }
```

- [ ] **Step 2: Run tests to verify all pass**

```bash
npm test -- --run
```

Expected: all tests pass, including the 6 new `handleKeydown` tests.

- [ ] **Step 3: Commit**

```bash
git add src/systems/interactionHandlerSystem.ts
git commit -m "feat: add handleKeydown to InteractionHandlerSystem"
```

---

## Task 3: Wire keyboard listener in `src/index.ts`

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Add the `keydown` listener**

After the existing `btnEnter` listener block, add:

```typescript
document.addEventListener('keydown', (e) => {
  InteractionHandlerSystem.handleKeydown(e, state, answerEl);
});
```

- [ ] **Step 2: Run tests and lint**

```bash
npm test -- --run && npm run lint
```

Expected: all tests pass, no lint errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: wire keydown listener for keyboard input"
```

---

## Task 4: Manual smoke test

- [ ] Run `npm run dev` and open the game in a browser
- [ ] Type a valid hive letter — it should appear in the answer display and animate
- [ ] Type a non-hive letter — nothing should happen
- [ ] Press Backspace — last letter removed
- [ ] Type a valid word (e.g. `CAVE`) and press Enter — "Nice! 🎉" message appears, answer clears
- [ ] Type a non-word and press Enter — shake animation and error message appear
