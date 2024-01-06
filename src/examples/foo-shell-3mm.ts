/* eslint-disable fp/no-unused-expression,@typescript-eslint/ban-ts-comment,fp/no-let,fp/no-mutation,fp/no-nil */
import * as console from 'console';

import { MorrisColor } from '../engine/consts';
import { gameSetStartColor } from '../engine/game';
import { renderString } from '../engine/render/text';
import { shellStartMorrisGame, shellTick, shellWrapRenderString } from '../engine/shell';
import { gamesInstantiate } from '../games';
import type { config } from '../games/3mm';
import { initialGameState, TAG } from '../games/3mm';

const shellRenderString = shellWrapRenderString<typeof config.params.P, typeof config.params.D, typeof config.params.N>(
  renderString
);

const MOVES = ['P W a1', 'P B c2', 'P W b3', 'P B c3', 'P W b1', 'P B b2', 'P W c1', 'M b2 a2', 'M c1 b2'];

// --------------------------------------------------------------------------
const game = gamesInstantiate(TAG, initialGameState);
if (!game || game._tag !== TAG) {
  // eslint-disable-next-line fp/no-throw
  throw new Error(`Could not instantiate game ${TAG}`);
}

let gt = shellStartMorrisGame<typeof config.params.P, typeof config.params.D, typeof config.params.N>(
  gameSetStartColor(game, MorrisColor.BLACK)
);
console.log(shellRenderString(gt));
console.log(gt.message + '\n');

MOVES.forEach((moveStr) => {
  gt = shellTick(gt, moveStr);
  console.log('\n' + shellRenderString(gt));
  console.log(`[${moveStr}] ${gt.message}\n`);
});
