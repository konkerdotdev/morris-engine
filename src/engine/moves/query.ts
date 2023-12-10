import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import * as R from '../../lib/tiny-rules-fp';
import { someE } from '../../lib/utils';
import {
  countEmpty,
  countMorris,
  getOccupiedPointForMorris,
  getPoint,
  getPointsAdjacentEmpty,
  getPointsEmpty,
  getPointsOccupied,
  hasMorrisBeenPlaced,
  isOccupied,
} from '../board/points';
import { millCandidatesForMove } from '../board/query';
import type { MorrisBoardCoordS } from '../board/schemas';
import { MorrisColor, MorrisMoveType } from '../consts';
import type { MorrisGame } from '../game';
import { applyMoveToGameBoard, getPlacedMorrisForColor, getPossibleNextPlaceMorris } from '../game';
import type { Morris } from '../morris';
import type { MorrisGameFacts } from '../rules/facts';
import { createMoveMove, createMovePlace, createMoveRemove, flipColor, moveColor } from './index';
import type { MorrisMoveS } from './schemas';

export function getTurnColor<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>
): MorrisColor {
  return game.curMoveColor;
}

export function isTurn<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  color: MorrisColor
): boolean {
  return color === getTurnColor(game);
}

// --------------------------------------------------------------------------
export function getUnusedMorraeForColor<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  color: MorrisColor
): ReadonlyArray<Morris<N>> {
  return color === MorrisColor.WHITE ? game.morrisWhite : game.morrisBlack;
}

export function hasUnusedMorrisForColor<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  color: MorrisColor
): boolean {
  return getUnusedMorraeForColor(game, color).length > 0;
}

// --------------------------------------------------------------------------
export function getValidMovesForMorrisPlace<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  morris: Morris<N>
): P.Effect.Effect<never, MorrisEngineError, ReadonlyArray<MorrisMoveS<D>>> {
  const emptyPoints = getPointsEmpty(game.board);
  return P.Effect.succeed(emptyPoints.map((p) => createMovePlace<D>(morris.color, p.coord)));
}

export function getValidMovesForMorrisMove<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  morris: Morris<N>
): P.Effect.Effect<never, MorrisEngineError, ReadonlyArray<MorrisMoveS<D>>> {
  return P.pipe(
    getOccupiedPointForMorris(game.board, morris),
    P.Effect.flatMap((point) =>
      P.pipe(
        getPointsAdjacentEmpty(game.board, point),
        P.Effect.map((emptyPoints) => emptyPoints.map((ep) => createMoveMove(point.coord, ep.coord)))
      )
    )
  );
}

export function getValidMovesForMorrisRemove<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  morris: Morris<N>
): P.Effect.Effect<never, MorrisEngineError, ReadonlyArray<MorrisMoveS<D>>> {
  const oppositeMorrisPoints = getPointsOccupied(game.board, flipColor(morris.color));
  return P.Effect.succeed(oppositeMorrisPoints.map((p) => createMoveRemove(p.coord)));
}

// --------------------------------------------------------------------------
export function getValidMovesForMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  facts: MorrisGameFacts,
  morris: Morris<N>
): P.Effect.Effect<never, MorrisEngineError, ReadonlyArray<MorrisMoveS<D>>> {
  if (hasMorrisBeenPlaced(game.board, morris)) {
    if (!R.val(facts.isMovingPhase) && !R.val(facts.moveMakesMovingPhase) && !R.val(facts.isLaskerPhase)) {
      return P.Effect.succeed([]);
    }

    if (R.val(facts.isRemoveMode)) {
      return getValidMovesForMorrisRemove(game, morris);
    } else {
      return getValidMovesForMorrisMove(game, morris);
    }
  } else {
    if (!R.val(facts.isPlacingPhase) && !R.val(facts.isLaskerPhase)) {
      return P.Effect.fail(
        toMorrisEngineError(`Morris ${morris.color} has not been placed, but it is not placing or Lasker phase`)
      );
    }

    return getValidMovesForMorrisPlace(game, morris);
  }

  // Absurd
  return P.Effect.fail(toMorrisEngineError('Logic error'));
}

// --------------------------------------------------------------------------
export function getValidMovesForColor<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  facts: MorrisGameFacts,
  color: MorrisColor
): P.Effect.Effect<never, MorrisEngineError, ReadonlyArray<MorrisMoveS<D>>> {
  // eslint-disable-next-line fp/no-nil
  const placedMorris = getPlacedMorrisForColor(game, color);

  return P.pipe(
    getPossibleNextPlaceMorris(game, color),
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
            getValidMovesForMorris(game, facts, morris),
            P.Effect.map((moves) => [...acc, ...moves])
          )
        )
      )
    )
  );
}

// --------------------------------------------------------------------------
export function countValidMovesForColor<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  facts: MorrisGameFacts,
  color: MorrisColor
): P.Effect.Effect<never, MorrisEngineError, number> {
  return P.pipe(
    getValidMovesForColor(game, facts, color),
    P.Effect.map((moves) => moves.length)
  );
}

export function countValidMovesForColor0<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  facts: MorrisGameFacts,
  color: MorrisColor
): P.Effect.Effect<never, MorrisEngineError, number> {
  if (R.val(facts.isRemoveMode)) {
    // In remove mode, return the number of opponent pieces
    return P.Effect.succeed(getPointsOccupied(game.board, flipColor(color)).length);
  }

  if (R.val(facts.isMovingPhase) || R.val(facts.isLaskerPhase)) {
    const emptyPoints = getPointsEmpty(game.board);
    const occupiedPoints = getPointsOccupied(game.board, color);

    // For each morris[color] on the board, find all adjacent empty points
    const numMoveMoves = P.pipe(
      occupiedPoints,
      P.Effect.reduce(0, (acc, p) =>
        P.pipe(
          getPointsAdjacentEmpty(game.board, p),
          P.Effect.map((adjacentEmptyPoints) => acc + adjacentEmptyPoints.length)
        )
      )
    );

    return R.val(facts.isLaskerPhase)
      ? // In Lasker phase, the number of moves is (move moves + place moves)
        P.pipe(
          numMoveMoves,
          P.Effect.map((numMoveMoves) => numMoveMoves + emptyPoints.length)
        )
      : // In moving phase, for each morris[color] on the board, find all adjacent empty points
        numMoveMoves;
  }

  // In placing phase, just return the number of empty points
  if (R.val(facts.isPlacingPhase)) {
    return P.Effect.succeed(countEmpty(game.board));
  }

  // In flying phase, return the number of empty points for each morris[color]
  if (R.val(facts.isFlyingPhase)) {
    return P.Effect.succeed(countEmpty(game.board) * countMorris(game.board, color));
  }

  // Fallback default (absurd)
  return P.Effect.fail(toMorrisEngineError('Logic error'));
}

// --------------------------------------------------------------------------
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
    P.Effect.bind('newGame', () => applyMoveToGameBoard(game, move)),
    P.Effect.flatMap(({ moveColor, newGame }) =>
      P.pipe(
        millCandidatesForMove(newGame.board, move),
        someE<never, MorrisEngineError, ReadonlyArray<MorrisBoardCoordS<D>>>((candidate) =>
          P.pipe(
            candidate,
            P.ReadonlyArray.map((coord) => getPoint(newGame.board, coord)),
            P.Effect.all,
            P.Effect.map((points) => points.every((p) => isOccupied(p) && p.occupant.color === moveColor))
          )
        )
      )
    )
  );
}
