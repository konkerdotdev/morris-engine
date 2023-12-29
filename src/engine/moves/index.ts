import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { boardGetMorrisAtCoord } from '../board/points';
import type { MorrisBoardCoordS } from '../board/schemas';
import type { MorrisColor } from '../consts';
import { flipColor, MorrisMoveType } from '../consts';
import type { MorrisGame } from '../game';
import type { MorrisMoveMoveS, MorrisMovePlaceS, MorrisMoveRemoveS, MorrisMoveRootS, MorrisMoveS } from './schemas';

// --------------------------------------------------------------------------
export const ROOT_MOVE_STR = '-';

export const moveCreateRoot = (): MorrisMoveRootS => ({
  type: MorrisMoveType.ROOT,
});

export const moveCreatePlace = <D extends number>(
  color: MorrisColor,
  to: MorrisBoardCoordS<D>
): MorrisMovePlaceS<D> => ({
  type: MorrisMoveType.PLACE,
  color,
  to,
});

export const moveCreateMove = <D extends number>(
  from: MorrisBoardCoordS<D>,
  to: MorrisBoardCoordS<D>
): MorrisMoveMoveS<D> => ({
  type: MorrisMoveType.MOVE,
  from,
  to,
});

export const moveCreateRemove = <D extends number>(from: MorrisBoardCoordS<D>): MorrisMoveRemoveS<D> => ({
  type: MorrisMoveType.REMOVE,
  from,
});

// --------------------------------------------------------------------------

// eslint-disable-next-line fp/no-nil
export function moveColor<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  move: MorrisMoveS<D>
): P.Effect.Effect<never, MorrisEngineError, MorrisColor> {
  switch (move.type) {
    case MorrisMoveType.PLACE:
      return P.Effect.succeed(move.color);
    case MorrisMoveType.MOVE:
      return P.pipe(
        boardGetMorrisAtCoord(game.board, move.from),
        P.Effect.map((morris) => morris.color)
      );
    case MorrisMoveType.REMOVE:
      return P.pipe(
        boardGetMorrisAtCoord(game.board, move.from),
        P.Effect.map((morris) => flipColor(morris.color))
      );
    case MorrisMoveType.ROOT:
      return P.Effect.succeed(game.startColor);
  }
}

// --------------------------------------------------------------------------
// eslint-disable-next-line fp/no-nil
export function moveEqual<D extends number>(m1: MorrisMoveS<D>, m2: MorrisMoveS<D>): boolean {
  switch (m1.type) {
    case MorrisMoveType.PLACE:
      return m2.type === MorrisMoveType.PLACE && m1.color === m2.color && m1.to === m2.to;
    case MorrisMoveType.MOVE:
      return m2.type === MorrisMoveType.MOVE && m1.from === m2.from && m1.to === m2.to;
    case MorrisMoveType.REMOVE:
      return m2.type === MorrisMoveType.REMOVE && m1.from === m2.from;
    case MorrisMoveType.ROOT:
      return m2.type === MorrisMoveType.ROOT;
  }
}
