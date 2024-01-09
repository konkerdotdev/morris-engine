import type { MorrisBlack, MorrisWhite } from './board/schemas';
import { MORRIS, MorrisColor } from './consts';

export const createMorrisBlack = (n: number): MorrisBlack =>
  ({
    _tag: MORRIS,
    color: MorrisColor.BLACK,
    n,
  }) as MorrisBlack;

export const createMorrisWhite = (n: number): MorrisWhite =>
  ({
    _tag: MORRIS,
    color: MorrisColor.WHITE,
    n,
  }) as MorrisWhite;
