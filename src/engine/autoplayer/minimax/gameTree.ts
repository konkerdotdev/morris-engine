import * as P from '@konker.dev/effect-ts-prelude';
import _maxBy from 'lodash/maxBy';
import _minBy from 'lodash/minBy';

import type { MorrisEngineError } from '../../../lib/error';
import type { MorrisColor } from '../../consts';
import { MorrisGameResult } from '../../consts';
import { moveCreateRoot } from '../../moves';
import { moveListValidMovesForColor } from '../../moves/query';
import type { MorrisMove } from '../../moves/schemas';
import type { MorrisGameTick } from '../../tick';
import { tick, tickGetTurnColor } from '../../tick';

// --------------------------------------------------------------------------
export enum NodeType {
  NODE = 'NODE',
  LEAF = 'LEAF',
}

export enum NodeAim {
  MIN = -1,
  MAX = 1,
}

export type GameTreeNode = {
  readonly type: NodeType;
  readonly aim: NodeAim;
  readonly depth: number;
  readonly gameTick: MorrisGameTick;
  readonly move: MorrisMove;
  readonly children: ReadonlyArray<EvaluatedGameTreeNode>;
};

export type EvaluatedGameTreeNode = GameTreeNode & {
  readonly bestChildMove: MorrisMove;
  readonly score: number;
};

export type EvalResult = {
  readonly score: number;
  readonly bestChildMove: MorrisMove;
};

export type scoreGameTreeNode = (
  gameTreeNode: GameTreeNode,
  maxColor: MorrisColor
) => P.Effect.Effect<never, MorrisEngineError, number>;

// --------------------------------------------------------------------------
export function gameTreeNodeCreate(
  type: NodeType,
  aim: NodeAim,
  depth: number,
  gameTick: MorrisGameTick,
  move: MorrisMove,
  children: ReadonlyArray<EvaluatedGameTreeNode>
): GameTreeNode {
  return {
    type,
    aim,
    depth,
    gameTick,
    move,
    children,
  };
}

export function gameTreeNodeSetEvalResult(gameTreeNode: GameTreeNode, evalResult: EvalResult): EvaluatedGameTreeNode {
  return {
    ...gameTreeNode,
    ...evalResult,
  };
}

export function gameTreeNodeEvaluate(
  gameTreeNode: GameTreeNode,
  scoreF: scoreGameTreeNode,
  maxColor: MorrisColor
): P.Effect.Effect<never, MorrisEngineError, EvalResult> {
  if (gameTreeNode.type === NodeType.LEAF) {
    return P.pipe(
      scoreF(gameTreeNode, maxColor),
      P.Effect.map((score) => ({
        score,
        bestChildMove: gameTreeNode.move,
      }))
    );
  }

  const bestChild =
    gameTreeNode.aim === NodeAim.MAX
      ? (_maxBy(gameTreeNode.children, 'score') as EvaluatedGameTreeNode)
      : (_minBy(gameTreeNode.children, 'score') as EvaluatedGameTreeNode);

  return P.Effect.succeed({
    score: bestChild.score,
    bestChildMove: bestChild.move,
  });
}

export function gameTreeCreate(
  gameTick: MorrisGameTick,
  _scoreF: scoreGameTreeNode,
  maxColor: MorrisColor,
  depth: number
): P.Effect.Effect<never, MorrisEngineError, EvaluatedGameTreeNode> {
  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('validMoves', () =>
      moveListValidMovesForColor(gameTick.game, gameTick.facts, tickGetTurnColor(gameTick))
    ),
    P.Effect.bind('children', ({ validMoves }) =>
      P.pipe(
        validMoves.map((move) => gameTreeCreateChild(gameTick, move, _scoreF, maxColor, depth)),
        P.Effect.all
      )
    ),
    P.Effect.map(({ children }) =>
      gameTreeNodeCreate(
        NodeType.NODE,
        tickGetTurnColor(gameTick) === maxColor ? NodeAim.MAX : NodeAim.MIN,
        depth,
        gameTick,
        moveCreateRoot(),
        children
      )
    ),
    P.Effect.flatMap((gameTreeNode) =>
      P.pipe(
        gameTreeNodeEvaluate(gameTreeNode, _scoreF, maxColor),
        P.Effect.map((evalResult) => gameTreeNodeSetEvalResult(gameTreeNode, evalResult))
      )
    )
  );
}

export function gameTreeCreateChild(
  gameTick: MorrisGameTick,
  move: MorrisMove,
  _scoreF: scoreGameTreeNode,
  maxColor: MorrisColor,
  depth: number
): P.Effect.Effect<never, MorrisEngineError, EvaluatedGameTreeNode> {
  return depth === 0
    ? // Leaf node
      P.pipe(
        gameTick,
        tick(move),
        P.Effect.map((newGameTick) =>
          gameTreeNodeCreate(
            NodeType.LEAF,
            tickGetTurnColor(newGameTick) === maxColor ? NodeAim.MAX : NodeAim.MIN,
            depth,
            newGameTick,
            move,
            []
          )
        ),
        P.Effect.flatMap((leafGameTreeNode) =>
          P.pipe(
            gameTreeNodeEvaluate(leafGameTreeNode, _scoreF, maxColor),
            P.Effect.map((evalResult) => gameTreeNodeSetEvalResult(leafGameTreeNode, evalResult))
          )
        )
      )
    : P.pipe(
        P.Effect.Do,
        P.Effect.bind('newGameTick', () => P.pipe(gameTick, tick(move))),
        P.Effect.bind('validMoves', ({ newGameTick }) =>
          moveListValidMovesForColor(newGameTick.game, newGameTick.facts, tickGetTurnColor(newGameTick))
        ),
        P.Effect.bind('nodeType', ({ newGameTick }) =>
          newGameTick.game.gameState.result === MorrisGameResult.IN_PROGRESS
            ? P.Effect.succeed(NodeType.NODE)
            : P.Effect.succeed(NodeType.LEAF)
        ),
        P.Effect.bind('children', ({ newGameTick, nodeType, validMoves }) =>
          nodeType === NodeType.NODE
            ? P.pipe(
                validMoves.map((move) => gameTreeCreateChild(newGameTick, move, _scoreF, maxColor, depth - 1)),
                P.Effect.all
              )
            : P.Effect.succeed([])
        ),
        P.Effect.map(({ children, newGameTick, nodeType }) =>
          gameTreeNodeCreate(
            nodeType,
            tickGetTurnColor(newGameTick) === maxColor ? NodeAim.MAX : NodeAim.MIN,
            depth,
            newGameTick,
            move,
            children
          )
        ),
        P.Effect.flatMap((gameTreeNode) =>
          P.pipe(
            gameTreeNodeEvaluate(gameTreeNode, _scoreF, maxColor),
            P.Effect.map((evalResult) => gameTreeNodeSetEvalResult(gameTreeNode, evalResult))
          )
        )
      );
}
