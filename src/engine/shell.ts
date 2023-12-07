import * as P from '@konker.dev/effect-ts-prelude';
import chalk from 'chalk';

import { toMorrisEngineError } from '../lib/error';
import type { MorrisGame } from './game';
import { String_MorrisMove } from './moves/transforms';
import { RenderImpl } from './render';
import { RulesImpl } from './rules';
import { RulesApply } from './rules/rulesApply';
import { RulesMove } from './rules/rulesMove';
import type { MorrisGameTick } from './tick';
import { startMorrisGame, tick } from './tick';

export function shellStartMorrisGame<P extends number, D extends number, N extends number>(
  game: MorrisGame<P, D, N>
): MorrisGameTick<P, D, N> {
  return P.Effect.runSync(startMorrisGame(game));
}

export function shellTick<P extends number, D extends number, N extends number>(
  gameTick: MorrisGameTick<P, D, N>,
  moveStr: string
): MorrisGameTick<P, D, N> {
  return P.Effect.runSync(
    P.pipe(
      moveStr,
      P.Schema.decode(String_MorrisMove(gameTick.game.board.dimension)),
      P.Effect.flatMap((move) => P.pipe(gameTick, tick(move))),
      P.Effect.mapError(toMorrisEngineError),
      P.Effect.orElse(() =>
        P.pipe(
          P.Effect.succeed(gameTick),
          P.Effect.tap(() => P.Console.log(chalk.redBright(chalk.bold('Bad input\n'))))
        )
      ),
      P.Effect.provideService(
        RulesImpl,
        RulesImpl.of({
          rulesetMove: RulesMove,
          rulesetApply: RulesApply,
        })
      )
    )
  );
}

export const shellWrapRenderString =
  <P extends number, D extends number, N extends number>(renderString: RenderImpl['renderString']) =>
  (gameTick: MorrisGameTick<P, D, N>) =>
    P.Effect.runSync(
      P.pipe(
        RenderImpl,
        P.Effect.flatMap(({ renderString }) => P.pipe(P.Effect.succeed(gameTick), P.Effect.flatMap(renderString))),
        P.Effect.provideService(RenderImpl, RenderImpl.of({ renderString }))
      )
    );
