import { GameState, HexTile } from '../game-state';
import { Point } from '../model/point';

const THIRD_PI = Math.PI / 3;
const HALF_PI = Math.PI / 2;
const TILE_SIZE = 55;
const DISTANCE = 100;

function createHexArea(x: number, y: number, size: number): Point[] {
  const area: Point[] = [];
  for (let i = 0; i < 7; i++) {
    area.push(
      new Point(
        x + size * Math.cos(i * THIRD_PI),
        y + size * Math.sin(i * THIRD_PI)
      )
    );
  }
  return area;
}

export function createScene(xOrigin = 150, yOrigin = 160): GameState {
  const tiles: HexTile[] = [];

  tiles.push({
    letter: '~',
    x: xOrigin,
    y: yOrigin,
    size: TILE_SIZE,
    color: '#f8cd05',
    area: createHexArea(xOrigin, yOrigin, TILE_SIZE),
    clickedAt: 0,
    clicked: false,
    isCenter: true,
  });

  for (let i = 0; i < 6; i++) {
    const angle = i * THIRD_PI + HALF_PI;
    const x = xOrigin + DISTANCE * Math.cos(angle);
    const y = yOrigin + DISTANCE * Math.sin(angle);
    tiles.push({
      letter: '~',
      x,
      y,
      size: TILE_SIZE,
      color: '#e6e6e6',
      area: createHexArea(x, y, TILE_SIZE),
      clickedAt: 0,
      clicked: false,
      isCenter: false,
    });
  }

  return { tiles, answer: '' };
}
