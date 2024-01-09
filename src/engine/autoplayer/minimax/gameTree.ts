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

export type GameTreeNode<P extends number, D extends number, N extends number> = {
  readonly type: NodeType;
  readonly aim: NodeAim;
  readonly depth: number;
  readonly gameTick: MorrisGameTick<P, D, N>;
  readonly move: MorrisMove<D>;
  readonly children: ReadonlyArray<EvaluatedGameTreeNode<P, D, N>>;
};

export type EvaluatedGameTreeNode<P extends number, D extends number, N extends number> = GameTreeNode<P, D, N> & {
  readonly bestChildMove: MorrisMove<D>;
  readonly score: number;
};

export type EvalResult<D extends number> = {
  readonly score: number;
  readonly bestChildMove: MorrisMove<D>;
};

export type scoreGameTreeNode<P extends number, D extends number, N extends number> = (
  gameTreeNode: GameTreeNode<P, D, N>,
  maxColor: MorrisColor
) => P.Effect.Effect<never, MorrisEngineError, number>;

// --------------------------------------------------------------------------
export function gameTreeNodeCreate<P extends number, D extends number, N extends number>(
  type: NodeType,
  aim: NodeAim,
  depth: number,
  gameTick: MorrisGameTick<P, D, N>,
  move: MorrisMove<D>,
  children: ReadonlyArray<EvaluatedGameTreeNode<P, D, N>>
): GameTreeNode<P, D, N> {
  return {
    type,
    aim,
    depth,
    gameTick,
    move,
    children,
  };
}

export function gameTreeNodeSetEvalResult<P extends number, D extends number, N extends number>(
  gameTreeNode: GameTreeNode<P, D, N>,
  evalResult: EvalResult<D>
): EvaluatedGameTreeNode<P, D, N> {
  return {
    ...gameTreeNode,
    ...evalResult,
  };
}

export function gameTreeNodeEvaluate<P extends number, D extends number, N extends number>(
  gameTreeNode: GameTreeNode<P, D, N>,
  scoreF: scoreGameTreeNode<P, D, N>,
  maxColor: MorrisColor
): P.Effect.Effect<never, MorrisEngineError, EvalResult<D>> {
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
      ? (_maxBy(gameTreeNode.children, 'score') as EvaluatedGameTreeNode<P, D, N>)
      : (_minBy(gameTreeNode.children, 'score') as EvaluatedGameTreeNode<P, D, N>);

  return P.Effect.succeed({
    score: bestChild.score,
    bestChildMove: bestChild.move,
  });
}

export function gameTreeCreate<P extends number, D extends number, N extends number>(
  gameTick: MorrisGameTick<P, D, N>,
  _scoreF: scoreGameTreeNode<P, D, N>,
  maxColor: MorrisColor,
  depth: number
): P.Effect.Effect<never, MorrisEngineError, EvaluatedGameTreeNode<P, D, N>> {
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

export function gameTreeCreateChild<P extends number, D extends number, N extends number>(
  gameTick: MorrisGameTick<P, D, N>,
  move: MorrisMove<D>,
  _scoreF: scoreGameTreeNode<P, D, N>,
  maxColor: MorrisColor,
  depth: number
): P.Effect.Effect<never, MorrisEngineError, EvaluatedGameTreeNode<P, D, N>> {
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
