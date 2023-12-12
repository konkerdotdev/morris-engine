import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import * as R from '../../lib/tiny-rules-fp';
import type { AutoPlayer } from '../autoplayer';
import { boardHash } from '../board/query';
import { MorrisColor } from '../consts';
import type { MorrisGame } from '../game';
import {
  applyMoveToGameBoard,
  deriveInvalidMoveErrorMessage,
  deriveMessage,
  deriveStartMessage,
  resolveResult,
} from '../game';
import type { MorrisMoveS } from '../moves/schemas';
import { RulesImpl } from '../rules';
import type { MorrisFactsGame } from '../rules/factsGame';
import { BOOTSTRAP_INITIAL_MORRIS_FACTS_GAME } from '../rules/factsGame';
import type { MorrisFactsMove } from '../rules/factsMove';

// --------------------------------------------------------------------------
export type MorrisGameTick<P extends number, D extends number, N extends number> = {
  readonly game: MorrisGame<P, D, N>;
  readonly facts: MorrisFactsGame;
  readonly factsN: number;
  readonly message: string;
};

// --------------------------------------------------------------------------
export function makeMorrisGameTick<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  facts: MorrisFactsGame,
  factsN: number,
  message: string
): P.Effect.Effect<never, MorrisEngineError, MorrisGameTick<P, D, N>> {
  return P.Effect.succeed({ game, facts, factsN, message });
}

export function startMorrisGame<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>
): P.Effect.Effect<never, MorrisEngineError, MorrisGameTick<P, D, N>> {
  return makeMorrisGameTick(game, BOOTSTRAP_INITIAL_MORRIS_FACTS_GAME(game), 0, deriveStartMessage(game));
}

// --------------------------------------------------------------------------
export const execMove =
  <P extends number, D extends number, N extends number>(
    gameFacts: MorrisFactsGame,
    moveFacts: MorrisFactsMove,
    move: MorrisMoveS<D>
  ) =>
  (oldGame: MorrisGame<P, D, N>): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> => {
    if (!R.val(moveFacts.moveIsValid)) {
      return P.Effect.succeed(oldGame);
    }

    return P.pipe(
      applyMoveToGameBoard(oldGame, move),
      P.Effect.map((newGame) => ({
        ...newGame,
        curMoveColor: R.val(gameFacts.isTurnWhite) ? MorrisColor.WHITE : MorrisColor.BLACK,
        gameOver: R.val(gameFacts.isGameOver),
        result: resolveResult(gameFacts),
        lastMillCounter: R.val(moveFacts.moveMakesMill) ? 0 : oldGame.lastMillCounter + 1,
        moves: [...oldGame.moves, move],
        positions: [...oldGame.positions, boardHash(newGame.board)],
        facts: gameFacts,
      }))
    );
  };

// --------------------------------------------------------------------------
export const tick =
  <P extends number, D extends number, N extends number>(move: MorrisMoveS<D>) =>
  (gameTick: MorrisGameTick<P, D, N>): P.Effect.Effect<RulesImpl, MorrisEngineError, MorrisGameTick<P, D, N>> => {
    const oldGame = gameTick.game;
    const oldGameFacts = gameTick.facts;

    return P.pipe(
      P.Effect.Do,
      P.Effect.bind('moveFacts', () =>
        // Execute the rules for the move
        P.pipe(
          RulesImpl,
          P.Effect.flatMap((ruleImpl) =>
            P.pipe(
              ruleImpl.rulesetMove<P, D, N>(),
              R.decide({
                gameTick,
                move,
              })
            )
          )
        )
      ),
      P.Effect.flatMap((binding) =>
        R.val(binding.moveFacts.moveIsValid)
          ? P.Effect.succeed(binding)
          : P.Effect.fail(toMorrisEngineError(deriveInvalidMoveErrorMessage(move, oldGame, binding.moveFacts)))
      ),
      P.Effect.bind('newGame', ({ moveFacts }) => P.pipe(oldGame, execMove(oldGameFacts, moveFacts, move))),
      P.Effect.bind('newGameFacts', ({ moveFacts, newGame }) =>
        // Execute the rules to apply the move facts
        P.pipe(
          RulesImpl,
          P.Effect.flatMap((ruleImpl) =>
            P.pipe(
              ruleImpl.rulesetGame<P, D, N>(),
              R.decide({
                game: newGame,
                moveFacts,
              })
            )
          )
        )
      ),
      P.Effect.bind('message', ({ newGame, newGameFacts }) => deriveMessage(move, newGame, newGameFacts)),
      P.Effect.flatMap(({ message, newGame, newGameFacts }) =>
        makeMorrisGameTick(newGame, newGameFacts, gameTick.factsN + 1, message)
      )
    );
  };

export const tickAutoPlayer =
  <P extends number, D extends number, N extends number>(autoPlayer: AutoPlayer<P, D, N>) =>
  (gameTick: MorrisGameTick<P, D, N>): P.Effect.Effect<RulesImpl, MorrisEngineError, MorrisGameTick<P, D, N>> =>
    P.pipe(
      autoPlayer(gameTick),
      P.Effect.flatMap((move) => P.pipe(gameTick, tick(move)))
    );
