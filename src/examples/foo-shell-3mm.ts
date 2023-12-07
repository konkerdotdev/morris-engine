/* eslint-disable fp/no-unused-expression,@typescript-eslint/ban-ts-comment,fp/no-let,fp/no-mutation */
import * as console from 'console';

import type { D_3, N_3, P_3 } from '../3mm';
import { game } from '../3mm';
import { renderString } from '../engine/render/text';
import { shellStartMorrisGame, shellTick, shellWrapRenderString } from '../engine/shell';

const shellRenderString = shellWrapRenderString<P_3, D_3, N_3>(renderString);

const MOVES = ['P W a1', 'P B c2', 'P W b3', 'P B c3', 'M b2 a3', 'P W b1', 'P B b2', 'M b3 a3', 'M b2 c1', 'M a1 b2'];

// --------------------------------------------------------------------------
let gt = shellStartMorrisGame<P_3, D_3, N_3>(game);
console.log(shellRenderString(gt));

MOVES.forEach((moveStr) => {
  gt = shellTick(gt, moveStr);
  console.log('\n' + shellRenderString(gt));
  console.log(gt.message + '\n');
});
