import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import * as R from '../../lib/tiny-rules-fp';
import { someE } from '../../lib/utils';
import { isOccupiedBoardPoint } from '../board';
import { boardGetOccupiedPointForMorris, boardGetPointByCoord } from '../board/points';
import {
  boardHasMorrisBeenPlaced,
  boardListAdjacentPointsEmpty,
  boardListEmptyPoints,
  boardListMillCandidatesForMove,
  boardListOccupiedPointsByColor,
} from '../board/query';
import type { MorrisBoardCoordS } from '../board/schemas';
import { flipColor, MorrisColor, MorrisMoveType } from '../consts';
import type { MorrisGame } from '../game';
import { gameApplyMoveToGameBoard, gameGetPossibleNextPlaceMorris, gameListMorrisOnBoardForColor } from '../game';
import type { Morris } from '../morris';
import type { MorrisFactsGame } from '../rules/factsGame';
import { moveColor, moveCreateMove, moveCreatePlace, moveCreateRemove } from './index';
import type { MorrisMoveS } from './schemas';

export function moveListUnusedMorrisForColor<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  color: MorrisColor
): ReadonlyArray<Morris<N>> {
  return color === MorrisColor.WHITE ? game.morrisWhite : game.morrisBlack;
}

export function moveHasUnusedMorrisForColor<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  color: MorrisColor
): boolean {
  return moveListUnusedMorrisForColor(game, color).length > 0;
}

export function moveListValidPlaceMovesForMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  morris: Morris<N>
): P.Effect.Effect<never, MorrisEngineError, ReadonlyArray<MorrisMoveS<D>>> {
  const emptyPoints = boardListEmptyPoints(game.board);
  return P.Effect.succeed(emptyPoints.map((p) => moveCreatePlace<D>(morris.color, p.coord)));
}

export function moveListValidMoveMovesForMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  morris: Morris<N>
): P.Effect.Effect<never, MorrisEngineError, ReadonlyArray<MorrisMoveS<D>>> {
  return P.pipe(
    boardGetOccupiedPointForMorris(game.board, morris),
    P.Effect.flatMap((point) =>
      P.pipe(
        boardListAdjacentPointsEmpty(game.board, point),
        P.Effect.map((emptyPoints) => emptyPoints.map((ep) => moveCreateMove(point.coord, ep.coord)))
      )
    )
  );
}

export function moveListValidRemoveMovesForMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  morris: Morris<N>
): P.Effect.Effect<never, MorrisEngineError, ReadonlyArray<MorrisMoveS<D>>> {
  const oppositeMorrisPoints = boardListOccupiedPointsByColor(game.board, flipColor(morris.color));
  return P.Effect.succeed(oppositeMorrisPoints.map((p) => moveCreateRemove(p.coord)));
}

export function moveListValidMovesForMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  facts: MorrisFactsGame,
  morris: Morris<N>
): P.Effect.Effect<never, MorrisEngineError, ReadonlyArray<MorrisMoveS<D>>> {
  if (boardHasMorrisBeenPlaced(game.board, morris)) {
    if (!R.val(facts.isMovingPhase) && !R.val(facts.isLaskerPhase)) {
      return P.Effect.succeed([]);
    }

    if (R.val(facts.isRemoveMode)) {
      return moveListValidRemoveMovesForMorris(game, morris);
    } else {
      return moveListValidMoveMovesForMorris(game, morris);
    }
  } else {
    if (!R.val(facts.isPlacingPhase) && !R.val(facts.isLaskerPhase)) {
      return P.Effect.fail(
        toMorrisEngineError(`Morris ${morris.color} has not been placed, but it is not placing or Lasker phase`)
      );
    }

    return moveListValidPlaceMovesForMorris(game, morris);
  }

  // Absurd
  return P.Effect.fail(toMorrisEngineError('Logic error'));
}

export function moveListValidMovesForColor<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  facts: MorrisFactsGame,
  color: MorrisColor
): P.Effect.Effect<never, MorrisEngineError, ReadonlyArray<MorrisMoveS<D>>> {
  // eslint-disable-next-line fp/no-nil
  const placedMorris = gameListMorrisOnBoardForColor(game, color);

  return P.pipe(
    gameGetPossibleNextPlaceMorris(game, color),
    P.Effect.map((unusedMorris) =>
      P.pipe(
        unusedMorris,
        P.Option.match({
          onNone: () => placedMorris,
          onSome: (unusedMorris) => [unusedMorris, ...placedMorris] as ReadonlyArray<Morris<N>>,
        })
      )
    ),
    P.Effect.flatMap((morrisList) =>
      P.pipe(
        morrisList,
        P.Effect.reduce([] as ReadonlyArray<MorrisMoveS<D>>, (acc, morris) =>
          P.pipe(
            moveListValidMovesForMorris(game, facts, morris),
            P.Effect.map((moves) => [...acc, ...moves])
          )
        )
      )
    )
  );
}

export function moveCountValidMovesForColor<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  facts: MorrisFactsGame,
  color: MorrisColor
): P.Effect.Effect<never, MorrisEngineError, number> {
  return P.pipe(
    moveListValidMovesForColor(game, facts, color),
    P.Effect.map((moves) => moves.length)
  );
}

export function moveMakesMill<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  move: MorrisMoveS<D>
): P.Effect.Effect<never, MorrisEngineError, boolean> {
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
        boardListMillCandidatesForMove(newGame.board, move),
        someE<never, MorrisEngineError, ReadonlyArray<MorrisBoardCoordS<D>>>((candidate) =>
          P.pipe(
            candidate,
            P.ReadonlyArray.map((coord) => boardGetPointByCoord(newGame.board, coord)),
            P.Effect.all,
            P.Effect.map((points) => points.every((p) => isOccupiedBoardPoint(p) && p.occupant.color === moveColor))
          )
        )
      )
    )
  );
}
