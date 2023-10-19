import type * as P from './effect-prelude';
import type { MorrisBoard } from './index';
import { EmptyMorris } from './index';

export const MENS_MORRIS_P_3 = 9;
export type MENS_MORRIS_P_3 = typeof MENS_MORRIS_P_3;
export const MENS_MORRIS_D_3 = 3;
export type MENS_MORRIS_D_3 = typeof MENS_MORRIS_D_3;

export const MENS_MORRIS_P_6 = 16;
export type MENS_MORRIS_P_6 = typeof MENS_MORRIS_P_6;
export const MENS_MORRIS_D_6 = 5;
export type MENS_MORRIS_D_6 = typeof MENS_MORRIS_D_6;

export const MENS_MORRIS_P_9 = 24;
export type MENS_MORRIS_P_9 = typeof MENS_MORRIS_P_9;
export const MENS_MORRIS_D_9 = 7;
export type MENS_MORRIS_D_9 = typeof MENS_MORRIS_D_9;

export const MENS_MORRIS_P_12 = 24;
export type MENS_MORRIS_P_12 = typeof MENS_MORRIS_P_12;
export const MENS_MORRIS_D_12 = 7;
export type MENS_MORRIS_D_12 = typeof MENS_MORRIS_D_12;

// --------------------------------------------------------------------------
/*
3-Mens-Morris Board
0---1---2
| \ | / |
3---4---5
| / | \ |
6---7---8

*/

export const EmptyMensMorris3Board: P.LazyArg<MorrisBoard<MENS_MORRIS_P_3, MENS_MORRIS_D_3>> = () => ({
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
