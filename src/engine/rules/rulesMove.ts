import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import * as R from '../../lib/tiny-rules-fp';
import { countMorris, isPointAdjacent, isPointEmpty } from '../board/points';
import { boardHash, countPositionRepeats } from '../board/query';
import { MorrisColor, MorrisMoveType, MorrisPhase } from '../consts';
import { applyMoveToGameBoard } from '../game';
import { countValidMovesForColor, moveColor, moveMakesMill } from '../moves';
import type { MorrisGameFacts } from './facts';
import { INITIAL_MORRIS_GAME_FACTS } from './facts';
import type { MorrisRulesContextMove } from './index';

export const RulesMove = <P extends number, D extends number, N extends number>() =>
  P.pipe(
    R.createRuleSet<MorrisRulesContextMove<P, D, N>, MorrisEngineError, MorrisGameFacts>(INITIAL_MORRIS_GAME_FACTS),

    // is
    R.sequence([
      R.addRuleFunc(
        'isFirstMove',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisGameFacts) => c.game.moves.length === 0,
        'Is first move'
      ),
      R.addRuleFunc(
        'isSecondMove',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisGameFacts) => c.game.moves.length === 1,
        'Is second move'
      ),
      R.addRuleFunc(
        'isTurnWhite',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisGameFacts) => c.game.curMoveColor === MorrisColor.WHITE,
        'Is current turn white'
      ),
      R.addRuleFunc(
        'isTurnBlack',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisGameFacts) => c.game.curMoveColor === MorrisColor.BLACK,
        'Is current turn black'
      ),
      R.addRuleFunc(
        'isLaskerPhase',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisGameFacts) =>
          c.game.config.phases[0] === MorrisPhase.LASKER &&
          c.game.morrisWhite.length > 0 &&
          c.game.morrisBlack.length > 0,
        'Is in Lasker phase: Lasker phase is configured, and not all pieces have been placed'
      ),
      R.addRuleFunc(
        'isPlacingPhase',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisGameFacts) =>
          c.game.config.phases[0] === MorrisPhase.PLACING &&
          (c.game.morrisWhite.length > 0 || c.game.morrisBlack.length > 0),
        'Is in placing phase: not all pieces have been placed'
      ),
      R.addRuleFunc(
        'isMovingPhase',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisGameFacts) =>
          c.game.morrisWhite.length === 0 && c.game.morrisBlack.length === 0,
        'Is in moving phase: all pieces have been placed'
      ),
      R.addRuleFunc(
        'isFlyingPhase',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          (R.val(f.isTurnWhite) &&
            countMorris(c.game.board, MorrisColor.WHITE) <= c.game.config.numMorrisForFlyingThreshold) ||
          (R.val(f.isTurnBlack) &&
            countMorris(c.game.board, MorrisColor.BLACK) <= c.game.config.numMorrisForFlyingThreshold),
        `Is in flying phase for current player`
      ),
      R.addRuleFunc(
        'isRemoveMode',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          !c.game.gameOver && !R.val(f.isFirstMove) && c.game.lastMillCounter === 0,
        'Is in remove mode for current player: last move was a mill'
      ),

      // move is
      R.addRuleFuncEffect<MorrisRulesContextMove<P, D, N>, MorrisEngineError, MorrisGameFacts>(
        'moveIsCorrectColor',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
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
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          (R.val(f.isRemoveMode) && c.move.type === MorrisMoveType.REMOVE) ||
          (!R.val(f.isRemoveMode) && R.val(f.isPlacingPhase) && c.move.type === MorrisMoveType.PLACE) ||
          (!R.val(f.isRemoveMode) && R.val(f.isMovingPhase) && c.move.type === MorrisMoveType.MOVE) ||
          (!R.val(f.isRemoveMode) &&
            R.val(f.isLaskerPhase) &&
            (c.move.type === MorrisMoveType.PLACE || c.move.type === MorrisMoveType.MOVE)),
        'The move is of the correct type for the phase'
      ),
      R.addRuleFunc(
        'moveIsForbiddenOnFirstMove',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.isFirstMove) &&
          c.move.type === MorrisMoveType.PLACE &&
          c.game.config.forbiddenPointsFirstMove.includes(c.move.to),
        'The move is forbidden on the first move'
      ),
      R.addRuleFunc(
        'moveIsForbiddenOnSecondMove',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.isSecondMove) &&
          c.move.type === MorrisMoveType.PLACE &&
          c.game.config.forbiddenPointsFirstMove.includes(c.move.to),
        'The move is forbidden on the second move'
      ),
      R.addRuleFunc(
        'moveIsForbiddenInPlacingPhase',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          !R.val(f.isRemoveMode) &&
          (R.val(f.isPlacingPhase) || R.val(f.isLaskerPhase)) &&
          (c.move.type === MorrisMoveType.PLACE || c.move.type === MorrisMoveType.MOVE) &&
          c.game.config.forbiddenPointsPlacingPhase.includes(c.move.to),
        'The move is forbidden in placing phase'
      ),
      R.addRuleFuncEffect(
        'moveIsPossibleForPlace',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisGameFacts) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('isPointEmptyTo', () =>
              c.move.type === MorrisMoveType.PLACE ? isPointEmpty(c.game.board, c.move.to) : P.Effect.succeed(false)
            ),
            P.Effect.map(({ isPointEmptyTo }) => c.move.type === MorrisMoveType.PLACE && isPointEmptyTo)
          ),
        'The move is a place move which is possible'
      ),
      R.addRuleFuncEffect(
        'moveIsPossibleForMove',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisGameFacts) =>
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
      R.addRuleFuncEffect(
        'moveIsPossibleForRemove',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('isPointEmptyFrom', () =>
              c.move.type === MorrisMoveType.REMOVE ? isPointEmpty(c.game.board, c.move.from) : P.Effect.succeed(false)
            ),
            P.Effect.map(
              ({ isPointEmptyFrom }) =>
                R.val(f.isRemoveMode) && c.move.type === MorrisMoveType.REMOVE && !isPointEmptyFrom
            )
          ),
        'The move is a flying move which is possible'
      ),
      R.addRuleFunc(
        'moveIsPossibleForLasker',
        (_c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.moveIsPossibleForPlace) || R.val(f.moveIsPossibleForMove),
        'The move is a Lasker move which is possible'
      ),
      R.addRuleFuncEffect(
        'moveIsPossibleForFlying',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
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
        (_c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          !R.val(f.moveIsForbiddenOnFirstMove) &&
          !R.val(f.moveIsForbiddenOnSecondMove) &&
          !R.val(f.moveIsForbiddenInPlacingPhase) &&
          (R.val(f.moveIsPossibleForPlace) ||
            R.val(f.moveIsPossibleForMove) ||
            R.val(f.moveIsPossibleForRemove) ||
            R.val(f.moveIsPossibleForLasker) ||
            R.val(f.moveIsPossibleForFlying)),
        'The move is possible'
      ),
      R.addRuleFunc(
        'moveIsValid',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          !c.game.gameOver && R.val(f.moveIsCorrectColor) && R.val(f.moveIsCorrectType) && R.val(f.moveIsPossible),
        'The move is valid: not game over; correct color; correct type for phase; the move is possible'
      ),

      // move makes
      R.addRuleFuncEffect(
        'moveMakesMill',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisGameFacts) =>
          P.pipe(
            moveMakesMill(c.game, c.move),
            P.Effect.orElseSucceed(() => false),
            P.Effect.mapError(toMorrisEngineError)
          ),
        'The move will make a mill'
      ),
      R.addRuleFunc(
        'moveMakesNextTurnWhite',
        (_c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          (R.val(f.isTurnBlack) && !R.val(f.moveMakesMill)) || (R.val(f.isTurnWhite) && R.val(f.moveMakesMill)),
        'Next turn is white: this turn is black and no mill will be made'
      ),
      R.addRuleFunc(
        'moveMakesNextTurnBlack',
        (_c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          (R.val(f.isTurnWhite) && !R.val(f.moveMakesMill)) || (R.val(f.isTurnBlack) && R.val(f.moveMakesMill)),
        'Next turn is black: this turn is white and no mill will be made'
      ),
      R.addRuleFunc(
        'moveMakesRemoveMode',
        (_c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) => R.val(f.moveMakesMill),
        'Next turn is remove: the move makes a mill'
      ),
      R.addRuleFunc(
        'moveMakesLaskerPhase',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          !R.val(f.moveMakesRemoveMode) &&
          c.game.config.phases[0] === MorrisPhase.LASKER &&
          c.game.morrisWhite.length > 1 &&
          c.game.morrisBlack.length > 1,
        'Next turn is Lasker phase'
      ),
      R.addRuleFunc(
        'moveMakesFlyingPhase',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          (R.val(f.isRemoveMode) &&
            ((R.val(f.isTurnWhite) &&
              countMorris(c.game.board, MorrisColor.BLACK) === c.game.config.numMorrisForFlyingThreshold + 1) ||
              (R.val(f.isTurnBlack) &&
                countMorris(c.game.board, MorrisColor.WHITE) === c.game.config.numMorrisForFlyingThreshold + 1))) ||
          (!R.val(f.isRemoveMode) &&
            ((R.val(f.isTurnWhite) &&
              countMorris(c.game.board, MorrisColor.BLACK) <= c.game.config.numMorrisForFlyingThreshold) ||
              (R.val(f.isTurnBlack) &&
                countMorris(c.game.board, MorrisColor.WHITE) <= c.game.config.numMorrisForFlyingThreshold))),
        'Next turn is flying phase'
      ),
      R.addRuleFunc(
        'moveMakesPlacingPhase',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
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
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          (R.val(f.isTurnWhite) && c.game.morrisWhite.length <= 1 && c.game.morrisBlack.length === 0) ||
          (R.val(f.isTurnBlack) && c.game.morrisBlack.length <= 1 && c.game.morrisWhite.length === 0),
        'Next turn is moving phase'
      ),
      R.addRuleFuncEffect(
        'moveMakesDrawPositionRepeatLimit',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('newGame', () => applyMoveToGameBoard(c.game, c.move)),
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
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.moveIsValid) && c.game.lastMillCounter + 1 >= c.game.config.numMovesWithoutMillForDraw,
        'The move will result in a draw due to move with no mills limit'
      ),
      R.addRuleFunc(
        'moveMakesDraw',
        (_c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.moveIsValid) && (R.val(f.moveMakesDrawPositionRepeatLimit) || R.val(f.moveMakesDrawNoMillsLimit)),
        'The move will result in a draw'
      ),
      R.addRuleFuncEffect(
        'moveMakesNoValidMoveWhite',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('newGame', () => applyMoveToGameBoard(c.game, c.move)),
            P.Effect.bind('validMovesCount', ({ newGame }) =>
              countValidMovesForColor(newGame.board, f, MorrisColor.WHITE)
            ),
            P.Effect.map(({ validMovesCount }) => R.val(f.moveIsValid) && validMovesCount === 0)
          ),
        'The move will result in no valid moves for white'
      ),
      R.addRuleFuncEffect(
        'moveMakesNoValidMoveBlack',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('newGame', () => applyMoveToGameBoard(c.game, c.move)),
            P.Effect.bind('validMovesCount', ({ newGame }) =>
              countValidMovesForColor(newGame.board, f, MorrisColor.BLACK)
            ),
            P.Effect.map(({ validMovesCount }) => R.val(f.moveIsValid) && validMovesCount === 0)
          ),
        'The move will result in no valid moves for black'
      ),
      R.addRuleFunc(
        'moveMakesWinWhiteMillsMade',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.moveIsValid) &&
          R.val(f.isTurnWhite) &&
          R.val(f.moveMakesMill) &&
          c.game.config.numMillsToWinThreshold === 1,
        'The move is a winning move for white due to mills made'
      ),
      R.addRuleFunc(
        'moveMakesWinWhiteOpponentCount',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.moveIsValid) &&
          R.val(f.isTurnWhite) &&
          c.move.type === MorrisMoveType.REMOVE &&
          c.game.morrisBlack.length === 0 &&
          countMorris(c.game.board, MorrisColor.BLACK) <= c.game.config.numMorrisToLoseThreshold + 1,
        'The move is a winning move for white due to too few white pieces'
      ),
      R.addRuleFunc(
        'moveMakesWinWhiteOpponentNoValidMove',
        (_c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.moveIsValid) && R.val(f.moveMakesNoValidMoveBlack) && R.val(f.moveMakesNextTurnBlack),
        'The move is a winning move for white due to no valid move for black'
      ),
      R.addRuleFunc(
        'moveMakesWinWhite',
        (_c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.moveMakesWinWhiteMillsMade) ||
          R.val(f.moveMakesWinWhiteOpponentCount) ||
          R.val(f.moveMakesWinWhiteOpponentNoValidMove),
        'The move is a winning move for white'
      ),
      R.addRuleFunc(
        'moveMakesWinBlackMillsMade',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.moveIsValid) &&
          R.val(f.isTurnBlack) &&
          R.val(f.moveMakesMill) &&
          c.game.config.numMillsToWinThreshold === 1,
        'The move is a winning move for black due to mills made'
      ),
      R.addRuleFunc(
        'moveMakesWinBlackOpponentCount',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.moveIsValid) &&
          R.val(f.isTurnBlack) &&
          c.move.type === MorrisMoveType.REMOVE &&
          c.game.morrisWhite.length === 0 &&
          countMorris(c.game.board, MorrisColor.WHITE) <= c.game.config.numMorrisToLoseThreshold + 1,
        'The move is a winning move for black due to too few white pieces'
      ),
      R.addRuleFunc(
        'moveMakesWinBlackOpponentNoValidMove',
        (_c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.moveIsValid) && R.val(f.moveMakesNoValidMoveWhite) && R.val(f.moveMakesNextTurnWhite),
        'The move is a winning move for black due to no valid move for black'
      ),
      R.addRuleFunc(
        'moveMakesWinBlack',
        (_c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.moveMakesWinBlackMillsMade) ||
          R.val(f.moveMakesWinBlackOpponentCount) ||
          R.val(f.moveMakesWinBlackOpponentNoValidMove),
        'The move is a winning move for black'
      ),
      R.addRuleFunc(
        'moveMakesWin',
        (_c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.moveMakesWinWhite) || R.val(f.moveMakesWinBlack),
        'The move is a winning move: either for white or black'
      ),
      R.addRuleFunc(
        'moveMakesGameOver',
        (_c: MorrisRulesContextMove<P, D, N>, f: MorrisGameFacts) => R.val(f.moveMakesDraw) || R.val(f.moveMakesWin),
        'The move will result in game over'
      ),
    ])
  );
