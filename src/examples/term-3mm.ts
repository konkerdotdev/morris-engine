/* eslint-disable fp/no-unused-expression,fp/no-mutation,fp/no-let,fp/no-loops,fp/no-nil */
/**
 * Basic interactive Three-Men's-Morris game for the terminal
 */
import * as readline from 'node:readline/promises';

import chalk from 'chalk';
import console from 'console';

import type { D_3, N_3, P_3 } from '../3mm';
import { game as game3mm } from '../3mm';
import { shellRenderString } from '../3mm/render';
import { shellStartMorrisGame, shellTick } from '../engine/shell';
import type { MorrisGameTick } from '../engine/tick';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export async function execLoop(gt: MorrisGameTick<P_3, D_3, N_3>): Promise<MorrisGameTick<P_3, D_3, N_3> | undefined> {
  const move = await rl.question(`${gt.message} (Q to quit): `);
  if (move.toUpperCase() === 'Q') {
    return undefined;
  }

  const ret = shellTick(gt, move);
  console.log(shellRenderString(ret));

  return ret;
}

(async () => {
  let gt3: MorrisGameTick<P_3, D_3, N_3> | undefined = shellStartMorrisGame<P_3, D_3, N_3>(game3mm);
  console.log(shellRenderString(gt3));

  try {
    while (gt3) {
      gt3 = await execLoop(gt3);
      if (gt3?.game?.gameOver) {
        console.log(`\n${chalk.green.bold(gt3.message)}`);
        break;
      }
    }
  } finally {
    rl.close();
  }
  return '\nGoodbye!\n';
})()
  .then(console.log)
  .catch(console.error);
