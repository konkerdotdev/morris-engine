import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../lib/error';
import { toMorrisEngineError } from '../lib/error';
import * as R from '../lib/tiny-rules-fp';
import type { Tuple } from '../lib/type-utils';
import { filterE, someE } from '../lib/type-utils';
import type {
  MillCandidate,
  Morris,
  MorrisBoard,
  MorrisBoardCoord,
  MorrisBoardPoint,
  MorrisBoardPointOccupant,
  MorrisBoardPositionHash,
  MorrisGame,
  MorrisGameTick,
  MorrisMove,
  MorrisMovePlace,
  MorrisMoveRemove,
} from './index';
import {
  EMPTY,
  EmptyOccupant,
  isEmptyOccupant,
  isMorris,
  makeMorrisGameTick,
  MorrisColor,
  MorrisGameResult,
  MorrisMoveType,
  strMorrisMove,
} from './index';
import type { MorrisRulesContext } from './rules';
import { RulesImpl } from './rules';
import type { MorrisGameFacts } from './rules/facts';

// --------------------------------------------------------------------------
export function isTurn<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  color: MorrisColor
): boolean {
  return color === game.curMoveColor;
}

export function pointsMorris<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  color: MorrisColor
): ReadonlyArray<MorrisBoardPoint<D, N>> {
  return board.points.filter((p) => isMorris(p.occupant) && p.occupant.color === color);
}

export function countMorris<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  color: MorrisColor
): number {
  return pointsMorris(board, color).length;
}

export function pointsEmpty<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>
): ReadonlyArray<MorrisBoardPoint<D, N>> {
  return board.points.filter((p) => !isMorris(p.occupant));
}

export function countEmpty<P extends number, D extends number, N extends number>(board: MorrisBoard<P, D, N>): number {
  return pointsEmpty(board).length;
}

// --------------------------------------------------------------------------
export function getPoint<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  coord: MorrisBoardCoord<D>
): P.Effect.Effect<never, MorrisEngineError, MorrisBoardPoint<D, N>> {
  const i = board.points.findIndex((p) => p.coord === coord);
  const p = board.points[i];
  return p ? P.Effect.succeed(p) : P.Effect.fail(toMorrisEngineError(`Invalid point: ${coord}`));
}

export function getPointMorris<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  coord: MorrisBoardCoord<D>
): P.Effect.Effect<never, MorrisEngineError, Morris<N>> {
  return P.pipe(
    getPoint(board, coord),
    P.Effect.flatMap((p) =>
      isMorris(p.occupant)
        ? P.Effect.succeed(p.occupant)
        : P.Effect.fail(toMorrisEngineError(`Point is empty: ${coord}`))
    )
  );
}

// --------------------------------------------------------------------------
export function isPointEmpty<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  coord: MorrisBoardCoord<D>
): P.Effect.Effect<never, MorrisEngineError, boolean> {
  return P.pipe(
    getPoint(board, coord),
    P.Effect.map((p) => isEmptyOccupant(p.occupant))
  );
}

export function isPointAdjacent<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  from: MorrisBoardCoord<D>,
  to: MorrisBoardCoord<D>
): P.Effect.Effect<never, MorrisEngineError, boolean> {
  return P.pipe(
    getPoint(board, from),
    P.Effect.map((p) => p.links.some((link) => link.to === to))
  );
}

// --------------------------------------------------------------------------
// eslint-disable-next-line fp/no-nil
export function moveColor<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  move: MorrisMove<D, N>
): P.Effect.Effect<never, MorrisEngineError, MorrisColor> {
  // eslint-disable-next-line fp/no-unused-expression
  switch (move.type) {
    case MorrisMoveType.PLACE:
      return P.Effect.succeed(move.morris.color);
    case MorrisMoveType.MOVE:
    case MorrisMoveType.REMOVE:
      return P.pipe(
        getPointMorris(game.board, move.from),
        P.Effect.map((morris) => morris.color)
      );
  }
}

export function millCandidatesForMove<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  move: MorrisMove<D, N>
): ReadonlyArray<MillCandidate<D>> {
  // A REMOVE move can never create a mill
  if (move.type === MorrisMoveType.REMOVE) {
    return [];
  }

  // Find all mill possibilities which include the move.to point
  // Remove the move.to point from each of the mill possibilities
  return game.board.millCandidates
    .filter((m) => m.includes(move.to))
    .map((m) => m.filter((coord) => coord !== move.to)) as Array<MillCandidate<D>>;
}

export function moveMakesMill<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  move: MorrisMove<D, N>
): P.Effect.Effect<never, MorrisEngineError, boolean> {
  // A REMOVE move can never create a mill
  if (move.type === MorrisMoveType.REMOVE) {
    return P.Effect.succeed(false);
  }

  const candidates = millCandidatesForMove(game, move);

  // For each mill possibility, check if the other two points are the same color as the move
  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('moveColor', () => moveColor(game, move)),
    P.Effect.flatMap(({ moveColor }) =>
      P.pipe(
        candidates,
        someE<never, MorrisEngineError, ReadonlyArray<MorrisBoardCoord<D>>>((candidate) =>
          P.pipe(
            candidate,
            P.ReadonlyArray.map((coord) => getPoint(game.board, coord)),
            P.Effect.all,
            P.Effect.map((points) => points.every((p) => isMorris(p.occupant) && p.occupant.color === moveColor))
          )
        )
      )
    )
  );
}

export function countPositionRepeats<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  position: MorrisBoardPositionHash<P>
): number {
  return game.positions.filter((p) => p === position).length;
}

export function countValidMovesForColor<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  facts: MorrisGameFacts,
  color: MorrisColor
): P.Effect.Effect<never, MorrisEngineError, number> {
  if (facts.isMovingPhase || facts.isLaskerPhase) {
    const emptyPoints = pointsEmpty(board);
    const morrisPoints = pointsMorris(board, color);

    // For each morris[color] on the board, find all adjacent empty points
    const numMoveMoves = P.pipe(
      morrisPoints,
      P.Effect.reduce(0, (acc, p) =>
        P.pipe(
          emptyPoints,
          filterE((ep) => isPointAdjacent(board, p.coord, ep.coord)),
          P.Effect.map((filteredEmptyPoints) => acc + filteredEmptyPoints.length)
        )
      )
    );

    return facts.isLaskerPhase
      ? // In Lasker phase, the number of moves is (move moves + place moves)
        P.pipe(
          numMoveMoves,
          P.Effect.map((numMoveMoves) => numMoveMoves + emptyPoints.length)
        )
      : // In moving phase, for each morris[color] on the board, find all adjacent empty points
        numMoveMoves;
  }

  // In placing phase, just return the number of empty points
  if (facts.isPlacingPhase) {
    return P.Effect.succeed(countEmpty(board));
  }

  // In flying phase, return the number of empty points for each morris[color]
  if (facts.isFlyingPhase) {
    return P.Effect.succeed(countEmpty(board) * countMorris(board, color));
  }

  // Fallback default (absurd)
  return P.Effect.succeed(0);
}

// --------------------------------------------------------------------------
export function boardHash<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>
): MorrisBoardPositionHash<P> {
  return board.points.reduce(
    (acc, val) => `${acc}${isMorris(val.occupant) ? val.occupant.color : EMPTY}`,
    ''
  ) as MorrisBoardPositionHash<P>;
}

// --------------------------------------------------------------------------
export function setPointOccupant<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  coord: MorrisBoardCoord<D>,
  occupant: MorrisBoardPointOccupant<N>
): P.Effect.Effect<never, MorrisEngineError, MorrisBoard<P, D, N>> {
  const i = board.points.findIndex((p) => p.coord === coord);
  const p = board.points[i];

  return p
    ? P.Effect.succeed({
        ...board,
        points: board.points.map((p) => (p.coord === coord ? { ...p, occupant } : p)) as Tuple<
          MorrisBoardPoint<D, N>,
          P
        >,
      })
    : P.Effect.fail(toMorrisEngineError(`Invalid point: ${coord}`));
}

export function setPointEmpty<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  coord: MorrisBoardCoord<D>
): P.Effect.Effect<never, MorrisEngineError, MorrisBoard<P, D, N>> {
  return setPointOccupant(board, coord, EmptyOccupant);
}

// eslint-disable-next-line fp/no-nil
export function boardApplyMove<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>,
  move: MorrisMove<D, N>
): P.Effect.Effect<never, MorrisEngineError, MorrisBoard<P, D, N>> {
  switch (move.type) {
    case MorrisMoveType.PLACE:
      return setPointOccupant(board, move.to, move.morris);

    case MorrisMoveType.MOVE:
      return P.pipe(
        P.Effect.Do,
        P.Effect.bind('point', () => getPoint(board, move.from)),
        P.Effect.bind('newBoard', () => setPointEmpty(board, move.from)),
        P.Effect.flatMap(({ newBoard, point }) => setPointOccupant(newBoard, move.to, point.occupant))
      );

    case MorrisMoveType.REMOVE:
      return setPointEmpty(board, move.from);
  }
}

// --------------------------------------------------------------------------
export const createMovePlace = <D extends number, N extends number>(
  morris: Morris<N>,
  to: MorrisBoardCoord<D>
): MorrisMovePlace<D, N> => ({
  type: MorrisMoveType.PLACE,
  morris,
  to,
});

export const createMoveMove = <D extends number, N extends number>(
  from: MorrisBoardCoord<D>,
  to: MorrisBoardCoord<D>
): MorrisMove<D, N> => ({
  type: MorrisMoveType.MOVE,
  from,
  to,
});

export const createMoveRemove = <D extends number, N extends number>(
  morris: Morris<N>,
  from: MorrisBoardCoord<D>
): MorrisMoveRemove<D, N> => ({
  type: MorrisMoveType.REMOVE,
  morris,
  from,
});

export const execMove =
  <P extends number, D extends number, N extends number>(move: MorrisMove<D, N>, facts: MorrisGameFacts) =>
  (game: MorrisGame<P, D, N>): P.Effect.Effect<never, MorrisEngineError, MorrisGame<P, D, N>> => {
    if (!R.val(facts.isValidMove)) {
      return P.Effect.succeed(game);
    }

    const nextMoveColor = R.val(facts.moveMakesNextTurnWhite) ? MorrisColor.WHITE : MorrisColor.BLACK;

    return P.pipe(
      P.Effect.Do,
      P.Effect.bind('newBoard', () => boardApplyMove(game.board, move)),
      P.Effect.map(({ newBoard }) => ({
        ...game,
        board: newBoard,
        curMoveColor: nextMoveColor,
        gameOver: R.val(facts.moveMakesGameOver),
        result: R.val(facts.moveMakesWinWhite)
          ? MorrisGameResult.WIN_WHITE
          : R.val(facts.moveMakesWinBlack)
            ? MorrisGameResult.WIN_BLACK
            : R.val(facts.moveMakesDraw)
              ? MorrisGameResult.DRAW
              : MorrisGameResult.IN_PROGRESS,
        lastMillCounter: R.val(facts.moveMakesMill) ? 0 : game.lastMillCounter + 1,
        moves: [...game.moves, move],
        positions: [...game.positions, boardHash(newBoard)],
        facts,
      }))
    );
  };

// --------------------------------------------------------------------------
export const tick =
  <P extends number, D extends number, N extends number>(move: MorrisMove<D, N>) =>
  (gameTick: MorrisGameTick<P, D, N>): P.Effect.Effect<RulesImpl, MorrisEngineError, MorrisGameTick<P, D, N>> => {
    // Formulate a rules context
    const rulesContext: MorrisRulesContext<P, D, N> = {
      game: gameTick.game,
      move,
    };

    return P.pipe(
      P.Effect.Do,
      P.Effect.bind('ruleSet', () =>
        // Execute the rules
        P.pipe(
          RulesImpl,
          P.Effect.map((rulesImpl) => rulesImpl.ruleSet<P, D, N>()),
          P.Effect.flatMap((ruleSet) =>
            P.pipe(ruleSet, R.decide<MorrisRulesContext<P, D, N>, MorrisGameFacts, MorrisEngineError>(rulesContext))
          )
        )
      ),
      P.Effect.bind('newGame', ({ ruleSet }) => P.pipe(gameTick.game, execMove(move, ruleSet.facts))),
      P.Effect.tap((_) => P.Console.log('\n-------\n')),
      // P.Effect.tap((_) => P.Console.log(rulesContext.game)),
      // P.Effect.tap((x) => P.Console.log(x.ruleSet.facts)),
      P.Effect.tap((_) => P.Console.log(strMorrisMove(move) + '\n')),
      P.Effect.flatMap(({ newGame, ruleSet }) =>
        R.val(ruleSet.facts.isValidMove)
          ? // Valid move: execute the move
            // FIXME: derive message from rules
            makeMorrisGameTick(newGame, gameTick.facts, String(newGame.result))
          : // Invalid move
            // FIXME: derive message from rules
            makeMorrisGameTick(gameTick.game, gameTick.facts, 'NOPE')
      )
    );
  };
