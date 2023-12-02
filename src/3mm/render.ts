import * as P from '@konker.dev/effect-ts-prelude';
import chalk from 'chalk';

import type { MorrisBoardPoint, MorrisGame } from '../engine';
import { EMPTY, MorrisColor } from '../engine';
import { isMorris } from '../engine/points';
import type { D_3, N_3, P_3 } from './index';

export function renderOccupant(p: MorrisBoardPoint<D_3, N_3>): string {
  return isMorris(p.occupant)
    ? p.occupant.color === MorrisColor.WHITE
      ? chalk.yellowBright(chalk.bold(p.occupant.color))
      : chalk.magentaBright(chalk.bold(p.occupant.color))
    : EMPTY;
}

export function render(game: MorrisGame<P_3, D_3, N_3>): string {
  return P.pipe(
    game.board.points,
    P.ReadonlyArray.map(renderOccupant),
    (os) =>
      chalk.dim('3 ') +
      os[6] +
      '---' +
      os[7] +
      '---' +
      os[8] +
      '\n' +
      '  | \\ | / |\n' +
      chalk.dim('2 ') +
      os[3] +
      '---' +
      os[4] +
      '---' +
      os[5] +
      '\n' +
      '  | / | \\ |\n' +
      chalk.dim('1 ') +
      os[0] +
      '---' +
      os[1] +
      '---' +
      os[2] +
      '\n' +
      chalk.dim('  a   b   c\n')
  );
}

export function renderE(game: MorrisGame<P_3, D_3, N_3>): P.Effect.Effect<never, Error, string> {
  return P.pipe(render(game), P.Effect.succeed);
}
