// --------------------------------------------------------------------------
import * as P from '@konker.dev/effect-ts-prelude';

import { String_MorrisMove } from '../../moves/transforms';
import type { EvaluatedGameTreeNode } from './minimax';

export function dotEvaluatedGameTreeNode<P extends number, D extends number, N extends number>(
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
     ${gameTreeNode.children.map((child, childIndex) => dotEvaluatedGameTreeNode(child, childIndex, depth + 1))}
  ${postamble}\n`;
}

export function strEvaluatedGameTreeNode<P extends number, D extends number, N extends number>(
  gameTreeNode: EvaluatedGameTreeNode<P, D, N>,
  depth = 0
): string {
  const padLeft = Array(depth).fill('  ').join('');

  return `${padLeft}[
    ${padLeft}type: ${gameTreeNode.type},
    ${padLeft}aim: ${gameTreeNode.aim},
    ${padLeft}depth: ${gameTreeNode.depth},
    ${padLeft}score: ${gameTreeNode.score},
    ${padLeft}move: ${JSON.stringify(gameTreeNode.move)},
    ${padLeft}bestChildMove: ${JSON.stringify(gameTreeNode.bestChildMove)},
    ${padLeft}children: [
${padLeft}${gameTreeNode.children.map((i) => strEvaluatedGameTreeNode(i, depth + 1))}
    ${padLeft}]
  ${padLeft}]\n`;
}
