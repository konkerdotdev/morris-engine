import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import * as R from '../../lib/tiny-rules-fp';
import { countMorris, isPointAdjacent, isPointEmpty } from '../board/points';
import { boardHash, countPositionRepeats } from '../board/query';
import { MorrisColor, MorrisMoveType, MorrisPhase } from '../consts';
import { applyMoveToGame } from '../game';
import { countValidMovesForColor, moveColor, moveMakesMill } from '../moves';
import type { MorrisGameFacts } from './facts';
import { INITIAL_MORRIS_GAME_FACTS } from './facts';
import type { MorrisRulesContext } from './index';

export const Rules = <P extends number, D extends number, N extends number>() =>
  P.pipe(
    R.createRuleSet<MorrisRulesContext<P, D, N>, MorrisGameFacts, MorrisEngineError>(INITIAL_MORRIS_GAME_FACTS),

    // is
    R.sequence([
      R.addRuleFunc(
        'isFirstMove',
        (c: MorrisRulesContext<P, D, N>, _f: MorrisGameFacts) => c.game.moves.length === 0,
        'Is first move'
      ),
      R.addRuleFunc(
        'isTurnWhite',
        (c: MorrisRulesContext<P, D, N>, _f: MorrisGameFacts) => c.game.curMoveColor === MorrisColor.WHITE,
        'Is current turn White'
      ),
      R.addRuleFunc(
        'isTurnBlack',
        (_c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) => !R.val(f.isTurnWhite),
        'Is current turn Black'
      ),
      R.addRuleFunc(
        'isLaskerPhase',
        (c: MorrisRulesContext<P, D, N>, _f: MorrisGameFacts) =>
          c.game.config.phases[0] === MorrisPhase.LASKER &&
          c.game.morrisWhite.length > 0 &&
          c.game.morrisBlack.length > 0,
        'Is in Lasker phase: Lasker phase is configured, and not all pieces have been placed'
      ),
      R.addRuleFunc(
        'isPlacingPhase',
        (c: MorrisRulesContext<P, D, N>, _f: MorrisGameFacts) =>
          c.game.config.phases[0] === MorrisPhase.PLACING &&
          (c.game.morrisWhite.length > 0 || c.game.morrisBlack.length > 0),
        'Is in placing phase: not all pieces have been placed'
      ),
      R.addRuleFunc(
        'isMovingPhase',
        (c: MorrisRulesContext<P, D, N>, _f: MorrisGameFacts) =>
          c.game.morrisWhite.length === 0 && c.game.morrisBlack.length === 0,
        'Is in moving phase: all pieces have been placed'
      ),
      R.addRuleFunc(
        'isFlyingPhase',
        (c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          (R.val(f.isMovingPhase) &&
            R.val(f.isTurnWhite) &&
            countMorris(c.game.board, MorrisColor.WHITE) <= c.game.config.flyingThreshold) ||
          (R.val(f.isMovingPhase) &&
            R.val(f.isTurnBlack) &&
            countMorris(c.game.board, MorrisColor.BLACK) <= c.game.config.flyingThreshold),
        `Is in flying phase for current player`
      ),
      R.addRuleFunc(
        'isRemoveMode',
        (c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          !c.game.gameOver && !R.val(f.isFirstMove) && c.game.lastMillCounter === 0,
        'Is in remove mode for current player: last move was a mill'
      ),

      // move is
      R.addRuleFuncE<MorrisRulesContext<P, D, N>, MorrisGameFacts, MorrisEngineError>(
        'moveIsCorrectColor',
        (c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('moveColor', () => moveColor(c.game, c.move)),
            P.Effect.map(
              ({ moveColor }) =>
                (R.val(f.isTurnWhite) && moveColor === MorrisColor.WHITE) ||
                (R.val(f.isTurnBlack) && moveColor === MorrisColor.BLACK)
            ),
            P.Effect.orElseSucceed(() => false)
          ),
        'The move is of the correct color'
      ),
      R.addRuleFunc(
        'moveIsCorrectType',
        (c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          (R.val(f.isRemoveMode) && c.move.type === MorrisMoveType.REMOVE) ||
          (!R.val(f.isRemoveMode) && R.val(f.isPlacingPhase) && c.move.type === MorrisMoveType.PLACE) ||
          (!R.val(f.isRemoveMode) && R.val(f.isMovingPhase) && c.move.type === MorrisMoveType.MOVE) ||
          (!R.val(f.isRemoveMode) &&
            R.val(f.isLaskerPhase) &&
            (c.move.type === MorrisMoveType.PLACE || c.move.type === MorrisMoveType.MOVE)),
        'The move is of the correct type for the phase'
      ),
      R.addRuleFuncE(
        'moveIsPossibleForPlace',
        (c: MorrisRulesContext<P, D, N>, _f: MorrisGameFacts) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('isPointEmptyTo', () =>
              c.move.type === MorrisMoveType.PLACE ? isPointEmpty(c.game.board, c.move.to) : P.Effect.succeed(false)
            ),
            P.Effect.map(({ isPointEmptyTo }) => c.move.type === MorrisMoveType.PLACE && isPointEmptyTo)
          ),
        'The move is a place move which is possible'
      ),
      R.addRuleFuncE(
        'moveIsPossibleForMove',
        (c: MorrisRulesContext<P, D, N>, _f: MorrisGameFacts) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('isPointEmptyFrom', () =>
              c.move.type === MorrisMoveType.MOVE ? isPointEmpty(c.game.board, c.move.from) : P.Effect.succeed(false)
            ),
            P.Effect.bind('isPointEmptyTo', () =>
              c.move.type === MorrisMoveType.MOVE ? isPointEmpty(c.game.board, c.move.to) : P.Effect.succeed(false)
            ),
            P.Effect.bind('isPointAdjacentFromTo', () =>
              c.move.type === MorrisMoveType.MOVE
                ? isPointAdjacent(c.game.board, c.move.from, c.move.to)
                : P.Effect.succeed(false)
            ),
            P.Effect.map(
              ({ isPointAdjacentFromTo, isPointEmptyFrom, isPointEmptyTo }) =>
                c.move.type === MorrisMoveType.MOVE && !isPointEmptyFrom && isPointEmptyTo && isPointAdjacentFromTo
            )
          ),
        'The move is a move move which is possible'
      ),
      R.addRuleFunc(
        'moveIsPossibleForLasker',
        (_c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.moveIsPossibleForPlace) || R.val(f.moveIsPossibleForMove),
        'The move is a Lasker move which is possible'
      ),
      R.addRuleFuncE(
        'moveIsPossibleForFlying',
        (c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('isPointEmptyTo', () =>
              c.move.type === MorrisMoveType.MOVE ? isPointEmpty(c.game.board, c.move.to) : P.Effect.succeed(false)
            ),
            P.Effect.map(
              ({ isPointEmptyTo }) => R.val(f.isFlyingPhase) && c.move.type === MorrisMoveType.MOVE && isPointEmptyTo
            )
          ),
        'The move is a flying move which is possible'
      ),
      R.addRuleFunc(
        'moveIsPossible',
        (_c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.moveIsPossibleForPlace) ||
          R.val(f.moveIsPossibleForMove) ||
          R.val(f.moveIsPossibleForLasker) ||
          R.val(f.moveIsPossibleForFlying),
        'The move is possible'
      ),
      R.addRuleFunc(
        'moveIsValid',
        (c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          !c.game.gameOver && R.val(f.moveIsCorrectColor) && R.val(f.moveIsCorrectType) && R.val(f.moveIsPossible),
        'The move is valid: not game over; correct color; correct type for phase; the move is possible'
      ),

      // move makes
      // FIXME: type annotation is not ideal
      R.addRuleFuncE<MorrisRulesContext<P, D, N>, MorrisGameFacts, MorrisEngineError>(
        'moveMakesMill',
        (c: MorrisRulesContext<P, D, N>, _f: MorrisGameFacts) =>
          P.pipe(
            moveMakesMill(c.game, c.move),
            P.Effect.orElseSucceed(() => false)
          ),
        'The move will make a mill'
      ),
      R.addRuleFunc(
        'moveMakesNextTurnWhite',
        (_c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) => R.val(f.isTurnBlack) && !R.val(f.moveMakesMill),
        'Next turn is White: this turn is black and no mill will be made'
      ),
      R.addRuleFunc(
        'moveMakesNextTurnBlack',
        (_c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) => R.val(f.isTurnWhite) && !R.val(f.moveMakesMill),
        'Next turn is Black: this turn is white and no mill will be made'
      ),
      R.addRuleFunc(
        'moveMakesRemoveMode',
        (_c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) => R.val(f.moveMakesMill),
        'Next turn is remove: the move makes a mill'
      ),
      R.addRuleFunc(
        'moveMakesLaskerPhase',
        (c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          !R.val(f.moveMakesRemoveMode) &&
          c.game.config.phases[0] === MorrisPhase.LASKER &&
          c.game.morrisWhite.length > 1 &&
          c.game.morrisBlack.length > 1,
        'Next turn is Lasker phase'
      ),
      R.addRuleFunc(
        'moveMakesFlyingPhase',
        (c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.isRemoveMode) &&
          ((R.val(f.isTurnWhite) && c.game.morrisBlack.length === c.game.config.flyingThreshold + 1) ||
            (R.val(f.isTurnBlack) && c.game.morrisWhite.length === c.game.config.flyingThreshold + 1)),
        'Next turn is flying phase'
      ),
      R.addRuleFunc(
        'moveMakesPlacingPhase',
        (c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          (!R.val(f.moveMakesRemoveMode) &&
            R.val(f.isTurnWhite) &&
            c.game.morrisWhite.length >= 1 &&
            c.game.morrisBlack.length > 0) ||
          (!R.val(f.moveMakesRemoveMode) &&
            R.val(f.isTurnBlack) &&
            c.game.morrisBlack.length >= 1 &&
            c.game.morrisWhite.length > 0),
        'Next turn is placing phase'
      ),
      R.addRuleFunc(
        'moveMakesMovingPhase',
        (c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          (!R.val(f.moveMakesRemoveMode) &&
            R.val(f.isTurnWhite) &&
            c.game.morrisWhite.length <= 1 &&
            c.game.morrisBlack.length === 0) ||
          (!R.val(f.moveMakesRemoveMode) &&
            R.val(f.isTurnBlack) &&
            c.game.morrisBlack.length <= 1 &&
            c.game.morrisWhite.length === 0),
        'Next turn is moving phase'
      ),
      R.addRuleFuncE(
        'moveMakesDrawPositionRepeatLimit',
        (c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('newGame', () => applyMoveToGame(c.game, c.move)),
            P.Effect.map(
              ({ newGame }) =>
                R.val(f.moveIsValid) &&
                countPositionRepeats(c.game, boardHash(newGame.board)) >= c.game.config.numPositionRepeatsForDraw
            )
          ),
        'The move will result in a draw due to the move cycle limit'
      ),
      R.addRuleFunc(
        'moveMakesDrawNoMillsLimit',
        (c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.moveIsValid) && c.game.lastMillCounter + 1 >= c.game.config.numMovesWithoutMillForDraw,
        'The move will result in a draw due to move with no mills limit'
      ),
      R.addRuleFunc(
        'moveMakesDraw',
        (_c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.moveIsValid) && (R.val(f.moveMakesDrawPositionRepeatLimit) || R.val(f.moveMakesDrawNoMillsLimit)),
        'The move will result in a draw'
      ),
      R.addRuleFuncE(
        'moveMakesNoValidMoveWhite',
        (c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('newGame', () => applyMoveToGame(c.game, c.move)),
            P.Effect.bind('validMovesCount', ({ newGame }) =>
              countValidMovesForColor(newGame.board, f, MorrisColor.WHITE)
            ),
            P.Effect.map(({ validMovesCount }) => R.val(f.moveIsValid) && validMovesCount === 0)
          ),
        'The move will result in no valid moves for white'
      ),
      R.addRuleFuncE(
        'moveMakesNoValidMoveBlack',
        (c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('newGame', () => applyMoveToGame(c.game, c.move)),
            P.Effect.bind('validMovesCount', ({ newGame }) =>
              countValidMovesForColor(newGame.board, f, MorrisColor.BLACK)
            ),
            P.Effect.map(({ validMovesCount }) => R.val(f.moveIsValid) && validMovesCount === 0)
          ),
        'The move will result in no valid moves for black'
      ),
      R.addRuleFunc(
        'moveMakesWinWhite',
        (_c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.moveIsValid) &&
          ((R.val(f.moveMakesMill) && R.val(f.isTurnWhite)) ||
            (R.val(f.moveMakesNoValidMoveBlack) && R.val(f.moveMakesNextTurnBlack))),
        'The move is a winning move for White'
      ),
      R.addRuleFunc(
        'moveMakesWinBlack',
        (_c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.moveIsValid) &&
          ((R.val(f.moveMakesMill) && R.val(f.isTurnBlack)) ||
            (R.val(f.moveMakesNoValidMoveWhite) && R.val(f.moveMakesNextTurnWhite))),
        'The move is a winning move for Black'
      ),
      R.addRuleFunc(
        'moveMakesWin',
        (_c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.moveMakesWinWhite) || R.val(f.moveMakesWinBlack),
        'The move is a winning move: either for White or Black'
      ),
      R.addRuleFunc(
        'moveMakesGameOver',
        (_c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) => R.val(f.moveMakesDraw) || R.val(f.moveMakesWin),
        'The move will result in game over'
      ),
    ])
  );
