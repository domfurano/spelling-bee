import { HexTile } from '../game-state';

export class TextGenerationSystem {
  static applyLetters(tiles: HexTile[], word: string): void {
    for (let i = 0; i < tiles.length && i < word.length; i++) {
      tiles[i].letter = word[i];
      tiles[i].element.textContent = word[i];
    }
  }

  static shuffleWord(word: string): string {
    const array = word.split('');
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
  }
}
