import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import { getValidMovesForColor } from '../moves/query';
import type { MorrisMoveS } from '../moves/schemas';
import type { MorrisGameTick } from '../tick';
import { tickTurn } from '../tick';

export type AutoPlayer<P extends number, D extends number, N extends number> = (
  gameTick: MorrisGameTick<P, D, N>
) => P.Effect.Effect<never, MorrisEngineError, MorrisMoveS<D>>;

export function autoPlayerFirstValid<P extends number, D extends number, N extends number>(
  gameTick: MorrisGameTick<P, D, N>
): P.Effect.Effect<never, MorrisEngineError, MorrisMoveS<D>> {
  return P.pipe(
    getValidMovesForColor(gameTick.game, gameTick.facts, tickTurn(gameTick)),
    P.Effect.flatMap((validMoves) =>
      0 in validMoves ? P.Effect.succeed(validMoves[0]) : P.Effect.fail(toMorrisEngineError('No valid move'))
    )
  );
}

export function autoPlayerRandomValid<P extends number, D extends number, N extends number>(
  gameTick: MorrisGameTick<P, D, N>
): P.Effect.Effect<never, MorrisEngineError, MorrisMoveS<D>> {
  return P.pipe(
    getValidMovesForColor(gameTick.game, gameTick.facts, tickTurn(gameTick)),
    P.Effect.flatMap((validMoves) => {
      if (0 in validMoves) {
        const i = Math.floor(Math.random() * validMoves.length);
        return P.Effect.succeed(validMoves[i]!);
      }
      return P.Effect.fail(toMorrisEngineError('No valid move'));
    })
  );
}

// --------------------------------------------------------------------------
export type GameTreeNode<P extends number, D extends number, N extends number> = {
  readonly gameTick: MorrisGameTick<P, D, N>;
  readonly score: number;
  readonly children: ReadonlyArray<GameTreeNode<P, D, N>>;
};

export type GameTree<P extends number, D extends number, N extends number> = {
  readonly root: GameTreeNode<P, D, N>;
  readonly resultScore: number;
  readonly resultMove: MorrisMoveS<D>;
};

export type getMovesForGameTick<P extends number, D extends number, N extends number> = (
  gameTick: MorrisGameTick<P, D, N>
) => ReadonlyArray<MorrisMoveS<D>>;

export type createGameTreeNodeChildren<P extends number, D extends number, N extends number> = (
  gameTreeNode: GameTreeNode<P, D, N>
) => GameTreeNode<P, D, N>;

/*
export const morrisCreateGameTreeNodeChildren = <P extends number, D extends number, N extends number>(
  gameTreeNode: GameTreeNode<P, D, N>
): P.Effect.Effect<never, MorrisEngineError, GameTreeNode<P, D, N>> => {
  // const moves = getValidMovesForColor(
  //   gameTreeNode.gameTick.game,
  //   gameTreeNode.gameTick.facts,
  //   getTurnColor(gameTreeNode.gameTick.game)
  // );

  // return {
  //   ...gameTreeNode,
  //   children: moves.map((move) => createGameTreeNodeChild(gameTreeNode, move)),
  // };
  return null as any;
};

export type evaluateGameTreeNode<P extends number, D extends number, N extends number> = (
  node: GameTreeNode<P, D, N>
) => number;
*/

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
