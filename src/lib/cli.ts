import * as readline from 'node:readline/promises';

import * as P from '@konker.dev/effect-ts-prelude';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export function prompt(q: string): P.Effect.Effect<never, Error, string> {
  return P.Effect.tryPromise({
    try: async () => rl.question(q),
    catch: (e: any) => new Error(e),
  });
}
