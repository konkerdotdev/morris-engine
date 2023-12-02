import { game } from './3mm';
import * as unit from './functions';
import { MorrisColor } from './index';

describe('functions', () => {
  describe('isTurn', () => {
    it('should return true', () => {
      expect(unit.isTurn(game, MorrisColor.WHITE)).toEqual(true);
    });
    it('should return false', () => {
      expect(unit.isTurn(game, MorrisColor.BLACK)).toEqual(false);
    });
  });

  /*
  describe('unsafe_moveMakesMill', () => {
    it('should return false', () => {
      const move: MorrisMove<MENS_MORRIS_D_3, MENS_MORRIS_N_3> = {
        type: MorrisMoveType.PLACE,
        morris: game.morrisWhite[0],
        to: 'a2',
      };
      expect(unit.unsafe_moveMakesMill(game, move)).toEqual(false);
    });
  });
  */

  describe('boardHash', () => {
    it('should work as expected', () => {
      expect(unit.boardHash(game.board)).toEqual('ooooooooo');
    });
  });
});
