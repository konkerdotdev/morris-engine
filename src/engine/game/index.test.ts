import { MorrisGameResult } from '../consts';
import * as unit from './index';

describe('game', () => {
  describe('resolveResult', () => {
    it('should resolve a win for white', () => {
      expect(
        unit.resolveResult({ isWinWhite: [true, 's'], isWinBlack: [false, 's'], isDraw: [false, 's'] } as any)
      ).toEqual(MorrisGameResult.WIN_WHITE);
    });
    it('should resolve a win for black', () => {
      expect(
        unit.resolveResult({ isWinWhite: [false, 's'], isWinBlack: [true, 's'], isDraw: [false, 's'] } as any)
      ).toEqual(MorrisGameResult.WIN_BLACK);
    });
    it('should resolve a draw', () => {
      expect(
        unit.resolveResult({ isWinWhite: [false, 's'], isWinBlack: [false, 's'], isDraw: [true, 's'] } as any)
      ).toEqual(MorrisGameResult.DRAW);
    });
  });
});
