/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { ChessPiece, SquareCoordinate } from '../types';
import { ChessPieceRenderer } from './ChessPieceRenderer';

interface ChessSquareProps {
  coordinate: SquareCoordinate;
  piece: ChessPiece | null;
  isHighlighted: boolean; // Translucent yellow drop target highlight
  isSelected: boolean;    // Currently picked up/dragged
  isKingInCheck: boolean; // Highlight red if king is in check
  isShaking: boolean;     // True if the square is shaking due to illegal move
  isPossibleMove?: boolean; // Highlight if this is a legal move destination
  isHintFrom?: boolean;   // Hint starting square highlight
  isHintTo?: boolean;     // Hint ending square highlight
  onDragStart: (e: React.DragEvent, coord: SquareCoordinate) => void;
  onDragOver: (e: React.DragEvent, coord: SquareCoordinate) => void;
  onDragLeave: (e: React.DragEvent, coord: SquareCoordinate) => void;
  onDrop: (e: React.DragEvent, coord: SquareCoordinate) => void;
  onTouchStart: (e: React.TouchEvent, coord: SquareCoordinate) => void;
  onTouchMove: (e: React.TouchEvent, coord: SquareCoordinate) => void;
  onTouchEnd: (e: React.TouchEvent, coord: SquareCoordinate) => void;
  onClick: (coord: SquareCoordinate) => void;
}

// Piece names for aria-label generation
const PIECE_NAMES: Record<string, string> = {
  p: 'Pawn', r: 'Rook', n: 'Knight', b: 'Bishop', q: 'Queen', k: 'King',
};

const ChessSquareComponent: React.FC<ChessSquareProps> = ({
  coordinate,
  piece,
  isHighlighted,
  isSelected,
  isKingInCheck,
  isShaking,
  isPossibleMove = false,
  isHintFrom = false,
  isHintTo = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onClick,
}) => {
  // Determine if this is a dark or light square based on coordinate
  const isDark = useMemo(() => {
    const fileIndex = coordinate.charCodeAt(0) - 97; // 'a' is 97
    const rankIndex = parseInt(coordinate.charAt(1), 10) - 1;
    return (fileIndex + rankIndex) % 2 === 0;
  }, [coordinate]);

  const squareBaseClass = isDark
    ? 'bg-[#b58863] text-[#f0d9b5]/40'  // Olive Walnut
    : 'bg-[#f0d9b5] text-[#b58863]/40'; // Light Beige

  const highlightStyle = isHighlighted
    ? { backgroundColor: 'rgba(234, 179, 8, 0.35)', boxShadow: 'inset 0 0 0 3px rgba(234, 179, 8, 0.8)' }
    : undefined;

  const dragHandlers = piece
    ? {
        draggable: true,
        onDragStart: (e: React.DragEvent) => onDragStart(e, coordinate),
      }
    : {};

  // Build a descriptive aria-label for screen readers
  const ariaLabel = useMemo(() => {
    const file = coordinate.charAt(0).toUpperCase();
    const rank = coordinate.charAt(1);
    const squareName = `${file}${rank}`;
    if (!piece) return isSelected ? `Empty square ${squareName}, selected` : `Empty square ${squareName}`;
    const pieceName = `${piece.color === 'white' ? 'White' : 'Black'} ${PIECE_NAMES[piece.type] ?? piece.type}`;
    const stateLabel = isSelected ? ', selected' : isKingInCheck ? ', in check' : '';
    return `${pieceName} on ${squareName}${stateLabel}`;
  }, [coordinate, piece, isSelected, isKingInCheck]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(coordinate);
    }
  };

  return (
    <div
      id={`square-${coordinate}`}
      role="gridcell"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-selected={isSelected}
      className={`relative flex items-center justify-center w-full aspect-square transition-all duration-150 cursor-pointer select-none ${squareBaseClass} ${
        isKingInCheck ? 'ring-4 ring-red-500 ring-inset bg-red-900/30' : ''
      } ${isShaking ? 'animate-shake' : ''} focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-inset`}
      style={highlightStyle}
      onDragOver={(e) => onDragOver(e, coordinate)}
      onDragLeave={(e) => onDragLeave(e, coordinate)}
      onDrop={(e) => onDrop(e, coordinate)}
      onClick={() => onClick(coordinate)}
      onKeyDown={handleKeyDown}
      onTouchStart={(e) => onTouchStart(e, coordinate)}
      onTouchMove={(e) => onTouchMove(e, coordinate)}
      onTouchEnd={(e) => onTouchEnd(e, coordinate)}
    >
      {/* File/Rank Indicators on the very outer edges of the matrix if they correspond to specific coordinates */}
      {coordinate.startsWith('a') && (
        <span className="absolute top-1 left-1.5 font-sans font-bold text-[9px] md:text-[10px] pointer-events-none uppercase">
          {coordinate.charAt(1)}
        </span>
      )}
      {coordinate.endsWith('1') && (
        <span className="absolute bottom-1 right-1.5 font-sans font-bold text-[9px] md:text-[10px] pointer-events-none uppercase">
          {coordinate.charAt(0)}
        </span>
      )}

      {/* Chess Piece with Drag state style transforms */}
      {piece && (
        <div
          {...dragHandlers}
          className={`w-[84%] h-[84%] flex items-center justify-center transition-all duration-100 ${
            isSelected
              ? 'scale-108 opacity-40 filter drop-shadow-2xl cursor-grabbing'
              : 'hover:scale-105 active:scale-95 cursor-grab'
          }`}
        >
          <ChessPieceRenderer type={piece.type} color={piece.color} />
        </div>
      )}

      {/* Target drop marker indicator if highlighted but empty */}
      {isHighlighted && !piece && (
        <div className="absolute w-4 h-4 rounded-full bg-yellow-500/60 pointer-events-none animate-pulse" />
      )}

      {/* Legal destination indicators */}
      {isPossibleMove && !piece && (
        <div className="absolute w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-indigo-500/35 border-2 border-indigo-400/20 shadow-sm pointer-events-none" />
      )}
      {isPossibleMove && piece && (
        <div className="absolute w-[80%] h-[80%] border-[3.5px] border-dashed border-indigo-500/50 rounded-full pointer-events-none animate-pulse" />
      )}

      {/* Hint From Highlight */}
      {isHintFrom && (
        <div className="absolute inset-0 border-4 border-amber-400 bg-amber-500/15 pointer-events-none animate-pulse z-10 rounded shadow-[inset_0_0_12px_rgba(251,191,36,0.4)]" />
      )}
      
      {/* Hint To Highlight */}
      {isHintTo && (
        <div className="absolute inset-0 border-4 border-emerald-400 bg-emerald-500/15 pointer-events-none animate-pulse z-10 rounded shadow-[inset_0_0_12px_rgba(52,211,153,0.4)]" />
      )}
    </div>
  );
};

// Use React.memo with customized props comparator to maximize render performance
export const ChessSquare = React.memo(ChessSquareComponent, (prevProps, nextProps) => {
  return (
    prevProps.coordinate === nextProps.coordinate &&
    prevProps.isHighlighted === nextProps.isHighlighted &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isKingInCheck === nextProps.isKingInCheck &&
    prevProps.isShaking === nextProps.isShaking &&
    prevProps.isPossibleMove === nextProps.isPossibleMove &&
    prevProps.isHintFrom === nextProps.isHintFrom &&
    prevProps.isHintTo === nextProps.isHintTo &&
    prevProps.piece?.id === nextProps.piece?.id &&
    prevProps.piece?.type === nextProps.piece?.type &&
    prevProps.piece?.color === nextProps.piece?.color
  );
});
