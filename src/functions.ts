import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisColor, MorrisGame, MorrisMove, MorrisPhase } from './index';
import {
  EmptyMorris,
  MorrisColorBlack,
  MorrisColorWhite,
  MorrisMoveTypeMove,
  MorrisMoveTypePlace,
  MorrisPhaseFlying,
  MorrisPhaseLasker,
  MorrisPhaseMoving,
  MorrisPhasePlacing,
} from './index';

export function oppositeColor(color: MorrisColor): MorrisColor {
  return color === MorrisColorBlack ? MorrisColorWhite : MorrisColorBlack;
}

export function getNumMorrisPlaced<P extends number, D extends number>(
  game: MorrisGame<P, D>,
  color: MorrisColor
): number {
  return game.moves.filter((m) => m.color === color && m.type === MorrisMoveTypePlace).length;
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
  return isTurn(game, MorrisColorBlack) ? MorrisColorBlack : MorrisColorWhite;
}

export function hasWon<P extends number, D extends number>(game: MorrisGame<P, D>, color: MorrisColor): boolean {
  return (
    hasValidMoves(game, color) &&
    getNumMorrisLeft(game, color) >= 3 &&
    (getNumMorrisLeft(game, oppositeColor(color)) < 3 || !hasValidMoves(game, oppositeColor(color)))
  );
}

export function isPointEmpty<P extends number, D extends number>(game: MorrisGame<P, D>, pointName: number): boolean {
  return game.board.points[pointName - 1]?.occupant === EmptyMorris;
}

export function isPointAdjacent<P extends number, D extends number>(
  game: MorrisGame<P, D>,
  from: number,
  to: number
): boolean {
  return !!game.board.points[from - 1]?.links.includes(to - 1);
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
    return MorrisPhaseFlying;
  }
  return mainPhase;
}

// --------------------------------------------------------------------------
export function isValidMove<P extends number, D extends number>(game: MorrisGame<P, D>, move: MorrisMove<P>): boolean {
  // Check the move is the correct color
  if (!isTurn(game, move.color)) {
    return false;
  }

  const phase = getPhase(game, move.color);

  // Check the move is valid for the phase
  switch (phase) {
    case MorrisPhasePlacing:
      // Can only place during the placing phase
      if (move.type !== MorrisMoveTypePlace) {
        return false;
      }
      // Cannot place more than the max number of morris
      if (getNumMorrisPlaced(game, move.color) >= game.config.numMorrisPerPlayer) {
        return false;
      }
      break;
    case MorrisPhaseMoving:
    case MorrisPhaseFlying:
      if (move.type !== MorrisMoveTypeMove) {
        return false;
      }
      break;
    case MorrisPhaseLasker:
      // Can move or place
      if (move.type === MorrisMoveTypePlace) {
        if (getNumMorrisPlaced(game, move.color) >= game.config.numMorrisPerPlayer) {
          return false;
        }
      }
      break;
  }

  // Check the move is valid for the board
  switch (move.type) {
    case MorrisMoveTypePlace: {
      // A place move must be to an empty point
      if (!isPointEmpty(game, move.to)) {
        return false;
      }
      break;
    }
    case MorrisMoveTypeMove: {
      switch (phase) {
        case MorrisPhaseMoving:
        case MorrisPhaseLasker:
          {
            if (!isPointAdjacent(game, move.from, move.to)) {
              return false;
            }
          }
          break;
        case MorrisPhaseFlying: {
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
  move: MorrisMove<P>
): P.Either.Either<Err, MorrisGame<P, D>> {
  if (!isValidMove(game, move)) {
    return P.Either.left('Invalid move');
  }

  switch (move.type) {
    case MorrisMoveTypePlace:
      {
        const newGame = {
          ...game,
          phaseIdx: game.phaseIdx,
          board: {
            ...game.board,
          },
          moves: game.moves.concat(move),
        };
        return P.Either.right(newGame);
      }
      break;
    case MorrisMoveTypeMove: {
      const newGame = {
        ...game,
      };
      return P.Either.right(newGame);
    }
  }
}
