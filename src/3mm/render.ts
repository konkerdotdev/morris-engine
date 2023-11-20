import type { MENS_MORRIS_D_3, MENS_MORRIS_N_3, MENS_MORRIS_P_3 } from '../boards';
import { point } from '../functions';
import type { MorrisGame } from '../index';

export function render(game: MorrisGame<MENS_MORRIS_P_3, MENS_MORRIS_D_3, MENS_MORRIS_N_3>): string {
  return (
    '3 ' +
    point(game.board, 'a3')?.occupant?.color +
    '---' +
    point(game.board, 'b3')?.occupant?.color +
    '---' +
    point(game.board, 'c3')?.occupant?.color +
    '\n' +
    '  | \\ | / |\n' +
    '2 ' +
    point(game.board, 'a2')?.occupant?.color +
    '---' +
    point(game.board, 'b2')?.occupant?.color +
    '---' +
    point(game.board, 'c2')?.occupant?.color +
    '\n' +
    '  | / | \\ |\n' +
    '1 ' +
    point(game.board, 'a1')?.occupant?.color +
    '---' +
    point(game.board, 'b1')?.occupant?.color +
    '---' +
    point(game.board, 'c1')?.occupant?.color +
    '\n' +
    '  a   b   c'
  );
}
