import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import * as R from '../../lib/tiny-rules-fp';
import { countMorris } from '../board/points';
import { boardHash, countPositionRepeats } from '../board/query';
import { MorrisColor, MorrisPhase } from '../consts';
import { gameHistoryLen } from '../game';
import { countValidMovesForColor } from '../moves/query';
import type { MorrisFactsGame } from './factsGame';
import { INITIAL_MORRIS_FACTS_GAME } from './factsGame';
import type { MorrisRulesContextGame } from './index';

export const RulesGame = <P extends number, D extends number, N extends number>() =>
  P.pipe(
    R.createRuleSet<never, MorrisRulesContextGame<P, D, N>, MorrisEngineError, MorrisFactsGame>(
      INITIAL_MORRIS_FACTS_GAME
    ),

    // is
    R.sequence([
      R.addRuleFunc(
        'isFirstMove',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) => {
          return gameHistoryLen(c.game) === 0;
        },
        'Is first move'
      ),
      R.addRuleFunc(
        'isSecondMove',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) => gameHistoryLen(c.game) === 1,
        'Is second move'
      ),
      R.addRuleFunc(
        'isTurnWhite',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) => R.val(c.moveFacts.moveMakesNextTurnWhite),
        'Is current turn white'
      ),
      R.addRuleFunc(
        'isTurnBlack',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) => R.val(c.moveFacts.moveMakesNextTurnBlack),
        'Is current turn black'
      ),
      R.addRuleFunc(
        'isLaskerPhase',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) =>
          c.game.config.phases[0] === MorrisPhase.LASKER &&
          c.game.morrisWhite.length > 0 &&
          c.game.morrisBlack.length > 0,
        'Is in Lasker phase: Lasker phase is configured, and not all pieces have been placed'
      ),
      R.addRuleFunc(
        'isPlacingPhase',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) =>
          c.game.config.phases[0] === MorrisPhase.PLACING &&
          (c.game.morrisWhite.length > 0 || c.game.morrisBlack.length > 0),
        'Is in placing phase: not all pieces have been placed'
      ),
      R.addRuleFunc(
        'isMovingPhase',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) =>
          c.game.morrisWhite.length === 0 && c.game.morrisBlack.length === 0,
        'Is in moving phase: all pieces have been placed'
      ),
      R.addRuleFunc(
        'isFlyingPhase',
        (c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          (R.val(f.isTurnWhite) &&
            countMorris(c.game.board, MorrisColor.WHITE) <= c.game.config.numMorrisForFlyingThreshold) ||
          (R.val(f.isTurnBlack) &&
            countMorris(c.game.board, MorrisColor.BLACK) <= c.game.config.numMorrisForFlyingThreshold),
        `Is in flying phase for current player`
      ),
      R.addRuleFunc(
        'isRemoveMode',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) => R.val(c.moveFacts.moveMakesRemoveMode),
        'Is in remove mode for current player: last move was a mill'
      ),
      R.addRuleFunc(
        'isMillMadeWhite',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) => R.val(c.moveFacts.moveMakesMillWhite),
        'The last move was a mill for white'
      ),
      R.addRuleFunc(
        'isMillMadeBlack',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) => R.val(c.moveFacts.moveMakesMillBlack),
        'The last move was a mill for black'
      ),
      R.addRuleFunc(
        'isMillMade',
        (_c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          R.val(f.isMillMadeWhite) || R.val(f.isMillMadeBlack),
        'The last move was a mill'
      ),
      R.addRuleFunc(
        'isDrawPositionRepeatLimit',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) =>
          countPositionRepeats(c.game, boardHash(c.game.board)) >= c.game.config.numPositionRepeatsForDraw,
        'The result is a draw due to the move cycle limit'
      ),
      R.addRuleFunc(
        'isDrawNoMillsLimit',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) =>
          c.game.lastMillCounter + 1 >= c.game.config.numMovesWithoutMillForDraw,
        'The result is a draw due to move with no mills limit'
      ),
      R.addRuleFunc(
        'isDraw',
        (_c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          R.val(f.isDrawPositionRepeatLimit) || R.val(f.isDrawNoMillsLimit),
        'The move will result in a draw'
      ),
      R.addRuleFuncEffect(
        'isNoValidMoveWhite',
        (c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          R.val(f.isTurnWhite)
            ? P.pipe(
                countValidMovesForColor(c.game, f, MorrisColor.WHITE),
                P.Effect.map((validMovesCount) => validMovesCount === 0)
              )
            : // If it is not white turn, then valid moves is irrelevant
              P.Effect.succeed(false),
        'There is no valid moves for white'
      ),
      R.addRuleFuncEffect(
        'isNoValidMoveBlack',
        (c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          R.val(f.isTurnBlack)
            ? P.pipe(
                countValidMovesForColor(c.game, f, MorrisColor.BLACK),
                P.Effect.map((validMovesCount) => validMovesCount === 0)
              ) // If it is not black turn, then valid moves is irrelevant
            : P.Effect.succeed(false),
        'There is no valid moves for black'
      ),
      R.addRuleFunc(
        'isWinWhiteMillsMade',
        (c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          R.val(f.isMillMadeWhite) && c.game.config.numMillsToWinThreshold === 1,
        'The result is a win for white due to mills made'
      ),
      R.addRuleFunc(
        'isWinWhiteOpponentCount',
        (c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          R.val(f.isTurnWhite) &&
          c.game.morrisBlack.length === 0 &&
          countMorris(c.game.board, MorrisColor.BLACK) < c.game.config.numMorrisToLoseThreshold + 1,
        'The result is a win for white due to too few black pieces'
      ),
      R.addRuleFunc(
        'isWinWhiteOpponentNoValidMove',
        (c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          R.val(f.isNoValidMoveBlack) && R.val(c.moveFacts.moveMakesNextTurnBlack),
        'The result is a win for white due to no valid move for black'
      ),
      R.addRuleFunc(
        'isWinWhite',
        (_c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          R.val(f.isWinWhiteMillsMade) || R.val(f.isWinWhiteOpponentCount) || R.val(f.isWinWhiteOpponentNoValidMove),
        'The result is a win for white'
      ),
      R.addRuleFunc(
        'isWinBlackMillsMade',
        (c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          R.val(f.isMillMadeBlack) && c.game.config.numMillsToWinThreshold === 1,
        'The result is a win for black due to mills made'
      ),
      R.addRuleFunc(
        'isWinBlackOpponentCount',
        (c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          R.val(f.isTurnBlack) &&
          c.game.morrisBlack.length === 0 &&
          countMorris(c.game.board, MorrisColor.WHITE) < c.game.config.numMorrisToLoseThreshold + 1,
        'The result is a win for black due to too few black pieces'
      ),
      R.addRuleFunc(
        'isWinBlackOpponentNoValidMove',
        (c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          R.val(f.isNoValidMoveWhite) && R.val(c.moveFacts.moveMakesNextTurnWhite),
        'The result is a win for black due to no valid move for black'
      ),
      R.addRuleFunc(
        'isWinBlack',
        (_c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          R.val(f.isWinBlackMillsMade) || R.val(f.isWinBlackOpponentCount) || R.val(f.isWinBlackOpponentNoValidMove),
        'The result is a win for black'
      ),
      R.addRuleFunc(
        'isWin',
        (_c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) => R.val(f.isWinWhite) || R.val(f.isWinBlack),
        'The move is a winning move: either for white or black'
      ),
      R.addRuleFunc(
        'isGameOver',
        (_c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) => R.val(f.isDraw) || R.val(f.isWin),
        'The move will result in game over'
      ),
    ])
  );
