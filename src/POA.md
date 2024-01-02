# POA

---

- Refactor MorrisGame

  - Separate state from functions
    - Could we even use OOP here?!?
  - Schemas/etc to be able to serialize/deserialize state(to/from JSON initially)
  - Create game files which can be used as test fixtures

- Unit tests!!
- Integration tests
  - Run a game with a list of moves, check expected "snapshot" output (of some kind)
  - Have a bunch of these to test edge cases, error cases, long cases (e.g. draw after x repeats)
- Remove RulesImpl (for now at least) [?]
- Themes for text render?
- Serialize/deserialize games
  - What do we need to set up a network game, and send moves over the network?
    - P2P
  - Could also be handy for test fixtures
- Rename schemas types to remove S postfix?
  - No "non-S" duplicates/shadows
- Remove state machine [?]
- Improve Minimax algo for computer player:

  - https://en.wikipedia.org/wiki/Minimax
  - alpha/beta pruning
  - Better fitness func:
    - num players
    - num mills
    - num 2-adjacent
    - num possible mills for opponent on next move [?]
    - num of pieces with available move
    - how "spread out" the pieces are [?]
  - Parametrized fitness func coefficients depending on the game?

- OTHER
  - Clock?
  - Move counts?
- ~~Rationalize:~~
  - ~~Naming conventions for functions~~
  - ~~Module/sub-module organization~~
- ~~Refactor text render for common/repeated code~~
- ~~Functions for varying config, as possible~~
  - ~~e.g. start color~~
- ~~Derive win message~~
  - ~~Derive draw message => derive result message~~
- ~~Fix optimizations for text render~~
- ~~Remove unsafe for text render~~
- ~~Add 9mm terminal example~~
  - ~~Or choose your size?~~
- ~~Add basic CLI UI example~~
- ~~Add "imperative shell"~~
  - ~~To allow for imperative cli I/O UI~~
- ~~Fix rules issue of "is" vs "move" facts~~
- ~~Derive message from rules~~
  - ~~E.g. invalid move, black wins, draw~~
- ~~Remove boards.ts when content has been re-housed~~
- ~~Amend rules to remove `unsafe_*` function calls~~
  - ~~```Remove `unsafe\_\*` function if not needed~~
- ~~Factor out common code in `countValidMovesForColor()`~~
- ~~Sort out pipe limit for rules~~
  - ~~Convert to array and reduce?~~
- ~~Move rules out of 3mm~~
- ~~Move morris from game to board on PLACE move~~
- ~~Move morris from board to game discard list on REMOVE move~~
- ~~Add schemas for moves~~
- ~~Add schemas for coords~~
- ~~Add function to get possible valid moves for piece~~
  ~~- Refactor `countValidMovesForColor` to use this~~
- ~~Add Error type and remove `new Error()`~~
- ~~Add result property to `MorrisGame`~~
