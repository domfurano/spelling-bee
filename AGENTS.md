# Spelling Bee — Project Guidelines

## Architecture

This project is a plain-TypeScript game with no external runtime dependencies.

- **State** lives in a single `GameState` object (`src/game-state.ts`) — a flat list of `HexTile` objects plus the current answer string
- **Systems** (`src/systems/`) are plain classes with static methods; no base class or framework is involved
- Rendering is pure HTML/CSS — each tile is a `<button class="hex-tile">` shaped by `clip-path: polygon(...)`, positioned absolutely inside `<div id="honeycomb">`
- There is **no `requestAnimationFrame` loop** — all updates happen in response to DOM events
- DOM interaction (buttons, answer display) is wired up directly in `src/index.ts`

### Key files
| File | Responsibility |
|---|---|
| `src/game-state.ts` | `HexTile` and `GameState` interfaces |
| `src/systems/scene-creator.system.ts` | `createScene(container)` — creates 7 `<button>` elements in the container and returns the `GameState` |
| `src/systems/text-generation.system.ts` | `TextGenerationSystem` — assigns/shuffles letters onto tiles; syncs `element.textContent` |
| `src/systems/interactionHandlerSystem.ts` | `InteractionHandlerSystem` — delete/scramble/enter logic, DOM feedback animations |
| `src/index.ts` | Wires tile click handlers and control buttons; no game loop |

## Build and Test

```bash
npm run dev       # start dev server (Vite, port 3000)
npm run build     # production build → dist/
npm test -- --run # run all tests once (Vitest)
npm test          # run tests in watch mode
npm run lint      # ESLint
npm run format    # Prettier
```

## Conventions

- **TypeScript strict mode** is enabled — avoid `any` casts except in test helpers
- **`===`/`!==`** for all equality checks; never `==`/`!=`
- **`const`/`let`** only; never `var`
- Test files live alongside source as `*.spec.ts` and use **Vitest** (`import { expect, describe, it, beforeEach } from 'vitest'`)
- `tsconfig.json` targets `ESNext`/`bundler` module resolution (Vite project — not CommonJS)
- Private static methods on systems are the preferred home for pure logic (e.g., `shuffleWord`) so they can be unit-tested without instantiating the full system
