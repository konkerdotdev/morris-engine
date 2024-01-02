import * as P from '@konker.dev/effect-ts-prelude';

import { MorrisColor, MorrisMoveType } from '../consts';
import type { MorrisMoveMove, MorrisMovePlace, MorrisMoveRemove } from './schemas';
import * as unit from './transforms';

describe('moves/transforms', () => {
  const TEST_PLACE_S = 'P B a2';
  const TEST_PLACE_O: MorrisMovePlace<3> = { type: MorrisMoveType.PLACE, color: MorrisColor.BLACK, to: 'a2' };

  const TEST_MOVE_S = 'M a1 a2';
  const TEST_MOVE_O: MorrisMoveMove<3> = { type: MorrisMoveType.MOVE, from: 'a1', to: 'a2' };

  const TEST_REMOVE_S = 'R c3';
  const TEST_REMOVE_O: MorrisMoveRemove<3> = { type: MorrisMoveType.REMOVE, from: 'c3' };

  describe('String_MorrisMovePlace', () => {
    it('should work as expected', () => {
      const test1 = P.pipe(TEST_PLACE_S, P.Schema.decode(unit.String_MorrisMovePlace(3)));
      const test2 = P.pipe(TEST_PLACE_O, P.Schema.encode(unit.String_MorrisMovePlace(3)));

      expect(P.Effect.runSync(test1)).toStrictEqual(TEST_PLACE_O);
      expect(P.Effect.runSync(test2)).toStrictEqual(TEST_PLACE_S);
    });
  });

  describe('String_MorrisMoveMove', () => {
    it('should work as expected', () => {
      const test1 = P.pipe(TEST_MOVE_S, P.Schema.decode(unit.String_MorrisMoveMove(3)));
      const test2 = P.pipe(TEST_MOVE_O, P.Schema.encode(unit.String_MorrisMoveMove(3)));

      expect(P.Effect.runSync(test1)).toStrictEqual(TEST_MOVE_O);
      expect(P.Effect.runSync(test2)).toStrictEqual(TEST_MOVE_S);
    });
  });

  describe('String_MorrisMoveRemove', () => {
    it('should work as expected', () => {
      const test1 = P.pipe(TEST_REMOVE_S, P.Schema.decode(unit.String_MorrisMoveRemove(3)));
      const test2 = P.pipe(TEST_REMOVE_O, P.Schema.encode(unit.String_MorrisMoveRemove(3)));

      expect(P.Effect.runSync(test1)).toStrictEqual(TEST_REMOVE_O);
      expect(P.Effect.runSync(test2)).toStrictEqual(TEST_REMOVE_S);
    });
  });

  describe('String_MorrisMove', () => {
    it('should work as expected', () => {
      const test1a = P.pipe(TEST_PLACE_S, P.Schema.decode(unit.String_MorrisMove(3)));
      const test2a = P.pipe(TEST_PLACE_O, P.Schema.encode(unit.String_MorrisMove(3)));

      expect(P.Effect.runSync(test1a)).toStrictEqual(TEST_PLACE_O);
      expect(P.Effect.runSync(test2a)).toStrictEqual(TEST_PLACE_S);

      const test1b = P.pipe(TEST_REMOVE_S, P.Schema.decode(unit.String_MorrisMove(3)));
      const test2b = P.pipe(TEST_REMOVE_O, P.Schema.encode(unit.String_MorrisMove(3)));

      expect(P.Effect.runSync(test1b)).toStrictEqual(TEST_REMOVE_O);
      expect(P.Effect.runSync(test2b)).toStrictEqual(TEST_REMOVE_S);

      const test1c = P.pipe(TEST_REMOVE_S, P.Schema.decode(unit.String_MorrisMove(3)));
      const test2c = P.pipe(TEST_REMOVE_O, P.Schema.encode(unit.String_MorrisMove(3)));

      expect(P.Effect.runSync(test1c)).toStrictEqual(TEST_REMOVE_O);
      expect(P.Effect.runSync(test2c)).toStrictEqual(TEST_REMOVE_S);
    });
  });
});
