import type { Fact } from '../../lib/tiny-rules-fp';
import { UNSET_FACT } from '../../lib/tiny-rules-fp';

export const MorrisFactKeysMove = [
  // move is
  'moveIsCorrectColor',
  'moveIsCorrectType',
  'moveIsPossibleForPlace',
  'moveIsPossibleForMove',
  'moveIsPossibleForRemove',
  'moveIsPossibleForLasker',
  'moveIsPossibleForFlying',
  'moveIsPossible',
  'moveIsForbiddenOnFirstMove',
  'moveIsForbiddenOnSecondMove',
  'moveIsForbiddenInPlacingPhase',
  'moveIsValid',

  // move makes
  'moveMakesMillWhite',
  'moveMakesMillBlack',
  'moveMakesMill',
  'moveMakesRemoveMode',
  'moveMakesLaskerPhase',
  'moveMakesFlyingPhase',
  'moveMakesPlacingPhase',
  'moveMakesMovingPhase',
  'moveMakesNextTurnWhite',
  'moveMakesNextTurnBlack',
] as const;

export type MorrisFactKeysMove = typeof MorrisFactKeysMove;

export type MorrisFactsMove = Record<MorrisFactKeysMove[number], Fact>;

export const INITIAL_MORRIS_FACTS_MOVE: MorrisFactsMove = {
  // move is
  moveIsCorrectColor: [false, UNSET_FACT],
  moveIsCorrectType: [false, UNSET_FACT],
  moveIsPossibleForPlace: [false, UNSET_FACT],
  moveIsPossibleForMove: [false, UNSET_FACT],
  moveIsPossibleForRemove: [false, UNSET_FACT],
  moveIsPossibleForLasker: [false, UNSET_FACT],
  moveIsPossibleForFlying: [false, UNSET_FACT],
  moveIsPossible: [false, UNSET_FACT],
  moveIsForbiddenOnFirstMove: [false, UNSET_FACT],
  moveIsForbiddenOnSecondMove: [false, UNSET_FACT],
  moveIsForbiddenInPlacingPhase: [false, UNSET_FACT],
  moveIsValid: [false, UNSET_FACT],

  // move makes
  moveMakesMillWhite: [false, UNSET_FACT],
  moveMakesMillBlack: [false, UNSET_FACT],
  moveMakesMill: [false, UNSET_FACT],
  moveMakesRemoveMode: [false, UNSET_FACT],
  moveMakesLaskerPhase: [false, UNSET_FACT],
  moveMakesFlyingPhase: [false, UNSET_FACT],
  moveMakesPlacingPhase: [false, UNSET_FACT],
  moveMakesMovingPhase: [false, UNSET_FACT],
  moveMakesNextTurnWhite: [false, UNSET_FACT],
  moveMakesNextTurnBlack: [false, UNSET_FACT],
};
