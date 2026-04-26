import { GameState, HexTile } from '../game-state';
import { Puzzle } from '../puzzle';

// Flat-top hexagon: width=110px, height=96px
// Positions are top-left corners of each tile within a 300×310px container.
// Tile order: [center, bottom, bottom-left, top-left, top, top-right, bottom-right]
const TILE_POSITIONS = [
  { x: 95, y: 107 },
  { x: 95, y: 207 },
  { x: 8, y: 157 },
  { x: 8, y: 57 },
  { x: 95, y: 7 },
  { x: 182, y: 57 },
  { x: 182, y: 157 },
];

export function createScene(container: HTMLElement, puzzle: Puzzle): GameState {
  const tiles: HexTile[] = [];

  TILE_POSITIONS.forEach((pos, i) => {
    const isCenter = i === 0;
    const button = document.createElement('button');
    button.className = 'hex-tile' + (isCenter ? ' center' : '');
    button.style.left = `${pos.x}px`;
    button.style.top = `${pos.y}px`;
    container.appendChild(button);
    tiles.push({ letter: '', isCenter, element: button });
  });

  return { tiles, answer: '', puzzle };
}
