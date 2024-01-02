import * as P from '@konker.dev/effect-ts-prelude';

import { UNSET_FACT } from '../../lib/tiny-rules-fp';
import { MorrisColor, MorrisPhase } from '../consts';
import type { MorrisGame } from '../game';

export const MorrisFactKeysGame = [
  // is
  'isFirstMove',
  'isSecondMove',
  'isTurnWhite',
  'isTurnBlack',
  'isPlacingPhase',
  'isMovingPhase',
  'isLaskerPhase',
  'isFlyingPhase',
  'isRemoveMode',
  'isMillMadeWhite',
  'isMillMadeBlack',
  'isMillMade',

  'isDrawPositionRepeatLimit',
  'isDrawNoMillsLimit',
  'isDraw',
  'isNoValidMoveWhite',
  'isNoValidMoveBlack',
  'isWinWhiteMillsMade',
  'isWinWhiteOpponentCount',
  'isWinWhiteOpponentNoValidMove',
  'isWinWhite',
  'isWinBlackMillsMade',
  'isWinBlackOpponentCount',
  'isWinBlackOpponentNoValidMove',
  'isWinBlack',
  'isWin',
  'isGameOver',
] as const;

export const MorrisFactsGame = P.Schema.record(
  P.Schema.literal(...MorrisFactKeysGame),
  P.Schema.tuple(P.Schema.boolean, P.Schema.string)
);
export type MorrisFactsGame = P.Schema.Schema.To<typeof MorrisFactsGame>;

export const INITIAL_MORRIS_FACTS_GAME: MorrisFactsGame = {
  // is
  isFirstMove: [false, UNSET_FACT],
  isSecondMove: [false, UNSET_FACT],
  isTurnWhite: [false, UNSET_FACT],
  isTurnBlack: [false, UNSET_FACT],
  isPlacingPhase: [false, UNSET_FACT],
  isLaskerPhase: [false, UNSET_FACT],
  isMovingPhase: [false, UNSET_FACT],
  isFlyingPhase: [false, UNSET_FACT],
  isRemoveMode: [false, UNSET_FACT],
  isMillMadeWhite: [false, UNSET_FACT],
  isMillMadeBlack: [false, UNSET_FACT],
  isMillMade: [false, UNSET_FACT],
  isDrawPositionRepeatLimit: [false, UNSET_FACT],
  isDrawNoMillsLimit: [false, UNSET_FACT],
  isDraw: [false, UNSET_FACT],
  isNoValidMoveWhite: [false, UNSET_FACT],
  isNoValidMoveBlack: [false, UNSET_FACT],
  isWinWhiteMillsMade: [false, UNSET_FACT],
  isWinWhiteOpponentCount: [false, UNSET_FACT],
  isWinWhiteOpponentNoValidMove: [false, UNSET_FACT],
  isWinWhite: [false, UNSET_FACT],
  isWinBlackMillsMade: [false, UNSET_FACT],
  isWinBlackOpponentCount: [false, UNSET_FACT],
  isWinBlackOpponentNoValidMove: [false, UNSET_FACT],
  isWinBlack: [false, UNSET_FACT],
  isWin: [false, UNSET_FACT],
  isGameOver: [false, UNSET_FACT],
};

export const BOOTSTRAP_INITIAL_MORRIS_FACTS_GAME = <P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>
): MorrisFactsGame => ({
  // is
  isFirstMove: [true, 'default'],
  isSecondMove: [false, 'default'],
  isTurnWhite: [game.startColor === MorrisColor.WHITE, 'default'],
  isTurnBlack: [game.startColor === MorrisColor.BLACK, 'default'],
  isPlacingPhase: [game.config.phases[0] === MorrisPhase.PLACING, 'default'],
  isLaskerPhase: [game.config.phases[0] === MorrisPhase.LASKER, 'default'],
  isMovingPhase: [false, 'default'],
  isFlyingPhase: [false, 'default'],
  isRemoveMode: [false, 'default'],
  isMillMadeWhite: [false, 'default'],
  isMillMadeBlack: [false, 'default'],
  isMillMade: [false, 'default'],
  isDrawPositionRepeatLimit: [false, 'default'],
  isDrawNoMillsLimit: [false, 'default'],
  isDraw: [false, 'default'],
  isNoValidMoveWhite: [false, 'default'],
  isNoValidMoveBlack: [false, 'default'],
  isWinWhiteMillsMade: [false, 'default'],
  isWinWhiteOpponentCount: [false, 'default'],
  isWinWhiteOpponentNoValidMove: [false, 'default'],
  isWinWhite: [false, 'default'],
  isWinBlackMillsMade: [false, 'default'],
  isWinBlackOpponentCount: [false, 'default'],
  isWinBlackOpponentNoValidMove: [false, 'default'],
  isWinBlack: [false, 'default'],
  isWin: [false, 'default'],
  isGameOver: [false, 'default'],
});
