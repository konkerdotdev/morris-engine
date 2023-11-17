import * as P from '@konker.dev/effect-ts-prelude';

// import * as E from '@konker.dev/tiny-event-fp';
import type { MENS_MORRIS_D_3, MENS_MORRIS_P_3 } from './boards';
import type { MorrisGame } from './index';
import * as F from './lib/tiny-fsm-fp';

export const GameState = {
  ST_ANY: '*',
  ST_EMPTY: 'ST_EMPTY',
  ST_BLACK_MOVE: 'ST_BLACK_MOVE',
  ST_BLACK_MOVE_REMOVE: 'ST_BLACK_MOVE_REMOVE',
  ST_WHITE_MOVE: 'ST_WHITE_MOVE',
  ST_WHITE_MOVE_REMOVE: 'ST_WHITE_MOVE_REMOVE',
  ST_BLACK_WIN: 'ST_BLACK_WIN',
  ST_WHITE_WIN: 'ST_WHITE_WIN',
  ST_DRAW: 'ST_DRAW',
} as const;
export type GameState = keyof typeof GameState;

export const GameEvent = {
  EV_BLACK_MOVE: 'EV_BLACK_MOVE',
  EV_WHITE_MOVE: 'EV_WHITE_MOVE',
  EV_PHASE_PLACING_ENTERED: 'EV_PHASE_PLACING_ENTERED',
  EV_PHASE_MOVING_ENTERED: 'EV_PHASE_MOVING_ENTERED',
  EV_PHASE_FLYING_ENTERED: 'EV_PHASE_FLYING_ENTERED',
  EV_PHASE_LASKER_ENTERED: 'EV_PHASE_LASKER_ENTERED',
  EV_BLACK_MILL: 'EV_BLACK_MILL',
  EV_WHITE_MILL: 'EV_WHITE_MILL',
  EV_BLACK_WIN: 'EV_BLACK_WIN',
  EV_WHITE_WIN: 'EV_WHITE_WIN',
  EV_DRAW: 'EV_DRAW',
} as const;
export type GameEvent = keyof typeof GameEvent;

export const GameStateMap = [
  ['ST_EMPTY', 'EV_BLACK_MOVE', 'ST_WHITE_MOVE'],
  ['ST_EMPTY', 'EV_WHITE_MOVE', 'ST_BLACK_MOVE'],
  ['ST_BLACK_MOVE', 'EV_BLACK_MOVE', 'ST_WHITE_MOVE'],
  ['ST_WHITE_MOVE', 'EV_WHITE_MOVE', 'ST_BLACK_MOVE'],
  // ['*', 'EV_BLACK_MILL', 'ST_BLACK_REMOVE'],
  // ['*', 'EV_WHITE_MILL', 'ST_WHITE_REMOVE'],
  ['*', 'EV_BLACK_MILL', 'ST_BLACK_WIN'], // 3MM
  ['*', 'EV_WHITE_MILL', 'ST_WHITE_WIN'], // 3MM
  ['*', 'EV_BLACK_WIN', 'ST_BLACK_WIN'],
  ['*', 'EV_WHITE_WIN', 'ST_WHITE_WIN'],
  ['*', 'EV_DRAW', 'ST_DRAW'],
] as const;

export type MG = MorrisGame<MENS_MORRIS_P_3, MENS_MORRIS_D_3>;

function blackMoveListener(type: GameState, _data?: MG) {
  return P.pipe(
    P.Console.log(`BLACK MOVE: ${type}`),
    P.Effect.flatMap(() => P.Effect.unit)
  );
}

function whiteMoveListener(type: GameState, _data?: MG) {
  return P.pipe(
    P.Console.log(`WHITE MOVE: ${type}`),
    P.Effect.flatMap(() => P.Effect.unit)
  );
}

export const gameFsm = P.pipe(
  F.createTinyStateMachine<GameState, GameEvent, MG>(GameState.ST_EMPTY),
  (x) => x,
  P.Effect.flatMap(
    F.transition<GameState, GameEvent, MG>(GameState.ST_EMPTY, GameEvent.EV_BLACK_MOVE, GameState.ST_WHITE_MOVE)
  ),
  P.Effect.flatMap(
    F.transition<GameState, GameEvent, MG>(GameState.ST_EMPTY, GameEvent.EV_WHITE_MOVE, GameState.ST_BLACK_MOVE)
  ),
  P.Effect.flatMap(
    F.transition<GameState, GameEvent, MG>(GameState.ST_WHITE_MOVE, GameEvent.EV_WHITE_MOVE, GameState.ST_BLACK_MOVE)
  ),
  P.Effect.flatMap(
    F.transition<GameState, GameEvent, MG>(GameState.ST_BLACK_MOVE, GameEvent.EV_BLACK_MOVE, GameState.ST_WHITE_MOVE)
  ),
  P.Effect.flatMap(F.onEnterState<GameState, GameEvent, MG>(GameState.ST_BLACK_MOVE, blackMoveListener)),
  P.Effect.flatMap(F.onEnterState<GameState, GameEvent, MG>(GameState.ST_WHITE_MOVE, whiteMoveListener))
);
