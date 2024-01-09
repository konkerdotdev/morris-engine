import * as P from '@konker.dev/effect-ts-prelude';

import { MorrisBlack, MorrisBoard, MorrisBoardCoord, MorrisBoardPositionString, MorrisWhite } from '../board/schemas';
import { MorrisColor, MorrisGameResult, MorrisPhase } from '../consts';
import { MorrisMove } from '../moves/schemas';
import { MorrisFactsMove } from '../rules/factsMove';

export function MorrisGameConfigParams(p: number, d: number, n: number) {
  return P.Schema.struct({
    P: P.Schema.literal(p),
    D: P.Schema.literal(d),
    N: P.Schema.literal(n),
  });
}
export type MorrisGameConfigParams = P.Schema.Schema.To<ReturnType<typeof MorrisGameConfigParams>>;

export function MorrisGameConfig(p: number, d: number, n: number) {
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
export type MorrisGameConfig = P.Schema.Schema.To<ReturnType<typeof MorrisGameConfig>>;

// --------------------------------------------------------------------------
export function MorrisGameHistory(d: number) {
  return P.Schema.struct({
    moves: P.Schema.array(MorrisMove(d)),
    moveFacts: P.Schema.array(MorrisFactsMove),
    historyPtr: P.Schema.number,
  });
}
export type MorrisGameHistory = P.Schema.Schema.To<ReturnType<typeof MorrisGameHistory>>;

export function MorrisGameHistoryEntry(d: number) {
  return P.Schema.struct({
    // eslint-disable-next-line fp/no-nil
    lastMove: P.Schema.union(MorrisMove(d), P.Schema.undefined),
    // eslint-disable-next-line fp/no-nil
    lastMoveFacts: P.Schema.union(MorrisFactsMove, P.Schema.undefined),
  });
}
export type MorrisGameHistoryEntry = P.Schema.Schema.To<ReturnType<typeof MorrisGameHistoryEntry>>;

// --------------------------------------------------------------------------
export function MorrisGameStateStructFields<T extends string>(t: T, p: number, d: number, n: number) {
  return {
    _tag: P.Schema.literal(t),
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

export function MorrisGameState(t: string, p: number, d: number, n: number) {
  return P.Schema.ParseJson.pipe(P.Schema.compose(P.Schema.struct(MorrisGameStateStructFields(t, p, d, n))));
}
export type MorrisGameState = P.Schema.Schema.To<ReturnType<typeof MorrisGameState>>;
