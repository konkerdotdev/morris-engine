// --------------------------------------------------------------------------
import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../lib/error';
import * as R from '../lib/tiny-rules-fp';
import { filterE, someE } from '../lib/type-utils';
import * as M from './index';
import { MorrisMoveType } from './index';
import {
  countEmpty,
  countMorris,
  getPoint,
  getPointMorris,
  getPointsEmpty,
  getPointsMorris,
  isMorris,
  isPointAdjacent,
} from './points';
import type { MorrisGameFacts } from './rules/facts';

// --------------------------------------------------------------------------
export const createMovePlace = <D extends number, N extends number>(
  morris: M.Morris<N>,
  to: M.MorrisBoardCoord<D>
): M.MorrisMovePlace<D, N> => ({
  type: M.MorrisMoveType.PLACE,
  morris,
  to,
});

export const createMoveMove = <D extends number, N extends number>(
  from: M.MorrisBoardCoord<D>,
  to: M.MorrisBoardCoord<D>
): M.MorrisMove<D, N> => ({
  type: M.MorrisMoveType.MOVE,
  from,
  to,
});

export const createMoveRemove = <D extends number, N extends number>(
  morris: M.Morris<N>,
  from: M.MorrisBoardCoord<D>
): M.MorrisMoveRemove<D, N> => ({
  type: M.MorrisMoveType.REMOVE,
  morris,
  from,
});

// --------------------------------------------------------------------------
export function isTurn<P extends number, D extends number, N extends number>(
  game: M.MorrisGame<P, D, N>,
  color: M.MorrisColor
): boolean {
  return color === game.curMoveColor;
}

// eslint-disable-next-line fp/no-nil
export function moveColor<P extends number, D extends number, N extends number>(
  game: M.MorrisGame<P, D, N>,
  move: M.MorrisMove<D, N>
): P.Effect.Effect<never, MorrisEngineError, M.MorrisColor> {
  // eslint-disable-next-line fp/no-unused-expression
  switch (move.type) {
    case M.MorrisMoveType.PLACE:
      return P.Effect.succeed(move.morris.color);
    case M.MorrisMoveType.MOVE:
    case M.MorrisMoveType.REMOVE:
      return P.pipe(
        getPointMorris(game.board, move.from),
        P.Effect.map((morris) => morris.color)
      );
  }
}

export function getValidMovesForMorris<P extends number, D extends number, N extends number>(
  _board: M.MorrisBoard<P, D, N>,
  facts: MorrisGameFacts,
  _point: M.MorrisBoardPoint<D, N>
): P.Effect.Effect<never, MorrisEngineError, ReadonlyArray<M.MorrisMove<D, N>>> {
  // if is place phase, find all empty points; ignore given point
  if (R.val(facts.isPlacingPhase)) {
    // const emptyPoints = getPointsEmpty(board);
  }

  // if is flying phase, find all empty points; ignore given point
  // TODO

  // If is move phase in remove mode, find all opposite color pieces, and make remove moves; ignore given point
  // TODO

  // if is move phase, find all empty adjacent points to the given point
  // TODO

  // if is lasker phase,
  //   if have unplaced morris: find all empty points for place
  // find all empty adjacent point to the given point + all place moves
  // TODO

  return P.Effect.succeed([]);
}

export function countValidMovesForColor<P extends number, D extends number, N extends number>(
  board: M.MorrisBoard<P, D, N>,
  facts: MorrisGameFacts,
  color: M.MorrisColor
): P.Effect.Effect<never, MorrisEngineError, number> {
  if (R.val(facts.isMovingPhase) || R.val(facts.isLaskerPhase)) {
    const emptyPoints = getPointsEmpty(board);
    const morrisPoints = getPointsMorris(board, color);

    // For each morris[color] on the board, find all adjacent empty points
    const numMoveMoves = P.pipe(
      morrisPoints,
      P.Effect.reduce(0, (acc, p) =>
        P.pipe(
          emptyPoints,
          filterE((ep) => isPointAdjacent(board, p.coord, ep.coord)),
          P.Effect.map((filteredEmptyPoints) => acc + filteredEmptyPoints.length)
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
export function millCandidatesForMove<P extends number, D extends number, N extends number>(
  game: M.MorrisGame<P, D, N>,
  move: M.MorrisMove<D, N>
): ReadonlyArray<M.MillCandidate<D>> {
  // A REMOVE move can never create a mill
  if (move.type === M.MorrisMoveType.REMOVE) {
    return [];
  }

  // Find all mill possibilities which include the move.to point
  // Remove the move.to point from each of the mill possibilities
  return game.board.millCandidates
    .filter((m) => m.includes(move.to))
    .map((m) => m.filter((coord) => coord !== move.to)) as Array<M.MillCandidate<D>>;
}

export function moveMakesMill<P extends number, D extends number, N extends number>(
  game: M.MorrisGame<P, D, N>,
  move: M.MorrisMove<D, N>
): P.Effect.Effect<never, MorrisEngineError, boolean> {
  // A REMOVE move can never create a mill
  if (move.type === M.MorrisMoveType.REMOVE) {
    return P.Effect.succeed(false);
  }

  const candidates = millCandidatesForMove(game, move);

  // For each mill possibility, check if the other two points are the same color as the move
  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('moveColor', () => moveColor(game, move)),
    P.Effect.flatMap(({ moveColor }) =>
      P.pipe(
        candidates,
        someE<never, MorrisEngineError, ReadonlyArray<M.MorrisBoardCoord<D>>>((candidate) =>
          P.pipe(
            candidate,
            P.ReadonlyArray.map((coord) => getPoint(game.board, coord)),
            P.Effect.all,
            P.Effect.map((points) => points.every((p) => isMorris(p.occupant) && p.occupant.color === moveColor))
          )
        )
      )
    )
  );
}

// --------------------------------------------------------------------------
// FIXME: make this into proper schemas
// eslint-disable-next-line fp/no-nil
export function strMorrisMove<D extends number, N extends number>(move: M.MorrisMove<D, N>): string {
  switch (move.type) {
    case MorrisMoveType.PLACE:
      return `P: ${move.morris.color} ${move.to}`;
    case MorrisMoveType.MOVE:
      return `M: ${move.from} ${move.to}`;
    case MorrisMoveType.REMOVE:
      return `R: ${move.morris.color} ${move.from}`;
  }
}
