import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../../lib/error';
import type { MorrisMove } from '../../moves/schemas';
import type { MorrisGameTick } from '../../tick';
import { tickGetTurnColor } from '../../tick';
import { gameTreeCreate } from './gameTree';
import { gameTreeNodeScore } from './score';

export const SEARCH_DEPTH = 3;

export function autoPlayerMiniMax(gameTick: MorrisGameTick): P.Effect.Effect<never, MorrisEngineError, MorrisMove> {
  return P.pipe(
    gameTreeCreate(gameTick, gameTreeNodeScore, tickGetTurnColor(gameTick), SEARCH_DEPTH),
    P.Effect.map((gameTreeNode) => gameTreeNode.bestChildMove)
  );
}
