import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import * as R from '../../lib/tiny-rules-fp';
import type { MorrisBoard, MorrisBoardPositionString } from '../board';
import { getPoint, getPointMorris, getPointsOccupied, setPointEmpty, setPointOccupant } from '../board/points';
import type { MorrisBoardCoordS } from '../board/schemas';
import type { MorrisPhase } from '../consts';
import { MorrisColor, MorrisGameResult, MorrisMoveType } from '../consts';
import type { Morris, MorrisBlack, MorrisWhite } from '../morris';
import type { MorrisMoveS } from '../moves/schemas';
import type { MorrisFactsGame } from '../rules/factsGame';
import type { MorrisFactsMove } from '../rules/factsMove';

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

export type MorrisGameHistoryItem<D extends number> = {
  readonly move: MorrisMoveS<D>;
  readonly moveFacts: MorrisFactsMove;
};

export type MorrisGame<P extends number, D extends number, N extends number> = {
  readonly config: MorrisGameConfig<N>;
  readonly startColor: MorrisColor;
  readonly result: MorrisGameResult;
  readonly lastMillCounter: number;
  readonly morrisWhite: ReadonlyArray<MorrisWhite<N>>;
  readonly morrisWhiteRemoved: ReadonlyArray<MorrisWhite<N>>;
  readonly morrisBlack: ReadonlyArray<MorrisBlack<N>>;
  readonly morrisBlackRemoved: ReadonlyArray<MorrisBlack<N>>;
  readonly board: MorrisBoard<P, D, N>;
  readonly history: ReadonlyArray<MorrisGameHistoryItem<D>>;
  readonly positions: ReadonlyArray<MorrisBoardPositionString<P>>;
};

// --------------------------------------------------------------------------
export function gameSetStartColor<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  color: MorrisColor
): MorrisGame<P, D, N> {
  return { ...game, startColor: color };
}

export function gameSetStartColorRandom<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>
): MorrisGame<P, D, N> {
  return gameSetStartColor(game, Math.random() <= 0.5 ? MorrisColor.WHITE : MorrisColor.BLACK);
}

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

export function hasUnplacedMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  color: MorrisColor
): boolean {
  return color === MorrisColor.WHITE ? game.morrisWhite.length > 0 : game.morrisBlack.length > 0;
}

export function getPossibleNextPlaceMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  color: MorrisColor
): P.Effect.Effect<never, MorrisEngineError, P.Option.Option<Morris<N>>> {
  return P.pipe(
    getNextPlaceMorris(game, color),
    P.Effect.map((morris) => P.Option.some(morris)),
    P.Effect.orElseSucceed(P.Option.none)
  );
}

export function getPlacedMorrisForColor<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  color: MorrisColor
): ReadonlyArray<Morris<N>> {
  return getPointsOccupied(game.board, color)
    .filter((p) => p.occupant.color === color)
    .map((p) => p.occupant);
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
    case MorrisMoveType.ROOT:
      return P.Effect.fail(toMorrisEngineError('Logic error: cannot apply the root move'));
  }
}

// --------------------------------------------------------------------------
export function resolveResult(newFacts: MorrisFactsGame): MorrisGameResult {
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

// eslint-disable-next-line fp/no-nil
export function deriveResultMessage<P extends number, D extends number, N extends number>(
  _move: MorrisMoveS<D>,
  _newGame: MorrisGame<P, D, N>,
  newFacts: MorrisFactsGame
): string {
  if (R.val(newFacts.isWinWhite)) {
    if (R.val(newFacts.isWinWhiteMillsMade)) return 'White wins! (number of mills made)';
    else if (R.val(newFacts.isWinWhiteOpponentCount)) return 'White wins! (too few black pieces left)';
    else if (R.val(newFacts.isWinWhiteOpponentNoValidMove)) return 'White wins! (no valid move left for black)';
    else return 'White wins!';
  } else if (R.val(newFacts.isWinBlack)) {
    if (R.val(newFacts.isWinBlackMillsMade)) return 'Black wins! (number of mills made)';
    else if (R.val(newFacts.isWinBlackOpponentCount)) return 'Black wins! (too few white pieces left)';
    else if (R.val(newFacts.isWinBlackOpponentNoValidMove)) return 'Black wins! (no valid move left for white)';
    else return 'Black wins!';
  } else {
    if (R.val(newFacts.isDrawNoMillsLimit)) return 'Draw (too many moves without a mill)';
    if (R.val(newFacts.isDrawPositionRepeatLimit)) return 'Draw (position repeated too many times)';
    else return 'Draw';
  }
}

export function deriveInvalidMoveErrorMessage<P extends number, D extends number, N extends number>(
  _move: MorrisMoveS<D>,
  _oldGame: MorrisGame<P, D, N>,
  moveFacts: MorrisFactsMove
): string {
  // TODO: more comprehensive]
  if (!R.val(moveFacts.moveIsCorrectColor)) return 'Invalid move: wrong color';
  if (!R.val(moveFacts.moveIsCorrectType)) return 'Invalid move: wrong move type';
  if (!R.val(moveFacts.moveIsPossible)) return 'Invalid move: move is not possible';
  return 'Invalid move';
}

export function deriveMessage<P extends number, D extends number, N extends number>(
  _move: MorrisMoveS<D>,
  _newGame: MorrisGame<P, D, N>,
  gameFacts: MorrisFactsGame
): P.Effect.Effect<never, MorrisEngineError, string> {
  const message = () => {
    // if (!R.val(gameFacts.moveIsValid)) return deriveInvalidMoveError(_move, _newGame, gameFacts);

    if (R.val(gameFacts.isGameOver)) return deriveResultMessage(_move, _newGame, gameFacts);

    if (R.val(gameFacts.isLaskerPhase)) {
      if (R.val(gameFacts.isTurnWhite)) return 'Place or move White';
      if (R.val(gameFacts.isTurnBlack)) return 'Place or move Black';
    }
    if (R.val(gameFacts.isRemoveMode)) {
      if (R.val(gameFacts.isTurnWhite)) return 'Remove Black';
      if (R.val(gameFacts.isTurnBlack)) return 'Remove White';
    }
    if (R.val(gameFacts.isPlacingPhase)) {
      if (R.val(gameFacts.isTurnWhite)) return 'Place White';
      if (R.val(gameFacts.isTurnBlack)) return 'Place Black';
    }
    if (R.val(gameFacts.isFlyingPhase)) {
      if (R.val(gameFacts.isTurnWhite)) return 'Fly White';
      if (R.val(gameFacts.isTurnBlack)) return 'Fly Black';
    }
    if (R.val(gameFacts.isMovingPhase)) {
      if (R.val(gameFacts.isTurnWhite)) return 'Move White';
      if (R.val(gameFacts.isTurnBlack)) return 'Move Black';
    }

    // eslint-disable-next-line fp/no-nil
    return undefined;
  };

  const ret = message();
  return ret ? P.Effect.succeed(ret) : P.Effect.fail(toMorrisEngineError('Logic error'));
}
