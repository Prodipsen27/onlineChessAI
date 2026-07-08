import React, { useEffect, useRef, useCallback } from "react";
import {
  Pawn,
  Rook,
  Knight,
  Bishop,
  Queen,
  King,
} from "./ChessPieces";

interface FloatingPieceConfig {
  id: string;
  Component: React.ComponentType<{ color: "w" | "b"; className?: string }>;
  color: "w" | "b";
  glowColor: string;
  position: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  size: string;
  floatY: number;
  floatX: number;
  duration: number;
  rotationRange: number;
  delay: number;
  parallaxSpeed: number;
}

const pieces: FloatingPieceConfig[] = [
  {
    id: "king-top-left",
    Component: King,
    color: "w",
    glowColor: "rgba(37, 99, 235, 0.55)",
    position: { top: "8%", left: "5%" },
    size: "w-20 h-20 md:w-32 md:h-32",
    floatY: -20,
    floatX: 10,
    duration: 8,
    rotationRange: 15,
    delay: 0,
    parallaxSpeed: 30,
  },
  {
    id: "queen-top-right",
    Component: Queen,
    color: "w",
    glowColor: "rgba(34, 211, 238, 0.55)",
    position: { top: "12%", right: "8%" },
    size: "w-16 h-16 md:w-28 md:h-28",
    floatY: -15,
    floatX: -12,
    duration: 9,
    rotationRange: -12,
    delay: 1.5,
    parallaxSpeed: 45,
  },
  {
    id: "knight-mid-left",
    Component: Knight,
    color: "b",
    glowColor: "rgba(99, 102, 241, 0.55)",
    position: { top: "42%", left: "3%" },
    size: "w-24 h-24 md:w-36 md:h-36",
    floatY: -25,
    floatX: 15,
    duration: 10,
    rotationRange: 20,
    delay: 0.5,
    parallaxSpeed: -20,
  },
  {
    id: "rook-mid-right",
    Component: Rook,
    color: "w",
    glowColor: "rgba(16, 185, 129, 0.55)",
    position: { top: "35%", right: "4%" },
    size: "w-20 h-20 md:w-32 md:h-32",
    floatY: -18,
    floatX: -10,
    duration: 8.5,
    rotationRange: -8,
    delay: 2,
    parallaxSpeed: 35,
  },
  {
    id: "bishop-bottom-left",
    Component: Bishop,
    color: "b",
    glowColor: "rgba(168, 85, 247, 0.55)",
    position: { bottom: "15%", left: "6%" },
    size: "w-16 h-16 md:w-28 md:h-28",
    floatY: -22,
    floatX: -8,
    duration: 7.5,
    rotationRange: -15,
    delay: 3,
    parallaxSpeed: 25,
  },
  {
    id: "pawn-bottom-right",
    Component: Pawn,
    color: "w",
    glowColor: "rgba(244, 63, 94, 0.55)",
    position: { bottom: "10%", right: "7%" },
    size: "w-14 h-14 md:w-24 md:h-24",
    floatY: -12,
    floatX: 10,
    duration: 6.8,
    rotationRange: 10,
    delay: 1,
    parallaxSpeed: -30,
  },
  {
    id: "knight-top-center",
    Component: Knight,
    color: "w",
    glowColor: "rgba(34, 211, 238, 0.45)",
    position: { top: "5%", left: "45%" },
    size: "w-12 h-12 md:w-20 md:h-20",
    floatY: -10,
    floatX: 5,
    duration: 11,
    rotationRange: 8,
    delay: 4,
    parallaxSpeed: 15,
  },
  {
    id: "bishop-bottom-center",
    Component: Bishop,
    color: "w",
    glowColor: "rgba(59, 130, 246, 0.45)",
    position: { bottom: "5%", left: "35%" },
    size: "w-12 h-12 md:w-20 md:h-20",
    floatY: -14,
    floatX: -6,
    duration: 9.5,
    rotationRange: -10,
    delay: 2.5,
    parallaxSpeed: -15,
  },
];

const FloatingPiece = React.memo(function FloatingPiece({ piece }: { piece: FloatingPieceConfig }) {
  const { id, Component, color, glowColor, position, size, floatY, floatX, duration, rotationRange, delay, parallaxSpeed } = piece;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      rafId = requestAnimationFrame(() => {
        if (!ref.current) return;
        const x = (e.clientX / window.innerWidth - 0.5) * 2 * parallaxSpeed;
        const y = (e.clientY / window.innerHeight - 0.5) * 2 * parallaxSpeed;
        ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [parallaxSpeed]);

  return (
    <div
      ref={ref}
      className={`absolute ${size}`}
      style={{
        top: position.top,
        left: position.left,
        right: position.right,
        bottom: position.bottom,
        filter: `drop-shadow(0 0 25px ${glowColor}) drop-shadow(0 0 45px ${glowColor.replace("0.55", "0.25").replace("0.45", "0.2")})`,
        willChange: "transform",
      } as React.CSSProperties}
    >
      <div
        className="w-full h-full"
        style={{
          animation: `chess-float-${id} ${duration}s ease-in-out ${delay}s infinite`,
          willChange: "transform, opacity",
        }}
      >
        <Component color={color} className="w-full h-full text-white/30" />
      </div>

      <style>{`
        @keyframes chess-float-${id} {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0.3; }
          25% { transform: translate3d(${floatX * 0.5}px, ${floatY}px, 0) rotate(${rotationRange}deg); opacity: 0.5; }
          50% { transform: translate3d(${floatX}px, ${floatY * 0.3}px, 0) rotate(${-rotationRange / 2}deg); opacity: 0.4; }
          75% { transform: translate3d(${floatX * 0.3}px, ${floatY * 0.7}px, 0) rotate(${rotationRange * 0.3}deg); opacity: 0.5; }
          100% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
});

export function FloatingChessBg() {
  return (
    <div className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0">
      {pieces.map((piece) => (
        <FloatingPiece key={piece.id} piece={piece} />
      ))}
    </div>
  );
}
