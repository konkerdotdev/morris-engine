import { moveEqual } from '../moves';
import type { MorrisMove } from '../moves/schemas';
import type { MorrisFactsMove } from '../rules/factsMove';
import type { MorrisGameHistory, MorrisGameHistoryEntry } from './schemas';

// --------------------------------------------------------------------------
export function gameHistoryLen(gameHistory: MorrisGameHistory): number {
  return gameHistory.moves.length - gameHistory.historyPtr;
}

export function gameHistoryPush(
  gameHistory: MorrisGameHistory,
  move: MorrisMove,
  moveFacts: MorrisFactsMove
): MorrisGameHistory {
  if (gameHistory.historyPtr > 0) {
    const lastMove = gameHistory.moves[gameHistory.historyPtr - 1];
    if (lastMove && moveEqual(lastMove, move)) {
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

export function gameHistoryPop(gameHistory: MorrisGameHistory): MorrisGameHistory {
  if (gameHistory.historyPtr === gameHistory.moves.length) {
    return gameHistory;
  }

  return {
    ...gameHistory,
    historyPtr: gameHistory.historyPtr + 1,
  };
}

export function gameHistoryUnPop(gameHistory: MorrisGameHistory): MorrisGameHistory {
  if (gameHistory.historyPtr === 0) {
    return gameHistory;
  }

  return {
    ...gameHistory,
    historyPtr: gameHistory.historyPtr - 1,
  };
}

export function gameHistoryPeek(gameHistory: MorrisGameHistory): MorrisGameHistoryEntry {
  if (gameHistory.historyPtr < 0) {
    // eslint-disable-next-line fp/no-nil
    return { lastMove: undefined, lastMoveFacts: undefined } as MorrisGameHistoryEntry;
  }

  const lastMove = gameHistory.moves[gameHistory.historyPtr];
  const lastMoveFacts = gameHistory.moveFacts[gameHistory.historyPtr + 1];

  return { lastMove, lastMoveFacts };
}
