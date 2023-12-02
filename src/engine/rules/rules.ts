import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import * as R from '../../lib/tiny-rules-fp';
import { boardHash, countPositionRepeats } from '../board';
import { MorrisColor, MorrisMoveType, MorrisPhase } from '../index';
import { countValidMovesForColor, moveColor, moveMakesMill } from '../moves';
import { countMorris, isPointAdjacent, isPointEmpty } from '../points';
import { applyMoveToGame } from '../tick';
import type { MorrisGameFacts } from './facts';
import { INITIAL_MORRIS_GAME_FACTS } from './facts';
import type { MorrisRulesContext } from './index';

export const Rules = <P extends number, D extends number, N extends number>() =>
  P.pipe(
    R.createRuleSet<MorrisRulesContext<P, D, N>, MorrisGameFacts, MorrisEngineError>(INITIAL_MORRIS_GAME_FACTS),
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
        (c: MorrisRulesContext<P, D, N>, _f: MorrisGameFacts) => c.game.config.phases[0] === MorrisPhase.LASKER,
        'Is in Lasker phase'
      ),
      R.addRuleFunc(
        'isPlacingPhase',
        (c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          !R.val(f.isLaskerPhase) &&
          c.game.moves.filter((i) => i.type === MorrisMoveType.PLACE).length < c.game.config.numMorrisPerPlayer * 2,
        'Is in placing phase'
      ),
      R.addRuleFunc(
        'isMovingPhase',
        (c: MorrisRulesContext<P, D, N>, _f: MorrisGameFacts) =>
          c.game.moves.filter((i) => i.type === MorrisMoveType.PLACE).length === c.game.config.numMorrisPerPlayer * 2,
        'Is in moving phase'
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
        'isRemoveMode',
        (c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          !c.game.gameOver && !R.val(f.isFirstMove) && c.game.lastMillCounter === 0,
        `Is in remove mode for current player: last move was a mill`
      ),
      R.addRuleFuncE<MorrisRulesContext<P, D, N>, MorrisGameFacts, MorrisEngineError>(
        'isMoveCorrectColor',
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
        'isMoveCorrectType',
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
        'isMovePossibleForPlace',
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
        'isMovePossibleForMove',
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
        'isMovePossibleForLasker',
        (_c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.isMovePossibleForPlace) || R.val(f.isMovePossibleForMove),
        'The move is a Lasker move which is possible'
      ),
      R.addRuleFuncE(
        'isMovePossibleForFlying',
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
        'isMovePossible',
        (_c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.isMovePossibleForPlace) ||
          R.val(f.isMovePossibleForMove) ||
          R.val(f.isMovePossibleForLasker) ||
          R.val(f.isMovePossibleForFlying),
        'The move is possible'
      ),
      R.addRuleFunc(
        'isValidMove',
        (c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          !c.game.gameOver && R.val(f.isMoveCorrectColor) && R.val(f.isMoveCorrectType) && R.val(f.isMovePossible),
        'The move is valid: not game over; correct color; correct type for phase; the move is possible'
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
      R.addRuleFuncE(
        'moveMakesDrawPositionRepeatLimit',
        (c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('newGame', () => applyMoveToGame(c.game, c.move)),
            P.Effect.map(
              ({ newGame }) =>
                R.val(f.isValidMove) &&
                countPositionRepeats(c.game, boardHash(newGame.board)) >= c.game.config.numPositionRepeatsForDraw
            )
          ),
        'The move will result in a draw due to the move cycle limit'
      ),
      R.addRuleFunc(
        'moveMakesDrawNoMillsLimit',
        (c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.isValidMove) && c.game.lastMillCounter + 1 >= c.game.config.numMovesWithoutMillForDraw,
        'The move will result in a draw due to move with no mills limit'
      ),
      R.addRuleFunc(
        'moveMakesDraw',
        (_c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.isValidMove) && (R.val(f.moveMakesDrawPositionRepeatLimit) || R.val(f.moveMakesDrawNoMillsLimit)),
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
            P.Effect.map(({ validMovesCount }) => R.val(f.isValidMove) && validMovesCount === 0)
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
            P.Effect.map(({ validMovesCount }) => R.val(f.isValidMove) && validMovesCount === 0)
          ),
        'The move will result in no valid moves for black'
      ),
      R.addRuleFunc(
        'moveMakesWinWhite',
        (_c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.isValidMove) &&
          ((R.val(f.moveMakesMill) && R.val(f.isTurnWhite)) ||
            (R.val(f.moveMakesNoValidMoveBlack) && R.val(f.moveMakesNextTurnBlack))),
        'The move is a winning move for White'
      ),
      R.addRuleFunc(
        'moveMakesWinBlack',
        (_c: MorrisRulesContext<P, D, N>, f: MorrisGameFacts) =>
          R.val(f.isValidMove) &&
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
