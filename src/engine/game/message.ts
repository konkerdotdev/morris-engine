import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import * as R from '../../lib/tiny-rules-fp';
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
  return newGame.startColor === MorrisColor.WHITE ? 'Place White' : 'Place Black';
}

/**
 * Derive the message for the end of the game
 */
// eslint-disable-next-line fp/no-nil
export function gameDeriveResultMessage(newFacts: MorrisFactsGame): string {
  if (R.val(newFacts.isWinWhite)) {
    if (R.val(newFacts.isWinWhiteMillsMade)) return 'White wins! (number of mills made)';
    else if (R.val(newFacts.isWinWhiteOpponentCount)) return 'White wins! (too few black pieces left)';
    else if (R.val(newFacts.isWinWhiteOpponentNoValidMove)) return 'White wins! (no valid move left for black)';
    else return 'White wins!';
  } else if (R.val(newFacts.isWinBlack)) {
    if (R.val(newFacts.isWinBlackMillsMade)) return 'Black wins! (number of mills made)';
    else if (R.val(newFacts.isWinBlackOpponentCount)) return 'Black wins! (too few white pieces left)';
    else if (R.val(newFacts.isWinBlackOpponentNoValidMove)) return 'Black wins! (no valid move left for white)';
    else return 'Black wins!';
  } else {
    if (R.val(newFacts.isDrawNoMillsLimit)) return 'Draw (too many moves without a mill)';
    if (R.val(newFacts.isDrawPositionRepeatLimit)) return 'Draw (position repeated too many times)';
    else return 'Draw';
  }
}

/**
 * Derive an error message when given an invalid move
 */
export function gameDeriveInvalidMoveErrorMessage(moveFacts: MorrisFactsMove): string {
  if (!R.val(moveFacts.moveIsCorrectColor)) return 'Invalid move: wrong color';
  if (!R.val(moveFacts.moveIsCorrectType)) return 'Invalid move: wrong move type';
  if (!R.val(moveFacts.moveIsPossible)) return 'Invalid move: move is not possible';
  return 'Invalid move';
}

/**
 * Derive a message foe the current game state
 */
export function gameDeriveMessage(gameFacts: MorrisFactsGame): P.Effect.Effect<never, MorrisEngineError, string> {
  const message = () => {
    if (R.val(gameFacts.isGameOver)) return gameDeriveResultMessage(gameFacts);

    if (R.val(gameFacts.isLaskerPhase)) {
      if (R.val(gameFacts.isTurnWhite)) return 'Place or move White';
      if (R.val(gameFacts.isTurnBlack)) return 'Place or move Black';
    }
    if (R.val(gameFacts.isRemoveMode)) {
      if (R.val(gameFacts.isTurnWhite)) return 'Remove Black';
      if (R.val(gameFacts.isTurnBlack)) return 'Remove White';
    }
    if (R.val(gameFacts.isPlacingPhase)) {
      if (R.val(gameFacts.isTurnWhite)) return 'Place White';
      if (R.val(gameFacts.isTurnBlack)) return 'Place Black';
    }
    if (R.val(gameFacts.isFlyingPhase)) {
      if (R.val(gameFacts.isTurnWhite)) return 'Fly White';
      if (R.val(gameFacts.isTurnBlack)) return 'Fly Black';
    }
    if (R.val(gameFacts.isMovingPhase)) {
      if (R.val(gameFacts.isTurnWhite)) return 'Move White';
      if (R.val(gameFacts.isTurnBlack)) return 'Move Black';
    }

    // eslint-disable-next-line fp/no-nil
    return undefined;
  };

  const ret = message();
  return ret ? P.Effect.succeed(ret) : P.Effect.fail(toMorrisEngineError('Logic error'));
}
