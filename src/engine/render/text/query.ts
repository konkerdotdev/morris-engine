/* eslint-disable fp/no-loops,fp/no-nil */
import { A, B, LETTER, LF, NUMBER, PT, X, Y } from '../../consts';
import type { CoordTuple, LineFunc, MorrisBoardRenderContext } from './index';

export function isCoordV(context: MorrisBoardRenderContext, p: CoordTuple): boolean {
  if (!context.config.showCoords) return false;
  return p[X] < context.config.coordPadH + 1;
}

export function isCoordH(context: MorrisBoardRenderContext, p: CoordTuple): boolean {
  if (!context.config.showCoords) return false;
  return p[Y] >= context.h - (context.config.coordPadV + 1);
}

export function isOnLineH(a: CoordTuple, b: CoordTuple, p: CoordTuple): boolean {
  return p[Y] === a[Y] && p[Y] === b[Y] && a[X] < p[X] && p[X] < b[X];
}

export function isOnLineV(a: CoordTuple, b: CoordTuple, p: CoordTuple): boolean {
  return p[X] === a[X] && p[X] === b[X] && a[Y] < p[Y] && p[Y] < b[Y];
}

export function isOnLineD(a: CoordTuple, b: CoordTuple, l: LineFunc, p: CoordTuple): boolean {
  return a[X] < p[X] && p[X] < b[X] && p[Y] === l(p[X]);
}

export function isH(context: MorrisBoardRenderContext, p: CoordTuple): boolean {
  for (const l of context.linksH) {
    if (isOnLineH(l[A], l[B], p)) {
      return true;
    }
    if (p[Y] > l[A][Y]) {
      return false;
    }
  }
  return false;
}

export function isV(context: MorrisBoardRenderContext, p: CoordTuple): boolean {
  for (const l of context.linksV) {
    if (isOnLineV(l[A], l[B], p)) {
      return true;
    }
    if (p[X] > l[B][X]) {
      return false;
    }
  }
  return false;
}

export function isDB(context: MorrisBoardRenderContext, p: CoordTuple): boolean {
  for (const l of context.linksDB) {
    if (isOnLineD(l[A], l[B], l[LF], p)) {
      return true;
    }
  }
  return false;
}

export function isDF(context: MorrisBoardRenderContext, p: CoordTuple): boolean {
  for (const l of context.linksDF) {
    if (isOnLineD(l[A], l[B], l[LF], p)) {
      return true;
    }
  }
  return false;
}

export function getCoordYAxis(context: MorrisBoardRenderContext, p: CoordTuple): string {
  if (!context.config.showCoords) return ' ';
  const coord = context.boardPointCoords.find((c) => c[PT][Y] === p[Y])?.[NUMBER];
  return coord && p[X] === 0 ? String(coord) : ' ';
}

export function getCoordXAxis(context: MorrisBoardRenderContext, p: CoordTuple): string {
  if (!context.config.showCoords) return ' ';
  const coord = context.boardPointCoords.find((c) => c[PT][X] === p[X])?.[LETTER];
  return coord ?? ' ';
}
