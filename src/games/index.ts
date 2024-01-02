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

export function isGameTag(tag: string): tag is keyof GAMES {
  return tag in GAMES;
}

export function gamesInstantiate<T extends keyof GAMES>(
  tag: T | string,
  gameState: MorrisGameState<GAMES[T]['params']['P'], GAMES[T]['params']['D'], GAMES[T]['params']['N']>
) {
  if (isGameTag(tag)) {
    return { ...GAMES[tag].game, ...gameState };
  }
  // eslint-disable-next-line fp/no-nil
  return undefined;
}
