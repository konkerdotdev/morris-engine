import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../../lib/error';
import * as R from '../../../lib/tiny-rules-fp';
import { flipColor, MorrisColor } from '../../consts';
import { moveCountValidMovesForColor } from '../../moves/query';
import type { GameTreeNode } from './gameTree';

export function gameTreeNodeScore<P extends number, D extends number, N extends number>(
  gameTreeNode: GameTreeNode<P, D, N>,
  maxColor: MorrisColor
): P.Effect.Effect<never, MorrisEngineError, number> {
  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('numValidMovesForMaxColor', () =>
      moveCountValidMovesForColor(gameTreeNode.gameTick.game, gameTreeNode.gameTick.facts, maxColor)
    ),
    P.Effect.bind('numValidMovesForMinColor', () =>
      moveCountValidMovesForColor(gameTreeNode.gameTick.game, gameTreeNode.gameTick.facts, flipColor(maxColor))
    ),
    P.Effect.map(({ numValidMovesForMaxColor, numValidMovesForMinColor }) => {
      const winForMaxColor =
        maxColor === MorrisColor.BLACK
          ? R.val(gameTreeNode.gameTick.facts.isWinBlack)
            ? 1
            : 0
          : R.val(gameTreeNode.gameTick.facts.isWinWhite)
            ? 1
            : 0;
      const winForMinColor =
        flipColor(maxColor) === MorrisColor.BLACK
          ? R.val(gameTreeNode.gameTick.facts.isWinBlack)
            ? 1
            : 0
          : R.val(gameTreeNode.gameTick.facts.isWinWhite)
            ? 1
            : 0;

      const millMadeForMaxColor = R.val(gameTreeNode.gameTick.facts.isMillMadeBlack) ? 1 : 0;
      const millMadeForMinColor = R.val(gameTreeNode.gameTick.facts.isMillMadeWhite) ? 1 : 0;

      const maxColorHeuristic = 0 * numValidMovesForMaxColor + 0 * millMadeForMaxColor + 100 * winForMaxColor;
      const minColorHeuristic = 0 * numValidMovesForMinColor + 0 * millMadeForMinColor + 100 * winForMinColor;

      return maxColorHeuristic - minColorHeuristic;
    })
  );
  /*
    - TODO
      - number of pieces
        - w: 3.0
        - w3: 0
      - number of available moves (greater is better)
        - w: 0.1
        - w3: 1.0
      - number of mills (3mm => max)
        - w: 1.0
        - w3: 100
      - number of potential mills (3mm => max),
        - TODO
      - Number of intersections held
        - TODO
      - Number of 2 in a row pieces
        - TODO
  */
}
