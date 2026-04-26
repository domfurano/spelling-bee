import { GameState, HexTile } from '../game-state';

export class InteractionHandlerSystem {

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

  static enterWord(state: GameState): void {
    const word = state.answer.toUpperCase();

    if (word.length < 4) {
      InteractionHandlerSystem.showMessage('Too short!', false);
      InteractionHandlerSystem.triggerShakeAnimation();
      return;
    }

    const hiveLetters = new Set([
      state.puzzle.centerLetter,
      ...state.puzzle.outerLetters,
    ]);

    if ([...word].some((ch) => !hiveLetters.has(ch))) {
      InteractionHandlerSystem.showMessage('Not in the list', false);
      InteractionHandlerSystem.triggerShakeAnimation();
      state.answer = '';
      return;
    }

    if (!word.includes(state.puzzle.centerLetter)) {
      InteractionHandlerSystem.showMessage('Missing center letter', false);
      InteractionHandlerSystem.triggerShakeAnimation();
      state.answer = '';
      return;
    }

    if (state.foundWords.has(word)) {
      InteractionHandlerSystem.showMessage('Already found!', false);
      InteractionHandlerSystem.triggerShakeAnimation();
      state.answer = '';
      return;
    }

    if (state.puzzle.validWords.includes(word)) {
      InteractionHandlerSystem.showMessage('Nice! 🎉', true);
      state.foundWords.add(word);
    } else {
      InteractionHandlerSystem.showMessage('Not in word list', false);
      InteractionHandlerSystem.triggerShakeAnimation();
    }
    state.answer = '';
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
