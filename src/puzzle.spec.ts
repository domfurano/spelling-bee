import { expect, describe, it } from 'vitest';
import {
  ALCOVES_PUZZLE,
  getDailyPuzzle,
  assertValidPuzzle,
  Puzzle,
} from './puzzle';

describe('ALCOVES_PUZZLE', () => {
  it('has a single uppercase centerLetter', () => {
    expect(ALCOVES_PUZZLE.centerLetter).toMatch(/^[A-Z]$/);
  });

  it('has exactly 6 outerLetters, all uppercase', () => {
    expect(ALCOVES_PUZZLE.outerLetters).toHaveLength(6);
    for (const l of ALCOVES_PUZZLE.outerLetters) {
      expect(l).toMatch(/^[A-Z]$/);
    }
  });

  it('centerLetter is not in outerLetters', () => {
    expect(ALCOVES_PUZZLE.outerLetters).not.toContain(
      ALCOVES_PUZZLE.centerLetter
    );
  });

  it('pangrams are a subset of validWords', () => {
    const wordSet = new Set(ALCOVES_PUZZLE.validWords);
    for (const p of ALCOVES_PUZZLE.pangrams) {
      expect(wordSet.has(p)).toBe(true);
    }
  });

  it('ALCOVES is the only pangram', () => {
    expect(ALCOVES_PUZZLE.pangrams).toEqual(['ALCOVES']);
  });

  it('all validWords contain centerLetter', () => {
    for (const word of ALCOVES_PUZZLE.validWords) {
      expect(word).toContain(ALCOVES_PUZZLE.centerLetter);
    }
  });

  it('all validWords use only puzzle letters', () => {
    const allowed = new Set([
      ALCOVES_PUZZLE.centerLetter,
      ...ALCOVES_PUZZLE.outerLetters,
    ]);
    for (const word of ALCOVES_PUZZLE.validWords) {
      for (const ch of word) {
        expect(allowed.has(ch)).toBe(true);
      }
    }
  });
});

describe('getDailyPuzzle', () => {
  const puzzleA: Puzzle = {
    centerLetter: 'A',
    outerLetters: ['B', 'C', 'D', 'E', 'F', 'G'],
    validWords: ['ABCDE'],
    pangrams: [],
  };
  const puzzleB: Puzzle = {
    centerLetter: 'B',
    outerLetters: ['A', 'C', 'D', 'E', 'F', 'G'],
    validWords: ['BACDE'],
    pangrams: [],
  };
  const puzzleC: Puzzle = {
    centerLetter: 'C',
    outerLetters: ['A', 'B', 'D', 'E', 'F', 'G'],
    validWords: ['CABDE'],
    pangrams: [],
  };
  const puzzles = [puzzleA, puzzleB, puzzleC];

  it('returns the first puzzle on the epoch date', () => {
    // epoch is 2025-01-01 → dayIndex 0 → index 0
    expect(getDailyPuzzle(puzzles, new Date('2025-01-01'))).toBe(puzzleA);
  });

  it('returns the second puzzle on the second day', () => {
    expect(getDailyPuzzle(puzzles, new Date('2025-01-02'))).toBe(puzzleB);
  });

  it('wraps around after the last puzzle', () => {
    // day 3 → index 3 % 3 = 0 → puzzleA
    expect(getDailyPuzzle(puzzles, new Date('2025-01-04'))).toBe(puzzleA);
  });

  it('returns a consistent puzzle for the same date', () => {
    const d = new Date('2025-06-15');
    expect(getDailyPuzzle(puzzles, d)).toBe(getDailyPuzzle(puzzles, d));
  });
});

describe('assertValidPuzzle', () => {
  const valid: Puzzle = {
    centerLetter: 'C',
    outerLetters: ['A', 'L', 'O', 'V', 'E', 'S'],
    validWords: ['CAVE', 'ALCOVES'],
    pangrams: ['ALCOVES'],
  };

  it('does not throw for a well-formed puzzle', () => {
    expect(() => assertValidPuzzle(valid)).not.toThrow();
  });

  it('throws when centerLetter is more than one character', () => {
    expect(() => assertValidPuzzle({ ...valid, centerLetter: 'CA' })).toThrow(
      'centerLetter'
    );
  });

  it('throws when centerLetter is lowercase', () => {
    expect(() => assertValidPuzzle({ ...valid, centerLetter: 'c' })).toThrow(
      'centerLetter'
    );
  });

  it('throws when outerLetters has fewer than 6 entries', () => {
    expect(() =>
      assertValidPuzzle({ ...valid, outerLetters: ['A', 'L', 'O', 'V', 'E'] })
    ).toThrow('outerLetters');
  });

  it('throws when outerLetters has more than 6 entries', () => {
    expect(() =>
      assertValidPuzzle({
        ...valid,
        outerLetters: ['A', 'L', 'O', 'V', 'E', 'S', 'X'],
      })
    ).toThrow('outerLetters');
  });

  it('throws when an outerLetter is lowercase', () => {
    expect(() =>
      assertValidPuzzle({
        ...valid,
        outerLetters: ['a', 'L', 'O', 'V', 'E', 'S'],
      })
    ).toThrow('outerLetter');
  });

  it('throws when a validWord contains a letter not in the hive', () => {
    expect(() =>
      assertValidPuzzle({ ...valid, validWords: ['CAVEZ'] })
    ).toThrow('contains letter');
  });

  it('throws when a validWord does not contain the center letter', () => {
    expect(() =>
      assertValidPuzzle({ ...valid, validWords: ['SLAVE'] })
    ).toThrow('centerLetter');
  });

  it('throws when a pangram is not in validWords', () => {
    expect(() =>
      assertValidPuzzle({ ...valid, pangrams: ['ALCOVES', 'NOTAWORD'] })
    ).toThrow('not in validWords');
  });

  it('throws when a pangram does not use every hive letter', () => {
    // CAVE uses C,A,V,E but is missing L,O,S
    expect(() =>
      assertValidPuzzle({ ...valid, validWords: ['CAVE'], pangrams: ['CAVE'] })
    ).toThrow('missing');
  });
});
