import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import * as R from '../../lib/tiny-rules-fp';
import { someE } from '../../lib/utils';
import type { MorrisBoard, OccupiedBoardPoint } from '../board';
import {
  countEmpty,
  countMorris,
  getPoint,
  getPointMorris,
  getPointsAdjacentEmpty,
  getPointsEmpty,
  getPointsOccupied,
  isOccupied,
} from '../board/points';
import { millCandidatesForMove } from '../board/query';
import type { MorrisBoardCoordS } from '../board/schemas';
import { MorrisColor, MorrisMoveType } from '../consts';
import type { MorrisGame } from '../game';
import { applyMoveToGameBoard } from '../game';
import type { Morris } from '../morris';
import type { MorrisGameFacts } from '../rules/facts';
import type { MorrisMoveMoveS, MorrisMovePlaceS, MorrisMoveRemoveS, MorrisMoveS } from './schemas';

// --------------------------------------------------------------------------
export const createMovePlace = <D extends number>(
  color: MorrisColor,
  to: MorrisBoardCoordS<D>
): MorrisMovePlaceS<D> => ({
  type: MorrisMoveType.PLACE,
  color,
  to,
});

export const createMoveMove = <D extends number>(
  from: MorrisBoardCoordS<D>,
  to: MorrisBoardCoordS<D>
): MorrisMoveMoveS<D> => ({
  type: MorrisMoveType.MOVE,
  from,
  to,
});

export const createMoveRemove = <D extends number>(from: MorrisBoardCoordS<D>): MorrisMoveRemoveS<D> => ({
  type: MorrisMoveType.REMOVE,
  from,
});

// --------------------------------------------------------------------------
export function isTurn<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  color: MorrisColor
): boolean {
  return color === game.curMoveColor;
}

export function flipColor(c: MorrisColor): MorrisColor {
  return c === MorrisColor.WHITE ? MorrisColor.BLACK : MorrisColor.WHITE;
}

// eslint-disable-next-line fp/no-nil
export function moveColor<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  move: MorrisMoveS<D>
): P.Effect.Effect<never, MorrisEngineError, MorrisColor> {
  // eslint-disable-next-line fp/no-unused-expression
  switch (move.type) {
    case MorrisMoveType.PLACE:
      return P.Effect.succeed(move.color);
    case MorrisMoveType.MOVE:
      return P.pipe(
        getPointMorris(game.board, move.from),
        P.Effect.map((morris) => morris.color)
      );
    case MorrisMoveType.REMOVE:
      return P.pipe(
        getPointMorris(game.board, move.from),
        P.Effect.map((morris) => flipColor(morris.color))
      );
  }
}

export function getValidMovesForMorrisPlace<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  morris: Morris<N>
): P.Effect.Effect<never, MorrisEngineError, ReadonlyArray<MorrisMoveS<D>>> {
  const emptyPoints = getPointsEmpty(game.board);
  return P.Effect.succeed(emptyPoints.map((p) => createMovePlace<D>(morris.color, p.coord)));
}

export function getValidMovesForMorrisMove<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  point: OccupiedBoardPoint<D, N>
): P.Effect.Effect<never, MorrisEngineError, ReadonlyArray<MorrisMoveS<D>>> {
  return P.pipe(
    getPointsAdjacentEmpty(game.board, point),
    P.Effect.map((emptyPoints) => emptyPoints.map((ep) => createMoveMove(point.coord, ep.coord)))
  );
}

export function getValidMovesForMorrisRemove<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  morris: Morris<N>
): P.Effect.Effect<never, MorrisEngineError, ReadonlyArray<MorrisMoveS<D>>> {
  const oppositeMorrisPoints = getPointsOccupied(game.board, flipColor(morris.color));
  return P.Effect.succeed(oppositeMorrisPoints.map((p) => createMoveRemove(p.coord)));
}

export function getValidMovesForMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  point: OccupiedBoardPoint<D, N>,
  morris: Morris<N>,
  facts: MorrisGameFacts
): P.Effect.Effect<never, MorrisEngineError, ReadonlyArray<MorrisMoveS<D>>> {
  // if is lasker phase find all empty adjacent point to the given point + all place moves
  if (R.val(facts.isLaskerPhase)) {
    return P.pipe(
      P.Effect.Do,
      P.Effect.bind('moveMoves', () => getValidMovesForMorrisMove(game, point)),
      P.Effect.bind('placeMoves', () => getValidMovesForMorrisPlace(game, morris)),
      P.Effect.map(({ moveMoves, placeMoves }) => [...moveMoves, ...placeMoves])
    );
  }

  // If is move phase in remove mode, find all opposite color pieces, and make remove moves; ignore given point
  if (R.val(facts.isRemoveMode)) {
    return getValidMovesForMorrisRemove(game, morris);
  }

  // if is place phase, find all empty points; ignore given point
  // if is flying phase, find all empty points; ignore given point
  if (R.val(facts.isPlacingPhase) || R.val(facts.isFlyingPhase)) {
    return getValidMovesForMorrisPlace(game, morris);
  }

  // if is move phase, find all empty adjacent points to the given point
  if (R.val(facts.isMovingPhase)) {
    return getValidMovesForMorrisMove(game, point);
  }

  // Absurd
  return P.Effect.succeed([]);
}

export function countValidMovesForColor<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  facts: MorrisGameFacts,
  color: MorrisColor
): P.Effect.Effect<never, MorrisEngineError, number> {
  if (R.val(facts.isMovingPhase) || R.val(facts.isLaskerPhase)) {
    const emptyPoints = getPointsEmpty(board);
    const occupiedPoints = getPointsOccupied(board, color);

    // For each morris[color] on the board, find all adjacent empty points
    const numMoveMoves = P.pipe(
      occupiedPoints,
      P.Effect.reduce(0, (acc, p) =>
        P.pipe(
          getPointsAdjacentEmpty(board, p),
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
    return P.Effect.succeed(countEmpty(board));
  }

  // In flying phase, return the number of empty points for each morris[color]
  if (R.val(facts.isFlyingPhase)) {
    return P.Effect.succeed(countEmpty(board) * countMorris(board, color));
  }

  // Fallback default (absurd)
  return P.Effect.succeed(0);
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
