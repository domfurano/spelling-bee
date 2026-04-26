import { GameState } from '../game-state';
import { Point } from '../model/point';

export class InteractionListenerSystem {
  static setup(canvas: HTMLCanvasElement, state: GameState): void {
    canvas.addEventListener('click', event => {
      const point = InteractionListenerSystem.getCanvasPoint(canvas, event.clientX, event.clientY);
      InteractionListenerSystem.processPoint(point, state);
    });
    canvas.addEventListener('touchstart', event => {
      event.preventDefault();
      for (let i = 0; i < event.touches.length; i++) {
        const touch = event.touches[i];
        const point = InteractionListenerSystem.getCanvasPoint(canvas, touch.clientX, touch.clientY);
        InteractionListenerSystem.processPoint(point, state);
      }
    }, { passive: false });
  }

  private static processPoint(point: Point, state: GameState): void {
    for (const tile of state.tiles) {
      if (InteractionListenerSystem.insidePolygon(tile.area, 6, point)) {
        tile.clicked = true;
        tile.clickedAt = Date.now();
      }
    }
  }

  private static getCanvasPoint(canvas: HTMLCanvasElement, clientX: number, clientY: number): Point {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return new Point((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
  }

  // http://www.eecs.umich.edu/courses/eecs380/HANDOUTS/PROJ2/InsidePoly.html
  private static insidePolygon(points: Point[], N: number, p: Point): boolean {
    let counter = 0;
    let p1 = points[0];
    for (let i = 1; i <= N; i++) {
      const p2 = points[i % N];
      if (p.y > Math.min(p1.y, p2.y)) {
        if (p.y <= Math.max(p1.y, p2.y)) {
          if (p.x <= Math.max(p1.x, p2.x)) {
            if (p1.y !== p2.y) {
              const xInters = (p.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;
              if (p1.x === p2.x || p.x <= xInters) {
                counter++;
              }
            }
          }
        }
      }
      p1 = p2;
    }
    return counter % 2 !== 0;
  }
}
