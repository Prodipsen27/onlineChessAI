# TODO — XLChess Hero / Dashboard Build

> Reflects the latest spec: a Linear/Vercel-style dark dashboard hero, contact section, and footer. This supersedes earlier color tokens — use `#060913` / `#0D1225` as the palette going forward.

## 0. Setup

- [ ] Next.js + TypeScript + Tailwind, App Router
- [ ] Install `chess.js`, `@dnd-kit/core`, Framer Motion, Lucide React
- [ ] Add design tokens to `globals.css`:
  - [ ] `--bg: #060913` with soft deep-indigo radial glow
  - [ ] `--card-bg: #0D1225`
  - [ ] `--card-border: rgba(255,255,255,0.08)` (1px)
  - [ ] `--radius: 24px`
  - [ ] `--board-light: #f0d9b5`, `--board-dark: #b58863`

## 1. Layout Shell

- [ ] Two-column CSS Grid: `1.2fr 1fr` desktop → single column tablet/mobile
- [ ] Confirm grid collapses cleanly at `md`/`sm` breakpoints, no orphaned gutters

## 2. Left Partition — Interactive Board View

- [ ] Board wrapper: fixed 1:1 aspect-ratio container (CLS-safe — reserve space before pieces/images load)
- [ ] Square checkering in `#f0d9b5` / `#b58863`
- [ ] Vertical **Engine Evaluation Bar** on the left edge of the board
  - [ ] Range −10.0 to +10.0, initial value **+0.8**
  - [ ] Numeric value always shown alongside the bar (not color/height alone)
- [ ] Status banner directly under the board
  - [ ] Green pulsing dot + bold **"White's Turn"**
  - [ ] Pulse animation respects `prefers-reduced-motion`

## 3. Right Partition — Live Control & Telemetry Panel

- [ ] Header row: bold uppercase **"CAN YOU FINISH THE EVERGREEN GAME?"** (left) + translucent red badge **"4 MOVES LEFT"** (right)
- [ ] Top action rack: **"Reset Puzzle"** + **"Replay Full Game"** buttons, side by side
- [ ] Center console (monospace telemetry box):
  - [ ] Terminal-style container, dark translucent backdrop
  - [ ] Terminal-green monospace font
  - [ ] Scrollable, fixed max-height
  - [ ] Initial fallback text: **"No moves yet. Make a move on the board."**
  - [ ] Auto-scrolls to bottom on every new entry
  - [ ] Give the scroll region `aria-live="polite"` treatment carefully — verbose live-region spam should be avoided; consider a visually-hidden summary instead of announcing every line
- [ ] Bottom action rack: 4-button array — **Undo / Hint / Reset / More**
  - [ ] "More" opens a menu/popover — define what it contains (e.g. export PGN, flip board, settings) before wiring it
- [ ] Calibration deck — difficulty selector:
  - [ ] Step-indexed chips **[1]–[5]**
  - [ ] Active chip **[1]** shown as blue, labeled **"Beginner (800)"**
  - [ ] Rendered as a real `role="tablist"`/`radiogroup` pattern, not bare `<div>`s
  - [ ] Decide: does changing difficulty mid-game reset the board or only affect hint/engine strength? Document the choice.

## 4. Interaction Engineering

- [ ] Wire `@dnd-kit/core` drag handlers (mouse + touch) to pieces
- [ ] On drop: validate move via `chess.js`; if legal, commit; if illegal, snap back
- [ ] On every drop (legal or illegal — decide which), append a line to the telemetry console, e.g.:
  `> Draggable item d2 was dropped over droppable area d3`
- [ ] Also support click-to-select-then-click-to-move and full keyboard play (arrow keys + Enter/Space) — drag alone is not accessible
- [ ] Board state lives in an isolated state matrix/array (via `chess.js` FEN or an internal 8x8 array), never derived by reading DOM/string content

## 5. Contact Us Section

- [ ] Centered card, heading **"Contact Us"**
- [ ] Email field: `type="email"`, placeholder `you@example.com`
- [ ] Message field: multi-line, expandable, placeholder `"Tell us how we can help you."`
- [ ] Focus state: border glow transitions neutral slate → bright violet on focus (smooth transition, not instant)
- [ ] Submit button: **"Send Message"** with trailing arrow icon
- [ ] Client-side validation (valid email format, non-empty message) with accessible inline error messaging
- [ ] Decide and document: does submit actually send anywhere, or is it a mocked/no-op handler for this assessment? Don't imply a working mail backend that doesn't exist.

## 6. Global Footer

- [ ] Single-row, low-contrast layout
- [ ] Left: **"© 2026 XLChess."**
- [ ] Right: inline nav links **"Play"**, **"Puzzles"**
- [ ] Confirm footer links are real `<a>` elements with visible focus states

## 7. Accessibility Pass (all sections above)

- [ ] Keyboard-only pass: board, difficulty chips, action buttons, contact form, footer links — all reachable and operable
- [ ] Color contrast check on: translucent red badge text, terminal-green-on-dark console, violet focus glow
- [ ] Legal-move / selection indicators on the board use shape, not color alone
- [ ] Live-region usage on the telemetry console reviewed for verbosity (see 3. above)

## 8. Performance Pass

- [ ] Board aspect-ratio wrapper confirmed to prevent CLS (test with throttled network)
- [ ] Telemetry console list virtualized or capped in length if it could grow unbounded during a long game
- [ ] Drag interactions don't trigger re-renders outside the affected squares/pieces

## 9. Documentation

- [ ] README updated to state plainly which parts are real (move legality, drag-and-drop, telemetry logging) vs. simulated (evaluation number, "engine" behavior, contact form backend) — no overclaiming
- [ ] Note the palette/aesthetic direction (Linear/Vercel-style dark dashboard) and why it was chosen over the earlier lighter marketing treatment

## 10. Deploy & Submit

- [ ] Public GitHub repo, clean commit history
- [ ] Deploy to Vercel, verify live URL (test an actual drag-and-drop move + contact form submission)
- [ ] Final read-through: README claims match shipped code exactly
