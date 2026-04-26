import { GameState, HexTile } from '../game-state';

export class InteractionHandlerSystem {
  private static readonly validWords = new Set([
    'ALOE', 'ALOES', 'ALCOVE', 'ALCOVES',
    'CAVE', 'CAVES', 'COVE', 'COVES', 'CLOVE', 'CLOVES',
    'LACE', 'LACES', 'LAVE', 'LAVES', 'VALE', 'VALES',
    'LOVE', 'LOVES', 'VOLE', 'VOLES',
    'SLAVE', 'SALVE', 'SOLVE', 'SOLACE',
    'SCALE', 'VOCAL', 'VOCALS', 'COLA', 'COLAS',
    'COAL', 'COALS', 'SOLE', 'SLOE', 'CLOSE',
    'VALVE', 'VALVES', 'LOAVES', 'LOCAL', 'LOCALE', 'LOCALS',
    'COLES', 'OAVES', 'ACES', 'LOCO',
  ]);

  static processTileClicks(state: GameState): boolean {
    let letterAdded = false;
    for (const tile of state.tiles) {
      if (tile.clicked) {
        tile.clicked = false;
        state.answer += tile.letter;
        letterAdded = true;
      }
    }
    return letterAdded;
  }

  static deleteLastLetter(state: GameState): void {
    if (state.answer.length > 0) {
      state.answer = state.answer.slice(0, -1);
    }
  }

  static scramble(tiles: HexTile[]): void {
    if (tiles.length < 2) return;
    const outerTiles = tiles.slice(1);
    const letters = outerTiles.map(t => t.letter);
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    outerTiles.forEach((t, idx) => { t.letter = letters[idx]; });
  }

  static enterWord(state: GameState): void {
    const word = state.answer.toUpperCase();
    if (word.length < 4) {
      InteractionHandlerSystem.showMessage('Too short!', false);
      InteractionHandlerSystem.triggerShakeAnimation();
      return;
    }
    if (InteractionHandlerSystem.validWords.has(word)) {
      InteractionHandlerSystem.showMessage('Nice! 🎉', true);
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
