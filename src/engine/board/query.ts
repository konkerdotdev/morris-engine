import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import { filterE } from '../../lib/utils';
import { type MorrisColor, MorrisMoveType } from '../consts';
import type { MorrisGame } from '../game';
import type { MorrisMove } from '../moves/schemas';
import { boardIsPointAdjacent } from './points';
import type {
  MillCandidate,
  Morris,
  MorrisBoard,
  MorrisBoardPoint,
  MorrisBoardPositionString,
  OccupiedBoardPoint,
} from './schemas';
import { isOccupiedBoardPoint } from './schemas';

export function boardListEmptyPoints(board: MorrisBoard): ReadonlyArray<MorrisBoardPoint> {
  return board.points.filter((p) => !isOccupiedBoardPoint(p));
}

export function boardListOccupiedPointsByColor(
  board: MorrisBoard,
  color: MorrisColor
): ReadonlyArray<OccupiedBoardPoint> {
  // return board.points.filter((p) => isOccupiedBoardPoint(p) && p.occupant.color === color);
  return board.points.filter(isOccupiedBoardPoint).filter((p) => p.occupant.color === color);
}

export function boardGetOccupiedPointForMorris(
  board: MorrisBoard,
  morris: Morris
): P.Effect.Effect<OccupiedBoardPoint, MorrisEngineError> {
  const occupiedPoints = boardListOccupiedPointsByColor(board, morris.color);
  const point = occupiedPoints.find((p) => p.occupant.n === morris.n && p.occupant.color === morris.color);

  return point ? P.Effect.succeed(point) : P.Effect.fail(toMorrisEngineError('Point not found for morris'));
}

/**
 * Get every morris on the board of a given color
 */
export function boardListMorrisOnBoardForColor(board: MorrisBoard, color: MorrisColor): ReadonlyArray<Morris> {
  return boardListOccupiedPointsByColor(board, color)
    .filter((p) => p.occupant.color === color)
    .map((p) => p.occupant);
}

export function boardCountMorrisByColor(board: MorrisBoard, color: MorrisColor): number {
  return boardListOccupiedPointsByColor(board, color).length;
}

export function boardCountEmptyPoints(board: MorrisBoard): number {
  return boardListEmptyPoints(board).length;
}

export function boardListAdjacentPoints(
  board: MorrisBoard,
  point: MorrisBoardPoint
): P.Effect.Effect<ReadonlyArray<MorrisBoardPoint>, MorrisEngineError> {
  return P.pipe(
    board.points,
    filterE((bp) => boardIsPointAdjacent(board, point.coord, bp.coord))
  );
}

export function boardListAdjacentPointsEmpty(
  board: MorrisBoard,
  point: MorrisBoardPoint
): P.Effect.Effect<ReadonlyArray<MorrisBoardPoint>, MorrisEngineError> {
  return P.pipe(
    boardListEmptyPoints(board),
    filterE((bp) => boardIsPointAdjacent(board, point.coord, bp.coord))
  );
}

export function boardListMillCandidatesForMove(board: MorrisBoard, move: MorrisMove): ReadonlyArray<MillCandidate> {
  // A REMOVE move can never create a mill
  if (move.type === MorrisMoveType.REMOVE || move.type === MorrisMoveType.ROOT) {
    return [];
  }

  return board.millCandidates.filter((m) => m.includes(move.to));
}

export function boardCountPositionRepeats(game: MorrisGame, position: MorrisBoardPositionString): number {
  return game.gameState.positions.filter((p: MorrisBoardPositionString) => p === position).length;
}

export function boardHasMorrisBeenPlaced(board: MorrisBoard, morris: Morris): boolean {
  return board.points.some(
    (p) => isOccupiedBoardPoint(p) && p.occupant.n === morris.n && p.occupant.color === morris.color
  );
}
