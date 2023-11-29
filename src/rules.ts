import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisGame, MorrisMove } from './index';
import type * as R from './lib/tiny-rules-fp';
import type { Fact } from './lib/tiny-rules-fp';

export type MorrisContext<P extends number, D extends number, N extends number> = {
  readonly game: MorrisGame<P, D, N>;
  readonly move: MorrisMove<D, N>;
};

export type MorrisGameFactKeys = [
  'isGameOverPhase',
  'isPlacingPhase',
  'isMovingPhase',
  'isWhiteTurn',
  'isBlackTurn',
  'moveIsCorrectColor',
  'moveIsCorrectTypeForPhase',
  'isMovePossibleForPlace',
  'isMovePossibleForMove',
  'isValidMove',
  'moveMakesMill',
  'moveMakesDraw',
  'isWinningMoveWhite',
  'isWinningMoveBlack',
  'isWinningMove',
];
export type MorrisGameFacts = Record<MorrisGameFactKeys[number], Fact>;

export const INITIAL_MORRIS_GAME_FACTS: MorrisGameFacts = {
  isGameOverPhase: [false, 'unset'],
  isPlacingPhase: [false, 'unset'],
  isMovingPhase: [false, 'unset'],
  isWhiteTurn: [false, 'unset'],
  isBlackTurn: [false, 'unset'],
  moveIsCorrectColor: [false, 'unset'],
  moveIsCorrectTypeForPhase: [false, 'unset'],
  isMovePossibleForPlace: [false, 'unset'],
  isMovePossibleForMove: [false, 'unset'],
  isValidMove: [false, 'unset'],
  moveMakesDraw: [false, 'unset'],
  moveMakesMill: [false, 'unset'],
  isWinningMoveWhite: [false, 'unset'],
  isWinningMoveBlack: [false, 'unset'],
  isWinningMove: [false, 'unset'],
};

export type RulesImpl = {
  ruleSet: <P extends number, D extends number, N extends number>() => R.RuleSet<
    MorrisContext<P, D, N>,
    MorrisGameFacts
  >;
};

export const RulesImpl = P.Context.Tag<RulesImpl>('RulesImpl');
