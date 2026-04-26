# Spelling Bee — Project Guidelines

## Architecture

This project uses an **Entity Component System (ECS)** architecture via [`@mesa-engine/core`](https://www.npmjs.com/package/@mesa-engine/core).

- **Entities** are plain containers; all data lives in **Components** (`src/components/`)
- **Systems** (`src/systems/`) hold all logic and operate on families of entities each `update()` tick
- **Blueprints** (`src/blueprints/`) are factory templates that pre-wire components onto a new entity
- Rendering is done via HTML5 Canvas — `RenderSystem` owns the draw loop
- DOM interaction (buttons, answer display) is handled through `HtmlElementComponent` and direct `getElementById` calls in systems

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
