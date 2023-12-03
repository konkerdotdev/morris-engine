import type { MorrisBoard, MorrisGame, MorrisGameConfig } from '../engine';
import { MorrisBlack, MorrisColor, MorrisGameResult, MorrisLinkType, MorrisPhase, MorrisWhite } from '../engine';
import { boardHash } from '../engine/board';
import { INITIAL_MORRIS_GAME_FACTS } from '../engine/rules/facts';
import { EmptyOccupant } from '../engine/schemas';

export const P_3 = 9;
export type P_3 = typeof P_3;
export const D_3 = 3;
export type D_3 = typeof D_3;
export const N_3 = 3;
export type N_3 = typeof N_3;

/*
// --------------------------------------------------------------------------
3-Mens-Morris Board
3 o---o---o
  | \ | / |
2 o---o---o
  | / | \ |
1 o---o---o
  a   b   c
*/
export const board: MorrisBoard<P_3, D_3, N_3> = {
  numPoints: P_3,
  dimension: D_3,
  points: [
    /*0*/ {
      coord: 'a1',
      links: [
        { to: 'b1', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'a2', linkType: MorrisLinkType.VERTICAL },
        { to: 'b2', linkType: MorrisLinkType.DIAGONAL_F },
      ] as const,
      occupant: EmptyOccupant,
    },
    /*1*/ {
      coord: 'b1',
      links: [
        { to: 'a1', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'c1', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'b2', linkType: MorrisLinkType.VERTICAL },
      ],
      occupant: EmptyOccupant,
    },
    /*2*/ {
      coord: 'c1',
      links: [
        { to: 'b1', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'b2', linkType: MorrisLinkType.DIAGONAL_B },
        { to: 'c2', linkType: MorrisLinkType.VERTICAL },
      ],
      occupant: EmptyOccupant,
    },
    /*3*/ {
      coord: 'a2',
      links: [
        { to: 'a1', linkType: MorrisLinkType.VERTICAL },
        { to: 'b2', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'a3', linkType: MorrisLinkType.VERTICAL },
      ],
      occupant: EmptyOccupant,
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
      occupant: EmptyOccupant,
    },
    /*5*/ {
      coord: 'c2',
      links: [
        { to: 'c1', linkType: MorrisLinkType.VERTICAL },
        { to: 'b2', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'c3', linkType: MorrisLinkType.VERTICAL },
      ],
      occupant: EmptyOccupant,
    },
    /*6*/ {
      coord: 'a3',
      links: [
        { to: 'a2', linkType: MorrisLinkType.VERTICAL },
        { to: 'b2', linkType: MorrisLinkType.DIAGONAL_B },
        { to: 'b3', linkType: MorrisLinkType.HORIZONTAL },
      ],
      occupant: EmptyOccupant,
    },
    /*7*/ {
      coord: 'b3',
      links: [
        { to: 'b2', linkType: MorrisLinkType.VERTICAL },
        { to: 'a3', linkType: MorrisLinkType.HORIZONTAL },
        { to: 'c3', linkType: MorrisLinkType.HORIZONTAL },
      ],
      occupant: EmptyOccupant,
    },
    /*8*/ {
      coord: 'c3',
      links: [
        { to: 'b2', linkType: MorrisLinkType.DIAGONAL_F },
        { to: 'c2', linkType: MorrisLinkType.VERTICAL },
        { to: 'b3', linkType: MorrisLinkType.HORIZONTAL },
      ],
      occupant: EmptyOccupant,
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
};

export const config: MorrisGameConfig<N_3> = {
  name: "3 Men's Morris",
  numMorrisPerPlayer: 3,
  numPositionRepeatsForDraw: 3,
  numMillsToWinThreshold: 1,
  flyingThreshold: 3,
  numMovesWithoutMillForDraw: 50,
  phases: [MorrisPhase.PLACING, MorrisPhase.MOVING],
};

export const game: MorrisGame<P_3, D_3, N_3> = {
  config,
  startColor: MorrisColor.WHITE,
  curMoveColor: MorrisColor.WHITE,
  gameOver: false,
  result: MorrisGameResult.IN_PROGRESS,
  lastMillCounter: 0,
  morrisWhite: [MorrisWhite(1), MorrisWhite(2), MorrisWhite(3)],
  morrisWhiteRemoved: [],
  morrisBlack: [MorrisBlack(1), MorrisBlack(2), MorrisBlack(3)],
  morrisBlackRemoved: [],
  board,
  moves: [],
  positions: [boardHash(board)],
  facts: INITIAL_MORRIS_GAME_FACTS,
};
