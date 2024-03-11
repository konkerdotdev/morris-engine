import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../../lib/error';
import { toMorrisEngineError } from '../../../lib/error';
import type { MorrisBoardCoord, MorrisBoardPoint } from '../../board/schemas';
import type { COORD_CHAR } from '../../consts';
import { COORD_CHARS } from '../../consts';
import type { CoordTuple, MorrisBoardRenderParamsText } from './index';

export function getBoardCoordParts(coord: MorrisBoardCoord): P.Effect.Effect<[COORD_CHAR, number], MorrisEngineError> {
  return P.Effect.try({
    try: () => {
      const parts = coord.split('', 2);
      // eslint-disable-next-line fp/no-throw
      if (!parts[0] || !parts[1]) throw new Error(`Invalid board coord: ${coord}`);

      const bx = COORD_CHARS.find((c) => c === parts[0]);
      // eslint-disable-next-line fp/no-throw
      if (!bx) throw new Error(`Invalid board coord: ${coord}`);

      const by = parseInt(parts[1], 10);
      // eslint-disable-next-line fp/no-throw
      if (!by || Number.isNaN(by)) throw new Error(`Invalid board coord: ${coord}`);

      return [bx, by];
    },
    catch: toMorrisEngineError,
  });
}

export function getRenderCoord(
  params: MorrisBoardRenderParamsText,
  coord: MorrisBoardCoord
): P.Effect.Effect<CoordTuple, MorrisEngineError> {
  return P.pipe(
    getBoardCoordParts(coord),
    P.Effect.map(([bx, by]) => {
      const bxn = COORD_CHARS.indexOf(bx);
      const byn = by - 1;
      const x =
        (params.config.showCoords ? params.config.coordPadH + 1 : 0) +
        params.config.boardPadH +
        bxn * (params.config.scaleX * params.config.spacingX + 1);
      const y =
        params.h -
        ((params.config.showCoords ? params.config.coordPadV + 1 : 0) +
          (byn * (params.config.scaleY * params.config.spacingY + 1) + 1));

      return [x, y];
    })
  );
}

export function boardPointToCoord(
  params: MorrisBoardRenderParamsText,
  point: MorrisBoardPoint
): P.Effect.Effect<[COORD_CHAR, number, CoordTuple], MorrisEngineError> {
  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('boardCoord', () => getBoardCoordParts(point.coord)),
    P.Effect.bind('renderCoord', () => getRenderCoord(params, point.coord)),
    P.Effect.map(({ boardCoord, renderCoord }) => [...boardCoord, renderCoord] as [COORD_CHAR, number, CoordTuple])
  );
}

export function boardPointsToCoords(
  params: MorrisBoardRenderParamsText,
  points: ReadonlyArray<MorrisBoardPoint>
): P.Effect.Effect<Array<[COORD_CHAR, number, CoordTuple]>, MorrisEngineError> {
  return P.pipe(
    points.map((p) => boardPointToCoord(params, p)),
    P.Effect.all
  );
}
