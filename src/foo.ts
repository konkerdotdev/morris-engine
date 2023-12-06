/* eslint-disable fp/no-unused-expression,@typescript-eslint/ban-ts-comment */
import * as P from '@konker.dev/effect-ts-prelude';
import * as console from 'console';

import type { D_3, N_3, P_3 } from './3mm';
import { game } from './3mm';
import { render3mm } from './3mm/render';
import { MorrisColor } from './engine/consts';
import { createMoveMove, createMovePlace } from './engine/moves';
import { RenderImpl } from './engine/render';
import { RulesImpl } from './engine/rules';
import { RulesApply } from './engine/rules/rulesApply';
import { RulesMove } from './engine/rules/rulesMove';
import { startMorrisGame, tick } from './engine/tick';

// --------------------------------------------------------------------------
// export function disp(gameTick: MorrisGameTick<P_3, D_3, N_3>): P.Effect.Effect<never, Error, void> {
//   return P.pipe(
//     gameTick.game,
//     renderE,
//     P.Effect.flatMap((s) => P.Console.log(`${s}\n${gameTick.message}`))
//   );
// }

const prog1 = P.pipe(
  RenderImpl,
  P.Effect.flatMap(({ render }) =>
    P.pipe(
      startMorrisGame<P_3, D_3, N_3>(game),
      P.Effect.tapDefect((e) => P.Console.log(e._tag)),
      P.Effect.tap(render),

      P.Effect.flatMap((gameTick) => P.pipe(gameTick, tick<P_3, D_3, N_3>(createMovePlace(MorrisColor.WHITE, 'a1')))),
      P.Effect.tap(render),

      P.Effect.flatMap((gameTick) => P.pipe(gameTick, tick<P_3, D_3, N_3>(createMovePlace(MorrisColor.BLACK, 'c2')))),
      P.Effect.tap(render),

      P.Effect.flatMap((gameTick) => P.pipe(gameTick, tick<P_3, D_3, N_3>(createMovePlace(MorrisColor.WHITE, 'b3')))),
      P.Effect.tap(render),

      P.Effect.flatMap((gameTick) => P.pipe(gameTick, tick<P_3, D_3, N_3>(createMovePlace(MorrisColor.BLACK, 'c3')))),
      P.Effect.tap(render),

      // P.Effect.flatMap(tick<P_3, D_3, N_3>(createMoveMove('b2', 'a3'))),
      // P.Effect.tap(render),

      P.Effect.flatMap((gameTick) => P.pipe(gameTick, tick<P_3, D_3, N_3>(createMovePlace(MorrisColor.WHITE, 'b1')))),
      P.Effect.tap(render),

      P.Effect.flatMap((gameTick) => P.pipe(gameTick, tick<P_3, D_3, N_3>(createMovePlace(MorrisColor.BLACK, 'b2')))),
      P.Effect.tap(render),

      P.Effect.flatMap(tick<P_3, D_3, N_3>(createMoveMove('b3', 'a3'))),
      P.Effect.tap(render),

      P.Effect.flatMap(tick<P_3, D_3, N_3>(createMoveMove('b2', 'c1'))),
      P.Effect.tap(render)

      // P.Effect.flatMap(tick<P_3, D_3, N_3>(createMoveMove('a1', 'b2'))),
      // P.Effect.tap(render)
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
      P.Effect.provideService(RenderImpl, RenderImpl.of({ render: render3mm }))
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
