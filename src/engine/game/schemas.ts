import * as P from '@konker.dev/effect-ts-prelude';

import { MorrisBlack, MorrisBoard, MorrisBoardCoord, MorrisBoardPositionString, MorrisWhite } from '../board/schemas';
import { MorrisColor, MorrisGameResult, MorrisPhase } from '../consts';
import type { BoardDim, NumMorris, NumPoints } from '../index';
import { MorrisMove } from '../moves/schemas';
import { MorrisFactsMove } from '../rules/factsMove';

export function MorrisGameConfigParams(p: NumPoints, d: BoardDim, n: NumMorris) {
  return P.Schema.Struct({
    P: P.Schema.Literal(p),
    D: P.Schema.Literal(d),
    N: P.Schema.Literal(n),
  });
}
export type MorrisGameConfigParams = P.Schema.Schema.Type<ReturnType<typeof MorrisGameConfigParams>>;

export function MorrisGameConfig(d: BoardDim, n: NumMorris) {
  return P.Schema.Struct({
    name: P.Schema.String,
    numMorrisPerPlayer: P.Schema.Literal(n),
    forbiddenPointsFirstMove: P.Schema.Array(MorrisBoardCoord(d)),
    forbiddenPointsSecondMove: P.Schema.Array(MorrisBoardCoord(d)),
    forbiddenPointsPlacingPhase: P.Schema.Array(MorrisBoardCoord(d)),
    numMillsToWinThreshold: P.Schema.Number, // 1 for 3MM
    numMorrisForFlyingThreshold: P.Schema.Number,
    numMorrisToLoseThreshold: P.Schema.Number, // 2 for 9MM
    numMovesWithoutMillForDraw: P.Schema.Number,
    numPositionRepeatsForDraw: P.Schema.Number,
    phases: P.Schema.Array(P.Schema.Enums(MorrisPhase)), // 3MM: [PLACING, MOVING], L: [LASKER, MOVING]
  });
}
export type MorrisGameConfig = P.Schema.Schema.Type<ReturnType<typeof MorrisGameConfig>>;

// --------------------------------------------------------------------------
export function MorrisGameHistory(d: BoardDim) {
  return P.Schema.Struct({
    moves: P.Schema.Array(MorrisMove(d)),
    moveFacts: P.Schema.Array(MorrisFactsMove),
    historyPtr: P.Schema.Number,
  });
}
export type MorrisGameHistory = P.Schema.Schema.Type<ReturnType<typeof MorrisGameHistory>>;

export function MorrisGameHistoryEntry(d: BoardDim) {
  return P.Schema.Struct({
    // eslint-disable-next-line fp/no-nil
    lastMove: P.Schema.Union(MorrisMove(d), P.Schema.Undefined),
    // eslint-disable-next-line fp/no-nil
    lastMoveFacts: P.Schema.Union(MorrisFactsMove, P.Schema.Undefined),
  });
}
export type MorrisGameHistoryEntry = P.Schema.Schema.Type<ReturnType<typeof MorrisGameHistoryEntry>>;

// --------------------------------------------------------------------------
export function MorrisGameStateStructFields(t: string, p: NumPoints, d: BoardDim, n: NumMorris) {
  return {
    _tag: P.Schema.Literal(t),
    config: MorrisGameConfig(d, n),
    board: MorrisBoard(p, d, n),

    startColor: P.Schema.Enums(MorrisColor),
    result: P.Schema.Enums(MorrisGameResult),
    lastMillCounter: P.Schema.Number,
    morrisWhiteRemoved: P.Schema.Array(MorrisWhite(n)).pipe(P.Schema.maxItems(n)),
    morrisBlackRemoved: P.Schema.Array(MorrisBlack(n)).pipe(P.Schema.maxItems(n)),
    history: MorrisGameHistory(d),

    morrisWhite: P.Schema.Array(MorrisWhite(n)).pipe(P.Schema.maxItems(n)),
    morrisBlack: P.Schema.Array(MorrisBlack(n)).pipe(P.Schema.maxItems(n)),
    positions: P.Schema.Array(MorrisBoardPositionString(p)),
  };
}

export function MorrisGameState(t: string, p: NumPoints, d: BoardDim, n: NumMorris) {
  return P.Schema.parseJson(P.Schema.Struct(MorrisGameStateStructFields(t, p, d, n)));
}
export type MorrisGameState = P.Schema.Schema.Type<ReturnType<typeof MorrisGameState>>;
