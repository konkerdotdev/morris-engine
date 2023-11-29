/* eslint-disable fp/no-unused-expression,@typescript-eslint/ban-ts-comment */
import * as P from '@konker.dev/effect-ts-prelude';
import * as console from 'console';

import type { DD, NN, PP } from './3mm';
import { game } from './3mm';
import { render } from './3mm/render';
import { Rules3MM } from './3mm/rules';
import * as M from './functions';
import type { MorrisGameTick } from './index';
import { makeMorrisGameTick } from './index';
import { INITIAL_MORRIS_GAME_FACTS, RulesImpl } from './rules';

// --------------------------------------------------------------------------
// const prog1 = P.pipe(
//   gameFsm,
//   P.Effect.flatMap(F.trigger<GameState, GameEvent, MG>(GameEvent.EV_WHITE_MOVE, game)),
//   P.Effect.flatMap(F.trigger<GameState, GameEvent, MG>(GameEvent.EV_BLACK_MOVE, game)),
//   (x) => x,
//   P.Logger.withMinimumLogLevel(P.LogLevel.Debug)
// );

// const curGame = P.pipe(
//   game,
//   M.execMove(M.createMovePlace(game.morrisWhite[0], 'a1'), MorrisColor.WHITE),
//   M.execMove(M.createMovePlace(game.morrisBlack[0], 'a3'), MorrisColor.BLACK),
//   M.execMove(M.createMovePlace(game.morrisWhite[1]!, 'c3'), MorrisColor.WHITE),
//   M.execMove(M.createMovePlace(game.morrisBlack[1]!, 'b3'), MorrisColor.BLACK),
//   M.execMove(M.createMovePlace(game.morrisWhite[2]!, 'b1'), MorrisColor.WHITE),
//   M.execMove(M.createMovePlace(game.morrisBlack[2]!, 'c1'), MorrisColor.BLACK),
//   M.execMove(M.createMoveMove('b1', 'b2'), MorrisColor.WHITE)
// );

// const context: MC<MENS_MORRIS_P_3, MENS_MORRIS_D_3, MENS_MORRIS_N_3> = {
//   game: curGame,
//   move: M.createMoveMove('b1', 'b2'),
// };

// const prog2 = P.pipe(
//   Rules3MM<MENS_MORRIS_P_3, MENS_MORRIS_D_3, MENS_MORRIS_N_3>(),
//   (x) => x,
//   R.decide(context),
//   P.Effect.tap(
//     (x) => P.Console.log(x.facts)
//     // P.Logger.withMinimumLogLevel(P.LogLevel.Debug)
//   ),
//   P.Effect.tap(
//     (_x) => P.Console.log(curGame.moves)
//     // P.Logger.withMinimumLogLevel(P.LogLevel.Debug)
//   ),
//   P.Effect.tap(
//     (_x) => P.pipe(render(curGame), P.Effect.flatMap(P.Console.log))
//     // P.Logger.withMinimumLogLevel(P.LogLevel.Debug)
//   )
//   // P.Effect.tap(
//   // (_x) => P.pipe(prompt('Press enter to continue'), P.Console.log)
//   // P.Logger.withMinimumLogLevel(P.LogLevel.Debug)
//   // )
// );

// --------------------------------------------------------------------------
export function dispE(gameTick: P.Effect.Effect<RulesImpl, Error, MorrisGameTick<PP, DD, NN>>) {
  return P.pipe(
    gameTick,
    P.Effect.matchEffect({
      onFailure: () => P.Effect.succeed(P.Console.log('Invalid move')),
      onSuccess: (gameTick) => P.pipe(gameTick.game, P.flow(render, P.Console.log)),
    }),
    P.Effect.flatMap((_) => gameTick)
  );
}

export function disp(gameTick: MorrisGameTick<PP, DD, NN>) {
  return P.pipe(
    gameTick.game,
    render,
    P.Effect.flatMap((s) => P.Console.log(`${s}\n${gameTick.message}`))
  );
}

const prog3 = P.pipe(
  makeMorrisGameTick<PP, DD, NN>(game, INITIAL_MORRIS_GAME_FACTS),
  P.Effect.tapDefect((e) => P.Console.log(e._tag)),

  P.Effect.flatMap(M.tick(M.createMovePlace(game.morrisWhite[0], 'a1'))),
  P.Effect.tap(disp),

  P.Effect.flatMap(M.tick(M.createMovePlace(game.morrisBlack[0]!, 'c2'))),
  P.Effect.tap(disp),

  P.Effect.flatMap(M.tick<PP, DD, NN>(M.createMovePlace(game.morrisWhite[1]!, 'b3'))),
  P.Effect.tap(disp),

  P.Effect.flatMap(M.tick(M.createMovePlace(game.morrisBlack[1]!, 'c3'))),
  P.Effect.tap(disp),

  P.Effect.flatMap(M.tick<PP, DD, NN>(M.createMovePlace(game.morrisWhite[2]!, 'b1'))),
  P.Effect.tap(disp),

  P.Effect.flatMap(M.tick<PP, DD, NN>(M.createMovePlace(game.morrisBlack[2]!, 'b2'))),
  P.Effect.tap(disp),

  P.Effect.flatMap(M.tick<PP, DD, NN>(M.createMoveMove('b3', 'a3'))),
  P.Effect.tap(disp),

  P.Effect.flatMap(M.tick<PP, DD, NN>(M.createMoveMove('b2', 'c1'))),
  P.Effect.tap(disp),

  P.Effect.flatMap(M.tick<PP, DD, NN>(M.createMoveMove('a1', 'b2'))),
  P.Effect.tap(disp)
);

// --------------------------------------------------------------------------
// eslint-disable-next-line fp/no-nil,fp/no-unused-expression
(async () => {
  // eslint-disable-next-line fp/no-unused-expression
  // await P.Effect.runPromise(prog1);
  // console.log('-------------------');
  // await P.Effect.runPromise(prog2);
  // console.log('-------------------');
  await P.Effect.runPromise(
    P.pipe(
      prog3,
      P.Effect.provideService(
        RulesImpl,
        RulesImpl.of({
          ruleSet: Rules3MM,
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
