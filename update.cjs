const fs = require('fs');
const path = require('path');
const appTsxPath = path.join(__dirname, 'src/App.tsx');
let content = fs.readFileSync(appTsxPath, 'utf-8');
const lines = content.split('\n');

const startIdx = 494; // 0-indexed for 495
const endIdx = 864; // 0-indexed for 864

const newContent = `      {/* HEADER SECTION */}
      <header className="relative z-10 w-full h-20 flex items-center px-6 sm:px-12 bg-transparent shrink-0">
        <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 2v2"/><path d="M10 4v2"/><path d="M14 4v2"/><path d="M10 6h4"/><path d="M11 6v4"/><path d="M13 6v4"/><path d="M11 10h2"/><path d="M9 10h6v2H9z"/><path d="M10 12v4"/><path d="M14 12v4"/><path d="M9 16h6v2H9z"/><path d="M7 18h10v2H7z"/></svg>
            <span className="font-bold text-xl tracking-tight">XLChess</span>
          </div>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#competes" className="hover:text-white transition-colors duration-150">Competes</a>
            <a href="#pricing" className="hover:text-white transition-colors duration-150">Pricing</a>
            <a href="#developer" className="hover:text-white flex items-center gap-1 transition-colors duration-150">
              Developer <ChevronDown className="w-4 h-4 opacity-70" />
            </a>
            <a href="#products" className="hover:text-white transition-colors duration-150">Products</a>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-6">
            <a href="#login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-150">Log in</a>
            <button className="px-5 py-2 bg-[#5ce1e6] hover:bg-[#4bcad0] text-slate-900 font-semibold rounded text-sm transition-colors duration-150">
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION / MAIN APPLICATION STAGE */}
      <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-6 sm:px-12 py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* LEFT COLUMN: HERO INFORMATION PANEL */}
        <section className="flex flex-col justify-center space-y-8">
          <div>
            <h1 className="font-extrabold text-5xl sm:text-[3.5rem] leading-[1.1] text-white mb-6 tracking-tight">
              Build the Future<br />of Online Chess
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-md">
              Making the Best Move on the Way to the Top.<br />
              A complete chess platform to play, learn, compete, and grow—built to become the world's #1 destination for chess.
            </p>
          </div>

          <div>
            <button className="px-14 py-3.5 bg-gradient-to-r from-[#4bcad0] to-[#5ce1e6] text-slate-900 rounded-lg font-bold text-lg shadow-[0_0_30px_rgba(92,225,230,0.4)] hover:shadow-[0_0_40px_rgba(92,225,230,0.6)] transition-all">
              Play
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN: THE CHESSBOARD HERO DECK */}
        <section className="flex justify-end">
          <div className="w-full max-w-[500px] bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
            
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm tracking-widest text-slate-200 uppercase mb-1">
                  CAN YOU FINISH THE EVERGREEN GAME?
                </h3>
                <p className="text-sm text-slate-400">
                  White to move.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center bg-[#5ce1e6]/10 border border-[#5ce1e6]/30 rounded-lg px-3 py-1.5 min-w-[70px]">
                <span className="text-[#5ce1e6] font-bold text-lg leading-none">{Math.max(0, 4 - currentStepIndex)}</span>
                <span className="text-[#5ce1e6] text-[8px] font-bold tracking-wider uppercase mt-0.5">Moves Left</span>
              </div>
            </div>

            {/* THE CHESSBOARD COMPONENT */}
            <div className="relative rounded-lg overflow-hidden border border-white/10 bg-[#e0b080]">
              <ChessBoard
                boardState={boardState}
                onPieceMove={handlePieceMove}
                selectedSquare={selectedSquare}
                setSelectedSquare={setSelectedSquare}
                kingInCheckCoord={kingInCheck}
                shakingSquare={shakingSquare}
                mode={mode}
                activeTurn={activeTurn}
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleResetPuzzle}
                className="py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-sm font-medium border border-white/10 transition-colors"
              >
                Reset Puzzle
              </button>
              <button
                onClick={handleAutoPlay}
                disabled={isAutoPlaying || mode !== 'puzzle' || currentStepIndex === 4}
                className="py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-sm font-medium border border-white/10 transition-colors disabled:opacity-50"
              >
                Replay Full Game
              </button>
            </div>
          </div>
        </section>
      </main>`;

lines.splice(startIdx, endIdx - startIdx, newContent);
fs.writeFileSync(appTsxPath, lines.join('\n'), 'utf-8');
console.log('Layout updated.');
