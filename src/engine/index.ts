import * as P from '@konker.dev/effect-ts-prelude';

/**
 * Morris Engine
 *
 * Author: Konrad Markus <mail@konker.dev>
 *
 * P: points: number of points on the board in total
 * D: dimensions: board is arranged as DxD
 * N: number: number of morrae per player, e.g. 3mm -> 3, 9mm -> 9
 */

export const NumPoints = P.Schema.number.pipe(P.Schema.brand(Symbol.for('NumPoints')));
export type NumPoints = P.Schema.Schema.To<typeof NumPoints>;

export const BoardDim = P.Schema.number.pipe(P.Schema.brand(Symbol.for('BoardDim')));
export type BoardDim = P.Schema.Schema.To<typeof BoardDim>;

export const NumMorris = P.Schema.number.pipe(P.Schema.brand(Symbol.for('NumMorris')));
export type NumMorris = P.Schema.Schema.To<typeof NumMorris>;

export const MorrisId = (n: NumMorris) => P.Schema.number.pipe(P.Schema.between(1, n));
export type MorrisId = P.Schema.Schema.To<ReturnType<typeof MorrisId>>;
