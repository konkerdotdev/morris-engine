import { game } from './3mm';
import type { MENS_MORRIS_D_3, MENS_MORRIS_N_3 } from './boards';
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

  describe('moveMakesMill', () => {
    it('should return false', () => {
      const move: MorrisMove<MENS_MORRIS_D_3, MENS_MORRIS_N_3> = {
        type: MorrisMoveType.PLACE,
        morris: game.morrisWhite[0],
        to: 'a2',
      };
      expect(unit.moveMakesMill(game, move)).toEqual(false);
    });
  });
});
