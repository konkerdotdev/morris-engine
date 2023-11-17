import * as P from '@konker.dev/effect-ts-prelude';

import type { Range1, Tuple } from './utils';

/**
 * Morris Engine
 *
 * Author: Konrad Markus <mail@konker.dev>
 */

export type EmptyMorris = 'EMPTY' & P.Brand.Brand<'EmptyMorris'>;
export const EmptyMorris: EmptyMorris = P.pipe('EMPTY', P.Brand.nominal<EmptyMorris>());

export const MorrisColorBlack = 'B';
export const MorrisColorWhite = 'W';
export type MorrisColor = typeof MorrisColorBlack | typeof MorrisColorWhite;

export type MorrisBlack = {
  readonly color: typeof MorrisColorBlack;
  readonly n: number;
};
export type MorrisWhite = {
  readonly color: typeof MorrisColorWhite;
  readonly n: number;
};

export type Morris = MorrisBlack | MorrisWhite | EmptyMorris;

export type MorrisPoint = {
  readonly x: number;
  readonly y: number;
  readonly links: ReadonlyArray<number>;
  readonly occupant: Morris;
};

export type MorrisBoard<P extends number, D extends number> = {
  readonly type: P;
  readonly dimension: D;
  readonly points: Tuple<MorrisPoint, P>;
};

export const MorrisPhasePlacing = 'PLACING';
export const MorrisPhaseMoving = 'MOVING';
export const MorrisPhaseFlying = 'FLYING';
export const MorrisPhaseLasker = 'LASKER';
export type MorrisPhase =
  | typeof MorrisPhasePlacing
  | typeof MorrisPhaseMoving
  | typeof MorrisPhaseFlying
  | typeof MorrisPhaseLasker;

export const MorrisMoveTypePlace = 'PLACE';
export const MorrisMoveTypeMove = 'MOVE';
// export const MorrisMoveTypeRemove = 'REMOVE';
export type MorrisMoveType = typeof MorrisMoveTypePlace | typeof MorrisMoveTypeMove; // | typeof MorrisMoveTypeRemove;

export type MorrisMovePlace<C extends MorrisColor, P extends number> = {
  readonly type: typeof MorrisMoveTypePlace;
  readonly color: C;
  readonly to: Range1<P>;
};

export type MorrisMoveMove<C extends MorrisColor, P extends number> = {
  readonly type: typeof MorrisMoveTypeMove;
  readonly color: C;
  readonly from: Range1<P>;
  readonly to: Range1<P>;
};

// export type MorrisMoveRemove<C extends MorrisColor, P extends number> = {
//   readonly type: typeof MorrisMoveTypeRemove;
//   readonly color: C;
//   readonly from: Range1<P>;
// };

export type MorrisMove<P extends number> =
  | MorrisMovePlace<typeof MorrisColorBlack, P>
  | MorrisMovePlace<typeof MorrisColorWhite, P>
  | MorrisMoveMove<typeof MorrisColorBlack, P>
  | MorrisMoveMove<typeof MorrisColorWhite, P>;
// | MorrisMoveRemove<typeof MorrisColorBlack, P>
// | MorrisMoveRemove<typeof MorrisColorWhite, P>;

export type MorrisGameConfig = {
  readonly name: string;
  readonly numMorrisPerPlayer: number;
  readonly flyingThreshold?: number;
  readonly numMillsToWinThreshold?: number; // 1 for 3MM
  readonly phases: ReadonlyArray<MorrisPhase>; // 3MM: [PLACING, MOVING], L: [LASKER, MOVING]
};

export type MorrisGameState = {
  readonly currentTurn: MorrisColor;
  readonly currentPhase: MorrisPhase;
};

export type MorrisGame<P extends number, D extends number> = {
  readonly config: MorrisGameConfig;
  readonly startColor: MorrisColor;
  readonly phaseIdx: number;
  readonly board: MorrisBoard<P, D>;
  readonly moves: ReadonlyArray<MorrisMove<P>>;
};
