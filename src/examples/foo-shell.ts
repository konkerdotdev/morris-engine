/* eslint-disable fp/no-unused-expression,@typescript-eslint/ban-ts-comment,fp/no-let,fp/no-mutation */
import * as console from 'console';

import type { D_3, N_3, P_3 } from '../3mm';
import { game } from '../3mm';
import { shellRenderString } from '../3mm/render';
import { shellStartMorrisGame, shellTick } from '../engine/shell';

// --------------------------------------------------------------------------
let gt = shellStartMorrisGame<P_3, D_3, N_3>(game);
console.log(shellRenderString(gt));

gt = shellTick(gt, 'P W a1');
console.log(shellRenderString(gt));

gt = shellTick(gt, 'P B c2');
console.log(shellRenderString(gt));

gt = shellTick(gt, 'P W b3');
console.log(shellRenderString(gt));

gt = shellTick(gt, 'P B c3');
console.log(shellRenderString(gt));

gt = shellTick(gt, 'M b2 a3');
console.log(shellRenderString(gt));

gt = shellTick(gt, 'P W b1');
console.log(shellRenderString(gt));

gt = shellTick(gt, 'P B b2');
console.log(shellRenderString(gt));

gt = shellTick(gt, 'M b3 a3');
console.log(shellRenderString(gt));

gt = shellTick(gt, 'M b2 c1');
console.log(shellRenderString(gt));

gt = shellTick(gt, 'M a1 b2');
console.log(shellRenderString(gt));
