/* eslint-disable fp/no-loops,fp/no-nil */
import { A, B, LF, X, Y } from '../../consts';
import type { CoordTuple, LineFunc, MorrisBoardRenderContext } from './index';

export function isCoordV(context: MorrisBoardRenderContext, p: CoordTuple): boolean {
  return p[X] < context.config.coordPadH;
}

export function isCoordH(context: MorrisBoardRenderContext, p: CoordTuple): boolean {
  return p[Y] >= context.h - context.config.coordPadV;
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
  }
  return false;
}

export function isDF(context: MorrisBoardRenderContext, x: CoordTuple): boolean {
  for (const l of context.dfLinks) {
    if (isOnLineDF(l[A], l[B], l[LF], x)) {
      return true;
    }
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
