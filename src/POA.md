# POA
--------------------------------------------------------------------------

- ~~Amend rules to remove `unsafe_*` function calls~~
  - ~~~Remove `unsafe_*` function if not needed~~~
- ~~Factor out common code in `countValidMovesForColor()`~~
- ~~Sort out pipe limit for rules~~
  - ~~Convert to array and reduce?~~
- ~~Move rules out of 3mm~~
- Add function to get possible valid moves for piece
  - Refactor `countValidMovesForColor` to use this
- Derive message from rules
  - E.g. invalid move, black wins, draw
- ~~Add Error type and remove `new Error()`~~
- ~~Add result property to `MorrisGame`~~
- Add schemas for coords
- Add schemas for moves
- Add "imperative shell"
  - To allow for imperative cli I/O UI
- Remove state machine [?]
- Remove boards when content has been re-housed
- OTHER
  - Clock?
  - Move counts?

