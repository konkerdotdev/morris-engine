/* eslint-disable fp/no-unused-expression */
import * as P from '@konker.dev/effect-ts-prelude';
import * as console from 'console';

import { game } from './3mm';
import * as F from './lib/tiny-fsm-fp';
import * as R from './lib/tiny-rules-fp';
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

type Context = {
  readonly foo: string;
  readonly bar: number;
};
type Facts = {
  readonly launchQux: boolean;
  readonly numLaunches: number;
};

// --------------------------------------------------------------------------
const rule1: R.Rule<Context, Facts> = (context: Context, facts: Facts) =>
  P.pipe(facts, context.foo === 'A' ? R.setFact('launchQux', true) : R.setFact('launchQux', false));

const rule2: R.Rule<Context, Facts> = (context: Context, facts: Facts) => {
  return P.pipe(
    facts,
    facts.launchQux
      ? context.bar < 99
        ? R.setFact('numLaunches', 1)
        : R.setFact('numLaunches', 999)
      : R.setFact('numLaunches', -1)
  );
};

const rules = P.pipe(
  R.createRulesEngine<Context, Facts>({
    launchQux: false,
    numLaunches: 0,
  }),
  P.Effect.flatMap(R.addRule('Check foo', rule1)),
  P.Effect.flatMap(R.addRule('Check bar', rule2))
);

const prog2 = P.pipe(
  rules,
  (x) => x,
  P.Effect.flatMap(R.decide({ foo: 'A', bar: 42 })),
  P.Effect.tap(
    (x) => P.Console.log(x.facts)
    // P.Logger.withMinimumLogLevel(P.LogLevel.Debug)
  )
);

const prog3 = P.pipe(
  rules,
  (x) => x,
  P.Effect.flatMap(R.decide({ foo: 'B', bar: 123 })),
  P.Effect.tap(
    (x) => P.Console.log(x.facts)
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
  console.log('-------------------');
  await P.Effect.runPromise(prog3);
  return "Q'Pla!";
})().catch(console.error);
