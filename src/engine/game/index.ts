import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import * as R from '../../lib/tiny-rules-fp';
import type { MorrisBoard, MorrisBoardPositionString } from '../board';
import { getPoint, getPointMorris, setPointEmpty, setPointOccupant } from '../board/points';
import type { MorrisBoardCoordS } from '../board/schemas';
import type { MorrisPhase } from '../consts';
import { MorrisColor, MorrisGameResult, MorrisMoveType } from '../consts';
import type { Morris, MorrisBlack, MorrisWhite } from '../morris';
import type { MorrisMoveS } from '../moves/schemas';
import type { MorrisGameFacts } from '../rules/facts';

// --------------------------------------------------------------------------
export type MorrisGameConfig<N extends number> = {
  readonly name: string;
  readonly numMorrisPerPlayer: N;
  readonly forbiddenPointsFirstMove: Array<MorrisBoardCoordS<any>>;
  readonly forbiddenPointsSecondMove: Array<MorrisBoardCoordS<any>>;
  readonly forbiddenPointsPlacingPhase: Array<MorrisBoardCoordS<any>>;
  readonly numMillsToWinThreshold: number; // 1 for 3MM
  readonly numMorrisForFlyingThreshold: number;
  readonly numMorrisToLoseThreshold: number; // 2 for 9MM
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
  readonly moves: ReadonlyArray<MorrisMoveS<D>>;
  readonly positions: ReadonlyArray<MorrisBoardPositionString<P>>;
};

// --------------------------------------------------------------------------
export function getNextPlaceMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  color: MorrisColor
): P.Effect.Effect<never, MorrisEngineError, Morris<N>> {
  const nextMorris = color === MorrisColor.WHITE ? game.morrisWhite[0] : game.morrisBlack[0];
  return nextMorris
    ? P.Effect.succeed(nextMorris)
    : P.Effect.fail(toMorrisEngineError(`No available Morris to place for ${color}`));
}

export function useMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  morris: Morris<N>
): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> {
  const morrisWhiteWithout =
    morris.color === MorrisColor.WHITE ? game.morrisWhite.filter((i) => i.n !== morris.n) : game.morrisWhite;
  const morrisBlackWithout =
    morris.color === MorrisColor.BLACK ? game.morrisBlack.filter((i) => i.n !== morris.n) : game.morrisBlack;

  return P.Effect.succeed({
    ...game,
    morrisWhite: morrisWhiteWithout,
    morrisBlack: morrisBlackWithout,
  });
}

export function discardMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  morris: Morris<N>
): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> {
  const morrisWhiteRemovedWith =
    morris.color === MorrisColor.WHITE ? [...game.morrisWhiteRemoved, morris] : game.morrisWhiteRemoved;
  const morrisBlackRemovedWith =
    morris.color === MorrisColor.BLACK ? [...game.morrisBlackRemoved, morris] : game.morrisBlackRemoved;

  return P.Effect.succeed({
    ...game,
    morrisWhiteRemoved: morrisWhiteRemovedWith,
    morrisBlackRemoved: morrisBlackRemovedWith,
  });
}

// --------------------------------------------------------------------------
// eslint-disable-next-line fp/no-nil
export function applyMoveToGameBoard<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  move: MorrisMoveS<D>
): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> {
  switch (move.type) {
    case MorrisMoveType.PLACE:
      return P.pipe(
        getNextPlaceMorris(game, move.color),
        P.Effect.flatMap((morris) =>
          P.pipe(
            useMorris(game, morris),
            P.Effect.flatMap((game) => setPointOccupant(game, move.to, morris))
          )
        )
      );

    case MorrisMoveType.MOVE:
      return P.pipe(
        P.Effect.Do,
        P.Effect.bind('point', () => getPoint(game.board, move.from)),
        P.Effect.bind('newGame', () => setPointEmpty(game, move.from)),
        P.Effect.flatMap(({ newGame, point }) => setPointOccupant(newGame, move.to, point.occupant))
      );

    case MorrisMoveType.REMOVE:
      return P.pipe(
        getPointMorris(game.board, move.from),
        P.Effect.flatMap((morris) =>
          P.pipe(
            setPointEmpty(game, move.from),
            P.Effect.flatMap((game) => discardMorris(game, morris))
          )
        )
      );
  }
}

// --------------------------------------------------------------------------
export function resolveResult(newFacts: MorrisGameFacts): MorrisGameResult {
  return R.val(newFacts.isWinWhite)
    ? MorrisGameResult.WIN_WHITE
    : R.val(newFacts.isWinBlack)
      ? MorrisGameResult.WIN_BLACK
      : R.val(newFacts.isDraw)
        ? MorrisGameResult.DRAW
        : MorrisGameResult.IN_PROGRESS;
}

export function deriveStartMessage<P extends number, D extends number, N extends number>(
  newGame: MorrisGame<P, D, N>
): string {
  return newGame.startColor === MorrisColor.WHITE ? 'Place White' : 'Place Black';
}

export function deriveMessage<P extends number, D extends number, N extends number>(
  newGame: MorrisGame<P, D, N>,
  newFacts: MorrisGameFacts,
  _move: MorrisMoveS<D>
): P.Effect.Effect<never, MorrisEngineError, string> {
  const message = () => {
    if (!R.val(newFacts.moveIsValid)) return 'Invalid Move';
    if (R.val(newFacts.isGameOver)) return newGame.result;

    if (R.val(newFacts.isLaskerPhase)) {
      if (R.val(newFacts.isTurnWhite)) return 'Place or move White';
      if (R.val(newFacts.isTurnBlack)) return 'Place or move Black';
    }
    if (R.val(newFacts.isRemoveMode)) {
      if (R.val(newFacts.isTurnWhite)) return 'Remove Black';
      if (R.val(newFacts.isTurnBlack)) return 'Remove White';
    }
    if (R.val(newFacts.isPlacingPhase)) {
      if (R.val(newFacts.isTurnWhite)) return 'Place White';
      if (R.val(newFacts.isTurnBlack)) return 'Place Black';
    }
    if (R.val(newFacts.isFlyingPhase)) {
      if (R.val(newFacts.isTurnWhite)) return 'Fly White';
      if (R.val(newFacts.isTurnBlack)) return 'Fly Black';
    }
    if (R.val(newFacts.isMovingPhase)) {
      if (R.val(newFacts.isTurnWhite)) return 'Move White';
      if (R.val(newFacts.isTurnBlack)) return 'Move Black';
    }

    // eslint-disable-next-line fp/no-nil
    return undefined;
  };

  const ret = message();
  return ret ? P.Effect.succeed(ret) : P.Effect.fail(toMorrisEngineError('Logic error'));
}
