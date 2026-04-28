import { expect, describe, it, beforeEach, afterEach } from 'vitest';
import { InteractionHandlerSystem } from './interactionHandlerSystem';
import type { EnterOutcome } from './interactionHandlerSystem';
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
  return { tiles, answer, puzzle: mockPuzzle, foundWords: new Set(), score: 0 };
}

describe('InteractionHandlerSystem', () => {
  describe('maxScore', () => {
    it('sums scores for all valid words', () => {
      // CAVE=1, CLOVE=5, ALCOVE=6, ALCOVES=7+7=14 → total 26
      expect(
        InteractionHandlerSystem.maxScore(
          ['CAVE', 'CLOVE', 'ALCOVE', 'ALCOVES'],
          ['ALCOVES']
        )
      ).toBe(26);
    });

    it('returns 0 for an empty word list', () => {
      expect(InteractionHandlerSystem.maxScore([], [])).toBe(0);
    });
  });

  describe('getRank', () => {
    it('returns Beginner at 0%', () => {
      expect(InteractionHandlerSystem.getRank(0, 100)).toBe('Beginner');
    });

    it('returns Good Start at 2%', () => {
      expect(InteractionHandlerSystem.getRank(2, 100)).toBe('Good Start');
    });

    it('returns Moving Up at 5%', () => {
      expect(InteractionHandlerSystem.getRank(5, 100)).toBe('Moving Up');
    });

    it('returns Good at 8%', () => {
      expect(InteractionHandlerSystem.getRank(8, 100)).toBe('Good');
    });

    it('returns Solid at 15%', () => {
      expect(InteractionHandlerSystem.getRank(15, 100)).toBe('Solid');
    });

    it('returns Nice at 25%', () => {
      expect(InteractionHandlerSystem.getRank(25, 100)).toBe('Nice');
    });

    it('returns Great at 40%', () => {
      expect(InteractionHandlerSystem.getRank(40, 100)).toBe('Great');
    });

    it('returns Amazing at 50%', () => {
      expect(InteractionHandlerSystem.getRank(50, 100)).toBe('Amazing');
    });

    it('returns Genius at 70%', () => {
      expect(InteractionHandlerSystem.getRank(70, 100)).toBe('Genius');
    });

    it('returns Queen Bee at 100%', () => {
      expect(InteractionHandlerSystem.getRank(100, 100)).toBe('Queen Bee');
    });

    it('returns Beginner when max is 0', () => {
      expect(InteractionHandlerSystem.getRank(0, 0)).toBe('Beginner');
    });
  });

  describe('scoreWord', () => {
    it('scores a 4-letter word as 1', () => {
      expect(InteractionHandlerSystem.scoreWord('CAVE', [])).toBe(1);
    });

    it('scores a 5-letter word as 5', () => {
      expect(InteractionHandlerSystem.scoreWord('CLOVE', [])).toBe(5);
    });

    it('scores a 6-letter word as 6', () => {
      expect(InteractionHandlerSystem.scoreWord('ALCOVE', [])).toBe(6);
    });

    it('adds 7-point pangram bonus on top of length score', () => {
      expect(InteractionHandlerSystem.scoreWord('ALCOVES', ['ALCOVES'])).toBe(
        7 + 7
      );
    });

    it('adds pangram bonus only when word is in pangrams list', () => {
      expect(InteractionHandlerSystem.scoreWord('ALCOVES', [])).toBe(7);
    });
  });

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

    it('increments score when a valid word is entered', () => {
      const state = makeState('CAVE');
      InteractionHandlerSystem.enterWord(state);
      expect(state.score).toBe(1); // 4-letter word = 1 point
    });

    it('does not increment score for an invalid word', () => {
      const state = makeState('ZZZZ');
      InteractionHandlerSystem.enterWord(state);
      expect(state.score).toBe(0);
    });

    it('does not add an invalid word to foundWords', () => {
      const state = makeState('ZZZZ');
      InteractionHandlerSystem.enterWord(state);
      expect(state.foundWords.size).toBe(0);
    });
  });

  describe('enterWord — return value (EnterOutcome)', () => {
    it('returns "too-short" when the word is under 4 letters', () => {
      const state = makeState('CAV');
      const result: EnterOutcome = InteractionHandlerSystem.enterWord(state);
      expect(result).toBe('too-short');
    });

    it('returns "invalid-letter" when the word contains a non-hive letter', () => {
      const state = makeState('CATZ');
      expect(InteractionHandlerSystem.enterWord(state)).toBe('invalid-letter');
    });

    it('returns "missing-center" when the word omits the center letter', () => {
      const state = makeState('SLAVE');
      expect(InteractionHandlerSystem.enterWord(state)).toBe('missing-center');
    });

    it('returns "already-found" for a duplicate word', () => {
      const state = makeState('CAVE');
      InteractionHandlerSystem.enterWord(state);
      state.answer = 'CAVE';
      expect(InteractionHandlerSystem.enterWord(state)).toBe('already-found');
    });

    it('returns "not-in-list" for a valid-letters word not in validWords', () => {
      const state = makeState('LACE');
      expect(InteractionHandlerSystem.enterWord(state)).toBe('not-in-list');
    });

    it('returns "accepted" for a regular valid word', () => {
      const state = makeState('CAVE');
      expect(InteractionHandlerSystem.enterWord(state)).toBe('accepted');
    });

    it('returns "accepted-pangram" for a pangram', () => {
      const state = makeState('ALCOVES');
      expect(InteractionHandlerSystem.enterWord(state)).toBe(
        'accepted-pangram'
      );
    });
  });

  describe('enterWord — pangram celebration', () => {
    let msgEl: HTMLElement;

    beforeEach(() => {
      msgEl = document.createElement('div');
      msgEl.id = 'message';
      document.body.appendChild(msgEl);
    });

    afterEach(() => {
      document.body.removeChild(msgEl);
    });

    it('shows "Pangram! 🌟" when the entered word is a pangram', () => {
      const state = makeState('ALCOVES');
      InteractionHandlerSystem.enterWord(state);
      expect(msgEl.textContent).toBe('Pangram! 🌟');
    });

    it('shows "Nice! 🎉" when the entered word is a valid non-pangram', () => {
      const state = makeState('CAVE');
      InteractionHandlerSystem.enterWord(state);
      expect(msgEl.textContent).toBe('Nice! 🎉');
    });
  });

  describe('triggerPangramCelebration', () => {
    let tileEls: HTMLElement[];

    beforeEach(() => {
      tileEls = ['A', 'B', 'C'].map((l) => {
        const el = document.createElement('button');
        el.className = 'hex-tile';
        el.textContent = l;
        document.body.appendChild(el);
        return el;
      });
    });

    afterEach(() => {
      tileEls.forEach((el) => document.body.removeChild(el));
    });

    it('adds pangram-flash class to all hex-tile elements', () => {
      InteractionHandlerSystem.triggerPangramCelebration();
      for (const el of tileEls) {
        expect(el.classList.contains('pangram-flash')).toBe(true);
      }
    });
  });

  describe('handleKeydown', () => {
    function makeAnswerEl(): HTMLElement {
      return document.createElement('span');
    }

    it('appends an uppercase hive letter when a matching lowercase key is pressed', () => {
      const state = makeState('');
      const answerEl = makeAnswerEl();
      InteractionHandlerSystem.handleKeydown(
        new KeyboardEvent('keydown', { key: 'a' }),
        state,
        answerEl
      );
      expect(state.answer).toBe('A');
      expect(answerEl.innerText).toBe('A');
    });

    it('accepts uppercase hive letter keys too', () => {
      const state = makeState('');
      const answerEl = makeAnswerEl();
      InteractionHandlerSystem.handleKeydown(
        new KeyboardEvent('keydown', { key: 'C' }),
        state,
        answerEl
      );
      expect(state.answer).toBe('C');
    });

    it('does not append a non-hive letter', () => {
      const state = makeState('');
      const answerEl = makeAnswerEl();
      InteractionHandlerSystem.handleKeydown(
        new KeyboardEvent('keydown', { key: 'z' }),
        state,
        answerEl
      );
      expect(state.answer).toBe('');
    });

    it('does not append a non-letter key (digit)', () => {
      const state = makeState('');
      const answerEl = makeAnswerEl();
      InteractionHandlerSystem.handleKeydown(
        new KeyboardEvent('keydown', { key: '1' }),
        state,
        answerEl
      );
      expect(state.answer).toBe('');
    });

    it('Backspace removes the last letter and updates answerEl', () => {
      const state = makeState('CA');
      const answerEl = makeAnswerEl();
      answerEl.innerText = 'CA';
      InteractionHandlerSystem.handleKeydown(
        new KeyboardEvent('keydown', { key: 'Backspace' }),
        state,
        answerEl
      );
      expect(state.answer).toBe('C');
      expect(answerEl.innerText).toBe('C');
    });

    it('Enter delegates to enterWord and clears answerEl', () => {
      const state = makeState('CAVE');
      const answerEl = makeAnswerEl();
      answerEl.innerText = 'CAVE';
      InteractionHandlerSystem.handleKeydown(
        new KeyboardEvent('keydown', { key: 'Enter' }),
        state,
        answerEl
      );
      expect(state.answer).toBe('');
      expect(answerEl.innerText).toBe('');
    });
  });
});
