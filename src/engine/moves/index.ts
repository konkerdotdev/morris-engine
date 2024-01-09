import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { boardGetMorrisAtCoord } from '../board/points';
import type { MorrisBoardCoord } from '../board/schemas';
import type { MorrisColor } from '../consts';
import { flipColor, MorrisMoveType } from '../consts';
import type { MorrisGame } from '../game';
import type { MorrisMove, MorrisMoveMove, MorrisMovePlace, MorrisMoveRemove, MorrisMoveRoot } from './schemas';

// --------------------------------------------------------------------------
export const ROOT_MOVE_STR = '-';

export const moveCreateRoot = (): MorrisMoveRoot => ({
  type: MorrisMoveType.ROOT,
});

export const moveCreatePlace = (color: MorrisColor, to: MorrisBoardCoord): MorrisMovePlace => ({
  type: MorrisMoveType.PLACE,
  color,
  to,
});

export const moveCreateMove = (from: MorrisBoardCoord, to: MorrisBoardCoord): MorrisMoveMove => ({
  type: MorrisMoveType.MOVE,
  from,
  to,
});

export const moveCreateRemove = (from: MorrisBoardCoord): MorrisMoveRemove => ({
  type: MorrisMoveType.REMOVE,
  from,
});

// --------------------------------------------------------------------------

// eslint-disable-next-line fp/no-nil
export function moveColor(game: MorrisGame, move: MorrisMove): P.Effect.Effect<never, MorrisEngineError, MorrisColor> {
  switch (move.type) {
    case MorrisMoveType.PLACE:
      return P.Effect.succeed(move.color);
    case MorrisMoveType.MOVE:
      return P.pipe(
        boardGetMorrisAtCoord(game.gameState.board, move.from),
        P.Effect.map((morris) => morris.color)
      );
    case MorrisMoveType.REMOVE:
      return P.pipe(
        boardGetMorrisAtCoord(game.gameState.board, move.from),
        P.Effect.map((morris) => flipColor(morris.color))
      );
    case MorrisMoveType.ROOT:
      return P.Effect.succeed(game.gameState.startColor);
  }
}

// --------------------------------------------------------------------------
// eslint-disable-next-line fp/no-nil
export function moveEqual(m1: MorrisMove, m2: MorrisMove): boolean {
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
