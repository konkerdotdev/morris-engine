import type { Range1 } from '../lib/type-utils';
import type { MorrisBlack, MorrisWhite } from './board/schemas';
import { MORRIS, MorrisColor } from './consts';

export const createMorrisBlack = <N extends number>(n: Range1<N>): MorrisBlack<N> =>
  ({
    _tag: MORRIS,
    color: MorrisColor.BLACK,
    n,
  }) as MorrisBlack<N>;

export const createMorrisWhite = <N extends number>(n: Range1<N>): MorrisWhite<N> =>
  ({
    _tag: MORRIS,
    color: MorrisColor.WHITE,
    n,
  }) as MorrisWhite<N>;
