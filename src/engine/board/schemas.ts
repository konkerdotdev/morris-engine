import * as P from '@konker.dev/effect-ts-prelude';

import { COORD_CHARS, EMPTY, isCoordChar, MORRIS, MorrisColor, MorrisLinkType, THREE } from '../consts';
import type { BoardDim, NumMorris, NumPoints } from '../index';
import { MorrisId } from '../index';

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

export function MorrisBlack(n: NumMorris) {
  return P.Schema.struct({
    _tag: P.Schema.literal(MORRIS),
    color: P.Schema.literal(MorrisColor.BLACK),
    n: MorrisId(n),
  });
}
export type MorrisBlack = P.Schema.Schema.To<ReturnType<typeof MorrisBlack>>;

export function MorrisWhite(n: NumMorris) {
  return P.Schema.struct({
    _tag: P.Schema.literal(MORRIS),
    color: P.Schema.literal(MorrisColor.WHITE),
    n: MorrisId(n),
  });
}
export type MorrisWhite = P.Schema.Schema.To<ReturnType<typeof MorrisWhite>>;

export function Morris(n: NumMorris) {
  return P.Schema.union(MorrisBlack(n), MorrisWhite(n));
}
export type Morris = P.Schema.Schema.To<ReturnType<typeof Morris>>;

// --------------------------------------------------------------------------
export const isBoardCoord =
  (d: BoardDim) =>
  (s: string): boolean => {
    const parts = s.split('', 2).map((c) => c?.toLowerCase());
    if (!parts[0] || !parts[1]) return false;
    const y = parseInt(parts[1], 10);

    return isCoordChar(parts[0]) && COORD_CHARS.slice(0, d).includes(parts[0]) && y >= 1 && y <= d;
  };

export function MorrisBoardCoord(d: BoardDim) {
  return P.pipe(
    P.Schema.string,
    P.Schema.compose(P.Schema.Lowercase),
    P.Schema.filter(isBoardCoord(d), {
      title: 'MorrisBoardCoord',
      message: () => `Invalid board coordinate for dimension ${d}`,
    })
  );
}
export type MorrisBoardCoord = P.Schema.Schema.To<ReturnType<typeof MorrisBoardCoord>>;

// --------------------------------------------------------------------------
export const EmptyOccupantS = P.Schema.struct({ _tag: P.Schema.literal(EMPTY) });
export type EmptyOccupant = P.Schema.Schema.To<typeof EmptyOccupantS>;
export const EmptyOccupant: EmptyOccupant = { _tag: EMPTY };

export function isEmptyOccupant(x: unknown): x is EmptyOccupant {
  return P.pipe(x, P.Schema.is(EmptyOccupantS));
}

// --------------------------------------------------------------------------
export function MorrisBoardPointOccupant(n: NumMorris) {
  return P.Schema.union(EmptyOccupantS, Morris(n));
}
export type MorrisBoardPointOccupant = P.Schema.Schema.To<ReturnType<typeof MorrisBoardPointOccupant>>;

export function MorrisBoardLink(d: BoardDim) {
  return P.Schema.struct({
    to: MorrisBoardCoord(d),
    linkType: P.Schema.enums(MorrisLinkType),
  });
}
export type MorrisBoardLink = P.Schema.Schema.To<ReturnType<typeof MorrisBoardLink>>;

export function MorrisBoardPoint(d: BoardDim, n: NumMorris) {
  return P.Schema.struct({
    coord: MorrisBoardCoord(d),
    links: P.Schema.array(MorrisBoardLink(d)),
    occupant: MorrisBoardPointOccupant(n),
  });
}
export type MorrisBoardPoint = P.Schema.Schema.To<ReturnType<typeof MorrisBoardPoint>>;

export function OccupiedBoardPoint(d: BoardDim, n: NumMorris) {
  return P.Schema.struct({
    coord: MorrisBoardCoord(d),
    links: P.Schema.array(MorrisBoardLink(d)),
    occupant: Morris(n),
  });
}
export type OccupiedBoardPoint = P.Schema.Schema.To<ReturnType<typeof OccupiedBoardPoint>>;

export function isOccupiedBoardPoint(x: MorrisBoardPoint): x is OccupiedBoardPoint {
  return x.occupant._tag === MORRIS;
}

export function MillCandidate(d: BoardDim) {
  return P.Schema.array(MorrisBoardCoord(d)).pipe(P.Schema.itemsCount(THREE));
}
export type MillCandidate = P.Schema.Schema.To<ReturnType<typeof MillCandidate>>;

export function MorrisBoard(p: NumPoints, d: BoardDim, n: NumMorris) {
  return P.Schema.ParseJson.pipe(
    P.Schema.compose(
      P.Schema.struct({
        numPoints: P.Schema.literal(p),
        dimension: P.Schema.literal(d),
        points: P.Schema.array(MorrisBoardPoint(d, n)),
        millCandidates: P.Schema.array(MillCandidate(d)),
      })
    )
  );
}
export type MorrisBoard = P.Schema.Schema.To<ReturnType<typeof MorrisBoard>>;

export function MorrisBoardPositionString(p: NumPoints) {
  return P.Schema.string.pipe(P.Schema.length(p));
}
export type MorrisBoardPositionString = P.Schema.Schema.To<ReturnType<typeof MorrisBoardPositionString>>;
