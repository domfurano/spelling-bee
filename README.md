# Spelling Bee 🐝

A browser-based word puzzle game inspired by the classic Spelling Bee format. Build as many words as you can using the 7 letters arranged in a honeycomb — but every word must include the center letter!

## Game Overview

The board consists of seven hexagonal tiles arranged in a honeycomb pattern. Six letters surround a golden center tile. Your goal is to find words that:

- Use **only** the seven available letters
- **Always include** the center (golden) letter
- Are at least **4 letters** long

### Controls

| Button | Action |
|--------|--------|
| Click a hexagon | Add that letter to your current word |
| **Delete** | Remove the last letter from your current word |
| **Scramble** | Shuffle the outer letters for a fresh perspective |
| **Enter** | Submit your current word |

## Screenshots

![Spelling Bee Game Board](docs/screenshot.png)

*Seven letters arranged in a honeycomb — click to build words!*

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Rendering | HTML5 Canvas |
| Game Engine | [@mesa-engine/core](https://www.npmjs.com/package/@mesa-engine/core) (Entity Component System) |
| Bundler | [Parcel](https://parceljs.org/) |
| Testing | [Mocha](https://mochajs.org/) + [Chai](https://www.chaijs.com/) + [Sinon](https://sinonjs.org/) |

## Prerequisites

- [Node.js](https://nodejs.org/) v14 or higher
- npm (included with Node.js)

## Installation

```bash
# Clone the repository
git clone https://github.com/domfurano/spelling-bee.git
cd spelling-bee

# Install dependencies
npm install
```

## Running Locally

The pre-built game is available in the `dist/` directory. Serve it with any static file server:

```bash
# Using npx serve
npx serve dist

# Using Python's built-in server
python3 -m http.server --directory dist 8080

# Using http-server (npm)
npx http-server dist
```

Then open your browser and navigate to `http://localhost:3000` (or whichever port your server uses).

### Build from Source

To rebuild the project from source using Parcel:

```bash
# Install Parcel globally (if not already installed)
npm install -g parcel

# Build for production
parcel build src/index.html --out-dir dist

# Or run a development server with hot reload
parcel src/index.html
```

## Running Tests

```bash
npm test
```

## Project Structure

```
spelling-bee/
├── src/
│   ├── blueprints/          # Entity blueprints (hexagon, button, candidate answer)
│   ├── components/          # ECS components (position, render, text, input, …)
│   ├── model/               # Data models (Point)
│   ├── systems/             # ECS systems (render, interaction, scene creation, …)
│   ├── index.html           # HTML entry point
│   ├── index.ts             # Application bootstrap
│   └── styles.css           # Global styles
├── dist/                    # Pre-built production output
├── test/                    # Unit tests
└── package.json
```

## License

See [LICENSE](LICENSE).

