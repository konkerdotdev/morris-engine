import * as P from '@konker.dev/effect-ts-prelude';

import type { MENS_MORRIS_D_3, MENS_MORRIS_N_3, MENS_MORRIS_P_3 } from './boards';
import { isPointAdjacent, isPointEmpty, isTurn, moveMakesMill } from './functions';
import type { MorrisGame, MorrisMove } from './index';
import { MorrisColor, MorrisMoveType } from './index';
import * as R from './lib/tiny-rules-fp';

export type MG = MorrisGame<MENS_MORRIS_P_3, MENS_MORRIS_D_3, MENS_MORRIS_N_3>;

export type MorrisContext = {
  readonly game: MG;
  readonly move: MorrisMove<MENS_MORRIS_D_3>;
};

export type MGFs = {
  readonly isPlacingPhase: boolean;
  readonly isMovingPhase: boolean;
  readonly isWhiteMove: boolean;
  readonly isBlackMove: boolean;
  readonly moveIsCorrectColor: boolean;
  readonly moveIsCorrectTypeForPhase: boolean;
  readonly isMovePossibleForPlace: boolean;
  readonly isMovePossibleForMove: boolean;
  readonly isValidMove: boolean;
  readonly moveMakesMill: boolean;
  readonly isWinningMoveWhite: boolean;
  readonly isWinningMoveBlack: boolean;
  readonly isWinningMove: boolean;
};

export const Rules3MM = P.pipe(
  R.createRulesEngine<MorrisContext, MGFs>({
    isPlacingPhase: false,
    isMovingPhase: false,
    isWhiteMove: false,
    isBlackMove: false,
    moveIsCorrectColor: false,
    moveIsCorrectTypeForPhase: false,
    isMovePossibleForPlace: false,
    isMovePossibleForMove: false,
    isValidMove: false,
    moveMakesMill: false,
    isWinningMoveWhite: false,
    isWinningMoveBlack: false,
    isWinningMove: false,
  }),
  P.Effect.flatMap(
    // Placing phase if less than 6 MorrisMoveTypePlace moves have been made
    R.addRule((c: MorrisContext, f: MGFs) =>
      P.pipe(
        f,
        R.setFact(
          'isPlacingPhase',
          c.game.moves.filter((i) => i.type === MorrisMoveType.PLACE).length < c.game.config.numMorrisPerPlayer * 2
        )
      )
    )
  ),
  P.Effect.flatMap(R.addRule((_c: MorrisContext, f: MGFs) => P.pipe(f, R.setFact('isMovingPhase', !f.isPlacingPhase)))),
  P.Effect.flatMap(
    R.addRule((c: MorrisContext, f: MGFs) => {
      return P.pipe(f, R.setFact('isWhiteMove', isTurn(c.game, MorrisColor.WHITE)));
    })
  ),
  P.Effect.flatMap(
    R.addRule((_c: MorrisContext, f: MGFs) => {
      return P.pipe(f, R.setFact('isBlackMove', !f.isWhiteMove));
    })
  ),
  P.Effect.flatMap(
    R.addRule((c: MorrisContext, f: MGFs) => P.pipe(f, R.setFact('moveIsCorrectColor', isTurn(c.game, c.move.color))))
  ),
  P.Effect.flatMap(
    R.addRule((c: MorrisContext, f: MGFs) =>
      P.pipe(
        f,
        R.setFact(
          'moveIsCorrectTypeForPhase',
          (f.isPlacingPhase && c.move.type === MorrisMoveType.PLACE) ||
            (f.isMovingPhase && c.move.type === MorrisMoveType.MOVE)
        )
      )
    )
  ),
  P.Effect.flatMap(
    R.addRule((c: MorrisContext, f: MGFs) =>
      P.pipe(
        f,
        R.setFact('isMovePossibleForPlace', c.move.type === MorrisMoveType.PLACE && isPointEmpty(c.game, c.move.to))
      )
    )
  ),
  P.Effect.flatMap(
    R.addRule((c: MorrisContext, f: MGFs) =>
      P.pipe(
        f,
        R.setFact(
          'isMovePossibleForMove',
          c.move.type === MorrisMoveType.MOVE && isPointAdjacent(c.game, c.move.from, c.move.to)
        )
      )
    )
  ),
  P.Effect.flatMap(
    R.addRule((_c: MorrisContext, f: MGFs) =>
      P.pipe(
        f,
        R.setFact(
          'isValidMove',
          f.moveIsCorrectColor && f.moveIsCorrectTypeForPhase && (f.isMovePossibleForPlace || f.isMovePossibleForMove)
        )
      )
    )
  ),
  P.Effect.flatMap(
    R.addRule((c: MorrisContext, f: MGFs) =>
      P.pipe(f, R.setFact('moveMakesMill', f.isValidMove && moveMakesMill(c.game, c.move)))
    )
  ),
  P.Effect.flatMap(
    R.addRule((c: MorrisContext, f: MGFs) =>
      P.pipe(f, R.setFact('isWinningMoveWhite', f.moveMakesMill && c.move.color === MorrisColor.WHITE))
    )
  ),
  P.Effect.flatMap(
    R.addRule((c: MorrisContext, f: MGFs) =>
      P.pipe(f, R.setFact('isWinningMoveBlack', f.moveMakesMill && c.move.color === MorrisColor.BLACK))
    )
  ),
  P.Effect.flatMap(
    R.addRule((_c: MorrisContext, f: MGFs) =>
      P.pipe(f, R.setFact('isWinningMove', f.isWinningMoveWhite || f.isWinningMoveBlack))
    )
  )
);
