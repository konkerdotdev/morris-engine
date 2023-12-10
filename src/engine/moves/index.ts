import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { getPointMorris } from '../board/points';
import type { MorrisBoardCoordS } from '../board/schemas';
import { MorrisColor, MorrisMoveType } from '../consts';
import type { MorrisGame } from '../game';
import type { MorrisMoveMoveS, MorrisMovePlaceS, MorrisMoveRemoveS, MorrisMoveS } from './schemas';

// --------------------------------------------------------------------------
export const createMovePlace = <D extends number>(
  color: MorrisColor,
  to: MorrisBoardCoordS<D>
): MorrisMovePlaceS<D> => ({
  type: MorrisMoveType.PLACE,
  color,
  to,
});

export const createMoveMove = <D extends number>(
  from: MorrisBoardCoordS<D>,
  to: MorrisBoardCoordS<D>
): MorrisMoveMoveS<D> => ({
  type: MorrisMoveType.MOVE,
  from,
  to,
});

export const createMoveRemove = <D extends number>(from: MorrisBoardCoordS<D>): MorrisMoveRemoveS<D> => ({
  type: MorrisMoveType.REMOVE,
  from,
});

// --------------------------------------------------------------------------
export function flipColor(c: MorrisColor): MorrisColor {
  return c === MorrisColor.WHITE ? MorrisColor.BLACK : MorrisColor.WHITE;
}

// eslint-disable-next-line fp/no-nil
export function moveColor<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  move: MorrisMoveS<D>
): P.Effect.Effect<never, MorrisEngineError, MorrisColor> {
  // eslint-disable-next-line fp/no-unused-expression
  switch (move.type) {
    case MorrisMoveType.PLACE:
      return P.Effect.succeed(move.color);
    case MorrisMoveType.MOVE:
      return P.pipe(
        getPointMorris(game.board, move.from),
        P.Effect.map((morris) => morris.color)
      );
    case MorrisMoveType.REMOVE:
      return P.pipe(
        getPointMorris(game.board, move.from),
        P.Effect.map((morris) => flipColor(morris.color))
      );
  }
}
