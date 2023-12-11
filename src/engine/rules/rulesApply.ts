import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import * as R from '../../lib/tiny-rules-fp';
import type { MorrisGameFacts } from './facts';
import { INITIAL_MORRIS_GAME_FACTS } from './facts';
import type { MorrisRulesContextApply } from './index';

export const RulesApply = () =>
  P.pipe(
    R.createRuleSet<never, MorrisRulesContextApply, MorrisEngineError, MorrisGameFacts>(INITIAL_MORRIS_GAME_FACTS),

    // Derive new "is" facts from given "makes" facts
    R.sequence([
      R.addRuleFunc(
        'isFirstMove',
        (_c: MorrisRulesContextApply, f: MorrisGameFacts) => {
          return R.val(f.isFirstMove);
        },
        'Is first move'
      ),
      R.addRuleFunc(
        'isTurnWhite',
        (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesNextTurnWhite),
        'Is current turn White'
      ),
      R.addRuleFunc(
        'isTurnBlack',
        (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesNextTurnBlack),
        'Is current turn Black'
      ),
      R.addRuleFunc(
        'isLaskerPhase',
        (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesLaskerPhase),
        'Is in Lasker phase: Lasker phase is configured, and not all pieces have been placed'
      ),
      R.addRuleFunc(
        'isPlacingPhase',
        (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesPlacingPhase),
        'Is in placing phase: not all pieces have been placed'
      ),
      R.addRuleFunc(
        'isMovingPhase',
        (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesMovingPhase),
        'Is in moving phase: all pieces have been placed'
      ),
      R.addRuleFunc(
        'isFlyingPhase',
        (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesFlyingPhase),
        `Is in flying phase for current player`
      ),
      R.addRuleFunc(
        'isRemoveMode',
        (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesRemoveMode),
        'Is in remove mode for current player: last move was a mill'
      ),
      R.addRuleFunc(
        'isNoValidMoveWhite',
        (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesNoValidMoveWhite),
        'No valid move possible for white'
      ),
      R.addRuleFunc(
        'isNoValidMoveBlack',
        (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesNoValidMoveBlack),
        'No valid move possible for black'
      ),
      R.addRuleFunc(
        'isWinWhiteMillsMade',
        (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesWinWhiteMillsMade),
        'Win for white due to mills made'
      ),
      R.addRuleFunc(
        'isWinWhiteOpponentCount',
        (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesWinWhiteOpponentCount),
        'Win for white due to too few opponent pieces'
      ),
      R.addRuleFunc(
        'isWinWhiteOpponentNoValidMove',
        (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesWinWhiteOpponentNoValidMove),
        'Win for white due to opponent blocked'
      ),
      R.addRuleFunc(
        'isWinWhite',
        (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesWinWhite),
        'Win for white'
      ),
      R.addRuleFunc(
        'isWinBlackMillsMade',
        (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesWinBlackMillsMade),
        'Win for black due to mills made'
      ),
      R.addRuleFunc(
        'isWinBlackOpponentCount',
        (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesWinBlackOpponentCount),
        'Win for black due to too few opponent pieces'
      ),
      R.addRuleFunc(
        'isWinBlackOpponentNoValidMove',
        (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesWinBlackOpponentNoValidMove),
        'Win for black due to opponent blocked'
      ),
      R.addRuleFunc(
        'isWinBlack',
        (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesWinBlack),
        'Win for black'
      ),
      R.addRuleFunc('isWin', (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesWin), 'Win'),
      R.addRuleFunc(
        'isDrawPositionRepeatLimit',
        (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesDrawPositionRepeatLimit),
        'Draw: position repeated too often'
      ),
      R.addRuleFunc(
        'isDrawNoMillsLimit',
        (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesDrawNoMillsLimit),
        'Draw: too many moves without a mill'
      ),
      R.addRuleFunc('isDraw', (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesDraw), 'Draw'),
      R.addRuleFunc(
        'isGameOver',
        (_c: MorrisRulesContextApply, f: MorrisGameFacts) => R.val(f.moveMakesGameOver),
        'Game over'
      ),
    ])
  );
