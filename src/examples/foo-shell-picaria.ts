/* eslint-disable fp/no-unused-expression,@typescript-eslint/ban-ts-comment,fp/no-let,fp/no-mutation,fp/no-nil */
import * as console from 'console';

import { renderString } from '../engine/render/text';
import { shellStartMorrisGame, shellTick, shellWrapRenderString } from '../engine/shell';
import { gamesInstantiate } from '../games';
import { initialGameState, TAG } from '../games/picaria';

const shellRenderString = shellWrapRenderString(renderString);

const MOVES = [
  '{ "type": "PLACE", "color": "W", "to": "b4" }',
  '{ "type": "PLACE", "color": "B", "to": "d2" }',
  '{ "type": "PLACE", "color": "W", "to": "e5" }',
  '{ "type": "PLACE", "color": "B", "to": "e3" }',
  '{ "type": "PLACE", "color": "W", "to": "c1" }',
  '{ "type": "PLACE", "color": "B", "to": "e1" }',
  '{ "type": "MOVE", "from": "b4", "to": "c3" }',
  '{ "type": "MOVE", "from": "e3", "to": "d4" }',
  '{ "type": "MOVE", "from": "e5", "to": "c5" }',
];

// --------------------------------------------------------------------------
const game = gamesInstantiate(TAG, initialGameState);
if (!game || game.gameState._tag !== TAG) {
  // eslint-disable-next-line fp/no-throw
  throw new Error(`Could not instantiate game ${TAG}`);
}

let gt = shellStartMorrisGame(game);
console.log(shellRenderString(gt));

MOVES.forEach((moveStr) => {
  gt = shellTick(gt, moveStr);
  console.log('\n' + shellRenderString(gt));
  console.log(gt.message + '\n');
});
