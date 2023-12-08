/* eslint-disable fp/no-mutating-methods,fp/no-unused-expression,fp/no-mutation,fp/no-nil,fp/no-loops */
import * as P from '@konker.dev/effect-ts-prelude';
import chalk from 'chalk';
import _uniqWith from 'lodash/uniqWith';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import type { MorrisBoard, MorrisBoardLink, MorrisBoardPoint } from '../board';
import { isOccupied } from '../board/points';
import type { MorrisBoardCoordS } from '../board/schemas';
import type { COORD_CHAR } from '../consts';
import { A, B, COORD_CHARS, LF, MorrisColor, MorrisLinkType, PT, X, Y } from '../consts';
import type { MorrisGameTick } from '../tick';

export const COORD_PAD_H = 2;
export const COORD_PAD_V = 1;

export type CoordTuple = [number, number];

export type LineFunc = (x: number) => number;

export function lineFunc(a: CoordTuple, b: CoordTuple): LineFunc {
  const m = (b[Y] - a[Y]) / (b[X] - a[X]);
  const c = a[Y] - m * a[X];

  return (x: number) => m * x + c;
}

export type MorrisBoardRenderConfigText = {
  readonly xScale: number;
  readonly yScale: number;
  readonly pad: number;
  readonly colorBoardBg: string;
  readonly colorBoard: string;
  readonly colorCoords: string;
  readonly colorCoordsBg: string;
  readonly colorWhite: string;
  readonly colorBlack: string;
  readonly avatarEmpty: string;
  readonly avatarWhite: string;
  readonly avatarBlack: string;
  readonly boardH: string;
  readonly boardV: string;
  readonly boardDB: string;
  readonly boardDF: string;
  readonly boardBlack: string;
};

export const DEFAULT_MORRIS_BOARD_RENDER_CONFIG_TEXT: MorrisBoardRenderConfigText = {
  xScale: 3,
  yScale: 2,
  pad: 1,
  colorBoardBg: '#a67b5b',
  colorBoard: '#333333',
  colorCoords: '#ffffff',
  colorCoordsBg: '#000000',
  colorWhite: '#ffffff', //'#ffff00',
  colorBlack: '#000000', //'#0000aa',
  avatarEmpty: '⦁',
  avatarWhite: '●',
  avatarBlack: '●',
  boardH: '─',
  boardV: '│',
  boardDB: '╲',
  boardDF: '╱',
  boardBlack: ' ',
};

export type MorrisBoardRenderContext = {
  readonly config: MorrisBoardRenderConfigText;
  readonly w: number;
  readonly h: number;
  readonly coords: Array<[[COORD_CHAR, number], CoordTuple]>;
  readonly hLinks: Array<[CoordTuple, CoordTuple]>;
  readonly vLinks: Array<[CoordTuple, CoordTuple]>;
  readonly dbLinks: Array<[CoordTuple, CoordTuple, LineFunc]>;
  readonly dfLinks: Array<[CoordTuple, CoordTuple, LineFunc]>;
  readonly renderPoints: Array<Array<string>>;
};

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
      const x = COORD_PAD_H + config.pad + bxn * config.xScale + bxn;
      const y = h - (by - 1) * config.yScale - 1 - COORD_PAD_V;

      return [x, y];
    })
  );
}

export function getRenderCoord<D extends number>(
  context: MorrisBoardRenderContext,
  coord: MorrisBoardCoordS<D>
): P.Effect.Effect<never, MorrisEngineError, CoordTuple> {
  return _getRenderCoordExec(context.config, context.h, coord);
}

export function pointsToCoord<D extends number, N extends number>(
  config: MorrisBoardRenderConfigText,
  point: MorrisBoardPoint<D, N>,
  h: number
): P.Effect.Effect<never, MorrisEngineError, [[COORD_CHAR, number], CoordTuple]> {
  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('boardCoord', () => getBoardCoordParts(point.coord)),
    P.Effect.bind('renderCoord', () => _getRenderCoordExec(config, h, point.coord)),
    P.Effect.map(
      ({ boardCoord, renderCoord }) => [boardCoord, renderCoord as CoordTuple] as [[COORD_CHAR, number], CoordTuple]
    )
  );
}

export function pointsToCoords<D extends number, N extends number>(
  config: MorrisBoardRenderConfigText,
  h: number,
  points: Array<MorrisBoardPoint<D, N>>
): P.Effect.Effect<never, MorrisEngineError, Array<[[COORD_CHAR, number], CoordTuple]>> {
  return P.pipe(
    points.map((p) => pointsToCoord(config, p, h)),
    P.Effect.all
  );
}

export function linkToCoordsH<D extends number, N extends number>(
  config: MorrisBoardRenderConfigText,
  h: number,
  point: MorrisBoardPoint<D, N>,
  link: MorrisBoardLink<D>
): P.Effect.Effect<never, MorrisEngineError, [CoordTuple, CoordTuple]> {
  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('c1', () => _getRenderCoordExec(config, h, point.coord)),
    P.Effect.bind('c2', () => _getRenderCoordExec(config, h, link.to)),
    P.Effect.map(({ c1, c2 }) => [c1, c2].sort((c1, c2) => c1[X] - c2[X]) as [CoordTuple, CoordTuple])
  );
}

export function linksH<D extends number, N extends number>(
  config: MorrisBoardRenderConfigText,
  h: number,
  points: Array<MorrisBoardPoint<D, N>>
): P.Effect.Effect<never, MorrisEngineError, Array<[CoordTuple, CoordTuple]>> {
  return P.pipe(
    points
      .map((p) =>
        p.links.filter((l) => l.linkType === MorrisLinkType.HORIZONTAL).map((link) => linkToCoordsH(config, h, p, link))
      )
      .flat(),
    P.Effect.all,
    P.Effect.map((ret) => _uniqWith(ret, (l1, l2) => l1[A][X] === l2[A][X] && l1[A][Y] === l2[A][Y])),
    P.Effect.map((ret) => ret.sort((l1, l2) => l2[A]![Y] - l1[B]![Y]))
  );
}

export function linkToCoordsV<D extends number, N extends number>(
  config: MorrisBoardRenderConfigText,
  h: number,
  point: MorrisBoardPoint<D, N>,
  link: MorrisBoardLink<D>
): P.Effect.Effect<never, MorrisEngineError, [CoordTuple, CoordTuple]> {
  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('c1', () => _getRenderCoordExec(config, h, point.coord)),
    P.Effect.bind('c2', () => _getRenderCoordExec(config, h, link.to)),
    P.Effect.map(({ c1, c2 }) => [c1, c2].sort((c1, c2) => c1[Y] - c2[Y]) as [CoordTuple, CoordTuple])
  );
}

export function linksV<D extends number, N extends number>(
  config: MorrisBoardRenderConfigText,
  h: number,
  points: Array<MorrisBoardPoint<D, N>>
): P.Effect.Effect<never, MorrisEngineError, Array<[CoordTuple, CoordTuple]>> {
  return P.pipe(
    points
      .map((p) =>
        p.links.filter((l) => l.linkType === MorrisLinkType.VERTICAL).map((link) => linkToCoordsV(config, h, p, link))
      )
      .flat(),
    P.Effect.all,
    P.Effect.map((ret) => _uniqWith(ret, (l1, l2) => l1[A][X] === l2[A][X] && l1[A][Y] === l2[A][Y])),
    P.Effect.map((ret) => ret.sort((l1, l2) => l2[A]![X] - l1[B]![X]))
  );
}

export function linkToCoordsD<D extends number, N extends number>(
  config: MorrisBoardRenderConfigText,
  h: number,
  point: MorrisBoardPoint<D, N>,
  link: MorrisBoardLink<D>
): P.Effect.Effect<never, MorrisEngineError, [CoordTuple, CoordTuple]> {
  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('c1', () => _getRenderCoordExec(config, h, point.coord)),
    P.Effect.bind('c2', () => _getRenderCoordExec(config, h, link.to)),
    P.Effect.map(({ c1, c2 }) => [c1, c2].sort((c1, c2) => c1[Y] - c2[Y]) as [CoordTuple, CoordTuple])
  );
}

export function linksDB<D extends number, N extends number>(
  config: MorrisBoardRenderConfigText,
  h: number,
  points: Array<MorrisBoardPoint<D, N>>
): P.Effect.Effect<never, MorrisEngineError, Array<[CoordTuple, CoordTuple, LineFunc]>> {
  return P.pipe(
    points
      .map((p) =>
        p.links.filter((l) => l.linkType === MorrisLinkType.DIAGONAL_B).map((link) => linkToCoordsD(config, h, p, link))
      )
      .flat(),
    P.Effect.all,
    P.Effect.map((ret) => _uniqWith(ret, (l1, l2) => l1[A][X] === l2[A][X] && l1[A][Y] === l2[A][Y])),
    P.Effect.map((ret) => ret.sort((l1, l2) => l2[A]![X] - l1[B]![X])),
    P.Effect.map((ret) => ret.map(([a, b]) => [a, b, lineFunc(a, b)]))
  );
}

export function linksDF<D extends number, N extends number>(
  config: MorrisBoardRenderConfigText,
  h: number,
  points: Array<MorrisBoardPoint<D, N>>
): P.Effect.Effect<never, MorrisEngineError, Array<[CoordTuple, CoordTuple, LineFunc]>> {
  return P.pipe(
    points
      .map((p) =>
        p.links.filter((l) => l.linkType === MorrisLinkType.DIAGONAL_F).map((link) => linkToCoordsD(config, h, p, link))
      )
      .flat(),
    P.Effect.all,
    P.Effect.map((ret) => _uniqWith(ret, (l1, l2) => l1[A][X] === l2[A][X] && l1[A][Y] === l2[A][Y])),
    P.Effect.map((ret) => ret.sort((l1, l2) => l2[A]![X] - l1[B]![X])),
    P.Effect.map((ret) => ret.map(([a, b]) => [a, b, lineFunc(a, b)]))
  );
}

export function initMorrisBoardRenderContext<P extends number, D extends number, N extends number>(
  config: MorrisBoardRenderConfigText,
  board: MorrisBoard<P, D, N>
): P.Effect.Effect<never, MorrisEngineError, MorrisBoardRenderContext> {
  const w = COORD_PAD_H + board.dimension + (board.dimension - 1) * config.xScale + config.pad * 2;
  const h = board.dimension * config.yScale - 1 + COORD_PAD_V;

  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('coords', () => pointsToCoords(config, h, board.points)),
    P.Effect.bind('hLinks', () => linksH(config, h, board.points)),
    P.Effect.bind('vLinks', () => linksV(config, h, board.points)),
    P.Effect.bind('dbLinks', () => linksDB(config, h, board.points)),
    P.Effect.bind('dfLinks', () => linksDF(config, h, board.points)),
    P.Effect.map(({ coords, dbLinks, dfLinks, hLinks, vLinks }) => ({
      config,
      w,
      h,
      coords,
      hLinks,
      vLinks,
      dbLinks,
      dfLinks,

      renderPoints: Array(h)
        .fill('_')
        .map((_) => Array(w).fill('?')),
    }))
  );
}

export function isCoordV(_context: MorrisBoardRenderContext, p: CoordTuple): boolean {
  return p[X] < COORD_PAD_H;
}

export function isCoordH(context: MorrisBoardRenderContext, p: CoordTuple): boolean {
  return p[Y] >= context.h - COORD_PAD_V;
}

export function isOnLineH(a: CoordTuple, b: CoordTuple, p: CoordTuple): boolean {
  return p[Y] === a[Y] && p[Y] === b[Y] && a[X] < p[X] && p[X] < b[X];
}

export function isOnLineV(a: CoordTuple, b: CoordTuple, p: CoordTuple): boolean {
  return p[X] === a[X] && p[X] === b[X] && a[Y] < p[Y] && p[Y] < b[Y];
}

export function isOnLineDB(a: CoordTuple, b: CoordTuple, l: LineFunc, p: CoordTuple): boolean {
  return a[X] < p[X] && p[X] < b[X] && p[Y] === l(p[X]);
}

export function isOnLineDF(a: CoordTuple, b: CoordTuple, l: LineFunc, p: CoordTuple): boolean {
  return a[Y] < p[Y] && p[Y] < b[Y] && p[Y] === l(p[X]);
}

export function isH(context: MorrisBoardRenderContext, x: CoordTuple): boolean {
  for (const l of context.hLinks) {
    if (isOnLineH(l[A], l[B], x)) {
      return true;
    }
    if (x[Y] > l[A][Y]) {
      return false;
    }
  }
  return false;
}

export function isV(context: MorrisBoardRenderContext, x: CoordTuple): boolean {
  for (const l of context.vLinks) {
    if (isOnLineV(l[A], l[B], x)) {
      return true;
    }
    if (x[X] > l[B][X]) {
      return false;
    }
  }
  return false;
}

export function isDB(context: MorrisBoardRenderContext, x: CoordTuple): boolean {
  for (const l of context.dbLinks) {
    if (isOnLineDB(l[A], l[B], l[LF], x)) {
      return true;
    }
    if (x[X] > l[B][X]) {
      return false;
    }
  }
  return false;
}

export function isDF(context: MorrisBoardRenderContext, x: CoordTuple): boolean {
  for (const l of context.dfLinks) {
    if (isOnLineDF(l[A], l[B], l[LF], x)) {
      return true;
    }
    // if (x[X] > l[B][X]) {
    //   return false;
    // }
  }
  return false;
}

export function getCoordV(context: MorrisBoardRenderContext, x: CoordTuple): string {
  const coord = context.coords.find((c) => c[1][1] === x[1])?.[0]?.[1];
  return coord && x[0] === 0 ? String(coord) : ' ';
}

export function getCoordH(context: MorrisBoardRenderContext, x: CoordTuple): string {
  const coord = context.coords.find((c) => c[1][0] === x[0])?.[0]?.[0];
  return coord ?? ' ';
}

export function renderOccupant<D extends number, N extends number>(
  context: MorrisBoardRenderContext,
  p: MorrisBoardPoint<D, N>
): string {
  return isOccupied(p)
    ? p.occupant.color === MorrisColor.WHITE
      ? chalk.bgHex(context.config.colorBoardBg).hex(context.config.colorWhite).bold(context.config.avatarWhite)
      : chalk.bgHex(context.config.colorBoardBg).hex(context.config.colorBlack).bold(context.config.avatarBlack)
    : chalk.bgHex(context.config.colorBoardBg).hex(context.config.colorBoard).bold(context.config.avatarEmpty);
}

export function renderString<P extends number, D extends number, N extends number>(
  gameTick: MorrisGameTick<P, D, N>
): P.Effect.Effect<never, MorrisEngineError, string> {
  return P.pipe(
    initMorrisBoardRenderContext(DEFAULT_MORRIS_BOARD_RENDER_CONFIG_TEXT, gameTick.game.board),
    P.Effect.map((context) => {
      console.log(context.dbLinks);
      console.log(context.dfLinks);
      context.renderPoints.forEach((row, j) =>
        row.forEach((_, i) => {
          if (isH(context, [i, j])) {
            context.renderPoints[j]![i] = chalk
              .bgHex(context.config.colorBoardBg)
              .hex(context.config.colorBoard)
              .dim(context.config.boardH);
          } else if (isV(context, [i, j])) {
            context.renderPoints[j]![i] = chalk
              .bgHex(context.config.colorBoardBg)
              .hex(context.config.colorBoard)
              .dim(context.config.boardV);
          } else if (isDB(context, [i, j])) {
            context.renderPoints[j]![i] = chalk
              .bgHex(context.config.colorBoardBg)
              .hex(context.config.colorBoard)
              .dim(context.config.boardDB);
          } else if (isDF(context, [i, j])) {
            context.renderPoints[j]![i] = chalk
              .bgHex(context.config.colorBoardBg)
              .hex(context.config.colorBoard)
              .dim(context.config.boardDF);
          } else if (isCoordH(context, [i, j])) {
            context.renderPoints[j]![i] = chalk
              .bgHex(context.config.colorCoordsBg)
              .hex(context.config.colorCoords)
              .dim(getCoordH(context, [i, j]));
          } else if (isCoordV(context, [i, j])) {
            context.renderPoints[j]![i] = chalk
              .bgHex(context.config.colorCoordsBg)
              .hex(context.config.colorCoords)
              .dim(getCoordV(context, [i, j]));
          } else {
            context.renderPoints[j]![i] = chalk
              .bgHex(context.config.colorBoardBg)
              .hex(context.config.colorBoard)
              .dim(' ');
          }
        })
      );
      return context;
    }),
    P.Effect.flatMap((context) => {
      return P.pipe(
        gameTick.game.board.points.map((p) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('renderCoords', () => getRenderCoord(context, p.coord)),
            P.Effect.map(({ renderCoords }) => [...renderCoords, p] as [number, number, MorrisBoardPoint<D, N>])
          )
        ),
        P.Effect.all,
        P.Effect.map((pointCoords) => {
          pointCoords.forEach((pointCoord) => {
            context.renderPoints[pointCoord[Y]]![pointCoord[X]] = renderOccupant(context, pointCoord[PT]);
          });
          return context;
        }),
        P.Effect.map((context) => context.renderPoints.map((row) => row.join('')).join('\n'))
      );
    })
  );
}
