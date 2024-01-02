/* eslint-disable @typescript-eslint/naming-convention */
import * as P from '@konker.dev/effect-ts-prelude';

import { MorrisBoardCoord, MorrisColorS } from '../board/schemas';
import { moveCreateMove, moveCreatePlace, moveCreateRemove, moveCreateRoot, ROOT_MOVE_STR } from './index';
import { MorrisMoveMove, MorrisMovePlace, MorrisMoveRemove, MorrisMoveRoot } from './schemas';

// --------------------------------------------------------------------------
// Schema transforms for string representations of moves
// -                    -- No move yet
// P <color> <coord1>   -- Place piece of color on coord1
// M <coord1> <coord2>  -- Move piece from coord1 -> coord2
// R <coord1>           -- Remove piece on coord1
export const String_MorrisMoveRoot = P.Schema.transformOrFail(
  P.Schema.string,
  MorrisMoveRoot,
  (s: string) => {
    if (s !== ROOT_MOVE_STR) {
      return P.ParseResult.fail(
        P.ParseResult.parseError([
          P.ParseResult.type(P.Schema.string.ast, `Failed to deserialize root move string: ${s}`),
        ])
      );
    }
    return P.pipe(moveCreateRoot(), P.Effect.succeed);
  },
  (_m: MorrisMoveRoot) => P.ParseResult.success(ROOT_MOVE_STR)
);

export function String_MorrisMovePlace<D extends number>(d: D) {
  return P.Schema.transformOrFail(
    P.Schema.string,
    MorrisMovePlace(d),
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
        P.Effect.bind('toCoord', () => P.pipe(parts[2]!, P.Schema.decode(MorrisBoardCoord(d)))),
        P.Effect.map(({ color, toCoord }) => moveCreatePlace<D>(color, toCoord))
      );
    },
    (m: MorrisMovePlace<D>) => P.ParseResult.success(`P ${m.color} ${m.to}`)
  );
}

export function String_MorrisMoveMove<D extends number>(d: D) {
  return P.Schema.transformOrFail(
    P.Schema.string,
    MorrisMoveMove(d),
    (s: string) => {
      const parts = s.match(/^M ([a-zA-Z]\d+)\s+([a-zA-Z]\d+)$/i);
      if (!parts || parts.length < 3) {
        return P.ParseResult.fail(
          P.ParseResult.parseError([P.ParseResult.type(P.Schema.string.ast, `Failed to deserialize move string: ${s}`)])
        );
      }
      return P.pipe(
        P.Effect.Do,
        P.Effect.bind('fromCoord', () => P.pipe(parts[1]!, P.Schema.decode(MorrisBoardCoord(d)))),
        P.Effect.bind('toCoord', () => P.pipe(parts[2]!, P.Schema.decode(MorrisBoardCoord(d)))),
        P.Effect.map(({ fromCoord, toCoord }) => moveCreateMove<D>(fromCoord, toCoord))
      );
    },
    (m: MorrisMoveMove<D>) => P.ParseResult.success(`M ${m.from} ${m.to}`)
  );
}

export function String_MorrisMoveRemove<D extends number>(d: D) {
  return P.Schema.transformOrFail(
    P.Schema.string,
    MorrisMoveRemove(d),
    (s: string) => {
      const parts = s.match(/^R ([a-zA-Z]\d+)$/i);
      if (!parts || parts.length < 2) {
        return P.ParseResult.fail(
          P.ParseResult.parseError([P.ParseResult.type(P.Schema.string.ast, `Failed to deserialize move string: ${s}`)])
        );
      }
      return P.pipe(
        P.Effect.Do,
        P.Effect.bind('fromCoord', () => P.pipe(parts[1]!, P.Schema.decode(MorrisBoardCoord(d)))),
        P.Effect.map(({ fromCoord }) => moveCreateRemove<D>(fromCoord))
      );
    },
    (m: MorrisMoveRemove<D>) => P.ParseResult.success(`R ${m.from}`)
  );
}

export const String_MorrisMove = <D extends number>(d: D) =>
  P.Schema.union(
    String_MorrisMovePlace(d),
    String_MorrisMoveMove(d),
    String_MorrisMoveRemove(d),
    String_MorrisMoveRoot
  );
