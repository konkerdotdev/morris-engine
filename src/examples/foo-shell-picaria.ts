/* eslint-disable fp/no-unused-expression,@typescript-eslint/ban-ts-comment,fp/no-let,fp/no-mutation,fp/no-nil */
import * as console from 'console';

import { renderString } from '../engine/render/text';
import { shellStartMorrisGame, shellTick, shellWrapRenderString } from '../engine/shell';
import { gamesInstantiate } from '../games';
import type { config } from '../games/picaria';
import { initialGameState, TAG } from '../games/picaria';

const shellRenderString = shellWrapRenderString<typeof config.params.P, typeof config.params.D, typeof config.params.N>(
  renderString
);

const MOVES = ['P W b4', 'P B d2', 'P W e5', 'P B e3', 'P W c1', 'P B e1', 'M b4 c3', 'M e3 d4', 'M e5 c5'];

// --------------------------------------------------------------------------
const game = gamesInstantiate(TAG, initialGameState);
if (!game || game.gameState._tag !== TAG) {
  // eslint-disable-next-line fp/no-throw
  throw new Error(`Could not instantiate game ${TAG}`);
}

let gt = shellStartMorrisGame<typeof config.params.P, typeof config.params.D, typeof config.params.N>(game);
console.log(shellRenderString(gt));

MOVES.forEach((moveStr) => {
  gt = shellTick(gt, moveStr);
  console.log('\n' + shellRenderString(gt));
  console.log(gt.message + '\n');
});
