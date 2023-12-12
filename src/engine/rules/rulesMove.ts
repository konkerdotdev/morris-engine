import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import * as R from '../../lib/tiny-rules-fp';
import { countMorris, isPointAdjacent, isPointEmpty } from '../board/points';
import { MorrisColor, MorrisMoveType, MorrisPhase } from '../consts';
import { moveColor } from '../moves';
import { moveMakesMill } from '../moves/query';
import type { MorrisFactsMove } from './factsMove';
import { INITIAL_MORRIS_FACTS_MOVE } from './factsMove';
import type { MorrisRulesContextMove } from './index';

export const RulesMove = <P extends number, D extends number, N extends number>() =>
  P.pipe(
    R.createRuleSet<never, MorrisRulesContextMove<P, D, N>, MorrisEngineError, MorrisFactsMove>(
      INITIAL_MORRIS_FACTS_MOVE
    ),

    R.sequence([
      // move is
      R.addRuleFuncEffect<never, MorrisRulesContextMove<P, D, N>, MorrisEngineError, MorrisFactsMove>(
        'moveIsCorrectColor',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('moveColor', () => moveColor(c.gameTick.game, c.move)),
            P.Effect.map(
              ({ moveColor }) =>
                (R.val(c.gameTick.facts.isTurnWhite) && moveColor === MorrisColor.WHITE) ||
                (R.val(c.gameTick.facts.isTurnBlack) && moveColor === MorrisColor.BLACK)
            ),
            P.Effect.orElseSucceed(() => false)
          ),
        'The move is of the correct color'
      ),
      R.addRuleFunc(
        'moveIsCorrectType',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          (R.val(c.gameTick.facts.isRemoveMode) && c.move.type === MorrisMoveType.REMOVE) ||
          (!R.val(c.gameTick.facts.isRemoveMode) &&
            R.val(c.gameTick.facts.isPlacingPhase) &&
            c.move.type === MorrisMoveType.PLACE) ||
          (!R.val(c.gameTick.facts.isRemoveMode) &&
            R.val(c.gameTick.facts.isMovingPhase) &&
            c.move.type === MorrisMoveType.MOVE) ||
          (!R.val(c.gameTick.facts.isRemoveMode) &&
            R.val(c.gameTick.facts.isLaskerPhase) &&
            (c.move.type === MorrisMoveType.PLACE || c.move.type === MorrisMoveType.MOVE)),
        'The move is of the correct type for the phase'
      ),
      R.addRuleFunc(
        'moveIsForbiddenOnFirstMove',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          R.val(c.gameTick.facts.isFirstMove) &&
          c.move.type === MorrisMoveType.PLACE &&
          c.gameTick.game.config.forbiddenPointsFirstMove.includes(c.move.to),
        'The move is forbidden on the first move'
      ),
      R.addRuleFunc(
        'moveIsForbiddenOnSecondMove',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          R.val(c.gameTick.facts.isSecondMove) &&
          c.move.type === MorrisMoveType.PLACE &&
          c.gameTick.game.config.forbiddenPointsFirstMove.includes(c.move.to),
        'The move is forbidden on the second move'
      ),
      R.addRuleFunc(
        'moveIsForbiddenInPlacingPhase',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          !R.val(c.gameTick.facts.isRemoveMode) &&
          (R.val(c.gameTick.facts.isPlacingPhase) || R.val(c.gameTick.facts.isLaskerPhase)) &&
          (c.move.type === MorrisMoveType.PLACE || c.move.type === MorrisMoveType.MOVE) &&
          c.gameTick.game.config.forbiddenPointsPlacingPhase.includes(c.move.to),
        'The move is forbidden in placing phase'
      ),
      R.addRuleFuncEffect(
        'moveIsPossibleForPlace',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('isPointEmptyTo', () =>
              c.move.type === MorrisMoveType.PLACE
                ? isPointEmpty(c.gameTick.game.board, c.move.to)
                : P.Effect.succeed(false)
            ),
            P.Effect.map(({ isPointEmptyTo }) => c.move.type === MorrisMoveType.PLACE && isPointEmptyTo)
          ),
        'The move is a place move which is possible'
      ),
      R.addRuleFuncEffect(
        'moveIsPossibleForMove',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('isPointEmptyFrom', () =>
              c.move.type === MorrisMoveType.MOVE
                ? isPointEmpty(c.gameTick.game.board, c.move.from)
                : P.Effect.succeed(false)
            ),
            P.Effect.bind('isPointEmptyTo', () =>
              c.move.type === MorrisMoveType.MOVE
                ? isPointEmpty(c.gameTick.game.board, c.move.to)
                : P.Effect.succeed(false)
            ),
            P.Effect.bind('isPointAdjacentFromTo', () =>
              c.move.type === MorrisMoveType.MOVE
                ? isPointAdjacent(c.gameTick.game.board, c.move.from, c.move.to)
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
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('isPointEmptyFrom', () =>
              c.move.type === MorrisMoveType.REMOVE
                ? isPointEmpty(c.gameTick.game.board, c.move.from)
                : P.Effect.succeed(false)
            ),
            P.Effect.map(
              ({ isPointEmptyFrom }) =>
                R.val(c.gameTick.facts.isRemoveMode) && c.move.type === MorrisMoveType.REMOVE && !isPointEmptyFrom
            )
          ),
        'The move is a flying move which is possible'
      ),
      R.addRuleFunc(
        'moveIsPossibleForLasker',
        (_c: MorrisRulesContextMove<P, D, N>, f: MorrisFactsMove) =>
          R.val(f.moveIsPossibleForPlace) || R.val(f.moveIsPossibleForMove),
        'The move is a Lasker move which is possible'
      ),
      R.addRuleFuncEffect(
        'moveIsPossibleForFlying',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('isPointEmptyTo', () =>
              c.move.type === MorrisMoveType.MOVE
                ? isPointEmpty(c.gameTick.game.board, c.move.to)
                : P.Effect.succeed(false)
            ),
            P.Effect.map(
              ({ isPointEmptyTo }) =>
                R.val(c.gameTick.facts.isFlyingPhase) && c.move.type === MorrisMoveType.MOVE && isPointEmptyTo
            )
          ),
        'The move is a flying move which is possible'
      ),
      R.addRuleFunc(
        'moveIsPossible',
        (_c: MorrisRulesContextMove<P, D, N>, f: MorrisFactsMove) =>
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
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisFactsMove) =>
          !c.gameTick.game.gameOver &&
          R.val(f.moveIsCorrectColor) &&
          R.val(f.moveIsCorrectType) &&
          R.val(f.moveIsPossible),
        'The move is valid: not game over; correct color; correct type for phase; the move is possible'
      ),

      // move makes
      R.addRuleFuncEffect(
        'moveMakesMillWhite',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          P.pipe(
            moveMakesMill(c.gameTick.game, c.move),
            P.Effect.map((makesMill) => makesMill && R.val(c.gameTick.facts.isTurnWhite)),
            P.Effect.orElseSucceed(() => false),
            P.Effect.mapError(toMorrisEngineError)
          ),
        'The move will make a mill for white'
      ),
      R.addRuleFuncEffect(
        'moveMakesMillBlack',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          P.pipe(
            moveMakesMill(c.gameTick.game, c.move),
            P.Effect.map((makesMill) => makesMill && R.val(c.gameTick.facts.isTurnBlack)),
            P.Effect.orElseSucceed(() => false),
            P.Effect.mapError(toMorrisEngineError)
          ),
        'The move will make a mill for black'
      ),
      R.addRuleFunc(
        'moveMakesMill',
        (_c: MorrisRulesContextMove<P, D, N>, f: MorrisFactsMove) =>
          R.val(f.moveMakesMillWhite) || R.val(f.moveMakesMillBlack),
        'The move will make a mill'
      ),
      R.addRuleFunc(
        'moveMakesRemoveMode',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisFactsMove) =>
          R.val(f.moveMakesMill) && c.gameTick.game.config.numMillsToWinThreshold > 1,
        'Next turn is remove: the move makes a mill'
      ),
      R.addRuleFunc(
        'moveMakesNextTurnWhite',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisFactsMove) =>
          (R.val(c.gameTick.facts.isTurnBlack) && !R.val(f.moveMakesRemoveMode)) ||
          (R.val(c.gameTick.facts.isTurnWhite) && R.val(f.moveMakesRemoveMode)),
        'Next turn is white: this turn is black and the next move is not remove'
      ),
      R.addRuleFunc(
        'moveMakesNextTurnBlack',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisFactsMove) =>
          (R.val(c.gameTick.facts.isTurnWhite) && !R.val(f.moveMakesRemoveMode)) ||
          (R.val(c.gameTick.facts.isTurnBlack) && R.val(f.moveMakesRemoveMode)),
        'Next turn is black: this turn is white and the next move is not remove'
      ),
      R.addRuleFunc(
        'moveMakesLaskerPhase',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisFactsMove) =>
          !R.val(f.moveMakesRemoveMode) &&
          c.gameTick.game.config.phases[0] === MorrisPhase.LASKER &&
          c.gameTick.game.morrisWhite.length > 1 &&
          c.gameTick.game.morrisBlack.length > 1,
        'Next turn is Lasker phase'
      ),
      R.addRuleFunc(
        'moveMakesFlyingPhase',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          (R.val(c.gameTick.facts.isRemoveMode) &&
            ((R.val(c.gameTick.facts.isTurnWhite) &&
              countMorris(c.gameTick.game.board, MorrisColor.BLACK) ===
                c.gameTick.game.config.numMorrisForFlyingThreshold + 1) ||
              (R.val(c.gameTick.facts.isTurnBlack) &&
                countMorris(c.gameTick.game.board, MorrisColor.WHITE) ===
                  c.gameTick.game.config.numMorrisForFlyingThreshold + 1))) ||
          (!R.val(c.gameTick.facts.isRemoveMode) &&
            ((R.val(c.gameTick.facts.isTurnWhite) &&
              countMorris(c.gameTick.game.board, MorrisColor.BLACK) <=
                c.gameTick.game.config.numMorrisForFlyingThreshold) ||
              (R.val(c.gameTick.facts.isTurnBlack) &&
                countMorris(c.gameTick.game.board, MorrisColor.WHITE) <=
                  c.gameTick.game.config.numMorrisForFlyingThreshold))),
        'Next turn is flying phase'
      ),
      R.addRuleFunc(
        'moveMakesPlacingPhase',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisFactsMove) =>
          (!R.val(f.moveMakesRemoveMode) &&
            R.val(c.gameTick.facts.isTurnWhite) &&
            c.gameTick.game.morrisWhite.length >= 1 &&
            c.gameTick.game.morrisBlack.length > 0) ||
          (!R.val(f.moveMakesRemoveMode) &&
            R.val(c.gameTick.facts.isTurnBlack) &&
            c.gameTick.game.morrisBlack.length >= 1 &&
            c.gameTick.game.morrisWhite.length > 0),
        'Next turn is placing phase'
      ),
      R.addRuleFunc(
        'moveMakesMovingPhase',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          (R.val(c.gameTick.facts.isTurnWhite) &&
            c.gameTick.game.morrisWhite.length <= 1 &&
            c.gameTick.game.morrisBlack.length === 0) ||
          (R.val(c.gameTick.facts.isTurnBlack) &&
            c.gameTick.game.morrisBlack.length <= 1 &&
            c.gameTick.game.morrisWhite.length === 0),
        'Next turn is moving phase'
      ),
    ])
  );
