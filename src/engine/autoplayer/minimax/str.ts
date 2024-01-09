import * as P from '@konker.dev/effect-ts-prelude';

import { MorrisMove } from '../../moves/schemas';
import type { EvaluatedGameTreeNode } from './gameTree';

/**
 * Generate a dot format rendering of the game tree
 */
export function gameTreeNodeDot(gameTreeNode: EvaluatedGameTreeNode, index = 0, depth = 0): string {
  const preamble = depth === 0 ? 'digraph G {\n' : '';
  const postamble = depth === 0 ? '}' : '';

  const body = gameTreeNode.children.map(
    (child, childIndex) => `
    "${gameTreeNode.aim}.${P.Schema.encodeSync(MorrisMove(gameTreeNode.gameTick.game.gameState.board.dimension))(
      gameTreeNode.move
    )}.${depth}${index}.${gameTreeNode.score}" -> "${child.aim}.${P.Schema.encodeSync(
      MorrisMove(gameTreeNode.gameTick.game.gameState.board.dimension)
    )(child.move)}.${depth + 1}${childIndex}.${child.score}";
  `
  );

  return `${preamble}\n
     ${body}
     ${gameTreeNode.children.map((child, childIndex) => gameTreeNodeDot(child, childIndex, depth + 1))}
  ${postamble}\n`;
}
