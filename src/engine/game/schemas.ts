import * as P from '@konker.dev/effect-ts-prelude';

import { MorrisBlack, MorrisBoard, MorrisBoardCoord, MorrisBoardPositionString, MorrisWhite } from '../board/schemas';
import { MorrisColor, MorrisGameResult, MorrisPhase } from '../consts';
import { MorrisMove } from '../moves/schemas';
import { MorrisFactsMove } from '../rules/factsMove';

export function MorrisGameConfigParams<P extends number, D extends number, N extends number>(p: P, d: D, n: N) {
  return P.Schema.struct({
    P: P.Schema.literal(p),
    D: P.Schema.literal(d),
    N: P.Schema.literal(n),
  });
}
export type MorrisGameConfigParams<P extends number, D extends number, N extends number> = P.Schema.Schema.To<
  ReturnType<typeof MorrisGameConfigParams<P, D, N>>
>;

export function MorrisGameConfig<P extends number, D extends number, N extends number>(p: P, d: D, n: N) {
  return P.Schema.struct({
    name: P.Schema.string,
    params: MorrisGameConfigParams(p, d, n),
    numMorrisPerPlayer: P.Schema.number.pipe(P.Schema.between(1, n)),
    forbiddenPointsFirstMove: P.Schema.array(MorrisBoardCoord(d)),
    forbiddenPointsSecondMove: P.Schema.array(MorrisBoardCoord(d)),
    forbiddenPointsPlacingPhase: P.Schema.array(MorrisBoardCoord(d)),
    numMillsToWinThreshold: P.Schema.number, // 1 for 3MM
    numMorrisForFlyingThreshold: P.Schema.number,
    numMorrisToLoseThreshold: P.Schema.number, // 2 for 9MM
    numMovesWithoutMillForDraw: P.Schema.number,
    numPositionRepeatsForDraw: P.Schema.number,
    phases: P.Schema.array(P.Schema.enums(MorrisPhase)), // 3MM: [PLACING, MOVING], L: [LASKER, MOVING]
  });
}
export type MorrisGameConfig<P extends number, D extends number, N extends number> = P.Schema.Schema.To<
  ReturnType<typeof MorrisGameConfig<P, D, N>>
>;

// --------------------------------------------------------------------------
export function MorrisGameHistory<D extends number>(d: D) {
  return P.Schema.struct({
    moves: P.Schema.array(MorrisMove(d)),
    moveFacts: P.Schema.array(MorrisFactsMove),
    historyPtr: P.Schema.number,
  });
}
export type MorrisGameHistory<D extends number> = P.Schema.Schema.To<ReturnType<typeof MorrisGameHistory<D>>>;

export function MorrisGameHistoryEntry<D extends number>(d: D) {
  return P.Schema.struct({
    // eslint-disable-next-line fp/no-nil
    lastMove: P.Schema.union(MorrisMove(d), P.Schema.undefined),
    // eslint-disable-next-line fp/no-nil
    lastMoveFacts: P.Schema.union(MorrisFactsMove, P.Schema.undefined),
  });
}
export type MorrisGameHistoryEntry<D extends number> = P.Schema.Schema.To<ReturnType<typeof MorrisGameHistoryEntry<D>>>;

// --------------------------------------------------------------------------
export function MorrisGameStateStructFields<P extends number, D extends number, N extends number>(p: P, d: D, n: N) {
  return {
    _tag: P.Schema.string,
    config: MorrisGameConfig(p, d, n),
    board: MorrisBoard(p, d, n),

    startColor: P.Schema.enums(MorrisColor),
    result: P.Schema.enums(MorrisGameResult),
    lastMillCounter: P.Schema.number,
    morrisWhiteRemoved: P.Schema.array(MorrisWhite(n)).pipe(P.Schema.maxItems(n)),
    morrisBlackRemoved: P.Schema.array(MorrisBlack(n)).pipe(P.Schema.maxItems(n)),
    history: MorrisGameHistory(d),

    morrisWhite: P.Schema.array(MorrisWhite(n)).pipe(P.Schema.maxItems(n)),
    morrisBlack: P.Schema.array(MorrisBlack(n)).pipe(P.Schema.maxItems(n)),
    positions: P.Schema.array(MorrisBoardPositionString(p)),
  };
}

export function MorrisGameState<P extends number, D extends number, N extends number>(p: P, d: D, n: N) {
  return P.Schema.struct(MorrisGameStateStructFields(p, d, n));
}
export type MorrisGameState<P extends number, D extends number, N extends number> = P.Schema.Schema.To<
  ReturnType<typeof MorrisGameState<P, D, N>>
>;
