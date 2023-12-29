import * as P from '@konker.dev/effect-ts-prelude';

import { String_MorrisMove } from '../../moves/transforms';
import type { EvaluatedGameTreeNode } from './gameTree';

/**
 * Generate a dot format rendering of the game tree
 */
export function gameTreeNodeDot<P extends number, D extends number, N extends number>(
  gameTreeNode: EvaluatedGameTreeNode<P, D, N>,
  index = 0,
  depth = 0
): string {
  const preamble = depth === 0 ? 'digraph G {\n' : '';
  const postamble = depth === 0 ? '}' : '';

  const body = gameTreeNode.children.map(
    (child, childIndex) => `
    "${gameTreeNode.aim}.${P.Schema.encodeSync(String_MorrisMove(gameTreeNode.gameTick.game.board.dimension))(
      gameTreeNode.move
    )}.${depth}${index}.${gameTreeNode.score}" -> "${child.aim}.${P.Schema.encodeSync(
      String_MorrisMove(gameTreeNode.gameTick.game.board.dimension)
    )(child.move)}.${depth + 1}${childIndex}.${child.score}";
  `
  );

  return `${preamble}\n
     ${body}
     ${gameTreeNode.children.map((child, childIndex) => gameTreeNodeDot(child, childIndex, depth + 1))}
  ${postamble}\n`;
}
