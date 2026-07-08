import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Chess } from "chess.js";
import {
  RotateCcw,
  Volume2,
  VolumeX,
  HelpCircle,
  Undo2,
  Flag,
  Copy,
  Check,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  History as HistoryIcon,
  Play
} from "lucide-react";
import { Pawn, Rook, Knight, Bishop, Queen, King } from "./ChessPieces";

// Piece-Square Tables (PST) for positional evaluation
const pawnPST = [
    0,  0,  0,  0,  0,  0,  0,  0,
   50, 50, 50, 50, 50, 50, 50, 50,
   10, 10, 20, 30, 30, 20, 10, 10,
    5,  5, 10, 25, 25, 10,  5,  5,
    0,  0,  0, 20, 20,  0,  0,  0,
    5, -5,-10,  0,  0,-10, -5,  5,
    5, 10, 10,-20,-20, 10, 10,  5,
    0,  0,  0,  0,  0,  0,  0,  0
];
const knightPST = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];
const bishopPST = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
];
const rookPST = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
];
const queenPST = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0,  0,
  -10,  5,  5,  5,  5,  5,  5,-10,
  -10,  0,  5,  0,  0,  5,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];
const kingPST = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20
];

interface LogEntry {
  id: string; timestamp: string; message: string; type: "system" | "user" | "engine" | "success" | "warning";
}

interface PlayComputerDashboardProps {
  onBackToPuzzle?: () => void;
}

export const PlayComputerDashboard: React.FC<PlayComputerDashboardProps> = ({ onBackToPuzzle }) => {
  const [chess] = useState<Chess>(() => new Chess());
  const [board, setBoard] = useState(() => chess.board());
  const [isThinking, setIsThinking] = useState(false);
  const [isShake, setIsShake] = useState(false);
  const [fen, setFen] = useState(() => chess.fen());
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [viewingMoveIndex, setViewingMoveIndex] = useState<number>(-1);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);

  // Game Over Modal State
  const [checkmateData, setCheckmateData] = useState<{winner: string} | null>(null);

  // Bottom Settings States
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showDestinations, setShowDestinations] = useState(true);
  const [copiedFen, setCopiedFen] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [evalScore, setEvalScore] = useState<number>(0);
  const [hintFrom, setHintFrom] = useState<string | null>(null);
  const [hintTo, setHintTo] = useState<string | null>(null);
  const [draggedSquare, setDraggedSquare] = useState<string | null>(null);

  // Terminal Logs
  const [terminalLogs, setTerminalLogs] = useState<LogEntry[]>([]);
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);
  const activeMoveRef = useRef<HTMLButtonElement | null>(null);
  const moveHistoryContainerRef = useRef<HTMLDivElement | null>(null);

  const addLog = (message: string, type: LogEntry["type"] = "system") => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setTerminalLogs((prev) => [...prev, { id: Math.random().toString(36).substr(2, 9), timestamp: time, message, type }]);
  };

  const activeFen = React.useMemo(() => {
    if (viewingMoveIndex === -1) return fen;
    if (viewingMoveIndex === -2) return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    return gameHistory[viewingMoveIndex] || fen;
  }, [viewingMoveIndex, fen, gameHistory]);

  const activeBoard = React.useMemo(() => {
    if (viewingMoveIndex === -1) return board;
    try { return new Chess(activeFen).board(); } catch { return board; }
  }, [board, activeFen, viewingMoveIndex]);

  const activeTurnColor = React.useMemo(() => activeFen.split(" ")[1] || "w", [activeFen]);

  const [activeIsCheck, activeIsCheckmate, activeKingInCheckSq] = React.useMemo(() => {
    let tChess;
    if (viewingMoveIndex === -1) {
      tChess = chess;
    } else {
      try {
        tChess = new Chess(activeFen);
      } catch {
        return [false, false, null];
      }
    }

    const isChk = tChess.isCheck();
    const isChkMt = tChess.isCheckmate();
    let kingSq = null;

    if (isChk || isChkMt) {
      const b = tChess.board();
      const t = tChess.turn();
      const cols = ["a", "b", "c", "d", "e", "f", "g", "h"];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = b[r][c];
          if (piece && piece.type === 'k' && piece.color === t) {
            kingSq = `${cols[c]}${8 - r}`;
            break;
          }
        }
        if (kingSq) break;
      }
    }

    return [isChk, isChkMt, kingSq];
  }, [chess, activeFen, viewingMoveIndex]);

  const handleStepPrev = () => {
    if (viewingMoveIndex === -1) setViewingMoveIndex(moveHistory.length > 0 ? moveHistory.length - 1 : -2);
    else if (viewingMoveIndex === -2) return;
    else if (viewingMoveIndex === 0) setViewingMoveIndex(-2);
    else setViewingMoveIndex((prev) => prev - 1);
    playSynthesizedSound("move");
  };

  const handleStepNext = () => {
    if (viewingMoveIndex === -1) return;
    else if (viewingMoveIndex === -2) setViewingMoveIndex(moveHistory.length > 0 ? 0 : -1);
    else if (viewingMoveIndex === moveHistory.length - 1) setViewingMoveIndex(-1);
    else setViewingMoveIndex((prev) => prev + 1);
    playSynthesizedSound("move");
  };

  useEffect(() => {
    if (activeMoveRef.current && moveHistoryContainerRef.current) {
      const container = moveHistoryContainerRef.current;
      const element = activeMoveRef.current;
      container.scrollTo({
        top: element.offsetTop - container.offsetTop - 40,
        behavior: "smooth"
      });
    }
  }, [viewingMoveIndex]);

  useEffect(() => {
    if (moveHistoryContainerRef.current && viewingMoveIndex === -1) {
      moveHistoryContainerRef.current.scrollTop = moveHistoryContainerRef.current.scrollHeight;
    }
  }, [moveHistory, viewingMoveIndex]);

  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  useEffect(() => {
    addLog("Engine initialized. Challenge accepted.", "system");
    recalculateEvaluation();
  }, []);

  const playSynthesizedSound = (type: "move" | "capture" | "wrong" | "success" | "thinking") => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);

      if (type === "move") {
        osc.type = "sine"; osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(); osc.stop(ctx.currentTime + 0.11);
      } else if (type === "capture") {
        osc.type = "triangle"; osc.frequency.setValueAtTime(350, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(); osc.stop(ctx.currentTime + 0.16);
      } else if (type === "wrong") {
        osc.type = "sawtooth"; osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.12, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(); osc.stop(ctx.currentTime + 0.26);
      } else if (type === "success") {
        osc.type = "sine"; osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
        osc.start(); osc.stop(ctx.currentTime + 1.0);
      }
    } catch (e) {}
  };

  const getRatingByLevel = (level: number) => {
    switch (level) {
      case 1: return "800";
      case 2: return "1200";
      case 3: return "1600";
      case 4: return "2000";
      case 5: return "2400";
    }
  };

  const calculateBoardScore = (chessInstance: Chess): number => {
    let score = 0; const b = chessInstance.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = b[r][c];
        if (sq) {
          let w = 0, t = [] as number[];
          switch (sq.type) {
            case "p": w = 100; t = pawnPST; break;
            case "n": w = 320; t = knightPST; break;
            case "b": w = 330; t = bishopPST; break;
            case "r": w = 500; t = rookPST; break;
            case "q": w = 900; t = queenPST; break;
            case "k": w = 20000; t = kingPST; break;
          }
          let bonus = 0;
          if (t.length) bonus = sq.color === "b" ? t[(7 - r) * 8 + c] : t[r * 8 + c];
          score += sq.color === "w" ? w + bonus : -(w + bonus);
        }
      }
    }
    return score;
  };

  const recalculateEvaluation = () => {
    const rawVal = calculateBoardScore(chess);
    setEvalScore(parseFloat((rawVal / 100).toFixed(1)));
  };

  const getMinimaxMove = (chessInstance: Chess, depth: number) => {
    const search = (tc: Chess, d: number, a: number, b: number, isMax: boolean): number => {
      if (d === 0 || tc.isGameOver()) {
        if (tc.isGameOver()) return tc.isCheckmate() ? (tc.turn() === "b" ? 100000+d : -100000-d) : 0;
        return calculateBoardScore(tc);
      }
      const moves = tc.moves({ verbose: true }).sort((x, y) => (y.captured?10:0) - (x.captured?10:0));
      if (isMax) {
        let maxE = -Infinity;
        for (const m of moves) { tc.move(m); maxE = Math.max(maxE, search(tc, d-1, a, b, false)); tc.undo(); a = Math.max(a, maxE); if (b <= a) break; }
        return maxE;
      } else {
        let minE = Infinity;
        for (const m of moves) { tc.move(m); minE = Math.min(minE, search(tc, d-1, a, b, true)); tc.undo(); b = Math.min(b, minE); if (b <= a) break; }
        return minE;
      }
    };
    const moves = chessInstance.moves({ verbose: true });
    if (!moves.length) return { score: 0, bestMove: null };
    let best = moves[0], bestScore = chessInstance.turn() === "w" ? -Infinity : Infinity;
    let a = -Infinity, b = Infinity;
    for (const m of moves) {
      chessInstance.move(m); const s = search(chessInstance, depth - 1, a, b, chessInstance.turn() === "w"); chessInstance.undo();
      if (chessInstance.turn() === "w") { if (s > bestScore) { bestScore = s; best = m; } a = Math.max(a, s); }
      else { if (s < bestScore) { bestScore = s; best = m; } b = Math.min(b, s); }
    }
    return { score: bestScore, bestMove: best };
  };

  const triggerEngineMove = () => {
    if (chess.isGameOver()) return;
    setIsThinking(true);
    setTimeout(() => {
      try {
        const moves = chess.moves({ verbose: true });
        if (!moves.length) return setIsThinking(false);

        let chosen: any = null;
        if (difficultyLevel === 1 && Math.random() < 0.4) {
          chosen = moves[Math.floor(Math.random() * moves.length)];
        } else {
          const depth = difficultyLevel >= 4 ? 3 : difficultyLevel === 3 ? 2 : 1;
          chosen = getMinimaxMove(chess, depth).bestMove;
        }

        if (chosen) {
          const executed = chess.move(chosen);
          addLog(`Engine played ${executed.san}`, "engine");
          setBoard(chess.board()); setFen(chess.fen());
          setGameHistory(p => [...p, chess.fen()]); setMoveHistory(chess.history());
          recalculateEvaluation();
          playSynthesizedSound(executed.captured ? "capture" : "move");
          setHintFrom(null); setHintTo(null);
          checkGameOver();
        }
      } finally { setIsThinking(false); }
    }, 400);
  };

  const checkGameOver = () => {
    if (chess.isGameOver()) {
      if (chess.isCheckmate()) {
        const winnerStr = chess.turn() === "w" ? "Black" : "White";
        setCheckmateData({ winner: winnerStr });
        addLog(`Checkmate! Winner: ${winnerStr}`, "success");
        playSynthesizedSound("success");
      } else {
        addLog(`Game Drawn.`, "warning");
        playSynthesizedSound("wrong");
      }
    }
  };

  const executeUserMove = (from: string, to: string) => {
    if (isThinking || chess.isGameOver()) return;
    try {
      const activePiece = chess.get(from as any);
      if (!activePiece || activePiece.color !== "w") throw new Error();
      const executed = chess.move({ from, to, promotion: (activePiece.type === "p" && (to.endsWith("8") || to.endsWith("1"))) ? "q" : undefined });
      addLog(`You played ${executed.san}`, "user");
      setBoard(chess.board()); setFen(chess.fen());
      setGameHistory(p => [...p, chess.fen()]); setMoveHistory(chess.history());
      recalculateEvaluation();
      playSynthesizedSound(executed.captured ? "capture" : "move");
      setSelectedSquare(null); setLegalMoves([]); setHintFrom(null); setHintTo(null);
      if (!chess.isGameOver()) triggerEngineMove();
      else checkGameOver();
    } catch {
      playSynthesizedSound("wrong");
      setIsShake(true); setTimeout(() => setIsShake(false), 500);
      setSelectedSquare(null); setLegalMoves([]);
    }
  };

  const handleSquareClick = (square: string) => {
    if (isThinking || chess.isGameOver() || viewingMoveIndex !== -1) return;
    const piece = chess.get(square as any);
    if (!selectedSquare) {
      if (piece && piece.color === "w") {
        setSelectedSquare(square);
        if (showDestinations) setLegalMoves(chess.moves({ square: square as any, verbose: true }).map(m => m.to));
      }
    } else {
      if (selectedSquare === square) { setSelectedSquare(null); setLegalMoves([]); }
      else if (piece && piece.color === "w") {
        setSelectedSquare(square);
        if (showDestinations) setLegalMoves(chess.moves({ square: square as any, verbose: true }).map(m => m.to));
      } else executeUserMove(selectedSquare, square);
    }
  };

  const handleDragStart = (e: React.DragEvent, square: string) => {
    if (isThinking || chess.isGameOver() || viewingMoveIndex !== -1) { e.preventDefault(); return; }
    const piece = chess.get(square as any);
    if (piece && piece.color === "w") {
      setDraggedSquare(square); setSelectedSquare(square);
      if (showDestinations) setLegalMoves(chess.moves({ square: square as any, verbose: true }).map(m => m.to));
    } else e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent, targetSquare: string) => {
    e.preventDefault();
    if (draggedSquare && draggedSquare !== targetSquare) executeUserMove(draggedSquare, targetSquare);
    setDraggedSquare(null);
  };

  const handleResignAndReset = () => {
    chess.reset(); setBoard(chess.board()); setFen(chess.fen());
    setGameHistory([]); setMoveHistory([]); setViewingMoveIndex(-1);
    setSelectedSquare(null); setLegalMoves([]); setHintFrom(null); setHintTo(null);
    setIsThinking(false); setCheckmateData(null); recalculateEvaluation();
    addLog("Game resigned & reset.", "warning");
    playSynthesizedSound("wrong");
  };

  const handleUndoMove = () => {
    if (isThinking || gameHistory.length < 2) return;
    chess.undo(); chess.undo();
    setBoard(chess.board()); setFen(chess.fen());
    setGameHistory(p => p.slice(0, -2)); setMoveHistory(chess.history());
    setViewingMoveIndex(-1); setSelectedSquare(null); setLegalMoves([]); setHintFrom(null); setHintTo(null);
    setCheckmateData(null); recalculateEvaluation();
    addLog("Undid last move.", "system");
    playSynthesizedSound("move");
  };

  const handleEngineHint = () => {
    if (isThinking || chess.isGameOver()) return;
    const res = getMinimaxMove(chess, 3);
    if (res.bestMove) {
      setHintFrom(res.bestMove.from); setHintTo(res.bestMove.to);
      addLog(`Hint: Try ${res.bestMove.san}`, "system");
      playSynthesizedSound("success");
    }
  };

  const renderPiece = (type: string, color: "w" | "b", isFallen: boolean = false) => {
    const cls = `w-[85%] h-[85%] z-20 pointer-events-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] transition-transform duration-500 ease-out ${isFallen ? "rotate-90 scale-90 translate-y-2 opacity-80" : ""}`;
    switch (type) {
      case "p": return <Pawn color={color} className={cls} />;
      case "r": return <Rook color={color} className={cls} />;
      case "n": return <Knight color={color} className={cls} />;
      case "b": return <Bishop color={color} className={cls} />;
      case "q": return <Queen color={color} className={cls} />;
      case "k": return <King color={color} className={cls} />;
      default: return null;
    }
  };

  const clampedEval = Math.max(-10, Math.min(10, evalScore));
  const barPercent = 50 + (clampedEval / 10) * 45;

  const getMovePairs = (list: string[]) => {
    const p = [];
    for (let i = 0; i < list.length; i += 2) p.push({ round: Math.floor(i / 2) + 1, w: list[i], b: list[i + 1], wI: i, bI: i + 1 });
    return p;
  };

  const cols = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const rows = [8, 7, 6, 5, 4, 3, 2, 1];

  return (
    <div className="w-full max-w-[1000px] mx-auto flex flex-col gap-6">

      {/* CHECKMATE MODAL */}
      <AnimatePresence>
        {checkmateData && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-gradient-to-b from-[#1b1f3b] to-[#121426] border border-[#393e82] rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-[#2d3159] flex items-center justify-center shadow-lg border border-[#393e82] mb-2">
                <King color={checkmateData.winner === "White" ? "w" : "b"} className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold font-display text-white tracking-tight">Checkmate!</h2>
              <p className="text-slate-300 font-medium text-lg">
                <span className={checkmateData.winner === "White" ? "text-cyan-400 font-bold" : "text-red-400 font-bold"}>{checkmateData.winner}</span> takes the victory.
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setCheckmateData(null); handleResignAndReset(); }}
                className="mt-4 w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all border border-blue-400/50 group"
              >
                <motion.div
                  className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  initial={{ x: "-150%" }}
                  animate={{ x: "150%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                    repeatDelay: 1.5
                  }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Play Again
                </span>
              </motion.button>
              {checkmateData.winner !== "White" && (
                <button onClick={() => { setCheckmateData(null); handleUndoMove(); }} className="text-xs text-slate-400 hover:text-white mt-1 transition-colors font-semibold">
                  Undo last move instead
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP SECTION: Board & Move History */}
      <div className="flex flex-col md:flex-row gap-6">

        {/* Left Side: Eval Bar + Chessboard */}
        <div className="flex-1 max-w-[600px] flex items-stretch gap-3 md:gap-4 mx-auto w-full">
          {/* Evaluation Bar */}
          <div className="relative w-6 md:w-8 bg-[#0c101d] border border-slate-700/50 rounded-xl overflow-hidden flex flex-col justify-end shadow-inner">
            <div className="w-full bg-slate-300 transition-all duration-700" style={{ height: `${barPercent}%` }} />
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-slate-500/50 z-10" />
            <div className="absolute inset-x-0 bottom-2 flex justify-center z-20">
              <span className="text-[9px] font-mono font-bold bg-[#0c101d] text-white px-1 py-0.5 rounded border border-slate-700">
                {evalScore > 0 ? `+${evalScore}` : evalScore}
              </span>
            </div>
          </div>

          {/* Wooden Chess Board */}
          <motion.div animate={isShake ? { x: [-5, 5, -3, 3, 0] } : {}} transition={{ duration: 0.3 }} className="relative flex-1 aspect-square bg-[#101424] rounded-lg p-1.5 md:p-2 shadow-2xl border border-slate-700/60 overflow-hidden">
            <div className="relative w-full h-full grid grid-cols-8 grid-rows-8 gap-0 rounded-sm border border-[#6b4724] overflow-hidden select-none">
              {rows.map((r) => cols.map((c) => {
                const sq = `${c}${r}`;
                const rI = 8 - r; const cI = cols.indexOf(c);
                const piece = activeBoard[rI]?.[cI];
                const isDark = (cI + r) % 2 === 0;

                return (
                  <div
                    key={sq}
                    onClick={() => handleSquareClick(sq)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, sq)}
                    className={`relative flex items-center justify-center cursor-pointer transition-all duration-200
                      ${isDark ? "bg-[#966f4b] hover:bg-[#a67d53]" : "bg-[#e6cca7] hover:bg-[#ebd5b6]"}
                    `}
                  >
                    {c === "a" && <span className={`absolute top-0.5 left-1 text-[9px] font-semibold pointer-events-none ${isDark ? "text-[#e6cca7]/80" : "text-[#966f4b]/80"}`}>{r}</span>}
                    {r === 1 && <span className={`absolute bottom-0 right-1 text-[9px] font-semibold pointer-events-none ${isDark ? "text-[#e6cca7]/80" : "text-[#966f4b]/80"}`}>{c}</span>}

                    {activeKingInCheckSq === sq && (
                      <div className="absolute inset-0 bg-red-600/50 border-2 border-red-500 z-10 pointer-events-none shadow-[inset_0_0_20px_rgba(220,38,38,0.7)] animate-pulse" />
                    )}

                    {selectedSquare === sq && <div className="absolute inset-0 bg-blue-500/30 border-2 border-blue-400 z-10 pointer-events-none" />}
                    {hintFrom === sq && <div className="absolute inset-0 bg-yellow-400/40 border-2 border-yellow-400/80 z-10 pointer-events-none" />}
                    {hintTo === sq && <div className="absolute inset-0 bg-cyan-400/30 border-2 border-cyan-400/80 z-10 pointer-events-none" />}
                    {legalMoves.includes(sq) && <div className="absolute w-3.5 h-3.5 rounded-full bg-black/20 z-10 pointer-events-none" />}

                    {piece && (
                      <div draggable={!isThinking && piece.color === "w" && viewingMoveIndex === -1} onDragStart={(e) => handleDragStart(e, sq)} className="w-full h-full flex items-center justify-center relative cursor-grab active:cursor-grabbing">
                        {renderPiece(piece.type, piece.color, activeIsCheckmate && sq === activeKingInCheckSq)}
                      </div>
                    )}
                  </div>
                );
              }))}
            </div>
          </motion.div>
        </div>

        {/* Right Side: Move History Block */}
        <div className="w-full md:w-[280px] lg:w-[320px] flex flex-col">
          <div className="flex-1 min-h-[300px] bg-[#141629] rounded-xl border border-[#2a2f4c] flex flex-col overflow-hidden shadow-xl">
            <div className="p-3 border-b border-[#2a2f4c] flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2"><HistoryIcon className="w-4 h-4"/> Match Log</span>
            </div>

            <div ref={moveHistoryContainerRef} className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-[#2a2f4c]">
              {moveHistory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center">
                  <p className="text-xs text-slate-500 max-w-[200px]">No moves yet. Make a move on the board.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {getMovePairs(moveHistory).map(p => (
                    <div key={p.round} className="flex text-xs items-stretch rounded hover:bg-[#1f223a] transition-colors">
                      <div className="w-9 flex items-center justify-center text-slate-500 font-mono py-1.5 font-bold">{p.round}.</div>
                      <button
                        ref={viewingMoveIndex === p.wI ? activeMoveRef : null}
                        onClick={() => setViewingMoveIndex(p.wI)}
                        className={`flex-1 text-left px-3 py-1.5 font-mono font-semibold transition-all ${viewingMoveIndex === p.wI ? "bg-[#353965] text-white rounded shadow-sm" : "text-slate-300"}`}
                      >
                        {p.w}
                      </button>
                      {p.b ? (
                        <button
                          ref={viewingMoveIndex === p.bI ? activeMoveRef : null}
                          onClick={() => setViewingMoveIndex(p.bI)}
                          className={`flex-1 text-left px-3 py-1.5 font-mono font-semibold transition-all ${viewingMoveIndex === p.bI ? "bg-[#353965] text-white rounded shadow-sm" : "text-slate-300"}`}
                        >
                          {p.b}
                        </button>
                      ) : <div className="flex-1" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Replay Controls Footer */}
            {moveHistory.length > 0 && (
              <div className="border-t border-[#2a2f4c] p-2 flex items-center justify-center gap-2 bg-[#0e101f]">
                <button onClick={() => setViewingMoveIndex(-2)} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-[#2a2f4c]"><ChevronsLeft className="w-4 h-4" /></button>
                <button onClick={handleStepPrev} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-[#2a2f4c]"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={handleStepNext} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-[#2a2f4c]"><ChevronRight className="w-4 h-4" /></button>
                <button onClick={() => setViewingMoveIndex(-1)} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-[#2a2f4c]"><ChevronsRight className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM DASHBOARD: Calibration, Telemetry, Configs */}
      <div className="flex flex-col gap-6 mt-4">

        {/* ROW 1: Calibration & Telemetry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Calibration Deck */}
          <div className="bg-[#191b2c] border border-[#2a2f4c] rounded-2xl p-5 md:p-6 shadow-xl flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold tracking-widest text-white uppercase">Calibration Deck</h3>
              <span className="text-[10px] font-bold bg-[#333a69] text-blue-200 border border-[#485392] px-3 py-1 rounded-md uppercase tracking-wider">
                {viewingMoveIndex !== -1 ? "Replay" : (chess.turn() === "w" ? "Your Move" : "Engine Move")}
              </span>
            </div>

            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Engine Difficulty Constraints</h4>

            <div className="flex gap-3 mb-4">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => { setDifficultyLevel(lvl as any); addLog(`Difficulty changed to ${lvl}.`, "system"); }}
                  className={`flex-1 flex flex-col items-center py-3 rounded-xl border transition-all
                    ${difficultyLevel === lvl
                      ? "bg-[#2d3159] border-[#5a62b3] text-white shadow-lg"
                      : "bg-[#202540]/60 border-[#2a2f4c] text-slate-400 hover:bg-[#282d4d]"}`}
                >
                  <span className="text-lg font-bold leading-none">{lvl}</span>
                  <span className="text-[9px] mt-1.5 opacity-70 font-mono tracking-wider">{getRatingByLevel(lvl)}</span>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 text-center mt-auto">Higher levels increase search depth. Level 4-5 may take longer to compute.</p>
          </div>

          {/* Engine Telemetry */}
          <div className="bg-[#0e101b] border border-[#2a2f4c] rounded-2xl p-5 md:p-6 shadow-xl flex flex-col h-[220px]">
            <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="text-emerald-500 font-extrabold">{'>_'}</span> Engine Telemetry
            </h3>

            <div ref={terminalContainerRef} className="border-t border-[#2a2f4c] pt-4 flex-1 overflow-y-auto font-mono text-[11px] space-y-2 scrollbar-thin scrollbar-thumb-[#2a2f4c]">
              {terminalLogs.map(log => {
                let colorClass = "text-slate-300";
                if (log.type === "engine") colorClass = "text-red-400";
                else if (log.type === "user") colorClass = "text-cyan-400";
                else if (log.type === "success") colorClass = "text-emerald-400 font-bold";
                else if (log.type === "warning") colorClass = "text-yellow-400";

                return (
                  <div key={log.id} className={colorClass}>
                    <span className="text-slate-600 mr-2">[{log.timestamp}]</span>
                    <span className="text-slate-500 mr-1">{'>'}</span>
                    {log.message}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ROW 2: Tactical Actions & Configs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Tactical Actions */}
          <div className="bg-[#191b2c] border border-[#2a2f4c] rounded-2xl p-5 md:p-6 shadow-xl flex flex-col gap-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tactical Actions</h4>

            <button onClick={handleUndoMove} disabled={isThinking || gameHistory.length < 2} className="flex justify-between items-center w-full bg-[#1b1e32] border border-[#2a2f4c] text-slate-300 px-4 py-3.5 rounded-xl hover:bg-[#242842] transition-colors disabled:opacity-50">
               <span className="text-sm font-semibold">Undo Move</span>
               <Undo2 className="w-4 h-4 text-slate-500" />
            </button>

            <button onClick={handleEngineHint} disabled={isThinking || chess.isGameOver()} className="flex justify-between items-center w-full bg-[#1f224a] border border-[#393e82] text-blue-200 px-4 py-3.5 rounded-xl hover:bg-[#262a5c] transition-colors disabled:opacity-50">
               <span className="text-sm font-semibold">Engine Hint</span>
               <HelpCircle className="w-4 h-4 text-blue-400" />
            </button>

            <button onClick={handleResignAndReset} className="flex justify-between items-center w-full bg-[#361e27] border border-[#5c2a38] text-red-200 px-4 py-3.5 rounded-xl hover:bg-[#472632] transition-colors">
               <span className="text-sm font-semibold">Resign & Reset</span>
               <RotateCcw className="w-4 h-4 text-red-400" />
            </button>
          </div>

          {/* Configs & Export */}
          <div className="bg-[#191b2c] border border-[#2a2f4c] rounded-2xl p-5 md:p-6 shadow-xl flex flex-col gap-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Configs & Export</h4>

            <button onClick={() => setSoundEnabled(!soundEnabled)} className="flex justify-between items-center w-full bg-[#1b1e32] border border-[#2a2f4c] text-slate-300 px-4 py-3.5 rounded-xl hover:bg-[#242842] transition-colors">
               <span className="text-sm font-semibold">Sound FX</span>
               {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <button onClick={() => setShowDestinations(!showDestinations)} className="flex justify-between items-center w-full bg-[#1b1e32] border border-[#2a2f4c] text-slate-300 px-4 py-3.5 rounded-xl hover:bg-[#242842] transition-colors">
               <span className="text-sm font-semibold">Destinations</span>
               {showDestinations ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
            </button>

            <button onClick={() => { navigator.clipboard.writeText(fen); setCopiedFen(true); setTimeout(()=>setCopiedFen(false),2000); }} className="flex justify-between items-center w-full bg-[#1b1e32] border border-[#2a2f4c] text-slate-300 px-4 py-3.5 rounded-xl hover:bg-[#242842] transition-colors">
               <span className="text-sm font-semibold">{copiedFen ? "Copied!" : "Copy FEN"}</span>
               {copiedFen ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-500" />}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
