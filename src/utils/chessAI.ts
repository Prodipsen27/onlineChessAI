/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BoardState, PieceColor, SquareCoordinate, PieceType } from '../types';
import { getLegalMovesForColor, isCheckmate, isStalemate } from './chessRules';

// Basic piece values for material evaluation
const PIECE_VALUES: Record<PieceType, number> = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 900,
};

// Evaluate board for the maximizing color
export function evaluateBoard(board: BoardState, maximizingColor: PieceColor): number {
  let score = 0;
  for (const coord in board) {
    const piece = board[coord as SquareCoordinate];
    if (piece) {
      const val = PIECE_VALUES[piece.type];
      if (piece.color === maximizingColor) {
        score += val;
      } else {
        score -= val;
      }
    }
  }
  return score;
}

// Generate random fallback move if AI is depth 1
function getRandomMove(board: BoardState, color: PieceColor) {
  const moves = getLegalMovesForColor(color, board);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

// Minimax with Alpha-Beta pruning
function minimax(
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  color: PieceColor,
  opponentColor: PieceColor
): number {
  if (depth === 0) {
    return evaluateBoard(board, color);
  }

  const currentColor = isMaximizing ? color : opponentColor;
  
  if (isCheckmate(currentColor, board)) {
    return isMaximizing ? -9999 : 9999;
  }
  if (isStalemate(currentColor, board)) {
    return 0;
  }

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

export function getBestMove(board: BoardState, color: PieceColor, difficulty: number): { from: SquareCoordinate; to: SquareCoordinate } | null {
  const moves = getLegalMovesForColor(color, board);
  if (moves.length === 0) return null;

  // Level 1: Pure Random
  if (difficulty === 1) {
    return getRandomMove(board, color);
  }

  // Map difficulty (1-5) to depth
  let depth = 1;
  if (difficulty === 2) depth = 1; // Basic
  else if (difficulty === 3) depth = 2; // Intermediate
  else if (difficulty === 4) depth = 3; // Advanced
  else if (difficulty >= 5) depth = 3; // Master (use 3 to prevent freezing, real depth 4 requires workers)
  
  const opponentColor = color === 'white' ? 'black' : 'white';
  
  let bestMove = null;
  let maxEval = -Infinity;
  let alpha = -Infinity;
  let beta = Infinity;

  // Shuffle moves to add variety among equal evaluations
  moves.sort(() => Math.random() - 0.5);

  for (const move of moves) {
    const nextBoard = { ...board };
    nextBoard[move.to] = nextBoard[move.from];
    nextBoard[move.from] = null;

    const ev = minimax(nextBoard, depth - 1, alpha, beta, false, color, opponentColor);
    
    if (ev > maxEval) {
      maxEval = ev;
      bestMove = move;
    }
    alpha = Math.max(alpha, ev);
  }

  return bestMove || getRandomMove(board, color);
}
