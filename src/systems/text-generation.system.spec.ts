import { expect } from 'vitest';
import { TextGenerationSystem } from './text-generation.system';

// Access the private static method for testing via type cast
const shuffleWord: (word: string) => string =
  (TextGenerationSystem as any).shuffleWord;

describe('TextGenerationSystem', () => {
  describe('shuffleWord', () => {
    it('returns a string of the same length as the input', () => {
      const word = 'ALCOVES';
      expect(shuffleWord(word)).to.have.length(word.length);
    });

    it('contains exactly the same characters as the input', () => {
      const word = 'ALCOVES';
      const shuffled = shuffleWord(word);
      expect(shuffled.split('').sort()).to.deep.equal(word.split('').sort());
    });

    it('returns an empty string when given an empty string', () => {
      expect(shuffleWord('')).to.equal('');
    });

    it('returns the same single character when given a one-character string', () => {
      expect(shuffleWord('A')).to.equal('A');
    });

    it('returns only the input characters (no extras or dropped characters)', () => {
      const word = 'ABCDEF';
      const shuffled = shuffleWord(word);
      for (const ch of word) {
        expect(shuffled).to.include(ch);
      }
    });

    it('handles duplicate characters correctly', () => {
      const word = 'AABBCC';
      const shuffled = shuffleWord(word);
      expect(shuffled.split('').sort()).to.deep.equal(word.split('').sort());
    });

    it('produces a result that is a permutation of the original over many runs', () => {
      const word = 'SPELLING';
      for (let i = 0; i < 20; i++) {
        const shuffled = shuffleWord(word);
        expect(shuffled.split('').sort()).to.deep.equal(word.split('').sort());
      }
    });
  });
});
