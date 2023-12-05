import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import type * as R from '../../lib/tiny-rules-fp';
import type { MorrisGame } from '../game';
import type { MorrisMoveS } from '../moves/schemas';
import type { MorrisGameFacts } from './facts';

export type MorrisRulesContextMove<P extends number, D extends number, N extends number> = {
  readonly game: MorrisGame<P, D, N>;
  readonly move: MorrisMoveS<D>;
};

export type MorrisRulesContextApply = object;

export type MorrisRulesetMove<P extends number, D extends number, N extends number> = R.RuleSet<
  MorrisRulesContextMove<P, D, N>,
  MorrisEngineError,
  MorrisGameFacts
>;

export type MorrisRulesetApply = R.RuleSet<MorrisRulesContextApply, MorrisEngineError, MorrisGameFacts>;

export type RulesImpl = {
  readonly rulesetMove: <P extends number, D extends number, N extends number>() => MorrisRulesetMove<P, D, N>;
  readonly rulesetApply: () => MorrisRulesetApply;
};

export const RulesImpl = P.Context.Tag<RulesImpl>('RulesImpl');
