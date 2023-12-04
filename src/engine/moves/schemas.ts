import * as P from '@konker.dev/effect-ts-prelude';

import { MorrisBoardCoordS } from '../board/schemas';
import { MorrisColor, MorrisMoveType } from '../consts';

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
