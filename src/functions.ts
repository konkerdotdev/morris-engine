/* eslint-disable fp/no-nil,fp/no-unused-expression */
import * as P from '@konker.dev/effect-ts-prelude';

import type {
  MillCandidate,
  Morris,
  MorrisBoard,
  MorrisBoardCoord,
  MorrisBoardPoint,
  MorrisBoardPointOccupant,
  MorrisGame,
  MorrisGameTick,
  MorrisMove,
  MorrisMovePlace,
  MorrisPositiveMove,
} from './index';
import {
  EMPTY,
  EmptyPoint,
  GAME_TICK_MESSAGE_OK,
  isEmptyPoint,
  isMorris,
  makeMorrisGameTick,
  MorrisColor,
  MorrisMoveType,
  strMorrisMove,
} from './index';
import * as R from './lib/tiny-rules-fp';
import type { MorrisContext, MorrisGameFacts } from './rules';
import { RulesImpl } from './rules';
import type { Tuple } from './utils';
import { someE } from './utils';

// --------------------------------------------------------------------------
export function isTurn<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  color: MorrisColor
): boolean {
  return color === game.curMoveColor;
}

export function unsafe_point<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  coord: MorrisBoardCoord<D>
): MorrisBoardPoint<D, N> {
  const i = game.board.points.findIndex((p) => p.coord === coord);
  return game.board.points[i] as MorrisBoardPoint<D, N>;
}

export function point<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  coord: MorrisBoardCoord<D>
): P.Effect.Effect<never, Error, MorrisBoardPoint<D, N>> {
  const p = unsafe_point(game, coord);
  return p ? P.Effect.succeed(p) : P.Effect.fail(new Error(`Invalid point: ${coord}`));
}

export function unsafe_pointMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  coord: MorrisBoardCoord<D>
): Morris<N> {
  const i = game.board.points.findIndex((p) => p.coord === coord);
  return game.board.points[i]?.occupant as Morris<N>;
}

export function pointMorris<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  coord: MorrisBoardCoord<D>
): P.Effect.Effect<never, Error, Morris<N>> {
  return P.pipe(
    point(game, coord),
    P.Effect.flatMap((p) =>
      isMorris(p.occupant) ? P.Effect.succeed(p.occupant) : P.Effect.fail(new Error('Point is empty'))
    )
  );
}

export function unsafe_moveColor<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  move: MorrisMove<D, N>
): MorrisColor {
  switch (move.type) {
    case MorrisMoveType.PLACE:
      return move.morris.color;
    case MorrisMoveType.MOVE:
      return unsafe_pointMorris(game, move.from).color;
    case MorrisMoveType.REMOVE:
      return unsafe_pointMorris(game, move.from).color;
  }
}

export function moveColor<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  move: MorrisMove<D, N>
): P.Effect.Effect<never, Error, MorrisColor> {
  switch (move.type) {
    case MorrisMoveType.PLACE:
      return P.Effect.succeed(move.morris.color);
    case MorrisMoveType.REMOVE:
    case MorrisMoveType.MOVE:
      return P.pipe(
        pointMorris(game, move.from),
        P.Effect.map((morris) => morris.color)
      );
  }
}

export function unsafe_isPointEmpty<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  coord: MorrisBoardCoord<D>
): boolean {
  return isEmptyPoint(unsafe_point(game, coord).occupant);
}

export function isPointEmpty<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  coord: MorrisBoardCoord<D>
): P.Effect.Effect<never, Error, boolean> {
  return P.pipe(
    point(game, coord),
    P.Effect.map((p) => isEmptyPoint(p.occupant))
  );
}

export function unsafe_isPointAdjacent<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  from: MorrisBoardCoord<D>,
  to: MorrisBoardCoord<D>
): boolean {
  return unsafe_point(game, from).links.some((link) => link.to === to);
}

export function isPointAdjacent<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  from: MorrisBoardCoord<D>,
  to: MorrisBoardCoord<D>
): P.Effect.Effect<never, Error, boolean> {
  return P.pipe(
    point(game, from),
    P.Effect.map((p) => p.links.some((link) => link.to === to))
  );
}

export function millCandidatesForMove<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  move: MorrisPositiveMove<D, N>
): ReadonlyArray<MillCandidate<D>> {
  // Find all mill possibilities which include the move.to point
  // Remove the move.to point from each of the mill possibilities
  return game.board.millCandidates
    .filter((m) => m.includes(move.to))
    .map((m) => m.filter((coord) => coord !== move.to)) as Array<MillCandidate<D>>;
}

export function unsafe_moveMakesMill<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  move: MorrisMove<D, N>
): boolean {
  if (move.type === MorrisMoveType.REMOVE) {
    return false;
  }

  const candidates = millCandidatesForMove(game, move);
  const color = unsafe_moveColor(game, move);

  // For each mill possibility, check if the other two points are the same color as the move
  return candidates.some((candidate) => candidate.every((coord) => unsafe_pointMorris(game, coord).color === color));
}

export function moveMakesMill<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  move: MorrisMove<D, N>
): P.Effect.Effect<never, Error, boolean> {
  if (move.type === MorrisMoveType.REMOVE) {
    return P.Effect.succeed(false);
  }

  const candidates = millCandidatesForMove(game, move);

  // For each mill possibility, check if the other two points are the same color as the move
  return P.pipe(
    moveColor(game, move),
    P.Effect.flatMap((color) =>
      P.pipe(
        candidates,
        someE<never, Error, ReadonlyArray<MorrisBoardCoord<D>>>((candidate) =>
          P.pipe(
            candidate,
            P.ReadonlyArray.map((coord) => pointMorris(game, coord)),
            P.Effect.all,
            P.Effect.map((morrisArray) => morrisArray.every((morris) => morris.color === color))
          )
        )
      )
    )
  );
}

// --------------------------------------------------------------------------
export function boardHash<P extends number, D extends number, N extends number>(board: MorrisBoard<P, D, N>): string {
  return board.points.reduce((acc, val) => `${acc}${isMorris(val.occupant) ? val.occupant.color : EMPTY}`, '');
}

// --------------------------------------------------------------------------
export function setPointOccupant<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  coord: MorrisBoardCoord<D>,
  occupant: MorrisBoardPointOccupant<N>
): MorrisGame<P, D, N> {
  return {
    ...game,
    board: {
      ...game.board,
      points: game.board.points.map((p) => (p.coord === coord ? { ...p, occupant } : p)) as Tuple<
        MorrisBoardPoint<D, N>,
        P
      >,
    },
  };
}

export function setPointEmpty<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>,
  coord: MorrisBoardCoord<D>
): MorrisGame<P, D, N> {
  return setPointOccupant(game, coord, EmptyPoint);
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

export const unsafe_execMove =
  <P extends number, D extends number, N extends number>(move: MorrisMove<D, N>, curMoveColor: MorrisColor) =>
  (game: MorrisGame<P, D, N>): MorrisGame<P, D, N> => {
    switch (move.type) {
      case MorrisMoveType.PLACE: {
        const newGame = setPointOccupant(game, move.to, move.morris);
        return {
          ...newGame,
          curMoveColor,
          moves: [...newGame.moves, move],
          positions: [...newGame.positions, boardHash(newGame.board)],
        };
      }
      case MorrisMoveType.MOVE: {
        const newGame = setPointOccupant(
          setPointEmpty(game, move.from),
          move.to,
          unsafe_point(game, move.from).occupant
        );
        return {
          ...newGame,
          moves: [...newGame.moves, move],
          positions: [...newGame.positions, boardHash(newGame.board)],
        };
      }
      case MorrisMoveType.REMOVE: {
        // TODO
        return game;
      }
    }
  };

/*[XXX]
export const execMoveE =
  <P extends number, D extends number, N extends number>(move: MorrisMove<D, N>, curMoveColor: MorrisColor) =>
  (game: MorrisGame<P, D, N>): P.Effect.Effect<never, Error, MorrisGame<P, D, N>> => {
    return P.pipe(P.Effect.succeed(game), P.Effect.map(execMoveP<P, D, N>(move, curMoveColor)));
  };
*/

// --------------------------------------------------------------------------
/* FIXME: remove
export const tickExec =
  <P extends number, D extends number, N extends number>(move: MorrisMove<D, N>) =>
  (game: MorrisGame<P, D, N>): P.Effect.Effect<RulesImpl, Error, MorrisGame<P, D, N>> => {
    const rulesContext: MorrisContext<P, D, N> = {
      game,
      move,
    };

    return P.pipe(
      RulesImpl,
      P.Effect.flatMap((rulesImpl) =>
        P.pipe(rulesImpl.ruleSet<P, D, N>(), R.decide<MorrisContext<P, D, N>, MorrisGameFacts>(rulesContext))
      ),
      P.Effect.tap((x) => P.Console.log(x.facts)),
      P.Effect.tap((_) => P.Console.log(strMorrisMove(move) + '\n')),
      P.Effect.flatMap((ruleSet) =>
        ruleSet.facts.isValidMove ? P.Effect.succeed(ruleSet) : P.Effect.fail(new Error('Invalid move'))
      ),
      P.Effect.map((ruleSet) => {
        const nextPlayer = ruleSet.facts.isWhiteTurn ? MorrisColor.BLACK : MorrisColor.WHITE;
        return P.pipe(game, unsafe_execMove(move, nextPlayer));
      })
    );
  };
*/

// - Formulate rules context: { game, move }
// - Exec rules with (ruleSet, context) -> newRuleSet
// - Detect invalid move => display error and END_LOOP
// - Detect valid move, detect next player => exec move with (game, move, nextPlayer) -> newGame
// - Render newGame
// - Detect game over => display winner and exit LOOP

// --------------------------------------------------------------------------
export const tick =
  <P extends number, D extends number, N extends number>(move: MorrisMove<D, N>) =>
  (gameTick: MorrisGameTick<P, D, N>): P.Effect.Effect<RulesImpl, Error, MorrisGameTick<P, D, N>> => {
    // Formulate a rules context
    const rulesContext: MorrisContext<P, D, N> = {
      game: gameTick.game,
      move,
    };

    return P.pipe(
      // Execute the rules
      RulesImpl,
      P.Effect.flatMap((rulesImpl) =>
        P.pipe(rulesImpl.ruleSet<P, D, N>(), R.decide<MorrisContext<P, D, N>, MorrisGameFacts>(rulesContext))
      ),
      (x) => x,
      P.Effect.tap((_) => P.Console.log('\n-------\n')),
      P.Effect.tap((x) => P.Console.log(x.facts)),
      P.Effect.tap((_) => P.Console.log(strMorrisMove(move) + '\n')),
      P.Effect.flatMap((ruleSet) =>
        ruleSet.facts.isValidMove
          ? // Valid move: execute the move
            makeMorrisGameTick<P, D, N>(
              P.pipe(
                gameTick.game,
                unsafe_execMove(move, ruleSet.facts.isWhiteTurn ? MorrisColor.BLACK : MorrisColor.WHITE)
              ),
              gameTick.facts,
              GAME_TICK_MESSAGE_OK
            )
          : // Invalid move
            // FIXME: derive message from rules
            makeMorrisGameTick<P, D, N>(gameTick.game, gameTick.facts, 'NOPE')
      )
    );
  };
