import * as P from '@konker.dev/effect-ts-prelude';

import type { MENS_MORRIS_D_3, MENS_MORRIS_N_3, MENS_MORRIS_P_3 } from '../boards';
import { isPointAdjacent, isPointEmpty, isTurn, moveMakesMill } from '../functions';
import type { MorrisGame, MorrisMove } from '../index';
import { MorrisColor, MorrisMoveType } from '../index';
import * as R from '../lib/tiny-rules-fp';

export type MG = MorrisGame<MENS_MORRIS_P_3, MENS_MORRIS_D_3, MENS_MORRIS_N_3>;

export type MorrisContext = {
  readonly game: MG;
  readonly move: MorrisMove<MENS_MORRIS_D_3>;
};

export type MGFs = {
  readonly isPlacingPhase: boolean;
  readonly isMovingPhase: boolean;
  readonly isWhiteMove: boolean;
  readonly isBlackMove: boolean;
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

export const Rules3MM = P.pipe(
  R.createRuleSet<MorrisContext, MGFs>({
    isPlacingPhase: false,
    isMovingPhase: false,
    isWhiteMove: false,
    isBlackMove: false,
    moveIsCorrectColor: false,
    moveIsCorrectTypeForPhase: false,
    isMovePossibleForPlace: false,
    isMovePossibleForMove: false,
    isValidMove: false,
    moveMakesMill: false,
    isWinningMoveWhite: false,
    isWinningMoveBlack: false,
    isWinningMove: false,
  }),
  // Placing phase if less than 6 MorrisMoveTypePlace moves have been made
  R.addRuleFunc(
    'isPlacingPhase',
    (c: MorrisContext, _f: MGFs) =>
      c.game.moves.filter((i) => i.type === MorrisMoveType.PLACE).length < c.game.config.numMorrisPerPlayer * 2
  ),
  R.addRuleFunc('isMovingPhase', (_c: MorrisContext, f: MGFs) => !f.isPlacingPhase),
  R.addRuleFunc('isWhiteMove', (c: MorrisContext, _f: MGFs) => isTurn(c.game, MorrisColor.WHITE)),
  R.addRuleFunc('isBlackMove', (_c: MorrisContext, f: MGFs) => !f.isWhiteMove),
  R.addRuleFunc('moveIsCorrectColor', (c: MorrisContext, _f: MGFs) => isTurn(c.game, c.move.color)),
  R.addRuleFunc(
    'moveIsCorrectTypeForPhase',
    (c: MorrisContext, f: MGFs) =>
      (f.isPlacingPhase && c.move.type === MorrisMoveType.PLACE) ||
      (f.isMovingPhase && c.move.type === MorrisMoveType.MOVE)
  ),
  R.addRuleFunc(
    'isMovePossibleForPlace',
    (c: MorrisContext, _f: MGFs) => c.move.type === MorrisMoveType.PLACE && isPointEmpty(c.game, c.move.to)
  ),
  R.addRuleFunc(
    'isMovePossibleForMove',
    (c: MorrisContext, _f: MGFs) =>
      c.move.type === MorrisMoveType.MOVE && isPointAdjacent(c.game, c.move.from, c.move.to)
  ),
  R.addRuleFunc(
    'isValidMove',
    (_c: MorrisContext, f: MGFs) =>
      f.moveIsCorrectColor && f.moveIsCorrectTypeForPhase && (f.isMovePossibleForPlace || f.isMovePossibleForMove)
  ),
  R.addRuleFunc('moveMakesMill', (c: MorrisContext, f: MGFs) => f.isValidMove && moveMakesMill(c.game, c.move)),
  R.addRuleFunc(
    'isWinningMoveWhite',
    (c: MorrisContext, f: MGFs) => f.moveMakesMill && c.move.color === MorrisColor.WHITE
  ),
  R.addRuleFunc(
    'isWinningMoveBlack',
    (c: MorrisContext, f: MGFs) => f.moveMakesMill && c.move.color === MorrisColor.BLACK
  ),
  R.addRuleFunc('isWinningMove', (_c: MorrisContext, f: MGFs) => f.isWinningMoveWhite || f.isWinningMoveBlack)
);
