import { EMPTY } from './consts';
import type * as M from './index';
import { isOccupied } from './points';

export function countPositionRepeats<P extends number, D extends number, N extends number>(
  game: M.MorrisGame<P, D, N>,
  position: M.MorrisBoardPositionHash<P>
): number {
  return game.positions.filter((p) => p === position).length;
}

export function boardHash<P extends number, D extends number, N extends number>(
  board: M.MorrisBoard<P, D, N>
): M.MorrisBoardPositionHash<P> {
  return board.points.reduce(
    (acc, val) => `${acc}${isOccupied(val) ? val.occupant.color : EMPTY}`,
    ''
  ) as M.MorrisBoardPositionHash<P>;
}
