import * as P from '@konker.dev/effect-ts-prelude';

import type { MENS_MORRIS_D_3, MENS_MORRIS_N_3, MENS_MORRIS_P_3 } from '../boards';
import type { MorrisBoardPoint, MorrisGame } from '../index';
import { isMorris } from '../index';

export function renderOccupant(p: MorrisBoardPoint<MENS_MORRIS_D_3, MENS_MORRIS_N_3>): string {
  return isMorris(p.occupant) ? p.occupant.color : 'o';
}

export function unsafe_render(game: MorrisGame<MENS_MORRIS_P_3, MENS_MORRIS_D_3, MENS_MORRIS_N_3>): string {
  return P.pipe(
    game.board.points.map(renderOccupant),
    (os) =>
      '3 ' +
      os[6] +
      '---' +
      os[7] +
      '---' +
      os[8] +
      '\n' +
      '  | \\ | / |\n' +
      '2 ' +
      os[3] +
      '---' +
      os[4] +
      '---' +
      os[5] +
      '\n' +
      '  | / | \\ |\n' +
      '1 ' +
      os[0] +
      '---' +
      os[1] +
      '---' +
      os[2] +
      '\n' +
      '  a   b   c\n'
  );
}

export function render(
  game: MorrisGame<MENS_MORRIS_P_3, MENS_MORRIS_D_3, MENS_MORRIS_N_3>
): P.Effect.Effect<never, Error, string> {
  return P.pipe(unsafe_render(game), P.Effect.succeed);
}
