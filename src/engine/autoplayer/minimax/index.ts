import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../../lib/error';
import type { MorrisMoveS } from '../../moves/schemas';
import { RulesImpl } from '../../rules';
import { RulesGame } from '../../rules/rulesGame';
import { RulesMove } from '../../rules/rulesMove';
import type { MorrisGameTick } from '../../tick';
import { tickTurn } from '../../tick';
import {
  morrisCreateGameTree,
  morrisEvaluateGameTreeNode,
  morrisScoreGameTreeNode,
  strEvaluatedGameTreeNode,
} from './minimax';

export const SEARCH_DEPTH = 2;

export function autoPlayerMiniMax<P extends number, D extends number, N extends number>(
  gameTick: MorrisGameTick<P, D, N>
): P.Effect.Effect<never, MorrisEngineError, MorrisMoveS<D>> {
  return P.pipe(
    morrisCreateGameTree(
      gameTick,
      morrisScoreGameTreeNode,
      morrisEvaluateGameTreeNode,
      tickTurn(gameTick),
      SEARCH_DEPTH
    ),
    // eslint-disable-next-line fp/no-nil
    P.Effect.tap((x) => P.Console.log(strEvaluatedGameTreeNode(x))),
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
