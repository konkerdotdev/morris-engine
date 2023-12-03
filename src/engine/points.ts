import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../lib/error';
import { toMorrisEngineError } from '../lib/error';
import type { Tuple } from '../lib/type-utils';
import { filterE } from '../lib/type-utils';
import { MORRIS } from './consts';
import type * as M from './index';
import type { MorrisBoardCoordS } from './schemas';
import { EmptyOccupant, EmptyOccupantS } from './schemas';

export function isEmptyOccupant(x: unknown): x is EmptyOccupant {
  return P.pipe(x, P.Schema.is(EmptyOccupantS));
}

export function isOccupied<D extends number, N extends number>(
  x: M.MorrisBoardPoint<D, N>
): x is M.OccupiedBoardPoint<D, N> {
  return x.occupant._tag === MORRIS;
}

export function getPointsOccupied<P extends number, D extends number, N extends number>(
  board: M.MorrisBoard<P, D, N>,
  color: M.MorrisColor
): ReadonlyArray<M.OccupiedBoardPoint<D, N>> {
  return board.points.filter((p) => isOccupied(p) && p.occupant.color === color) as ReadonlyArray<
    M.OccupiedBoardPoint<D, N>
  >;
}

export function countMorris<P extends number, D extends number, N extends number>(
  board: M.MorrisBoard<P, D, N>,
  color: M.MorrisColor
): number {
  return getPointsOccupied(board, color).length;
}

export function getPointsEmpty<P extends number, D extends number, N extends number>(
  board: M.MorrisBoard<P, D, N>
): ReadonlyArray<M.MorrisBoardPoint<D, N>> {
  return board.points.filter((p) => !isOccupied(p));
}

export function countEmpty<P extends number, D extends number, N extends number>(
  board: M.MorrisBoard<P, D, N>
): number {
  return getPointsEmpty(board).length;
}

export function getPoint<P extends number, D extends number, N extends number>(
  board: M.MorrisBoard<P, D, N>,
  coord: MorrisBoardCoordS<D>
): P.Effect.Effect<never, MorrisEngineError, M.MorrisBoardPoint<D, N>> {
  const i = board.points.findIndex((p) => p.coord === coord);
  const p = board.points[i];
  return p ? P.Effect.succeed(p) : P.Effect.fail(toMorrisEngineError(`Invalid point: ${coord}`));
}

export function getPointMorris<P extends number, D extends number, N extends number>(
  board: M.MorrisBoard<P, D, N>,
  coord: MorrisBoardCoordS<D>
): P.Effect.Effect<never, MorrisEngineError, M.Morris<N>> {
  return P.pipe(
    getPoint(board, coord),
    P.Effect.flatMap((p) =>
      isOccupied(p) ? P.Effect.succeed(p.occupant) : P.Effect.fail(toMorrisEngineError(`Point is empty: ${coord}`))
    )
  );
}

export function isPointEmpty<P extends number, D extends number, N extends number>(
  board: M.MorrisBoard<P, D, N>,
  coord: MorrisBoardCoordS<D>
): P.Effect.Effect<never, MorrisEngineError, boolean> {
  return P.pipe(
    getPoint(board, coord),
    P.Effect.map((p) => isEmptyOccupant(p.occupant))
  );
}

export function isPointAdjacent<P extends number, D extends number, N extends number>(
  board: M.MorrisBoard<P, D, N>,
  from: MorrisBoardCoordS<D>,
  to: MorrisBoardCoordS<D>
): P.Effect.Effect<never, MorrisEngineError, boolean> {
  return P.pipe(
    getPoint(board, from),
    P.Effect.map((p) => p.links.some((link) => link.to === to))
  );
}

export function getPointsAdjacent<P extends number, D extends number, N extends number>(
  board: M.MorrisBoard<P, D, N>,
  point: M.MorrisBoardPoint<D, N>
): P.Effect.Effect<never, MorrisEngineError, ReadonlyArray<M.MorrisBoardPoint<D, N>>> {
  return P.pipe(
    board.points,
    filterE((bp) => isPointAdjacent(board, point.coord, bp.coord))
  );
}

export function getPointsAdjacentEmpty<P extends number, D extends number, N extends number>(
  board: M.MorrisBoard<P, D, N>,
  point: M.MorrisBoardPoint<D, N>
): P.Effect.Effect<never, MorrisEngineError, ReadonlyArray<M.MorrisBoardPoint<D, N>>> {
  return P.pipe(
    getPointsEmpty(board),
    filterE((bp) => isPointAdjacent(board, point.coord, bp.coord))
  );
}

export function setPointOccupant<P extends number, D extends number, N extends number>(
  game: M.MorrisGame<P, D, N>,
  coord: MorrisBoardCoordS<D>,
  occupant: M.MorrisBoardPointOccupant<N>
): P.Effect.Effect<never, MorrisEngineError, M.MorrisGame<P, D, N>> {
  const i = game.board.points.findIndex((p) => p.coord === coord);
  const p = game.board.points[i];

  return p
    ? P.Effect.succeed({
        ...game,
        board: {
          ...game.board,
          points: game.board.points.map((p) => (p.coord === coord ? { ...p, occupant } : p)) as Tuple<
            M.MorrisBoardPoint<D, N>,
            P
          >,
        },
      })
    : P.Effect.fail(toMorrisEngineError(`Invalid point: ${coord}`));
}

export function setPointEmpty<P extends number, D extends number, N extends number>(
  board: M.MorrisGame<P, D, N>,
  coord: MorrisBoardCoordS<D>
): P.Effect.Effect<never, MorrisEngineError, M.MorrisGame<P, D, N>> {
  return setPointOccupant(board, coord, EmptyOccupant);
}
