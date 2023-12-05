import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import * as R from '../../lib/tiny-rules-fp';
import type { MorrisGameFacts } from './facts';
import { INITIAL_MORRIS_GAME_FACTS } from './facts';
import type { MorrisRulesContextApply } from './index';

export const RulesApply = () =>
  P.pipe(
    R.createRuleSet<MorrisRulesContextApply, MorrisEngineError, MorrisGameFacts>(INITIAL_MORRIS_GAME_FACTS),

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
    ])
  );
