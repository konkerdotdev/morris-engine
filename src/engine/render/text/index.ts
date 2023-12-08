/* eslint-disable fp/no-mutating-methods,fp/no-unused-expression,fp/no-mutation,fp/no-nil,fp/no-loops */
import * as P from '@konker.dev/effect-ts-prelude';
import chalk from 'chalk';

import type { MorrisEngineError } from '../../../lib/error';
import type { MorrisBoard, MorrisBoardPoint } from '../../board';
import { isOccupied } from '../../board/points';
import type { COORD_CHAR } from '../../consts';
import { MorrisColor, PT, X, Y } from '../../consts';
import type { MorrisGameTick } from '../../tick';
import { linksDB, linksDF, linksH, linksV } from './links';
import { getRenderCoord, pointsToCoords } from './points';
import { getCoordH, getCoordV, isCoordH, isCoordV, isDB, isDF, isH, isV } from './query';

export type CoordTuple = [number, number];

export type LineFunc = (x: number) => number;

export type MorrisBoardRenderConfigText = {
  readonly xScale: number;
  readonly yScale: number;
  readonly pad: number;
  readonly coordPadH: number;
  readonly coordPadV: number;
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
  coordPadH: 2,
  coordPadV: 1,
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
};

export type MorrisBoardRenderContext = MorrisBoardRenderParams & {
  readonly coords: Array<[[COORD_CHAR, number], CoordTuple]>;
  readonly hLinks: Array<[CoordTuple, CoordTuple]>;
  readonly vLinks: Array<[CoordTuple, CoordTuple]>;
  readonly dbLinks: Array<[CoordTuple, CoordTuple, LineFunc]>;
  readonly dfLinks: Array<[CoordTuple, CoordTuple, LineFunc]>;
  readonly renderPoints: Array<Array<string>>;
};

export function initMorrisBoardRenderParams<P extends number, D extends number, N extends number>(
  config: MorrisBoardRenderConfigText,
  board: MorrisBoard<P, D, N>
): MorrisBoardRenderParams {
  return {
    config,
    w: config.coordPadH + board.dimension + (board.dimension - 1) * config.xScale + config.pad * 2,
    h: board.dimension * config.yScale - 1 + config.coordPadV,
  };
}

export function initMorrisBoardRenderContext<P extends number, D extends number, N extends number>(
  params: MorrisBoardRenderParams,
  board: MorrisBoard<P, D, N>
): P.Effect.Effect<never, MorrisEngineError, MorrisBoardRenderContext> {
  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('coords', () => pointsToCoords(params, board.points)),
    P.Effect.bind('hLinks', () => linksH(params, board.points)),
    P.Effect.bind('vLinks', () => linksV(params, board.points)),
    P.Effect.bind('dbLinks', () => linksDB(params, board.points)),
    P.Effect.bind('dfLinks', () => linksDF(params, board.points)),
    P.Effect.map(({ coords, dbLinks, dfLinks, hLinks, vLinks }) => ({
      ...params,
      coords,
      hLinks,
      vLinks,
      dbLinks,
      dfLinks,

      renderPoints: Array(params.h)
        .fill('_')
        .map((_) => Array(params.w).fill('?')),
    }))
  );
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
  const params = initMorrisBoardRenderParams(DEFAULT_MORRIS_BOARD_RENDER_CONFIG_TEXT, gameTick.game.board);

  return P.pipe(
    initMorrisBoardRenderContext(params, gameTick.game.board),
    P.Effect.map((context) => {
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
