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
import { INITIAL_MORRIS_GAME_FACTS } from '../rules';

// export type MC = MorrisContext<MENS_MORRIS_P_3, MENS_MORRIS_D_3, MENS_MORRIS_N_3>;
export type MC<P extends number, D extends number, N extends number> = MorrisContext<P, D, N>;

export const Rules3MM = <P extends number, D extends number, N extends number>() =>
  P.pipe(
    R.createRuleSet(INITIAL_MORRIS_GAME_FACTS),
    R.addRuleFunc(
      'isGameOverPhase',
      (_c: MC<P, D, N>, _f: MorrisGameFacts) => false,
      'No more moves possible because game is over'
    ),
    // Placing phase if less than 6 MorrisMoveTypePlace moves have been made
    R.addRuleFunc(
      'isPlacingPhase',
      (c: MC<P, D, N>, _f: MorrisGameFacts) =>
        !_f.isGameOverPhase &&
        c.game.moves.filter((i) => i.type === MorrisMoveType.PLACE).length < c.game.config.numMorrisPerPlayer * 2,
      'Is in placing phase'
    ),
    R.addRuleFunc(
      'isMovingPhase',
      (_c: MC<P, D, N>, f: MorrisGameFacts) => !R.val(f.isPlacingPhase),
      'Is in moving phase'
    ),
    R.addRuleFunc(
      'isWhiteTurn',
      (c: MC<P, D, N>, _f: MorrisGameFacts) => c.game.curMoveColor === MorrisColor.WHITE,
      'Current turn is White'
    ),
    R.addRuleFunc(
      'isBlackTurn',
      (_c: MC<P, D, N>, f: MorrisGameFacts) => !R.val(f.isWhiteTurn),
      'Current turn is Black'
    ),
    R.addRuleFunc(
      'moveIsCorrectColor',
      (c: MC<P, D, N>, _f: MorrisGameFacts) => isTurn(c.game, unsafe_moveColor(c.game, c.move)),
      'The move is of the correct color'
    ),
    R.addRuleFunc(
      'moveIsCorrectTypeForPhase',
      (c: MC<P, D, N>, f: MorrisGameFacts) =>
        (R.val(f.isPlacingPhase) && c.move.type === MorrisMoveType.PLACE) ||
        (R.val(f.isMovingPhase) && c.move.type === MorrisMoveType.MOVE),
      'The move is of the correct type for the phase'
    ),
    R.addRuleFunc(
      'isMovePossibleForPlace',
      (c: MC<P, D, N>, _f: MorrisGameFacts) =>
        c.move.type === MorrisMoveType.PLACE && unsafe_isPointEmpty(c.game, c.move.to),
      'The move is a place move which is possible'
    ),
    R.addRuleFunc(
      'isMovePossibleForMove',
      (c: MC<P, D, N>, _f: MorrisGameFacts) =>
        c.move.type === MorrisMoveType.MOVE && unsafe_isPointAdjacent(c.game, c.move.from, c.move.to),
      'The move is a move move which is possible'
    ),
    R.addRuleFunc(
      'isValidMove',
      (_c: MC<P, D, N>, f: MorrisGameFacts) =>
        R.val(f.moveIsCorrectColor) &&
        R.val(f.moveIsCorrectTypeForPhase) &&
        (R.val(f.isMovePossibleForPlace) || R.val(f.isMovePossibleForMove)),
      'The move is valid: correct color; correct type for phase; the move is possible'
    ),
    R.addRuleFunc(
      'moveMakesMill',
      (c: MC<P, D, N>, f: MorrisGameFacts) => R.val(f.isValidMove) && unsafe_moveMakesMill(c.game, c.move),
      'The move will make a mill'
    ),
    R.addRuleFunc(
      'isWinningMoveWhite',
      (c: MC<P, D, N>, f: MorrisGameFacts) =>
        R.val(f.moveMakesMill) && unsafe_moveColor(c.game, c.move) === MorrisColor.WHITE,
      'The move is a winning move for White'
    ),
    R.addRuleFunc(
      'isWinningMoveBlack',
      (c: MC<P, D, N>, f: MorrisGameFacts) =>
        R.val(f.moveMakesMill) && unsafe_moveColor(c.game, c.move) === MorrisColor.BLACK,
      'The move is a winning move for Black'
    ),
    R.addRuleFunc(
      'isWinningMove',
      (_c: MC<P, D, N>, f: MorrisGameFacts) => R.val(f.isWinningMoveWhite) || R.val(f.isWinningMoveBlack),
      'The move is a winning move: either for White or Black'
    )
  );
