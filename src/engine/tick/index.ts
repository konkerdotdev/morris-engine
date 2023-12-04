// --------------------------------------------------------------------------
import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import * as R from '../../lib/tiny-rules-fp';
import { boardHash } from '../board/query';
import { MorrisColor, MorrisGameResult } from '../consts';
import type { MorrisGame } from '../game';
import { applyMoveToGame } from '../game';
import { strMorrisMove } from '../moves/helpers';
import type { MorrisMoveS } from '../moves/schemas';
import type { MorrisRulesContext } from '../rules';
import { RulesImpl } from '../rules';
import type { MorrisGameFacts } from '../rules/facts';
import { INITIAL_MORRIS_GAME_FACTS } from '../rules/facts';

// --------------------------------------------------------------------------
export type MorrisGameTick<P extends number, D extends number, N extends number> = {
  readonly game: MorrisGame<P, D, N>;
  readonly facts: MorrisGameFacts;
  readonly message: string;
};

// --------------------------------------------------------------------------
export function makeMorrisGameTick<P extends number, D extends number, N extends number>(
  game: MorrisGame<any, any, any>,
  facts: MorrisGameFacts,
  message: string
): P.Effect.Effect<never, MorrisEngineError, MorrisGameTick<P, D, N>> {
  return P.Effect.succeed({ game, facts, message });
}

export function startMorrisGame<P extends number, D extends number, N extends number>(
  morrisGame: MorrisGame<P, D, N>
): P.Effect.Effect<never, MorrisEngineError, MorrisGameTick<P, D, N>> {
  return makeMorrisGameTick(morrisGame, INITIAL_MORRIS_GAME_FACTS, 'BEGIN');
}

export function resolveResult(facts: MorrisGameFacts): MorrisGameResult {
  return R.val(facts.moveMakesWinWhite)
    ? MorrisGameResult.WIN_WHITE
    : R.val(facts.moveMakesWinBlack)
      ? MorrisGameResult.WIN_BLACK
      : R.val(facts.moveMakesDraw)
        ? MorrisGameResult.DRAW
        : MorrisGameResult.IN_PROGRESS;
}

// --------------------------------------------------------------------------
export const execMove =
  <P extends number, D extends number, N extends number>(move: MorrisMoveS<D>, facts: MorrisGameFacts) =>
  (game: MorrisGame<P, D, N>): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> => {
    if (!R.val(facts.isValidMove)) {
      return P.Effect.succeed(game);
    }

    const nextMoveColor = R.val(facts.moveMakesNextTurnWhite) ? MorrisColor.WHITE : MorrisColor.BLACK;

    return P.pipe(
      P.Effect.Do,
      P.Effect.bind('newGame', () => applyMoveToGame(game, move)),
      P.Effect.map(({ newGame }) => ({
        ...newGame,
        curMoveColor: nextMoveColor,
        gameOver: R.val(facts.moveMakesGameOver),
        result: resolveResult(facts),
        lastMillCounter: R.val(facts.moveMakesMill) ? 0 : game.lastMillCounter + 1,
        moves: [...game.moves, move],
        positions: [...game.positions, boardHash(newGame.board)],
        facts,
      }))
    );
  };

// --------------------------------------------------------------------------
export const tick =
  <P extends number, D extends number, N extends number>(move: MorrisMoveS<D>) =>
  (gameTick: MorrisGameTick<P, D, N>): P.Effect.Effect<RulesImpl, MorrisEngineError, MorrisGameTick<P, D, N>> => {
    // Formulate a rules context
    const rulesContext = {
      game: gameTick.game,
      move,
    };

    return P.pipe(
      P.Effect.Do,
      P.Effect.bind('newFacts', () =>
        // Execute the rules
        P.pipe(
          RulesImpl,
          P.Effect.flatMap((ruleImpl) =>
            P.pipe(
              ruleImpl.ruleSet<P, D, N>(),
              R.decide<MorrisRulesContext<P, D, N>, MorrisGameFacts, MorrisEngineError>(rulesContext)
            )
          ),
          P.Effect.map((ruleSet) => ruleSet.facts)
        )
      ),
      P.Effect.bind('newGame', ({ newFacts }) => P.pipe(gameTick.game, execMove(move, newFacts))),
      P.Effect.tap((_) => P.Console.log('\n-------\n')),
      // P.Effect.tap((_) => P.Console.log(rulesContext.game)),
      // P.Effect.tap((x) => P.Console.log(x.newFacts)),
      P.Effect.tap((x) => P.pipe(move, strMorrisMove(x.newGame), P.Effect.flatMap(P.Console.log))),
      P.Effect.flatMap(({ newFacts, newGame }) =>
        R.val(newFacts.isValidMove)
          ? // Valid move: execute the move
            // FIXME: derive message from rules
            makeMorrisGameTick(newGame, newFacts, String(newGame.result))
          : // Invalid move
            // FIXME: derive message from rules
            makeMorrisGameTick(gameTick.game, gameTick.facts, 'NOPE')
      )
    );
  };
