import type { EnumerateCoordChars, Range1, Tuple } from './utils';

/**
 * Morris Engine
 *
 * Author: Konrad Markus <mail@konker.dev>
 */

export enum MorrisColor {
  EMPTY = 'o',
  BLACK = 'B',
  WHITE = 'W',
}

export type MorrisEmpty = {
  readonly color: typeof MorrisColor.EMPTY;
};
export const MorrisEmpty: MorrisEmpty = { color: MorrisColor.EMPTY };

export type MorrisBlack<N extends number> = {
  readonly color: typeof MorrisColor.BLACK;
  readonly n: Range1<N>;
};
export const MorrisBlack = <N extends number>(n: Range1<N>): MorrisBlack<N> => ({
  color: MorrisColor.BLACK,
  n,
});

export type MorrisWhite<N extends number> = {
  readonly color: typeof MorrisColor.WHITE;
  readonly n: Range1<N>;
};
export const MorrisWhite = <N extends number>(n: Range1<N>): MorrisWhite<N> => ({
  color: MorrisColor.WHITE,
  n,
});

export type Morris<N extends number> = MorrisEmpty | MorrisBlack<N> | MorrisWhite<N>;

export type MorrisBoardCoord<D extends number> = `${EnumerateCoordChars<D>}${Range1<D>}`;

export enum MorrisLinkType {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL',
  DIAGONAL_B = 'DIAGONAL_B',
  DIAGONAL_F = 'DIAGONAL_F',
}

export type MorrisBoardLink<D extends number> = {
  readonly to: MorrisBoardCoord<D>;
  readonly linkType: MorrisLinkType;
};

export type MorrisPoint<D extends number, N extends number> = {
  readonly coord: MorrisBoardCoord<D>;
  readonly links: ReadonlyArray<MorrisBoardLink<D>>;
  readonly occupant: Morris<N>;
};

export type MorrisBoard<P extends number, D extends number, N extends number> = {
  readonly type: P;
  readonly dimension: D;
  readonly points: Tuple<MorrisPoint<D, N>, P>;
  readonly mills: ReadonlyArray<Tuple<MorrisBoardCoord<D>, 3>>;
};

export enum MorrisPhase {
  PLACING = 'PLACING',
  MOVING = 'MOVING',
  FLYING = 'FLYING',
  LASKER = 'LASKER',
}

export enum MorrisMoveType {
  PLACE = 'PLACE',
  MOVE = 'MOVE',
  //  REMOVE = 'REMOVE'
}

export type MorrisMovePlace<D extends number> = {
  readonly type: typeof MorrisMoveType.PLACE;
  readonly color: MorrisColor;
  readonly to: MorrisBoardCoord<D>;
};

export type MorrisMoveMove<D extends number> = {
  readonly type: typeof MorrisMoveType.MOVE;
  readonly color: MorrisColor;
  readonly from: MorrisBoardCoord<D>;
  readonly to: MorrisBoardCoord<D>;
};

// export type MorrisMoveRemove<P extends number> = {
//   readonly type: typeof MorrisMoveType.REMOVE;
//   readonly color: MorrisColor;
//   readonly from: Range1<P>;
// };

export type MorrisMove<D extends number> = MorrisMovePlace<D> | MorrisMoveMove<D>;
// | MorrisMoveRemove<D>;

export type MorrisGameConfig<N extends number> = {
  readonly name: string;
  readonly numMorrisPerPlayer: N;
  readonly flyingThreshold?: number;
  readonly numMillsToWinThreshold?: number; // 1 for 3MM
  readonly phases: ReadonlyArray<MorrisPhase>; // 3MM: [PLACING, MOVING], L: [LASKER, MOVING]
};

export type MorrisGameState = {
  readonly currentTurn: MorrisColor;
  readonly currentPhase: MorrisPhase;
};

export type MorrisGame<P extends number, D extends number, N extends number> = {
  readonly config: MorrisGameConfig<N>;
  readonly startColor: MorrisColor;
  readonly phaseIdx: number;
  readonly board: MorrisBoard<P, D, N>;
  readonly moves: ReadonlyArray<MorrisMove<D>>;
};
