import { boardHash } from '../../engine/board';
import type { MorrisBlack, MorrisBoard, MorrisWhite } from '../../engine/board/schemas';
import { EmptyOccupant } from '../../engine/board/schemas';
import { MorrisColor, MorrisLinkType, MorrisPhase } from '../../engine/consts';
import type { MorrisGame } from '../../engine/game';
import { MorrisGameBoilerplate } from '../../engine/game';
import type { MorrisGameConfig } from '../../engine/game/schemas';
import { createMorrisBlack, createMorrisWhite } from '../../engine/morris';

export const TAG = 'picaria';

// Not exported
const P = 13;
type P = typeof P;
const D = 5;
type D = typeof D;
const N = 3;
type N = typeof N;

export const params = {
  P,
  D,
  N,
} as const;

/*
// --------------------------------------------------------------------------
// Picaria Board
5 o---------o---------o
  |  \   /  |  \   /  |
4 |    o    |    o    |
  | /    \  |  /   \  |
3 o---------o---------o
  |  \   /  | \    /  |
2 |    o    |    o    |
  |  /   \  |  /   \  |
1 o---------o---------o
  a    b    c    d    e
*/
export function initMorrisBoard(): MorrisBoard<P, D, N> {
  return {
    numPoints: P,
    dimension: D,
    points: [
      {
        coord: 'a1',
        links: [
          { to: 'a3', linkType: MorrisLinkType.VERTICAL },
          { to: 'b2', linkType: MorrisLinkType.DIAGONAL_F },
          { to: 'c1', linkType: MorrisLinkType.HORIZONTAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'c1',
        links: [
          { to: 'a1', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'b2', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'c3', linkType: MorrisLinkType.VERTICAL },
          { to: 'd2', linkType: MorrisLinkType.DIAGONAL_F },
          { to: 'e1', linkType: MorrisLinkType.HORIZONTAL },
        ],
        occupant: EmptyOccupant,
      },
      {
        coord: 'e1',
        links: [
          { to: 'c1', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'd2', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'e3', linkType: MorrisLinkType.VERTICAL },
        ],
        occupant: EmptyOccupant,
      },
      {
        coord: 'b2',
        links: [
          { to: 'a1', linkType: MorrisLinkType.DIAGONAL_F },
          { to: 'c1', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'a3', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'c3', linkType: MorrisLinkType.DIAGONAL_F },
        ],
        occupant: EmptyOccupant,
      },
      {
        coord: 'd2',
        links: [
          { to: 'c1', linkType: MorrisLinkType.DIAGONAL_F },
          { to: 'e1', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'c3', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'e3', linkType: MorrisLinkType.DIAGONAL_F },
        ],
        occupant: EmptyOccupant,
      },
      {
        coord: 'a3',
        links: [
          { to: 'a5', linkType: MorrisLinkType.VERTICAL },
          { to: 'b4', linkType: MorrisLinkType.DIAGONAL_F },
          { to: 'c3', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'b2', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'a1', linkType: MorrisLinkType.VERTICAL },
        ],
        occupant: EmptyOccupant,
      },
      {
        coord: 'c3',
        links: [
          { to: 'a3', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'b4', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'c5', linkType: MorrisLinkType.VERTICAL },
          { to: 'd4', linkType: MorrisLinkType.DIAGONAL_F },
          { to: 'e3', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'd2', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'c1', linkType: MorrisLinkType.VERTICAL },
          { to: 'b2', linkType: MorrisLinkType.DIAGONAL_F },
        ],
        occupant: EmptyOccupant,
      },
      {
        coord: 'e3',
        links: [
          { to: 'e1', linkType: MorrisLinkType.VERTICAL },
          { to: 'd2', linkType: MorrisLinkType.DIAGONAL_F },
          { to: 'c3', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'd4', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'e5', linkType: MorrisLinkType.VERTICAL },
        ],
        occupant: EmptyOccupant,
      },
      {
        coord: 'b4',
        links: [
          { to: 'a3', linkType: MorrisLinkType.DIAGONAL_F },
          { to: 'c3', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'a5', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'c5', linkType: MorrisLinkType.DIAGONAL_F },
        ],
        occupant: EmptyOccupant,
      },
      {
        coord: 'd4',
        links: [
          { to: 'c3', linkType: MorrisLinkType.DIAGONAL_F },
          { to: 'e3', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'c5', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'e5', linkType: MorrisLinkType.DIAGONAL_F },
        ],
        occupant: EmptyOccupant,
      },
      {
        coord: 'a5',
        links: [
          { to: 'a3', linkType: MorrisLinkType.VERTICAL },
          { to: 'b4', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'c5', linkType: MorrisLinkType.HORIZONTAL },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'c5',
        links: [
          { to: 'a5', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'b4', linkType: MorrisLinkType.DIAGONAL_F },
          { to: 'c3', linkType: MorrisLinkType.VERTICAL },
          { to: 'd4', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'e5', linkType: MorrisLinkType.HORIZONTAL },
        ],
        occupant: EmptyOccupant,
      },
      {
        coord: 'e5',
        links: [
          { to: 'c5', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'd4', linkType: MorrisLinkType.DIAGONAL_F },
          { to: 'e3', linkType: MorrisLinkType.VERTICAL },
        ],
        occupant: EmptyOccupant,
      },
    ],
    millCandidates: [
      // h
      ['a1', 'c1', 'e1'],
      ['a3', 'c3', 'e3'],
      ['a5', 'c5', 'e5'],
      // v
      ['a1', 'a3', 'a5'],
      ['c1', 'c3', 'c5'],
      ['e1', 'e3', 'e5'],
      // d
      ['a3', 'b4', 'c5'],
      ['c5', 'd4', 'e3'],
      ['a3', 'b2', 'c1'],
      ['c1', 'd2', 'e3'],
      // xb
      ['a5', 'b4', 'c3'],
      ['b4', 'c3', 'd2'],
      ['c3', 'd2', 'e1'],
      // xf
      ['e5', 'd4', 'c3'],
      ['d4', 'c3', 'b2'],
      ['c3', 'b2', 'a1'],
    ],
  };
}

function initMorrisWhite(): ReadonlyArray<MorrisWhite<N>> {
  return [createMorrisWhite<N>(1), createMorrisWhite<N>(2), createMorrisWhite<N>(3)];
}

function initMorrisBlack(): ReadonlyArray<MorrisBlack<N>> {
  return [createMorrisBlack<N>(1), createMorrisBlack<N>(2), createMorrisBlack<N>(3)];
}

// --------------------------------------------------------------------------
export const config: MorrisGameConfig<D, N> = {
  name: 'Picaria',
  numMorrisPerPlayer: 3,
  numMillsToWinThreshold: 1,
  numMorrisForFlyingThreshold: 0,
  numMorrisToLoseThreshold: 2,
  numMovesWithoutMillForDraw: 50,
  numPositionRepeatsForDraw: 3,
  phases: [MorrisPhase.PLACING, MorrisPhase.MOVING],
  forbiddenPointsFirstMove: [],
  forbiddenPointsSecondMove: [],
  forbiddenPointsPlacingPhase: ['c3'],
};

export const game: MorrisGame<P, D, N> = {
  _tag: TAG,
  ...MorrisGameBoilerplate,
  config,
  startColor: MorrisColor.WHITE,
  board: initMorrisBoard(),
  morrisBlack: initMorrisBlack(),
  morrisWhite: initMorrisWhite(),
  positions: [boardHash(initMorrisBoard())],

  initMorrisBoard,
  initMorrisWhite,
  initMorrisBlack,
};
