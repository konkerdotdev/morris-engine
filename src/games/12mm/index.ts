import { boardHash } from '../../engine/board';
import type { MorrisBlack, MorrisBoard, MorrisWhite } from '../../engine/board/schemas';
import { EmptyOccupant } from '../../engine/board/schemas';
import { MorrisColor, MorrisLinkType, MorrisPhase } from '../../engine/consts';
import type { MorrisGame } from '../../engine/game';
import { MorrisGameBoilerplate } from '../../engine/game';
import type { MorrisGameConfig } from '../../engine/game/schemas';
import { createMorrisBlack, createMorrisWhite } from '../../engine/morris';

export const TAG = '12mm';

// Not exported
const P = 24;
type P = typeof P;
const D = 7;
type D = typeof D;
const N = 12;
type N = typeof N;

export const params = {
  P: P,
  D: D,
  N: N,
} as const;

/*
// --------------------------------------------------------------------------
// 12-Mens-Morris Board
7  o--------------o--------------o
   | \            |            / |
6  |    o---------o---------o    |
   |    | \       |       / |    |
5  |    |    o----o----o    |    |
   |    |    |         |    |    |
4  o----o----o         o----o----o
   |    |    |         |    |    |
3  |    |    o----o----o    |    |
   |    | /       |       \ |    |
2  |    o---------o---------o    |
   | /            |            \ |
1  o--------------o--------------o
   a    b    c    d    e    f    g
*/
export function initMorrisBoard(): MorrisBoard<P, D, N> {
  return {
    numPoints: P,
    dimension: D,
    points: [
      {
        coord: 'a1',
        links: [
          { to: 'd1', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'b2', linkType: MorrisLinkType.DIAGONAL_F },
          { to: 'a4', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'd1',
        links: [
          { to: 'a1', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'd2', linkType: MorrisLinkType.VERTICAL },
          { to: 'g1', linkType: MorrisLinkType.HORIZONTAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'g1',
        links: [
          { to: 'd1', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'f2', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'g4', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      //---
      {
        coord: 'b2',
        links: [
          { to: 'd2', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'a1', linkType: MorrisLinkType.DIAGONAL_F },
          { to: 'c3', linkType: MorrisLinkType.DIAGONAL_F },
          { to: 'b4', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'd2',
        links: [
          { to: 'b2', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'd1', linkType: MorrisLinkType.VERTICAL },
          { to: 'd3', linkType: MorrisLinkType.VERTICAL },
          { to: 'f2', linkType: MorrisLinkType.HORIZONTAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'f2',
        links: [
          { to: 'd2', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'g1', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'e3', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'f4', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      //---
      {
        coord: 'c3',
        links: [
          { to: 'd3', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'c4', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'd3',
        links: [
          { to: 'c3', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'd2', linkType: MorrisLinkType.VERTICAL },
          { to: 'e3', linkType: MorrisLinkType.HORIZONTAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'e3',
        links: [
          { to: 'd3', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'e4', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      //---
      {
        coord: 'a4',
        links: [
          { to: 'a7', linkType: MorrisLinkType.VERTICAL },
          { to: 'b4', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'a1', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'b4',
        links: [
          { to: 'a4', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'b6', linkType: MorrisLinkType.VERTICAL },
          { to: 'b2', linkType: MorrisLinkType.VERTICAL },
          { to: 'c4', linkType: MorrisLinkType.HORIZONTAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'c4',
        links: [
          { to: 'c5', linkType: MorrisLinkType.VERTICAL },
          { to: 'b4', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'c3', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'e4',
        links: [
          { to: 'e5', linkType: MorrisLinkType.VERTICAL },
          { to: 'f4', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'e3', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'f4',
        links: [
          { to: 'e4', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'f6', linkType: MorrisLinkType.VERTICAL },
          { to: 'f2', linkType: MorrisLinkType.VERTICAL },
          { to: 'g4', linkType: MorrisLinkType.HORIZONTAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'g4',
        links: [
          { to: 'g7', linkType: MorrisLinkType.VERTICAL },
          { to: 'f4', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'a7', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      //---
      {
        coord: 'c5',
        links: [
          { to: 'd5', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'b6', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'c4', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'd5',
        links: [
          { to: 'c5', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'd6', linkType: MorrisLinkType.VERTICAL },
          { to: 'e5', linkType: MorrisLinkType.HORIZONTAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'e5',
        links: [
          { to: 'd5', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'f6', linkType: MorrisLinkType.DIAGONAL_F },
          { to: 'e4', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      //---
      {
        coord: 'b6',
        links: [
          { to: 'd6', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'a7', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'c5', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'b4', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'd6',
        links: [
          { to: 'b6', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'd7', linkType: MorrisLinkType.VERTICAL },
          { to: 'd5', linkType: MorrisLinkType.VERTICAL },
          { to: 'f6', linkType: MorrisLinkType.HORIZONTAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'f6',
        links: [
          { to: 'd6', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'g7', linkType: MorrisLinkType.DIAGONAL_F },
          { to: 'd6', linkType: MorrisLinkType.DIAGONAL_F },
          { to: 'e5', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      // ---
      {
        coord: 'a7',
        links: [
          { to: 'd7', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'a4', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'd7',
        links: [
          { to: 'a7', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'd6', linkType: MorrisLinkType.VERTICAL },
          { to: 'g7', linkType: MorrisLinkType.HORIZONTAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'g7',
        links: [
          { to: 'd1', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'g4', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
    ],
    millCandidates: [
      ['a1', 'd1', 'g1'],
      ['b2', 'd2', 'f2'],
      ['c3', 'd3', 'e3'],
      ['a4', 'b4', 'c4'],
      ['e4', 'f4', 'g4'],
      ['c5', 'd5', 'e5'],
      ['b6', 'd6', 'f6'],
      ['a7', 'd7', 'g7'],
      ['a7', 'd7', 'g7'],
      //---
      ['a1', 'a4', 'a7'],
      ['b2', 'b4', 'b6'],
      ['c3', 'c4', 'c5'],
      ['d1', 'd2', 'd3'],
      ['d5', 'd6', 'd7'],
      ['e3', 'e4', 'e5'],
      ['f2', 'f4', 'f6'],
      ['g1', 'g4', 'g7'],
      //---
      ['a1', 'b2', 'c3'],
      ['g1', 'f2', 'e3'],
      ['a7', 'b6', 'c5'],
      ['g7', 'f6', 'e5'],
    ],
  };
}

function initMorrisWhite(): ReadonlyArray<MorrisWhite<N>> {
  return [
    createMorrisWhite<N>(1),
    createMorrisWhite<N>(2),
    createMorrisWhite<N>(3),
    createMorrisWhite<N>(4),
    createMorrisWhite<N>(5),
    createMorrisWhite<N>(6),
    createMorrisWhite<N>(7),
    createMorrisWhite<N>(8),
    createMorrisWhite<N>(9),
    createMorrisWhite<N>(10),
    createMorrisWhite<N>(11),
    createMorrisWhite<N>(12),
  ];
}

function initMorrisBlack(): ReadonlyArray<MorrisBlack<N>> {
  return [
    createMorrisBlack<N>(1),
    createMorrisBlack<N>(2),
    createMorrisBlack<N>(3),
    createMorrisBlack<N>(4),
    createMorrisBlack<N>(5),
    createMorrisBlack<N>(6),
    createMorrisBlack<N>(7),
    createMorrisBlack<N>(8),
    createMorrisBlack<N>(9),
    createMorrisBlack<N>(10),
    createMorrisBlack<N>(11),
    createMorrisBlack<N>(12),
  ];
}

// --------------------------------------------------------------------------
export const config: MorrisGameConfig<D, N> = {
  name: "9 Men's Morris",
  numMorrisPerPlayer: 12,
  numMillsToWinThreshold: 0,
  numMorrisForFlyingThreshold: 3,
  numMorrisToLoseThreshold: 2,
  numMovesWithoutMillForDraw: 50,
  numPositionRepeatsForDraw: 3,
  phases: [MorrisPhase.PLACING, MorrisPhase.MOVING],
  forbiddenPointsFirstMove: [],
  forbiddenPointsSecondMove: [],
  forbiddenPointsPlacingPhase: [],
};

export const game: MorrisGame<P, D, N> = {
  _tag: TAG,
  ...MorrisGameBoilerplate,
  config,
  startColor: MorrisColor.WHITE,
  board: initMorrisBoard(),
  morrisWhite: initMorrisWhite(),
  morrisBlack: initMorrisBlack(),
  positions: [boardHash(initMorrisBoard())],

  initMorrisBoard,
  initMorrisWhite,
  initMorrisBlack,
};
