import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import { boardHash } from '../board';
import {
  boardGetMorrisAtCoord,
  boardGetPointByCoord,
  boardSetPointEmpty,
  boardSetPointOccupant,
} from '../board/points';
import type { Morris, MorrisBlack, MorrisBoard, MorrisWhite } from '../board/schemas';
import { MorrisColor, MorrisGameResult, MorrisMoveType } from '../consts';
import type { MorrisMove } from '../moves/schemas';
import type { MorrisFactsGame } from '../rules/factsGame';
import { BOOTSTRAP_INITIAL_MORRIS_FACTS_GAME } from '../rules/factsGame';
import type { MorrisFactsMove } from '../rules/factsMove';
import type { MorrisGameTick } from '../tick';
import { tickCreate } from '../tick';
import { gameDeriveStartMessage } from './message';
import type { MorrisGameState } from './schemas';

export type MorrisGame<P extends number, D extends number, N extends number> = {
  readonly gameState: MorrisGameState<P, D, N>;
  readonly initMorrisBoard: () => MorrisBoard<P, D, N>;
  readonly initMorrisWhite: () => ReadonlyArray<MorrisWhite<N>>;
  readonly initMorrisBlack: () => ReadonlyArray<MorrisBlack<N>>;
};

// --------------------------------------------------------------------------
export const MorrisGameStateBoilerplate = {
  result: MorrisGameResult.IN_PROGRESS,
  lastMillCounter: 0,
  morrisWhiteRemoved: [],
  morrisBlackRemoved: [],
  history: {
    moves: [],
    moveFacts: [],
    historyPtr: -1,
  },
};

// --------------------------------------------------------------------------
export function gameSetStartColor<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  color: MorrisColor
): MorrisGame<P, D, N> {
  return {
    ...game,
    gameState: {
      ...game.gameState,
      startColor: color,
    },
  };
}

export function gameSetStartColorRandom<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>
): MorrisGame<P, D, N> {
  return gameSetStartColor(game, Math.random() <= 0.5 ? MorrisColor.WHITE : MorrisColor.BLACK);
}

export function gameStart<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>
): P.Effect.Effect<never, MorrisEngineError, MorrisGameTick<P, D, N>> {
  return tickCreate(game, BOOTSTRAP_INITIAL_MORRIS_FACTS_GAME(game), 0, gameDeriveStartMessage(game));
}

/**
 * Helper to update the game result state
 */
export function gameSetResult<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  result: MorrisGameResult
): MorrisGame<P, D, N> {
  return { ...game, gameState: { ...game.gameState, result } };
}

// --------------------------------------------------------------------------
export function gameReset<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>
): MorrisGame<P, D, N> {
  return {
    ...game,
    gameState: {
      ...game.gameState,
      ...MorrisGameStateBoilerplate,

      board: game.initMorrisBoard(),
      morrisWhite: game.initMorrisWhite(),
      morrisBlack: game.initMorrisBlack(),
      positions: [boardHash(game.initMorrisBoard())],
    },
  };
}

// --------------------------------------------------------------------------
export function gameGetNextPlaceMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  color: MorrisColor
): P.Effect.Effect<never, MorrisEngineError, Morris<N>> {
  const nextMorris = color === MorrisColor.WHITE ? game.gameState.morrisWhite[0] : game.gameState.morrisBlack[0];
  return nextMorris
    ? P.Effect.succeed(nextMorris)
    : P.Effect.fail(toMorrisEngineError(`No available Morris to place for ${color}`));
}

export function gameHasUnplacedMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  color: MorrisColor
): boolean {
  return color === MorrisColor.WHITE ? game.gameState.morrisWhite.length > 0 : game.gameState.morrisBlack.length > 0;
}

export function gameGetPossibleNextPlaceMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  color: MorrisColor
): P.Effect.Effect<never, MorrisEngineError, P.Option.Option<Morris<N>>> {
  return P.pipe(
    gameGetNextPlaceMorris(game, color),
    P.Effect.map((morris) => P.Option.some(morris)),
    P.Effect.orElseSucceed(P.Option.none)
  );
}

/**
 * Helper function to remove a morris, of a given color, from the unused morris pool
 */
export function gameUseMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  morris: Morris<N>
): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> {
  const morrisWhiteWithout =
    morris.color === MorrisColor.WHITE
      ? game.gameState.morrisWhite.filter((i: MorrisWhite<N>) => i.n !== morris.n)
      : game.gameState.morrisWhite;
  const morrisBlackWithout =
    morris.color === MorrisColor.BLACK
      ? game.gameState.morrisBlack.filter((i: MorrisBlack<N>) => i.n !== morris.n)
      : game.gameState.morrisBlack;

  return P.Effect.succeed({
    ...game,
    gameState: {
      ...game.gameState,
      morrisWhite: morrisWhiteWithout,
      morrisBlack: morrisBlackWithout,
    },
  });
}

/**
 * Helper function to replace a given morris into the unused morris pool
 */
export function gameUnUseMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  morris: Morris<N>
): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> {
  const morrisWhiteWith =
    morris.color === MorrisColor.WHITE ? [morris, ...game.gameState.morrisWhite] : game.gameState.morrisWhite;
  const morrisBlackWith =
    morris.color === MorrisColor.BLACK ? [morris, ...game.gameState.morrisBlack] : game.gameState.morrisBlack;

  return P.Effect.succeed({
    ...game,
    gameState: {
      ...game.gameState,
      morrisWhite: morrisWhiteWith,
      morrisBlack: morrisBlackWith,
    },
  });
}

/**
 * Helper function to add a given morris to the removed morris pool
 */
export function gameDiscardMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  morris: Morris<N>
): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> {
  const morrisWhiteRemovedWith =
    morris.color === MorrisColor.WHITE
      ? [morris, ...game.gameState.morrisWhiteRemoved]
      : game.gameState.morrisWhiteRemoved;
  const morrisBlackRemovedWith =
    morris.color === MorrisColor.BLACK
      ? [morris, ...game.gameState.morrisBlackRemoved]
      : game.gameState.morrisBlackRemoved;

  return P.Effect.succeed({
    ...game,
    gameState: {
      ...game.gameState,
      morrisWhiteRemoved: morrisWhiteRemovedWith,
      morrisBlackRemoved: morrisBlackRemovedWith,
    },
  });
}

/**
 * Helper function to restore a given morris from the removed morris pool
 */
export function gameUnDiscardMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  color: MorrisColor
): P.Effect.Effect<never, MorrisEngineError, [MorrisGame<P, D, N>, Morris<N>]> {
  const morris =
    color === MorrisColor.WHITE ? game.gameState.morrisWhiteRemoved[0] : game.gameState.morrisBlackRemoved[0];
  if (!morris) {
    return P.Effect.fail(toMorrisEngineError(`No Morris to un-discard for ${color}`));
  }

  const morrisWhiteRemovedWithout =
    morris.color === MorrisColor.WHITE ? [...game.gameState.morrisWhiteRemoved] : game.gameState.morrisWhiteRemoved;
  const morrisBlackRemovedWithout =
    morris.color === MorrisColor.BLACK ? [...game.gameState.morrisBlackRemoved] : game.gameState.morrisBlackRemoved;

  return P.Effect.succeed([
    {
      ...game,
      gameState: {
        ...game.gameState,
        morrisWhiteRemoved: morrisWhiteRemovedWithout,
        morrisBlackRemoved: morrisBlackRemovedWithout,
      },
    },
    morris,
  ]);
}

// --------------------------------------------------------------------------
/**
 * Apply the give move to the game board, without updating other game state
 */
// eslint-disable-next-line fp/no-nil
export function gameApplyMoveToGameBoard<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  move: MorrisMove<D>
): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> {
  switch (move.type) {
    case MorrisMoveType.PLACE:
      return P.pipe(
        gameGetNextPlaceMorris(game, move.color),
        P.Effect.flatMap((morris) =>
          P.pipe(
            gameUseMorris(game, morris),
            P.Effect.flatMap((game) => boardSetPointOccupant(game, move.to, morris))
          )
        )
      );

    case MorrisMoveType.MOVE:
      return P.pipe(
        P.Effect.Do,
        P.Effect.bind('point', () => boardGetPointByCoord(game.gameState.board, move.from)),
        P.Effect.bind('newGame', () => boardSetPointEmpty(game, move.from)),
        P.Effect.flatMap(({ newGame, point }) => boardSetPointOccupant(newGame, move.to, point.occupant))
      );

    case MorrisMoveType.REMOVE:
      return P.pipe(
        boardGetMorrisAtCoord<P, D, N>(game.gameState.board, move.from),
        P.Effect.flatMap((morris) =>
          P.pipe(
            boardSetPointEmpty(game, move.from),
            P.Effect.flatMap((game) => gameDiscardMorris(game, morris))
          )
        )
      );
    case MorrisMoveType.ROOT:
      return P.Effect.fail(toMorrisEngineError('Logic error: cannot apply the root move'));
  }
}

/**
 * Undo the give move to the game board, without updating other game state
 */
// eslint-disable-next-line fp/no-nil
export function gameUnApplyMoveToGameBoard<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  move: MorrisMove<D>,
  oldMoveFacts: MorrisFactsMove
): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> {
  switch (move.type) {
    case MorrisMoveType.PLACE:
      return P.pipe(
        boardGetMorrisAtCoord<P, D, N>(game.gameState.board, move.to),
        P.Effect.flatMap((morris) =>
          P.pipe(
            gameUnUseMorris(game, morris),
            P.Effect.flatMap((game) => boardSetPointEmpty(game, move.to))
          )
        )
      );

    case MorrisMoveType.MOVE:
      return P.pipe(
        P.Effect.Do,
        P.Effect.bind('point', () => boardGetPointByCoord(game.gameState.board, move.to)),
        P.Effect.bind('newGame', () => boardSetPointEmpty(game, move.to)),
        P.Effect.flatMap(({ newGame, point }) => boardSetPointOccupant(newGame, move.from, point.occupant))
      );

    case MorrisMoveType.REMOVE:
      const colorToReplace = oldMoveFacts.moveMakesNextTurnWhite ? MorrisColor.WHITE : MorrisColor.BLACK;
      return P.pipe(
        gameUnDiscardMorris(game, colorToReplace),
        P.Effect.flatMap(([game, morris]) => P.pipe(boardSetPointOccupant(game, move.from, morris)))
      );

    case MorrisMoveType.ROOT:
      return P.Effect.fail(toMorrisEngineError('Logic error: cannot un-apply the root move'));
  }
}

// --------------------------------------------------------------------------
/**
 * Derive the game result from the given game facts
 */
export function gameDeriveResult(newFacts: MorrisFactsGame): MorrisGameResult {
  return newFacts.isWinWhite
    ? MorrisGameResult.WIN_WHITE
    : newFacts.isWinBlack
      ? MorrisGameResult.WIN_BLACK
      : newFacts.isDraw
        ? MorrisGameResult.DRAW
        : MorrisGameResult.IN_PROGRESS;
}
