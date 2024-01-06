/* eslint-disable fp/no-unused-expression,@typescript-eslint/ban-ts-comment,fp/no-let,fp/no-mutation,fp/no-nil */
import * as console from 'console';

import { renderString } from '../engine/render/text';
import { shellStartMorrisGame, shellTick, shellWrapRenderString } from '../engine/shell';
import { gamesInstantiate } from '../games';
import type { config } from '../games/9mm';
import { initialGameState, TAG } from '../games/9mm';

const shellRenderString = shellWrapRenderString<typeof config.params.P, typeof config.params.D, typeof config.params.N>(
  renderString
);

const MOVES = [
  'P W a7',
  'P B e5',
  'P W d3',
  'P B g7',
  'P W d5',
  'P B f4',
  'P W e4',
  'P B g1',
  'P W b2',
  'P B d7',
  'P W b4',
  'P B f6',
  'P W f2',
  'P B e3',
  'P W g4',
  'P B d2',
  'P W d1',
  'P B d6',
  'M b4 b6',
];

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
