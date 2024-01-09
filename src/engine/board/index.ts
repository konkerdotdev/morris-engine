import * as P from '@konker.dev/effect-ts-prelude';

import { EMPTY } from '../consts';
import type { MorrisBoard } from './schemas';
import { isOccupiedBoardPoint, MorrisBoardPositionString } from './schemas';

export function boardHash(board: MorrisBoard): MorrisBoardPositionString {
  return P.pipe(
    board.points.reduce((acc, val) => `${acc}${isOccupiedBoardPoint(val) ? val.occupant.color : EMPTY}`, ''),
    P.Schema.decodeSync(MorrisBoardPositionString(board.numPoints))
  );
}
