import type { Fact } from '../../lib/tiny-rules-fp';

export const UNSET_FACT = 'unset';

export const MorrisGameFactKeys = [
  // is
  'isFirstMove',
  'isTurnWhite',
  'isTurnBlack',
  'isPlacingPhase',
  'isMovingPhase',
  'isLaskerPhase',
  'isFlyingPhase',
  'isRemoveMode',

  // move is
  'moveIsCorrectColor',
  'moveIsCorrectType',
  'moveIsPossibleForPlace',
  'moveIsPossibleForMove',
  'moveIsPossibleForLasker',
  'moveIsPossibleForFlying',
  'moveIsPossible',
  'moveIsValid',

  // move makes
  'moveMakesMill',
  'moveMakesRemoveMode',
  'moveMakesLaskerPhase',
  'moveMakesFlyingPhase',
  'moveMakesPlacingPhase',
  'moveMakesMovingPhase',
  'moveMakesNextTurnWhite',
  'moveMakesNextTurnBlack',
  'moveMakesDrawPositionRepeatLimit',
  'moveMakesDrawNoMillsLimit',
  'moveMakesDraw',
  'moveMakesNoValidMoveWhite',
  'moveMakesNoValidMoveBlack',
  'moveMakesWinWhite',
  'moveMakesWinBlack',
  'moveMakesWin',
  'moveMakesGameOver',
] as const;
export type MorrisGameFactKeys = typeof MorrisGameFactKeys;

export type MorrisGameFacts = Record<MorrisGameFactKeys[number], Fact>;

export const INITIAL_MORRIS_GAME_FACTS: MorrisGameFacts = {
  // is
  isFirstMove: [false, UNSET_FACT],
  isTurnWhite: [false, UNSET_FACT],
  isTurnBlack: [false, UNSET_FACT],
  isPlacingPhase: [false, UNSET_FACT],
  isMovingPhase: [false, UNSET_FACT],
  isLaskerPhase: [false, UNSET_FACT],
  isFlyingPhase: [false, UNSET_FACT],
  isRemoveMode: [false, UNSET_FACT],

  // move is
  moveIsCorrectColor: [false, UNSET_FACT],
  moveIsCorrectType: [false, UNSET_FACT],
  moveIsPossibleForPlace: [false, UNSET_FACT],
  moveIsPossibleForMove: [false, UNSET_FACT],
  moveIsPossibleForLasker: [false, UNSET_FACT],
  moveIsPossibleForFlying: [false, UNSET_FACT],
  moveIsPossible: [false, UNSET_FACT],
  moveIsValid: [false, UNSET_FACT],

  // move makes
  moveMakesMill: [false, UNSET_FACT],
  moveMakesRemoveMode: [false, UNSET_FACT],
  moveMakesLaskerPhase: [false, UNSET_FACT],
  moveMakesFlyingPhase: [false, UNSET_FACT],
  moveMakesPlacingPhase: [false, UNSET_FACT],
  moveMakesMovingPhase: [false, UNSET_FACT],
  moveMakesNextTurnWhite: [false, UNSET_FACT],
  moveMakesNextTurnBlack: [false, UNSET_FACT],
  moveMakesDrawPositionRepeatLimit: [false, UNSET_FACT],
  moveMakesDrawNoMillsLimit: [false, UNSET_FACT],
  moveMakesDraw: [false, UNSET_FACT],
  moveMakesNoValidMoveWhite: [false, UNSET_FACT],
  moveMakesNoValidMoveBlack: [false, UNSET_FACT],
  moveMakesWinWhite: [false, UNSET_FACT],
  moveMakesWinBlack: [false, UNSET_FACT],
  moveMakesWin: [false, UNSET_FACT],
  moveMakesGameOver: [false, UNSET_FACT],
};
