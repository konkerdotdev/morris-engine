import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisGame, MorrisMove } from './index';
import type * as R from './lib/tiny-rules-fp';

export type MorrisContext<P extends number, D extends number, N extends number> = {
  readonly game: MorrisGame<P, D, N>;
  readonly move: MorrisMove<D, N>;
};

export type MorrisGameFacts = {
  readonly isGameOverPhase: boolean;
  readonly isPlacingPhase: boolean;
  readonly isMovingPhase: boolean;
  readonly isWhiteTurn: boolean;
  readonly isBlackTurn: boolean;
  readonly moveIsCorrectColor: boolean;
  readonly moveIsCorrectTypeForPhase: boolean;
  readonly isMovePossibleForPlace: boolean;
  readonly isMovePossibleForMove: boolean;
  readonly isValidMove: boolean;
  readonly moveMakesMill: boolean;
  readonly isWinningMoveWhite: boolean;
  readonly isWinningMoveBlack: boolean;
  readonly isWinningMove: boolean;
};

export type RulesImpl = {
  ruleSet: <P extends number, D extends number, N extends number>() => R.RuleSet<
    MorrisContext<P, D, N>,
    MorrisGameFacts
  >;
};

export const RulesImpl = P.Context.Tag<RulesImpl>('RulesImpl');
