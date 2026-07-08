/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BoardState, SquareCoordinate, PieceColor, TelemetryLog } from '../types';
import { ChessBoard } from './ChessBoard';
import { getStandardInitialState, generateFEN } from '../utils/chessHelpers';
import {
  isFullyLegalMove,
  isKingInCheck,
  isCheckmate,
  isStalemate,
  findKing,
} from '../utils/chessRules';
import { evaluateBoard } from '../utils/chessAI';
import ChessAIWorker from '../workers/chessAI.worker?worker';
import { Terminal, Copy, Undo2, RotateCcw, Lightbulb, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';

// Synthesize premium wood click sound for piece movement
function playChessClickSound(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);

    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'sine';
    snapOsc.frequency.setValueAtTime(800, ctx.currentTime);
    snapOsc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.02);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    snapGain.gain.setValueAtTime(0.08, ctx.currentTime);
    snapGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);

    snapOsc.start();
    snapOsc.stop(ctx.currentTime + 0.03);
  } catch (err) {
    // Fail silently
  }
}

export function PlayVsComputer() {
  const [history, setHistory] = useState<{ board: BoardState; turn: PieceColor }[]>([
    { board: getStandardInitialState(), turn: 'white' }
  ]);
  const [boardState, setBoardState] = useState<BoardState>(getStandardInitialState());
  const [selectedSquare, setSelectedSquare] = useState<SquareCoordinate | null>(null);
  const [kingInCheck, setKingInCheck] = useState<SquareCoordinate | null>(null);
  const [shakingSquare, setShakingSquare] = useState<SquareCoordinate | null>(null);
  const [activeTurn, setActiveTurn] = useState<PieceColor>('white');
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<'checkmate' | 'stalemate' | null>(null);
  const [winner, setWinner] = useState<PieceColor | null>(null);
  const [difficulty, setDifficulty] = useState<number>(3);

  // Configuration
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showDestinations, setShowDestinations] = useState(true);
  
  // Telemetry
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [hintSquares, setHintSquares] = useState<{ from: SquareCoordinate; to: SquareCoordinate } | null>(null);

  // Web Worker — created once and reused for the lifetime of this component
  const workerRef = useRef<Worker | null>(null);
  useEffect(() => {
    workerRef.current = new ChessAIWorker();
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addSystemLog = useCallback((text: string) => {
    setLogs(prev => [
      ...prev,
      { id: `log-${Date.now()}-${Math.random()}`, text, timestamp: new Date().toTimeString().split(' ')[0] }
    ]);
  }, []);

  // Init log
  useEffect(() => {
    if (logs.length === 0) {
      addSystemLog("> Engine initialized. Challenge accepted.");
    }
  }, [addSystemLog, logs.length]);

  const handleResetGame = useCallback(() => {
    const init = getStandardInitialState();
    setBoardState(init);
    setHistory([{ board: init, turn: 'white' }]);
    setKingInCheck(null);
    setSelectedSquare(null);
    setShakingSquare(null);
    setHintSquares(null);
    setActiveTurn('white');
    setIsGameOver(false);
    setGameResult(null);
    setWinner(null);
    addSystemLog("> Board reset to starting configuration.");
  }, [addSystemLog]);

  const handleUndo = useCallback(() => {
    if (history.length <= 1) return;
    
    // If playing against computer and it's our turn, we undo 2 steps (our move + computer's move)
    let stepsToUndo = 1;
    if (activeTurn === 'white' && history.length >= 3) {
      stepsToUndo = 2;
    }

    const newHistory = history.slice(0, history.length - stepsToUndo);
    const prevState = newHistory[newHistory.length - 1];
    
    setHistory(newHistory);
    setBoardState(prevState.board);
    setActiveTurn(prevState.turn);
    setKingInCheck(isKingInCheck(prevState.turn, prevState.board) ? findKing(prevState.turn, prevState.board) : null);
    setIsGameOver(false);
    setGameResult(null);
    setWinner(null);
    setHintSquares(null);
    addSystemLog(`> Undo executed. Reverted ${stepsToUndo} move(s).`);
  }, [history, activeTurn, addSystemLog]);

  const handlePieceMove = useCallback(
    (from: SquareCoordinate, to: SquareCoordinate) => {
      const piece = boardState[from];
      if (!piece) return;
      if (isGameOver) return;

      if (piece.color !== activeTurn) {
        setShakingSquare(from);
        setTimeout(() => setShakingSquare(null), 400);
        return;
      }

      if (!isFullyLegalMove(from, to, boardState)) {
        setShakingSquare(from);
        setTimeout(() => setShakingSquare(null), 400);
        return;
      }

      setHintSquares(null); // Clear hint on move
      playChessClickSound(soundEnabled);

      const nextBoard = { ...boardState };
      const capturedPiece = nextBoard[to];
      nextBoard[to] = piece;
      nextBoard[from] = null;
      setBoardState(nextBoard);

      addSystemLog(`> ${piece.color === 'white' ? 'White' : 'Black'} moved ${piece.type} from ${from} to ${to}${capturedPiece ? ' (Capture)' : ''}`);

      const nextTurn: PieceColor = activeTurn === 'white' ? 'black' : 'white';
      
      // Update history
      setHistory(prev => [...prev, { board: nextBoard, turn: nextTurn }]);
      setActiveTurn(nextTurn);

      const opponentKingCoord = findKing(nextTurn, nextBoard);
      const inCheck = isKingInCheck(nextTurn, nextBoard);

      if (inCheck) {
        setKingInCheck(opponentKingCoord);
        if (isCheckmate(nextTurn, nextBoard)) {
          setIsGameOver(true);
          setGameResult('checkmate');
          setWinner(activeTurn);
          addSystemLog(`> CHECKMATE! ${activeTurn.toUpperCase()} wins!`);
        } else {
          addSystemLog(`> CHECK!`);
        }
      } else {
        setKingInCheck(null);
        if (isStalemate(nextTurn, nextBoard)) {
          setIsGameOver(true);
          setGameResult('stalemate');
          addSystemLog(`> STALEMATE. Game drawn.`);
        }
      }
    },
    [boardState, activeTurn, isGameOver, addSystemLog]
  );

  // AI Hook — dispatches to the Web Worker so minimax never blocks the main thread
  useEffect(() => {
    if (activeTurn !== 'black' || isGameOver) return;

    addSystemLog('> Engine computing best move...');
    const worker = workerRef.current;
    if (!worker) return;

    const handleMessage = (e: MessageEvent) => {
      const { result, error } = e.data as {
        result: { from: SquareCoordinate; to: SquareCoordinate } | null;
        error: string | null;
      };
      if (error) {
        addSystemLog(`> Engine error: ${error}`);
        return;
      }
      if (result) {
        handlePieceMove(result.from, result.to);
      } else {
        addSystemLog('> Engine could not find a valid move.');
      }
    };

    worker.addEventListener('message', handleMessage, { once: true });
    worker.postMessage({ board: boardState, color: 'black', difficulty });

    return () => {
      worker.removeEventListener('message', handleMessage);
    };
  }, [activeTurn, isGameOver, boardState, difficulty, handlePieceMove, addSystemLog]);

  const requestHint = useCallback(() => {
    addSystemLog('> Computing hint...');
    const worker = workerRef.current;
    if (!worker) return;
    const handleHint = (e: MessageEvent) => {
      const { result, error } = e.data as {
        result: { from: SquareCoordinate; to: SquareCoordinate } | null;
        error: string | null;
      };
      if (error || !result) {
        addSystemLog('> Hint unavailable.');
        return;
      }
      setHintSquares(result);
      addSystemLog(`> Hint: Consider ${result.from} to ${result.to}`);
    };
    worker.addEventListener('message', handleHint, { once: true });
    worker.postMessage({ board: boardState, color: activeTurn, difficulty: 3 });
  }, [addSystemLog, boardState, activeTurn]);

  const copyFEN = () => {
    const fen = generateFEN(boardState, activeTurn);
    navigator.clipboard.writeText(fen);
    addSystemLog("> FEN copied to clipboard.");
  };

  // Evaluation Bar Math (Normalized between -10 and +10 pawns)
  const rawScore = evaluateBoard(boardState, 'white') / 100; 
  // Clamp between -10 and 10
  const clampedScore = Math.max(-10, Math.min(10, rawScore));
  const evalFillPct = ((clampedScore + 10) / 20) * 100;

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-16 items-start">
      
      {/* LEFT COLUMN: INTERACTIVE CHESSBOARD */}
      <div className="flex flex-col items-center max-w-[600px] mx-auto w-full">
        <div className="w-full flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${activeTurn === 'black' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-sm font-bold tracking-widest text-slate-300 uppercase">Engine (Level {difficulty})</span>
          </div>
          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-slate-400">
            {isGameOver ? 'GAME OVER' : 'PLAYING'}
          </span>
        </div>

        <div className="flex w-full gap-4">
          {/* EVALUATION BAR */}
          <div className="relative w-8 bg-[#1e293b] border border-slate-700 rounded-lg overflow-hidden hidden sm:block shrink-0">
            {/* Dark part (Black's advantage) comes from top down, light part (White's advantage) comes from bottom up */}
            <div 
              className="absolute bottom-0 left-0 w-full bg-slate-200 transition-all duration-700 ease-in-out"
              style={{ height: `${evalFillPct}%` }}
            />
            {/* Center line */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-500/50" />
            <div className="absolute top-2 left-0 w-full text-center z-10">
              <span className={`text-[9px] font-bold ${clampedScore < 0 ? 'text-white' : 'text-slate-800'}`}>
                {clampedScore <= 0 ? Math.abs(clampedScore).toFixed(1) : ''}
              </span>
            </div>
            <div className="absolute bottom-2 left-0 w-full text-center z-10">
              <span className={`text-[9px] font-bold ${clampedScore > 0 ? 'text-slate-800' : 'text-white'}`}>
                {clampedScore > 0 ? Math.abs(clampedScore).toFixed(1) : ''}
              </span>
            </div>
          </div>

          {/* BOARD */}
          <div className="w-[500px] h-[500px] shrink-0">
            <ChessBoard
              boardState={boardState}
              onPieceMove={handlePieceMove}
              selectedSquare={selectedSquare}
              setSelectedSquare={setSelectedSquare}
              kingInCheckCoord={kingInCheck}
              shakingSquare={shakingSquare}
              mode={'play'}
              activeTurn={activeTurn}
              hintSquares={hintSquares}
              showDestinations={showDestinations}
            />
          </div>
        </div>

        <div className="w-full flex items-center justify-between mt-4 px-2">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${activeTurn === 'white' ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-slate-600'}`} />
            <span className="text-sm font-bold tracking-widest text-slate-300 uppercase">You (White)</span>
          </div>
          {isGameOver && (
            <div className="px-4 py-1.5 bg-red-500/20 border border-red-500/50 rounded text-sm font-bold text-red-200">
              {gameResult === 'checkmate' ? `${winner?.toUpperCase()} WINS!` : 'DRAW!'}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: CONTROL & TELEMETRY */}
      <div className="flex flex-col gap-6 max-w-[600px] w-full mx-auto">
        
        {/* CALIBRATION DECK (Badges & Difficulty) */}
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm tracking-widest text-slate-200 uppercase">
              Calibration Deck
            </h3>
            <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded text-xs font-bold uppercase tracking-wider">
              {activeTurn === 'white' ? 'Your Move' : 'AI Thinking'}
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">
              Engine Difficulty constraints
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { lvl: 1, label: '800', desc: 'Beginner' },
                { lvl: 2, label: '1200', desc: 'Casual' },
                { lvl: 3, label: '1600', desc: 'Interm.' },
                { lvl: 4, label: '2000', desc: 'Expert' },
                { lvl: 5, label: '2400', desc: 'Master' },
              ].map(d => (
                <button
                  key={d.lvl}
                  onClick={() => setDifficulty(d.lvl)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all ${
                    difficulty === d.lvl 
                      ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-300'
                  }`}
                >
                  <span className="font-bold text-sm">{d.lvl}</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-70 hidden sm:block">{d.label}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-3 text-center">
              Higher levels increase search depth. Level 4-5 may take longer to compute.
            </p>
          </div>
        </div>

        {/* MATCH LOG */}
        <div className="bg-slate-900/80 backdrop-blur-md border-2 border-slate-700 rounded-xl p-4 flex flex-col h-[250px] shadow-lg">
          <div className="flex items-center gap-2 mb-3 px-2 border-b border-slate-700 pb-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-emerald-400/80 uppercase tracking-wider">Match Log</span>
          </div>
          <div className="flex-1 overflow-y-auto font-mono text-xs p-2 space-y-1.5 custom-scrollbar">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 text-slate-400">
                <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                <span className="break-all text-slate-300">{log.text}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* UNIFIED ACTION RACKS & EXPORTS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tactical Actions</h4>
            <button onClick={handleUndo} disabled={history.length <= 1} className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 border border-white/10 rounded-lg text-sm text-slate-300 transition-colors">
              <span className="font-medium">Undo Move</span>
              <Undo2 className="w-4 h-4 opacity-70" />
            </button>
            <button onClick={requestHint} disabled={activeTurn !== 'white' || isGameOver} className="w-full flex items-center justify-between px-4 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 disabled:opacity-50 border border-indigo-500/30 rounded-lg text-sm text-indigo-300 transition-colors">
              <span className="font-medium">Engine Hint</span>
              <Lightbulb className="w-4 h-4 opacity-70" />
            </button>
            <button onClick={handleResetGame} className="w-full flex items-center justify-between px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-300 transition-colors">
              <span className="font-medium">Resign & Reset</span>
              <RotateCcw className="w-4 h-4 opacity-70" />
            </button>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Configs & Export</h4>
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-slate-300 transition-colors">
              <span className="font-medium">Sound FX</span>
              {soundEnabled ? <Volume2 className="w-4 h-4 opacity-70 text-emerald-400" /> : <VolumeX className="w-4 h-4 opacity-50" />}
            </button>
            <button onClick={() => setShowDestinations(!showDestinations)} className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-slate-300 transition-colors">
              <span className="font-medium">Destinations</span>
              {showDestinations ? <Eye className="w-4 h-4 opacity-70 text-emerald-400" /> : <EyeOff className="w-4 h-4 opacity-50" />}
            </button>
            <button onClick={copyFEN} className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-slate-300 transition-colors">
              <span className="font-medium">Copy FEN</span>
              <Copy className="w-4 h-4 opacity-70" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
