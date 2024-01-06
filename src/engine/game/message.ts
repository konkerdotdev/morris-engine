import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import { MorrisColor } from '../consts';
import type { MorrisFactsGame } from '../rules/factsGame';
import type { MorrisFactsMove } from '../rules/factsMove';
import type { MorrisGame } from './index';

/**
 * Derive the message for the start of the game
 */
export function gameDeriveStartMessage<P extends number, D extends number, N extends number>(
  newGame: MorrisGame<P, D, N>
): string {
  return newGame.gameState.startColor === MorrisColor.WHITE ? 'Place White' : 'Place Black';
}

/**
 * Derive the message for the end of the game
 */
// eslint-disable-next-line fp/no-nil
export function gameDeriveResultMessage(newFacts: MorrisFactsGame): string {
  if (newFacts.isWinWhite) {
    if (newFacts.isWinWhiteMillsMade) return 'White wins! (number of mills made)';
    else if (newFacts.isWinWhiteOpponentCount) return 'White wins! (too few black pieces left)';
    else if (newFacts.isWinWhiteOpponentNoValidMove) return 'White wins! (no valid move left for black)';
    else return 'White wins!';
  } else if (newFacts.isWinBlack) {
    if (newFacts.isWinBlackMillsMade) return 'Black wins! (number of mills made)';
    else if (newFacts.isWinBlackOpponentCount) return 'Black wins! (too few white pieces left)';
    else if (newFacts.isWinBlackOpponentNoValidMove) return 'Black wins! (no valid move left for white)';
    else return 'Black wins!';
  } else {
    if (newFacts.isDrawNoMillsLimit) return 'Draw (too many moves without a mill)';
    if (newFacts.isDrawPositionRepeatLimit) return 'Draw (position repeated too many times)';
    else return 'Draw';
  }
}

/**
 * Derive an error message when given an invalid move
 */
export function gameDeriveInvalidMoveErrorMessage(moveFacts: MorrisFactsMove): string {
  if (!moveFacts.moveIsCorrectColor) return 'Invalid move: wrong color';
  if (!moveFacts.moveIsCorrectType) return 'Invalid move: wrong move type';
  if (!moveFacts.moveIsPossible) return 'Invalid move: move is not possible';
  return 'Invalid move';
}

/**
 * Derive a message foe the current game state
 */
export function gameDeriveMessage(gameFacts: MorrisFactsGame): P.Effect.Effect<never, MorrisEngineError, string> {
  const message = () => {
    if (gameFacts.isGameOver) return gameDeriveResultMessage(gameFacts);

    if (gameFacts.isLaskerPhase) {
      if (gameFacts.isTurnWhite) return 'Place or move White';
      if (gameFacts.isTurnBlack) return 'Place or move Black';
    }
    if (gameFacts.isRemoveMode) {
      if (gameFacts.isTurnWhite) return 'Remove Black';
      if (gameFacts.isTurnBlack) return 'Remove White';
    }
    if (gameFacts.isPlacingPhase) {
      if (gameFacts.isTurnWhite) return 'Place White';
      if (gameFacts.isTurnBlack) return 'Place Black';
    }
    if (gameFacts.isFlyingPhase) {
      if (gameFacts.isTurnWhite) return 'Fly White';
      if (gameFacts.isTurnBlack) return 'Fly Black';
    }
    if (gameFacts.isMovingPhase) {
      if (gameFacts.isTurnWhite) return 'Move White';
      if (gameFacts.isTurnBlack) return 'Move Black';
    }

    // eslint-disable-next-line fp/no-nil
    return undefined;
  };

  const ret = message();
  return ret ? P.Effect.succeed(ret) : P.Effect.fail(toMorrisEngineError('Logic error'));
}
