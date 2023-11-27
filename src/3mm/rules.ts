import * as P from '@konker.dev/effect-ts-prelude';

import {
  isTurn,
  unsafe_isPointAdjacent,
  unsafe_isPointEmpty,
  unsafe_moveColor,
  unsafe_moveMakesMill,
} from '../functions';
import { MorrisColor, MorrisMoveType } from '../index';
import * as R from '../lib/tiny-rules-fp';
import type { MorrisContext, MorrisGameFacts } from '../rules';

// export type MC = MorrisContext<MENS_MORRIS_P_3, MENS_MORRIS_D_3, MENS_MORRIS_N_3>;
export type MC<P extends number, D extends number, N extends number> = MorrisContext<P, D, N>;

export const Rules3MM = <P extends number, D extends number, N extends number>() =>
  P.pipe(
    R.createRuleSet({
      isGameOverPhase: false,
      isPlacingPhase: false,
      isMovingPhase: false,
      isWhiteTurn: false,
      isBlackTurn: false,
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
    R.addRuleFunc('isGameOverPhase', (_c: MC<P, D, N>, _f: MorrisGameFacts) => false),
    // Placing phase if less than 6 MorrisMoveTypePlace moves have been made
    R.addRuleFunc(
      'isPlacingPhase',
      (c: MC<P, D, N>, _f: MorrisGameFacts) =>
        !_f.isGameOverPhase &&
        c.game.moves.filter((i) => i.type === MorrisMoveType.PLACE).length < c.game.config.numMorrisPerPlayer * 2
    ),
    R.addRuleFunc('isMovingPhase', (_c: MC<P, D, N>, f: MorrisGameFacts) => !f.isPlacingPhase),
    R.addRuleFunc('isWhiteTurn', (c: MC<P, D, N>, _f: MorrisGameFacts) => c.game.curMoveColor === MorrisColor.WHITE),
    R.addRuleFunc('isBlackTurn', (_c: MC<P, D, N>, f: MorrisGameFacts) => !f.isWhiteTurn),
    R.addRuleFunc('moveIsCorrectColor', (c: MC<P, D, N>, _f: MorrisGameFacts) =>
      isTurn(c.game, unsafe_moveColor(c.game, c.move))
    ),
    R.addRuleFunc(
      'moveIsCorrectTypeForPhase',
      (c: MC<P, D, N>, f: MorrisGameFacts) =>
        (f.isPlacingPhase && c.move.type === MorrisMoveType.PLACE) ||
        (f.isMovingPhase && c.move.type === MorrisMoveType.MOVE)
    ),
    R.addRuleFunc(
      'isMovePossibleForPlace',
      (c: MC<P, D, N>, _f: MorrisGameFacts) =>
        c.move.type === MorrisMoveType.PLACE && unsafe_isPointEmpty(c.game, c.move.to)
    ),
    R.addRuleFunc(
      'isMovePossibleForMove',
      (c: MC<P, D, N>, _f: MorrisGameFacts) =>
        c.move.type === MorrisMoveType.MOVE && unsafe_isPointAdjacent(c.game, c.move.from, c.move.to)
    ),
    R.addRuleFunc(
      'isValidMove',
      (_c: MC<P, D, N>, f: MorrisGameFacts) =>
        f.moveIsCorrectColor && f.moveIsCorrectTypeForPhase && (f.isMovePossibleForPlace || f.isMovePossibleForMove)
    ),
    R.addRuleFunc(
      'moveMakesMill',
      (c: MC<P, D, N>, f: MorrisGameFacts) => f.isValidMove && unsafe_moveMakesMill(c.game, c.move)
    ),
    R.addRuleFunc(
      'isWinningMoveWhite',
      (c: MC<P, D, N>, f: MorrisGameFacts) => f.moveMakesMill && unsafe_moveColor(c.game, c.move) === MorrisColor.WHITE
    ),
    R.addRuleFunc(
      'isWinningMoveBlack',
      (c: MC<P, D, N>, f: MorrisGameFacts) => f.moveMakesMill && unsafe_moveColor(c.game, c.move) === MorrisColor.BLACK
    ),
    R.addRuleFunc(
      'isWinningMove',
      (_c: MC<P, D, N>, f: MorrisGameFacts) => f.isWinningMoveWhite || f.isWinningMoveBlack
    )
  );
