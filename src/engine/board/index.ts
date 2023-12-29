import type { RepeatString, Tuple } from '../../lib/type-utils';
import type { MorrisLinkType, THREE } from '../consts';
import { EMPTY, MORRIS } from '../consts';
import type { Morris } from '../morris';
import type { EmptyOccupant, MorrisBoardCoordS } from './schemas';

// --------------------------------------------------------------------------
export type MorrisBoardPointOccupant<N extends number> = EmptyOccupant | Morris<N>;

export type MorrisBoardLink<D extends number> = {
  readonly to: MorrisBoardCoordS<D>;
  readonly linkType: MorrisLinkType;
};

export type MorrisBoardPoint<D extends number, N extends number> = {
  readonly coord: MorrisBoardCoordS<D>;
  readonly links: ReadonlyArray<MorrisBoardLink<D>>;
  readonly occupant: MorrisBoardPointOccupant<N>;
};

export type OccupiedBoardPoint<D extends number, N extends number> = Omit<MorrisBoardPoint<D, N>, 'occupant'> & {
  readonly occupant: Morris<N>;
};

export function isOccupiedBoardPoint<D extends number, N extends number>(
  x: MorrisBoardPoint<D, N>
): x is OccupiedBoardPoint<D, N> {
  return x.occupant._tag === MORRIS;
}

export type MillCandidate<D extends number> = Tuple<MorrisBoardCoordS<D>, THREE>;

export type MorrisBoard<P extends number, D extends number, N extends number> = {
  readonly numPoints: P;
  readonly dimension: D;
  readonly points: Tuple<MorrisBoardPoint<D, N>, P>;
  readonly millCandidates: ReadonlyArray<MillCandidate<D>>;
};

export type MorrisBoardPositionString<P extends number> = RepeatString<
  // Having B|W|EMPTY is too complex for the type system to handle.
  string, //MorrisColor.BLACK | MorrisColor.WHITE | EMPTY,
  P
>;

export function boardHash<P extends number, D extends number, N extends number>(
  board: MorrisBoard<P, D, N>
): MorrisBoardPositionString<P> {
  return board.points.reduce(
    (acc, val) => `${acc}${isOccupiedBoardPoint(val) ? val.occupant.color : EMPTY}`,
    ''
  ) as MorrisBoardPositionString<P>;
}
