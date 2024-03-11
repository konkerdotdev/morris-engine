import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import type { MorrisGame } from '../game';
import type { Morris, MorrisBoard, MorrisBoardCoord, MorrisBoardPoint, MorrisBoardPointOccupant } from './schemas';
import { EmptyOccupant, isEmptyOccupant, isOccupiedBoardPoint } from './schemas';

export function boardGetPointByCoord(
  board: MorrisBoard,
  coord: MorrisBoardCoord
): P.Effect.Effect<MorrisBoardPoint, MorrisEngineError> {
  const i = board.points.findIndex((p) => p.coord === coord);
  const p = board.points[i];
  return p ? P.Effect.succeed(p) : P.Effect.fail(toMorrisEngineError(`Invalid point: ${coord}`));
}

export function boardGetMorrisAtCoord(
  board: MorrisBoard,
  coord: MorrisBoardCoord
): P.Effect.Effect<Morris, MorrisEngineError> {
  return P.pipe(
    boardGetPointByCoord(board, coord),
    P.Effect.flatMap((p) =>
      isOccupiedBoardPoint(p)
        ? P.Effect.succeed(p.occupant)
        : P.Effect.fail(toMorrisEngineError(`Point is empty: ${coord}`))
    )
  );
}

export function boardIsPointEmpty(
  board: MorrisBoard,
  coord: MorrisBoardCoord
): P.Effect.Effect<boolean, MorrisEngineError> {
  return P.pipe(
    boardGetPointByCoord(board, coord),
    P.Effect.map((p) => isEmptyOccupant(p.occupant))
  );
}

export function boardIsPointAdjacent(
  board: MorrisBoard,
  from: MorrisBoardCoord,
  to: MorrisBoardCoord
): P.Effect.Effect<boolean, MorrisEngineError> {
  return P.pipe(
    boardGetPointByCoord(board, from),
    P.Effect.map((p) => p.links.some((link) => link.to === to))
  );
}

export function boardSetPointOccupant(
  game: MorrisGame,
  coord: MorrisBoardCoord,
  occupant: MorrisBoardPointOccupant
): P.Effect.Effect<MorrisGame, MorrisEngineError> {
  const i = game.gameState.board.points.findIndex((p: MorrisBoardPoint) => p.coord === coord);
  const p = game.gameState.board.points[i];

  return p
    ? P.Effect.succeed({
        ...game,
        gameState: {
          ...game.gameState,
          board: {
            ...game.gameState.board,
            points: game.gameState.board.points.map((p: MorrisBoardPoint) =>
              p.coord === coord ? { ...p, occupant } : p
            ),
          },
        },
      })
    : P.Effect.fail(toMorrisEngineError(`Invalid point: ${coord}`));
}

export function boardSetPointEmpty(
  board: MorrisGame,
  coord: MorrisBoardCoord
): P.Effect.Effect<MorrisGame, MorrisEngineError> {
  return boardSetPointOccupant(board, coord, EmptyOccupant);
}
