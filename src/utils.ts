import * as P from '@konker.dev/effect-ts-prelude';
import type { Add } from 'ts-toolbelt/out/Number/Add';

/**
 * An integer in the range [N, M).
 * See: https://stackoverflow.com/a/70307091/203284
 */
export type Enumerate<N extends number, Acc extends Array<number> = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;
export type Range<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;
export type Range0<T extends number> = Range<0, T>;
export type Range1<T extends number> = Range<1, Add<T, 1>>;

export const COORD_CHARS = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
] as const;
export type EnumerateCoordChars<N extends number, Acc extends Array<string> = []> = Acc['length'] extends N
  ? Acc[number]
  : EnumerateCoordChars<N, [...Acc, (typeof COORD_CHARS)[Acc['length']]]>;

/**
 * A fixed length array of type T with length N.
 * See: https://stackoverflow.com/a/74801694/203284
 */
export type LengthArray<T, N extends number, R extends ReadonlyArray<T> = []> = number extends N
  ? ReadonlyArray<T>
  : R['length'] extends N
    ? R
    : LengthArray<T, N, [T, ...R]>;

export type Tuple<TItem, TLength extends number> = [TItem, ...Array<TItem>] & { length: TLength };

// --------------------------------------------------------------------------
export const someE =
  <R, E, A>(predicateE: (a: A) => P.Effect.Effect<R, E, boolean>) =>
  (as: ReadonlyArray<A>): P.Effect.Effect<R, E, boolean> =>
    P.pipe(
      as,
      P.ReadonlyArray.map(predicateE),
      P.Effect.all,
      P.Effect.map((bs) => bs.some(P.identity))
    );

export const everyE =
  <R, E, A>(predicateE: (a: A) => P.Effect.Effect<R, E, boolean>) =>
  (as: ReadonlyArray<A>): P.Effect.Effect<R, E, boolean> =>
    P.pipe(
      as,
      P.ReadonlyArray.map(predicateE),
      P.Effect.all,
      P.Effect.map((bs) => bs.every(P.identity))
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
