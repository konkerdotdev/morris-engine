import type * as P from '@konker.dev/effect-ts-prelude';

import type { MENS_MORRIS_N_3 } from '../boards';
import { MENS_MORRIS_D_3, MENS_MORRIS_P_3 } from '../boards';
import type { MorrisBoard, MorrisGame, MorrisGameConfig } from '../index';
import { MorrisColor, MorrisEmpty, MorrisLinkType, MorrisPhase } from '../index';

// --------------------------------------------------------------------------
/*
3-Mens-Morris Board
3 o---o---o
  | \ | / |
2 o---o---o
  | / | \ |
1 o---o---o
  a   b   c
*/
/*
3-Mens-Morris Board
6---7---8
| \ | / |
3---4---5
| / | \ |
0---1---2
*/
export type Board = MorrisBoard<MENS_MORRIS_P_3, MENS_MORRIS_D_3, MENS_MORRIS_N_3>;
export const board: P.LazyArg<Board> = () => ({
  type: MENS_MORRIS_P_3,
  dimension: MENS_MORRIS_D_3,
  points: [
    /*0*/ {
      coord: 'a1',
      links: [
        { to: 'b1', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'a2', linkType: MorrisLinkType.VERTICAL },
        { to: 'b2', linkType: MorrisLinkType.DIAGONAL_F },
      ] as const,
      occupant: MorrisEmpty,
    },
    /*1*/ {
      coord: 'b1',
      links: [
        { to: 'a1', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'c1', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'b2', linkType: MorrisLinkType.VERTICAL },
      ],
      occupant: MorrisEmpty,
    },
    /*2*/ {
      coord: 'c1',
      links: [
        { to: 'b1', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'b2', linkType: MorrisLinkType.DIAGONAL_B },
        { to: 'c2', linkType: MorrisLinkType.VERTICAL },
      ],
      occupant: MorrisEmpty,
    },
    /*3*/ {
      coord: 'a2',
      links: [
        { to: 'a1', linkType: MorrisLinkType.VERTICAL },
        { to: 'b2', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'a3', linkType: MorrisLinkType.VERTICAL },
      ],
      occupant: MorrisEmpty,
    },
    /*4*/ {
      coord: 'b2',
      links: [
        { to: 'a1', linkType: MorrisLinkType.DIAGONAL_F },
        { to: 'b1', linkType: MorrisLinkType.VERTICAL },
        { to: 'c1', linkType: MorrisLinkType.DIAGONAL_B },
        { to: 'a2', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'c2', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'a3', linkType: MorrisLinkType.DIAGONAL_B },
        { to: 'b3', linkType: MorrisLinkType.VERTICAL },
        { to: 'c3', linkType: MorrisLinkType.DIAGONAL_F },
      ],
      occupant: MorrisEmpty,
    },
    /*5*/ {
      coord: 'c2',
      links: [
        { to: 'c1', linkType: MorrisLinkType.VERTICAL },
        { to: 'b2', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'c3', linkType: MorrisLinkType.VERTICAL },
      ],
      occupant: MorrisEmpty,
    },
    /*6*/ {
      coord: 'a3',
      links: [
        { to: 'a2', linkType: MorrisLinkType.VERTICAL },
        { to: 'b2', linkType: MorrisLinkType.DIAGONAL_B },
        { to: 'b3', linkType: MorrisLinkType.HORIZONTAL },
      ],
      occupant: MorrisEmpty,
    },
    /*7*/ {
      coord: 'b3',
      links: [
        { to: 'b2', linkType: MorrisLinkType.VERTICAL },
        { to: 'a3', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'c3', linkType: MorrisLinkType.HORIZONTAL },
      ],
      occupant: MorrisEmpty,
    },
    /*8*/ {
      coord: 'c3',
      links: [
        { to: 'b2', linkType: MorrisLinkType.DIAGONAL_F },
        { to: 'c2', linkType: MorrisLinkType.VERTICAL },
        { to: 'b3', linkType: MorrisLinkType.HORIZONTAL },
      ],
      occupant: MorrisEmpty,
    },
  ],
  mills: [
    ['a1', 'b1', 'c1'],
    ['a2', 'b2', 'c2'],
    ['a3', 'b3', 'c3'],
    ['a1', 'a2', 'a3'],
    ['b1', 'b2', 'b3'],
    ['c1', 'c2', 'c3'],
    ['a1', 'b2', 'c3'],
    ['c1', 'b2', 'a3'],
  ],
});

export const config: MorrisGameConfig<MENS_MORRIS_N_3> = {
  name: '3 Mens Morris',
  numMorrisPerPlayer: 3,
  phases: [MorrisPhase.PLACING, MorrisPhase.MOVING],
};

export type Game = MorrisGame<MENS_MORRIS_P_3, MENS_MORRIS_D_3, MENS_MORRIS_N_3>;
export const game: Game = {
  config,
  startColor: MorrisColor.WHITE,
  phaseIdx: 0,
  board: board(),
  moves: [],
};
