import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import { someE } from '../../lib/utils';
import { boardGetPointByCoord } from '../board/points';
import {
  boardGetOccupiedPointForMorris,
  boardHasMorrisBeenPlaced,
  boardListAdjacentPointsEmpty,
  boardListEmptyPoints,
  boardListMillCandidatesForMove,
  boardListMorrisOnBoardForColor,
  boardListOccupiedPointsByColor,
} from '../board/query';
import type { Morris, MorrisBoardCoord } from '../board/schemas';
import { isOccupiedBoardPoint } from '../board/schemas';
import { flipColor, MorrisColor, MorrisMoveType } from '../consts';
import type { MorrisGame } from '../game';
import { gameApplyMoveToGameBoard, gameGetPossibleNextPlaceMorris } from '../game';
import type { MorrisFactsGame } from '../rules/factsGame';
import { moveColor, moveCreateMove, moveCreatePlace, moveCreateRemove } from './index';
import type { MorrisMove } from './schemas';

export function moveListUnusedMorrisForColor(game: MorrisGame, color: MorrisColor): ReadonlyArray<Morris> {
  return color === MorrisColor.WHITE ? game.gameState.morrisWhite : game.gameState.morrisBlack;
}

export function moveHasUnusedMorrisForColor(game: MorrisGame, color: MorrisColor): boolean {
  return moveListUnusedMorrisForColor(game, color).length > 0;
}

export function moveListValidPlaceMovesForMorris(
  game: MorrisGame,
  morris: Morris
): P.Effect.Effect<ReadonlyArray<MorrisMove>, MorrisEngineError> {
  const emptyPoints = boardListEmptyPoints(game.gameState.board);
  return P.Effect.succeed(emptyPoints.map((p) => moveCreatePlace(morris.color, p.coord)));
}

export function moveListValidMoveMovesForMorris(
  game: MorrisGame,
  morris: Morris
): P.Effect.Effect<ReadonlyArray<MorrisMove>, MorrisEngineError> {
  return P.pipe(
    boardGetOccupiedPointForMorris(game.gameState.board, morris),
    P.Effect.flatMap((point) =>
      P.pipe(
        boardListAdjacentPointsEmpty(game.gameState.board, point),
        P.Effect.map((emptyPoints) => emptyPoints.map((ep) => moveCreateMove(point.coord, ep.coord)))
      )
    )
  );
}

export function moveListValidRemoveMovesForMorris(
  game: MorrisGame,
  morris: Morris
): P.Effect.Effect<ReadonlyArray<MorrisMove>, MorrisEngineError> {
  const oppositeMorrisPoints = boardListOccupiedPointsByColor(game.gameState.board, flipColor(morris.color));
  return P.Effect.succeed(oppositeMorrisPoints.map((p) => moveCreateRemove(p.coord)));
}

export function moveListValidMovesForMorris(
  game: MorrisGame,
  facts: MorrisFactsGame,
  morris: Morris
): P.Effect.Effect<ReadonlyArray<MorrisMove>, MorrisEngineError> {
  if (boardHasMorrisBeenPlaced(game.gameState.board, morris)) {
    if (!facts.isMovingPhase && !facts.isLaskerPhase) {
      return P.Effect.succeed([]);
    }

    if (facts.isRemoveMode) {
      return moveListValidRemoveMovesForMorris(game, morris);
    } else {
      return moveListValidMoveMovesForMorris(game, morris);
    }
  } else {
    if (!facts.isPlacingPhase && !facts.isLaskerPhase) {
      return P.Effect.fail(
        toMorrisEngineError(`Morris ${morris.color} has not been placed, but it is not placing or Lasker phase`)
      );
    }

    return moveListValidPlaceMovesForMorris(game, morris);
  }

  // Absurd
  return P.Effect.fail(toMorrisEngineError('Logic error'));
}

export function moveListValidMovesForColor(
  game: MorrisGame,
  facts: MorrisFactsGame,
  color: MorrisColor
): P.Effect.Effect<ReadonlyArray<MorrisMove>, MorrisEngineError> {
  // eslint-disable-next-line fp/no-nil
  const placedMorris = boardListMorrisOnBoardForColor(game.gameState.board, color);

  return P.pipe(
    gameGetPossibleNextPlaceMorris(game, color),
    P.Effect.map((unusedMorris) =>
      P.pipe(
        unusedMorris,
        P.Option.match({
          onNone: () => placedMorris,
          onSome: (unusedMorris) => [unusedMorris, ...placedMorris] as ReadonlyArray<Morris>,
        })
      )
    ),
    P.Effect.flatMap((morrisList) =>
      P.pipe(
        morrisList,
        P.Effect.reduce([] as ReadonlyArray<MorrisMove>, (acc, morris) =>
          P.pipe(
            moveListValidMovesForMorris(game, facts, morris),
            P.Effect.map((moves) => [...acc, ...moves])
          )
        )
      )
    )
  );
}

export function moveCountValidMovesForColor(
  game: MorrisGame,
  facts: MorrisFactsGame,
  color: MorrisColor
): P.Effect.Effect<number, MorrisEngineError> {
  return P.pipe(
    moveListValidMovesForColor(game, facts, color),
    P.Effect.map((moves) => moves.length)
  );
}

export function moveMakesMill(game: MorrisGame, move: MorrisMove): P.Effect.Effect<boolean, MorrisEngineError> {
  // A REMOVE move can never create a mill
  if (move.type === MorrisMoveType.REMOVE) {
    return P.Effect.succeed(false);
  }

  // For each mill possibility, check if the other two points are the same color as the move
  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('moveColor', () => moveColor(game, move)),
    P.Effect.bind('newGame', () => gameApplyMoveToGameBoard(game, move)),
    P.Effect.flatMap(({ moveColor, newGame }) =>
      P.pipe(
        boardListMillCandidatesForMove(newGame.gameState.board, move),
        someE<never, MorrisEngineError, ReadonlyArray<MorrisBoardCoord>>((candidate) =>
          P.pipe(
            candidate,
            P.ReadonlyArray.map((coord) => boardGetPointByCoord(newGame.gameState.board, coord)),
            P.Effect.all,
            P.Effect.map((points) => points.every((p) => isOccupiedBoardPoint(p) && p.occupant.color === moveColor))
          )
        )
      )
    )
  );
}
