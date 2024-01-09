import * as P from '@konker.dev/effect-ts-prelude';
import * as R from '@konker.dev/tiny-rules-fp';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import type { AutoPlayer } from '../autoplayer';
import { MorrisColor } from '../consts';
import type { MorrisGame } from '../game';
import { gameDeriveResult, gameReset, gameSetResult } from '../game';
import { gameHistoryLen, gameHistoryPeek } from '../game/history';
import { gameDeriveInvalidMoveErrorMessage, gameDeriveMessage, gameDeriveStartMessage } from '../game/message';
import type { MorrisMove } from '../moves/schemas';
import type { MorrisFactsGame } from '../rules/factsGame';
import { BOOTSTRAP_INITIAL_MORRIS_FACTS_GAME } from '../rules/factsGame';
import { RulesGame } from '../rules/rulesGame';
import { RulesMove } from '../rules/rulesMove';
import { tickApplyMove, tickUndoApplyMove } from './apply';

export type MorrisGameTick<P extends number, D extends number, N extends number> = {
  readonly game: MorrisGame<P, D, N>;
  readonly facts: MorrisFactsGame;
  readonly tickN: number;
  readonly message: string;
};

// --------------------------------------------------------------------------
export function tickCreate<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  facts: MorrisFactsGame,
  tickN: number,
  message: string
): P.Effect.Effect<never, MorrisEngineError, MorrisGameTick<P, D, N>> {
  return P.Effect.succeed({ game, facts, tickN, message });
}

export function tickGetTurnColor<P extends number, D extends number, N extends number>(
  gameTick: MorrisGameTick<P, D, N>
): MorrisColor {
  return gameTick.facts.isTurnWhite ? MorrisColor.WHITE : MorrisColor.BLACK;
}

// --------------------------------------------------------------------------
export const tick =
  <P extends number, D extends number, N extends number>(move: MorrisMove<D>) =>
  (gameTick: MorrisGameTick<P, D, N>): P.Effect.Effect<never, MorrisEngineError, MorrisGameTick<P, D, N>> => {
    const oldGame = gameTick.game;

    return P.pipe(
      P.Effect.Do,
      // Run the move rules
      P.Effect.bind('moveFacts', () =>
        P.pipe(
          RulesMove<P, D, N>(),
          R.decide({
            gameTick,
            move,
          })
        )
      ),
      // Short-circuit if the move is invalid
      P.Effect.flatMap((binding) =>
        binding.moveFacts.moveIsValid
          ? P.Effect.succeed(binding)
          : P.Effect.fail(toMorrisEngineError(gameDeriveInvalidMoveErrorMessage(binding.moveFacts)))
      ),
      // Execute the valid move
      P.Effect.bind('newGame', ({ moveFacts }) => P.pipe(oldGame, tickApplyMove(move, moveFacts))),
      // Run the game rules to derive the new facts for the new game
      P.Effect.bind('newGameFacts', ({ moveFacts, newGame }) =>
        P.pipe(
          RulesGame<P, D, N>(),
          R.decide({
            game: newGame,
            moveFacts,
          })
        )
      ),
      // Get a message prompt for the new game state
      P.Effect.bind('message', ({ newGameFacts }) => gameDeriveMessage(newGameFacts)),
      // Create a new game tick with the new game state and the new game facts
      P.Effect.flatMap(({ message, newGame, newGameFacts }) =>
        tickCreate(gameSetResult(newGame, gameDeriveResult(newGameFacts)), newGameFacts, gameTick.tickN + 1, message)
      )
    );
  };

// --------------------------------------------------------------------------
export const tickUndo = <P extends number, D extends number, N extends number>(
  gameTick: MorrisGameTick<P, D, N>
): P.Effect.Effect<never, MorrisEngineError, MorrisGameTick<P, D, N>> => {
  if (gameHistoryLen(gameTick.game.gameState.history) < 2) {
    const game = gameReset(gameTick.game);
    return tickCreate(game, BOOTSTRAP_INITIAL_MORRIS_FACTS_GAME(game), 0, gameDeriveStartMessage(game));
  }

  const { lastMove, lastMoveFacts } = gameHistoryPeek(gameTick.game.gameState.history);
  if (!lastMove || !lastMoveFacts) {
    // TODO: Warning? Error?
    return P.Effect.succeed(gameTick);
  }

  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('oldGame', () => P.pipe(gameTick.game, tickUndoApplyMove(lastMove, lastMoveFacts))),
    P.Effect.bind('oldGameFacts', ({ oldGame }) =>
      P.pipe(
        RulesGame<P, D, N>(),
        R.decide({
          game: oldGame,
          moveFacts: lastMoveFacts,
        })
      )
    ),
    P.Effect.bind('oldMessage', ({ oldGameFacts }) => gameDeriveMessage(oldGameFacts)),
    P.Effect.flatMap(({ oldGame, oldGameFacts, oldMessage }) =>
      tickCreate(gameSetResult(oldGame, gameDeriveResult(oldGameFacts)), oldGameFacts, gameTick.tickN - 1, oldMessage)
    )
  );
};

// --------------------------------------------------------------------------
export const tickAutoPlayer =
  <P extends number, D extends number, N extends number>(autoPlayer: AutoPlayer<P, D, N>) =>
  (gameTick: MorrisGameTick<P, D, N>): P.Effect.Effect<never, MorrisEngineError, MorrisGameTick<P, D, N>> =>
    P.pipe(
      autoPlayer(gameTick),
      P.Effect.tap((x) => P.Console.log(x)),
      P.Effect.flatMap((move) => P.pipe(gameTick, tick(move)))
    );
