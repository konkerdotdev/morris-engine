/* eslint-disable fp/no-unused-expression,@typescript-eslint/ban-ts-comment,fp/no-let,fp/no-mutation,fp/no-nil */
import * as console from 'console';

import { renderString } from '../engine/render/text';
import { shellStartMorrisGame, shellTick, shellWrapRenderString } from '../engine/shell';
import type { params } from '../games/9mm';
import { game } from '../games/9mm';

const shellRenderString = shellWrapRenderString<typeof params.P, typeof params.D, typeof params.N>(renderString);

const MOVES = [
  'P W d7',
  'P B a7',
  'P W f6',
  'P B g7',
  'P W d5',
  'P B f4',
  'P W e3',
  'P B g1',
  'P W b2',
  'P B a1',
  'P W c4',
  'P B b6',
  'P W f2',
  'P B e4',
  'P W a4',
  'P B d2',
  'P W d3',
  'P B d6',
  'M b2 b4',
  'R f4',
  'M e4 f4',
  'M c4 c3',
  'R b6',
  'M f4 g4',
  'R f2',
  'M c3 c4',
  'R d2',
  'M g4 f4',
  'M c4 c3',
  'R f4',
  'M g7 g4',
  'M c3 c4',
  'R d6',
  'M a1 d1',
  'M c4 c3',
  'R a7',
  'M g1 c4',
  'M f6 f4',
  'M d1 g1',
  'M f4 e4',
  'M c4 g7',
  'R c3',
  'M d5 e5',
  'R g1',
];

// --------------------------------------------------------------------------
let gt = shellStartMorrisGame<typeof params.P, typeof params.D, typeof params.N>(game);
console.log(shellRenderString(gt));

MOVES.forEach((moveStr) => {
  gt = shellTick(gt, moveStr);
  console.log('\n' + shellRenderString(gt));
  console.log(gt.message + '\n');
});
