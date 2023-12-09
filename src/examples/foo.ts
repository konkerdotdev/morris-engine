/* eslint-disable fp/no-unused-expression,@typescript-eslint/ban-ts-comment */
import * as P from '@konker.dev/effect-ts-prelude';
import * as console from 'console';

import { MorrisColor } from '../engine/consts';
import { createMoveMove, createMovePlace } from '../engine/moves';
import { RenderImpl } from '../engine/render';
import { renderString } from '../engine/render/text';
import { RulesImpl } from '../engine/rules';
import { RulesApply } from '../engine/rules/rulesApply';
import { RulesMove } from '../engine/rules/rulesMove';
import type { MorrisGameTick } from '../engine/tick';
import { startMorrisGame, tick } from '../engine/tick';
import type { D_3, N_3, P_3 } from '../games/3mm';
import { game } from '../games/3mm';
import type { MorrisEngineError } from '../lib/error';

// --------------------------------------------------------------------------
export const print =
  <P extends number, D extends number, N extends number>(renderString: RenderImpl['renderString']) =>
  (gameTick: MorrisGameTick<P, D, N>): P.Effect.Effect<never, MorrisEngineError, void> =>
    P.pipe(gameTick, renderString, P.Effect.flatMap(P.Console.log));

const prog1 = P.pipe(
  RenderImpl,
  P.Effect.flatMap(({ renderString }) =>
    P.pipe(
      startMorrisGame<P_3, D_3, N_3>(game),
      P.Effect.tapDefect((e) => P.Console.log(e._tag)),
      P.Effect.tap(print<P_3, D_3, N_3>(renderString)),

      P.Effect.flatMap((gameTick) => P.pipe(gameTick, tick<P_3, D_3, N_3>(createMovePlace(MorrisColor.WHITE, 'a1')))),
      P.Effect.tap(print<P_3, D_3, N_3>(renderString)),

      P.Effect.flatMap((gameTick) => P.pipe(gameTick, tick<P_3, D_3, N_3>(createMovePlace(MorrisColor.BLACK, 'c2')))),
      P.Effect.tap(print<P_3, D_3, N_3>(renderString)),

      P.Effect.flatMap((gameTick) => P.pipe(gameTick, tick<P_3, D_3, N_3>(createMovePlace(MorrisColor.WHITE, 'b3')))),
      P.Effect.tap(print<P_3, D_3, N_3>(renderString)),

      P.Effect.flatMap((gameTick) => P.pipe(gameTick, tick<P_3, D_3, N_3>(createMovePlace(MorrisColor.BLACK, 'c3')))),
      P.Effect.tap(print<P_3, D_3, N_3>(renderString)),

      // P.Effect.flatMap(tick<P_3, D_3, N_3>(createMoveMove('b2', 'a3'))),
      // P.Effect.tap(gameTick => P.pipe(renderString(gameTick), P.Effect.flatMap(P.Console.log))),

      P.Effect.flatMap((gameTick) => P.pipe(gameTick, tick<P_3, D_3, N_3>(createMovePlace(MorrisColor.WHITE, 'b1')))),
      P.Effect.tap(print<P_3, D_3, N_3>(renderString)),

      P.Effect.flatMap((gameTick) => P.pipe(gameTick, tick<P_3, D_3, N_3>(createMovePlace(MorrisColor.BLACK, 'b2')))),
      P.Effect.tap(print<P_3, D_3, N_3>(renderString)),

      P.Effect.flatMap(tick<P_3, D_3, N_3>(createMoveMove('b3', 'a3'))),
      P.Effect.tap(print<P_3, D_3, N_3>(renderString)),

      P.Effect.flatMap(tick<P_3, D_3, N_3>(createMoveMove('b2', 'c1'))),
      P.Effect.tap(print<P_3, D_3, N_3>(renderString))

      // P.Effect.flatMap(tick<P_3, D_3, N_3>(createMoveMove('a1', 'b2'))),
      // P.Effect.tap(gameTick => P.pipe(renderString(gameTick), P.Effect.flatMap(P.Console.log))),
    )
  )
);

// --------------------------------------------------------------------------
// eslint-disable-next-line fp/no-nil,fp/no-unused-expression
(async () => {
  await P.Effect.runPromise(
    P.pipe(
      prog1,
      P.Effect.provideService(
        RulesImpl,
        RulesImpl.of({
          rulesetMove: RulesMove,
          rulesetApply: RulesApply,
        })
      ),
      P.Effect.provideService(RenderImpl, RenderImpl.of({ renderString }))
    )
  );
  return "\n\nQ'Pla!";
})()
  .then(console.log)
  .catch(console.error);

// --------------------------------------------------------------------------
// Game Loop
//
// LOOP
// - Read move input for curPlayer [what format is this?]
// - Parse input -> move: MorrisMove
// - Formulate rules context: { game, move }
// - Exec rules with (ruleSet, context) -> newRuleSet
// - Detect invalid move => display error and END_LOOP
// - Detect valid move, detect next player => exec move with (game, move, nextPlayer) -> newGame
// - Render newGame
// - Detect game over => display winner and exit LOOP
// END_LOOP
