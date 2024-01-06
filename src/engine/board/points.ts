import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import type { Tuple } from '../../lib/type-utils';
import type { MorrisGame } from '../game';
import type { Morris, MorrisBoard, MorrisBoardCoord, MorrisBoardPoint, MorrisBoardPointOccupant } from './schemas';
import { EmptyOccupant, isEmptyOccupant, isOccupiedBoardPoint } from './schemas';

export function boardGetPointByCoord<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  coord: MorrisBoardCoord<D>
): P.Effect.Effect<never, MorrisEngineError, MorrisBoardPoint<D, N>> {
  const i = board.points.findIndex((p) => p.coord === coord);
  const p = board.points[i];
  return p ? P.Effect.succeed(p) : P.Effect.fail(toMorrisEngineError(`Invalid point: ${coord}`));
}

export function boardGetMorrisAtCoord<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  coord: MorrisBoardCoord<D>
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

export function boardIsPointEmpty<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  coord: MorrisBoardCoord<D>
): P.Effect.Effect<never, MorrisEngineError, boolean> {
  return P.pipe(
    boardGetPointByCoord(board, coord),
    P.Effect.map((p) => isEmptyOccupant(p.occupant))
  );
}

export function boardIsPointAdjacent<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  from: MorrisBoardCoord<D>,
  to: MorrisBoardCoord<D>
): P.Effect.Effect<never, MorrisEngineError, boolean> {
  return P.pipe(
    boardGetPointByCoord(board, from),
    P.Effect.map((p) => p.links.some((link) => link.to === to))
  );
}

export function boardSetPointOccupant<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  coord: MorrisBoardCoord<D>,
  occupant: MorrisBoardPointOccupant<N>
): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> {
  const i = game.gameState.board.points.findIndex((p: MorrisBoardPoint<D, N>) => p.coord === coord);
  const p = game.gameState.board.points[i];

  return p
    ? P.Effect.succeed({
        ...game,
        gameState: {
          ...game.gameState,
          board: {
            ...game.gameState.board,
            points: game.gameState.board.points.map((p: MorrisBoardPoint<D, N>) =>
              p.coord === coord ? { ...p, occupant } : p
            ) as Tuple<MorrisBoardPoint<D, N>, P>,
          },
        },
      })
    : P.Effect.fail(toMorrisEngineError(`Invalid point: ${coord}`));
}

export function boardSetPointEmpty<P extends number, D extends number, N extends number>(
  board: MorrisGame<P, D, N>,
  coord: MorrisBoardCoord<D>
): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> {
  return boardSetPointOccupant(board, coord, EmptyOccupant);
}
