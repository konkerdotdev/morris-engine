/* eslint-disable fp/no-unused-expression,fp/no-mutation,fp/no-let,fp/no-loops,fp/no-nil */
/**
 * Basic interactive Ten-Men's-Morris (Lasker) game for the terminal
 */
import * as readline from 'node:readline/promises';

import chalk from 'chalk';
import console from 'console';

import { gameSetStartColorRandom } from '../engine/game';
import { renderString } from '../engine/render/text';
import { shellStartMorrisGame, shellTick, shellWrapRenderString } from '../engine/shell';
import type { MorrisGameTick } from '../engine/tick';
import { gamesInstantiate } from '../games';
import type { config } from '../games/10mm';
import { initialGameState, TAG } from '../games/10mm';
import * as R from '../lib/tiny-rules-fp';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const shellRenderString = shellWrapRenderString<typeof config.params.P, typeof config.params.D, typeof config.params.N>(
  renderString
);

export async function execLoop(
  gt: MorrisGameTick<typeof config.params.P, typeof config.params.D, typeof config.params.N>
): Promise<MorrisGameTick<typeof config.params.P, typeof config.params.D, typeof config.params.N> | undefined> {
  const move = await rl.question(`${gt.message} (Q to quit): `);
  if (move.toUpperCase() === 'Q') {
    return undefined;
  }

  const ret = shellTick(gt, move);
  console.log('\n' + shellRenderString(ret));

  return ret;
}

(async () => {
  const game = gamesInstantiate(TAG, initialGameState);
  if (!game || game._tag !== TAG) {
    // eslint-disable-next-line fp/no-throw
    throw new Error(`Could not instantiate game ${TAG}`);
  }
  console.log(chalk.cyan.bold(game.config.name));

  let gt: MorrisGameTick<typeof config.params.P, typeof config.params.D, typeof config.params.N> | undefined =
    shellStartMorrisGame(gameSetStartColorRandom(game));
  console.log('\n' + shellRenderString(gt));

  try {
    while (gt) {
      gt = await execLoop(gt);
      if (gt && R.val(gt.facts.isGameOver)) {
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
