/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BoardState, SquareCoordinate } from '../types';
import { ChessBoard } from './ChessBoard';
import {
  getEvergreenInitialState,
  EVERGREEN_SOLUTION,
} from '../utils/chessHelpers';
import { findKing, isKingInCheck } from '../utils/chessRules';

export function EvergreenPuzzle() {
  const [boardState, setBoardState] = useState<BoardState>(getEvergreenInitialState());
  const [selectedSquare, setSelectedSquare] = useState<SquareCoordinate | null>(null);
  const [kingInCheck, setKingInCheck] = useState<SquareCoordinate | null>(null);
  const [shakingSquare, setShakingSquare] = useState<SquareCoordinate | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [pendingBlackResponse, setPendingBlackResponse] = useState(false);
  const [hintSquares, setHintSquares] = useState<{ from: SquareCoordinate; to: SquareCoordinate } | null>(null);

  const handleResetPuzzle = useCallback(() => {
    setBoardState(getEvergreenInitialState());
    setCurrentStepIndex(0);
    setIsAutoPlaying(false);
    setSelectedSquare(null);
    setKingInCheck(null);
    setShakingSquare(null);
    setHintSquares(null);
    setPendingBlackResponse(false);
  }, []);

  const handlePieceMove = useCallback(
    (from: SquareCoordinate, to: SquareCoordinate) => {
      const piece = boardState[from];
      if (!piece) return;

      if (isAutoPlaying) return;
      if (pendingBlackResponse) return; // Wait for black's response
      if (currentStepIndex >= EVERGREEN_SOLUTION.length) return;

      const currentExpectedStep = EVERGREEN_SOLUTION[currentStepIndex];

      if (from === currentExpectedStep.whiteMove.from && to === currentExpectedStep.whiteMove.to) {
        // Apply white's move
        const nextBoard = { ...boardState };
        nextBoard[to] = piece;
        nextBoard[from] = null;

        setBoardState(nextBoard);
        setHintSquares(null);

        // Check if black has a response
        if (currentExpectedStep.blackResponse) {
          setPendingBlackResponse(true);
        } else {
          // If no black response, just advance the step (like Checkmate step)
          setCurrentStepIndex((prev) => prev + 1);
          
          // Update king check status for white's move
          const blackKingCoord = findKing('black', nextBoard);
          if (isKingInCheck('black', nextBoard)) {
            setKingInCheck(blackKingCoord);
          } else {
            setKingInCheck(null);
          }
        }
      } else {
        setShakingSquare(from);
        setTimeout(() => setShakingSquare(null), 400);
      }
    },
    [boardState, currentStepIndex, isAutoPlaying, pendingBlackResponse]
  );

  // Handle black's response after a delay
  useEffect(() => {
    if (pendingBlackResponse && currentStepIndex < EVERGREEN_SOLUTION.length) {
      const timer = setTimeout(() => {
        const step = EVERGREEN_SOLUTION[currentStepIndex];
        const nextBoard = { ...boardState };
        
        if (step.blackResponse) {
          const blackPiece = nextBoard[step.blackResponse.from];
          if (blackPiece) {
            nextBoard[step.blackResponse.to] = blackPiece;
            nextBoard[step.blackResponse.from] = null;
          }
        }

        setBoardState(nextBoard);
        setPendingBlackResponse(false);
        setCurrentStepIndex((prev) => prev + 1);

        // Update king in check status after black's move
        const whiteKingCoord = findKing('white', nextBoard);
        if (isKingInCheck('white', nextBoard)) {
          setKingInCheck(whiteKingCoord);
        } else {
          setKingInCheck(null);
        }
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [pendingBlackResponse, currentStepIndex, boardState]);

  const handleAutoPlay = useCallback(() => {
    handleResetPuzzle();
    setIsAutoPlaying(true);
  }, [handleResetPuzzle]);

  useEffect(() => {
    if (isAutoPlaying) {
      if (currentStepIndex >= EVERGREEN_SOLUTION.length) {
        setIsAutoPlaying(false);
        return;
      }
      if (pendingBlackResponse) return; // Wait for black's response to complete first

      const step = EVERGREEN_SOLUTION[currentStepIndex];
      const timer = setTimeout(() => {
        const piece = boardState[step.whiteMove.from];
        if (piece) {
          const nextBoard = { ...boardState };
          nextBoard[step.whiteMove.to] = piece;
          nextBoard[step.whiteMove.from] = null;
          
          setBoardState(nextBoard);

          if (step.blackResponse) {
            setPendingBlackResponse(true);
          } else {
            setCurrentStepIndex((prev) => prev + 1);
            
            const blackKingCoord = findKing('black', nextBoard);
            if (isKingInCheck('black', nextBoard)) {
              setKingInCheck(blackKingCoord);
            } else {
              setKingInCheck(null);
            }
          }
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAutoPlaying, currentStepIndex, boardState, pendingBlackResponse]);

  return (
    <div className="w-full max-w-[500px] bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-sm tracking-widest text-slate-200 uppercase mb-1">
            MATE IN 4
          </h3>
          <p className="text-sm text-slate-400">
            {currentStepIndex === EVERGREEN_SOLUTION.length
              ? "Puzzle solved! Checkmate."
              : `Step ${currentStepIndex + 1} of ${EVERGREEN_SOLUTION.length}: Find the winning move.`}
          </p>
        </div>
        <div className="flex gap-2">
          {EVERGREEN_SOLUTION.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i < currentStepIndex
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                  : i === currentStepIndex
                  ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden border border-white/10 bg-[#e0b080]">
        <ChessBoard
          boardState={boardState}
          onPieceMove={handlePieceMove}
          selectedSquare={selectedSquare}
          setSelectedSquare={setSelectedSquare}
          kingInCheckCoord={kingInCheck}
          shakingSquare={shakingSquare}
          mode="puzzle"
          activeTurn="white"
          hintSquares={hintSquares}
          showDestinations={true}
        />
        {currentStepIndex === EVERGREEN_SOLUTION.length && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-20">
            <h2 className="text-4xl font-bold text-white tracking-widest">SUCCESS</h2>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleResetPuzzle}
          className="py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-sm font-medium border border-white/10 transition-colors"
        >
          Reset Puzzle
        </button>
        <button
          onClick={handleAutoPlay}
          disabled={isAutoPlaying || currentStepIndex === EVERGREEN_SOLUTION.length}
          className="py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-sm font-medium border border-white/10 transition-colors disabled:opacity-50"
        >
          Replay Full Game
        </button>
      </div>
    </div>
  );
}
