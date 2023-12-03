import * as P from '@konker.dev/effect-ts-prelude';

import type { Range1, RepeatString, Tuple } from '../lib/type-utils';
import type { COORD_CHARS, THREE } from './consts';
import { EMPTY, MORRIS } from './consts';
import type { MorrisGameFacts } from './rules/facts';
import type { MorrisBoardCoordS } from './schemas';

/**
 * Morris Engine
 *
 * Author: Konrad Markus <mail@konker.dev>
 *
 * P: points: number of points on the board in total
 * D: dimensions: board is arranged as DxD
 * N: number: number of morrae per player, e.g. 3mm -> 3, 9mm -> 9
 */

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

// --------------------------------------------------------------------------
export type MorrisBlack<N extends number> = {
  readonly _tag: MORRIS;
  readonly color: typeof MorrisColor.BLACK;
  readonly n: Range1<N>;
};

export type MorrisWhite<N extends number> = {
  readonly _tag: MORRIS;
  readonly color: typeof MorrisColor.WHITE;
  readonly n: Range1<N>;
};

export type Morris<N extends number> = MorrisBlack<N> | MorrisWhite<N>;

export const EmptyOccupantS = P.Schema.struct({ _tag: P.Schema.literal(EMPTY) }).pipe(P.Schema.brand('EmptyPoint'));
export type EmptyOccupant = P.Schema.Schema.To<typeof EmptyOccupantS>;
export const EmptyOccupant = P.pipe({ _tag: EMPTY }, P.Schema.decodeSync(EmptyOccupantS));

export type MorrisBoardPointOccupant<N extends number> = EmptyOccupant | Morris<N>;

// --------------------------------------------------------------------------
export type kMorrisBoardCoord<D extends number> = `${(typeof COORD_CHARS)[number]}${Range1<D>}`; //`${EnumerateCoordChars<D>}${Range1<D>}`;

export type MorrisBoardLink<D extends number> = {
  readonly to: MorrisBoardCoordS<D>;
  readonly linkType: MorrisLinkType;
};

export type MorrisBoardPoint<D extends number, N extends number> = {
  readonly coord: MorrisBoardCoordS<D>;
  readonly links: ReadonlyArray<MorrisBoardLink<D>>;
  readonly occupant: MorrisBoardPointOccupant<N>;
};

export type OccupiedBoardPoint<D extends number, N extends number> = Omit<MorrisBoardPoint<D, N>, 'occupant'> & {
  readonly occupant: Morris<N>;
};

export type MillCandidate<D extends number> = Tuple<MorrisBoardCoordS<D>, THREE>;

export type MorrisBoard<P extends number, D extends number, N extends number> = {
  readonly type: P;
  readonly dimension: D;
  readonly points: Tuple<MorrisBoardPoint<D, N>, P>;
  readonly millCandidates: ReadonlyArray<MillCandidate<D>>;
};

export type MorrisBoardPositionHash<P extends number> = RepeatString<MorrisColor | EMPTY, P>;

// --------------------------------------------------------------------------
export type MorrisMovePlace<D extends number> = {
  readonly type: MorrisMoveType.PLACE;
  readonly color: MorrisColor;
  readonly to: MorrisBoardCoordS<D>;
};

export type MorrisMoveMove<D extends number> = {
  readonly type: MorrisMoveType.MOVE;
  readonly from: MorrisBoardCoordS<D>;
  readonly to: MorrisBoardCoordS<D>;
};

export type MorrisMoveRemove<D extends number> = {
  readonly type: MorrisMoveType.REMOVE;
  readonly from: MorrisBoardCoordS<D>;
};

export type MorrisMove<D extends number> = MorrisMovePlace<D> | MorrisMoveMove<D> | MorrisMoveRemove<D>;

// --------------------------------------------------------------------------
export type MorrisGameConfig<P extends number, D extends number, N extends number> = {
  readonly P: P;
  readonly D: D;
  readonly N: N;
  readonly name: string;
  readonly numMorrisPerPlayer: N;
  readonly flyingThreshold: number;
  readonly numMillsToWinThreshold: number; // 1 for 3MM
  readonly numMovesWithoutMillForDraw: number;
  readonly numPositionRepeatsForDraw: number;
  readonly phases: ReadonlyArray<MorrisPhase>; // 3MM: [PLACING, MOVING], L: [LASKER, MOVING]
};

export type MorrisGame<P extends number, D extends number, N extends number> = {
  readonly config: MorrisGameConfig<P, D, N>;
  readonly startColor: MorrisColor;
  readonly curMoveColor: MorrisColor;
  readonly gameOver: boolean;
  readonly result: MorrisGameResult;
  readonly lastMillCounter: number;
  readonly morrisWhite: ReadonlyArray<MorrisWhite<N>>;
  readonly morrisWhiteRemoved: ReadonlyArray<MorrisWhite<N>>;
  readonly morrisBlack: ReadonlyArray<MorrisBlack<N>>;
  readonly morrisBlackRemoved: ReadonlyArray<MorrisBlack<N>>;
  readonly board: MorrisBoard<P, D, N>;
  readonly positions: ReadonlyArray<MorrisBoardPositionHash<P>>;
  readonly moves: ReadonlyArray<MorrisMove<D>>;
  readonly facts: MorrisGameFacts;
};

// --------------------------------------------------------------------------
export type MorrisGameTick<P extends number, D extends number, N extends number> = {
  readonly game: MorrisGame<P, D, N>;
  readonly facts: MorrisGameFacts;
  readonly message: string;
};

// --------------------------------------------------------------------------
export const MorrisBlack = <N extends number>(n: Range1<N>): MorrisBlack<N> =>
  ({
    _tag: MORRIS,
    color: MorrisColor.BLACK,
    n,
  }) as MorrisBlack<N>;

export const MorrisWhite = <N extends number>(n: Range1<N>): MorrisWhite<N> =>
  ({
    _tag: MORRIS,
    color: MorrisColor.WHITE,
    n,
  }) as MorrisWhite<N>;
