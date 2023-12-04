import * as P from '@konker.dev/effect-ts-prelude';

import type { MorrisEngineError } from '../../lib/error';
import { toMorrisEngineError } from '../../lib/error';
import type { MorrisGame } from '../game';
import type { MorrisMoveS } from './schemas';
import { String_MorrisMove } from './transforms';

export const strMorrisMove =
  <P extends number, D extends number, N extends number>(game: MorrisGame<P, D, N>) =>
  (move: MorrisMoveS<D>): P.Effect.Effect<never, MorrisEngineError, string> =>
    P.pipe(move, P.Schema.encode(String_MorrisMove(game.board.dimension)), P.Effect.mapError(toMorrisEngineError));
