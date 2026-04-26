export interface Puzzle {
  readonly centerLetter: string;
  readonly outerLetters: readonly string[];
  readonly validWords: readonly string[];
  readonly pangrams: readonly string[];
}

export const ALCOVES_PUZZLE: Puzzle = {
  centerLetter: 'C',
  outerLetters: ['A', 'L', 'O', 'V', 'E', 'S'],
  validWords: [
    'ALCOVE',
    'ALCOVES',
    'CAVE',
    'CAVES',
    'COVE',
    'COVES',
    'CLOVE',
    'CLOVES',
    'LACE',
    'LACES',
    'SOLACE',
    'SCALE',
    'VOCAL',
    'VOCALS',
    'COLA',
    'COLAS',
    'COAL',
    'COALS',
    'CLOSE',
    'LOCAL',
    'LOCALE',
    'LOCALS',
    'COLES',
    'ACES',
    'LOCO',
  ],
  pangrams: ['ALCOVES'],
};
