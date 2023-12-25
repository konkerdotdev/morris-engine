// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import type { MorrisMoveS } from '../moves/schemas';
import type { MorrisGameTick } from '../tick';

export type AutoPlayer<P extends number, D extends number, N extends number> = (
  gameTick: MorrisGameTick<P, D, N>
) => P.Effect.Effect<never, MorrisEngineError, MorrisMoveS<D>>;
