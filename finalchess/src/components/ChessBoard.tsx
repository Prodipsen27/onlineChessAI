import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChessPiece, BoardState } from "../data/evergreen";
import { Pawn, Rook, Knight, Bishop, Queen, King } from "./ChessPieces";

// Helper to render pieces dynamically
const PieceIcon: React.FC<{ type: ChessPiece["type"]; color: ChessPiece["color"]; className?: string }> = ({
  type,
  color,
  className,
}) => {
  switch (type) {
    case "p":
      return <Pawn color={color} className={className} />;
    case "r":
      return <Rook color={color} className={className} />;
    case "n":
      return <Knight color={color} className={className} />;
    case "b":
      return <Bishop color={color} className={className} />;
    case "q":
      return <Queen color={color} className={className} />;
    case "k":
      return <King color={color} className={className} />;
    default:
      return null;
  }
};

interface ChessBoardProps {
  board: BoardState;
  onMoveAttempt?: (from: string, to: string) => void;
  interactive?: boolean;
  selectedSquare: string | null;
  setSelectedSquare: (sq: string | null) => void;
  correctFrom?: string;
  correctTo?: string;
  legalMoves?: string[];
  kingInCheckSquare?: string | null;
  isCheckmate?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  onMoveAttempt,
  interactive = true,
  selectedSquare,
  setSelectedSquare,
  correctFrom,
  correctTo,
  legalMoves = [],
  kingInCheckSquare = null,
  isCheckmate = false,
}) => {
  const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const rows = [8, 7, 6, 5, 4, 3, 2, 1];

  const handleSquareClick = (square: string) => {
    if (!interactive) return;

    const piece = board[square];

    // If no piece is selected, select the clicked White piece
    if (!selectedSquare) {
      if (piece && piece.color === "w") {
        setSelectedSquare(square);
      }
    } else {
      // If a piece is already selected
      if (selectedSquare === square) {
        // Deselect if clicked again
        setSelectedSquare(null);
      } else if (piece && piece.color === "w") {
        // Switch selection to another White piece
        setSelectedSquare(square);
      } else {
        // Attempt a move
        if (onMoveAttempt) {
          onMoveAttempt(selectedSquare, square);
        }
      }
    }
  };

  return (
    <div className="relative w-full aspect-square bg-[#101424] rounded-lg p-2 md:p-3 shadow-2xl border border-slate-700/50">
      {/* Outer border glow */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none" />

      {/* 8x8 Grid Container */}
      <div className="relative w-full h-full grid grid-cols-8 grid-rows-8 gap-0 rounded border border-[#6b4724]">
        {rows.map((row) => {
          return columns.map((col) => {
            const square = `${col}${row}`;
            const piece = board[square];
            const isDark = (columns.indexOf(col) + row) % 2 === 0;
            const isSelected = selectedSquare === square;
            const isSuggestedFrom = correctFrom === square;
            const isSuggestedTo = correctTo === square;
            const isLegal = legalMoves.includes(square);

            return (
              <div
                key={square}
                id={`square-${square}`}
                onClick={() => handleSquareClick(square)}
                className={`relative flex items-center justify-center cursor-pointer transition-all duration-300 select-none
                  ${
                    isDark
                      ? "bg-[#966f4b] hover:bg-[#a67d53]" // dark wood
                      : "bg-[#e6cca7] hover:bg-[#ebd5b6]" // light wood
                  }
                `}
              >
                {/* Board Square Coordinate Labels (a-h at bottom row, 1-8 at a-column) */}
                {col === "a" && (
                  <span className={`absolute top-0.5 left-1 text-[9px] md:text-xs font-mono font-bold leading-none select-none pointer-events-none
                    ${isDark ? "text-[#e6cca7]/80" : "text-[#966f4b]/80"}
                  `}>
                    {row}
                  </span>
                )}
                {row === 1 && (
                  <span className={`absolute bottom-0 right-1 text-[9px] md:text-xs font-mono font-bold leading-none select-none pointer-events-none
                    ${isDark ? "text-[#e6cca7]/80" : "text-[#966f4b]/80"}
                  `}>
                    {col}
                  </span>
                )}

                {/* Check / Checkmate red highlight */}
                {kingInCheckSquare === square && (
                  <div className="absolute inset-0 bg-red-600/50 border-2 border-red-500 z-10 pointer-events-none shadow-[inset_0_0_20px_rgba(220,38,38,0.7)] animate-pulse" />
                )}

                {/* Selection / Suggestion Highlight Glows */}
                {isSelected && (
                  <div className="absolute inset-0 bg-blue-500/30 border-2 border-blue-400 z-10 animate-pulse pointer-events-none shadow-[inset_0_0_12px_rgba(59,130,246,0.5)]" />
                )}

                {/* Pulsing indicator if this square is the suggested 'to' square when 'from' is selected */}
                {selectedSquare === correctFrom && isSuggestedTo && (
                  <div className="absolute w-5 h-5 rounded-full bg-cyan-400/20 border-2 border-cyan-400 z-10 animate-ping pointer-events-none" />
                )}
                {selectedSquare === correctFrom && isSuggestedTo && (
                  <div className="absolute w-3 h-3 rounded-full bg-cyan-400 z-10 shadow-[0_0_8px_#22d3ee] pointer-events-none" />
                )}

                {/* Pulsing hint for 'from' piece if nothing selected */}
                {!selectedSquare && isSuggestedFrom && (
                  <div className="absolute inset-0 bg-yellow-500/20 border-2 border-yellow-400/60 z-10 animate-pulse pointer-events-none" />
                )}

                {/* Legal destinations indicator */}
                {isLegal && (
                  <div className="absolute w-4 h-4 rounded-full bg-black/20 z-10 pointer-events-none" />
                )}

                {/* Piece Rendering with animations */}
                <AnimatePresence mode="popLayout">
                  {piece && (
                    <motion.div
                      key={piece.id}
                      layoutId={piece.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: isCheckmate && kingInCheckSquare === square ? 0.8 : 1,
                        rotate: isCheckmate && kingInCheckSquare === square ? 90 : 0,
                        y: isCheckmate && kingInCheckSquare === square ? 4 : 0,
                      }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 220, damping: 20 }}
                      className={`w-[85%] h-[85%] flex items-center justify-center z-20 pointer-events-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] ${isCheckmate && kingInCheckSquare === square ? "scale-90" : ""}`}
                    >
                      <PieceIcon type={piece.type} color={piece.color} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};
