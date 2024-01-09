import type { MorrisBlack, MorrisWhite } from './board/schemas';
import { MORRIS, MorrisColor } from './consts';
import type { MorrisId } from './index';

export const createMorrisBlack = (n: MorrisId): MorrisBlack =>
  ({
    _tag: MORRIS,
    color: MorrisColor.BLACK,
    n,
  }) as MorrisBlack;

export const createMorrisWhite = (n: MorrisId): MorrisWhite =>
  ({
    _tag: MORRIS,
    color: MorrisColor.WHITE,
    n,
  }) as MorrisWhite;
