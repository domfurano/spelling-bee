#!/usr/bin/env node
/**
 * Regenerates all puzzles in src/puzzles.json using the same hives
 * but the authoritative enable1 word list.
 */
import { readFileSync, writeFileSync } from 'fs';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORDLIST_PATH = join(__dirname, 'wordlist.txt');
const PUZZLES_PATH = join(__dirname, '../src/puzzles.json');

if (!existsSync(WORDLIST_PATH)) {
  console.error('Word list not found. Run: npm run puzzle:generate -- --auto');
  process.exit(1);
}

const words = readFileSync(WORDLIST_PATH, 'utf8')
  .split('\n')
  .map((w) => w.trim().toUpperCase())
  .filter((w) => w.length >= 4 && /^[A-Z]+$/.test(w));

console.error(`Loaded ${words.length.toLocaleString()} words.`);

const puzzles = JSON.parse(readFileSync(PUZZLES_PATH, 'utf8'));

const updated = puzzles.map((p, i) => {
  const hive = new Set([p.centerLetter, ...p.outerLetters]);
  const validWords = words.filter(
    (w) => w.includes(p.centerLetter) && [...w].every((c) => hive.has(c)),
  );
  const pangrams = validWords.filter((w) =>
    [...hive].every((c) => w.includes(c)),
  );
  console.error(
    `Puzzle ${i} (${p.centerLetter}): ${p.validWords.length} → ${validWords.length} words, ` +
      `${p.pangrams.length} → ${pangrams.length} pangrams`,
  );
  return { centerLetter: p.centerLetter, outerLetters: p.outerLetters, validWords, pangrams };
});

writeFileSync(PUZZLES_PATH, JSON.stringify(updated, null, 2) + '\n');
console.error('Done.');
