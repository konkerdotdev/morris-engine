import * as P from '@konker.dev/effect-ts-prelude';

import type { EnumerateCoordChars, Range1, RepeatString, Tuple } from '../lib/type-utils';
import { COORD_CHARS } from '../lib/type-utils';
import type { MorrisGameFacts } from './rules/facts';

/**
 * Morris Engine
 *
 * Author: Konrad Markus <mail@konker.dev>
 *
 * P: points: number of points on the board in total
 * D: dimensions: board is arranged as DxD
 * N: number: number of morrae per player, e.g. 3mm -> 3, 9mm -> 9
 */

// By inviolate definition since the Assyrians, a mill is 3 in a row.
// Most likely if you are thinking of changing this in some way,
// you are missing something, that's why it's named "three"
export const THREE = 3;
export type THREE = typeof THREE;

export const EMPTY = 'o';
export type EMPTY = typeof EMPTY;

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
  readonly color: typeof MorrisColor.BLACK;
  readonly n: Range1<N>;
};

export type MorrisWhite<N extends number> = {
  readonly color: typeof MorrisColor.WHITE;
  readonly n: Range1<N>;
};

export type Morris<N extends number> = MorrisBlack<N> | MorrisWhite<N>;

export const EmptyOccupantS = P.Schema.struct({ _tag: P.Schema.literal(EMPTY) }).pipe(P.Schema.brand('EmptyPoint'));
export type EmptyOccupant = P.Schema.Schema.To<typeof EmptyOccupantS>;
export const EmptyOccupant = P.pipe({ _tag: EMPTY }, P.Schema.decodeSync(EmptyOccupantS));

export type MorrisBoardPointOccupant<N extends number> = EmptyOccupant | Morris<N>;

// --------------------------------------------------------------------------
export type MorrisBoardCoord<D extends number> = `${EnumerateCoordChars<D>}${Range1<D>}`;
export const MorrisBoardCoordS = <D extends number>(d: D) =>
  P.pipe(
    P.Schema.string,
    P.Schema.filter(
      (s) => {
        const parts = s.split('', 2);
        if (parts.length !== 2) return false;
        const y = parseInt(parts[1]!, 10);

        return COORD_CHARS.slice(0, d).includes(parts[0] as any) && y > 0 && y < d;
      },
      {
        title: 'MorrisBoardCoord',
        message: () => `Invalid board coordinate for dimension ${d}`,
      }
    )
  );

export type MorrisBoardLink<D extends number> = {
  readonly to: MorrisBoardCoord<D>;
  readonly linkType: MorrisLinkType;
};

export type MorrisBoardPoint<D extends number, N extends number> = {
  readonly coord: MorrisBoardCoord<D>;
  readonly links: ReadonlyArray<MorrisBoardLink<D>>;
  readonly occupant: MorrisBoardPointOccupant<N>;
};

export type OccupiedBoardPoint<D extends number, N extends number> = Omit<MorrisBoardPoint<D, N>, 'occupant'> & {
  readonly occupant: Morris<N>;
};

export type MillCandidate<D extends number> = Tuple<MorrisBoardCoord<D>, THREE>;

export type MorrisBoard<P extends number, D extends number, N extends number> = {
  readonly type: P;
  readonly dimension: D;
  readonly points: Tuple<MorrisBoardPoint<D, N>, P>;
  readonly millCandidates: ReadonlyArray<MillCandidate<D>>;
};

export type MorrisBoardPositionHash<P extends number> = RepeatString<MorrisColor | EMPTY, P>;

// --------------------------------------------------------------------------
export type MorrisMovePlace<D extends number, N extends number> = {
  readonly type: MorrisMoveType.PLACE;
  readonly morris: Morris<N>;
  readonly to: MorrisBoardCoord<D>;
};

export type MorrisMoveMove<D extends number> = {
  readonly type: MorrisMoveType.MOVE;
  readonly from: MorrisBoardCoord<D>;
  readonly to: MorrisBoardCoord<D>;
};

export type MorrisMoveRemove<D extends number, N extends number> = {
  readonly type: MorrisMoveType.REMOVE;
  readonly morris: Morris<N>;
  readonly from: MorrisBoardCoord<D>;
};

export type MorrisMove<D extends number, N extends number> =
  | MorrisMovePlace<D, N>
  | MorrisMoveMove<D>
  | MorrisMoveRemove<D, N>;

// --------------------------------------------------------------------------
export type MorrisGameConfig<N extends number> = {
  readonly name: string;
  readonly numMorrisPerPlayer: N;
  readonly flyingThreshold: number;
  readonly numMillsToWinThreshold: number; // 1 for 3MM
  readonly numMovesWithoutMillForDraw: number;
  readonly numPositionRepeatsForDraw: number;
  readonly phases: ReadonlyArray<MorrisPhase>; // 3MM: [PLACING, MOVING], L: [LASKER, MOVING]
};

export type MorrisGame<P extends number, D extends number, N extends number> = {
  readonly config: MorrisGameConfig<N>;
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
  readonly moves: ReadonlyArray<MorrisMove<D, N>>;
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
    color: MorrisColor.BLACK,
    n,
  }) as const;

export const MorrisWhite = <N extends number>(n: Range1<N>): MorrisWhite<N> =>
  ({
    color: MorrisColor.WHITE,
    n,
  }) as const;
