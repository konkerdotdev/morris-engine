import * as P from '@konker.dev/effect-ts-prelude';
import chalk from 'chalk';

import { toMorrisEngineError } from '../lib/error';
import type { AutoPlayer } from './autoplayer';
import type { MorrisGame } from './game';
import { gameStart } from './game';
import { MorrisGameState } from './game/schemas';
import { MorrisMove } from './moves/schemas';
import { RenderImpl } from './render';
import type { MorrisGameTick } from './tick';
import { tick, tickAutoPlayer, tickUndo } from './tick';

export function shellStartMorrisGame(game: MorrisGame): MorrisGameTick {
  return P.Effect.runSync(gameStart(game));
}

export function shellTick(gameTick: MorrisGameTick, moveStr: string): MorrisGameTick {
  return P.Effect.runSync(
    P.pipe(
      moveStr,
      P.Schema.decode(MorrisMove(gameTick.game.gameState.board.dimension)),
      P.Effect.mapError((_e) => 'Invalid input'),
      P.Effect.flatMap((move) => P.pipe(gameTick, tick(move))),
      P.Effect.mapError(toMorrisEngineError),
      P.Effect.tapError((e) => P.Console.error(chalk.redBright.bold(e.message))),
      P.Effect.orElse(() => P.pipe(P.Effect.succeed(gameTick)))
    )
  );
}

export function shellUntick(gameTick: MorrisGameTick): MorrisGameTick {
  return P.Effect.runSync(
    P.pipe(
      tickUndo(gameTick),
      P.Effect.mapError(toMorrisEngineError),
      P.Effect.tapError((e) => P.Console.error(chalk.redBright.bold(e.message))),
      P.Effect.orElse(() => P.pipe(P.Effect.succeed(gameTick)))
    )
  );
}

export function shellTickAutoPlayer(autoPlayer: AutoPlayer, gameTick: MorrisGameTick): MorrisGameTick {
  return P.Effect.runSync(
    P.pipe(
      gameTick,
      tickAutoPlayer(autoPlayer),
      P.Effect.tapError((e) => P.Console.error(chalk.redBright.bold(e.message))),
      P.Effect.orElse(() => P.pipe(P.Effect.succeed(gameTick)))
    )
  );
}

export const shellWrapRenderString = (renderString: RenderImpl['renderString']) => (gameTick: MorrisGameTick) =>
  P.Effect.runSync(
    P.pipe(
      RenderImpl,
      P.Effect.flatMap(({ renderString }) => P.pipe(P.Effect.succeed(gameTick), P.Effect.flatMap(renderString))),
      P.Effect.provideService(RenderImpl, RenderImpl.of({ renderString }))
    )
  );

export const shellSerializeGameState = (gameTick: MorrisGameTick): string =>
  P.Effect.runSync(
    P.pipe(
      gameTick.game.gameState,
      P.Schema.encode(
        MorrisGameState(
          gameTick.game.gameState._tag,
          gameTick.game.gameState.board.numPoints,
          gameTick.game.gameState.board.dimension,
          gameTick.game.gameState.config.numMorrisPerPlayer
        )
      )
    )
  );
