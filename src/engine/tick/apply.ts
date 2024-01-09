import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { boardHash } from '../board';
import type { MorrisGame } from '../game';
import { gameApplyMoveToGameBoard, gameUnApplyMoveToGameBoard } from '../game';
import { gameHistoryPop, gameHistoryPush } from '../game/history';
import type { MorrisMove } from '../moves/schemas';
import type { MorrisFactsMove } from '../rules/factsMove';

export const tickApplyMove =
  (move: MorrisMove, moveFacts: MorrisFactsMove) =>
  (oldGame: MorrisGame): P.Effect.Effect<never, MorrisEngineError, MorrisGame> => {
    return P.pipe(
      gameApplyMoveToGameBoard(oldGame, move),
      P.Effect.map((newGame) => ({
        ...newGame,
        gameState: {
          ...newGame.gameState,
          lastMillCounter: moveFacts.moveMakesMill ? 0 : oldGame.gameState.lastMillCounter + 1,
          history: gameHistoryPush(oldGame.gameState.history, move, moveFacts),
          positions: [boardHash(newGame.gameState.board), ...oldGame.gameState.positions],
        },
      }))
    );
  };

export const tickUndoApplyMove =
  (oldMove: MorrisMove, oldMoveFacts: MorrisFactsMove) =>
  (newGame: MorrisGame): P.Effect.Effect<never, MorrisEngineError, MorrisGame> => {
    return P.pipe(
      gameUnApplyMoveToGameBoard(newGame, oldMove, oldMoveFacts),
      P.Effect.map((oldGame) => ({
        ...oldGame,
        gameState: {
          ...oldGame.gameState,
          lastMillCounter: oldMoveFacts.moveMakesMill ? 0 : oldGame.gameState.lastMillCounter + 1,
          history: gameHistoryPop(oldGame.gameState.history),
          positions: oldGame.gameState.positions.slice(1),
        },
      }))
    );
  };
