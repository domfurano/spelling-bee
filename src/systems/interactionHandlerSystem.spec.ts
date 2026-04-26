import { expect, describe, it } from 'vitest';
import { InteractionHandlerSystem } from './interactionHandlerSystem';
import { HexTile, GameState } from '../game-state';

function makeTile(letter: string, isCenter = false): HexTile {
  const element = document.createElement('button');
  element.textContent = letter;
  return { letter, isCenter, element };
}

function makeState(answer: string, ...tiles: HexTile[]): GameState {
  return { tiles, answer };
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
});
