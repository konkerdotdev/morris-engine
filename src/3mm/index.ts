import type * as P from '@konker.dev/effect-ts-prelude';

import { MENS_MORRIS_D_3, MENS_MORRIS_P_3 } from '../boards';
import type { MorrisBoard, MorrisGame, MorrisGameConfig } from '../index';
import { EmptyMorris, MorrisColorWhite, MorrisPhaseMoving, MorrisPhasePlacing } from '../index';

// --------------------------------------------------------------------------
/*
3-Mens-Morris Board
0---1---2
| \ | / |
3---4---5
| / | \ |
6---7---8
*/
export type Board = MorrisBoard<MENS_MORRIS_P_3, MENS_MORRIS_D_3>;
export const board: P.LazyArg<Board> = () => ({
  type: MENS_MORRIS_P_3,
  dimension: MENS_MORRIS_D_3,
  points: [
    /*0*/ { x: 0, y: 0, links: [1, 3, 4] as const, occupant: EmptyMorris },
    /*1*/ { x: 1, y: 0, links: [0, 2, 4], occupant: EmptyMorris },
    /*2*/ { x: 2, y: 0, links: [1, 4, 5], occupant: EmptyMorris },
    /*3*/ { x: 0, y: 1, links: [0, 4, 6], occupant: EmptyMorris },
    /*4*/ { x: 1, y: 1, links: [0, 1, 3, 4, 5, 6, 7, 8], occupant: EmptyMorris },
    /*5*/ { x: 2, y: 1, links: [2, 4, 8], occupant: EmptyMorris },
    /*6*/ { x: 0, y: 2, links: [3, 4, 7], occupant: EmptyMorris },
    /*7*/ { x: 1, y: 2, links: [4, 6, 8], occupant: EmptyMorris },
    /*8*/ { x: 2, y: 2, links: [4, 5, 7], occupant: EmptyMorris },
  ],
});

export const config: MorrisGameConfig = {
  name: '3 Mens Morris',
  numMorrisPerPlayer: 3,
  phases: [MorrisPhasePlacing, MorrisPhaseMoving],
};

export type Game = MorrisGame<MENS_MORRIS_P_3, MENS_MORRIS_D_3>;
export const game: Game = {
  config,
  startColor: MorrisColorWhite,
  phaseIdx: 0,
  board: board(),
  moves: [],
};
