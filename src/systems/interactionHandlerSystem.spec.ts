import { expect, describe, it } from 'vitest';
import { InteractionHandlerSystem } from './interactionHandlerSystem';
import { HexTile, GameState } from '../game-state';
import { Puzzle } from '../puzzle';

const mockPuzzle: Puzzle = {
  centerLetter: 'C',
  outerLetters: ['A', 'L', 'O', 'V', 'E', 'S'],
  validWords: ['CAVE', 'CLOVE', 'ALCOVE', 'ALCOVES'],
  pangrams: ['ALCOVES'],
};

function makeTile(letter: string, isCenter = false): HexTile {
  const element = document.createElement('button');
  element.textContent = letter;
  return { letter, isCenter, element };
}

function makeState(answer: string, ...tiles: HexTile[]): GameState {
  return { tiles, answer, puzzle: mockPuzzle, foundWords: new Set() };
}

describe('InteractionHandlerSystem', () => {
  describe('deleteLastLetter', () => {
    it('removes the last letter from the answer', () => {
      const state = makeState('ABC');
      InteractionHandlerSystem.deleteLastLetter(state);
      expect(state.answer).to.equal('AB');
    });

    it('does nothing when the answer is empty', () => {
      const state = makeState('');
      InteractionHandlerSystem.deleteLastLetter(state);
      expect(state.answer).to.equal('');
    });
  });

  describe('scramble', () => {
    it('keeps the center tile letter unchanged', () => {
      const tiles = [
        makeTile('C', true),
        makeTile('A'),
        makeTile('L'),
        makeTile('O'),
        makeTile('V'),
        makeTile('E'),
        makeTile('S'),
      ];
      InteractionHandlerSystem.scramble(tiles);
      expect(tiles[0].letter).to.equal('C');
    });

    it('preserves all outer letters after scramble', () => {
      const tiles = [
        makeTile('C', true),
        makeTile('A'),
        makeTile('L'),
        makeTile('O'),
        makeTile('V'),
        makeTile('E'),
        makeTile('S'),
      ];
      InteractionHandlerSystem.scramble(tiles);
      const result = tiles
        .slice(1)
        .map((t) => t.letter)
        .sort();
      expect(result).to.deep.equal(['A', 'E', 'L', 'O', 'S', 'V']);
    });

    it('syncs element textContent with letter after scramble', () => {
      const tiles = [
        makeTile('C', true),
        makeTile('A'),
        makeTile('L'),
        makeTile('O'),
        makeTile('V'),
        makeTile('E'),
        makeTile('S'),
      ];
      InteractionHandlerSystem.scramble(tiles);
      for (const tile of tiles.slice(1)) {
        expect(tile.element.textContent).to.equal(tile.letter);
      }
    });

    it('does nothing when there are fewer than two tiles', () => {
      const tiles = [makeTile('C', true)];
      expect(() => InteractionHandlerSystem.scramble(tiles)).not.toThrow();
    });
  });

  describe('enterWord', () => {
    it('clears the answer after a valid word', () => {
      const state = makeState('CAVE');
      InteractionHandlerSystem.enterWord(state);
      expect(state.answer).toBe('');
    });

    it('clears the answer after a word not in the list', () => {
      const state = makeState('ZZZZ');
      InteractionHandlerSystem.enterWord(state);
      expect(state.answer).toBe('');
    });

    it('does not clear the answer when the word is too short', () => {
      const state = makeState('CAV');
      InteractionHandlerSystem.enterWord(state);
      expect(state.answer).toBe('CAV');
    });
  });

  describe('enterWord — input validation', () => {
    it('clears the answer when the word contains a letter not in the hive', () => {
      const state = makeState('CATZ');
      InteractionHandlerSystem.enterWord(state);
      expect(state.answer).toBe('');
    });

    it('does not add to foundWords when the word contains a letter not in the hive', () => {
      const state = makeState('CATZ');
      InteractionHandlerSystem.enterWord(state);
      expect(state.foundWords.size).toBe(0);
    });

    it('clears the answer when the word is missing the center letter', () => {
      const state = makeState('SLAVE');
      InteractionHandlerSystem.enterWord(state);
      expect(state.answer).toBe('');
    });

    it('does not add to foundWords when the word is missing the center letter', () => {
      const state = makeState('SLAVE');
      InteractionHandlerSystem.enterWord(state);
      expect(state.foundWords.size).toBe(0);
    });

    it('clears the answer when the word was already found', () => {
      const state = makeState('CAVE');
      InteractionHandlerSystem.enterWord(state); // first — succeeds
      state.answer = 'CAVE';
      InteractionHandlerSystem.enterWord(state); // second — already found
      expect(state.answer).toBe('');
    });

    it('does not add a duplicate to foundWords when the word was already found', () => {
      const state = makeState('CAVE');
      InteractionHandlerSystem.enterWord(state); // first — succeeds
      state.answer = 'CAVE';
      InteractionHandlerSystem.enterWord(state); // second — already found
      expect(state.foundWords.size).toBe(1);
    });

    it('adds a valid word to foundWords on success', () => {
      const state = makeState('CAVE');
      InteractionHandlerSystem.enterWord(state);
      expect(state.foundWords.has('CAVE')).toBe(true);
    });

    it('does not add an invalid word to foundWords', () => {
      const state = makeState('ZZZZ');
      InteractionHandlerSystem.enterWord(state);
      expect(state.foundWords.size).toBe(0);
    });
  });
});
