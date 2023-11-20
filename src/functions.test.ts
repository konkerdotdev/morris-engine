// import type * as P from '@konker.dev/effect-ts-prelude';
import { game } from './3mm';
import type { MENS_MORRIS_D_3 } from './boards';
import * as unit from './functions';
import type { MorrisMove } from './index';
import { MorrisColor, MorrisMoveType } from './index';

describe('functions', () => {
  describe('isTurn', () => {
    it('should return true', () => {
      expect(unit.isTurn(game, MorrisColor.WHITE)).toEqual(true);
    });
    it('should return false', () => {
      expect(unit.isTurn(game, MorrisColor.BLACK)).toEqual(false);
    });
  });

  describe('isMill', () => {
    it('should return false', () => {
      const move: MorrisMove<MENS_MORRIS_D_3> = {
        type: MorrisMoveType.PLACE,
        color: MorrisColor.WHITE,
        to: 'a2',
      };
      expect(unit.moveMakesMill(game, move)).toEqual(false);
    });
  });
});
