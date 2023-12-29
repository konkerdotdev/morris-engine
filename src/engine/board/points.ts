import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import type { Tuple } from '../../lib/type-utils';
import type { MorrisGame } from '../game';
import type { Morris } from '../morris';
import type { MorrisBoard, MorrisBoardPoint, MorrisBoardPointOccupant, OccupiedBoardPoint } from './index';
import { isOccupiedBoardPoint } from './index';
import { boardListOccupiedPointsByColor } from './query';
import type { MorrisBoardCoordS } from './schemas';
import { EmptyOccupant, isEmptyOccupant } from './schemas';

export function boardGetPointByCoord<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  coord: MorrisBoardCoordS<D>
): P.Effect.Effect<never, MorrisEngineError, MorrisBoardPoint<D, N>> {
  const i = board.points.findIndex((p) => p.coord === coord);
  const p = board.points[i];
  return p ? P.Effect.succeed(p) : P.Effect.fail(toMorrisEngineError(`Invalid point: ${coord}`));
}

export function boardGetMorrisAtCoord<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  coord: MorrisBoardCoordS<D>
): P.Effect.Effect<never, MorrisEngineError, Morris<N>> {
  return P.pipe(
    boardGetPointByCoord(board, coord),
    P.Effect.flatMap((p) =>
      isOccupiedBoardPoint(p)
        ? P.Effect.succeed(p.occupant)
        : P.Effect.fail(toMorrisEngineError(`Point is empty: ${coord}`))
    )
  );
}

export function boardGetOccupiedPointForMorris<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  morris: Morris<N>
): P.Effect.Effect<never, MorrisEngineError, OccupiedBoardPoint<D, N>> {
  const occupiedPoints = boardListOccupiedPointsByColor(board, morris.color);
  const point = occupiedPoints.find((p) => p.occupant.n === morris.n && p.occupant.color === morris.color);

  return point ? P.Effect.succeed(point) : P.Effect.fail(toMorrisEngineError('Point not found for morris'));
}

export function boardIsPointEmpty<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  coord: MorrisBoardCoordS<D>
): P.Effect.Effect<never, MorrisEngineError, boolean> {
  return P.pipe(
    boardGetPointByCoord(board, coord),
    P.Effect.map((p) => isEmptyOccupant(p.occupant))
  );
}

export function boardIsPointAdjacent<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  from: MorrisBoardCoordS<D>,
  to: MorrisBoardCoordS<D>
): P.Effect.Effect<never, MorrisEngineError, boolean> {
  return P.pipe(
    boardGetPointByCoord(board, from),
    P.Effect.map((p) => p.links.some((link) => link.to === to))
  );
}

export function boardSetPointOccupant<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  coord: MorrisBoardCoordS<D>,
  occupant: MorrisBoardPointOccupant<N>
): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> {
  const i = game.board.points.findIndex((p) => p.coord === coord);
  const p = game.board.points[i];

  return p
    ? P.Effect.succeed({
        ...game,
        board: {
          ...game.board,
          points: game.board.points.map((p) => (p.coord === coord ? { ...p, occupant } : p)) as Tuple<
            MorrisBoardPoint<D, N>,
            P
          >,
        },
      })
    : P.Effect.fail(toMorrisEngineError(`Invalid point: ${coord}`));
}

export function boardSetPointEmpty<P extends number, D extends number, N extends number>(
  board: MorrisGame<P, D, N>,
  coord: MorrisBoardCoordS<D>
): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> {
  return boardSetPointOccupant(board, coord, EmptyOccupant);
}
