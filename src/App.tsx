/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Trophy,
  Github,
  ChevronDown,
  MonitorPlay,
  Menu,
  X,
} from 'lucide-react';
import { FloatingPieces } from './components/FloatingPieces';
import { EvergreenPuzzle } from './components/EvergreenPuzzle';
import { PlayVsComputer } from './components/PlayVsComputer';

export default function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-x-hidden scroll-smooth">

      {/* Skip to main content — keyboard / screen-reader first */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Floating Chess Pieces Background */}
      <FloatingPieces />

      {/* Cosmic Gradient Decorative Elements */}
      <div aria-hidden="true" className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-indigo-950/15 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/10 blur-[130px]" />
      </div>

      {/* HEADER */}
      <header className="relative z-10 w-full h-20 flex items-center px-6 sm:px-12 bg-transparent shrink-0">
        <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between">

          {/* Logo */}
          <a href="/" aria-label="XLChess — Go to homepage" className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M12 2v2"/><path d="M10 4v2"/><path d="M14 4v2"/>
              <path d="M10 6h4"/><path d="M11 6v4"/><path d="M13 6v4"/>
              <path d="M11 10h2"/><path d="M9 10h6v2H9z"/>
              <path d="M10 12v4"/><path d="M14 12v4"/>
              <path d="M9 16h6v2H9z"/><path d="M7 18h10v2H7z"/>
            </svg>
            <span className="font-bold text-xl tracking-tight">XLChess</span>
          </a>

          {/* Desktop Navigation */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#dashboard" className="hover:text-white transition-colors duration-150 flex items-center gap-2">
              <MonitorPlay aria-hidden="true" className="w-4 h-4" /> Play Computer
            </a>
            <a href="#competes" className="hover:text-white transition-colors duration-150">Competes</a>
            <a href="#pricing" className="hover:text-white transition-colors duration-150">Pricing</a>
            <a href="#developer" className="hover:text-white flex items-center gap-1 transition-colors duration-150">
              Developer <ChevronDown aria-hidden="true" className="w-4 h-4 opacity-70" />
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-150">Log in</a>
            <button className="px-5 py-2 bg-[#5ce1e6] hover:bg-[#4bcad0] text-slate-900 font-semibold rounded text-sm transition-colors duration-150">
              Sign up
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            {mobileNavOpen
              ? <X aria-hidden="true" className="w-5 h-5" />
              : <Menu aria-hidden="true" className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <div
        id="mobile-nav"
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
        className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ${mobileNavOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          aria-hidden="true"
          onClick={() => setMobileNavOpen(false)}
        />
        <nav
          aria-label="Mobile navigation"
          className={`absolute top-0 right-0 h-full w-72 bg-[#0d1526] border-l border-white/10 flex flex-col p-8 gap-6 transition-transform duration-300 ${mobileNavOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <button
            className="self-end w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close navigation menu"
            onClick={() => setMobileNavOpen(false)}
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
          <a href="#dashboard" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 text-slate-200 hover:text-white font-medium text-lg transition-colors">
            <MonitorPlay aria-hidden="true" className="w-5 h-5 text-indigo-400" /> Play Computer
          </a>
          <a href="#competes" onClick={() => setMobileNavOpen(false)} className="text-slate-200 hover:text-white font-medium text-lg transition-colors">Competes</a>
          <a href="#pricing" onClick={() => setMobileNavOpen(false)} className="text-slate-200 hover:text-white font-medium text-lg transition-colors">Pricing</a>
          <a href="#developer" onClick={() => setMobileNavOpen(false)} className="text-slate-200 hover:text-white font-medium text-lg transition-colors">Developer</a>
          <div className="mt-auto flex flex-col gap-3">
            <a href="#login" className="text-center text-sm font-medium text-slate-300 hover:text-white transition-colors border border-white/10 rounded-lg py-2.5">Log in</a>
            <button className="px-5 py-2.5 bg-[#5ce1e6] hover:bg-[#4bcad0] text-slate-900 font-semibold rounded-lg text-sm transition-colors">Sign up</button>
          </div>
        </nav>
      </div>

      {/* HERO SECTION */}
      <main
        id="main-content"
        className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-6 sm:px-12 py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        {/* LEFT COLUMN */}
        <section aria-label="Hero introduction" className="flex flex-col justify-center space-y-8">
          <div>
            <h1 className="font-extrabold text-5xl sm:text-[3.5rem] leading-[1.1] text-white mb-6 tracking-tight">
              Build the Future<br />of Online Chess
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-md">
              Making the Best Move on the Way to the Top.<br />
              A complete chess platform to play, learn, compete, and grow&#8212;built to become the world&#39;s #1 destination for chess.
            </p>
          </div>
          <div>
            <a
              href="#dashboard"
              className="inline-flex items-center gap-3 px-8 py-3 bg-[#6974FB] hover:bg-[#5661ED] text-white font-bold text-2xl rounded-2xl shadow-lg transition-all transform hover:scale-110 active:scale-95 group"
            >
              <svg
                aria-hidden="true"
                width="32"
                height="32"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="group-hover:-translate-y-1 transition-transform duration-300"
              >
                <path d="M18 40h12v-4a6 6 0 0 0-12 0v4Z" fill="#F8FAFC" stroke="#334155" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M21 36c0-6 1-12 3-12s3 6 3 12h-6Z" fill="#F8FAFC" stroke="#334155" strokeWidth="2" strokeLinejoin="round"/>
                <circle cx="24" cy="21" r="5" fill="#F8FAFC" stroke="#334155" strokeWidth="2"/>
                <path d="M12 25c0-4 3-8 7-9 2-1 5-1 8 1l5 3c2 1 4 4 4 7 0 3-3 6-7 6l-6-3" fill="#FCD34D" stroke="#92400E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 16c-2-3 2-6 5-4l2 2" fill="#FCD34D" stroke="#92400E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Play
            </a>
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <section aria-label="Interactive chess puzzle" className="flex justify-end">
          <EvergreenPuzzle />
        </section>
      </main>

      {/* GAME DASHBOARD SECTION */}
      <section id="dashboard" aria-labelledby="dashboard-heading" className="relative z-10 w-full py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 flex flex-col items-center">
          <div className="text-center mb-12">
            <h2 id="dashboard-heading" className="text-3xl font-bold text-white tracking-tight mb-4">
              Game Dashboard
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Test your skills against our advanced AI. Select your difficulty and start playing immediately.
            </p>
          </div>
          <div className="w-full flex justify-center">
            <PlayVsComputer />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 w-full py-8 bg-[#0f172a] text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy aria-hidden="true" className="w-4 h-4 text-indigo-400" />
            <span>&#169; 2026 XLChess Platform. Built for game analysis &amp; simulation states.</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#github" className="hover:text-slate-200 flex items-center gap-1.5 transition-colors">
              <Github aria-hidden="true" className="w-4 h-4" /> Github Codebase
            </a>
            <span aria-hidden="true" className="text-slate-800">|</span>
            <span className="font-mono text-[10px] text-slate-500">Sim Engine: online_v1_0_0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
