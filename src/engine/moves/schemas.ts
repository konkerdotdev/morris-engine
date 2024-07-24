import * as P from '@konker.dev/effect-ts-prelude';

import { MorrisBoardCoord } from '../board/schemas';
import { MorrisColor, MorrisMoveType } from '../consts';
import type { BoardDim } from '../index';

export const MorrisMoveRoot = P.Schema.parseJson(
  P.Schema.Struct({
    type: P.Schema.Literal(MorrisMoveType.ROOT),
  })
);
export type MorrisMoveRoot = P.Schema.Schema.Type<typeof MorrisMoveRoot>;

export function MorrisMovePlace(d: BoardDim) {
  return P.Schema.parseJson(
    P.Schema.Struct({
      type: P.Schema.Literal(MorrisMoveType.PLACE),
      color: P.Schema.Literal(MorrisColor.WHITE, MorrisColor.BLACK),
      to: MorrisBoardCoord(d),
    })
  );
}
export type MorrisMovePlace = P.Schema.Schema.Type<ReturnType<typeof MorrisMovePlace>>;

export function MorrisMoveMove(d: BoardDim) {
  return P.Schema.parseJson(
    P.Schema.Struct({
      type: P.Schema.Literal(MorrisMoveType.MOVE),
      from: MorrisBoardCoord(d),
      to: MorrisBoardCoord(d),
    })
  );
}
export type MorrisMoveMove = P.Schema.Schema.Type<ReturnType<typeof MorrisMoveMove>>;

export function MorrisMoveRemove(d: BoardDim) {
  return P.Schema.parseJson(
    P.Schema.Struct({
      type: P.Schema.Literal(MorrisMoveType.REMOVE),
      from: MorrisBoardCoord(d),
    })
  );
}
export type MorrisMoveRemove = P.Schema.Schema.Type<ReturnType<typeof MorrisMoveRemove>>;

export function MorrisMove(d: BoardDim) {
  return P.Schema.Union(MorrisMovePlace(d), MorrisMoveMove(d), MorrisMoveRemove(d), MorrisMoveRoot);
}
export type MorrisMove = P.Schema.Schema.Type<ReturnType<typeof MorrisMove>>;
