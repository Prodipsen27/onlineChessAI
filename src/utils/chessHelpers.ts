/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BoardState, ChessPiece, SquareCoordinate, FileLetter, RankNumber } from '../types';

export const FILES: FileLetter[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const RANKS: RankNumber[] = [8, 7, 6, 5, 4, 3, 2, 1]; // Visual order from top to bottom

// Helper to create a piece with a unique ID
export function createPiece(color: 'white' | 'black', type: 'p' | 'r' | 'n' | 'b' | 'q' | 'k', customId?: string): ChessPiece {
  return {
    color,
    type,
    id: customId || `${color}-${type}-${Math.random().toString(36).substr(2, 9)}`,
  };
}

// Generate the Evergreen Game starting position
export function getEvergreenInitialState(): BoardState {
  const board: Partial<BoardState> = {};

  // Initialize all squares to null
  for (const file of FILES) {
    for (const rank of RANKS) {
      board[`${file}${rank}`] = null;
    }
  }

  // --- WHITE PIECES ---
  // King on g1
  board['g1'] = createPiece('white', 'k', 'w-king-g1');
  // Rook on d1
  board['d1'] = createPiece('white', 'r', 'w-rook-d1');
  // Bishops on a3 and d3
  board['a3'] = createPiece('white', 'b', 'w-bishop-a3');
  board['d3'] = createPiece('white', 'b', 'w-bishop-d3');
  // Pawns on a2, c3, f2, g2, h2
  board['a2'] = createPiece('white', 'p', 'w-pawn-a2');
  board['c3'] = createPiece('white', 'p', 'w-pawn-c3');
  board['f2'] = createPiece('white', 'p', 'w-pawn-f2');
  board['g2'] = createPiece('white', 'p', 'w-pawn-g2');
  board['h2'] = createPiece('white', 'p', 'w-pawn-h2');
  // Queen on a4
  board['a4'] = createPiece('white', 'q', 'w-queen-a4');

  // --- BLACK PIECES ---
  // King on e8
  board['e8'] = createPiece('black', 'k', 'b-king-e8');
  // Rooks on b8 and h8
  board['b8'] = createPiece('black', 'r', 'b-rook-b8');
  board['h8'] = createPiece('black', 'r', 'b-rook-h8');
  // Bishops on b6 and b7
  board['b6'] = createPiece('black', 'b', 'b-bishop-b6');
  board['b7'] = createPiece('black', 'b', 'b-bishop-b7');
  // Knight on e7
  board['e7'] = createPiece('black', 'n', 'b-knight-e7');
  // Queen on g3
  board['g3'] = createPiece('black', 'q', 'b-queen-g3');
  // Pawns on a7, c7, d7, f7, h7
  board['a7'] = createPiece('black', 'p', 'b-pawn-a7');
  board['c7'] = createPiece('black', 'p', 'b-pawn-c7');
  board['d7'] = createPiece('black', 'p', 'b-pawn-d7');
  board['f7'] = createPiece('black', 'p', 'b-pawn-f7');
  board['h7'] = createPiece('black', 'p', 'b-pawn-h7');

  return board as BoardState;
}

// Generate the standard starting position
export function getStandardInitialState(): BoardState {
  const board: Partial<BoardState> = {};

  for (const file of FILES) {
    for (const rank of RANKS) {
      board[`${file}${rank}`] = null;
    }
  }

  // White pieces
  board['a1'] = createPiece('white', 'r');
  board['b1'] = createPiece('white', 'n');
  board['c1'] = createPiece('white', 'b');
  board['d1'] = createPiece('white', 'q');
  board['e1'] = createPiece('white', 'k');
  board['f1'] = createPiece('white', 'b');
  board['g1'] = createPiece('white', 'n');
  board['h1'] = createPiece('white', 'r');
  for (const file of FILES) board[`${file}2` as SquareCoordinate] = createPiece('white', 'p');

  // Black pieces
  board['a8'] = createPiece('black', 'r');
  board['b8'] = createPiece('black', 'n');
  board['c8'] = createPiece('black', 'b');
  board['d8'] = createPiece('black', 'q');
  board['e8'] = createPiece('black', 'k');
  board['f8'] = createPiece('black', 'b');
  board['g8'] = createPiece('black', 'n');
  board['h8'] = createPiece('black', 'r');
  for (const file of FILES) board[`${file}7` as SquareCoordinate] = createPiece('black', 'p');

  return board as BoardState;
}

// Full Evergreen Game puzzle sequence:
// 1. Qxd7+ Kxd7 (White moves a4 -> d7, Black responds e8 -> d7)
// 2. Bf5+ Ke8   (White moves d3 -> f5, Black responds d7 -> e8)
// 3. Bd7+ Kf8   (White moves a3 -> d7, Black responds e8 -> f8)
// 4. Bxe7#      (White moves f5 -> e7, Black checkmated)
export interface PuzzleStep {
  whiteMove: { from: SquareCoordinate; to: SquareCoordinate };
  blackResponse: { from: SquareCoordinate; to: SquareCoordinate } | null;
  comment: string;
}

export const EVERGREEN_SOLUTION: PuzzleStep[] = [
  {
    whiteMove: { from: 'a4', to: 'd7' }, // Qxd7+
    blackResponse: { from: 'e8', to: 'd7' }, // Kxd7
    comment: "Brilliant! You sacrifice the Queen on d7 (Qxd7+). Black King must capture it (Kxd7).",
  },
  {
    whiteMove: { from: 'd3', to: 'f5' }, // Bf5+ (double check from f5 Bishop and d1 Rook)
    blackResponse: { from: 'd7', to: 'e8' }, // Ke8
    comment: "Perfect! Bishop to f5 (Bf5+) delivers a lethal double-check. Black King retreats to e8.",
  },
  {
    whiteMove: { from: 'a3', to: 'd7' }, // Bd7+
    blackResponse: { from: 'e8', to: 'f8' }, // Kf8
    comment: "Excellent! Bishop to d7 (Bd7+) forces the Black King to move to the corner (Kf8).",
  },
  {
    whiteMove: { from: 'f5', to: 'e7' }, // Bxe7#
    blackResponse: null,
    comment: "CHECKMATE! Bishop captures the Knight on e7 (Bxe7#). A legendary victory!",
  },
];

export function generateFEN(board: BoardState, activeTurn: 'white' | 'black'): string {
  let fen = '';
  
  for (const rank of RANKS) {
    let emptyCount = 0;
    for (const file of FILES) {
      const piece = board[`${file}${rank}` as SquareCoordinate];
      if (piece) {
        if (emptyCount > 0) {
          fen += emptyCount;
          emptyCount = 0;
        }
        const char = piece.type;
        fen += piece.color === 'white' ? char.toUpperCase() : char.toLowerCase();
      } else {
        emptyCount++;
      }
    }
    if (emptyCount > 0) fen += emptyCount;
    if (rank !== 1) fen += '/';
  }
  
  fen += ` ${activeTurn === 'white' ? 'w' : 'b'} - - 0 1`; // Simplified tail for visualization
  return fen;
}


