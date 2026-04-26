# Spelling Bee — Project Guidelines

## Architecture

This project is a plain-TypeScript game with no external runtime dependencies.

- **State** lives in a single `GameState` object (`src/game-state.ts`) — a flat list of `HexTile` objects plus the current answer string
- **Systems** (`src/systems/`) are plain classes with static methods; no base class or framework is involved
- Rendering is done via HTML5 Canvas — `RenderSystem` owns the draw loop
- DOM interaction (buttons, answer display) is wired up directly in `src/index.ts`

### Key files
| File | Responsibility |
|---|---|
| `src/game-state.ts` | `HexTile` and `GameState` interfaces |
| `src/systems/scene-creator.system.ts` | `createScene()` — builds the initial `GameState` with honeycomb tile positions |
| `src/systems/text-generation.system.ts` | `TextGenerationSystem` — assigns/shuffles letters onto tiles |
| `src/systems/interactionListenerSystem.ts` | `InteractionListenerSystem` — canvas click/touch → marks tiles as clicked |
| `src/systems/interactionHandlerSystem.ts` | `InteractionHandlerSystem` — processes tile clicks, delete/scramble/enter logic |
| `src/systems/render.system.ts` | `RenderSystem` — draws tiles + text each frame, syncs answer to DOM |
| `src/index.ts` | Game loop, wires all systems together |

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
- Private static methods on systems are the preferred home for pure logic (e.g., `shuffleWord`, `insidePolygon`) so they can be unit-tested without instantiating the full system
