import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import * as R from '../../lib/tiny-rules-fp';
import type { AutoPlayer } from '../autoplayer';
import { boardHash } from '../board/query';
import { MorrisColor } from '../consts';
import type { MorrisGame } from '../game';
import { applyMoveToGameBoard, deriveInvalidMoveErrorMessage, deriveMessage, deriveStartMessage } from '../game';
import type { MorrisMoveS } from '../moves/schemas';
import { RulesImpl } from '../rules';
import type { MorrisFactsGame } from '../rules/factsGame';
import { BOOTSTRAP_INITIAL_MORRIS_FACTS_GAME } from '../rules/factsGame';
import type { MorrisFactsMove } from '../rules/factsMove';

// --------------------------------------------------------------------------
export type MorrisGameTick<P extends number, D extends number, N extends number> = {
  readonly game: MorrisGame<P, D, N>;
  readonly facts: MorrisFactsGame;
  readonly tickN: number;
  readonly message: string;
};

// --------------------------------------------------------------------------
export function makeMorrisGameTick<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  facts: MorrisFactsGame,
  tickN: number,
  message: string
): P.Effect.Effect<never, MorrisEngineError, MorrisGameTick<P, D, N>> {
  return P.Effect.succeed({ game, facts, tickN, message });
}

export function startMorrisGame<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>
): P.Effect.Effect<never, MorrisEngineError, MorrisGameTick<P, D, N>> {
  return makeMorrisGameTick(game, BOOTSTRAP_INITIAL_MORRIS_FACTS_GAME(game), 0, deriveStartMessage(game));
}

// --------------------------------------------------------------------------
export function tickTurn<P extends number, D extends number, N extends number>(
  gameTick: MorrisGameTick<P, D, N>
): MorrisColor {
  return R.val(gameTick.facts.isTurnWhite) ? MorrisColor.WHITE : MorrisColor.BLACK;
}

// --------------------------------------------------------------------------
export const execMove =
  <P extends number, D extends number, N extends number>(move: MorrisMoveS<D>, moveFacts: MorrisFactsMove) =>
  (oldGame: MorrisGame<P, D, N>): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> => {
    return P.pipe(
      applyMoveToGameBoard(oldGame, move),
      P.Effect.map((newGame) => ({
        ...newGame,
        lastMillCounter: R.val(moveFacts.moveMakesMill) ? 0 : oldGame.lastMillCounter + 1,
        history: [...oldGame.history, { move, moveFacts }],
        positions: [...oldGame.positions, boardHash(newGame.board)],
      }))
    );
  };

// --------------------------------------------------------------------------
export const tick =
  <P extends number, D extends number, N extends number>(move: MorrisMoveS<D>) =>
  (gameTick: MorrisGameTick<P, D, N>): P.Effect.Effect<RulesImpl, MorrisEngineError, MorrisGameTick<P, D, N>> => {
    const oldGame = gameTick.game;

    return P.pipe(
      P.Effect.Do,
      // Run the move rules
      P.Effect.bind('moveFacts', () =>
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
      // Short-circuit if the move is invalid
      P.Effect.flatMap((binding) =>
        R.val(binding.moveFacts.moveIsValid)
          ? P.Effect.succeed(binding)
          : P.Effect.fail(toMorrisEngineError(deriveInvalidMoveErrorMessage(move, oldGame, binding.moveFacts)))
      ),
      // Execute the valid move
      P.Effect.bind('newGame', ({ moveFacts }) => P.pipe(oldGame, execMove(move, moveFacts))),
      // Run the game rules to derive the new facts for the new game
      P.Effect.bind('newGameFacts', ({ moveFacts, newGame }) =>
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
      // Get a message prompt for the new game state
      P.Effect.bind('message', ({ newGame, newGameFacts }) => deriveMessage(move, newGame, newGameFacts)),
      // Create a new game tick with the new game state and the new game facts
      P.Effect.flatMap(({ message, newGame, newGameFacts }) =>
        makeMorrisGameTick(newGame, newGameFacts, gameTick.tickN + 1, message)
      )
    );
  };

// --------------------------------------------------------------------------
export const tickAutoPlayer =
  <P extends number, D extends number, N extends number>(autoPlayer: AutoPlayer<P, D, N>) =>
  (gameTick: MorrisGameTick<P, D, N>): P.Effect.Effect<RulesImpl, MorrisEngineError, MorrisGameTick<P, D, N>> =>
    P.pipe(
      autoPlayer(gameTick),
      P.Effect.tap((x) => P.Console.log(x)),
      P.Effect.flatMap((move) => P.pipe(gameTick, tick(move)))
    );
