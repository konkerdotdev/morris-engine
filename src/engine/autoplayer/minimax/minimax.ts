// --------------------------------------------------------------------------
import * as P from '@konker.dev/effect-ts-prelude';
import console from 'console';
import _maxBy from 'lodash/maxBy';
import _minBy from 'lodash/minBy';

import type { MorrisEngineError } from '../../../lib/error';
import * as R from '../../../lib/tiny-rules-fp';
import { MorrisColor, MorrisGameResult } from '../../consts';
import { createMoveRoot, flipColor } from '../../moves';
import { countValidMovesForColor, getValidMovesForColor } from '../../moves/query';
import type { MorrisMoveS } from '../../moves/schemas';
import type { RulesImpl } from '../../rules';
import type { MorrisGameTick } from '../../tick';
import { tick, tickTurn } from '../../tick';

export enum NodeAim {
  MIN = -1,
  MAX = 1,
}

export type GameTreeNode<P extends number, D extends number, N extends number> = {
  readonly aim: NodeAim;
  readonly depth: number;
  readonly gameTick: MorrisGameTick<P, D, N>;
  readonly move: MorrisMoveS<D>;
  readonly children: ReadonlyArray<EvaluatedGameTreeNode<P, D, N>>;
};

export type EvaluatedGameTreeNode<P extends number, D extends number, N extends number> = GameTreeNode<P, D, N> & {
  readonly bestChildMove: MorrisMoveS<D>;
  readonly score: number;
};

export type EvalResult<D extends number> = {
  readonly score: number;
  readonly bestChildMove: MorrisMoveS<D>;
};

export type scoreGameTreeNode<P extends number, D extends number, N extends number> = (
  gameTreeNode: GameTreeNode<P, D, N>,
  maxColor: MorrisColor
) => P.Effect.Effect<never, MorrisEngineError, number>;

export type evaluateGameTreeNode<P extends number, D extends number, N extends number> = (
  gameTreeNode: GameTreeNode<P, D, N>,
  scoreF: scoreGameTreeNode<P, D, N>,
  maxColor: MorrisColor
) => P.Effect.Effect<never, MorrisEngineError, EvalResult<D>>;

// --------------------------------------------------------------------------
export function strEvaluatedGameTreeNode<P extends number, D extends number, N extends number>(
  gameTreeNode: EvaluatedGameTreeNode<P, D, N>,
  depth = 0
): string {
  const padLeft = Array(depth).fill('  ').join('');

  return `${padLeft}[
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

// --------------------------------------------------------------------------
export function createGameTreeNode<P extends number, D extends number, N extends number>(
  aim: NodeAim,
  depth: number,
  gameTick: MorrisGameTick<P, D, N>,
  move: MorrisMoveS<D>,
  children: ReadonlyArray<EvaluatedGameTreeNode<P, D, N>>
): GameTreeNode<P, D, N> {
  return {
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

// --------------------------------------------------------------------------
export function morrisEvaluateGameTreeNode<P extends number, D extends number, N extends number>(
  gameTreeNode: GameTreeNode<P, D, N>,
  scoreF: scoreGameTreeNode<P, D, N>,
  maxColor: MorrisColor
): P.Effect.Effect<never, MorrisEngineError, EvalResult<D>> {
  if (gameTreeNode.children.length === 0) {
    // Leaf node
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

export function morrisScoreGameTreeNode<P extends number, D extends number, N extends number>(
  gameTreeNode: GameTreeNode<P, D, N>,
  maxColor: MorrisColor
): P.Effect.Effect<never, MorrisEngineError, number> {
  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('numValidMovesForMaxColor', () =>
      countValidMovesForColor(gameTreeNode.gameTick.game, gameTreeNode.gameTick.facts, maxColor)
    ),
    P.Effect.bind('numValidMovesForMinColor', () =>
      countValidMovesForColor(gameTreeNode.gameTick.game, gameTreeNode.gameTick.facts, flipColor(maxColor))
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
      const resultForMaxColor =
        maxColor === MorrisColor.BLACK
          ? gameTreeNode.gameTick.game.result == MorrisGameResult.WIN_BLACK
            ? 1
            : 0
          : gameTreeNode.gameTick.game.result == MorrisGameResult.WIN_WHITE
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
      const resultForMinColor =
        flipColor(maxColor) === MorrisColor.BLACK
          ? gameTreeNode.gameTick.game.result == MorrisGameResult.WIN_BLACK
            ? 1
            : 0
          : gameTreeNode.gameTick.game.result == MorrisGameResult.WIN_WHITE
            ? 1
            : 0;
      // const millMadeForMaxColor = R.val(gameTreeNode.gameTick.facts.isMillMadeBlack) ? 1 : 0;
      // const millMadeForMinColor = R.val(gameTreeNode.gameTick.facts.isMillMadeWhite) ? 1 : 0;

      if (gameTreeNode.depth === 0) {
        // console.log('KONK90', gameTreeNode.gameTick.tickN);
        // eslint-disable-next-line fp/no-unused-expression
        console.log(
          'KONK90',
          maxColor,
          gameTreeNode.gameTick.tickN,
          R.val(gameTreeNode.gameTick.facts.isWinBlack),
          R.val(gameTreeNode.gameTick.facts.isWinWhite),
          winForMaxColor,
          winForMinColor,
          1 * numValidMovesForMaxColor + -1 * numValidMovesForMinColor + 100 * winForMaxColor + -100 * winForMinColor
        );
      }

      const maxColorHeuristic = 1 * numValidMovesForMaxColor + 100 * winForMaxColor + 200 * resultForMaxColor;
      const minColorHeuristic = 1 * numValidMovesForMinColor + 100 * winForMinColor + 200 * resultForMinColor;

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

export function morrisCreateGameTree<P extends number, D extends number, N extends number>(
  gameTick: MorrisGameTick<P, D, N>,
  scoreF: scoreGameTreeNode<P, D, N>,
  evalF: evaluateGameTreeNode<P, D, N>,
  maxColor: MorrisColor,
  depth: number
): P.Effect.Effect<RulesImpl, MorrisEngineError, EvaluatedGameTreeNode<P, D, N>> {
  return morrisCreateGameTreeNodeRoot(gameTick, scoreF, evalF, maxColor, depth);
}

export function morrisCreateGameTreeNodeRoot<P extends number, D extends number, N extends number>(
  gameTick: MorrisGameTick<P, D, N>,
  _scoreF: scoreGameTreeNode<P, D, N>,
  _evalF: evaluateGameTreeNode<P, D, N>,
  maxColor: MorrisColor,
  depth: number
): P.Effect.Effect<RulesImpl, MorrisEngineError, EvaluatedGameTreeNode<P, D, N>> {
  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('validMoves', () => getValidMovesForColor(gameTick.game, gameTick.facts, tickTurn(gameTick))),
    P.Effect.bind('children', ({ validMoves }) =>
      P.pipe(
        validMoves.map((move) => morrisCreateGameTreeNodeChild(gameTick, move, _scoreF, _evalF, maxColor, depth)),
        P.Effect.all
      )
    ),
    P.Effect.map(({ children }) =>
      createGameTreeNode(
        tickTurn(gameTick) === maxColor ? NodeAim.MAX : NodeAim.MIN,
        depth,
        gameTick,
        createMoveRoot(),
        children
      )
    ),
    P.Effect.flatMap((gameTreeNode) =>
      P.pipe(
        _evalF(gameTreeNode, _scoreF, maxColor),
        P.Effect.map((evalResult) => gameTreeNodeSetEvalResult(gameTreeNode, evalResult))
      )
    )
  );
}

export function morrisCreateGameTreeNodeChild<P extends number, D extends number, N extends number>(
  gameTick: MorrisGameTick<P, D, N>,
  move: MorrisMoveS<D>,
  _scoreF: scoreGameTreeNode<P, D, N>,
  _evalF: evaluateGameTreeNode<P, D, N>,
  maxColor: MorrisColor,
  depth: number
): P.Effect.Effect<RulesImpl, MorrisEngineError, EvaluatedGameTreeNode<P, D, N>> {
  return depth === 0
    ? // Leaf node
      P.pipe(
        gameTick,
        tick(move),
        P.Effect.map((newGameTick) =>
          createGameTreeNode(
            tickTurn(newGameTick) === maxColor ? NodeAim.MAX : NodeAim.MIN,
            depth,
            newGameTick,
            move,
            []
          )
        ),
        P.Effect.flatMap((leafGameTreeNode) =>
          P.pipe(
            _evalF(leafGameTreeNode, _scoreF, maxColor),
            P.Effect.map((evalResult) => gameTreeNodeSetEvalResult(leafGameTreeNode, evalResult))
          )
        )
      )
    : P.pipe(
        P.Effect.Do,
        P.Effect.bind('newGameTick', () => P.pipe(gameTick, tick(move))),
        P.Effect.bind('validMoves', ({ newGameTick }) =>
          getValidMovesForColor(newGameTick.game, newGameTick.facts, tickTurn(newGameTick))
        ),
        P.Effect.bind('children', ({ newGameTick, validMoves }) =>
          P.pipe(
            validMoves.map((move) =>
              morrisCreateGameTreeNodeChild(newGameTick, move, _scoreF, _evalF, maxColor, depth - 1)
            ),
            P.Effect.all
          )
        ),
        P.Effect.map(({ children, newGameTick }) =>
          createGameTreeNode(
            tickTurn(newGameTick) === maxColor ? NodeAim.MAX : NodeAim.MIN,
            depth,
            newGameTick,
            move,
            children
          )
        ),
        P.Effect.flatMap((gameTreeNode) =>
          P.pipe(
            _evalF(gameTreeNode, _scoreF, maxColor),
            P.Effect.map((evalResult) => gameTreeNodeSetEvalResult(gameTreeNode, evalResult))
          )
        )
      );
}

/*
export function evaluateGameTree<P extends number, D extends number, N extends number>(
  getMovesForGameTick: getMovesForGameTick<P, D, N>,
  createGameTreeNodeChildren: createGameTreeNodeChildren<P, D, N>,
  evaluateNode: evaluateGameTreeNode<P, D, N>,
  gameTick: MorrisGameTick<P, D, N>
): GameTree<P, D, N> {
  const root: GameTreeNode<P, D, N> = {
    game: gameTick,
    score: evaluateGameTick(gameTick),
    children: [],
  };

  const result = evaluateGameTreeRec(getMovesForGameTick, createGameTreeNodeChild, evaluateGameTick, root, gameTick);

  return {
    root,
    resultScore: result.score,
    resultMove: result.game.move,
  };
}
*/
