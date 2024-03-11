/* eslint-disable fp/no-mutating-methods,fp/no-unused-expression,fp/no-mutation,fp/no-nil,fp/no-loops */
import * as P from '@konker.dev/effect-ts-prelude';
import chalk from 'chalk';

import type { MorrisEngineError } from '../../../lib/error';
import type { MorrisBoard, MorrisBoardPoint } from '../../board/schemas';
import { isOccupiedBoardPoint } from '../../board/schemas';
import type { COORD_CHAR } from '../../consts';
import { MorrisColor, MorrisLinkType, PT, X, Y } from '../../consts';
import type { MorrisGameTick } from '../../tick';
import { links, linksD } from './links';
import { boardPointsToCoords, getRenderCoord } from './points';
import { getCoordXAxis, getCoordYAxis, isCoordH, isCoordV, isDB, isDF, isH, isV } from './query';

export type CoordTuple = [number, number];

export type LineFunc = (x: number) => number;

export type MorrisBoardRenderConfigText = {
  readonly spacingX: number;
  readonly spacingY: number;
  readonly scaleX: number;
  readonly scaleY: number;
  readonly boardPadH: number;
  readonly coordPadH: number;
  readonly coordPadV: number;
  readonly showCoords: boolean;
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
  spacingX: 3,
  spacingY: 1,
  scaleX: 1,
  scaleY: 1,
  boardPadH: 1,
  coordPadH: 1,
  coordPadV: 0,
  showCoords: true,
  colorBoardBg: '#a67b5b',
  colorBoard: '#333333',
  colorCoords: '#ffffff',
  colorCoordsBg: '#000000',
  colorWhite: '#ffffff',
  colorBlack: '#000000',
  avatarEmpty: '⦁',
  avatarWhite: '●',
  avatarBlack: '●',
  boardH: '─',
  boardV: '│',
  boardDB: '╲',
  boardDF: '╱',
  boardBlack: ' ',
};

export type MorrisBoardRenderParamsText = {
  readonly config: MorrisBoardRenderConfigText;
  readonly w: number;
  readonly h: number;
};

export type MorrisBoardRenderContext = MorrisBoardRenderParamsText & {
  readonly boardPointCoords: Array<[COORD_CHAR, number, CoordTuple]>;
  readonly linksH: Array<[CoordTuple, CoordTuple]>;
  readonly linksV: Array<[CoordTuple, CoordTuple]>;
  readonly linksDB: Array<[CoordTuple, CoordTuple, LineFunc]>;
  readonly linksDF: Array<[CoordTuple, CoordTuple, LineFunc]>;
  readonly renderPoints: Array<Array<string>>;
};

export function initMorrisBoardRenderParams(
  config: MorrisBoardRenderConfigText,
  board: MorrisBoard
): MorrisBoardRenderParamsText {
  return {
    config,
    w:
      (config.showCoords ? config.coordPadH + 1 : 0) +
      config.boardPadH +
      board.dimension +
      (board.dimension - 1) * config.scaleX * config.spacingX +
      config.boardPadH,
    h:
      board.dimension +
      (board.dimension - 1) * config.scaleY * config.spacingY +
      (config.showCoords ? config.coordPadV + 1 : 0),
  };
}

export function initMorrisBoardRenderContext(
  params: MorrisBoardRenderParamsText,
  board: MorrisBoard
): P.Effect.Effect<MorrisBoardRenderContext, MorrisEngineError> {
  return P.pipe(
    P.Effect.Do,
    P.Effect.bind('boardPointCoords', () => boardPointsToCoords(params, board.points)),
    P.Effect.bind('linksH', () => links(params, board.points, MorrisLinkType.HORIZONTAL, Y, X)),
    P.Effect.bind('linksV', () => links(params, board.points, MorrisLinkType.VERTICAL, X, Y)),
    P.Effect.bind('linksDB', () => linksD(params, board.points, MorrisLinkType.DIAGONAL_B, X, Y)),
    P.Effect.bind('linksDF', () => linksD(params, board.points, MorrisLinkType.DIAGONAL_F, X, X)),
    P.Effect.map(({ boardPointCoords, linksDB, linksDF, linksH, linksV }) => ({
      ...params,
      boardPointCoords,
      linksH,
      linksV,
      linksDB,
      linksDF,

      renderPoints: Array(params.h)
        .fill('_')
        .map((_: string) => Array(params.w).fill('?')),
    }))
  );
}

export function renderOccupant(context: MorrisBoardRenderContext, p: MorrisBoardPoint): string {
  return isOccupiedBoardPoint(p)
    ? p.occupant.color === MorrisColor.WHITE
      ? chalk.bgHex(context.config.colorBoardBg).hex(context.config.colorWhite).bold(context.config.avatarWhite)
      : chalk.bgHex(context.config.colorBoardBg).hex(context.config.colorBlack).bold(context.config.avatarBlack)
    : chalk.bgHex(context.config.colorBoardBg).hex(context.config.colorBoard).bold(context.config.avatarEmpty);
}

export function renderString(gameTick: MorrisGameTick): P.Effect.Effect<string, MorrisEngineError> {
  const params = initMorrisBoardRenderParams(DEFAULT_MORRIS_BOARD_RENDER_CONFIG_TEXT, gameTick.game.gameState.board);

  return P.pipe(
    initMorrisBoardRenderContext(params, gameTick.game.gameState.board),
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
              .dim(getCoordXAxis(context, [i, j]));
          } else if (isCoordV(context, [i, j])) {
            context.renderPoints[j]![i] = chalk
              .bgHex(context.config.colorCoordsBg)
              .hex(context.config.colorCoords)
              .dim(getCoordYAxis(context, [i, j]));
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
        gameTick.game.gameState.board.points.map((p) =>
          P.pipe(
            P.Effect.Do,
            P.Effect.bind('renderCoords', () => getRenderCoord(context, p.coord)),
            P.Effect.map(({ renderCoords }) => [...renderCoords, p] as [number, number, MorrisBoardPoint])
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
