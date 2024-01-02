import { moveEqual } from '../moves';
import type { MorrisMove } from '../moves/schemas';
import type { MorrisFactsMove } from '../rules/factsMove';
import type { MorrisGameHistory, MorrisGameHistoryEntry } from './schemas';

// --------------------------------------------------------------------------
export function gameHistoryLen<D extends number>(gameHistory: MorrisGameHistory<D>): number {
  return gameHistory.moves.length - gameHistory.historyPtr;
}

export function gameHistoryPush<D extends number>(
  gameHistory: MorrisGameHistory<D>,
  move: MorrisMove<D>,
  moveFacts: MorrisFactsMove
): MorrisGameHistory<D> {
  if (gameHistory.historyPtr > 0) {
    if (moveEqual(gameHistory.moves[gameHistory.historyPtr - 1]!, move)) {
      return {
        ...gameHistory,
        historyPtr: gameHistory.historyPtr - 1,
      };
    }
  }
  return {
    ...gameHistory,
    moves: [move, ...gameHistory.moves.slice(gameHistory.historyPtr)],
    moveFacts: [moveFacts, ...gameHistory.moveFacts.slice(gameHistory.historyPtr)],
    historyPtr: 0,
  };
}

export function gameHistoryPop<D extends number>(gameHistory: MorrisGameHistory<D>): MorrisGameHistory<D> {
  if (gameHistory.historyPtr === gameHistory.moves.length) {
    return gameHistory;
  }

  return {
    ...gameHistory,
    historyPtr: gameHistory.historyPtr + 1,
  };
}

export function gameHistoryUnPop<D extends number>(gameHistory: MorrisGameHistory<D>): MorrisGameHistory<D> {
  if (gameHistory.historyPtr === 0) {
    return gameHistory;
  }

  return {
    ...gameHistory,
    historyPtr: gameHistory.historyPtr - 1,
  };
}

export function gameHistoryPeek<D extends number>(gameHistory: MorrisGameHistory<D>): MorrisGameHistoryEntry<D> {
  if (gameHistory.historyPtr < 0) {
    // eslint-disable-next-line fp/no-nil
    return { lastMove: undefined, lastMoveFacts: undefined } as MorrisGameHistoryEntry<D>;
  }

  const lastMove = gameHistory.moves[gameHistory.historyPtr];
  const lastMoveFacts = gameHistory.moveFacts[gameHistory.historyPtr + 1];

  return { lastMove, lastMoveFacts };
}
