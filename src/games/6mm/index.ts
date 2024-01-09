import type { BoardDim, NumMorris, NumPoints } from '../../engine';
import { boardHash } from '../../engine/board';
import type { MorrisBlack, MorrisBoard, MorrisWhite } from '../../engine/board/schemas';
import { EmptyOccupant } from '../../engine/board/schemas';
import { MorrisColor, MorrisLinkType, MorrisPhase } from '../../engine/consts';
import type { MorrisGame } from '../../engine/game';
import { MorrisGameStateBoilerplate } from '../../engine/game';
import type { MorrisGameConfig, MorrisGameState } from '../../engine/game/schemas';
import { createMorrisBlack, createMorrisWhite } from '../../engine/morris';

export const TAG = '6mm';
export type TAG = typeof TAG;

// Not exported
const P = 16 as NumPoints;
const D = 5 as BoardDim;
const N = 6 as NumMorris;

/*
// --------------------------------------------------------------------------
// 6-Mens-Morris Board
5 o---------o---------o
  |         |         |
4 |    o----o----o    |
  |    |         |    |
3 o----o         o----o
  |    |         |    |
2 |    o----o----o    |
  |         |         |
1 o---------o---------o
  a    b    c    d    e
*/
function initMorrisBoard(): MorrisBoard {
  return {
    numPoints: P,
    dimension: D,
    points: [
      {
        coord: 'a1',
        links: [
          { to: 'c1', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'a3', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'c1',
        links: [
          { to: 'a1', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'c2', linkType: MorrisLinkType.VERTICAL },
          { to: 'e1', linkType: MorrisLinkType.HORIZONTAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'e1',
        links: [
          { to: 'c1', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'e3', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      //---
      {
        coord: 'b2',
        links: [
          { to: 'c2', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'b3', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'c2',
        links: [
          { to: 'b2', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'c1', linkType: MorrisLinkType.VERTICAL },
          { to: 'd2', linkType: MorrisLinkType.HORIZONTAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'd2',
        links: [
          { to: 'c2', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'd3', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      //---
      {
        coord: 'a3',
        links: [
          { to: 'a5', linkType: MorrisLinkType.VERTICAL },
          { to: 'b3', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'a1', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'b3',
        links: [
          { to: 'a3', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'b4', linkType: MorrisLinkType.VERTICAL },
          { to: 'b2', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'd3',
        links: [
          { to: 'd4', linkType: MorrisLinkType.VERTICAL },
          { to: 'e3', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'd2', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'e3',
        links: [
          { to: 'e5', linkType: MorrisLinkType.VERTICAL },
          { to: 'd3', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'e1', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      //---
      {
        coord: 'b4',
        links: [
          { to: 'c4', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'b3', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'c4',
        links: [
          { to: 'b4', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'c5', linkType: MorrisLinkType.VERTICAL },
          { to: 'd4', linkType: MorrisLinkType.HORIZONTAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'd4',
        links: [
          { to: 'c4', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'd3', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      //---
      {
        coord: 'a5',
        links: [
          { to: 'c5', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'a3', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'c5',
        links: [
          { to: 'a5', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'c4', linkType: MorrisLinkType.VERTICAL },
          { to: 'e5', linkType: MorrisLinkType.HORIZONTAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'e5',
        links: [
          { to: 'c5', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'e3', linkType: MorrisLinkType.VERTICAL },
        ] as const,
        occupant: EmptyOccupant,
      },
    ],
    millCandidates: [
      ['a1', 'c1', 'e1'],
      ['b2', 'c2', 'd2'],
      ['b4', 'c4', 'd4'],
      ['a5', 'c5', 'e5'],
      //---
      ['a1', 'a3', 'a5'],
      ['b2', 'b3', 'b4'],
      ['d2', 'd3', 'd4'],
      ['e1', 'e3', 'e5'],
    ],
  };
}

function initMorrisWhite(): ReadonlyArray<MorrisWhite> {
  return [
    createMorrisWhite(1),
    createMorrisWhite(2),
    createMorrisWhite(3),
    createMorrisWhite(4),
    createMorrisWhite(5),
    createMorrisWhite(6),
  ];
}

function initMorrisBlack(): ReadonlyArray<MorrisBlack> {
  return [
    createMorrisBlack(1),
    createMorrisBlack(2),
    createMorrisBlack(3),
    createMorrisBlack(4),
    createMorrisBlack(5),
    createMorrisBlack(6),
  ];
}

// --------------------------------------------------------------------------
export const config: MorrisGameConfig = {
  name: "6 Men's Morris",
  numMorrisPerPlayer: N,
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

export const initialGameState: MorrisGameState = {
  _tag: TAG,
  ...MorrisGameStateBoilerplate,
  config,
  startColor: MorrisColor.WHITE,
  board: initMorrisBoard(),
  morrisWhite: initMorrisWhite(),
  morrisBlack: initMorrisBlack(),
  positions: [boardHash(initMorrisBoard())],
};

export function Game6mm(gameState: MorrisGameState = initialGameState): MorrisGame {
  return {
    gameState,
    initMorrisBoard,
    initMorrisWhite,
    initMorrisBlack,
  };
}
export type Game6mm = ReturnType<typeof Game6mm>;

export const Game = Game6mm;
