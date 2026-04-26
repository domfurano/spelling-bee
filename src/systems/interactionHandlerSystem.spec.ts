import { expect, describe, it, beforeEach } from 'vitest';
import { InteractionHandlerSystem } from './interactionHandlerSystem';
import { HexTile, GameState } from '../game-state';

function makeTile(letter: string, clicked: boolean): HexTile {
  return { letter, x: 0, y: 0, size: 55, color: '#e6e6e6', area: [], clickedAt: 0, clicked, isCenter: false };
}

function makeState(answer: string, ...tiles: HexTile[]): GameState {
  return { tiles, answer };
}

describe('InteractionHandlerSystem', () => {
  describe('processTileClicks', () => {
    it('appends the letter from a clicked tile to the candidate answer', () => {
      const state = makeState('', makeTile('A', true));
      InteractionHandlerSystem.processTileClicks(state);
      expect(state.answer).to.equal('A');
    });

    it('resets clicked to false on the tile after processing', () => {
      const tile = makeTile('B', true);
      const state = makeState('', tile);
      InteractionHandlerSystem.processTileClicks(state);
      expect(tile.clicked).to.be.false;
    });

    it('does not modify the answer when the tile is not clicked', () => {
      const state = makeState('', makeTile('C', false));
      InteractionHandlerSystem.processTileClicks(state);
      expect(state.answer).to.equal('');
    });

    it('appends to existing answer text when a tile is clicked', () => {
      const state = makeState('SPEL', makeTile('E', true));
      InteractionHandlerSystem.processTileClicks(state);
      expect(state.answer).to.equal('SPELE');
    });

    it('accumulates letters across successive calls', () => {
      const tile = makeTile('L', true);
      const state = makeState('', tile);
      InteractionHandlerSystem.processTileClicks(state);
      tile.clicked = true;
      InteractionHandlerSystem.processTileClicks(state);
      expect(state.answer).to.equal('LL');
    });

    it('handles multiple tiles where only the clicked one appends text', () => {
      const state = makeState('', makeTile('X', true), makeTile('Y', false));
      InteractionHandlerSystem.processTileClicks(state);
      expect(state.answer).to.equal('X');
    });

    it('does nothing when there are no tiles', () => {
      const state = makeState('HELLO');
      InteractionHandlerSystem.processTileClicks(state);
      expect(state.answer).to.equal('HELLO');
    });
  });
});

