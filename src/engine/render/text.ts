/* eslint-disable fp/no-mutating-methods,fp/no-unused-expression,fp/no-mutation,fp/no-nil */
import * as P from '@konker.dev/effect-ts-prelude';
import chalk from 'chalk';

import type { MorrisEngineError } from '../../lib/error';
import type { MorrisBoard, MorrisBoardPoint } from '../board';
import { isOccupied } from '../board/points';
import type { MorrisBoardCoordS } from '../board/schemas';
import type { COORD_CHAR } from '../consts';
import { COORD_CHARS, MorrisColor, MorrisLinkType } from '../consts';
import type { MorrisGameTick } from '../tick';

export const COORD_PAD_H = 2;
export const COORD_PAD_V = 1;

export type CoordTuple = [number, number];

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

export type MorrisBoardRenderParams = {
  readonly config: MorrisBoardRenderConfigText;
  readonly w: number;
  readonly h: number;
  readonly coords: Array<[[COORD_CHAR, number], CoordTuple]>;
  readonly hLinks: Array<[CoordTuple, CoordTuple]>;
  readonly vLinks: Array<[CoordTuple, CoordTuple]>;
  readonly dbLinks: Array<[CoordTuple, CoordTuple]>;
  readonly dfLinks: Array<[CoordTuple, CoordTuple]>;
  readonly renderPoints: Array<Array<string>>;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export function unsafe_getBoardCoordParts<D extends number>(coord: MorrisBoardCoordS<D>): [COORD_CHAR, number] {
  const parts = coord.split('', 2);
  const bx = COORD_CHARS.find((c) => c === parts[0]!) as COORD_CHAR;
  const by = parseInt(parts[1]!, 10);

  return [bx, by];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function _unsafe_getRenderCoordExec<D extends number>(
  config: MorrisBoardRenderConfigText,
  h: number,
  coord: MorrisBoardCoordS<D>
): CoordTuple {
  const [bx, by] = unsafe_getBoardCoordParts(coord);
  const bxn = COORD_CHARS.indexOf(bx);
  const x = COORD_PAD_H + config.pad + bxn * config.xScale + bxn;
  const y = h - (by - 1) * config.yScale - 1 - COORD_PAD_V;

  return [x, y];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function unsafe_getRenderCoord<D extends number>(
  params: MorrisBoardRenderParams,
  coord: MorrisBoardCoordS<D>
): CoordTuple {
  return _unsafe_getRenderCoordExec(params.config, params.h, coord);
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function unsafe_initMorrisBoardRenderParams<P extends number, D extends number, N extends number>(
  config: MorrisBoardRenderConfigText,
  board: MorrisBoard<P, D, N>
): MorrisBoardRenderParams {
  const w = COORD_PAD_H + board.dimension + (board.dimension - 1) * config.xScale + config.pad * 2;
  const h = board.dimension * config.yScale - 1 + COORD_PAD_V;

  return {
    config,
    w,
    h,

    coords: board.points.map((p) => [
      unsafe_getBoardCoordParts(p.coord),
      _unsafe_getRenderCoordExec(config, h, p.coord),
    ]),

    // FIXME: de-dup sorted links
    hLinks: board.points.flatMap((p) =>
      p.links
        .filter((l) => l.linkType === MorrisLinkType.HORIZONTAL)
        .map((l) =>
          [_unsafe_getRenderCoordExec(config, h, p.coord), _unsafe_getRenderCoordExec(config, h, l.to)].sort(
            (a, b) => a[0] - b[0]
          )
        )
    ) as Array<[CoordTuple, CoordTuple]>,

    // FIXME: de-dup sorted links
    vLinks: board.points.flatMap((p) =>
      p.links
        .filter((l) => l.linkType === MorrisLinkType.VERTICAL)
        .map((l) =>
          [_unsafe_getRenderCoordExec(config, h, p.coord), _unsafe_getRenderCoordExec(config, h, l.to)].sort(
            (a, b) => a[1] - b[1]
          )
        )
    ) as Array<[CoordTuple, CoordTuple]>,

    // FIXME: de-dup sorted links
    dbLinks: board.points.flatMap((p) =>
      p.links
        .filter((l) => l.linkType === MorrisLinkType.DIAGONAL_B)
        .map((l) =>
          [_unsafe_getRenderCoordExec(config, h, p.coord), _unsafe_getRenderCoordExec(config, h, l.to)].sort(
            (a, b) => a[0] - b[0]
          )
        )
    ) as Array<[CoordTuple, CoordTuple]>,

    // FIXME: de-dup sorted links
    dfLinks: board.points.flatMap((p) =>
      p.links
        .filter((l) => l.linkType === MorrisLinkType.DIAGONAL_F)
        .map((l) =>
          [_unsafe_getRenderCoordExec(config, h, p.coord), _unsafe_getRenderCoordExec(config, h, l.to)].sort(
            (a, b) => a[1] - b[1]
          )
        )
    ) as Array<[CoordTuple, CoordTuple]>,

    renderPoints: Array(h)
      .fill('_')
      .map((_) => Array(w).fill('?')),
  };
}

export function isCoordV(_params: MorrisBoardRenderParams, x: CoordTuple): boolean {
  return x[0] < COORD_PAD_H;
}

export function isCoordH(params: MorrisBoardRenderParams, x: CoordTuple): boolean {
  return x[1] >= params.h - COORD_PAD_V;
}

export function isOnLineH(a: CoordTuple, b: CoordTuple, x: CoordTuple): boolean {
  return x[1] === a[1] && x[1] === b[1] && a[0] < x[0] && x[0] < b[0];
}

export function isOnLineV(a: CoordTuple, b: CoordTuple, x: CoordTuple): boolean {
  return x[0] === a[0] && x[0] === b[0] && a[1] < x[1] && x[1] < b[1];
}

// FIXME: pre-compute l func
export function isOnLineDB(a: CoordTuple, b: CoordTuple, x: CoordTuple): boolean {
  const m = (b[1] - a[1]) / (b[0] - a[0]);
  const c = a[1] - m * a[0];
  const l = (x: number) => m * x + c;

  return a[0] < x[0] && x[0] < b[0] && x[1] === l(x[0]);
}

// FIXME: pre-compute l func
export function isOnLineDF(a: CoordTuple, b: CoordTuple, x: CoordTuple): boolean {
  const m = (b[1] - a[1]) / (b[0] - a[0]);
  const c = a[1] - m * a[0];
  const l = (x: number) => m * x + c;

  return a[1] < x[1] && x[1] < b[1] && x[1] === l(x[0]);
}

// FIXME: sort list and short-circuit search based on x[0]
export function isH(params: MorrisBoardRenderParams, x: CoordTuple): boolean {
  return params.hLinks.some((l) => isOnLineH(l[0], l[1], x));
}

// FIXME: sort list and short-circuit search based on x[1]
export function isV(params: MorrisBoardRenderParams, x: CoordTuple): boolean {
  return params.vLinks.some((l) => isOnLineV(l[0], l[1], x));
}

// FIXME: sort list and short-circuit search based on x
export function isDB(params: MorrisBoardRenderParams, x: CoordTuple): boolean {
  return params.dbLinks.some((l) => isOnLineDB(l[0], l[1], x));
}

// FIXME: sort list and short-circuit search based on x
export function isDF(params: MorrisBoardRenderParams, x: CoordTuple): boolean {
  return params.dfLinks.some((l) => isOnLineDF(l[0], l[1], x));
}

export function getCoordV(params: MorrisBoardRenderParams, x: CoordTuple): string {
  const coord = params.coords.find((c) => c[1][1] === x[1])?.[0]?.[1];
  return coord && x[0] === 0 ? String(coord) : ' ';
}

export function getCoordH(params: MorrisBoardRenderParams, x: CoordTuple): string {
  const coord = params.coords.find((c) => c[1][0] === x[0])?.[0]?.[0];
  return coord ?? ' ';
}

export function renderOccupant<D extends number, N extends number>(
  params: MorrisBoardRenderParams,
  p: MorrisBoardPoint<D, N>
): string {
  return isOccupied(p)
    ? p.occupant.color === MorrisColor.WHITE
      ? chalk.bgHex(params.config.colorBoardBg).hex(params.config.colorWhite).bold(params.config.avatarWhite)
      : chalk.bgHex(params.config.colorBoardBg).hex(params.config.colorBlack).bold(params.config.avatarBlack)
    : chalk.bgHex(params.config.colorBoardBg).hex(params.config.colorBoard).bold(params.config.avatarEmpty);
}

// FIXME: unsafe
export function renderString<P extends number, D extends number, N extends number>(
  gameTick: MorrisGameTick<P, D, N>
): P.Effect.Effect<never, MorrisEngineError, string> {
  const params = unsafe_initMorrisBoardRenderParams(DEFAULT_MORRIS_BOARD_RENDER_CONFIG_TEXT, gameTick.game.board);

  params.renderPoints.forEach((row, j) =>
    row.forEach((_, i) => {
      if (isH(params, [i, j])) {
        params.renderPoints[j]![i] = chalk
          .bgHex(params.config.colorBoardBg)
          .hex(params.config.colorBoard)
          .dim(params.config.boardH);
      } else if (isV(params, [i, j])) {
        params.renderPoints[j]![i] = chalk
          .bgHex(params.config.colorBoardBg)
          .hex(params.config.colorBoard)
          .dim(params.config.boardV);
      } else if (isDB(params, [i, j])) {
        params.renderPoints[j]![i] = chalk
          .bgHex(params.config.colorBoardBg)
          .hex(params.config.colorBoard)
          .dim(params.config.boardDB);
      } else if (isDF(params, [i, j])) {
        params.renderPoints[j]![i] = chalk
          .bgHex(params.config.colorBoardBg)
          .hex(params.config.colorBoard)
          .dim(params.config.boardDF);
      } else if (isCoordH(params, [i, j])) {
        params.renderPoints[j]![i] = chalk
          .bgHex(params.config.colorCoordsBg)
          .hex(params.config.colorCoords)
          .dim(getCoordH(params, [i, j]));
      } else if (isCoordV(params, [i, j])) {
        params.renderPoints[j]![i] = chalk
          .bgHex(params.config.colorCoordsBg)
          .hex(params.config.colorCoords)
          .dim(getCoordV(params, [i, j]));
      } else {
        params.renderPoints[j]![i] = chalk.bgHex(params.config.colorBoardBg).hex(params.config.colorBoard).dim(' ');
      }
    })
  );

  gameTick.game.board.points.forEach((p) => {
    const [x, y] = unsafe_getRenderCoord(params, p.coord);
    params.renderPoints[y]![x] = renderOccupant(params, p);
  });

  return P.Effect.succeed(params.renderPoints.map((row) => row.join('')).join('\n'));
}
