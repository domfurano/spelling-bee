import { expect, describe, it } from 'vitest';
import { ALCOVES_PUZZLE } from './puzzle';

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
    expect(ALCOVES_PUZZLE.outerLetters).not.toContain(ALCOVES_PUZZLE.centerLetter);
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
});
