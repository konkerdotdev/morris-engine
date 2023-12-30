import * as P from '@konker.dev/effect-ts-prelude';

/**
 * Perform `Array.some` with an effectual predicate function
 */
export const someE =
  <R, E, A>(predicateE: (a: A) => P.Effect.Effect<R, E, boolean>) =>
  (as: ReadonlyArray<A>): P.Effect.Effect<R, E, boolean> =>
    P.pipe(
      as,
      P.ReadonlyArray.map(predicateE),
      P.Effect.all,
      P.Effect.map((bs) => bs.some(P.identity))
    );

/**
 * Perform `Array.filter` with an effectual predicate function
 */
export const filterE =
  <R, E, A>(predicateE: (a: A) => P.Effect.Effect<R, E, boolean>) =>
  (as: ReadonlyArray<A>): P.Effect.Effect<R, E, ReadonlyArray<A>> =>
    P.pipe(
      as,
      P.ReadonlyArray.map(predicateE),
      P.Effect.all,
      P.Effect.map((bs) => as.filter((_, i) => bs[i]))
    );
