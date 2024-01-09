import type * as R from '@konker.dev/tiny-rules-fp';

import type { MorrisEngineError } from '../../lib/error';
import type { MorrisGame } from '../game';
import type { MorrisMove } from '../moves/schemas';
import type { MorrisGameTick } from '../tick';
import type { MorrisFactsGame } from './factsGame';
import type { MorrisFactsMove } from './factsMove';

// --------------------------------------------------------------------------
export type MorrisRulesContextGame<P extends number, D extends number, N extends number> = {
  readonly game: MorrisGame<P, D, N>;
  readonly moveFacts: MorrisFactsMove;
};

export type MorrisRulesetGame<P extends number, D extends number, N extends number> = R.RuleSet<
  never,
  MorrisRulesContextGame<P, D, N>,
  MorrisEngineError,
  MorrisFactsGame
>;

// --------------------------------------------------------------------------
export type MorrisRulesContextMove<P extends number, D extends number, N extends number> = {
  readonly gameTick: MorrisGameTick<P, D, N>;
  readonly move: MorrisMove<D>;
};

export type MorrisRulesetMove<P extends number, D extends number, N extends number> = R.RuleSet<
  never,
  MorrisRulesContextMove<P, D, N>,
  MorrisEngineError,
  MorrisFactsMove
>;
