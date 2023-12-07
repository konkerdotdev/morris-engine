/* eslint-disable fp/no-unused-expression,fp/no-mutation,fp/no-let,fp/no-loops,fp/no-nil */
/**
 * Basic interactive Three-Men's-Morris game for the terminal
 */
import * as readline from 'node:readline/promises';

import console from 'console';

import type { D_3, N_3, P_3 } from '../3mm';
import { game } from '../3mm';
import { shellRenderString3mm } from '../3mm/render';
import { shellStartMorrisGame, shellTick } from '../engine/shell';
import type { MorrisGameTick } from '../engine/tick';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export async function execLoop(gt: MorrisGameTick<P_3, D_3, N_3>): Promise<MorrisGameTick<P_3, D_3, N_3> | undefined> {
  const move = await rl.question('Enter move (Q to quit): ');
  if (move.toUpperCase() === 'Q') {
    return undefined;
  }

  const ret = shellTick(gt, move);
  console.log(shellRenderString3mm(ret));

  return ret;
}

(async () => {
  let gt: MorrisGameTick<P_3, D_3, N_3> | undefined = shellStartMorrisGame<P_3, D_3, N_3>(game);
  console.log(shellRenderString3mm(gt));

  try {
    while (gt) {
      gt = await execLoop(gt);
      if (gt?.game?.gameOver) {
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
