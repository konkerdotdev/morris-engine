import * as P from '@konker.dev/effect-ts-prelude';

import { COORD_CHARS } from './consts';
import { MorrisColor, MorrisMoveType } from './index';
import { createMoveMove, createMovePlace, createMoveRemove } from './moves';

// --------------------------------------------------------------------------

export const isBoardCoord =
  <D extends number>(d: D) =>
  (s: string): boolean => {
    const parts = s.split('', 2);
    if (parts.length !== 2) return false;
    const y = parseInt(parts[1]!, 10);

    return COORD_CHARS.slice(0, d).includes(parts[0]! as any) && y >= 1 && y <= d;
  };

export function MorrisBoardCoordS<D extends number>(d: D) {
  return P.pipe(
    P.Schema.string,
    P.Schema.filter(isBoardCoord(d), {
      title: 'MorrisBoardCoord',
      message: () => `Invalid board coordinate for dimension ${d}`,
    })
  );
}
export type MorrisBoardCoordS<D extends number> = P.Schema.Schema.To<ReturnType<typeof MorrisBoardCoordS<D>>>;

// --------------------------------------------------------------------------
export const MorrisColorS = P.Schema.transformOrFail(
  P.Schema.string,
  P.Schema.union(P.Schema.literal(MorrisColor.WHITE), P.Schema.literal(MorrisColor.BLACK)),
  (s: string) => {
    switch (s.toUpperCase()) {
      case MorrisColor.WHITE:
        return P.ParseResult.success(MorrisColor.WHITE);
      case MorrisColor.BLACK:
        return P.ParseResult.success(MorrisColor.BLACK);
    }
    return P.ParseResult.fail(
      P.ParseResult.parseError([P.ParseResult.type(P.Schema.string.ast, `Invalid color: ${s}`)])
    );
  },
  (c: MorrisColor) => P.ParseResult.success(c)
);
export type MorrisColorS = P.Schema.Schema.To<typeof MorrisColorS>;

// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
export function MorrisMovePlaceS<D extends number>(d: D) {
  return P.Schema.struct({
    type: P.Schema.literal(MorrisMoveType.PLACE),
    color: P.Schema.literal(MorrisColor.WHITE, MorrisColor.BLACK),
    to: MorrisBoardCoordS(d),
  });
}
export type MorrisMovePlaceS<D extends number> = P.Schema.Schema.To<ReturnType<typeof MorrisMovePlaceS<D>>>;

export function MorrisMoveMoveS<D extends number>(d: D) {
  return P.Schema.struct({
    type: P.Schema.literal(MorrisMoveType.MOVE),
    from: MorrisBoardCoordS(d),
    to: MorrisBoardCoordS(d),
  });
}
export type MorrisMoveMoveS<D extends number> = P.Schema.Schema.To<ReturnType<typeof MorrisMoveMoveS<D>>>;

export function MorrisMoveRemoveS<D extends number>(d: D) {
  return P.Schema.struct({
    type: P.Schema.literal(MorrisMoveType.REMOVE),
    from: MorrisBoardCoordS(d),
  });
}
export type MorrisMoveRemoveS<D extends number> = P.Schema.Schema.To<ReturnType<typeof MorrisMoveRemoveS<D>>>;

export function MorrisMoveS<D extends number>(d: D) {
  return P.Schema.union(MorrisMovePlaceS(d), MorrisMoveMoveS(d), MorrisMoveRemoveS(d));
}
export type MorrisMoveS<D extends number> = P.Schema.Schema.To<ReturnType<typeof MorrisMoveS<D>>>;

// --------------------------------------------------------------------------
// Schema transforms for string representations of moves
// P <color> <coord1>   -- Place piece of color on coord1
// M <coord1> <coord2>  -- Move piece from coord1 -> coord2
// R <coord1>           -- Remove piece on coord1
export function String_MorrisMovePlace<D extends number>(d: D) {
  return P.Schema.transformOrFail(
    P.Schema.string,
    MorrisMovePlaceS(d),
    (s: string) => {
      const parts = s.match(/^P ([bBwW])\s+([a-zA-Z]\d+)$/);
      if (!parts || parts.length < 3) {
        return P.ParseResult.fail(
          P.ParseResult.parseError([P.ParseResult.type(P.Schema.string.ast, `Failed to deserialize move string: ${s}`)])
        );
      }
      return P.pipe(
        P.Effect.Do,
        P.Effect.bind('color', () => P.pipe(parts[1]!, P.Schema.decode(MorrisColorS))),
        P.Effect.bind('toCoord', () => P.pipe(parts[2]!, P.Schema.decode(MorrisBoardCoordS(d)))),
        P.Effect.map(({ color, toCoord }) => createMovePlace<D>(color, toCoord))
      );
    },
    (m: MorrisMovePlaceS<D>) => P.ParseResult.success(`P ${m.color} ${m.to}`)
  );
}

export function String_MorrisMoveMove<D extends number>(d: D) {
  return P.Schema.transformOrFail(
    P.Schema.string,
    MorrisMoveMoveS(d),
    (s: string) => {
      const parts = s.match(/^M ([a-zA-Z]\d+)\s+([a-zA-Z]\d+)$/);
      if (!parts || parts.length < 3) {
        return P.ParseResult.fail(
          P.ParseResult.parseError([P.ParseResult.type(P.Schema.string.ast, `Failed to deserialize move string: ${s}`)])
        );
      }
      return P.pipe(
        P.Effect.Do,
        P.Effect.bind('fromCoord', () => P.pipe(parts[1]!, P.Schema.decode(MorrisBoardCoordS(d)))),
        P.Effect.bind('toCoord', () => P.pipe(parts[2]!, P.Schema.decode(MorrisBoardCoordS(d)))),
        P.Effect.map(({ fromCoord, toCoord }) => createMoveMove<D>(fromCoord, toCoord))
      );
    },
    (m: MorrisMoveMoveS<D>) => P.ParseResult.success(`M ${m.from} ${m.to}`)
  );
}

export function String_MorrisMoveRemove<D extends number>(d: D) {
  return P.Schema.transformOrFail(
    P.Schema.string,
    MorrisMoveRemoveS(d),
    (s: string) => {
      const parts = s.match(/^R ([a-zA-Z]\d+)$/);
      if (!parts || parts.length < 2) {
        return P.ParseResult.fail(
          P.ParseResult.parseError([P.ParseResult.type(P.Schema.string.ast, `Failed to deserialize move string: ${s}`)])
        );
      }
      return P.pipe(
        P.Effect.Do,
        P.Effect.bind('fromCoord', () => P.pipe(parts[1]!, P.Schema.decode(MorrisBoardCoordS(d)))),
        P.Effect.map(({ fromCoord }) => createMoveRemove<D>(fromCoord))
      );
    },
    (m: MorrisMoveRemoveS<D>) => P.ParseResult.success(`R ${m.from}`)
  );
}

export const String_MorrisMove = <D extends number>(d: D) =>
  P.Schema.union(String_MorrisMovePlace(d), String_MorrisMoveMove(d), String_MorrisMoveRemove(d));
