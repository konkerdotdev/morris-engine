import { MorrisGameResult } from '../consts';
import * as unit from './index';

describe('game', () => {
  describe('resolveResult', () => {
    it('should resolve a win for white', () => {
      expect(unit.gameDeriveResult({ isWinWhite: true, isWinBlack: false, isDraw: false } as any)).toEqual(
        MorrisGameResult.WIN_WHITE
      );
    });
    it('should resolve a win for black', () => {
      expect(unit.gameDeriveResult({ isWinWhite: false, isWinBlack: true, isDraw: false } as any)).toEqual(
        MorrisGameResult.WIN_BLACK
      );
    });
    it('should resolve a draw', () => {
      expect(unit.gameDeriveResult({ isWinWhite: false, isWinBlack: false, isDraw: true } as any)).toEqual(
        MorrisGameResult.DRAW
      );
    });
  });
});
