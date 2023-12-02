/* eslint-disable fp/no-unused-expression,@typescript-eslint/ban-ts-comment */
import * as P from '@konker.dev/effect-ts-prelude';
import * as console from 'console';

import type { D_3, N_3, P_3 } from './3mm';
import { game } from './3mm';
import { renderE } from './3mm/render';
import type { MorrisGameTick } from './engine';
import { startMorrisGame } from './engine';
import * as M from './engine/functions';
import { RulesImpl } from './engine/rules';
import { Rules } from './engine/rules/rules';

// --------------------------------------------------------------------------
export function disp(gameTick: MorrisGameTick<P_3, D_3, N_3>): P.Effect.Effect<never, Error, void> {
  return P.pipe(
    gameTick.game,
    renderE,
    P.Effect.flatMap((s) => P.Console.log(`${s}\n${gameTick.message}`))
  );
}

const prog1 = P.pipe(
  startMorrisGame<P_3, D_3, N_3>(game),
  P.Effect.tapDefect((e) => P.Console.log(e._tag)),

  P.Effect.flatMap(M.tick<P_3, D_3, N_3>(M.createMovePlace(game.morrisWhite[0], 'a1'))),
  P.Effect.tap(disp),

  P.Effect.flatMap(M.tick<P_3, D_3, N_3>(M.createMovePlace(game.morrisBlack[0]!, 'c2'))),
  P.Effect.tap(disp),

  P.Effect.flatMap(M.tick<P_3, D_3, N_3>(M.createMovePlace(game.morrisWhite[1]!, 'b3'))),
  P.Effect.tap(disp),

  P.Effect.flatMap(M.tick<P_3, D_3, N_3>(M.createMovePlace(game.morrisBlack[1]!, 'c3'))),
  P.Effect.tap(disp),

  P.Effect.flatMap(M.tick<P_3, D_3, N_3>(M.createMoveMove('b2', 'a3'))),
  P.Effect.tap(disp),

  P.Effect.flatMap(M.tick<P_3, D_3, N_3>(M.createMovePlace(game.morrisWhite[2]!, 'b1'))),
  P.Effect.tap(disp),

  P.Effect.flatMap(M.tick<P_3, D_3, N_3>(M.createMovePlace(game.morrisBlack[2]!, 'b2'))),
  P.Effect.tap(disp),

  P.Effect.flatMap(M.tick<P_3, D_3, N_3>(M.createMoveMove('b3', 'a3'))),
  P.Effect.tap(disp),

  P.Effect.flatMap(M.tick<P_3, D_3, N_3>(M.createMoveMove('b2', 'c1'))),
  P.Effect.tap(disp)

  // P.Effect.flatMap(M.tick<PP, DD, NN>(M.createMoveMove('a1', 'b2'))),
  // P.Effect.tap(disp)
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
          ruleSet: Rules,
        })
      )
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
