import type { Add } from 'ts-toolbelt/out/Number/Add';
// import type { Sub } from 'ts-toolbelt/out/Number/Sub';

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
//
// const r0: Range0<8> = 7;
// export const r1: Range1<4> = 3;

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

// function toIdx<P extends number>(p: Range1<P>): Range0<Sub<P, 1>> {
//   return (p - 1) as Range0<Sub<P, 1>>;
// }
// const ii = toIdx(3);
//
// function f(i: Range1<4>) {
//   const la0: LengthArray<string, 4> = ['a', 'b', 'c', 'd'];
//   const idx = toIdx(i);
//
//   const ret = la0[toIdx(i)];
//   return ret;
//   // export const i: Sub<typeof r0, 1> = r0 - 1;
//   // export const x1 = la0[i];
// }

export type Tuple<TItem, TLength extends number> = [TItem, ...Array<TItem>] & { length: TLength };
export const t0: Tuple<string, 4> = ['a', 'b', 'c', 'd'];
export const x2 = t0[2];
