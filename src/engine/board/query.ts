import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { filterE } from '../../lib/utils';
import { type MorrisColor, MorrisMoveType } from '../consts';
import type { MorrisGame } from '../game';
import type { Morris } from '../morris';
import type { MorrisMoveS } from '../moves/schemas';
import type {
  MillCandidate,
  MorrisBoard,
  MorrisBoardPoint,
  MorrisBoardPositionString,
  OccupiedBoardPoint,
} from './index';
import { isOccupiedBoardPoint } from './index';
import { boardIsPointAdjacent } from './points';

export function boardListOccupiedPointsByColor<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  color: MorrisColor
): ReadonlyArray<OccupiedBoardPoint<D, N>> {
  return board.points.filter((p) => isOccupiedBoardPoint(p) && p.occupant.color === color) as ReadonlyArray<
    OccupiedBoardPoint<D, N>
  >;
}

export function boardListEmptyPoints<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>
): ReadonlyArray<MorrisBoardPoint<D, N>> {
  return board.points.filter((p) => !isOccupiedBoardPoint(p));
}

export function boardCountMorrisByColor<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  color: MorrisColor
): number {
  return boardListOccupiedPointsByColor(board, color).length;
}

export function boardCountEmptyPoints<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>
): number {
  return boardListEmptyPoints(board).length;
}

export function boardListAdjacentPoints<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  point: MorrisBoardPoint<D, N>
): P.Effect.Effect<never, MorrisEngineError, ReadonlyArray<MorrisBoardPoint<D, N>>> {
  return P.pipe(
    board.points,
    filterE((bp) => boardIsPointAdjacent(board, point.coord, bp.coord))
  );
}

export function boardListAdjacentPointsEmpty<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  point: MorrisBoardPoint<D, N>
): P.Effect.Effect<never, MorrisEngineError, ReadonlyArray<MorrisBoardPoint<D, N>>> {
  return P.pipe(
    boardListEmptyPoints(board),
    filterE((bp) => boardIsPointAdjacent(board, point.coord, bp.coord))
  );
}

export function boardListMillCandidatesForMove<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  move: MorrisMoveS<D>
): ReadonlyArray<MillCandidate<D>> {
  // A REMOVE move can never create a mill
  if (move.type === MorrisMoveType.REMOVE || move.type === MorrisMoveType.ROOT) {
    return [];
  }

  return board.millCandidates.filter((m) => m.includes(move.to));
}

export function boardCountPositionRepeats<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  position: MorrisBoardPositionString<P>
): number {
  return game.positions.filter((p) => p === position).length;
}

export function boardHasMorrisBeenPlaced<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  morris: Morris<N>
): boolean {
  return board.points.some(
    (p) => isOccupiedBoardPoint(p) && p.occupant.n === morris.n && p.occupant.color === morris.color
  );
}
