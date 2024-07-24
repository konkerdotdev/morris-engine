import * as P from '@konker.dev/effect-ts-prelude';

import { COORD_CHARS, EMPTY, isCoordChar, MORRIS, MorrisColor, MorrisLinkType, THREE } from '../consts';
import type { BoardDim, NumMorris, NumPoints } from '../index';
import { MorrisId } from '../index';

export const MorrisColorS = P.Schema.transformOrFail(P.Schema.String, P.Schema.Enums(MorrisColor), {
  strict: true,
  decode: (s, _, ast) => {
    switch (s.toUpperCase()) {
      case MorrisColor.WHITE:
        return P.ParseResult.succeed(MorrisColor.WHITE);
      case MorrisColor.BLACK:
        return P.ParseResult.succeed(MorrisColor.BLACK);
    }
    return P.ParseResult.fail(new P.ParseResult.Type(ast, `Invalid color: ${s}`));
  },
  encode: (c: MorrisColor) => P.ParseResult.succeed(c),
});
export type MorrisColorS = P.Schema.Schema.Type<typeof MorrisColorS>;

export function MorrisBlack(n: NumMorris) {
  return P.Schema.Struct({
    _tag: P.Schema.Literal(MORRIS),
    color: P.Schema.Literal(MorrisColor.BLACK),
    n: MorrisId(n),
  });
}
export type MorrisBlack = P.Schema.Schema.Type<ReturnType<typeof MorrisBlack>>;

export function MorrisWhite(n: NumMorris) {
  return P.Schema.Struct({
    _tag: P.Schema.Literal(MORRIS),
    color: P.Schema.Literal(MorrisColor.WHITE),
    n: MorrisId(n),
  });
}
export type MorrisWhite = P.Schema.Schema.Type<ReturnType<typeof MorrisWhite>>;

export function Morris(n: NumMorris) {
  return P.Schema.Union(MorrisBlack(n), MorrisWhite(n));
}
export type Morris = P.Schema.Schema.Type<ReturnType<typeof Morris>>;

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
    P.Schema.String,
    P.Schema.compose(P.Schema.Lowercase),
    P.Schema.filter(isBoardCoord(d), {
      title: 'MorrisBoardCoord',
      message: () => `Invalid board coordinate for dimension ${d}`,
    })
  );
}
export type MorrisBoardCoord = P.Schema.Schema.Type<ReturnType<typeof MorrisBoardCoord>>;

// --------------------------------------------------------------------------
export const EmptyOccupantS = P.Schema.Struct({ _tag: P.Schema.Literal(EMPTY) });
export type EmptyOccupant = P.Schema.Schema.Type<typeof EmptyOccupantS>;
export const EmptyOccupant: EmptyOccupant = { _tag: EMPTY };

export function isEmptyOccupant(x: unknown): x is EmptyOccupant {
  return P.pipe(x, P.Schema.is(EmptyOccupantS));
}

// --------------------------------------------------------------------------
export function MorrisBoardPointOccupant(n: NumMorris) {
  return P.Schema.Union(EmptyOccupantS, Morris(n));
}
export type MorrisBoardPointOccupant = P.Schema.Schema.Type<ReturnType<typeof MorrisBoardPointOccupant>>;

export function MorrisBoardLink(d: BoardDim) {
  return P.Schema.Struct({
    to: MorrisBoardCoord(d),
    linkType: P.Schema.Enums(MorrisLinkType),
  });
}
export type MorrisBoardLink = P.Schema.Schema.Type<ReturnType<typeof MorrisBoardLink>>;

export function MorrisBoardPoint(d: BoardDim, n: NumMorris) {
  return P.Schema.Struct({
    coord: MorrisBoardCoord(d),
    links: P.Schema.Array(MorrisBoardLink(d)),
    occupant: MorrisBoardPointOccupant(n),
  });
}
export type MorrisBoardPoint = P.Schema.Schema.Type<ReturnType<typeof MorrisBoardPoint>>;

export function OccupiedBoardPoint(d: BoardDim, n: NumMorris) {
  return P.Schema.Struct({
    coord: MorrisBoardCoord(d),
    links: P.Schema.Array(MorrisBoardLink(d)),
    occupant: Morris(n),
  });
}
export type OccupiedBoardPoint = P.Schema.Schema.Type<ReturnType<typeof OccupiedBoardPoint>>;

export function isOccupiedBoardPoint(x: MorrisBoardPoint): x is OccupiedBoardPoint {
  return x.occupant._tag === MORRIS;
}

export function MillCandidate(d: BoardDim) {
  return P.Schema.Array(MorrisBoardCoord(d)).pipe(P.Schema.itemsCount(THREE));
}
export type MillCandidate = P.Schema.Schema.Type<ReturnType<typeof MillCandidate>>;

export function MorrisBoard(p: NumPoints, d: BoardDim, n: NumMorris) {
  return P.Schema.parseJson(
    P.Schema.Struct({
      numPoints: P.Schema.Literal(p),
      dimension: P.Schema.Literal(d),
      points: P.Schema.Array(MorrisBoardPoint(d, n)),
      millCandidates: P.Schema.Array(MillCandidate(d)),
    })
  );
}
export type MorrisBoard = P.Schema.Schema.Type<ReturnType<typeof MorrisBoard>>;

export function MorrisBoardPositionString(p: NumPoints) {
  return P.Schema.String.pipe(P.Schema.length(p));
}
export type MorrisBoardPositionString = P.Schema.Schema.Type<ReturnType<typeof MorrisBoardPositionString>>;
