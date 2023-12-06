import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import * as R from '../../lib/tiny-rules-fp';
import { boardHash } from '../board/query';
import { MorrisColor } from '../consts';
import type { MorrisGame } from '../game';
import { applyMoveToGameBoard, deriveMessage, deriveStartMessage, resolveResult } from '../game';
import type { MorrisMoveS } from '../moves/schemas';
import { RulesImpl } from '../rules';
import type { MorrisGameFacts } from '../rules/facts';
import { INITIAL_MORRIS_GAME_FACTS } from '../rules/facts';

// --------------------------------------------------------------------------
export type MorrisGameTick<P extends number, D extends number, N extends number> = {
  readonly game: MorrisGame<P, D, N>;
  readonly move: P.Option.Option<MorrisMoveS<D>>;
  readonly facts: MorrisGameFacts;
  readonly message: string;
};

// --------------------------------------------------------------------------
export function makeMorrisGameTick<P extends number, D extends number, N extends number>(
  game: MorrisGame<any, any, any>,
  facts: MorrisGameFacts,
  message: string,
  move?: MorrisMoveS<D>
): P.Effect.Effect<never, MorrisEngineError, MorrisGameTick<P, D, N>> {
  return P.Effect.succeed({ game, facts, move: P.Option.fromNullable(move), message });
}

export function startMorrisGame<P extends number, D extends number, N extends number>(
  morrisGame: MorrisGame<P, D, N>
): P.Effect.Effect<never, MorrisEngineError, MorrisGameTick<P, D, N>> {
  return makeMorrisGameTick(morrisGame, INITIAL_MORRIS_GAME_FACTS, deriveStartMessage(morrisGame));
}

// --------------------------------------------------------------------------
export const execMove =
  <P extends number, D extends number, N extends number>(
    move: MorrisMoveS<D>,
    moveFacts: MorrisGameFacts,
    newFacts: MorrisGameFacts
  ) =>
  (oldGame: MorrisGame<P, D, N>): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> => {
    if (!R.val(moveFacts.moveIsValid)) {
      return P.Effect.succeed(oldGame);
    }

    return P.pipe(
      applyMoveToGameBoard(oldGame, move),
      P.Effect.map((newGame) => ({
        ...newGame,
        curMoveColor: R.val(newFacts.isTurnWhite) ? MorrisColor.WHITE : MorrisColor.BLACK,
        gameOver: R.val(newFacts.isGameOver),
        result: resolveResult(newFacts),
        lastMillCounter: R.val(moveFacts.moveMakesMill) ? 0 : oldGame.lastMillCounter + 1,
        moves: [...oldGame.moves, move],
        positions: [...oldGame.positions, boardHash(newGame.board)],
        facts: newFacts,
      }))
    );
  };

// --------------------------------------------------------------------------
export const tick =
  <P extends number, D extends number, N extends number>(move: MorrisMoveS<D>) =>
  (gameTick: MorrisGameTick<P, D, N>): P.Effect.Effect<RulesImpl, MorrisEngineError, MorrisGameTick<P, D, N>> => {
    // Formulate a rules context
    const oldGame = gameTick.game;

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
                game: oldGame,
                move,
              })
            )
          )
        )
      ),
      P.Effect.bind('newFacts', ({ moveFacts }) =>
        // Execute the rules to apply the move facts
        P.pipe(
          RulesImpl,
          P.Effect.flatMap((ruleImpl) => P.pipe(ruleImpl.rulesetApply(), R.overrideDecide({}, moveFacts)))
        )
      ),
      P.Effect.bind('newGame', ({ moveFacts, newFacts }) => P.pipe(oldGame, execMove(move, moveFacts, newFacts))),
      P.Effect.bind('message', ({ newFacts, newGame }) => deriveMessage(newGame, newFacts, move)),
      P.Effect.flatMap(({ message, newFacts, newGame }) => makeMorrisGameTick(newGame, newFacts, message, move))
    );
  };
