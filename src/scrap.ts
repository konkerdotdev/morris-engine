/* eslint-disable fp/no-nil,fp/no-unused-expression */
/*
import * as P from '@konker.dev/effect-ts-prelude';

import { isPointAdjacent, isPointEmpty } from './functions';
import type { MorrisBoard, MorrisBoardCoord, MorrisGame, MorrisMove } from './index';
import { MorrisColor, MorrisMoveType, MorrisPhase } from './index';

export function coordToIndex<P extends number, D extends number>(
  board: MorrisBoard<P, D>,
  coord: MorrisBoardCoord<D>
): P.Option.Option<number> {
  const i = board.points.findIndex((p) => p.coord === coord);
  return i === -1 ? P.Option.none() : P.Option.some(i);
}

export function indexToCoord<P extends number, D extends number>(
  board: MorrisBoard<P, D>,
  index: number
): P.Option.Option<MorrisBoardCoord<D>> {
  const p = board.points[index];
  return !p ? P.Option.none() : P.Option.some(p.coord);
}

export function oppositeColor(color: MorrisColor): MorrisColor {
  return color === MorrisColor.BLACK ? MorrisColor.WHITE : MorrisColor.BLACK;
}

export function getNumMorrisPlaced<P extends number, D extends number>(
  game: MorrisGame<P, D>,
  color: MorrisColor
): number {
  return game.moves.filter((m) => m.color === color && m.type === MorrisMoveType.PLACE).length;
}

export function getNumMorrisLeft<P extends number, D extends number>(
  game: MorrisGame<P, D>,
  color: MorrisColor
): number {
  return game.config.numMorrisPerPlayer - getNumMorrisPlaced(game, color);
}

export function getValidMoves<P extends number, D extends number>(
  _game: MorrisGame<P, D>,
  _color: MorrisColor
): Array<MorrisMove<P>> {
  // If is placing phase, and less than max morris placed, then all empty points are valid
  // If is moving phase, then all non-empty adjacent points to each morris are valid
  // If is flying phase, then all empty points are valid
  //[TODO]
  return [];
}

export function hasValidMoves<P extends number, D extends number>(game: MorrisGame<P, D>, color: MorrisColor): boolean {
  return getValidMoves(game, color).length > 0;
}

export function isTurn<P extends number, D extends number>(game: MorrisGame<P, D>, color: MorrisColor): boolean {
  return color === game.startColor ? game.moves.length % 2 === 1 : game.moves.length % 2 === 0;
}

export function getTurnColor<P extends number, D extends number>(game: MorrisGame<P, D>): MorrisColor {
  return isTurn(game, MorrisColor.BLACK) ? MorrisColor.BLACK : MorrisColor.WHITE;
}

export function hasWon<P extends number, D extends number>(game: MorrisGame<P, D>, color: MorrisColor): boolean {
  return (
    hasValidMoves(game, color) &&
    getNumMorrisLeft(game, color) >= 3 &&
    (getNumMorrisLeft(game, oppositeColor(color)) < 3 || !hasValidMoves(game, oppositeColor(color)))
  );
}

export function isFlying<P extends number, D extends number>(_game: MorrisGame<P, D>, _color: MorrisColor): boolean {
  return false; //game.config.flyingThreshold && getNumMorrisLeft(game, color) <= game.config.flyingThreshold;
}

export function isFlyingBlack<P extends number, D extends number>(_game: MorrisGame<P, D>): boolean {
  return false; //game.config.flyingThreshold && getNumMorrisLeft(game, MorrisColorBlack) <= game.config.flyingThreshold;
}

export function isFlyingWhite<P extends number, D extends number>(_game: MorrisGame<P, D>): boolean {
  return false; //game.config.flyingThreshold && getNumMorrisLeft(game, MorrisColorWhite) <= game.config.flyingThreshold;
}

export function getPhase<P extends number, D extends number>(game: MorrisGame<P, D>, color: MorrisColor): MorrisPhase {
  const mainPhase = game.config.phases[game.phaseIdx] as MorrisPhase;
  if (isFlying(game, color)) {
    return MorrisPhase.FLYING;
  }
  return mainPhase;
}

// --------------------------------------------------------------------------
export function isValidMove<P extends number, D extends number>(game: MorrisGame<P, D>, move: MorrisMove<D>): boolean {
  // Check the move is the correct color
  if (!isTurn(game, move.color)) {
    return false;
  }

  const phase = getPhase(game, move.color);

  // Check the move is valid for the phase
  switch (phase) {
    case MorrisPhase.PLACING:
      // Can only place during the placing phase
      if (move.type !== MorrisMoveType.PLACE) {
        return false;
      }
      // Cannot place more than the max number of morris
      if (getNumMorrisPlaced(game, move.color) >= game.config.numMorrisPerPlayer) {
        return false;
      }
      break;
    case MorrisPhase.MOVING:
    case MorrisPhase.FLYING:
      if (move.type !== MorrisMoveType.MOVE) {
        return false;
      }
      break;
    case MorrisPhase.LASKER:
      // Can move or place
      if (move.type === MorrisMoveType.PLACE) {
        if (getNumMorrisPlaced(game, move.color) >= game.config.numMorrisPerPlayer) {
          return false;
        }
      }
      break;
  }

  // Check the move is valid for the board
  switch (move.type) {
    case MorrisMoveType.PLACE: {
      // A place move must be to an empty point
      if (!isPointEmpty(game, move.to)) {
        return false;
      }
      break;
    }
    case MorrisMoveType.MOVE: {
      switch (phase) {
        case MorrisPhase.MOVING:
        case MorrisPhase.LASKER:
          {
            if (!isPointAdjacent(game, move.from, move.to)) {
              return false;
            }
          }
          break;
        case MorrisPhase.FLYING: {
          if (!isPointEmpty(game, move.to)) {
            return false;
          }
        }
      }
      break;
    }
  }

  return true;
}
// --------------------------------------------------------------------------
export type Err = string;

// eslint-disable-next-line fp/no-nil
export function move<P extends number, D extends number>(
  game: MorrisGame<P, D>,
  move: MorrisMove<D>
): P.Either.Either<Err, MorrisGame<P, D>> {
  if (!isValidMove(game, move)) {
    return P.Either.left('Invalid move');
  }

  switch (move.type) {
    case MorrisMoveType.PLACE:
      {
        const newGame = {
          ...game,
          board: {
            ...game.board,
          },
          moves: game.moves.concat(move),
        };
        return P.Either.right(newGame);
      }
      break;
    case MorrisMoveType.MOVE: {
      const newGame = {
        ...game,
      };
      return P.Either.right(newGame);
    }
  }
}

 */
