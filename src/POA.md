# POA

---

- Fix optimizations for text render
- Remove unsafe for text render
- Add 9mm terminal example
  - Or choose your size?
- Rename schemas types to remove S postfix?
  - No "non-S" duplicates/shadows
- Unit tests!!
- Remove state machine [?]
- OTHER
  - Clock?
  - Move counts?
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
