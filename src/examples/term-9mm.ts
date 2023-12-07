/* eslint-disable fp/no-unused-expression,fp/no-mutation,fp/no-let,fp/no-loops,fp/no-nil */
/**
 * Basic interactive Nine-Men's-Morris game for the terminal
 */
import * as readline from 'node:readline/promises';

import chalk from 'chalk';
import console from 'console';

import type { D_9, N_9, P_9 } from '../9mm';
import { game } from '../9mm';
import { renderString } from '../engine/render/text';
import { shellStartMorrisGame, shellTick, shellWrapRenderString } from '../engine/shell';
import type { MorrisGameTick } from '../engine/tick';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const shellRenderString = shellWrapRenderString<P_9, D_9, N_9>(renderString);

export async function execLoop(gt: MorrisGameTick<P_9, D_9, N_9>): Promise<MorrisGameTick<P_9, D_9, N_9> | undefined> {
  const move = await rl.question(`${gt.message} (Q to quit): `);
  if (move.toUpperCase() === 'Q') {
    return undefined;
  }

  const ret = shellTick(gt, move);
  console.log('\n' + shellRenderString(ret));

  return ret;
}

(async () => {
  console.log(chalk.cyan.bold(game.config.name) + '\n\n');

  let gt: MorrisGameTick<P_9, D_9, N_9> | undefined = shellStartMorrisGame<P_9, D_9, N_9>(game);
  console.log(shellRenderString(gt));

  try {
    while (gt) {
      gt = await execLoop(gt);
      if (gt?.game?.gameOver) {
        console.log(`\n${chalk.green.bold(gt.message)}`);
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
