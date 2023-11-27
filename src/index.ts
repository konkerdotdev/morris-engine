import * as P from '@konker.dev/effect-ts-prelude';

import type { RulesImpl } from './rules';
import type { EnumerateCoordChars, Range1, Tuple } from './utils';

/**
 * Morris Engine
 *
 * Author: Konrad Markus <mail@konker.dev>
 */

export const EmptyPointS = P.Schema.struct({ _tag: P.Schema.literal('EMPTY') }).pipe(P.Schema.brand('EmptyPoint'));
export type EmptyPoint = P.Schema.Schema.To<typeof EmptyPointS>;
export const EmptyPoint = P.pipe({ _tag: 'EMPTY' }, P.Schema.decodeSync(EmptyPointS));
export const isEmptyPoint = (x: unknown): x is EmptyPoint => P.pipe(x, P.Schema.is(EmptyPointS));

export enum MorrisColor {
  BLACK = 'B',
  WHITE = 'W',
}

export function flipColor(color: MorrisColor): MorrisColor {
  return color === MorrisColor.WHITE ? MorrisColor.BLACK : MorrisColor.WHITE;
}

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

export type Morris<N extends number> = MorrisBlack<N> | MorrisWhite<N>;
export type MorrisBoardPointOccupant<N extends number> = EmptyPoint | Morris<N>;

export const isMorris = <N extends number>(x: MorrisBoardPointOccupant<N>): x is Morris<N> => !isEmptyPoint(x);

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

export type MorrisBoardPoint<D extends number, N extends number> = {
  readonly coord: MorrisBoardCoord<D>;
  readonly links: ReadonlyArray<MorrisBoardLink<D>>;
  readonly occupant: MorrisBoardPointOccupant<N>;
};

export type MorrisBoard<P extends number, D extends number, N extends number> = {
  readonly type: P;
  readonly dimension: D;
  readonly points: Tuple<MorrisBoardPoint<D, N>, P>;
  readonly mills: ReadonlyArray<Tuple<MorrisBoardCoord<D>, 3>>;
};

export enum MorrisPhase {
  PLACING = 'PLACING',
  MOVING = 'MOVING',
  FLYING = 'FLYING',
  LASKER = 'LASKER',
  'GAME_OVER' = 'GAME_OVER',
}

export enum MorrisMoveType {
  PLACE = 'PLACE',
  MOVE = 'MOVE',
  REMOVE = 'REMOVE',
}

export type MorrisMovePlace<D extends number, N extends number> = {
  readonly type: typeof MorrisMoveType.PLACE;
  readonly morris: Morris<N>;
  readonly to: MorrisBoardCoord<D>;
};

export type MorrisMoveMove<D extends number> = {
  readonly type: typeof MorrisMoveType.MOVE;
  readonly from: MorrisBoardCoord<D>;
  readonly to: MorrisBoardCoord<D>;
};

export type MorrisMoveRemove<D extends number, N extends number> = {
  readonly type: typeof MorrisMoveType.REMOVE;
  readonly morris: Morris<N>;
  readonly from: MorrisBoardCoord<D>;
};

export type MorrisMove<D extends number, N extends number> =
  | MorrisMovePlace<D, N>
  | MorrisMoveMove<D>
  | MorrisMoveRemove<D, N>;

// eslint-disable-next-line fp/no-nil
export function strMorrisMove<D extends number, N extends number>(move: MorrisMove<D, N>): string {
  switch (move.type) {
    case MorrisMoveType.PLACE:
      return `P: ${move.morris.color} ${move.to}`;
    case MorrisMoveType.MOVE:
      return `M: ${move.from} ${move.to}`;
    case MorrisMoveType.REMOVE:
      return `R: ${move.morris.color} ${move.from}`;
  }
}

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
  readonly curMoveColor: MorrisColor;
  readonly phaseIdx: number;
  readonly morrisWhite: Tuple<MorrisWhite<N>, N>;
  readonly morrisBlack: Tuple<MorrisBlack<N>, N>;
  readonly board: MorrisBoard<P, D, N>;
  readonly moves: ReadonlyArray<MorrisMove<D, N>>;
};

export type MorrisGameTick<P extends number, D extends number, N extends number> = P.Effect.Effect<RulesImpl, never>;
// export type MorrisGameTick<P extends number, D extends number, N extends number> = {
//   readonly tick: ()
// };
