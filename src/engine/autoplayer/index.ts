// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import type { MorrisMove } from '../moves/schemas';
import type { MorrisGameTick } from '../tick';

export type AutoPlayer = (gameTick: MorrisGameTick) => P.Effect.Effect<never, MorrisEngineError, MorrisMove>;
