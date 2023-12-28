import { moveEqual } from '../moves';
import type { MorrisMoveS } from '../moves/schemas';
import type { MorrisFactsMove } from '../rules/factsMove';

export type MorrisGameHistory<D extends number> = {
  readonly moves: ReadonlyArray<MorrisMoveS<D>>;
  readonly moveFacts: ReadonlyArray<MorrisFactsMove>;
  readonly historyPtr: number;
};

export type MorrisGameHistoryEntry<D extends number> = {
  readonly lastMove: MorrisMoveS<D> | undefined;
  readonly lastMoveFacts: MorrisFactsMove | undefined;
};

// --------------------------------------------------------------------------
export function makeGameHistory<D extends number>(): MorrisGameHistory<D> {
  return {
    moves: [],
    moveFacts: [],
    historyPtr: -1,
  };
}

// --------------------------------------------------------------------------
export function historyLen<D extends number>(gameHistory: MorrisGameHistory<D>): number {
  return gameHistory.moves.length - gameHistory.historyPtr;
}

// --------------------------------------------------------------------------
export function historyPush<D extends number>(
  gameHistory: MorrisGameHistory<D>,
  move: MorrisMoveS<D>,
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

export function historyPop<D extends number>(gameHistory: MorrisGameHistory<D>): MorrisGameHistory<D> {
  if (gameHistory.historyPtr === gameHistory.moves.length) {
    return gameHistory;
  }

  return {
    ...gameHistory,
    historyPtr: gameHistory.historyPtr + 1,
  };
}

export function historyPeek<D extends number>(gameHistory: MorrisGameHistory<D>): MorrisGameHistoryEntry<D> {
  if (gameHistory.historyPtr < 0) {
    // eslint-disable-next-line fp/no-nil
    return { lastMove: undefined, lastMoveFacts: undefined };
  }

  const lastMove = gameHistory.moves[gameHistory.historyPtr];
  const lastMoveFacts = gameHistory.moveFacts[gameHistory.historyPtr + 1];

  return { lastMove, lastMoveFacts };
}
