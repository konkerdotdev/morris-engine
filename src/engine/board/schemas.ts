import * as P from '@konker.dev/effect-ts-prelude';

import { COORD_CHARS, EMPTY, MorrisColor } from '../consts';

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
export const isBoardCoord =
  <D extends number>(d: D) =>
  (s: string): boolean => {
    const parts = s.split('', 2).map((c) => c?.toLowerCase());
    if (parts.length !== 2) return false;
    const y = parseInt(parts[1]!, 10);

    return COORD_CHARS.slice(0, d).includes(parts[0]! as any) && y >= 1 && y <= d;
  };

export function MorrisBoardCoordS<D extends number>(d: D) {
  return P.pipe(
    P.Schema.string,
    P.Schema.compose(P.Schema.Lowercase),
    P.Schema.filter(isBoardCoord(d), {
      title: 'MorrisBoardCoord',
      message: () => `Invalid board coordinate for dimension ${d}`,
    })
  );
}
export type MorrisBoardCoordS<D extends number> = P.Schema.Schema.To<ReturnType<typeof MorrisBoardCoordS<D>>>;

// --------------------------------------------------------------------------
export const EmptyOccupantS = P.Schema.struct({ _tag: P.Schema.literal(EMPTY) }).pipe(P.Schema.brand('EmptyPoint'));
export type EmptyOccupant = P.Schema.Schema.To<typeof EmptyOccupantS>;
export const EmptyOccupant = P.pipe({ _tag: EMPTY }, P.Schema.decodeSync(EmptyOccupantS));
