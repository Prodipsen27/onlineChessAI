/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type PieceColor = 'white' | 'black';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  id: string; // Unique ID to track instances for smooth transitions/animations
}

// Coordinate system mapped to standard algebraic notation 'a1' through 'h8'
export type FileLetter = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
export type RankNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type SquareCoordinate = `${FileLetter}${RankNumber}`;

// Full chessboard matrix mapping standard coordinates to pieces or empty states
export type BoardState = Record<SquareCoordinate, ChessPiece | null>;

export interface MoveRecord {
  from: SquareCoordinate;
  to: SquareCoordinate;
  piece: ChessPiece;
  captured: ChessPiece | null;
  timestamp: Date;
}

export interface TelemetryLog {
  id: string;
  text: string;
  timestamp: string;
}
