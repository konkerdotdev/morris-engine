/* eslint-disable fp/no-unused-expression,@typescript-eslint/ban-ts-comment,fp/no-let,fp/no-mutation,fp/no-nil */
import * as console from 'console';

import { renderString } from '../engine/render/text';
import { shellStartMorrisGame, shellTick, shellWrapRenderString } from '../engine/shell';
import type { params } from '../games/3mm';
import { game } from '../games/3mm';

const shellRenderString = shellWrapRenderString<typeof params.P, typeof params.D, typeof params.N>(renderString);

const MOVES = ['P W a1', 'P B c2', 'P W b3', 'P B c3', 'M b2 a3', 'P W b1', 'P B b2', 'M b3 a3', 'M b2 c1'];

// --------------------------------------------------------------------------
let gt = shellStartMorrisGame<typeof params.P, typeof params.D, typeof params.N>(game);
console.log(shellRenderString(gt));

MOVES.forEach((moveStr) => {
  gt = shellTick(gt, moveStr);
  console.log('\n' + shellRenderString(gt));
  console.log(gt.message + '\n');
  // console.log(gt.facts);
});
