/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Chess AI Web Worker — runs minimax entirely off the main thread
 * so heavy computation (depth 3-4) never blocks the UI.
 *
 * Receives: { board: BoardState, color: PieceColor, difficulty: number }
 * Posts back: { from: SquareCoordinate, to: SquareCoordinate } | null
 */

import type { BoardState, PieceColor, SquareCoordinate, PieceType } from '../types';
import { getLegalMovesForColor, isCheckmate, isStalemate } from '../utils/chessRules';

// ─── Piece values ────────────────────────────────────────────────────────────
const PIECE_VALUES: Record<PieceType, number> = {
  p: 10, n: 30, b: 30, r: 50, q: 90, k: 900,
};

function evaluateBoard(board: BoardState, maximizingColor: PieceColor): number {
  let score = 0;
  for (const coord in board) {
    const piece = board[coord as SquareCoordinate];
    if (piece) {
      const val = PIECE_VALUES[piece.type];
      score += piece.color === maximizingColor ? val : -val;
    }
  }
  return score;
}

function getRandomMove(board: BoardState, color: PieceColor) {
  const moves = getLegalMovesForColor(color, board);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

function minimax(
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  color: PieceColor,
  opponentColor: PieceColor,
): number {
  if (depth === 0) return evaluateBoard(board, color);

  const currentColor = isMaximizing ? color : opponentColor;
  if (isCheckmate(currentColor, board)) return isMaximizing ? -9999 : 9999;
  if (isStalemate(currentColor, board)) return 0;

  const moves = getLegalMovesForColor(currentColor, board);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const nextBoard = { ...board };
      nextBoard[move.to] = nextBoard[move.from];
      nextBoard[move.from] = null;
      const ev = minimax(nextBoard, depth - 1, alpha, beta, false, color, opponentColor);
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const nextBoard = { ...board };
      nextBoard[move.to] = nextBoard[move.from];
      nextBoard[move.from] = null;
      const ev = minimax(nextBoard, depth - 1, alpha, beta, true, color, opponentColor);
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getBestMove(
  board: BoardState,
  color: PieceColor,
  difficulty: number,
): { from: SquareCoordinate; to: SquareCoordinate } | null {
  const moves = getLegalMovesForColor(color, board);
  if (moves.length === 0) return null;
  if (difficulty === 1) return getRandomMove(board, color);

  let depth = 1;
  if (difficulty === 2) depth = 1;
  else if (difficulty === 3) depth = 2;
  else if (difficulty === 4) depth = 3;
  else if (difficulty >= 5) depth = 4; // Worker can safely go deeper

  const opponentColor: PieceColor = color === 'white' ? 'black' : 'white';
  let bestMove = null;
  let maxEval = -Infinity;
  let alpha = -Infinity;
  const beta = Infinity;

  moves.sort(() => Math.random() - 0.5);

  for (const move of moves) {
    const nextBoard = { ...board };
    nextBoard[move.to] = nextBoard[move.from];
    nextBoard[move.from] = null;
    const ev = minimax(nextBoard, depth - 1, alpha, beta, false, color, opponentColor);
    if (ev > maxEval) { maxEval = ev; bestMove = move; }
    alpha = Math.max(alpha, ev);
  }

  return bestMove ?? getRandomMove(board, color);
}

// ─── Worker message handler ──────────────────────────────────────────────────
self.addEventListener('message', (e: MessageEvent) => {
  const { board, color, difficulty } = e.data as {
    board: BoardState;
    color: PieceColor;
    difficulty: number;
  };

  try {
    const result = getBestMove(board, color, difficulty);
    self.postMessage({ result, error: null });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    self.postMessage({ result: null, error: msg });
  }
});
