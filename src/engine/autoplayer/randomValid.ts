import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import { getValidMovesForColor } from '../moves/query';
import type { MorrisMoveS } from '../moves/schemas';
import type { MorrisGameTick } from '../tick';
import { tickTurn } from '../tick';

export function autoPlayerRandomValid<P extends number, D extends number, N extends number>(
  gameTick: MorrisGameTick<P, D, N>
): P.Effect.Effect<never, MorrisEngineError, MorrisMoveS<D>> {
  return P.pipe(
    getValidMovesForColor(gameTick.game, gameTick.facts, tickTurn(gameTick)),
    P.Effect.flatMap((validMoves) => {
      if (0 in validMoves) {
        const i = Math.floor(Math.random() * validMoves.length);
        return P.Effect.succeed(validMoves[i]!);
      }
      return P.Effect.fail(toMorrisEngineError('No valid move'));
    })
  );
}
