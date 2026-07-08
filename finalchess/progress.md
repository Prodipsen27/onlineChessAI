Original prompt: in evergreen.ts it should be The Evergreen Game

Anderssen vs Dufresne, 1852
fix the logic and fix all bugs

Notes:
- Started by inspecting the chess game data and UI logic.
- Fixed Evergreen historical metadata, the 7...d3 board delta, and the final combination.
- Extended replay data through 24. Bxe7# and changed the puzzle to the legal five-move finish.
- Verified every replay ply and puzzle move against chess.js.
- npm.cmd run lint and npm.cmd run build both pass after fixing the text-state hook typing.
- Browser-tested the puzzle through the full line e1-e7, a4-d7, d3-f5, f5-d7, a3-e7 using local Chrome and Playwright.
- Final render_game_to_text state reports status=checkmate, puzzleStep=5, and no console errors after adding favicon.svg.

TODO:
- None known.

Update:
- Added a new animated B2B section with incoming scroll reveal, neon dashboard/video layers, floating chess pieces, glowing CTA, audience platform, and reflection lighting.
- Verified desktop and mobile screenshots for the B2B section with no console errors.
