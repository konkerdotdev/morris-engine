import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import { getValidMovesForColor } from '../moves/query';
import type { MorrisMoveS } from '../moves/schemas';
import type { MorrisGameTick } from '../tick';
import { tickTurn } from '../tick';

export function autoPlayerFirstValid<P extends number, D extends number, N extends number>(
  gameTick: MorrisGameTick<P, D, N>
): P.Effect.Effect<never, MorrisEngineError, MorrisMoveS<D>> {
  return P.pipe(
    getValidMovesForColor(gameTick.game, gameTick.facts, tickTurn(gameTick)),
    P.Effect.flatMap((validMoves) =>
      0 in validMoves ? P.Effect.succeed(validMoves[0]) : P.Effect.fail(toMorrisEngineError('No valid move'))
    )
  );
}
