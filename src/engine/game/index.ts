import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import type { MorrisBoard, MorrisBoardPositionHash } from '../board';
import { getPoint, getPointMorris, setPointEmpty, setPointOccupant } from '../board/points';
import type { MorrisGameResult, MorrisPhase } from '../consts';
import { MorrisColor, MorrisMoveType } from '../consts';
import type { Morris, MorrisBlack, MorrisWhite } from '../morris';
import type { MorrisMoveS } from '../moves/schemas';
import type { MorrisGameFacts } from '../rules/facts';

// --------------------------------------------------------------------------
export type MorrisGameConfig<N extends number> = {
  readonly name: string;
  readonly numMorrisPerPlayer: N;
  readonly flyingThreshold: number;
  readonly numMillsToWinThreshold: number; // 1 for 3MM
  readonly numMovesWithoutMillForDraw: number;
  readonly numPositionRepeatsForDraw: number;
  readonly phases: ReadonlyArray<MorrisPhase>; // 3MM: [PLACING, MOVING], L: [LASKER, MOVING]
};

export type MorrisGame<P extends number, D extends number, N extends number> = {
  readonly config: MorrisGameConfig<N>;
  readonly startColor: MorrisColor;
  readonly curMoveColor: MorrisColor;
  readonly gameOver: boolean;
  readonly result: MorrisGameResult;
  readonly lastMillCounter: number;
  readonly morrisWhite: ReadonlyArray<MorrisWhite<N>>;
  readonly morrisWhiteRemoved: ReadonlyArray<MorrisWhite<N>>;
  readonly morrisBlack: ReadonlyArray<MorrisBlack<N>>;
  readonly morrisBlackRemoved: ReadonlyArray<MorrisBlack<N>>;
  readonly board: MorrisBoard<P, D, N>;
  readonly positions: ReadonlyArray<MorrisBoardPositionHash<P>>;
  readonly moves: ReadonlyArray<MorrisMoveS<D>>;
  readonly facts: MorrisGameFacts;
};

// --------------------------------------------------------------------------
export function getNextPlaceMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  color: MorrisColor
): P.Effect.Effect<never, MorrisEngineError, Morris<N>> {
  const nextMorris = color === MorrisColor.WHITE ? game.morrisWhite[0] : game.morrisBlack[0];
  return nextMorris
    ? P.Effect.succeed(nextMorris)
    : P.Effect.fail(toMorrisEngineError(`No available Morris to place for ${color}`));
}

export function useMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  morris: Morris<N>
): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> {
  const morrisWhiteWithout =
    morris.color === MorrisColor.WHITE ? game.morrisWhite.filter((i) => i.n !== morris.n) : game.morrisWhite;
  const morrisBlackWithout =
    morris.color === MorrisColor.BLACK ? game.morrisBlack.filter((i) => i.n !== morris.n) : game.morrisBlack;

  return P.Effect.succeed({
    ...game,
    morrisWhite: morrisWhiteWithout,
    morrisBlack: morrisBlackWithout,
  });
}

export function discardMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  morris: Morris<N>
): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> {
  const morrisWhiteRemovedWith =
    morris.color === MorrisColor.WHITE ? [...game.morrisWhiteRemoved, morris] : game.morrisWhiteRemoved;
  const morrisBlackRemovedWith =
    morris.color === MorrisColor.BLACK ? [...game.morrisBlackRemoved, morris] : game.morrisBlackRemoved;

  return P.Effect.succeed({
    ...game,
    morrisWhiteRemoved: morrisWhiteRemovedWith,
    morrisBlackRemoved: morrisBlackRemovedWith,
  });
}

// --------------------------------------------------------------------------
// eslint-disable-next-line fp/no-nil
export function applyMoveToGame<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  move: MorrisMoveS<D>
): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> {
  switch (move.type) {
    case MorrisMoveType.PLACE:
      return P.pipe(
        getNextPlaceMorris(game, move.color),
        P.Effect.flatMap((morris) =>
          P.pipe(
            useMorris(game, morris),
            P.Effect.flatMap((game) => setPointOccupant(game, move.to, morris))
          )
        )
      );

    case MorrisMoveType.MOVE:
      return P.pipe(
        P.Effect.Do,
        P.Effect.bind('point', () => getPoint(game.board, move.from)),
        P.Effect.bind('newGame', () => setPointEmpty(game, move.from)),
        P.Effect.flatMap(({ newGame, point }) => setPointOccupant(newGame, move.to, point.occupant))
      );

    case MorrisMoveType.REMOVE:
      return P.pipe(
        getPointMorris(game.board, move.from),
        P.Effect.flatMap((morris) =>
          P.pipe(
            setPointEmpty(game, move.from),
            P.Effect.flatMap((game) => discardMorris(game, morris))
          )
        )
      );
  }
}
