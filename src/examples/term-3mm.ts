/* eslint-disable fp/no-unused-expression,fp/no-mutation,fp/no-let,fp/no-loops,fp/no-nil */
/**
 * Basic interactive Three-Men's-Morris game for the terminal
 */
import * as readline from 'node:readline/promises';

import chalk from 'chalk';
import console from 'console';

import { gameSetStartColorRandom } from '../engine/game';
import { renderString } from '../engine/render/text';
import { shellStartMorrisGame, shellTick, shellUntick, shellWrapRenderString } from '../engine/shell';
import type { MorrisGameTick } from '../engine/tick';
import { gamesInstantiate } from '../games';
import { initialGameState, TAG } from '../games/3mm';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const shellRenderString = shellWrapRenderString(renderString);

export async function execLoop(gt: MorrisGameTick): Promise<MorrisGameTick | undefined> {
  const move = await rl.question(`${gt.message} (Q to quit): `);
  if (move.toUpperCase() === 'Q') {
    return undefined;
  } else if (move.toUpperCase() === 'U') {
    const ret = shellUntick(gt);
    console.log('\n' + shellRenderString(ret));

    return ret;
  }

  const ret = shellTick(gt, move);
  console.log('\n' + shellRenderString(ret));

  return ret;
}

(async () => {
  const game = gamesInstantiate(TAG, initialGameState);
  if (!game || game.gameState._tag !== TAG) {
    // eslint-disable-next-line fp/no-throw
    throw new Error(`Could not instantiate game ${TAG}`);
  }

  console.log(chalk.cyan.bold(game.gameState.config.name));

  let gt: MorrisGameTick | undefined = shellStartMorrisGame(gameSetStartColorRandom(game));
  console.log('\n' + shellRenderString(gt));

  try {
    while (gt) {
      gt = await execLoop(gt);
      if (gt?.facts?.isGameOver) {
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
