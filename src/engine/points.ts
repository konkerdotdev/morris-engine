import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../lib/error';
import { toMorrisEngineError } from '../lib/error';
import type { Tuple } from '../lib/type-utils';
import type { EmptyOccupant, Morris, MorrisBoardPointOccupant } from './index';
import * as M from './index';
import { EmptyOccupantS } from './index';

export function isEmptyOccupant(x: unknown): x is EmptyOccupant {
  return P.pipe(x, P.Schema.is(EmptyOccupantS));
}

export function isMorris<N extends number>(x: MorrisBoardPointOccupant<N>): x is Morris<N> {
  return !isEmptyOccupant(x);
}

export function getPointsMorris<P extends number, D extends number, N extends number>(
  board: M.MorrisBoard<P, D, N>,
  color: M.MorrisColor
): ReadonlyArray<M.MorrisBoardPoint<D, N>> {
  return board.points.filter((p) => isMorris(p.occupant) && p.occupant.color === color);
}

export function countMorris<P extends number, D extends number, N extends number>(
  board: M.MorrisBoard<P, D, N>,
  color: M.MorrisColor
): number {
  return getPointsMorris(board, color).length;
}

export function getPointsEmpty<P extends number, D extends number, N extends number>(
  board: M.MorrisBoard<P, D, N>
): ReadonlyArray<M.MorrisBoardPoint<D, N>> {
  return board.points.filter((p) => !isMorris(p.occupant));
}

export function countEmpty<P extends number, D extends number, N extends number>(
  board: M.MorrisBoard<P, D, N>
): number {
  return getPointsEmpty(board).length;
}

export function getPoint<P extends number, D extends number, N extends number>(
  board: M.MorrisBoard<P, D, N>,
  coord: M.MorrisBoardCoord<D>
): P.Effect.Effect<never, MorrisEngineError, M.MorrisBoardPoint<D, N>> {
  const i = board.points.findIndex((p) => p.coord === coord);
  const p = board.points[i];
  return p ? P.Effect.succeed(p) : P.Effect.fail(toMorrisEngineError(`Invalid point: ${coord}`));
}

export function getPointMorris<P extends number, D extends number, N extends number>(
  board: M.MorrisBoard<P, D, N>,
  coord: M.MorrisBoardCoord<D>
): P.Effect.Effect<never, MorrisEngineError, M.Morris<N>> {
  return P.pipe(
    getPoint(board, coord),
    P.Effect.flatMap((p) =>
      isMorris(p.occupant)
        ? P.Effect.succeed(p.occupant)
        : P.Effect.fail(toMorrisEngineError(`Point is empty: ${coord}`))
    )
  );
}

export function isPointEmpty<P extends number, D extends number, N extends number>(
  board: M.MorrisBoard<P, D, N>,
  coord: M.MorrisBoardCoord<D>
): P.Effect.Effect<never, MorrisEngineError, boolean> {
  return P.pipe(
    getPoint(board, coord),
    P.Effect.map((p) => isEmptyOccupant(p.occupant))
  );
}

export function isPointAdjacent<P extends number, D extends number, N extends number>(
  board: M.MorrisBoard<P, D, N>,
  from: M.MorrisBoardCoord<D>,
  to: M.MorrisBoardCoord<D>
): P.Effect.Effect<never, MorrisEngineError, boolean> {
  return P.pipe(
    getPoint(board, from),
    P.Effect.map((p) => p.links.some((link) => link.to === to))
  );
}
export function setPointOccupant<P extends number, D extends number, N extends number>(
  game: M.MorrisGame<P, D, N>,
  coord: M.MorrisBoardCoord<D>,
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
  coord: M.MorrisBoardCoord<D>
): P.Effect.Effect<never, MorrisEngineError, M.MorrisGame<P, D, N>> {
  return setPointOccupant(board, coord, M.EmptyOccupant);
}
