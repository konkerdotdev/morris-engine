import type { RepeatString, Tuple } from '../../lib/type-utils';
import type { MorrisLinkType, THREE } from '../consts';
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

export type MillCandidate<D extends number> = Tuple<MorrisBoardCoordS<D>, THREE>;

export type MorrisBoard<P extends number, D extends number, N extends number> = {
  readonly numPoints: P;
  readonly dimension: D;
  readonly points: Tuple<MorrisBoardPoint<D, N>, P>;
  readonly millCandidates: ReadonlyArray<MillCandidate<D>>;
};

// Having B|W|EMPTY is too complex for the type system to handle.
export type MorrisBoardPositionString<P extends number> = RepeatString<
  string, //MorrisColor.BLACK | MorrisColor.WHITE | EMPTY,
  P
>;
