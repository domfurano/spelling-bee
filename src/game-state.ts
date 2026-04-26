import { Point } from './model/point';

export interface HexTile {
  letter: string;
  x: number;
  y: number;
  size: number;
  color: string;
  area: Point[];
  clickedAt: number;
  clicked: boolean;
  isCenter: boolean;
}

export interface GameState {
  tiles: HexTile[];
  answer: string;
}
