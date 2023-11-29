import * as P from '@konker.dev/effect-ts-prelude';

import {
  numMorris,
  unsafe_isPointAdjacent,
  unsafe_isPointEmpty,
  unsafe_moveColor,
  unsafe_moveMakesMill,
} from '../functions';
import { MorrisColor, MorrisMoveType, MorrisPhase } from '../index';
import * as R from '../lib/tiny-rules-fp';
import type { MorrisContext, MorrisGameFacts } from '../rules';
import { INITIAL_MORRIS_GAME_FACTS } from '../rules';

// FIXME: pipe limit!
export const Rules3MM = <P extends number, D extends number, N extends number>() =>
  P.pipe(
    R.createRuleSet(INITIAL_MORRIS_GAME_FACTS),
    (ruleSet) =>
      P.pipe(
        ruleSet,
        // Placing phase if less than 6 MorrisMoveTypePlace moves have been made
        R.addRuleFunc(
          'isFirstMove',
          (c: MorrisContext<P, D, N>, _f: MorrisGameFacts) => c.game.moves.length === 0,
          'Is first move'
        ),
        R.addRuleFunc(
          'isTurnWhite',
          (c: MorrisContext<P, D, N>, _f: MorrisGameFacts) => c.game.curMoveColor === MorrisColor.WHITE,
          'Current turn is White'
        ),
        R.addRuleFunc(
          'isTurnBlack',
          (_c: MorrisContext<P, D, N>, f: MorrisGameFacts) => !R.val(f.isTurnWhite),
          'Current turn is Black'
        ),
        R.addRuleFunc(
          'isPlacingPhase',
          (c: MorrisContext<P, D, N>, _f: MorrisGameFacts) =>
            c.game.moves.filter((i) => i.type === MorrisMoveType.PLACE).length < c.game.config.numMorrisPerPlayer * 2,
          'Is in placing phase'
        ),
        R.addRuleFunc(
          'isMovingPhase',
          (c: MorrisContext<P, D, N>, _f: MorrisGameFacts) =>
            c.game.moves.filter((i) => i.type === MorrisMoveType.PLACE).length === c.game.config.numMorrisPerPlayer * 2,
          'Is in moving phase'
        ),
        R.addRuleFunc(
          'isLaskerPhase',
          (c: MorrisContext<P, D, N>, _f: MorrisGameFacts) => c.game.config.phases[0] === MorrisPhase.LASKER,
          'Is in Lasker phase'
        ),
        R.addRuleFunc(
          'isFlyingPhase',
          (c: MorrisContext<P, D, N>, f: MorrisGameFacts) =>
            (R.val(f.isMovingPhase) &&
              R.val(f.isTurnWhite) &&
              numMorris(c.game, MorrisColor.WHITE) <= c.game.config.flyingThreshold) ||
            (R.val(f.isMovingPhase) &&
              R.val(f.isTurnBlack) &&
              numMorris(c.game, MorrisColor.BLACK) <= c.game.config.flyingThreshold),
          `Is in flying phase for current player`
        ),
        R.addRuleFunc(
          'moveMakesMill',
          (c: MorrisContext<P, D, N>, _f: MorrisGameFacts) => unsafe_moveMakesMill(c.game, c.move),
          'The move will make a mill'
        ),
        R.addRuleFunc(
          'isRemoveMode',
          (c: MorrisContext<P, D, N>, f: MorrisGameFacts) =>
            !c.game.gameOver && !R.val(f.isFirstMove) && c.game.lastMillCounter === 0,
          `Is in remove mode for current player: last move was a mill`
        )
      ),
    (ruleSet) =>
      P.pipe(
        ruleSet,
        R.addRuleFunc(
          'isNextTurnWhite',
          (_c: MorrisContext<P, D, N>, f: MorrisGameFacts) => R.val(f.isTurnBlack) && !R.val(f.moveMakesMill),
          'Next turn is White: this turn is black and no mill will be made'
        ),
        R.addRuleFunc(
          'isNextTurnBlack',
          (_c: MorrisContext<P, D, N>, f: MorrisGameFacts) => R.val(f.isTurnWhite) && !R.val(f.moveMakesMill),
          'Next turn is Black: this turn is white and no mill will be made'
        ),
        R.addRuleFunc(
          'moveIsCorrectColor',
          (c: MorrisContext<P, D, N>, f: MorrisGameFacts) =>
            (R.val(f.isTurnWhite) && unsafe_moveColor(c.game, c.move) === MorrisColor.WHITE) ||
            (R.val(f.isTurnBlack) && unsafe_moveColor(c.game, c.move) === MorrisColor.BLACK),
          'The move is of the correct color'
        ),
        R.addRuleFunc(
          'moveIsCorrectType',
          (c: MorrisContext<P, D, N>, f: MorrisGameFacts) =>
            (R.val(f.isRemoveMode) && c.move.type === MorrisMoveType.REMOVE) ||
            (!R.val(f.isRemoveMode) && R.val(f.isPlacingPhase) && c.move.type === MorrisMoveType.PLACE) ||
            (!R.val(f.isRemoveMode) && R.val(f.isMovingPhase) && c.move.type === MorrisMoveType.MOVE) ||
            (!R.val(f.isRemoveMode) &&
              R.val(f.isLaskerPhase) &&
              (c.move.type === MorrisMoveType.PLACE || c.move.type === MorrisMoveType.MOVE)),
          'The move is of the correct type for the phase'
        ),
        R.addRuleFunc(
          'isMovePossibleForPlace',
          (c: MorrisContext<P, D, N>, _f: MorrisGameFacts) =>
            c.move.type === MorrisMoveType.PLACE && unsafe_isPointEmpty(c.game, c.move.to),
          'The move is a place move which is possible'
        ),
        R.addRuleFunc(
          'isMovePossibleForMove',
          (c: MorrisContext<P, D, N>, _f: MorrisGameFacts) =>
            c.move.type === MorrisMoveType.MOVE &&
            !unsafe_isPointEmpty(c.game, c.move.from) &&
            unsafe_isPointEmpty(c.game, c.move.to) &&
            unsafe_isPointAdjacent(c.game, c.move.from, c.move.to),
          'The move is a move move which is possible'
        ),
        R.addRuleFunc(
          'isMovePossibleForLasker',
          (_c: MorrisContext<P, D, N>, f: MorrisGameFacts) =>
            R.val(f.isMovePossibleForPlace) || R.val(f.isMovePossibleForMove),
          'The move is a Lasker move which is possible'
        ),
        R.addRuleFunc(
          'isMovePossibleForFlying',
          (c: MorrisContext<P, D, N>, f: MorrisGameFacts) =>
            R.val(f.isFlyingPhase) && c.move.type === MorrisMoveType.MOVE && unsafe_isPointEmpty(c.game, c.move.to),
          'The move is a flying move which is possible'
        ),
        R.addRuleFunc(
          'isMovePossible',
          (_c: MorrisContext<P, D, N>, f: MorrisGameFacts) =>
            R.val(f.isMovePossibleForPlace) ||
            R.val(f.isMovePossibleForMove) ||
            R.val(f.isMovePossibleForLasker) ||
            R.val(f.isMovePossibleForFlying),
          'The move is possible'
        ),
        R.addRuleFunc(
          'isValidMove',
          (c: MorrisContext<P, D, N>, f: MorrisGameFacts) =>
            !c.game.gameOver && R.val(f.moveIsCorrectColor) && R.val(f.moveIsCorrectType) && R.val(f.isMovePossible),
          'The move is valid: not game over; correct color; correct type for phase; the move is possible'
        )
      ),
    (ruleSet) =>
      P.pipe(
        ruleSet,
        R.addRuleFunc(
          'moveMakesDrawCycleLimit',
          (_c: MorrisContext<P, D, N>, f: MorrisGameFacts) => R.val(f.moveMakesDraw) && false,
          'The move will result in a draw due to the move cycle limit'
        ),
        R.addRuleFunc(
          'moveMakesDrawNoValidMove',
          (_c: MorrisContext<P, D, N>, f: MorrisGameFacts) => R.val(f.moveMakesDraw) && false,
          'The move will result in a draw due to no valid moves for the current player'
        ),
        R.addRuleFunc(
          'moveMakesDrawNoMillsLimit',
          (_c: MorrisContext<P, D, N>, f: MorrisGameFacts) => R.val(f.moveMakesDraw) && false,
          'The move will result in a draw due to move with no mills limit'
        ),
        R.addRuleFunc(
          'moveMakesDraw',
          (_c: MorrisContext<P, D, N>, f: MorrisGameFacts) =>
            R.val(f.isValidMove) &&
            (R.val(f.moveMakesDrawCycleLimit) ||
              R.val(f.moveMakesDrawNoValidMove) ||
              R.val(f.moveMakesDrawNoMillsLimit)),
          'The move will result in a draw'
        ),
        R.addRuleFunc(
          'isWinningMoveWhite',
          (c: MorrisContext<P, D, N>, f: MorrisGameFacts) =>
            R.val(f.isValidMove) && R.val(f.moveMakesMill) && unsafe_moveColor(c.game, c.move) === MorrisColor.WHITE,
          'The move is a winning move for White'
        ),
        R.addRuleFunc(
          'isWinningMoveBlack',
          (c: MorrisContext<P, D, N>, f: MorrisGameFacts) =>
            R.val(f.isValidMove) && R.val(f.moveMakesMill) && unsafe_moveColor(c.game, c.move) === MorrisColor.BLACK,
          'The move is a winning move for Black'
        ),
        R.addRuleFunc(
          'isWinningMove',
          (_c: MorrisContext<P, D, N>, f: MorrisGameFacts) =>
            R.val(f.isWinningMoveWhite) || R.val(f.isWinningMoveBlack),
          'The move is a winning move: either for White or Black'
        ),
        R.addRuleFunc(
          'moveMakesGameOver',
          (_c: MorrisContext<P, D, N>, f: MorrisGameFacts) => R.val(f.moveMakesDraw) || R.val(f.isWinningMove),
          'The move will result in game over'
        )
      )
  );
