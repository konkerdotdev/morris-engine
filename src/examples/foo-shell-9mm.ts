/* eslint-disable fp/no-unused-expression,@typescript-eslint/ban-ts-comment,fp/no-let,fp/no-mutation,fp/no-nil */
import * as console from 'console';

import { renderString } from '../engine/render/text';
import { shellStartMorrisGame, shellTick, shellWrapRenderString } from '../engine/shell';
import { gamesInstantiate } from '../games';
import { initialGameState, TAG } from '../games/9mm';

const shellRenderString = shellWrapRenderString(renderString);

const MOVES = [
  '{ "type": "PLACE", "color": "W", "to": "d7" }',
  '{ "type": "PLACE", "color": "B", "to": "a7" }',
  '{ "type": "PLACE", "color": "W", "to": "f6" }',
  '{ "type": "PLACE", "color": "B", "to": "g7" }',
  '{ "type": "PLACE", "color": "W", "to": "d5" }',
  '{ "type": "PLACE", "color": "B", "to": "f4" }',
  '{ "type": "PLACE", "color": "W", "to": "e3" }',
  '{ "type": "PLACE", "color": "B", "to": "g1" }',
  '{ "type": "PLACE", "color": "W", "to": "b2" }',
  '{ "type": "PLACE", "color": "B", "to": "a1" }',
  '{ "type": "PLACE", "color": "W", "to": "c4" }',
  '{ "type": "PLACE", "color": "B", "to": "b6" }',
  '{ "type": "PLACE", "color": "W", "to": "f2" }',
  '{ "type": "PLACE", "color": "B", "to": "e4" }',
  '{ "type": "PLACE", "color": "W", "to": "a4" }',
  '{ "type": "PLACE", "color": "B", "to": "d2" }',
  '{ "type": "PLACE", "color": "W", "to": "d3" }',
  '{ "type": "PLACE", "color": "B", "to": "d6" }',
  '{ "type": "MOVE",  "from": "b2", "to": "b4" }',
  '{ "type": "REMOVE", "from": "f4" }',
  '{ "type": "MOVE",  "from": "e4", "to": "f4" }',
  '{ "type": "MOVE",  "from": "c4", "to": "c3" }',
  '{ "type": "REMOVE", "from": "b6" }',
  '{ "type": "MOVE",  "from": "f4", "to": "g4" }',
  '{ "type": "REMOVE", "from": "f2" }',
  '{ "type": "MOVE",  "from": "c3", "to": "c4" }',
  '{ "type": "REMOVE", "from": "d2" }',
  '{ "type": "MOVE",  "from": "g4", "to": "f4" }',
  '{ "type": "MOVE",  "from": "c4", "to": "c3" }',
  '{ "type": "REMOVE", "from": "f4" }',
  '{ "type": "MOVE",  "from": "g7", "to": "g4" }',
  '{ "type": "MOVE",  "from": "c3", "to": "c4" }',
  '{ "type": "REMOVE", "from": "d6" }',
  '{ "type": "MOVE",  "from": "a1", "to": "d1" }',
  '{ "type": "MOVE",  "from": "c4", "to": "c3" }',
  '{ "type": "REMOVE", "from": "a7" }',
  '{ "type": "MOVE",  "from": "g1", "to": "c4" }',
  '{ "type": "MOVE",  "from": "f6", "to": "f4" }',
  '{ "type": "MOVE",  "from": "d1", "to": "g1" }',
  '{ "type": "MOVE",  "from": "f4", "to": "e4" }',
  '{ "type": "MOVE",  "from": "c4", "to": "g7" }',
  '{ "type": "REMOVE", "from": "c3" }',
  '{ "type": "MOVE",  "from": "d5", "to": "e5" }',
  '{ "type": "REMOVE", "from": "g1" }',
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
  // console.log(JSON.stringify(gt.facts, null, 2) + '\n');
  console.log(gt.message + '\n');
});
