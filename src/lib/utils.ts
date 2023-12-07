import * as P from '@konker.dev/effect-ts-prelude';

export const someE =
  <R, E, A>(predicateE: (a: A) => P.Effect.Effect<R, E, boolean>) =>
  (as: ReadonlyArray<A>): P.Effect.Effect<R, E, boolean> =>
    P.pipe(
      as,
      P.ReadonlyArray.map(predicateE),
      P.Effect.all,
      P.Effect.map((bs) => bs.some(P.identity))
    );

export const filterE =
  <R, E, A>(predicateE: (a: A) => P.Effect.Effect<R, E, boolean>) =>
  (as: ReadonlyArray<A>): P.Effect.Effect<R, E, ReadonlyArray<A>> =>
    P.pipe(
      as,
      P.ReadonlyArray.map(predicateE),
      P.Effect.all,
      P.Effect.map((bs) => as.filter((_, i) => bs[i]))
    );

/**
 * See: https://stackoverflow.com/a/64777515
 */
export function arrayChunk<T>(arr: Array<T>, size: number): Array<Array<T>> {
  return [...Array(Math.ceil(arr.length / size))].map((_, i) => arr.slice(size * i, size + size * i));
}
