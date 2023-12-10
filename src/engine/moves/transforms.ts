/* eslint-disable @typescript-eslint/naming-convention */
import * as P from '@konker.dev/effect-ts-prelude';

import { MorrisBoardCoordS, MorrisColorS } from '../board/schemas';
import { createMoveMove, createMovePlace, createMoveRemove } from './index';
import { MorrisMoveMoveS, MorrisMovePlaceS, MorrisMoveRemoveS } from './schemas';

// --------------------------------------------------------------------------
// Schema transforms for string representations of moves
// -                    -- No move yet
// P <color> <coord1>   -- Place piece of color on coord1
// M <coord1> <coord2>  -- Move piece from coord1 -> coord2
// R <coord1>           -- Remove piece on coord1
export function String_MorrisMovePlace<D extends number>(d: D) {
  return P.Schema.transformOrFail(
    P.Schema.string,
    MorrisMovePlaceS(d),
    (s: string) => {
      const parts = s.match(/^P ([BW])\s+([a-zA-Z]\d+)$/i);
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
      const parts = s.match(/^M ([a-zA-Z]\d+)\s+([a-zA-Z]\d+)$/i);
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
      const parts = s.match(/^R ([a-zA-Z]\d+)$/i);
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
