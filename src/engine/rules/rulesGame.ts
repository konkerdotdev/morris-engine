import * as P from '@konker.dev/effect-ts-prelude';
import * as R from '@konker.dev/tiny-rules-fp';

import type { MorrisEngineError } from '../../lib/error';
import { boardHash } from '../board';
import { boardCountMorrisByColor, boardCountPositionRepeats } from '../board/query';
import { MorrisColor, MorrisPhase } from '../consts';
import { gameHistoryLen } from '../game/history';
import { moveCountValidMovesForColor } from '../moves/query';
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
          return gameHistoryLen(c.game.gameState.history) === 0;
        },
        'Is first move'
      ),
      R.addRuleFunc(
        'isSecondMove',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) => gameHistoryLen(c.game.gameState.history) === 1,
        'Is second move'
      ),
      R.addRuleFunc(
        'isTurnWhite',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) => c.moveFacts.moveMakesNextTurnWhite,
        'Is current turn white'
      ),
      R.addRuleFunc(
        'isTurnBlack',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) => c.moveFacts.moveMakesNextTurnBlack,
        'Is current turn black'
      ),
      R.addRuleFunc(
        'isLaskerPhase',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) =>
          c.game.gameState.config.phases[0] === MorrisPhase.LASKER &&
          c.game.gameState.morrisWhite.length > 0 &&
          c.game.gameState.morrisBlack.length > 0,
        'Is in Lasker phase: Lasker phase is configured, and not all pieces have been placed'
      ),
      R.addRuleFunc(
        'isPlacingPhase',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) =>
          c.game.gameState.config.phases[0] === MorrisPhase.PLACING &&
          (c.game.gameState.morrisWhite.length > 0 || c.game.gameState.morrisBlack.length > 0),
        'Is in placing phase: not all pieces have been placed'
      ),
      R.addRuleFunc(
        'isMovingPhase',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) =>
          c.game.gameState.morrisWhite.length === 0 && c.game.gameState.morrisBlack.length === 0,
        'Is in moving phase: all pieces have been placed'
      ),
      R.addRuleFunc(
        'isFlyingPhase',
        (c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          (f.isTurnWhite &&
            boardCountMorrisByColor(c.game.gameState.board, MorrisColor.WHITE) <=
              c.game.gameState.config.numMorrisForFlyingThreshold) ||
          (f.isTurnBlack &&
            boardCountMorrisByColor(c.game.gameState.board, MorrisColor.BLACK) <=
              c.game.gameState.config.numMorrisForFlyingThreshold),
        `Is in flying phase for current player`
      ),
      R.addRuleFunc(
        'isRemoveMode',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) => c.moveFacts.moveMakesRemoveMode,
        'Is in remove mode for current player: last move was a mill'
      ),
      R.addRuleFunc(
        'isMillMadeWhite',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) => c.moveFacts.moveMakesMillWhite,
        'The last move was a mill for white'
      ),
      R.addRuleFunc(
        'isMillMadeBlack',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) => c.moveFacts.moveMakesMillBlack,
        'The last move was a mill for black'
      ),
      R.addRuleFunc(
        'isMillMade',
        (_c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) => f.isMillMadeWhite || f.isMillMadeBlack,
        'The last move was a mill'
      ),
      R.addRuleFunc(
        'isDrawPositionRepeatLimit',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) =>
          boardCountPositionRepeats(c.game, boardHash(c.game.gameState.board)) >=
          c.game.gameState.config.numPositionRepeatsForDraw,
        'The result is a draw due to the move cycle limit'
      ),
      R.addRuleFunc(
        'isDrawNoMillsLimit',
        (c: MorrisRulesContextGame<P, D, N>, _f: MorrisFactsGame) =>
          c.game.gameState.lastMillCounter + 1 >= c.game.gameState.config.numMovesWithoutMillForDraw,
        'The result is a draw due to move with no mills limit'
      ),
      R.addRuleFunc(
        'isDraw',
        (_c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          f.isDrawPositionRepeatLimit || f.isDrawNoMillsLimit,
        'The move will result in a draw'
      ),
      R.addRuleFuncEffect(
        'isNoValidMoveWhite',
        (c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          f.isTurnWhite
            ? P.pipe(
                moveCountValidMovesForColor(c.game, f, MorrisColor.WHITE),
                P.Effect.map((validMovesCount) => validMovesCount === 0)
              )
            : // If it is not white turn, then valid moves is irrelevant
              P.Effect.succeed(false),
        'There is no valid moves for white'
      ),
      R.addRuleFuncEffect(
        'isNoValidMoveBlack',
        (c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          f.isTurnBlack
            ? P.pipe(
                moveCountValidMovesForColor(c.game, f, MorrisColor.BLACK),
                P.Effect.map((validMovesCount) => validMovesCount === 0)
              ) // If it is not black turn, then valid moves is irrelevant
            : P.Effect.succeed(false),
        'There is no valid moves for black'
      ),
      R.addRuleFunc(
        'isWinWhiteMillsMade',
        (c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          f.isMillMadeWhite && c.game.gameState.config.numMillsToWinThreshold === 1,
        'The result is a win for white due to mills made'
      ),
      R.addRuleFunc(
        'isWinWhiteOpponentCount',
        (c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          f.isTurnWhite &&
          c.game.gameState.morrisBlack.length === 0 &&
          boardCountMorrisByColor(c.game.gameState.board, MorrisColor.BLACK) <
            c.game.gameState.config.numMorrisToLoseThreshold + 1,
        'The result is a win for white due to too few black pieces'
      ),
      R.addRuleFunc(
        'isWinWhiteOpponentNoValidMove',
        (c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          f.isNoValidMoveBlack && c.moveFacts.moveMakesNextTurnBlack,
        'The result is a win for white due to no valid move for black'
      ),
      R.addRuleFunc(
        'isWinWhite',
        (_c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          f.isWinWhiteMillsMade || f.isWinWhiteOpponentCount || f.isWinWhiteOpponentNoValidMove,
        'The result is a win for white'
      ),
      R.addRuleFunc(
        'isWinBlackMillsMade',
        (c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          f.isMillMadeBlack && c.game.gameState.config.numMillsToWinThreshold === 1,
        'The result is a win for black due to mills made'
      ),
      R.addRuleFunc(
        'isWinBlackOpponentCount',
        (c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          f.isTurnBlack &&
          c.game.gameState.morrisBlack.length === 0 &&
          boardCountMorrisByColor(c.game.gameState.board, MorrisColor.WHITE) <
            c.game.gameState.config.numMorrisToLoseThreshold + 1,
        'The result is a win for black due to too few black pieces'
      ),
      R.addRuleFunc(
        'isWinBlackOpponentNoValidMove',
        (c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          f.isNoValidMoveWhite && c.moveFacts.moveMakesNextTurnWhite,
        'The result is a win for black due to no valid move for black'
      ),
      R.addRuleFunc(
        'isWinBlack',
        (_c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) =>
          f.isWinBlackMillsMade || f.isWinBlackOpponentCount || f.isWinBlackOpponentNoValidMove,
        'The result is a win for black'
      ),
      R.addRuleFunc(
        'isWin',
        (_c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) => f.isWinWhite || f.isWinBlack,
        'The move is a winning move: either for white or black'
      ),
      R.addRuleFunc(
        'isGameOver',
        (_c: MorrisRulesContextGame<P, D, N>, f: MorrisFactsGame) => f.isDraw || f.isWin,
        'The move will result in game over'
      ),
    ])
  );
