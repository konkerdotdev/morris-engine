import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../lib/error';
import type { Morris, MorrisGame, MorrisGameTick } from './index';
import { MorrisColor } from './index';
import { INITIAL_MORRIS_GAME_FACTS } from './rules/facts';
import { makeMorrisGameTick } from './tick';

export function startMorrisGame<P extends number, D extends number, N extends number>(
  morrisGame: MorrisGame<P, D, N>
): P.Effect.Effect<never, MorrisEngineError, MorrisGameTick<P, D, N>> {
  return makeMorrisGameTick(morrisGame, INITIAL_MORRIS_GAME_FACTS, 'BEGIN');
}

export function useMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  morris: Morris<N>
): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> {
  const morrisWhiteWithout =
    morris.color === MorrisColor.WHITE ? game.morrisWhite.filter((i) => i.n !== morris.n) : game.morrisWhite;
  const morrisBlackWithout =
    morris.color === MorrisColor.BLACK ? game.morrisBlack.filter((i) => i.n !== morris.n) : game.morrisBlack;

  return P.Effect.succeed({
    ...game,
    morrisWhite: morrisWhiteWithout,
    morrisBlack: morrisBlackWithout,
  });
}

export function discardMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  morris: Morris<N>
): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> {
  const morrisWhiteRemovedWith =
    morris.color === MorrisColor.WHITE ? [...game.morrisWhiteRemoved, morris] : game.morrisWhiteRemoved;
  const morrisBlackRemovedWith =
    morris.color === MorrisColor.BLACK ? [...game.morrisBlackRemoved, morris] : game.morrisBlackRemoved;

  return P.Effect.succeed({
    ...game,
    morrisWhiteRemoved: morrisWhiteRemovedWith,
    morrisBlackRemoved: morrisBlackRemovedWith,
  });
}
