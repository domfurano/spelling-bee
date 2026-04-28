export interface Puzzle {
  readonly centerLetter: string;
  readonly outerLetters: readonly string[];
  readonly validWords: readonly string[];
  readonly pangrams: readonly string[];
}

export function assertValidPuzzle(puzzle: Puzzle): void {
  const singleUppercase = /^[A-Z]$/;

  if (!singleUppercase.test(puzzle.centerLetter)) {
    throw new Error(
      `Puzzle error: centerLetter must be a single uppercase letter, got "${puzzle.centerLetter}"`
    );
  }

  if (puzzle.outerLetters.length !== 6) {
    throw new Error(
      `Puzzle error: outerLetters must have exactly 6 entries, got ${puzzle.outerLetters.length}`
    );
  }
  for (const letter of puzzle.outerLetters) {
    if (!singleUppercase.test(letter)) {
      throw new Error(
        `Puzzle error: each outerLetter must be a single uppercase letter, got "${letter}"`
      );
    }
  }

  const hiveLetters = new Set([puzzle.centerLetter, ...puzzle.outerLetters]);

  for (const word of puzzle.validWords) {
    for (const ch of word) {
      if (!hiveLetters.has(ch)) {
        throw new Error(
          `Puzzle error: validWord "${word}" contains letter "${ch}" not in the hive`
        );
      }
    }
    if (!word.includes(puzzle.centerLetter)) {
      throw new Error(
        `Puzzle error: validWord "${word}" does not contain centerLetter "${puzzle.centerLetter}"`
      );
    }
  }

  const validWordSet = new Set(puzzle.validWords);
  for (const pangram of puzzle.pangrams) {
    if (!validWordSet.has(pangram)) {
      throw new Error(
        `Puzzle error: pangram "${pangram}" is not in validWords`
      );
    }
    for (const letter of hiveLetters) {
      if (!pangram.includes(letter)) {
        throw new Error(
          `Puzzle error: pangram "${pangram}" does not use every hive letter (missing "${letter}")`
        );
      }
    }
  }
}

export function getDailyPuzzle(puzzles: Puzzle[], date: Date): Puzzle {
  const epoch = Date.UTC(2025, 0, 1); // fixed epoch: 2025-01-01
  const dayMs = 24 * 60 * 60 * 1000;
  const today = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  const dayIndex = Math.floor((today - epoch) / dayMs);
  return puzzles[
    ((dayIndex % puzzles.length) + puzzles.length) % puzzles.length
  ];
}

export const ALCOVES_PUZZLE: Puzzle = {
  centerLetter: 'C',
  outerLetters: ['A', 'L', 'O', 'V', 'E', 'S'],
  validWords: [
    'ALCOVE',
    'ALCOVES',
    'CAVE',
    'CAVES',
    'COVE',
    'COVES',
    'CLOVE',
    'CLOVES',
    'LACE',
    'LACES',
    'SOLACE',
    'SCALE',
    'VOCAL',
    'VOCALS',
    'COLA',
    'COLAS',
    'COAL',
    'COALS',
    'CLOSE',
    'LOCAL',
    'LOCALE',
    'LOCALS',
    'COLES',
    'ACES',
    'LOCO',
  ],
  pangrams: ['ALCOVES'],
};
