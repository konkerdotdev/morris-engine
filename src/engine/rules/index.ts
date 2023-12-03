import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import type * as R from '../../lib/tiny-rules-fp';
import type { MorrisGame, MorrisMove } from '../index';
import type { MorrisGameFacts } from './facts';

export type MorrisRulesContext<P extends number, D extends number, N extends number> = {
  readonly game: MorrisGame<P, D, N>;
  readonly move: MorrisMove<D>;
};

export type RulesImpl = {
  ruleSet: <P extends number, D extends number, N extends number>() => R.RuleSet<
    MorrisRulesContext<P, D, N>,
    MorrisGameFacts,
    MorrisEngineError
  >;
};

export const RulesImpl = P.Context.Tag<RulesImpl>('RulesImpl');
