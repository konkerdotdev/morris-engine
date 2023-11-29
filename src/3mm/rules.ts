import * as P from '@konker.dev/effect-ts-prelude';

import {
  boardHash,
  countPositionRepeats,
  countValidMovesForColor,
  numMorris,
  unsafe_boardApplyMove,
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
// FIXME: convert to array of rules which are reduced?
export const Rules3MM = <P extends number, D extends number, N extends number>() =>
  P.pipe(
    R.createRuleSet(INITIAL_MORRIS_GAME_FACTS),
    (ruleSet) =>
      P.pipe(
        ruleSet,
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
          'isLaskerPhase',
          (c: MorrisContext<P, D, N>, _f: MorrisGameFacts) => c.game.config.phases[0] === MorrisPhase.LASKER,
          'Is in Lasker phase'
        ),
        R.addRuleFunc(
          'isPlacingPhase',
          (c: MorrisContext<P, D, N>, f: MorrisGameFacts) =>
            !R.val(f.isLaskerPhase) &&
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
          'isMoveCorrectColor',
          (c: MorrisContext<P, D, N>, f: MorrisGameFacts) =>
            (R.val(f.isTurnWhite) && unsafe_moveColor(c.game, c.move) === MorrisColor.WHITE) ||
            (R.val(f.isTurnBlack) && unsafe_moveColor(c.game, c.move) === MorrisColor.BLACK),
          'The move is of the correct color'
        ),
        R.addRuleFunc(
          'isMoveCorrectType',
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
            c.move.type === MorrisMoveType.PLACE && unsafe_isPointEmpty(c.game.board, c.move.to),
          'The move is a place move which is possible'
        ),
        R.addRuleFunc(
          'isMovePossibleForMove',
          (c: MorrisContext<P, D, N>, _f: MorrisGameFacts) =>
            c.move.type === MorrisMoveType.MOVE &&
            !unsafe_isPointEmpty(c.game.board, c.move.from) &&
            unsafe_isPointEmpty(c.game.board, c.move.to) &&
            unsafe_isPointAdjacent(c.game.board, c.move.from, c.move.to),
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
            R.val(f.isFlyingPhase) &&
            c.move.type === MorrisMoveType.MOVE &&
            unsafe_isPointEmpty(c.game.board, c.move.to),
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
            !c.game.gameOver && R.val(f.isMoveCorrectColor) && R.val(f.isMoveCorrectType) && R.val(f.isMovePossible),
          'The move is valid: not game over; correct color; correct type for phase; the move is possible'
        )
      ),
    (ruleSet) =>
      P.pipe(
        ruleSet,
        R.addRuleFunc(
          'moveMakesNextTurnWhite',
          (_c: MorrisContext<P, D, N>, f: MorrisGameFacts) => R.val(f.isTurnBlack) && !R.val(f.moveMakesMill),
          'Next turn is White: this turn is black and no mill will be made'
        ),
        R.addRuleFunc(
          'moveMakesNextTurnBlack',
          (_c: MorrisContext<P, D, N>, f: MorrisGameFacts) => R.val(f.isTurnWhite) && !R.val(f.moveMakesMill),
          'Next turn is Black: this turn is white and no mill will be made'
        ),
        R.addRuleFunc(
          'moveMakesDrawPositionRepeatLimit',
          (c: MorrisContext<P, D, N>, f: MorrisGameFacts) =>
            R.val(f.isValidMove) &&
            countPositionRepeats(c.game, boardHash(unsafe_boardApplyMove(c.game.board, c.move))) >=
              c.game.config.numPositionRepeatsForDraw,
          'The move will result in a draw due to the move cycle limit'
        ),
        R.addRuleFunc(
          'moveMakesDrawNoMillsLimit',
          (c: MorrisContext<P, D, N>, f: MorrisGameFacts) =>
            R.val(f.isValidMove) && c.game.lastMillCounter + 1 >= c.game.config.numMovesWithoutMillForDraw,
          'The move will result in a draw due to move with no mills limit'
        ),
        R.addRuleFunc(
          'moveMakesDraw',
          (_c: MorrisContext<P, D, N>, f: MorrisGameFacts) =>
            R.val(f.isValidMove) && (R.val(f.moveMakesDrawPositionRepeatLimit) || R.val(f.moveMakesDrawNoMillsLimit)),
          'The move will result in a draw'
        ),
        R.addRuleFunc(
          'moveMakesNoValidMoveWhite',
          (c: MorrisContext<P, D, N>, f: MorrisGameFacts) =>
            R.val(f.isValidMove) &&
            countValidMovesForColor(unsafe_boardApplyMove(c.game.board, c.move), c.game.facts, MorrisColor.WHITE) === 0,
          'The move will result in no valid moves for white'
        ),
        R.addRuleFunc(
          'moveMakesNoValidMoveBlack',
          (c: MorrisContext<P, D, N>, f: MorrisGameFacts) =>
            R.val(f.isValidMove) &&
            countValidMovesForColor(unsafe_boardApplyMove(c.game.board, c.move), c.game.facts, MorrisColor.BLACK) === 0,
          'The move will result in no valid moves for black'
        ),
        R.addRuleFunc(
          'moveMakesWinWhite',
          (_c: MorrisContext<P, D, N>, f: MorrisGameFacts) =>
            R.val(f.isValidMove) &&
            ((R.val(f.moveMakesMill) && R.val(f.isTurnWhite)) ||
              (R.val(f.moveMakesNoValidMoveBlack) && R.val(f.moveMakesNextTurnBlack))),
          'The move is a winning move for White'
        ),
        R.addRuleFunc(
          'moveMakesWinBlack',
          (_c: MorrisContext<P, D, N>, f: MorrisGameFacts) =>
            R.val(f.isValidMove) &&
            ((R.val(f.moveMakesMill) && R.val(f.isTurnBlack)) ||
              (R.val(f.moveMakesNoValidMoveWhite) && R.val(f.moveMakesNextTurnWhite))),
          'The move is a winning move for Black'
        ),
        R.addRuleFunc(
          'moveMakesWin',
          (_c: MorrisContext<P, D, N>, f: MorrisGameFacts) => R.val(f.moveMakesWinWhite) || R.val(f.moveMakesWinBlack),
          'The move is a winning move: either for White or Black'
        ),
        R.addRuleFunc(
          'moveMakesGameOver',
          (_c: MorrisContext<P, D, N>, f: MorrisGameFacts) => R.val(f.moveMakesDraw) || R.val(f.moveMakesWin),
          'The move will result in game over'
        )
      )
  );
