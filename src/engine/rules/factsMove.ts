import * as P from '@konker.dev/effect-ts-prelude';

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

export const MorrisFactsMove = P.Schema.parseJson(
  P.Schema.Record({ key: P.Schema.Literal(...MorrisFactKeysMove), value: P.Schema.Boolean })
);
export type MorrisFactsMove = P.Schema.Schema.Type<typeof MorrisFactsMove>;

export const INITIAL_MORRIS_FACTS_MOVE: MorrisFactsMove = {
  // move is
  moveIsCorrectColor: false,
  moveIsCorrectType: false,
  moveIsPossibleForPlace: false,
  moveIsPossibleForMove: false,
  moveIsPossibleForRemove: false,
  moveIsPossibleForLasker: false,
  moveIsPossibleForFlying: false,
  moveIsPossible: false,
  moveIsForbiddenOnFirstMove: false,
  moveIsForbiddenOnSecondMove: false,
  moveIsForbiddenInPlacingPhase: false,
  moveIsValid: false,

  // move makes
  moveMakesMillWhite: false,
  moveMakesMillBlack: false,
  moveMakesMill: false,
  moveMakesRemoveMode: false,
  moveMakesLaskerPhase: false,
  moveMakesFlyingPhase: false,
  moveMakesPlacingPhase: false,
  moveMakesMovingPhase: false,
  moveMakesNextTurnWhite: false,
  moveMakesNextTurnBlack: false,
};
