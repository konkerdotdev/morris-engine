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
  'isPlacingPhase',
  'isMovingPhase',
  'isLaskerPhase',
  'isFlyingPhase',
  'isRemoveMode',
  'moveMakesGameOver',
  'isTurnWhite',
  'isTurnBlack',
  'isNextTurnWhite',
  'isNextTurnBlack',
  'moveIsCorrectColor',
  'moveIsCorrectType',
  'isMovePossibleForPlace',
  'isMovePossibleForMove',
  'isMovePossibleForLasker',
  'isMovePossibleForFlying',
  'isMovePossible',
  'isValidMove',
  'moveMakesMill',
  'moveMakesDrawCycleLimit',
  'moveMakesDrawNoValidMove',
  'moveMakesDrawNoMillsLimit',
  'moveMakesDraw',
  'isWinningMoveWhite',
  'isWinningMoveBlack',
  'isWinningMove',
] as const;
export type MorrisGameFactKeys = typeof MorrisGameFactKeys;

export type MorrisGameFacts = Record<MorrisGameFactKeys[number], Fact>;

export const INITIAL_MORRIS_GAME_FACTS: MorrisGameFacts = {
  isFirstMove: [false, UNSET_RULE],
  isPlacingPhase: [false, UNSET_RULE],
  isMovingPhase: [false, UNSET_RULE],
  isLaskerPhase: [false, UNSET_RULE],
  isFlyingPhase: [false, UNSET_RULE],
  isRemoveMode: [false, UNSET_RULE],
  moveMakesGameOver: [false, UNSET_RULE],
  isTurnWhite: [false, UNSET_RULE],
  isTurnBlack: [false, UNSET_RULE],
  isNextTurnWhite: [false, UNSET_RULE],
  isNextTurnBlack: [false, UNSET_RULE],
  moveIsCorrectColor: [false, UNSET_RULE],
  moveIsCorrectType: [false, UNSET_RULE],
  isMovePossibleForPlace: [false, UNSET_RULE],
  isMovePossibleForMove: [false, UNSET_RULE],
  isMovePossibleForLasker: [false, UNSET_RULE],
  isMovePossibleForFlying: [false, UNSET_RULE],
  isMovePossible: [false, UNSET_RULE],
  isValidMove: [false, UNSET_RULE],
  moveMakesDrawCycleLimit: [false, UNSET_RULE],
  moveMakesDrawNoValidMove: [false, UNSET_RULE],
  moveMakesDrawNoMillsLimit: [false, UNSET_RULE],
  moveMakesDraw: [false, UNSET_RULE],
  moveMakesMill: [false, UNSET_RULE],
  isWinningMoveWhite: [false, UNSET_RULE],
  isWinningMoveBlack: [false, UNSET_RULE],
  isWinningMove: [false, UNSET_RULE],
};

export type RulesImpl = {
  ruleSet: <P extends number, D extends number, N extends number>() => R.RuleSet<
    MorrisContext<P, D, N>,
    MorrisGameFacts
  >;
};

export const RulesImpl = P.Context.Tag<RulesImpl>('RulesImpl');
