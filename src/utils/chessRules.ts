/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BoardState, ChessPiece, SquareCoordinate, PieceColor, PieceType } from '../types';

// Helper to convert standard coordinate (e.g., 'e4') to [col, row] where col is 0-7 ('a'-'h') and row is 0-7 (1-8)
export function coordToIndices(coord: SquareCoordinate): [number, number] {
  const col = coord.charCodeAt(0) - 97; // 'a' is 97
  const row = parseInt(coord.charAt(1), 10) - 1; // 1-8 to 0-7
  return [col, row];
}

// Convert indices [col, row] back to standard algebraic coordinate
export function indicesToCoord(col: number, row: number): SquareCoordinate {
  const file = String.fromCharCode(97 + col);
  const rank = row + 1;
  return `${file}${rank}` as SquareCoordinate;
}

// Check if indices are within the 8x8 board
export function isWithinBoard(col: number, row: number): boolean {
  return col >= 0 && col < 8 && row >= 0 && row < 8;
}

/**
 * Basic pseudo-legal move validation for a piece on a given board state.
 * This ignores whether the move leaves the king in check.
 */
export function isPseudoLegalMove(
  from: SquareCoordinate,
  to: SquareCoordinate,
  board: BoardState
): boolean {
  const piece = board[from];
  if (!piece) return false;

  const targetPiece = board[to];
  // Cannot capture own piece
  if (targetPiece && targetPiece.color === piece.color) {
    return false;
  }

  const [fromCol, fromRow] = coordToIndices(from);
  const [toCol, toRow] = coordToIndices(to);

  const dCol = toCol - fromCol;
  const dRow = toRow - fromRow;

  const absDCol = Math.abs(dCol);
  const absDRow = Math.abs(dRow);

  switch (piece.type) {
    case 'p': { // PAWN
      const direction = piece.color === 'white' ? 1 : -1;
      const startRow = piece.color === 'white' ? 1 : 6; // Rank 2 or Rank 7

      // 1. Single step forward
      if (dCol === 0 && dRow === direction) {
        return !targetPiece;
      }

      // 2. Double step forward from initial square
      if (dCol === 0 && fromRow === startRow && dRow === 2 * direction) {
        const intermediateCoord = indicesToCoord(fromCol, fromRow + direction);
        return !board[intermediateCoord] && !targetPiece;
      }

      // 3. Diagonal capture
      if (absDCol === 1 && dRow === direction) {
        return !!targetPiece && targetPiece.color !== piece.color;
      }

      return false;
    }

    case 'n': // KNIGHT
      return (absDCol === 1 && absDRow === 2) || (absDCol === 2 && absDRow === 1);

    case 'b': // BISHOP
      if (absDCol !== absDRow) return false;
      return isPathClear(fromCol, fromRow, toCol, toRow, board);

    case 'r': // ROOK
      if (dCol !== 0 && dRow !== 0) return false;
      return isPathClear(fromCol, fromRow, toCol, toRow, board);

    case 'q': // QUEEN
      if (absDCol !== absDRow && dCol !== 0 && dRow !== 0) return false;
      return isPathClear(fromCol, fromRow, toCol, toRow, board);

    case 'k': // KING
      return absDCol <= 1 && absDRow <= 1;

    default:
      return false;
  }
}

// Helper to check if sliding path is clear of any pieces
function isPathClear(
  fromCol: number,
  fromRow: number,
  toCol: number,
  toRow: number,
  board: BoardState
): boolean {
  const stepCol = Math.sign(toCol - fromCol);
  const stepRow = Math.sign(toRow - fromRow);

  let currCol = fromCol + stepCol;
  let currRow = fromRow + stepRow;

  while (currCol !== toCol || currRow !== toRow) {
    const coord = indicesToCoord(currCol, currRow);
    if (board[coord]) {
      return false; // Path is blocked
    }
    currCol += stepCol;
    currRow += stepRow;
  }

  return true;
}

/**
 * Finds the coordinate of the King of a given color
 */
export function findKing(color: PieceColor, board: BoardState): SquareCoordinate | null {
  for (const coord in board) {
    const piece = board[coord as SquareCoordinate];
    if (piece && piece.type === 'k' && piece.color === color) {
      return coord as SquareCoordinate;
    }
  }
  return null;
}

/**
 * Returns true if the King of the specified color is currently under attack
 */
export function isKingInCheck(color: PieceColor, board: BoardState): boolean {
  const kingCoord = findKing(color, board);
  if (!kingCoord) return false;

  const opponentColor: PieceColor = color === 'white' ? 'black' : 'white';

  // Check if any opponent piece has a pseudo-legal move to the King's square
  for (const coord in board) {
    const piece = board[coord as SquareCoordinate];
    if (piece && piece.color === opponentColor) {
      if (isPseudoLegalMove(coord as SquareCoordinate, kingCoord, board)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Validates if a move is fully legal (must be pseudo-legal and not leave/put own king in check)
 */
export function isFullyLegalMove(
  from: SquareCoordinate,
  to: SquareCoordinate,
  board: BoardState
): boolean {
  const piece = board[from];
  if (!piece) return false;

  // 1. Verify pseudo-legal capabilities
  if (!isPseudoLegalMove(from, to, board)) {
    return false;
  }

  // 2. Simulate the move on a temp board
  const nextBoard = { ...board };
  nextBoard[to] = piece;
  nextBoard[from] = null;

  // 3. Verify own King is not left in check
  return !isKingInCheck(piece.color, nextBoard);
}

/**
 * Generates all legal moves for a given side
 */
export function getLegalMovesForColor(color: PieceColor, board: BoardState): { from: SquareCoordinate; to: SquareCoordinate }[] {
  const legalMoves: { from: SquareCoordinate; to: SquareCoordinate }[] = [];

  for (const fromStr in board) {
    const from = fromStr as SquareCoordinate;
    const piece = board[from];
    if (piece && piece.color === color) {
      // Test all possible destination squares
      for (const toStr in board) {
        const to = toStr as SquareCoordinate;
        if (from !== to) {
          if (isFullyLegalMove(from, to, board)) {
            legalMoves.push({ from, to });
          }
        }
      }
    }
  }

  return legalMoves;
}

/**
 * Checks if the specified color is in checkmate state
 */
export function isCheckmate(color: PieceColor, board: BoardState): boolean {
  // Must be in check first
  if (!isKingInCheck(color, board)) {
    return false;
  }

  // If there are no legal moves to escape check, it's checkmate!
  const legalMoves = getLegalMovesForColor(color, board);
  return legalMoves.length === 0;
}

/**
 * Checks if the specified color is in stalemate state
 */
export function isStalemate(color: PieceColor, board: BoardState): boolean {
  // Must NOT be in check
  if (isKingInCheck(color, board)) {
    return false;
  }

  // Has no legal moves
  const legalMoves = getLegalMovesForColor(color, board);
  return legalMoves.length === 0;
}
