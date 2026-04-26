export interface HexTile {
  letter: string;
  isCenter: boolean;
  element: HTMLButtonElement;
}

export interface GameState {
  tiles: HexTile[];
  answer: string;
}
