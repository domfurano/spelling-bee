import { GameState, HexTile } from '../game-state';

export type EnterOutcome =
  | 'too-short'
  | 'invalid-letter'
  | 'missing-center'
  | 'already-found'
  | 'not-in-list'
  | 'accepted'
  | 'accepted-pangram';

const RANKS: { minPct: number; label: string }[] = [
  { minPct: 100, label: 'Queen Bee' },
  { minPct: 70, label: 'Genius' },
  { minPct: 50, label: 'Amazing' },
  { minPct: 40, label: 'Great' },
  { minPct: 25, label: 'Nice' },
  { minPct: 15, label: 'Solid' },
  { minPct: 8, label: 'Good' },
  { minPct: 5, label: 'Moving Up' },
  { minPct: 2, label: 'Good Start' },
  { minPct: 0, label: 'Beginner' },
];

export class InteractionHandlerSystem {
  static maxScore(
    validWords: readonly string[],
    pangrams: readonly string[]
  ): number {
    return validWords.reduce(
      (sum, w) => sum + InteractionHandlerSystem.scoreWord(w, pangrams),
      0
    );
  }

  static getRank(score: number, max: number): string {
    const pct = max === 0 ? 0 : (score / max) * 100;
    for (const rank of RANKS) {
      if (pct >= rank.minPct) return rank.label;
    }
    return 'Beginner';
  }

  static scoreWord(word: string, pangrams: readonly string[]): number {
    const length = word.length;
    const base = length === 4 ? 1 : length;
    const pangramBonus = pangrams.includes(word) ? 7 : 0;
    return base + pangramBonus;
  }

  static deleteLastLetter(state: GameState): void {
    if (state.answer.length > 0) {
      state.answer = state.answer.slice(0, -1);
    }
  }

  static scramble(tiles: HexTile[]): void {
    if (tiles.length < 2) return;
    const outerTiles = tiles.slice(1);
    const letters = outerTiles.map((t) => t.letter);
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    outerTiles.forEach((t, idx) => {
      t.letter = letters[idx];
      t.element.textContent = letters[idx];
    });
  }

  static enterWord(state: GameState): EnterOutcome {
    const word = state.answer.toUpperCase();

    if (word.length < 4) {
      InteractionHandlerSystem.showMessage('Too short!', false);
      InteractionHandlerSystem.triggerShakeAnimation();
      return 'too-short';
    }

    const hiveLetters = new Set([
      state.puzzle.centerLetter,
      ...state.puzzle.outerLetters,
    ]);

    if ([...word].some((ch) => !hiveLetters.has(ch))) {
      InteractionHandlerSystem.showMessage('Not in the list', false);
      InteractionHandlerSystem.triggerShakeAnimation();
      state.answer = '';
      return 'invalid-letter';
    }

    if (!word.includes(state.puzzle.centerLetter)) {
      InteractionHandlerSystem.showMessage('Missing center letter', false);
      InteractionHandlerSystem.triggerShakeAnimation();
      state.answer = '';
      return 'missing-center';
    }

    if (state.foundWords.has(word)) {
      InteractionHandlerSystem.showMessage('Already found!', false);
      InteractionHandlerSystem.triggerShakeAnimation();
      state.answer = '';
      return 'already-found';
    }

    if (state.puzzle.validWords.includes(word)) {
      const isPangram = state.puzzle.pangrams.includes(word);
      if (isPangram) {
        InteractionHandlerSystem.showMessage('Pangram! 🌟', true);
        InteractionHandlerSystem.triggerPangramCelebration();
      } else {
        InteractionHandlerSystem.showMessage('Nice! 🎉', true);
      }
      state.foundWords.add(word);
      state.score += InteractionHandlerSystem.scoreWord(
        word,
        state.puzzle.pangrams
      );
      state.answer = '';
      return isPangram ? 'accepted-pangram' : 'accepted';
    } else {
      InteractionHandlerSystem.showMessage('Not in word list', false);
      InteractionHandlerSystem.triggerShakeAnimation();
    }
    state.answer = '';
    return 'not-in-list';
  }

  static handleKeydown(
    e: KeyboardEvent,
    state: GameState,
    answerEl: HTMLElement
  ): EnterOutcome | null {
    const hiveLetters = new Set([
      state.puzzle.centerLetter,
      ...state.puzzle.outerLetters,
    ]);
    const upper = e.key.toUpperCase();

    if (e.key.length === 1 && hiveLetters.has(upper)) {
      state.answer += upper;
      answerEl.innerText = state.answer;
      InteractionHandlerSystem.triggerLetterAddedAnimation();
      return null;
    } else if (e.key === 'Backspace') {
      InteractionHandlerSystem.deleteLastLetter(state);
      answerEl.innerText = state.answer;
      return null;
    } else if (e.key === 'Enter') {
      const outcome = InteractionHandlerSystem.enterWord(state);
      answerEl.innerText = state.answer;
      return outcome;
    }
    return null;
  }

  private static messageTimeout: ReturnType<typeof setTimeout> | null = null;

  private static showMessage(text: string, isCorrect: boolean): void {
    const msg = document.getElementById('message');
    if (msg) {
      if (InteractionHandlerSystem.messageTimeout !== null) {
        clearTimeout(InteractionHandlerSystem.messageTimeout);
        InteractionHandlerSystem.messageTimeout = null;
      }
      msg.className = '';
      msg.textContent = text;
      void msg.offsetWidth; // Force reflow to restart animation
      msg.className = isCorrect ? 'show-correct' : 'show-incorrect';
      InteractionHandlerSystem.messageTimeout = setTimeout(() => {
        msg.className = '';
        msg.textContent = '';
        InteractionHandlerSystem.messageTimeout = null;
      }, 2000);
    }
  }

  static triggerPangramCelebration(): void {
    const tiles = document.querySelectorAll<HTMLElement>('.hex-tile');
    tiles.forEach((tile) => {
      tile.classList.remove('pangram-flash');
      void tile.offsetWidth; // Force reflow to restart animation
      tile.classList.add('pangram-flash');
    });
  }

  static triggerLetterAddedAnimation(): void {
    const span = document.getElementById('spnCandidateAnswer');
    if (span) {
      span.classList.remove('letter-added');
      void span.offsetWidth; // Force reflow to restart animation
      span.classList.add('letter-added');
    }
  }

  private static triggerShakeAnimation(): void {
    const span = document.getElementById('spnCandidateAnswer');
    if (span) {
      span.classList.remove('shake', 'letter-added');
      void span.offsetWidth; // Force reflow to restart animation
      span.classList.add('shake');
    }
  }
}
