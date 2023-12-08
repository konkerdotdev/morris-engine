import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../../lib/error';
import { toMorrisEngineError } from '../../../lib/error';
import type { MorrisBoardPoint } from '../../board';
import type { MorrisBoardCoordS } from '../../board/schemas';
import type { COORD_CHAR } from '../../consts';
import { COORD_CHARS } from '../../consts';
import type { CoordTuple, MorrisBoardRenderConfigText, MorrisBoardRenderParams } from './index';

export function getBoardCoordParts<D extends number>(
  coord: MorrisBoardCoordS<D>
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

// eslint-disable-next-line @typescript-eslint/naming-convention
export function _getRenderCoordExec<D extends number>(
  config: MorrisBoardRenderConfigText,
  h: number,
  coord: MorrisBoardCoordS<D>
): P.Effect.Effect<never, MorrisEngineError, CoordTuple> {
  return P.pipe(
    getBoardCoordParts(coord),
    P.Effect.map(([bx, by]) => {
      const bxn = COORD_CHARS.indexOf(bx);
      const x = config.coordPadH + config.pad + bxn * config.xScale + bxn;
      const y = h - (by - 1) * config.yScale - 1 - config.coordPadV;

      return [x, y];
    })
  );
}

export function getRenderCoord<D extends number>(
  params: MorrisBoardRenderParams,
  coord: MorrisBoardCoordS<D>
): P.Effect.Effect<never, MorrisEngineError, CoordTuple> {
  return P.pipe(
    getBoardCoordParts(coord),
    P.Effect.map(([bx, by]) => {
      const bxn = COORD_CHARS.indexOf(bx);
      const x = params.config.coordPadH + params.config.pad + bxn * params.config.xScale + bxn;
      const y = params.h - (by - 1) * params.config.yScale - 1 - params.config.coordPadV;

      return [x, y];
    })
  );
}

export function pointsToCoord<D extends number, N extends number>(
  params: MorrisBoardRenderParams,
  point: MorrisBoardPoint<D, N>
): P.Effect.Effect<never, MorrisEngineError, [[COORD_CHAR, number], CoordTuple]> {
  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('boardCoord', () => getBoardCoordParts(point.coord)),
    P.Effect.bind('renderCoord', () => getRenderCoord(params, point.coord)),
    P.Effect.map(
      ({ boardCoord, renderCoord }) => [boardCoord, renderCoord as CoordTuple] as [[COORD_CHAR, number], CoordTuple]
    )
  );
}

export function pointsToCoords<D extends number, N extends number>(
  params: MorrisBoardRenderParams,
  points: Array<MorrisBoardPoint<D, N>>
): P.Effect.Effect<never, MorrisEngineError, Array<[[COORD_CHAR, number], CoordTuple]>> {
  return P.pipe(
    points.map((p) => pointsToCoord(params, p)),
    P.Effect.all
  );
}
