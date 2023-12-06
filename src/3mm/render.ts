import * as P from '@konker.dev/effect-ts-prelude';
import chalk from 'chalk';

import type { MorrisBoardPoint } from '../engine/board';
import { isOccupied } from '../engine/board/points';
import { EMPTY, MorrisColor } from '../engine/consts';
import { strMorrisMove } from '../engine/moves/helpers';
import type { MorrisGameTick } from '../engine/tick';
import type { MorrisEngineError } from '../lib/error';
import type { D_3, N_3 } from './index';

export function renderOccupant(p: MorrisBoardPoint<D_3, N_3>): string {
  return isOccupied(p)
    ? p.occupant.color === MorrisColor.WHITE
      ? chalk.yellowBright(chalk.bold(p.occupant.color))
      : chalk.magentaBright(chalk.bold(p.occupant.color))
    : EMPTY;
}

export function render3mm<P extends number, D extends number, N extends number>(
  gameTick: MorrisGameTick<P, D, N>
): P.Effect.Effect<never, MorrisEngineError, void> {
  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('renderedBoard', () =>
      P.pipe(
        gameTick.game.board.points,
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
          chalk.dim('  a   b   c\n'),
        P.Effect.succeed
      )
    ),
    P.Effect.bind('strMove', () => strMorrisMove(gameTick.game, gameTick.move)),
    P.Effect.flatMap(({ renderedBoard, strMove }) => P.Console.log(`${renderedBoard}${strMove}: ${gameTick.message}\n`))
  );
}
