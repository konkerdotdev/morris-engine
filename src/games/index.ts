import type { MorrisGameState } from '../engine/game/schemas';
import * as Game3mm from './3mm';
import * as Game6mm from './6mm';
import * as Game9mm from './9mm';
import * as Game10mm from './10mm';
import * as Game12mm from './12mm';
import * as GamePicaria from './picaria';

const GAMES = {
  [Game3mm.TAG]: Game3mm,
  [Game6mm.TAG]: Game6mm,
  [Game9mm.TAG]: Game9mm,
  [Game10mm.TAG]: Game10mm,
  [Game12mm.TAG]: Game12mm,
  [GamePicaria.TAG]: GamePicaria,
} as const;
type GAMES = typeof GAMES;

type GameType<T extends keyof GAMES> = T extends typeof Game3mm.TAG
  ? Game3mm.Game3mm
  : T extends typeof Game6mm.TAG
    ? Game6mm.Game6mm
    : T extends typeof Game9mm.TAG
      ? Game9mm.Game9mm
      : T extends typeof Game10mm.TAG
        ? Game10mm.Game10mm
        : T extends typeof Game12mm.TAG
          ? Game12mm.Game12mm
          : T extends typeof GamePicaria.TAG
            ? GamePicaria.GamePicaria
            : never;

export function isGameTag(tag: string): tag is keyof GAMES {
  return tag in GAMES;
}

export function gamesInstantiate<T extends keyof GAMES>(
  tag: T,
  gameState: MorrisGameState<
    GAMES[T]['config']['params']['P'],
    GAMES[T]['config']['params']['D'],
    GAMES[T]['config']['params']['N']
  >
) {
  if (isGameTag(tag) && gameState._tag === tag) {
    return GAMES[tag].Game(gameState as never) as GameType<T>;
  }

  // eslint-disable-next-line fp/no-nil
  return undefined;
}
