import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisGame, MorrisMove } from './index';
import type * as R from './lib/tiny-rules-fp';
import type { Fact } from './lib/tiny-rules-fp';

export const UNSET_RULE = 'unset';

export type MorrisContext<P extends number, D extends number, N extends number> = {
  readonly game: MorrisGame<P, D, N>;
  readonly move: MorrisMove<D, N>;
};

export const MorrisGameFactKeys = [
  'isFirstMove',
  'isTurnWhite',
  'isTurnBlack',
  'isPlacingPhase',
  'isMovingPhase',
  'isLaskerPhase',
  'isFlyingPhase',
  'moveMakesMill',
  'isRemoveMode',
  'isMoveCorrectColor',
  'isMoveCorrectType',
  'isMovePossibleForPlace',
  'isMovePossibleForMove',
  'isMovePossibleForLasker',
  'isMovePossibleForFlying',
  'isMovePossible',
  'isValidMove',
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
  isFirstMove: [false, UNSET_RULE],
  isTurnWhite: [false, UNSET_RULE],
  isTurnBlack: [false, UNSET_RULE],
  isPlacingPhase: [false, UNSET_RULE],
  isMovingPhase: [false, UNSET_RULE],
  isLaskerPhase: [false, UNSET_RULE],
  isFlyingPhase: [false, UNSET_RULE],
  moveMakesMill: [false, UNSET_RULE],
  isRemoveMode: [false, UNSET_RULE],
  isMoveCorrectColor: [false, UNSET_RULE],
  isMoveCorrectType: [false, UNSET_RULE],
  isMovePossibleForPlace: [false, UNSET_RULE],
  isMovePossibleForMove: [false, UNSET_RULE],
  isMovePossibleForLasker: [false, UNSET_RULE],
  isMovePossibleForFlying: [false, UNSET_RULE],
  isMovePossible: [false, UNSET_RULE],
  isValidMove: [false, UNSET_RULE],
  moveMakesNextTurnWhite: [false, UNSET_RULE],
  moveMakesNextTurnBlack: [false, UNSET_RULE],
  moveMakesDrawPositionRepeatLimit: [false, UNSET_RULE],
  moveMakesDrawNoMillsLimit: [false, UNSET_RULE],
  moveMakesDraw: [false, UNSET_RULE],
  moveMakesNoValidMoveWhite: [false, UNSET_RULE],
  moveMakesNoValidMoveBlack: [false, UNSET_RULE],
  moveMakesWinWhite: [false, UNSET_RULE],
  moveMakesWinBlack: [false, UNSET_RULE],
  moveMakesWin: [false, UNSET_RULE],
  moveMakesGameOver: [false, UNSET_RULE],
};

export type RulesImpl = {
  ruleSet: <P extends number, D extends number, N extends number>() => R.RuleSet<
    MorrisContext<P, D, N>,
    MorrisGameFacts
  >;
};

export const RulesImpl = P.Context.Tag<RulesImpl>('RulesImpl');
