/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { BoardState, SquareCoordinate, PieceColor } from '../types';
import { ChessSquare } from './ChessSquare';
import { FILES, RANKS } from '../utils/chessHelpers';
import { isFullyLegalMove } from '../utils/chessRules';

interface ChessBoardProps {
  boardState: BoardState;
  onPieceMove: (from: SquareCoordinate, to: SquareCoordinate) => void;
  selectedSquare: SquareCoordinate | null;
  setSelectedSquare: (coord: SquareCoordinate | null) => void;
  kingInCheckCoord: SquareCoordinate | null;
  shakingSquare: SquareCoordinate | null;
  mode: 'play' | 'free';
  activeTurn: PieceColor;
  hintSquares?: { from: SquareCoordinate; to: SquareCoordinate } | null;
  showDestinations?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  boardState,
  onPieceMove,
  selectedSquare,
  setSelectedSquare,
  kingInCheckCoord,
  shakingSquare,
  mode,
  activeTurn,
  hintSquares = null,
  showDestinations = true,
}) => {
  const [hoveredSquare, setHoveredSquare] = useState<SquareCoordinate | null>(null);
  const touchStartSquareRef = useRef<SquareCoordinate | null>(null);
  const touchCurrentSquareRef = useRef<SquareCoordinate | null>(null);

  // Calculate legal destination squares for the currently selected piece
  const legalDestinations = useMemo(() => {
    const destinations = new Set<SquareCoordinate>();
    if (!showDestinations || !selectedSquare) return destinations;

    const piece = boardState[selectedSquare];
    if (!piece) return destinations;

    // In Sandbox mode, only show highlights if selecting own turn's piece
    if (mode === 'free' && piece.color !== activeTurn) {
      return destinations;
    }

    // In Play mode, player is playing White
    if (mode === 'play' && piece.color !== 'white') {
      return destinations;
    }

    // Scan all squares and check if move is legal
    for (const file of FILES) {
      for (const rank of RANKS) {
        const targetCoord: SquareCoordinate = `${file}${rank}`;
        if (targetCoord !== selectedSquare) {
          if (isFullyLegalMove(selectedSquare, targetCoord, boardState)) {
            destinations.add(targetCoord);
          }
        }
      }
    }

    return destinations;
  }, [selectedSquare, boardState, mode, activeTurn, showDestinations]);

  // --- HTML5 Desktop Drag and Drop Handlers ---
  const handleDragStart = useCallback((e: React.DragEvent, coord: SquareCoordinate) => {
    // Save starting square in dataTransfer
    e.dataTransfer.setData('text/plain', coord);
    // Set feedback image / drag effects
    e.dataTransfer.effectAllowed = 'move';
    setSelectedSquare(coord);
  }, [setSelectedSquare]);

  const handleDragOver = useCallback((e: React.DragEvent, coord: SquareCoordinate) => {
    e.preventDefault(); // Required to allow drop
    if (hoveredSquare !== coord) {
      setHoveredSquare(coord);
    }
  }, [hoveredSquare]);

  const handleDragLeave = useCallback((e: React.DragEvent, coord: SquareCoordinate) => {
    if (hoveredSquare === coord) {
      setHoveredSquare(null);
    }
  }, [hoveredSquare]);

  const handleDrop = useCallback((e: React.DragEvent, coord: SquareCoordinate) => {
    e.preventDefault();
    const fromCoord = e.dataTransfer.getData('text/plain') as SquareCoordinate;
    setHoveredSquare(null);
    setSelectedSquare(null);

    if (fromCoord && fromCoord !== coord) {
      onPieceMove(fromCoord, coord);
    }
  }, [onPieceMove, setSelectedSquare]);

  // --- Touch Screen Drag and Drop Handlers (Mobile Support) ---
  const handleTouchStart = useCallback((e: React.TouchEvent, coord: SquareCoordinate) => {
    // Only drag if there is a piece on the touched square
    if (boardState[coord]) {
      touchStartSquareRef.current = coord;
      touchCurrentSquareRef.current = coord;
      setSelectedSquare(coord);
    }
  }, [boardState, setSelectedSquare]);

  const handleTouchMove = useCallback((e: React.TouchEvent, coord: SquareCoordinate) => {
    if (!touchStartSquareRef.current) return;

    // Retrieve touch point coordinates
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;

    // Find if we are hovering over a ChessSquare element
    let targetSquareId: string | null = null;
    let currentEl: HTMLElement | null = element as HTMLElement;

    while (currentEl && currentEl !== document.body) {
      if (currentEl.id && currentEl.id.startsWith('square-')) {
        targetSquareId = currentEl.id;
        break;
      }
      currentEl = currentEl.parentElement;
    }

    if (targetSquareId) {
      const targetCoord = targetSquareId.replace('square-', '') as SquareCoordinate;
      if (touchCurrentSquareRef.current !== targetCoord) {
        touchCurrentSquareRef.current = targetCoord;
        setHoveredSquare(targetCoord);
      }
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent, coord: SquareCoordinate) => {
    const fromCoord = touchStartSquareRef.current;
    const toCoord = touchCurrentSquareRef.current;

    // Reset references and hover states
    touchStartSquareRef.current = null;
    touchCurrentSquareRef.current = null;
    setHoveredSquare(null);
    setSelectedSquare(null);

    if (fromCoord && toCoord && fromCoord !== toCoord) {
      onPieceMove(fromCoord, toCoord);
    }
  }, [onPieceMove, setSelectedSquare]);

  // --- Click-To-Move Accessibility Support ---
  const handleSquareClick = useCallback((coord: SquareCoordinate) => {
    if (selectedSquare === null) {
      // If no square is selected, select if there is a piece
      if (boardState[coord]) {
        setSelectedSquare(coord);
      }
    } else {
      // If a square is already selected
      if (selectedSquare === coord) {
        // Deselect if clicked same square
        setSelectedSquare(null);
      } else {
        // Perform move if valid click target
        onPieceMove(selectedSquare, coord);
        setSelectedSquare(null);
      }
    }
  }, [selectedSquare, boardState, onPieceMove, setSelectedSquare]);

  return (
    <div
      role="grid"
      aria-label="Chess Board"
      className="relative w-full aspect-square bg-[#0f172a] p-1 rounded-md border-[12px] border-slate-800 shadow-2xl overflow-hidden select-none"
    >
      {/* 8x8 board layout */}
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded shadow-inner overflow-hidden">
        {RANKS.map((rank) =>
          FILES.map((file) => {
            const coord: SquareCoordinate = `${file}${rank}`;
            const piece = boardState[coord];
            return (
              <ChessSquare
                key={coord}
                coordinate={coord}
                piece={piece}
                isHighlighted={hoveredSquare === coord}
                isSelected={selectedSquare === coord}
                isKingInCheck={kingInCheckCoord === coord}
                isShaking={shakingSquare === coord}
                isPossibleMove={legalDestinations.has(coord)}
                isHintFrom={hintSquares?.from === coord}
                isHintTo={hintSquares?.to === coord}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleSquareClick}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
