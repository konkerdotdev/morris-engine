/* eslint-disable fp/no-mutating-methods */
import * as P from '@konker.dev/effect-ts-prelude';
import _uniqWith from 'lodash/uniqWith';

import type { MorrisEngineError } from '../../../lib/error';
import type { MorrisBoardLink, MorrisBoardPoint } from '../../board';
import { A, B, MorrisLinkType, X, Y } from '../../consts';
import type { CoordTuple, LineFunc, MorrisBoardRenderParams } from './index';
import { getRenderCoord } from './points';

export function lineFunc(a: CoordTuple, b: CoordTuple): LineFunc {
  const m = (b[Y] - a[Y]) / (b[X] - a[X]);
  const c = a[Y] - m * a[X];

  return (x: number) => m * x + c;
}

export function linkToCoordsH<D extends number, N extends number>(
  params: MorrisBoardRenderParams,
  point: MorrisBoardPoint<D, N>,
  link: MorrisBoardLink<D>
): P.Effect.Effect<never, MorrisEngineError, [CoordTuple, CoordTuple]> {
  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('c1', () => getRenderCoord(params, point.coord)),
    P.Effect.bind('c2', () => getRenderCoord(params, link.to)),
    P.Effect.map(({ c1, c2 }) => [c1, c2].sort((c1, c2) => c1[X] - c2[X]) as [CoordTuple, CoordTuple])
  );
}

export function linksH<D extends number, N extends number>(
  params: MorrisBoardRenderParams,
  points: Array<MorrisBoardPoint<D, N>>
): P.Effect.Effect<never, MorrisEngineError, Array<[CoordTuple, CoordTuple]>> {
  return P.pipe(
    points
      .map((p) =>
        p.links.filter((l) => l.linkType === MorrisLinkType.HORIZONTAL).map((link) => linkToCoordsH(params, p, link))
      )
      .flat(),
    P.Effect.all,
    P.Effect.map((ret) => _uniqWith(ret, (l1, l2) => l1[A][X] === l2[A][X] && l1[A][Y] === l2[A][Y])),
    P.Effect.map((ret) => ret.sort((l1, l2) => l2[A]![Y] - l1[B]![Y]))
  );
}

export function linkToCoordsV<D extends number, N extends number>(
  params: MorrisBoardRenderParams,
  point: MorrisBoardPoint<D, N>,
  link: MorrisBoardLink<D>
): P.Effect.Effect<never, MorrisEngineError, [CoordTuple, CoordTuple]> {
  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('c1', () => getRenderCoord(params, point.coord)),
    P.Effect.bind('c2', () => getRenderCoord(params, link.to)),
    P.Effect.map(({ c1, c2 }) => [c1, c2].sort((c1, c2) => c1[Y] - c2[Y]) as [CoordTuple, CoordTuple])
  );
}

export function linksV<D extends number, N extends number>(
  params: MorrisBoardRenderParams,
  points: Array<MorrisBoardPoint<D, N>>
): P.Effect.Effect<never, MorrisEngineError, Array<[CoordTuple, CoordTuple]>> {
  return P.pipe(
    points
      .map((p) =>
        p.links.filter((l) => l.linkType === MorrisLinkType.VERTICAL).map((link) => linkToCoordsV(params, p, link))
      )
      .flat(),
    P.Effect.all,
    P.Effect.map((ret) => _uniqWith(ret, (l1, l2) => l1[A][X] === l2[A][X] && l1[A][Y] === l2[A][Y])),
    P.Effect.map((ret) => ret.sort((l1, l2) => l2[A]![X] - l1[B]![X]))
  );
}

export function linkToCoordsD<D extends number, N extends number>(
  params: MorrisBoardRenderParams,
  point: MorrisBoardPoint<D, N>,
  link: MorrisBoardLink<D>
): P.Effect.Effect<never, MorrisEngineError, [CoordTuple, CoordTuple]> {
  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('c1', () => getRenderCoord(params, point.coord)),
    P.Effect.bind('c2', () => getRenderCoord(params, link.to)),
    P.Effect.map(({ c1, c2 }) => [c1, c2].sort((c1, c2) => c1[Y] - c2[Y]) as [CoordTuple, CoordTuple])
  );
}

export function linksDB<D extends number, N extends number>(
  params: MorrisBoardRenderParams,
  points: Array<MorrisBoardPoint<D, N>>
): P.Effect.Effect<never, MorrisEngineError, Array<[CoordTuple, CoordTuple, LineFunc]>> {
  return P.pipe(
    points
      .map((p) =>
        p.links.filter((l) => l.linkType === MorrisLinkType.DIAGONAL_B).map((link) => linkToCoordsD(params, p, link))
      )
      .flat(),
    P.Effect.all,
    P.Effect.map((ret) => _uniqWith(ret, (l1, l2) => l1[A][X] === l2[A][X] && l1[A][Y] === l2[A][Y])),
    P.Effect.map((ret) => ret.sort((l1, l2) => l2[A]![X] - l1[B]![X])),
    P.Effect.map((ret) => ret.map(([a, b]) => [a, b, lineFunc(a, b)]))
  );
}

export function linksDF<D extends number, N extends number>(
  params: MorrisBoardRenderParams,
  points: Array<MorrisBoardPoint<D, N>>
): P.Effect.Effect<never, MorrisEngineError, Array<[CoordTuple, CoordTuple, LineFunc]>> {
  return P.pipe(
    points
      .map((p) =>
        p.links.filter((l) => l.linkType === MorrisLinkType.DIAGONAL_F).map((link) => linkToCoordsD(params, p, link))
      )
      .flat(),
    P.Effect.all,
    P.Effect.map((ret) => _uniqWith(ret, (l1, l2) => l1[A][X] === l2[A][X] && l1[A][Y] === l2[A][Y])),
    P.Effect.map((ret) => ret.sort((l1, l2) => l2[A]![X] - l1[B]![X])),
    P.Effect.map((ret) => ret.map(([a, b]) => [a, b, lineFunc(a, b)]))
  );
}
