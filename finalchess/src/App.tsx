import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Chess } from "chess.js";
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Menu,
  X,
  Send,
  Github,
  Twitter,
  ArrowRight,
  BarChart3,
  Users,
  Settings,
  Youtube,
  DollarSign
} from "lucide-react";
import {
  getBoardStateAtPly,
  BoardState,
  PUZZLE_STEPS,
  EVERGREEN_PLAY_LIST,
  EVERGREEN_GAME,
  EVERGREEN_PUZZLE_START_PLY,
} from "./data/evergreen";
import { ChessBoard } from "./components/ChessBoard";
import { B2BSection } from "./components/B2BSection";
import { PlayComputerDashboard } from "./components/PlayComputerDashboard";
import { FloatingChessBg } from "./components/FloatingChessBg";

// Custom Chess Pieces for large decoration
import { Knight as KnightIcon } from "./components/ChessPieces";

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [muted, setMuted] = useState(false);

  const playSound = (type: "move" | "capture" | "wrong" | "success") => {
    if (muted) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "move") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.09);
      } else if (type === "capture") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.13);
      } else if (type === "wrong") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.26);
      } else if (type === "success") {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.8);

        osc2.type = "sine";
        osc2.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        gain2.gain.setValueAtTime(0.1, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.8);

        osc.start();
        osc2.start();
        osc.stop(ctx.currentTime + 0.8);
        osc2.stop(ctx.currentTime + 0.8);
      }
    } catch (e) {}
  };

  const [puzzleStep, setPuzzleStep] = useState(0);
  const [puzzleBoard, setPuzzleBoard] = useState<BoardState>({});
  const [puzzleChess, setPuzzleChess] = useState<Chess>(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [isWrongMove, setIsWrongMove] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isReplayingFull, setIsReplayingFull] = useState(false);
  const [replayPly, setReplayPly] = useState(0);

  const initPuzzle = () => {
    setPuzzleStep(0);
    setIsReplayingFull(false);
    setPuzzleBoard(getBoardStateAtPly(EVERGREEN_PUZZLE_START_PLY));

    const tempChess = new Chess();
    for (let i = 0; i < EVERGREEN_PUZZLE_START_PLY; i++) {
      if (i < EVERGREEN_PLAY_LIST.length) {
        const mv = EVERGREEN_PLAY_LIST[i].moveLabel.replace(/^\d+\.+\s*/, "").replace(/[!?]/g, "");
        try { tempChess.move(mv); } catch (e) {}
      }
    }
    setPuzzleChess(tempChess);
    setSelectedSquare(null);
    setLegalMoves([]);
    setIsWrongMove(false);
    setIsThinking(false);
  };

  useEffect(() => {
    initPuzzle();
  }, []);

  useEffect(() => {
    let timer: any;
    if (isReplayingFull) {
      timer = setInterval(() => {
        setReplayPly((prev) => {
          if (prev >= EVERGREEN_PLAY_LIST.length) {
            setIsReplayingFull(false);
            return prev;
          }
          playSound("move");
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isReplayingFull]);

  const handleSquareSelection = (sq: string | null) => {
    setSelectedSquare(sq);
    if (sq && !isReplayingFull) setLegalMoves(puzzleChess.moves({ square: sq as any, verbose: true }).map((m) => m.to));
    else setLegalMoves([]);
  };

  const handleMoveAttempt = (from: string, to: string) => {
    if (isThinking || puzzleStep >= PUZZLE_STEPS.length || isReplayingFull) return;
    const currentStepDef = PUZZLE_STEPS[puzzleStep];

    if (from === currentStepDef.correctMove.from && to === currentStepDef.correctMove.to) {
      const isCapturing = puzzleBoard[to] !== null;
      playSound(isCapturing ? "capture" : "move");
      try { puzzleChess.move({ from, to, promotion: "q" }); } catch (e) {}

      const updatedBoard = { ...puzzleBoard };
      updatedBoard[to] = updatedBoard[from];
      updatedBoard[from] = null;
      setPuzzleBoard(updatedBoard);
      handleSquareSelection(null);

      if (currentStepDef.blackReply) {
        setIsThinking(true);
        setTimeout(() => {
          playSound("capture");
          try { puzzleChess.move({ from: currentStepDef.blackReply!.from, to: currentStepDef.blackReply!.to, promotion: "q" }); } catch (e) {}
          const finalStepBoard = { ...updatedBoard };
          Object.entries(currentStepDef.blackReply!.changes).forEach(([sq, piece]) => { finalStepBoard[sq] = piece; });
          setPuzzleBoard(finalStepBoard);
          setPuzzleStep((prev) => prev + 1);
          setIsThinking(false);
        }, 1000);
      } else {
        playSound("success");
        setPuzzleStep(PUZZLE_STEPS.length);
      }
    } else {
      playSound("wrong");
      setIsWrongMove(true);
      handleSquareSelection(null);
      setTimeout(() => setIsWrongMove(false), 500);
    }
  };

  const currentBoard = isReplayingFull ? getBoardStateAtPly(replayPly) : puzzleBoard;
  const correctFrom = !isReplayingFull && puzzleStep < PUZZLE_STEPS.length ? PUZZLE_STEPS[puzzleStep].correctMove.from : undefined;
  const correctTo = !isReplayingFull && puzzleStep < PUZZLE_STEPS.length ? PUZZLE_STEPS[puzzleStep].correctMove.to : undefined;

  const puzzleIsCheck = !isReplayingFull && puzzleChess.isCheck();
  const puzzleIsCheckmate = !isReplayingFull && puzzleChess.isCheckmate();
  const puzzleKingInCheckSq = React.useMemo(() => {
    if (!puzzleIsCheck && !puzzleIsCheckmate) return null;
    const turn = puzzleChess.turn();
    const b = puzzleChess.board();
    const cols = ["a", "b", "c", "d", "e", "f", "g", "h"];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = b[r][c];
        if (p && p.type === "k" && p.color === turn) return `${cols[c]}${8 - r}`;
      }
    }
    return null;
  }, [puzzleIsCheck, puzzleIsCheckmate, puzzleChess, puzzleBoard]);

  useEffect(() => {
    (window as any).render_game_to_text = () => JSON.stringify({
      mode: isReplayingFull ? "replay" : "puzzle",
      game: EVERGREEN_GAME,
      puzzleStep,
      status: puzzleStep === PUZZLE_STEPS.length ? "checkmate" : isThinking ? "black-reply-pending" : "white-to-move",
      selectedSquare,
      legalMoves,
      correctMove: puzzleStep < PUZZLE_STEPS.length ? PUZZLE_STEPS[puzzleStep].correctMove : null,
      pieces: (Object.entries(currentBoard) as [string, BoardState[string]][]).flatMap(([square, piece]) =>
        piece ? [{ square, type: piece.type, color: piece.color }] : []
      ),
    });
    (window as any).advanceTime = () => {};
  }, [currentBoard, isReplayingFull, puzzleStep, isThinking, selectedSquare, legalMoves]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-[#070b19] text-white font-sans overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-200 scroll-smooth">
      <FloatingChessBg />

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 md:px-8 py-5 flex items-center justify-between border-b border-white/5 bg-[#070b19]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-8 h-8 flex items-center justify-center">
            <KnightIcon color="w" className="w-full h-full text-blue-500" />
          </div>
          <div className="text-xl font-bold font-display tracking-tight text-white flex flex-col">
            XLCHESS
            <span className="text-[9px] font-medium text-slate-400 tracking-widest mt-[-2px]">— Excel at Chess —</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => { setMuted(!muted); playSound("move"); }} className="p-2 text-slate-400 hover:text-white transition-colors">
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 md:hidden text-slate-400 hover:text-white">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="md:hidden fixed top-[75px] left-0 right-0 bg-[#0c101d] border-b border-white/5 p-4 z-40 shadow-2xl flex flex-col gap-4">
            <button onClick={() => scrollToSection('hero')} className="text-left font-semibold text-slate-300">Home</button>
            <button onClick={() => scrollToSection('b2b')} className="text-left font-semibold text-slate-300">Platform</button>
            <button onClick={() => scrollToSection('computer')} className="text-left font-semibold text-slate-300">Play</button>
            <button onClick={() => scrollToSection('contact')} className="text-left font-semibold text-slate-300">Contact</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full mx-auto pt-28">

        {/* ================= HERO SECTION ================= */}
        <section id="hero" className="w-full max-w-7xl mx-auto px-4 md:px-8 py-10 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left: Text & CTA */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-extrabold font-display leading-[1.1] tracking-tight">
                Build the Future of <br/>
                <span className="text-[#8492ff]">Online Chess</span>
              </h1>

              <div className="space-y-4 max-w-md">
                <p className="text-lg font-medium text-slate-200">
                  Making the Best Move on the Way to the Top
                </p>
                <p className="text-slate-400 leading-relaxed text-sm">
                  A complete chess platform to play, learn, compete, and grow—built to become the world's #1 destination for chess.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection('computer')}
                className="group relative overflow-hidden flex items-center justify-center gap-3 bg-gradient-to-r from-[#707cff] via-[#8a94ff] to-[#707cff] bg-[length:200%_auto] hover:bg-right text-white px-8 py-4 rounded-xl font-bold shadow-[0_0_40px_rgba(112,124,255,0.4)] hover:shadow-[0_0_60px_rgba(112,124,255,0.6)] transition-all duration-500 w-full sm:w-auto cursor-pointer"
              >
                <motion.div
                  className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  initial={{ x: "-150%" }}
                  animate={{ x: "150%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                    repeatDelay: 1
                  }}
                />
                <span className="relative z-10 flex items-center gap-3">
                  <motion.span
                    className="text-2xl leading-none drop-shadow-lg"
                    initial={{ rotate: 0 }}
                    whileHover={{
                      rotate: [-15, 15, -10, 10, 0],
                      transition: { duration: 0.5 }
                    }}
                  >
                    ♟
                  </motion.span>
                  <span className="text-lg tracking-wider uppercase font-display">Play Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
                </span>
              </motion.button>
            </div>

            {/* Right: Default Board Game (Evergreen Puzzle) */}
            <div className="w-full max-w-md mx-auto lg:ml-auto">
              <motion.div animate={isWrongMove ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}} className="bg-[#13172b] p-4 rounded-2xl shadow-2xl border border-white/5">
                <ChessBoard
                  board={currentBoard}
                  onMoveAttempt={handleMoveAttempt}
                  interactive={!isReplayingFull && !isThinking}
                  selectedSquare={selectedSquare}
                  setSelectedSquare={handleSquareSelection}
                  correctFrom={correctFrom}
                  correctTo={correctTo}
                  legalMoves={isReplayingFull ? [] : legalMoves}
                  kingInCheckSquare={puzzleKingInCheckSq}
                  isCheckmate={puzzleIsCheckmate}
                />

                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center px-1">
                    <div>
                      <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400">{EVERGREEN_GAME.title}</div>
                      <div className="text-[10px] text-slate-500">{EVERGREEN_GAME.label}</div>
                      <div className="text-sm font-semibold mt-0.5">{puzzleStep === PUZZLE_STEPS.length ? "Checkmate!" : "White to move."}</div>
                    </div>
                    <div className="text-center bg-[#1d2238] rounded px-3 py-1.5 border border-slate-700/50">
                      <div className="text-sm font-bold text-blue-400">{isReplayingFull ? "-" : PUZZLE_STEPS.length - puzzleStep}</div>
                      <div className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Moves Left</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={initPuzzle} className="flex-1 flex justify-center items-center gap-2 text-xs font-semibold bg-white/5 hover:bg-white/10 py-2.5 rounded-lg transition-colors text-slate-300">
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Puzzle
                    </button>
                    <button onClick={() => { setIsReplayingFull(true); setReplayPly(0); }} className="flex-1 flex justify-center items-center gap-2 text-xs font-semibold bg-white/5 hover:bg-white/10 py-2.5 rounded-lg transition-colors text-slate-300">
                      <Play className="w-3.5 h-3.5" /> Replay Full Game
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <B2BSection />

        {/* ================= B2B SECTION ================= */}
        <section id="b2b-old" className="hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left: Text */}
            <div className="space-y-6 order-2 lg:order-1">
              <h2 className="text-4xl md:text-5xl font-extrabold font-display leading-tight tracking-tight">
                Build More Than <br/>
                <span className="text-[#707cff]">Subscribers</span>
              </h2>

              <div className="space-y-4 max-w-md">
                <p className="text-slate-300 font-medium">
                  You've already done the hard part: building an audience.
                </p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Now build a platform around your brand that grows with you. Integrate our white-label chess engine, host customized tournaments, and unlock advanced player analytics.
                </p>
              </div>

              <button className="flex items-center gap-2 bg-[#707cff] hover:bg-[#5c67e6] text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-[#707cff]/20 transition-all cursor-pointer">
                Build Your Platform <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Mock Dashboard Graphic */}
            <div className="order-1 lg:order-2 w-full max-w-lg mx-auto relative">
              <div className="absolute inset-0 bg-[#707cff]/10 blur-[80px] rounded-full z-0 pointer-events-none" />

              {/* Dashboard Container */}
              <div className="relative z-10 bg-[#13172b] border border-[#707cff]/20 rounded-xl p-5 shadow-2xl overflow-hidden shadow-[#707cff]/10">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
                  <div className="w-6 h-6 rounded bg-red-500 flex items-center justify-center">
                    <Youtube className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold tracking-wide text-white">YOUR BRAND</span>
                </div>

                <div className="flex gap-4">
                  {/* Sidebar menu */}
                  <div className="w-24 space-y-2">
                    <div className="bg-[#707cff]/20 text-[#707cff] text-[10px] font-semibold py-1.5 px-2 rounded flex items-center gap-2"><BarChart3 className="w-3 h-3"/> Overview</div>
                    <div className="text-slate-400 hover:text-white text-[10px] py-1.5 px-2 rounded flex items-center gap-2"><Users className="w-3 h-3"/> Audience</div>
                    <div className="text-slate-400 hover:text-white text-[10px] py-1.5 px-2 rounded flex items-center gap-2"><DollarSign className="w-3 h-3"/> Revenue</div>
                    <div className="text-slate-400 hover:text-white text-[10px] py-1.5 px-2 rounded flex items-center gap-2"><Settings className="w-3 h-3"/> Settings</div>
                  </div>

                  {/* Main stats area */}
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white/5 rounded-lg p-2.5">
                        <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Subscribers</div>
                        <div className="text-lg font-bold text-white leading-none">145,231</div>
                        <div className="text-[9px] text-emerald-400 mt-1">↑ 12.5%</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2.5">
                        <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Revenue</div>
                        <div className="text-lg font-bold text-white leading-none">$24,560</div>
                        <div className="text-[9px] text-emerald-400 mt-1">↑ 18.3%</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2.5">
                        <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Views</div>
                        <div className="text-lg font-bold text-white leading-none">3.2M</div>
                        <div className="text-[9px] text-emerald-400 mt-1">↑ 9.7%</div>
                      </div>
                    </div>

                    {/* Mock Graph */}
                    <div className="bg-white/5 rounded-lg p-3 h-24 flex items-end relative overflow-hidden">
                       <div className="text-[10px] font-semibold absolute top-2 left-3">Revenue Overview</div>
                       <svg className="w-full h-12" viewBox="0 0 100 30" preserveAspectRatio="none">
                         <path d="M0,30 L0,20 Q10,15 20,22 T40,15 T60,18 T80,5 L100,0 L100,30 Z" fill="rgba(112, 124, 255, 0.2)" />
                         <path d="M0,20 Q10,15 20,22 T40,15 T60,18 T80,5 L100,0" fill="none" stroke="#707cff" strokeWidth="2" />
                       </svg>
                    </div>
                  </div>
                </div>

                {/* Decorative floating chess overlay like in image */}
                <div className="absolute -bottom-1 -left-4 w-32 opacity-70 drop-shadow-[0_0_15px_rgba(112,124,255,0.4)] pointer-events-none">
                  <div className="text-7xl">♚</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= COMPUTER GAME SECTION ================= */}
        <section id="computer" className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20">
          <PlayComputerDashboard />
        </section>

        {/* ================= CONTACT SECTION ================= */}
        <section id="contact" className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20 pb-32">
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-[#1c223a] to-[#0f1425] rounded-3xl border border-white/5 p-8 md:p-12 shadow-2xl relative overflow-hidden">

            {/* Watermark horse */}
            <div className="absolute -bottom-12 -right-12 opacity-5 pointer-events-none transform -scale-x-100">
               <KnightIcon color="w" className="w-[400px] h-[400px]" />
            </div>

            <div className="relative z-10 text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-extrabold font-display">Contact Us</h2>
            </div>

            <form className="relative z-10 space-y-5 max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Email</label>
                <input type="email" placeholder="you@example.com" className="w-full bg-[#0a0d18] border border-white/5 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#707cff]/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Message</label>
                <textarea rows={4} placeholder="Tell us how we can help you." className="w-full bg-[#0a0d18] border border-white/5 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#707cff]/50 transition-all resize-none"></textarea>
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-slate-300 hover:bg-slate-200 text-slate-900 font-bold rounded-xl px-4 py-3.5 shadow-lg transition-all mt-4 cursor-pointer">
                Send Message <Send className="w-4 h-4 text-blue-500 ml-1" />
              </button>
            </form>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="w-full bg-[#11172a] border-t border-white/5 py-8">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">

            <div className="flex flex-col items-center md:items-start gap-1">
              <div className="flex items-center gap-2">
                <KnightIcon color="w" className="w-6 h-6 text-[#707cff]" />
                <span className="text-sm font-bold font-display tracking-tight text-white uppercase">XLCHESS</span>
              </div>
              <span className="text-[7px] text-slate-500 uppercase tracking-widest pl-8">— Excel at Chess —</span>
            </div>

            <div className="text-xs text-slate-500">
              © 2026 XLChess.
            </div>

            <div className="flex gap-4 text-xs text-slate-400">
              <a href="#computer" className="hover:text-white transition-colors">Play</a>
              <span className="text-slate-700">|</span>
              <a href="#hero" className="hover:text-white transition-colors">Puzzles</a>
            </div>

          </div>
        </footer>

      </div>
    </div>
  );
}
