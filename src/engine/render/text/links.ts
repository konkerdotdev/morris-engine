/* eslint-disable fp/no-mutating-methods */
import * as P from '@konker.dev/effect-ts-prelude';
import _uniqWith from 'lodash/uniqWith';

import type { MorrisEngineError } from '../../../lib/error';
import type { MorrisBoardLink, MorrisBoardPoint } from '../../board/schemas';
import type { MorrisLinkType } from '../../consts';
import { A, B, X, Y } from '../../consts';
import type { CoordTuple, LineFunc, MorrisBoardRenderParamsText } from './index';
import { getRenderCoord } from './points';

export function lineFunc(a: CoordTuple, b: CoordTuple): LineFunc {
  const m = (b[Y] - a[Y]) / (b[X] - a[X]);
  const c = a[Y] - m * a[X];

  return (x: number) => m * x + c;
}

export function linkToCoords(
  params: MorrisBoardRenderParamsText,
  point: MorrisBoardPoint,
  link: MorrisBoardLink,
  sortAxisC: typeof X | typeof Y
): P.Effect.Effect<[CoordTuple, CoordTuple], MorrisEngineError> {
  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('c1', () => getRenderCoord(params, point.coord)),
    P.Effect.bind('c2', () => getRenderCoord(params, link.to)),
    P.Effect.map(({ c1, c2 }) => [c1, c2].sort((c1, c2) => c1[sortAxisC] - c2[sortAxisC]) as [CoordTuple, CoordTuple])
  );
}

export function links(
  params: MorrisBoardRenderParamsText,
  points: ReadonlyArray<MorrisBoardPoint>,
  linkType: MorrisLinkType,
  sortAxisL: typeof X | typeof Y,
  sortAxisC: typeof X | typeof Y
): P.Effect.Effect<Array<[CoordTuple, CoordTuple]>, MorrisEngineError> {
  return P.pipe(
    points
      .map((p) =>
        p.links.filter((l) => l.linkType === linkType).map((link) => linkToCoords(params, p, link, sortAxisC))
      )
      .flat(),
    P.Effect.all,
    P.Effect.map((ret) => _uniqWith(ret, (l1, l2) => l1[A][X] === l2[A][X] && l1[A][Y] === l2[A][Y])),
    P.Effect.map((ret) => ret.sort((l1, l2) => l2[A][sortAxisL] - l1[B][sortAxisL]))
  );
}

export function linksD(
  params: MorrisBoardRenderParamsText,
  points: ReadonlyArray<MorrisBoardPoint>,
  linkType: MorrisLinkType,
  sortAxisL: typeof X | typeof Y,
  sortAxisC: typeof X | typeof Y
): P.Effect.Effect<Array<[CoordTuple, CoordTuple, LineFunc]>, MorrisEngineError> {
  return P.pipe(
    links(params, points, linkType, sortAxisL, sortAxisC),
    P.Effect.map((ret) => ret.map(([a, b]) => [a, b, lineFunc(a, b)]))
  );
}
