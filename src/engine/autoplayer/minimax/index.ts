import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../../lib/error';
import type { MorrisMove } from '../../moves/schemas';
import { RulesImpl } from '../../rules';
import { RulesGame } from '../../rules/rulesGame';
import { RulesMove } from '../../rules/rulesMove';
import type { MorrisGameTick } from '../../tick';
import { tickGetTurnColor } from '../../tick';
import { gameTreeCreate } from './gameTree';
import { gameTreeNodeScore } from './score';

export const SEARCH_DEPTH = 3;

export function autoPlayerMiniMax<P extends number, D extends number, N extends number>(
  gameTick: MorrisGameTick<P, D, N>
): P.Effect.Effect<never, MorrisEngineError, MorrisMove<D>> {
  return P.pipe(
    gameTreeCreate(gameTick, gameTreeNodeScore, tickGetTurnColor(gameTick), SEARCH_DEPTH),
    P.Effect.map((gameTreeNode) => gameTreeNode.bestChildMove),
    P.Effect.provideService(
      RulesImpl,
      RulesImpl.of({
        rulesetGame: RulesGame,
        rulesetMove: RulesMove,
      })
    )
  );
}
