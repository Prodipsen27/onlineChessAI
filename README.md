# onlineChessAI

## Setup and Installation Instructions
1. Clone the repository: `git clone https://github.com/Prodipsen27/onlineChessAI.git`
2. Navigate to the project directory: `cd onlineChessAI`
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`
5. Open your browser to `http://localhost:5173`

## Technologies and Libraries Used
- **React 18** (UI rendering)
- **TypeScript** (Static typing and reliability)
- **Vite** (Fast build tool and dev server)
- **Tailwind CSS** (Utility-first styling, responsiveness, and design system)
- **Lucide React** (Vector icons)
- **Web Workers** (Offloading heavy AI computations to a background thread to prevent UI blocking)

## Design Decisions
- **Option 3 - Redesign:** Opted for a modern, sleek, "cosmic" dark theme aesthetic to convey a premium, forward-thinking chess platform. The hero section leverages interactive elements (a functional chess puzzle) alongside strong typography and clear call-to-actions.
- **Component Architecture:** Divided the UI into focused, reusable components (`ChessBoard`, `ChessSquare`, `PlayVsComputer`). Business logic and state management are centralized, while purely presentational logic is pushed down the tree.
- **AI Integration via Web Workers:** Instead of calculating minimax moves on the main thread (which causes UI freezing and poor UX), the AI logic is completely isolated in a Web Worker (`chessAI.worker.ts`). The main thread and the worker communicate asynchronously, ensuring 60 FPS animations and instant UI responsiveness even during deep AI calculations.
- **Accessibility (A11y):** Ensured full screen-reader and keyboard support. Added `aria-label`, `role`, `tabIndex`, a "skip-to-content" link, ARIA-supported mobile navigation, and keyboard handlers for interacting with the chessboard (Enter/Space to select squares).

## Assumptions Made
- The AI simulation does not need a full backend at this stage and can run entirely in the browser using a minimax algorithm.
- Standard chess rules for basic piece movement are sufficient for the hero puzzle and demo, rather than implementing a full ruleset (e.g., en passant, castling) which might overcomplicate a UI/UX-focused test.

## Trade-offs Considered
- **Custom Chess Engine vs. Library (e.g., chess.js):** Built a lightweight, custom chess state manager and AI rather than importing a heavy third-party library to minimize bundle size and demonstrate algorithmic competency. However, this means some advanced chess rules are omitted in the demo scope.
- **Single Page App (SPA) vs. Server Side Rendering (SSR):** Used a standard React SPA via Vite for simplicity and rapid interaction. An SSR framework like Next.js could offer better initial load times and SEO, but for an interactive game/hero section, client-side rendering was chosen for direct DOM/Worker manipulation ease.

## What I would improve if given additional time
- **Full Chess Ruleset:** Implement complete rules including Castling, En Passant, and Pawn Promotion.
- **Backend Integration:** Add real-time multiplayer using WebSockets (Socket.io) and persist game state/users in a database (e.g., PostgreSQL/Supabase).
- **Animations:** Add more fluid drag-and-drop mechanics using `framer-motion` or `dnd-kit` for piece movement instead of simple click-to-move.
- **Testing:** Add comprehensive unit tests using Vitest and end-to-end tests using Playwright.
- **Performance:** Pre-load assets and optimize the AI further (e.g., Alpha-Beta pruning optimizations or using WebAssembly/Rust for the chess engine).

## Vercel Deployment Guide
To deploy this project to Vercel:
1. Push the code to a GitHub repository.
2. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Ensure the **Framework Preset** is set to **Vite**.
5. The Build Command should be `npm run build` and Output Directory should be `dist`.
6. Click **Deploy**. Vercel will automatically build and host the application.
