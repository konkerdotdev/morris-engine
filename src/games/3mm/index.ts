import { boardHash } from '../../engine/board';
import type { MorrisBlack, MorrisBoard, MorrisWhite } from '../../engine/board/schemas';
import { EmptyOccupant } from '../../engine/board/schemas';
import { MorrisColor, MorrisLinkType, MorrisPhase } from '../../engine/consts';
import type { MorrisGame } from '../../engine/game';
import { MorrisGameBoilerplate } from '../../engine/game';
import type { MorrisGameConfig } from '../../engine/game/schemas';
import { createMorrisBlack, createMorrisWhite } from '../../engine/morris';

export const TAG = '3mm';

// Not exported
const P = 9;
type P = typeof P;
const D = 3;
type D = typeof D;
const N = 3;
type N = typeof N;

export const params = {
  P: P,
  D: D,
  N: N,
} as const;

/*
// --------------------------------------------------------------------------
// 3-Mens-Morris Board
3 o----o----o
  |  \ |  / |
2 o----o----o
  | /  |  \ |
1 o----o----o
  a    b    c
*/
function initMorrisBoard(): MorrisBoard<P, D, N> {
  return {
    numPoints: P,
    dimension: D,
    points: [
      {
        coord: 'a1',
        links: [
          { to: 'b1', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'a2', linkType: MorrisLinkType.VERTICAL },
          { to: 'b2', linkType: MorrisLinkType.DIAGONAL_F },
        ] as const,
        occupant: EmptyOccupant,
      },
      {
        coord: 'b1',
        links: [
          { to: 'a1', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'c1', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'b2', linkType: MorrisLinkType.VERTICAL },
        ],
        occupant: EmptyOccupant,
      },
      {
        coord: 'c1',
        links: [
          { to: 'b1', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'b2', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'c2', linkType: MorrisLinkType.VERTICAL },
        ],
        occupant: EmptyOccupant,
      },
      {
        coord: 'a2',
        links: [
          { to: 'a1', linkType: MorrisLinkType.VERTICAL },
          { to: 'b2', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'a3', linkType: MorrisLinkType.VERTICAL },
        ],
        occupant: EmptyOccupant,
      },
      {
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
      {
        coord: 'c2',
        links: [
          { to: 'c1', linkType: MorrisLinkType.VERTICAL },
          { to: 'b2', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'c3', linkType: MorrisLinkType.VERTICAL },
        ],
        occupant: EmptyOccupant,
      },
      {
        coord: 'a3',
        links: [
          { to: 'a2', linkType: MorrisLinkType.VERTICAL },
          { to: 'b2', linkType: MorrisLinkType.DIAGONAL_B },
          { to: 'b3', linkType: MorrisLinkType.HORIZONTAL },
        ],
        occupant: EmptyOccupant,
      },
      {
        coord: 'b3',
        links: [
          { to: 'b2', linkType: MorrisLinkType.VERTICAL },
          { to: 'a3', linkType: MorrisLinkType.HORIZONTAL },
          { to: 'c3', linkType: MorrisLinkType.HORIZONTAL },
        ],
        occupant: EmptyOccupant,
      },
      {
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
}

function initMorrisWhite(): ReadonlyArray<MorrisWhite<N>> {
  return [createMorrisWhite<N>(1), createMorrisWhite<N>(2), createMorrisWhite<N>(3)];
}

function initMorrisBlack(): ReadonlyArray<MorrisBlack<N>> {
  return [createMorrisBlack<N>(1), createMorrisBlack<N>(2), createMorrisBlack<N>(3)];
}

// --------------------------------------------------------------------------
export const config: MorrisGameConfig<D, N> = {
  name: "3 Men's Morris",
  numMorrisPerPlayer: 3,
  numMillsToWinThreshold: 1,
  numMorrisForFlyingThreshold: 0,
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
