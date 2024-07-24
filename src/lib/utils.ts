import * as P from '@konker.dev/effect-ts-prelude';

/**
 * Perform `Array.some` with an effectual predicate function
 */
export const someE =
  <R, E, A>(predicateE: (a: A) => P.Effect.Effect<boolean, E, R>) =>
  (as: ReadonlyArray<A>): P.Effect.Effect<boolean, E, R> =>
    P.pipe(
      as,
      P.Array.map(predicateE),
      P.Effect.all,
      P.Effect.map((bs) => bs.some(P.identity))
    );

/**
 * Perform `Array.filter` with an effectual predicate function
 */
export const filterE =
  <R, E, A>(predicateE: (a: A) => P.Effect.Effect<boolean, E, R>) =>
  (as: ReadonlyArray<A>): P.Effect.Effect<ReadonlyArray<A>, E, R> =>
    P.pipe(
      as,
      P.Array.map(predicateE),
      P.Effect.all,
      P.Effect.map((bs) => as.filter((_, i) => bs[i]))
    );
