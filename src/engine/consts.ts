export const EMPTY = 'o';
export type EMPTY = typeof EMPTY;

export const MORRIS = 'MORRIS';
export type MORRIS = typeof MORRIS;

// By inviolate definition since the Assyrians, a mill is 3 in a row.
// Most likely if you are thinking of changing this in some way,
// you are missing something, that's why it's named "three"
export const THREE = 3;
export type THREE = typeof THREE;

export const COORD_CHARS = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
] as const;
export type COORD_CHARS = typeof COORD_CHARS;
export type COORD_CHAR = COORD_CHARS[number];

export enum MorrisColor {
  BLACK = 'B',
  WHITE = 'W',
}

export enum MorrisLinkType {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL',
  DIAGONAL_B = 'DIAGONAL_B',
  DIAGONAL_F = 'DIAGONAL_F',
}

export enum MorrisPhase {
  PLACING = 'PLACING',
  MOVING = 'MOVING',
  FLYING = 'FLYING',
  LASKER = 'LASKER',
}

export enum MorrisMoveType {
  PLACE = 'PLACE',
  MOVE = 'MOVE',
  REMOVE = 'REMOVE',
}

export enum MorrisGameResult {
  IN_PROGRESS = 'IN_PROGRESS',
  WIN_WHITE = 'WIN_WHITE',
  WIN_BLACK = 'WIN_BLACK',
  DRAW = 'DRAW',
}
