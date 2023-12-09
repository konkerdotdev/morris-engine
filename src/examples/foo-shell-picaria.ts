/* eslint-disable fp/no-unused-expression,@typescript-eslint/ban-ts-comment,fp/no-let,fp/no-mutation,fp/no-nil */
import * as console from 'console';

import { renderString } from '../engine/render/text';
import { shellStartMorrisGame, shellTick, shellWrapRenderString } from '../engine/shell';
import type { params } from '../games/picaria';
import { game } from '../games/picaria';

const shellRenderString = shellWrapRenderString<typeof params.P, typeof params.D, typeof params.N>(renderString);

const MOVES = ['P W b4', 'P B d2', 'P W e5', 'P B e3', 'P W c1', 'P B e1', 'M b4 c3'];

// --------------------------------------------------------------------------
let gt = shellStartMorrisGame<typeof params.P, typeof params.D, typeof params.N>(game);
console.log(shellRenderString(gt));

MOVES.forEach((moveStr) => {
  gt = shellTick(gt, moveStr);
  console.log('\n' + shellRenderString(gt));
  console.log(gt.message + '\n');
});
