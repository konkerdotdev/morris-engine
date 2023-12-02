import * as M from './index';
import { isMorris } from './points';

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
    (acc, val) => `${acc}${isMorris(val.occupant) ? val.occupant.color : M.EMPTY}`,
    ''
  ) as M.MorrisBoardPositionHash<P>;
}
