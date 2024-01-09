import type * as R from '@konker.dev/tiny-rules-fp';

import type { MorrisEngineError } from '../../lib/error';
import type { MorrisGame } from '../game';
import type { MorrisMove } from '../moves/schemas';
import type { MorrisGameTick } from '../tick';
import type { MorrisFactsGame } from './factsGame';
import type { MorrisFactsMove } from './factsMove';

// --------------------------------------------------------------------------
export type MorrisRulesContextGame = {
  readonly game: MorrisGame;
  readonly moveFacts: MorrisFactsMove;
};

export type MorrisRulesetGame = R.RuleSet<never, MorrisRulesContextGame, MorrisEngineError, MorrisFactsGame>;

// --------------------------------------------------------------------------
export type MorrisRulesContextMove = {
  readonly gameTick: MorrisGameTick;
  readonly move: MorrisMove;
};

export type MorrisRulesetMove = R.RuleSet<never, MorrisRulesContextMove, MorrisEngineError, MorrisFactsMove>;
