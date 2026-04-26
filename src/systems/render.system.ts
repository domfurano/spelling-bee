import { GameState } from '../game-state';

const CLICK_HIGHLIGHT_MS = 200;

export class RenderSystem {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  private readonly answerElement: HTMLElement;

  constructor(canvas: HTMLCanvasElement, answerElement: HTMLElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx)
      throw new Error('Failed to acquire 2D rendering context from canvas.');
    this.ctx = ctx;
    this.answerElement = answerElement;
  }

  render(state: GameState): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const tile of state.tiles) {
      const timeSinceClick = Date.now() - tile.clickedAt;
      const fillColor =
        timeSinceClick < CLICK_HIGHLIGHT_MS
          ? RenderSystem.lightenColor(tile.color, 0.4)
          : tile.color;

      this.ctx.beginPath();
      for (const point of tile.area) {
        this.ctx.lineTo(point.x, point.y);
      }
      this.ctx.closePath();
      this.ctx.fillStyle = fillColor;
      this.ctx.fill();

      this.ctx.font = '32px sans-serif';
      this.ctx.fillStyle = 'black';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(tile.letter, tile.x, tile.y);
    }

    this.answerElement.innerText = state.answer;
  }

  private static lightenColor(hex: string, factor: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const lr = Math.min(255, Math.round(r + (255 - r) * factor));
    const lg = Math.min(255, Math.round(g + (255 - g) * factor));
    const lb = Math.min(255, Math.round(b + (255 - b) * factor));
    return `rgb(${lr}, ${lg}, ${lb})`;
  }
}
