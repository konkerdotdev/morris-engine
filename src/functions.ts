/* eslint-disable fp/no-nil,fp/no-unused-expression */

import type { Morris, MorrisBoard, MorrisBoardCoord, MorrisGame, MorrisMove, MorrisPoint } from './index';
import { MorrisBlack, MorrisColor, MorrisEmpty, MorrisMoveType, MorrisWhite } from './index';
import type { Range1, Tuple } from './utils';

// --------------------------------------------------------------------------
export function isTurn<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  color: MorrisColor
): boolean {
  return color === game.startColor ? game.moves.length % 2 === 0 : game.moves.length % 2 === 1;
}

export function point<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  coord: MorrisBoardCoord<D>
): MorrisPoint<D, N> | undefined {
  const i = board.points.findIndex((p) => p.coord === coord);
  return board.points[i];
}

export function isPointEmpty<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  coord: MorrisBoardCoord<D>
): boolean {
  return point(game.board, coord)?.occupant.color === MorrisColor.EMPTY;
}

export function isPointAdjacent<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  from: MorrisBoardCoord<D>,
  to: MorrisBoardCoord<D>
): boolean {
  return !!point(game.board, from)?.links.some((link) => link.to === to);
}

export function moveMakesMill<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  move: MorrisMove<D>
): boolean {
  // Find all mill possibilities which include the move.to point
  // Remove the move.to point from each of the mill possibilities
  const millCandidates = game.board.mills
    .filter((m) => m.includes(move.to))
    .map((m) => m.filter((coord) => coord !== move.to));

  // For each mill possibility, check if the other two points are the same color as the move
  return millCandidates.some((candidate) =>
    candidate.every((coord) => point(game.board, coord)?.occupant.color === move.color)
  );
}

// --------------------------------------------------------------------------
export function setPointOccupant<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  coord: MorrisBoardCoord<D>,
  morris: Morris<N>
): MorrisGame<P, D, N> {
  return {
    ...game,
    board: {
      ...game.board,
      points: game.board.points.map((p) => (p.coord === coord ? { ...p, occupant: morris } : p)) as Tuple<
        MorrisPoint<D, N>,
        P
      >,
    },
  };
}

export function setPointEmpty<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  coord: MorrisBoardCoord<D>
): MorrisGame<P, D, N> {
  return setPointOccupant(game, coord, MorrisEmpty);
}

// --------------------------------------------------------------------------
export const createMovePlace =
  (color: MorrisColor) =>
  <D extends number>(to: MorrisBoardCoord<D>): MorrisMove<D> => ({
    type: MorrisMoveType.PLACE,
    color,
    to,
  });

export const createMoveMove =
  (color: MorrisColor) =>
  <D extends number>(from: MorrisBoardCoord<D>, to: MorrisBoardCoord<D>): MorrisMove<D> => ({
    type: MorrisMoveType.MOVE,
    color,
    from,
    to,
  });

export const placeWhite = createMovePlace(MorrisColor.WHITE);
export const placeBlack = createMovePlace(MorrisColor.BLACK);
export const moveWhite = createMoveMove(MorrisColor.WHITE);
export const moveBlack = createMoveMove(MorrisColor.BLACK);

export const execMove =
  <P extends number, D extends number, N extends number>(move: MorrisMove<D>, n: Range1<N>) =>
  (game: MorrisGame<P, D, N>): MorrisGame<P, D, N> => {
    switch (move.type) {
      case MorrisMoveType.PLACE:
        const newGame = setPointOccupant(
          game,
          move.to,
          move.color === MorrisColor.WHITE ? MorrisWhite<N>(n) : MorrisBlack<N>(n)
        );
        return {
          ...newGame,
          moves: [...newGame.moves, move],
        };
      case MorrisMoveType.MOVE: {
        const newGame = setPointOccupant(
          setPointEmpty(game, move.from),
          move.to,
          point(game.board, move.from)?.occupant as Morris<N>
        );
        return {
          ...newGame,
          moves: [...newGame.moves, move],
        };
      }
    }
  };
