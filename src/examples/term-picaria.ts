/* eslint-disable fp/no-unused-expression,fp/no-mutation,fp/no-let,fp/no-loops,fp/no-nil */
/**
 * Basic interactive Picaria game for the terminal
 */
import * as readline from 'node:readline/promises';

import chalk from 'chalk';
import console from 'console';

import { gameSetStartColorRandom } from '../engine/game';
import { renderString } from '../engine/render/text';
import { shellStartMorrisGame, shellTick, shellWrapRenderString } from '../engine/shell';
import type { MorrisGameTick } from '../engine/tick';
import type { params } from '../games/picaria';
import { game } from '../games/picaria';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const shellRenderString = shellWrapRenderString<typeof params.P, typeof params.D, typeof params.N>(renderString);

export async function execLoop(
  gt: MorrisGameTick<typeof params.P, typeof params.D, typeof params.N>
): Promise<MorrisGameTick<typeof params.P, typeof params.D, typeof params.N> | undefined> {
  const move = await rl.question(`${gt.message} (Q to quit): `);
  if (move.toUpperCase() === 'Q') {
    return undefined;
  }

  const ret = shellTick(gt, move);
  console.log('\n' + shellRenderString(ret));

  return ret;
}

(async () => {
  console.log(chalk.cyan.bold(game.config.name));

  let gt: MorrisGameTick<typeof params.P, typeof params.D, typeof params.N> | undefined = shellStartMorrisGame(
    gameSetStartColorRandom(game)
  );
  console.log('\n' + shellRenderString(gt));

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
