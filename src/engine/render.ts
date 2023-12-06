import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../lib/error';
import type { MorrisGameTick } from './tick';

export type RenderImpl = {
  readonly render: <P extends number, D extends number, N extends number>(
    gameTick: MorrisGameTick<P, D, N>
  ) => P.Effect.Effect<never, MorrisEngineError, void>;
};

export const RenderImpl = P.Context.Tag<RenderImpl>('RenderImpl');
