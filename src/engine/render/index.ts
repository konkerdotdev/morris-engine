import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import type { MorrisGameTick } from '../tick';

export type RenderImpl = {
  readonly renderString: (gameTick: MorrisGameTick) => P.Effect.Effect<never, MorrisEngineError, string>;
};

export const RenderImpl = P.Context.Tag<RenderImpl>('RenderImpl');
