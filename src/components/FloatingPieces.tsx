/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import React from 'react';

// Define the SVG paths for the chess pieces we want to float
const CHESS_PIECES = [
  // Knight
  <path d="M14.5 4.5c.5-.5 1-1.5 2-1.5.5 0 1 .5 1 1 0 1-1 1.5-1 3 .5-1 1.5-1.5 2.5-1.5.5 0 1 .5 1 1.5 0 1-.5 1.5-1 2-.5.5-1 1-1 1.5v6H6v-6c0-1.5 2-3 2-4.5 0-1.5-1.5-2.5-2.5-2.5C4.5 4 4 4.5 4 5c0 1 1 1 2 1v1c0 1-.5 1.5-1 2-1 .5-2 1.5-2 3v1h14v-1c0-1.5-1-2.5-2-3-1-.5-1.5-1-1.5-2 0-.5.5-1 1-1h.5z"/>,
  // Pawn
  <path d="M12 2C10.3 2 9 3.3 9 5c0 1.2.7 2.3 1.7 2.8C9.1 8.6 8 10.2 8 12c0 2 1.5 3.5 3.3 3.9L10 18H8v2h8v-2h-2l-1.3-2.1c1.8-.4 3.3-1.9 3.3-3.9 0-1.8-1.1-3.4-2.7-4.2C14.3 7.3 15 6.2 15 5c0-1.7-1.3-3-3-3z"/>,
  // Rook
  <path d="M7 3v4h2V5h2v2h2V5h2v2h2V3H7zm1 6v11h8V9H8z"/>,
  // Bishop
  <path d="M12 2c-1.5 0-2.5 1-2.5 2.5 0 1 .6 1.8 1.5 2.2C9.2 7.7 8 9.7 8 12c0 3 2 5.5 4 6 2-.5 4-3 4-6 0-2.3-1.2-4.3-3-5.3.9-.4 1.5-1.2 1.5-2.2C14.5 3 13.5 2 12 2zM9 19v2h6v-2H9z"/>
];

export function FloatingPieces() {
  const pieces = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    icon: CHESS_PIECES[i % CHESS_PIECES.length],
    size: Math.random() * 30 + 30, // 30px to 60px
    x: Math.random() * 100, // 0 to 100vw
    y: Math.random() * 100, // 0 to 100vh
    duration: Math.random() * 20 + 20, // 20s to 40s
    delay: Math.random() * -20, // Random start offset
    rotation: Math.random() * 360,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute text-[#5ce1e6]/10"
          initial={{
            x: `${piece.x}vw`,
            y: `${piece.y}vh`,
            rotate: piece.rotation,
          }}
          animate={{
            y: [`${piece.y}vh`, `${piece.y - 30}vh`, `${piece.y}vh`],
            rotate: piece.rotation + 360,
            x: [`${piece.x}vw`, `${piece.x + 10}vw`, `${piece.x}vw`],
          }}
          transition={{
            duration: piece.duration,
            repeat: Infinity,
            ease: "linear",
            delay: piece.delay,
          }}
          style={{ width: piece.size, height: piece.size }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
            {piece.icon}
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
