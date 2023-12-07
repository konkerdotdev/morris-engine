import * as P from '@konker.dev/effect-ts-prelude';
import chalk from 'chalk';

import type { MorrisBoardPoint } from '../engine/board';
import { isOccupied } from '../engine/board/points';
import { EMPTY, MorrisColor } from '../engine/consts';
import { shellRenderString } from '../engine/shell';
import type { MorrisGameTick } from '../engine/tick';
import type { MorrisEngineError } from '../lib/error';
import type { D_3, N_3, P_3 } from './index';

export function renderOccupant(p: MorrisBoardPoint<D_3, N_3>): string {
  return isOccupied(p)
    ? p.occupant.color === MorrisColor.WHITE
      ? chalk.bgYellow(chalk.hex('#0000ff').bold('●'))
      : chalk.bgYellow(chalk.hex('#ff0000').bold('●'))
    : chalk.bgYellow(chalk.black('⦁'));
}

export function renderString3mm<P extends number, D extends number, N extends number>(
  gameTick: MorrisGameTick<P, D, N>
): P.Effect.Effect<never, MorrisEngineError, string> {
  return P.pipe(
    gameTick.game.board.points,
    P.ReadonlyArray.map(renderOccupant),
    (os) =>
      chalk.dim('3 ') +
      chalk.bgYellow(' ') +
      os[6] +
      chalk.bgYellow(chalk.black.dim('───')) +
      os[7] +
      chalk.bgYellow(chalk.black.dim('───')) +
      os[8] +
      chalk.bgYellow(' ') +
      '\n' +
      '  ' +
      chalk.bgYellow(chalk.black.dim(' │ ╲ │ ╱ │ ')) +
      '\n' +
      chalk.dim('2 ') +
      chalk.bgYellow(' ') +
      os[3] +
      chalk.bgYellow(chalk.black.dim('───')) +
      os[4] +
      chalk.bgYellow(chalk.black.dim('───')) +
      os[5] +
      chalk.bgYellow(' ') +
      '\n' +
      '  ' +
      chalk.bgYellow(chalk.black.dim(' │ ╱ │ ╲ │ ')) +
      '\n' +
      chalk.dim('1 ') +
      chalk.bgYellow(' ') +
      os[0] +
      chalk.bgYellow(chalk.black.dim('───')) +
      os[1] +
      chalk.bgYellow(chalk.black.dim('───')) +
      os[2] +
      chalk.bgYellow(' ') +
      '\n' +
      chalk.dim('   a   b   c\n'),
    P.Effect.succeed
  );
}

export const shellRenderString3mm = shellRenderString<P_3, D_3, N_3>(renderString3mm);
