import * as P from '@konker.dev/effect-ts-prelude';
import * as R from '@konker.dev/tiny-rules-fp';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import { boardIsPointAdjacent, boardIsPointEmpty } from '../board/points';
import { boardCountMorrisByColor } from '../board/query';
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
                (c.gameTick.facts.isTurnWhite && moveColor === MorrisColor.WHITE) ||
                (c.gameTick.facts.isTurnBlack && moveColor === MorrisColor.BLACK)
            ),
            P.Effect.orElseSucceed(() => false)
          ),
        'The move is of the correct color'
      ),
      R.addRuleFunc(
        'moveIsCorrectType',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          (c.gameTick.facts.isRemoveMode && c.move.type === MorrisMoveType.REMOVE) ||
          (!c.gameTick.facts.isRemoveMode && c.gameTick.facts.isPlacingPhase && c.move.type === MorrisMoveType.PLACE) ||
          (!c.gameTick.facts.isRemoveMode && c.gameTick.facts.isMovingPhase && c.move.type === MorrisMoveType.MOVE) ||
          (!c.gameTick.facts.isRemoveMode &&
            c.gameTick.facts.isLaskerPhase &&
            (c.move.type === MorrisMoveType.PLACE || c.move.type === MorrisMoveType.MOVE)),
        'The move is of the correct type for the phase'
      ),
      R.addRuleFunc(
        'moveIsForbiddenOnFirstMove',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          c.gameTick.facts.isFirstMove &&
          c.move.type === MorrisMoveType.PLACE &&
          c.gameTick.game.gameState.config.forbiddenPointsFirstMove.includes(c.move.to),
        'The move is forbidden on the first move'
      ),
      R.addRuleFunc(
        'moveIsForbiddenOnSecondMove',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          c.gameTick.facts.isSecondMove &&
          c.move.type === MorrisMoveType.PLACE &&
          c.gameTick.game.gameState.config.forbiddenPointsFirstMove.includes(c.move.to),
        'The move is forbidden on the second move'
      ),
      R.addRuleFunc(
        'moveIsForbiddenInPlacingPhase',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          !c.gameTick.facts.isRemoveMode &&
          (c.gameTick.facts.isPlacingPhase || c.gameTick.facts.isLaskerPhase) &&
          (c.move.type === MorrisMoveType.PLACE || c.move.type === MorrisMoveType.MOVE) &&
          c.gameTick.game.gameState.config.forbiddenPointsPlacingPhase.includes(c.move.to),
        'The move is forbidden in placing phase'
      ),
      R.addRuleFuncEffect(
        'moveIsPossibleForPlace',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('isPointEmptyTo', () =>
              c.move.type === MorrisMoveType.PLACE
                ? boardIsPointEmpty(c.gameTick.game.gameState.board, c.move.to)
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
                ? boardIsPointEmpty(c.gameTick.game.gameState.board, c.move.from)
                : P.Effect.succeed(false)
            ),
            P.Effect.bind('isPointEmptyTo', () =>
              c.move.type === MorrisMoveType.MOVE
                ? boardIsPointEmpty(c.gameTick.game.gameState.board, c.move.to)
                : P.Effect.succeed(false)
            ),
            P.Effect.bind('isPointAdjacentFromTo', () =>
              c.move.type === MorrisMoveType.MOVE
                ? boardIsPointAdjacent(c.gameTick.game.gameState.board, c.move.from, c.move.to)
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
                ? boardIsPointEmpty(c.gameTick.game.gameState.board, c.move.from)
                : P.Effect.succeed(false)
            ),
            P.Effect.map(
              ({ isPointEmptyFrom }) =>
                c.gameTick.facts.isRemoveMode && c.move.type === MorrisMoveType.REMOVE && !isPointEmptyFrom
            )
          ),
        'The move is a flying move which is possible'
      ),
      R.addRuleFunc(
        'moveIsPossibleForLasker',
        (_c: MorrisRulesContextMove<P, D, N>, f: MorrisFactsMove) =>
          f.moveIsPossibleForPlace || f.moveIsPossibleForMove,
        'The move is a Lasker move which is possible'
      ),
      R.addRuleFuncEffect(
        'moveIsPossibleForFlying',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('isPointEmptyTo', () =>
              c.move.type === MorrisMoveType.MOVE
                ? boardIsPointEmpty(c.gameTick.game.gameState.board, c.move.to)
                : P.Effect.succeed(false)
            ),
            P.Effect.map(
              ({ isPointEmptyTo }) =>
                c.gameTick.facts.isFlyingPhase && c.move.type === MorrisMoveType.MOVE && isPointEmptyTo
            )
          ),
        'The move is a flying move which is possible'
      ),
      R.addRuleFunc(
        'moveIsPossible',
        (_c: MorrisRulesContextMove<P, D, N>, f: MorrisFactsMove) =>
          !f.moveIsForbiddenOnFirstMove &&
          !f.moveIsForbiddenOnSecondMove &&
          !f.moveIsForbiddenInPlacingPhase &&
          (f.moveIsPossibleForPlace ||
            f.moveIsPossibleForMove ||
            f.moveIsPossibleForRemove ||
            f.moveIsPossibleForLasker ||
            f.moveIsPossibleForFlying),
        'The move is possible'
      ),
      R.addRuleFunc(
        'moveIsValid',
        (_c: MorrisRulesContextMove<P, D, N>, f: MorrisFactsMove) =>
          f.moveIsCorrectColor && f.moveIsCorrectType && f.moveIsPossible,
        'The move is valid: not game over; correct color; correct type for phase; the move is possible'
      ),

      // move makes
      R.addRuleFuncEffect(
        'moveMakesMillWhite',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          P.pipe(
            moveMakesMill(c.gameTick.game, c.move),
            P.Effect.map((makesMill) => makesMill && c.gameTick.facts.isTurnWhite),
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
            P.Effect.map((makesMill) => makesMill && c.gameTick.facts.isTurnBlack),
            P.Effect.orElseSucceed(() => false),
            P.Effect.mapError(toMorrisEngineError)
          ),
        'The move will make a mill for black'
      ),
      R.addRuleFunc(
        'moveMakesMill',
        (_c: MorrisRulesContextMove<P, D, N>, f: MorrisFactsMove) => f.moveMakesMillWhite || f.moveMakesMillBlack,
        'The move will make a mill'
      ),
      R.addRuleFunc(
        'moveMakesRemoveMode',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisFactsMove) =>
          f.moveMakesMill && c.gameTick.game.gameState.config.numMillsToWinThreshold > 1,
        'Next turn is remove: the move makes a mill'
      ),
      R.addRuleFunc(
        'moveMakesNextTurnWhite',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisFactsMove) =>
          (c.gameTick.facts.isTurnBlack && !f.moveMakesRemoveMode) ||
          (c.gameTick.facts.isTurnWhite && f.moveMakesRemoveMode),
        'Next turn is white: this turn is black and the next move is not remove'
      ),
      R.addRuleFunc(
        'moveMakesNextTurnBlack',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisFactsMove) =>
          (c.gameTick.facts.isTurnWhite && !f.moveMakesRemoveMode) ||
          (c.gameTick.facts.isTurnBlack && f.moveMakesRemoveMode),
        'Next turn is black: this turn is white and the next move is not remove'
      ),
      R.addRuleFunc(
        'moveMakesLaskerPhase',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisFactsMove) =>
          !f.moveMakesRemoveMode &&
          c.gameTick.game.gameState.config.phases[0] === MorrisPhase.LASKER &&
          c.gameTick.game.gameState.morrisWhite.length > 1 &&
          c.gameTick.game.gameState.morrisBlack.length > 1,
        'Next turn is Lasker phase'
      ),
      R.addRuleFunc(
        'moveMakesFlyingPhase',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          (c.gameTick.facts.isRemoveMode &&
            ((c.gameTick.facts.isTurnWhite &&
              boardCountMorrisByColor(c.gameTick.game.gameState.board, MorrisColor.BLACK) ===
                c.gameTick.game.gameState.config.numMorrisForFlyingThreshold + 1) ||
              (c.gameTick.facts.isTurnBlack &&
                boardCountMorrisByColor(c.gameTick.game.gameState.board, MorrisColor.WHITE) ===
                  c.gameTick.game.gameState.config.numMorrisForFlyingThreshold + 1))) ||
          (!c.gameTick.facts.isRemoveMode &&
            ((c.gameTick.facts.isTurnWhite &&
              boardCountMorrisByColor(c.gameTick.game.gameState.board, MorrisColor.BLACK) <=
                c.gameTick.game.gameState.config.numMorrisForFlyingThreshold) ||
              (c.gameTick.facts.isTurnBlack &&
                boardCountMorrisByColor(c.gameTick.game.gameState.board, MorrisColor.WHITE) <=
                  c.gameTick.game.gameState.config.numMorrisForFlyingThreshold))),
        'Next turn is flying phase'
      ),
      R.addRuleFunc(
        'moveMakesPlacingPhase',
        (c: MorrisRulesContextMove<P, D, N>, f: MorrisFactsMove) =>
          (!f.moveMakesRemoveMode &&
            c.gameTick.facts.isTurnWhite &&
            c.gameTick.game.gameState.morrisWhite.length >= 1 &&
            c.gameTick.game.gameState.morrisBlack.length > 0) ||
          (!f.moveMakesRemoveMode &&
            c.gameTick.facts.isTurnBlack &&
            c.gameTick.game.gameState.morrisBlack.length >= 1 &&
            c.gameTick.game.gameState.morrisWhite.length > 0),
        'Next turn is placing phase'
      ),
      R.addRuleFunc(
        'moveMakesMovingPhase',
        (c: MorrisRulesContextMove<P, D, N>, _f: MorrisFactsMove) =>
          (c.gameTick.facts.isTurnWhite &&
            c.gameTick.game.gameState.morrisWhite.length <= 1 &&
            c.gameTick.game.gameState.morrisBlack.length === 0) ||
          (c.gameTick.facts.isTurnBlack &&
            c.gameTick.game.gameState.morrisBlack.length <= 1 &&
            c.gameTick.game.gameState.morrisWhite.length === 0),
        'Next turn is moving phase'
      ),
    ])
  );
