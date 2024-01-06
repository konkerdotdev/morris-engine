import * as P from '@konker.dev/effect-ts-prelude';

import { COORD_CHARS, EMPTY, MORRIS, MorrisColor, MorrisLinkType, THREE } from '../consts';

export const MorrisColorS = P.Schema.transformOrFail(
  P.Schema.string,
  P.Schema.enums(MorrisColor),
  (s, _, ast) => {
    switch (s.toUpperCase()) {
      case MorrisColor.WHITE:
        return P.ParseResult.success(MorrisColor.WHITE);
      case MorrisColor.BLACK:
        return P.ParseResult.success(MorrisColor.BLACK);
    }
    return P.ParseResult.fail(P.ParseResult.parseError([P.ParseResult.type(ast, `Invalid color: ${s}`)]));
  },
  (c: MorrisColor) => P.ParseResult.success(c)
);
export type MorrisColorS = P.Schema.Schema.To<typeof MorrisColorS>;

export function MorrisBlack<N extends number>(n: N) {
  return P.Schema.struct({
    _tag: P.Schema.literal(MORRIS),
    color: P.Schema.literal(MorrisColor.BLACK),
    n: P.Schema.number.pipe(P.Schema.between(1, n)),
  });
}
export type MorrisBlack<N extends number> = P.Schema.Schema.To<ReturnType<typeof MorrisBlack<N>>>;

export function MorrisWhite<N extends number>(n: N) {
  return P.Schema.struct({
    _tag: P.Schema.literal(MORRIS),
    color: P.Schema.literal(MorrisColor.WHITE),
    n: P.Schema.number.pipe(P.Schema.between(1, n)),
  });
}
export type MorrisWhite<N extends number> = P.Schema.Schema.To<ReturnType<typeof MorrisWhite<N>>>;

export function Morris<N extends number>(n: N) {
  return P.Schema.union(MorrisBlack(n), MorrisWhite(n));
}
export type Morris<N extends number> = P.Schema.Schema.To<ReturnType<typeof Morris<N>>>;

// --------------------------------------------------------------------------
export const isBoardCoord =
  <D extends number>(d: D) =>
  (s: string): boolean => {
    const parts = s.split('', 2).map((c) => c?.toLowerCase());
    if (parts.length !== 2) return false;
    const y = parseInt(parts[1]!, 10);

    return COORD_CHARS.slice(0, d).includes(parts[0]! as any) && y >= 1 && y <= d;
  };

export function MorrisBoardCoord<D extends number>(d: D) {
  return P.pipe(
    P.Schema.string,
    P.Schema.compose(P.Schema.Lowercase),
    P.Schema.filter(isBoardCoord(d), {
      title: 'MorrisBoardCoord',
      message: () => `Invalid board coordinate for dimension ${d}`,
    })
  );
}
export type MorrisBoardCoord<D extends number> = P.Schema.Schema.To<ReturnType<typeof MorrisBoardCoord<D>>>;

// --------------------------------------------------------------------------
export const EmptyOccupantS = P.Schema.struct({ _tag: P.Schema.literal(EMPTY) });
export type EmptyOccupant = P.Schema.Schema.To<typeof EmptyOccupantS>;
export const EmptyOccupant: EmptyOccupant = { _tag: EMPTY };

export function isEmptyOccupant(x: unknown): x is EmptyOccupant {
  return P.pipe(x, P.Schema.is(EmptyOccupantS));
}

// --------------------------------------------------------------------------
export function MorrisBoardPointOccupant<N extends number>(n: N) {
  return P.Schema.union(EmptyOccupantS, Morris(n));
}
export type MorrisBoardPointOccupant<N extends number> = P.Schema.Schema.To<
  ReturnType<typeof MorrisBoardPointOccupant<N>>
>;

export function MorrisBoardLink<D extends number>(d: D) {
  return P.Schema.struct({
    to: MorrisBoardCoord(d),
    linkType: P.Schema.enums(MorrisLinkType),
  });
}
export type MorrisBoardLink<D extends number> = P.Schema.Schema.To<ReturnType<typeof MorrisBoardLink<D>>>;

export function MorrisBoardPoint<D extends number, N extends number>(d: D, n: N) {
  return P.Schema.struct({
    coord: MorrisBoardCoord(d),
    links: P.Schema.array(MorrisBoardLink(d)),
    occupant: MorrisBoardPointOccupant(n),
  });
}
export type MorrisBoardPoint<D extends number, N extends number> = P.Schema.Schema.To<
  ReturnType<typeof MorrisBoardPoint<D, N>>
>;

export function OccupiedBoardPoint<D extends number, N extends number>(d: D, n: N) {
  return P.Schema.struct({
    coord: MorrisBoardCoord(d),
    links: P.Schema.array(MorrisBoardLink(d)),
    occupant: Morris(n),
  });
}
export type OccupiedBoardPoint<D extends number, N extends number> = P.Schema.Schema.To<
  ReturnType<typeof OccupiedBoardPoint<D, N>>
>;

export function isOccupiedBoardPoint<D extends number, N extends number>(
  x: MorrisBoardPoint<D, N>
): x is OccupiedBoardPoint<D, N> {
  return x.occupant._tag === MORRIS;
}

export function MillCandidate<D extends number>(d: D) {
  return P.Schema.array(MorrisBoardCoord(d)).pipe(P.Schema.itemsCount(THREE));
}
export type MillCandidate<D extends number> = P.Schema.Schema.To<ReturnType<typeof MillCandidate<D>>>;

export function MorrisBoard<P extends number, D extends number, N extends number>(p: P, d: D, n: N) {
  return P.Schema.struct({
    numPoints: P.Schema.literal(p),
    dimension: P.Schema.literal(d),
    points: P.Schema.array(MorrisBoardPoint(d, n)),
    millCandidates: P.Schema.array(MillCandidate(d)),
  });
}
export type MorrisBoard<P extends number, D extends number, N extends number> = P.Schema.Schema.To<
  ReturnType<typeof MorrisBoard<P, D, N>>
>;

export function MorrisBoardPositionString<P extends number>(p: P) {
  return P.Schema.string.pipe(P.Schema.length(p));
}
export type MorrisBoardPositionString<P extends number> = P.Schema.Schema.To<
  ReturnType<typeof MorrisBoardPositionString<P>>
>;
