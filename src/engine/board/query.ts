import { EMPTY, MorrisMoveType } from '../consts';
import type { MorrisGame } from '../game';
import type { MorrisMoveS } from '../moves/schemas';
import type { MillCandidate, MorrisBoard, MorrisBoardPositionString } from './index';
import { isOccupied } from './points';

export function millCandidatesForMove<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  move: MorrisMoveS<D>
): ReadonlyArray<MillCandidate<D>> {
  // A REMOVE move can never create a mill
  if (move.type === MorrisMoveType.REMOVE || move.type === MorrisMoveType.ROOT) {
    return [];
  }

  return board.millCandidates.filter((m) => m.includes(move.to));
}

export function countPositionRepeats<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  position: MorrisBoardPositionString<P>
): number {
  return game.positions.filter((p) => p === position).length;
}

export function boardHash<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>
): MorrisBoardPositionString<P> {
  return board.points.reduce(
    (acc, val) => `${acc}${isOccupied(val) ? val.occupant.color : EMPTY}`,
    ''
  ) as MorrisBoardPositionString<P>;
}
