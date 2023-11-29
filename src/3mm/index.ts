import type * as P from '@konker.dev/effect-ts-prelude';

import { boardHash } from '../functions';
import type { MorrisBoard, MorrisGame, MorrisGameConfig } from '../index';
import { EmptyPoint, MorrisBlack, MorrisColor, MorrisLinkType, MorrisPhase, MorrisWhite } from '../index';
import { INITIAL_MORRIS_GAME_FACTS } from '../rules';

/*
export const MENS_MORRIS_P_3 = 9;
export type MENS_MORRIS_P_3 = typeof MENS_MORRIS_P_3;
export const MENS_MORRIS_D_3 = 3;
export type MENS_MORRIS_D_3 = typeof MENS_MORRIS_D_3;
export const MENS_MORRIS_N_3 = 3;
export type MENS_MORRIS_N_3 = typeof MENS_MORRIS_N_3;

export const PP = MENS_MORRIS_P_3;
export type PP = MENS_MORRIS_P_3;
export const DD = MENS_MORRIS_D_3;
export type DD = MENS_MORRIS_D_3;
export const NN = MENS_MORRIS_N_3;
export type NN = MENS_MORRIS_N_3;
*/
export const PP = 9;
export type PP = typeof PP;
export const DD = 3;
export type DD = typeof DD;
export const NN = 3;
export type NN = typeof NN;

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
export type Board = MorrisBoard<PP, DD, NN>;
export const board: P.LazyArg<Board> = () => ({
  type: PP,
  dimension: DD,
  points: [
    /*0*/ {
      coord: 'a1',
      links: [
        { to: 'b1', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'a2', linkType: MorrisLinkType.VERTICAL },
        { to: 'b2', linkType: MorrisLinkType.DIAGONAL_F },
      ] as const,
      occupant: EmptyPoint,
    },
    /*1*/ {
      coord: 'b1',
      links: [
        { to: 'a1', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'c1', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'b2', linkType: MorrisLinkType.VERTICAL },
      ],
      occupant: EmptyPoint,
    },
    /*2*/ {
      coord: 'c1',
      links: [
        { to: 'b1', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'b2', linkType: MorrisLinkType.DIAGONAL_B },
        { to: 'c2', linkType: MorrisLinkType.VERTICAL },
      ],
      occupant: EmptyPoint,
    },
    /*3*/ {
      coord: 'a2',
      links: [
        { to: 'a1', linkType: MorrisLinkType.VERTICAL },
        { to: 'b2', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'a3', linkType: MorrisLinkType.VERTICAL },
      ],
      occupant: EmptyPoint,
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
      occupant: EmptyPoint,
    },
    /*5*/ {
      coord: 'c2',
      links: [
        { to: 'c1', linkType: MorrisLinkType.VERTICAL },
        { to: 'b2', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'c3', linkType: MorrisLinkType.VERTICAL },
      ],
      occupant: EmptyPoint,
    },
    /*6*/ {
      coord: 'a3',
      links: [
        { to: 'a2', linkType: MorrisLinkType.VERTICAL },
        { to: 'b2', linkType: MorrisLinkType.DIAGONAL_B },
        { to: 'b3', linkType: MorrisLinkType.HORIZONTAL },
      ],
      occupant: EmptyPoint,
    },
    /*7*/ {
      coord: 'b3',
      links: [
        { to: 'b2', linkType: MorrisLinkType.VERTICAL },
        { to: 'a3', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'c3', linkType: MorrisLinkType.HORIZONTAL },
      ],
      occupant: EmptyPoint,
    },
    /*8*/ {
      coord: 'c3',
      links: [
        { to: 'b2', linkType: MorrisLinkType.DIAGONAL_F },
        { to: 'c2', linkType: MorrisLinkType.VERTICAL },
        { to: 'b3', linkType: MorrisLinkType.HORIZONTAL },
      ],
      occupant: EmptyPoint,
    },
  ],
  millCandidates: [
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

export const config: MorrisGameConfig<NN> = {
  name: '3 Mens Morris',
  numMorrisPerPlayer: 3,
  numPositionRepeatsForDraw: 3,
  numMillsToWinThreshold: 1,
  flyingThreshold: 3,
  numMovesWithoutMillForDraw: 50,
  phases: [MorrisPhase.PLACING, MorrisPhase.MOVING],
};

export type Game = MorrisGame<PP, DD, NN>;
export const game: Game = {
  config,
  startColor: MorrisColor.WHITE,
  curMoveColor: MorrisColor.WHITE,
  gameOver: false,
  lastMillCounter: 0,
  morrisWhite: [MorrisWhite(1), MorrisWhite(2), MorrisWhite(3)],
  morrisBlack: [MorrisBlack(1), MorrisBlack(2), MorrisBlack(3)],
  board: board(),
  moves: [],
  positions: [boardHash(board())],
  facts: INITIAL_MORRIS_GAME_FACTS,
};
