import type { Range1 } from '../lib/type-utils';
import { MORRIS, MorrisColor } from './consts';

export type MorrisBlack<N extends number> = {
  readonly _tag: MORRIS;
  readonly color: typeof MorrisColor.BLACK;
  readonly n: Range1<N>;
};

export type MorrisWhite<N extends number> = {
  readonly _tag: MORRIS;
  readonly color: typeof MorrisColor.WHITE;
  readonly n: Range1<N>;
};

export type Morris<N extends number> = MorrisBlack<N> | MorrisWhite<N>;

// --------------------------------------------------------------------------
export const MorrisBlack = <N extends number>(n: Range1<N>): MorrisBlack<N> =>
  ({
    _tag: MORRIS,
    color: MorrisColor.BLACK,
    n,
  }) as MorrisBlack<N>;

export const MorrisWhite = <N extends number>(n: Range1<N>): MorrisWhite<N> =>
  ({
    _tag: MORRIS,
    color: MorrisColor.WHITE,
    n,
  }) as MorrisWhite<N>;
