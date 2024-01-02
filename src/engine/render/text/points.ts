import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../../lib/error';
import { toMorrisEngineError } from '../../../lib/error';
import type { MorrisBoardCoord, MorrisBoardPoint } from '../../board/schemas';
import type { COORD_CHAR } from '../../consts';
import { COORD_CHARS } from '../../consts';
import type { CoordTuple, MorrisBoardRenderParamsText } from './index';

export function getBoardCoordParts<D extends number>(
  coord: MorrisBoardCoord<D>
): P.Effect.Effect<never, MorrisEngineError, [COORD_CHAR, number]> {
  return P.Effect.try({
    try: () => {
      const parts = coord.split('', 2);
      const bx = COORD_CHARS.find((c) => c === parts[0]!) as COORD_CHAR;
      const by = parseInt(parts[1]!, 10);

      return [bx, by];
    },
    catch: toMorrisEngineError,
  });
}

export function getRenderCoord<D extends number>(
  params: MorrisBoardRenderParamsText,
  coord: MorrisBoardCoord<D>
): P.Effect.Effect<never, MorrisEngineError, CoordTuple> {
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

export function boardPointToCoord<D extends number, N extends number>(
  params: MorrisBoardRenderParamsText,
  point: MorrisBoardPoint<D, N>
): P.Effect.Effect<never, MorrisEngineError, [COORD_CHAR, number, CoordTuple]> {
  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('boardCoord', () => getBoardCoordParts(point.coord)),
    P.Effect.bind('renderCoord', () => getRenderCoord(params, point.coord)),
    P.Effect.map(({ boardCoord, renderCoord }) => [...boardCoord, renderCoord] as [COORD_CHAR, number, CoordTuple])
  );
}

export function boardPointsToCoords<D extends number, N extends number>(
  params: MorrisBoardRenderParamsText,
  points: ReadonlyArray<MorrisBoardPoint<D, N>>
): P.Effect.Effect<never, MorrisEngineError, Array<[COORD_CHAR, number, CoordTuple]>> {
  return P.pipe(
    points.map((p) => boardPointToCoord(params, p)),
    P.Effect.all
  );
}
