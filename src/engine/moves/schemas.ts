import * as P from '@konker.dev/effect-ts-prelude';

import { MorrisBoardCoord } from '../board/schemas';
import { MorrisColor, MorrisMoveType } from '../consts';

export const MorrisMoveRoot = P.Schema.ParseJson.pipe(
  P.Schema.compose(
    P.Schema.struct({
      type: P.Schema.literal(MorrisMoveType.ROOT),
    })
  )
);
export type MorrisMoveRoot = P.Schema.Schema.To<typeof MorrisMoveRoot>;

export function MorrisMovePlace<D extends number>(d: D) {
  return P.Schema.ParseJson.pipe(
    P.Schema.compose(
      P.Schema.struct({
        type: P.Schema.literal(MorrisMoveType.PLACE),
        color: P.Schema.literal(MorrisColor.WHITE, MorrisColor.BLACK),
        to: MorrisBoardCoord(d),
      })
    )
  );
}
export type MorrisMovePlace<D extends number> = P.Schema.Schema.To<ReturnType<typeof MorrisMovePlace<D>>>;

export function MorrisMoveMove<D extends number>(d: D) {
  return P.Schema.ParseJson.pipe(
    P.Schema.compose(
      P.Schema.struct({
        type: P.Schema.literal(MorrisMoveType.MOVE),
        from: MorrisBoardCoord(d),
        to: MorrisBoardCoord(d),
      })
    )
  );
}
export type MorrisMoveMove<D extends number> = P.Schema.Schema.To<ReturnType<typeof MorrisMoveMove<D>>>;

export function MorrisMoveRemove<D extends number>(d: D) {
  return P.Schema.ParseJson.pipe(
    P.Schema.compose(
      P.Schema.struct({
        type: P.Schema.literal(MorrisMoveType.REMOVE),
        from: MorrisBoardCoord(d),
      })
    )
  );
}
export type MorrisMoveRemove<D extends number> = P.Schema.Schema.To<ReturnType<typeof MorrisMoveRemove<D>>>;

export function MorrisMove<D extends number>(d: D) {
  return P.Schema.union(MorrisMovePlace(d), MorrisMoveMove(d), MorrisMoveRemove(d), MorrisMoveRoot);
}
export type MorrisMove<D extends number> = P.Schema.Schema.To<ReturnType<typeof MorrisMove<D>>>;
