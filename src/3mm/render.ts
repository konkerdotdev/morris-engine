import * as P from '@konker.dev/effect-ts-prelude';
import chalk from 'chalk';

import type { MENS_MORRIS_D_3, MENS_MORRIS_N_3, MENS_MORRIS_P_3 } from '../boards';
import type { MorrisBoardPoint, MorrisGame } from '../index';
import { EMPTY, isMorris, MorrisColor } from '../index';

export function renderOccupant(p: MorrisBoardPoint<MENS_MORRIS_D_3, MENS_MORRIS_N_3>): string {
  return isMorris(p.occupant)
    ? p.occupant.color === MorrisColor.WHITE
      ? chalk.yellowBright(chalk.bold(p.occupant.color))
      : chalk.magentaBright(chalk.bold(p.occupant.color))
    : EMPTY;
}

export function unsafe_render(game: MorrisGame<MENS_MORRIS_P_3, MENS_MORRIS_D_3, MENS_MORRIS_N_3>): string {
  return P.pipe(
    game.board.points.map(renderOccupant),
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

export function render(
  game: MorrisGame<MENS_MORRIS_P_3, MENS_MORRIS_D_3, MENS_MORRIS_N_3>
): P.Effect.Effect<never, Error, string> {
  return P.pipe(unsafe_render(game), P.Effect.succeed);
}
