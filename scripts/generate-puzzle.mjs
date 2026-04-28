#!/usr/bin/env node
/**
 * Spelling Bee puzzle generator
 *
 * Downloads the public-domain enable1 word list on first run and caches it
 * locally at scripts/wordlist.txt (gitignored).
 *
 * Usage:
 *   # Generate puzzle for a specific hive:
 *   node scripts/generate-puzzle.mjs --center F --letters L,O,W,E,R,S
 *
 *   # Auto-find a good puzzle (random each run):
 *   node scripts/generate-puzzle.mjs --auto
 *
 *   # Append the result directly to src/puzzles.json:
 *   node scripts/generate-puzzle.mjs --center F --letters L,O,W,E,R,S --append
 *
 * Options:
 *   --center   LETTER        Center (required) letter, uppercase
 *   --letters  A,B,C,D,E,F  Six outer letters, comma-separated, uppercase
 *   --auto                   Find a random valid hive automatically
 *   --min-words N            Minimum valid word count (default 20)
 *   --min-pangrams N         Minimum pangram count (default 1)
 *   --append                 Append puzzle to src/puzzles.json instead of stdout
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { createWriteStream } from 'fs';
import { get as httpsGet } from 'https';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORDLIST_PATH = join(__dirname, 'wordlist.txt');
const PUZZLES_PATH = join(__dirname, '../src/puzzles.json');

// enable1 — public domain, ~172 k words, all lowercase
const WORDLIST_URL =
  'https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt';

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : null;
};

const autoMode = flag('--auto');
const centerArg = option('--center')?.toUpperCase() ?? null;
const lettersArg = option('--letters')
  ?.toUpperCase()
  .split(',')
  .map((s) => s.trim()) ?? null;
const minWords = parseInt(option('--min-words') ?? '20', 10);
const minPangrams = parseInt(option('--min-pangrams') ?? '1', 10);
const appendMode = flag('--append');

if (!autoMode && (!centerArg || !lettersArg)) {
  console.error(
    'Usage: node scripts/generate-puzzle.mjs --center F --letters L,O,W,E,R,S\n' +
      '   or: node scripts/generate-puzzle.mjs --auto',
  );
  process.exit(1);
}

if (!autoMode && lettersArg.length !== 6) {
  console.error('--letters must be exactly 6 comma-separated letters');
  process.exit(1);
}

// ── Word list ─────────────────────────────────────────────────────────────────

function downloadWordlist() {
  return new Promise((resolve, reject) => {
    console.error(`Downloading word list from ${WORDLIST_URL} …`);
    mkdirSync(__dirname, { recursive: true });
    const file = createWriteStream(WORDLIST_PATH);
    httpsGet(WORDLIST_URL, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.error('Word list saved to scripts/wordlist.txt');
        resolve();
      });
    }).on('error', reject);
  });
}

async function loadWords() {
  if (!existsSync(WORDLIST_PATH)) await downloadWordlist();
  const raw = readFileSync(WORDLIST_PATH, 'utf8');
  // Filter: 4+ letters, only A-Z (no proper nouns / hyphens after uppercasing)
  return raw
    .split('\n')
    .map((w) => w.trim().toUpperCase())
    .filter((w) => w.length >= 4 && /^[A-Z]+$/.test(w));
}

// ── Puzzle logic ──────────────────────────────────────────────────────────────

function buildPuzzle(center, outerLetters, words) {
  const hive = new Set([center, ...outerLetters]);
  const validWords = words.filter(
    (w) => w.includes(center) && [...w].every((c) => hive.has(c)),
  );
  const pangramSet = new Set(
    validWords.filter((w) => [...hive].every((c) => w.includes(c))),
  );
  return {
    centerLetter: center,
    outerLetters,
    validWords,
    pangrams: [...pangramSet],
  };
}

function score(puzzle) {
  return puzzle.validWords.length * 2 + puzzle.pangrams.length * 10;
}

// ── Auto mode: find a good random hive ───────────────────────────────────────

function findGoodPuzzle(words) {
  // Common letters that tend to produce rich puzzles
  const common = 'RSTLNEAIOCDGMPUBHFYWKVXZQJ'.split('');

  // Shuffle so each run is different
  for (let i = common.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [common[i], common[j]] = [common[j], common[i]];
  }

  let best = null;
  let attempts = 0;
  const maxAttempts = 500;

  for (let ci = 0; ci < common.length && attempts < maxAttempts; ci++) {
    const center = common[ci];
    // Try several random outer-letter sets for this center
    const pool = common.filter((c) => c !== center);
    for (let t = 0; t < 30 && attempts < maxAttempts; t++) {
      attempts++;
      // Pick 6 random outer letters from pool
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const outer = shuffled.slice(0, 6);
      const puzzle = buildPuzzle(center, outer, words);
      if (
        puzzle.validWords.length >= minWords &&
        puzzle.pangrams.length >= minPangrams
      ) {
        if (!best || score(puzzle) > score(best)) {
          best = puzzle;
        }
      }
    }
  }

  return best;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const words = await loadWords();
console.error(`Loaded ${words.length.toLocaleString()} words.`);

let puzzle;
if (autoMode) {
  console.error(
    `Searching for a puzzle with ≥${minWords} words and ≥${minPangrams} pangram(s)…`,
  );
  puzzle = findGoodPuzzle(words);
  if (!puzzle) {
    console.error(
      'Could not find a qualifying puzzle. Try lowering --min-words.',
    );
    process.exit(1);
  }
  console.error(
    `Found: center=${puzzle.centerLetter} outer=${puzzle.outerLetters.join(',')} ` +
      `words=${puzzle.validWords.length} pangrams=${puzzle.pangrams.length}`,
  );
} else {
  puzzle = buildPuzzle(centerArg, lettersArg, words);
  console.error(
    `Generated: words=${puzzle.validWords.length} pangrams=${puzzle.pangrams.length}`,
  );
  if (puzzle.validWords.length < minWords) {
    console.error(
      `Warning: only ${puzzle.validWords.length} words (--min-words is ${minWords})`,
    );
  }
  if (puzzle.pangrams.length < minPangrams) {
    console.error(
      `Warning: only ${puzzle.pangrams.length} pangrams (--min-pangrams is ${minPangrams})`,
    );
  }
}

if (appendMode) {
  const puzzles = JSON.parse(readFileSync(PUZZLES_PATH, 'utf8'));
  puzzles.push(puzzle);
  writeFileSync(PUZZLES_PATH, JSON.stringify(puzzles, null, 2) + '\n');
  console.error(`Appended to src/puzzles.json (now ${puzzles.length} puzzles)`);
} else {
  console.log(JSON.stringify(puzzle, null, 2));
}
