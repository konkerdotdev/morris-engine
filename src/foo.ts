/* eslint-disable fp/no-unused-expression */
import * as P from '@konker.dev/effect-ts-prelude';
import * as console from 'console';

import { game } from './3mm';
import { render } from './3mm/render';
import * as M from './functions';
import * as F from './lib/tiny-fsm-fp';
import * as R from './lib/tiny-rules-fp';
import type { MorrisContext } from './rules';
import { Rules3MM } from './rules';
import type { GameState, MG } from './state-machine';
import { GameEvent, gameFsm } from './state-machine';

// --------------------------------------------------------------------------
const prog1 = P.pipe(
  gameFsm,
  P.Effect.flatMap(F.trigger<GameState, GameEvent, MG>(GameEvent.EV_WHITE_MOVE, game)),
  P.Effect.flatMap(F.trigger<GameState, GameEvent, MG>(GameEvent.EV_BLACK_MOVE, game)),
  (x) => x,
  P.Logger.withMinimumLogLevel(P.LogLevel.Debug)
);

const curGame = P.pipe(
  game,
  M.execMove(M.placeWhite('a1'), 1),
  M.execMove(M.placeBlack('a3'), 1),
  M.execMove(M.placeWhite('c3'), 2),
  M.execMove(M.placeBlack('b3'), 2),
  M.execMove(M.placeWhite('b1'), 3),
  M.execMove(M.placeBlack('c1'), 3)
);
const context: MorrisContext = {
  game: curGame,
  move: M.moveWhite('b1', 'b2'),
};
const prog2 = P.pipe(
  Rules3MM,
  (x) => x,
  P.Effect.flatMap((rulesEngine) => P.pipe(rulesEngine, R.decide(context))),
  P.Effect.tap(
    (x) => P.Console.log(x.facts)
    // P.Logger.withMinimumLogLevel(P.LogLevel.Debug)
  ),
  P.Effect.tap(
    (_x) => P.Console.log(curGame.moves)
    // P.Logger.withMinimumLogLevel(P.LogLevel.Debug)
  ),
  P.Effect.tap(
    (_x) => P.Console.log(render(curGame))
    // P.Logger.withMinimumLogLevel(P.LogLevel.Debug)
  )
);

// --------------------------------------------------------------------------
// eslint-disable-next-line fp/no-nil,fp/no-unused-expression
(async () => {
  // eslint-disable-next-line fp/no-unused-expression
  await P.Effect.runPromise(prog1);
  console.log('-------------------');
  await P.Effect.runPromise(prog2);
  return "Q'Pla!";
})().catch(console.error);
