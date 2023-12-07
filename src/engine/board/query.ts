import { EMPTY } from '../consts';
import type { MorrisGame } from '../game';
import type { MorrisBoard, MorrisBoardPositionString } from './index';
import { isOccupied } from './points';

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
