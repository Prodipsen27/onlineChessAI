export interface ChessPiece {
  type: "p" | "r" | "n" | "b" | "q" | "k";
  color: "w" | "b";
  id: string; // for React keys and smooth animations
}

export type BoardState = Record<string, ChessPiece | null>;

export const EVERGREEN_GAME = {
  title: "The Evergreen Game",
  white: "Adolf Anderssen",
  black: "Jean Dufresne",
  year: 1852,
  label: "Anderssen vs Dufresne, 1852",
} as const;

export const EVERGREEN_PUZZLE_START_PLY = 38;

// Generate initial standard chess board
export function getInitialBoard(): BoardState {
  const board: BoardState = {};
  
  // Helper to generate coordinates
  const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];
  
  // Set all squares empty initially
  for (let r = 1; r <= 8; r++) {
    for (const c of columns) {
      board[`${c}${r}`] = null;
    }
  }

  // Set Black pieces
  board["a8"] = { type: "r", color: "b", id: "br1" };
  board["b8"] = { type: "n", color: "b", id: "bn1" };
  board["c8"] = { type: "b", color: "b", id: "bb1" };
  board["d8"] = { type: "q", color: "b", id: "bq1" };
  board["e8"] = { type: "k", color: "b", id: "bk" };
  board["f8"] = { type: "b", color: "b", id: "bb2" };
  board["g8"] = { type: "n", color: "b", id: "bn2" };
  board["h8"] = { type: "r", color: "b", id: "br2" };
  
  columns.forEach((col, idx) => {
    board[`${col}7`] = { type: "p", color: "b", id: `bp${idx + 1}` };
  });

  // Set White pieces
  board["a1"] = { type: "r", color: "w", id: "wr1" };
  board["b1"] = { type: "n", color: "w", id: "wn1" };
  board["c1"] = { type: "b", color: "w", id: "wb1" };
  board["d1"] = { type: "q", color: "w", id: "wq1" };
  board["e1"] = { type: "k", color: "w", id: "wk" };
  board["f1"] = { type: "b", color: "w", id: "wb2" };
  board["g1"] = { type: "n", color: "w", id: "wn2" };
  board["h1"] = { type: "r", color: "w", id: "wr2" };

  columns.forEach((col, idx) => {
    board[`${col}2`] = { type: "p", color: "w", id: `wp${idx + 1}` };
  });

  return board;
}

// Represent each ply (half-move) of the Evergreen Game
export interface BoardDelta {
  moveLabel: string;
  commentary: string;
  changes: Record<string, ChessPiece | null>;
}

export const EVERGREEN_PLAY_LIST: BoardDelta[] = [
  {
    moveLabel: "1. e4",
    commentary: "Anderssen opens with the King's Pawn, the most popular opening choice of the Romantic era.",
    changes: {
      "e2": null,
      "e4": { type: "p", color: "w", id: "wp5" }
    }
  },
  {
    moveLabel: "1... e5",
    commentary: "Dufresne responds symmetrically, leading to an open and highly tactical game.",
    changes: {
      "e7": null,
      "e5": { type: "p", color: "b", id: "bp5" }
    }
  },
  {
    moveLabel: "2. Nf3",
    commentary: "White develops the Knight, simultaneously attacking Black's e5 pawn.",
    changes: {
      "g1": null,
      "f3": { type: "n", color: "w", id: "wn2" }
    }
  },
  {
    moveLabel: "2... Nc6",
    commentary: "Black develops their Knight to protect the e5 pawn.",
    changes: {
      "b8": null,
      "c6": { type: "n", color: "b", id: "bn1" }
    }
  },
  {
    moveLabel: "3. Bc4",
    commentary: "The Italian Game. White aims at Black's weakest square, f7.",
    changes: {
      "f1": null,
      "c4": { type: "b", color: "w", id: "wb2" }
    }
  },
  {
    moveLabel: "3... Bc5",
    commentary: "Dufresne develops symmetrically, placing his bishop on the active c5 diagonal.",
    changes: {
      "f8": null,
      "c5": { type: "b", color: "b", id: "bb2" }
    }
  },
  {
    moveLabel: "4. b4",
    commentary: "The Evans Gambit! White sacrifices a pawn to draw Black's bishop away, aiming to conquer the center.",
    changes: {
      "b2": null,
      "b4": { type: "p", color: "w", id: "wp2" }
    }
  },
  {
    moveLabel: "4... Bxb4",
    commentary: "Dufresne accepts the gambit, capturing the b4 pawn.",
    changes: {
      "c5": null,
      "b4": { type: "b", color: "b", id: "bb2" }
    }
  },
  {
    moveLabel: "5. c3",
    commentary: "White gains a tempo on the bishop and prepares to support a d4 push to build a strong center.",
    changes: {
      "c2": null,
      "c3": { type: "p", color: "w", id: "wp3" }
    }
  },
  {
    moveLabel: "5... Ba5",
    commentary: "Black retreats the bishop to a5, keeping the pressure on the c3 pawn.",
    changes: {
      "b4": null,
      "a5": { type: "b", color: "b", id: "bb2" }
    }
  },
  {
    moveLabel: "6. d4",
    commentary: "White immediately strikes in the center, seizing spatial control.",
    changes: {
      "d2": null,
      "d4": { type: "p", color: "w", id: "wp4" }
    }
  },
  {
    moveLabel: "6... exd4",
    commentary: "Black exchanges pawns in the center.",
    changes: {
      "e5": null,
      "d4": { type: "p", color: "b", id: "bp5" }
    }
  },
  {
    moveLabel: "7. O-O",
    commentary: "Anderssen castles, prioritizing king safety and activating his h1 Rook.",
    changes: {
      "e1": null,
      "g1": { type: "k", color: "w", id: "wk" },
      "h1": null,
      "f1": { type: "r", color: "w", id: "wr2" }
    }
  },
  {
    moveLabel: "7... d3",
    commentary: "Black pushes the advanced e-pawn to d3, hoping to clog the center and prevent White from consolidating with cxd4.",
    changes: {
      "d4": null,
      "d3": { type: "p", color: "b", id: "bp5" }
    }
  },
  {
    moveLabel: "8. Qb3",
    commentary: "Anderssen places his Queen on the diagonal, creating a powerful battery with the c4 Bishop targeting f7.",
    changes: {
      "d1": null,
      "b3": { type: "q", color: "w", id: "wq1" }
    }
  },
  {
    moveLabel: "8... Qf6",
    commentary: "Dufresne's Queen moves to f6 to defend the f7 pawn and prepare kingside castling.",
    changes: {
      "d8": null,
      "f6": { type: "q", color: "b", id: "bq1" }
    }
  },
  {
    moveLabel: "9. e5",
    commentary: "White advances his e-pawn, creating space and attacking Black's Queen.",
    changes: {
      "e4": null,
      "e5": { type: "p", color: "w", id: "wp5" }
    }
  },
  {
    moveLabel: "9... Qg6",
    commentary: "The Black Queen moves to a safer post, keeping pressure on g2.",
    changes: {
      "f6": null,
      "g6": { type: "q", color: "b", id: "bq1" }
    }
  },
  {
    moveLabel: "10. Re1",
    commentary: "White places the Rook on the e-file, establishing central influence and keeping Black's king pinned.",
    changes: {
      "f1": null,
      "e1": { type: "r", color: "w", id: "wr2" }
    }
  },
  {
    moveLabel: "10... Nge7",
    commentary: "Black develops their other Knight, eyeing castling on the next move.",
    changes: {
      "g8": null,
      "e7": { type: "n", color: "b", id: "bn2" }
    }
  },
  {
    moveLabel: "11. Ba3",
    commentary: "White places the Bishop on a highly active diagonal, preventing Black from castling easily.",
    changes: {
      "c1": null,
      "a3": { type: "b", color: "w", id: "wb1" }
    }
  },
  {
    moveLabel: "11... b5",
    commentary: "An aggressive counter-gambit by Black to distract White and create counterplay.",
    changes: {
      "b7": null,
      "b5": { type: "p", color: "b", id: "bp2" }
    }
  },
  {
    moveLabel: "12. Qxb5",
    commentary: "White accepts the distraction, capturing the b5 pawn with the Queen.",
    changes: {
      "b3": null,
      "b5": { type: "q", color: "w", id: "wq1" }
    }
  },
  {
    moveLabel: "12... Rb8",
    commentary: "Black gains a tempo, forcing White's Queen to move while activating the a8 Rook.",
    changes: {
      "a8": null,
      "b8": { type: "r", color: "b", id: "br1" }
    }
  },
  {
    moveLabel: "13. Qa4",
    commentary: "White retreats the Queen to a4, maintaining a tactical watch over the board.",
    changes: {
      "b5": null,
      "a4": { type: "q", color: "w", id: "wq1" }
    }
  },
  {
    moveLabel: "13... Bb6",
    commentary: "Black pulls the bishop back to b6, securing its position.",
    changes: {
      "a5": null,
      "b6": { type: "b", color: "b", id: "bb2" }
    }
  },
  {
    moveLabel: "14. Nbd2",
    commentary: "White develops their final minor piece, the Knight on b1, to d2.",
    changes: {
      "b1": null,
      "d2": { type: "n", color: "w", id: "wn1" }
    }
  },
  {
    moveLabel: "14... Bb7",
    commentary: "Black develops their light-squared bishop, placing it on the long diagonal targeting White's king.",
    changes: {
      "c8": null,
      "b7": { type: "b", color: "b", id: "bb1" }
    }
  },
  {
    moveLabel: "15. Ne4",
    commentary: "White maneuvers the Knight to e4, heading towards central outposts.",
    changes: {
      "d2": null,
      "e4": { type: "n", color: "w", id: "wn1" }
    }
  },
  {
    moveLabel: "15... Qf5",
    commentary: "Dufresne relocates the Queen to f5 to increase pressure on the e-file.",
    changes: {
      "g6": null,
      "f5": { type: "q", color: "b", id: "bq1" }
    }
  },
  {
    moveLabel: "16. Bxd3",
    commentary: "White captures the d3 pawn, threatening a devastating discovered attack with Ne4.",
    changes: {
      "c4": null,
      "d3": { type: "b", color: "w", id: "wb2" }
    }
  },
  {
    moveLabel: "16... Qh5",
    commentary: "The Black Queen retreats, escaping the discovered attack threat.",
    changes: {
      "f5": null,
      "h5": { type: "q", color: "b", id: "bq1" }
    }
  },
  {
    moveLabel: "17. Nf6+",
    commentary: "A brilliant Knight sacrifice! White shatters Black's kingside pawn structure.",
    changes: {
      "e4": null,
      "f6": { type: "n", color: "w", id: "wn1" }
    }
  },
  {
    moveLabel: "17... gxf6",
    commentary: "Black is forced to capture the Knight, ruining their pawn structure on the kingside.",
    changes: {
      "g7": null,
      "f6": { type: "p", color: "b", id: "bp7" }
    }
  },
  {
    moveLabel: "18. exf6",
    commentary: "White recaptures, opening up lines of attack on the uncastled Black King.",
    changes: {
      "e5": null,
      "f6": { type: "p", color: "w", id: "wp5" }
    }
  },
  {
    moveLabel: "18... Rg8",
    commentary: "Dufresne targets White's g2 square, threatening mate. It feels like Black is winning, but...",
    changes: {
      "h8": null,
      "g8": { type: "r", color: "b", id: "br2" }
    }
  },
  {
    moveLabel: "19. Rad1!",
    commentary: "The quiet masterpiece move! Anderssen defends nothing and activates his last rook, inviting Black to capture f3.",
    changes: {
      "a1": null,
      "d1": { type: "r", color: "w", id: "wr1" }
    }
  },
  {
    moveLabel: "19... Qxf3",
    commentary: "Black captures the Knight, threatening immediate mate on g2. This is the starting point of our tactical puzzle!",
    changes: {
      "h5": null,
      "f3": { type: "q", color: "b", id: "bq1" }
    }
  },
  {
    moveLabel: "20. Rxe7+",
    commentary: "Anderssen begins the immortal finish by sacrificing the rook on e7.",
    changes: {
      "e1": null,
      "e7": { type: "r", color: "w", id: "wr2" }
    }
  },
  {
    moveLabel: "20... Nxe7",
    commentary: "Dufresne must recapture with the c6 knight, leaving the king vulnerable to a queen sacrifice.",
    changes: {
      "c6": null,
      "e7": { type: "n", color: "b", id: "bn1" }
    }
  },
  {
    moveLabel: "21. Qxd7+",
    commentary: "The queen sacrifice removes the d7 pawn and drags the king into the open.",
    changes: {
      "a4": null,
      "d7": { type: "q", color: "w", id: "wq1" }
    }
  },
  {
    moveLabel: "21... Kxd7",
    commentary: "Black accepts, but the king is now exposed on d7.",
    changes: {
      "e8": null,
      "d7": { type: "k", color: "b", id: "bk" }
    }
  },
  {
    moveLabel: "22. Bf5+",
    commentary: "The bishop gives check and starts driving the king back.",
    changes: {
      "d3": null,
      "f5": { type: "b", color: "w", id: "wb2" }
    }
  },
  {
    moveLabel: "22... Ke8",
    commentary: "The king retreats to e8, but the mating net is already closed.",
    changes: {
      "d7": null,
      "e8": { type: "k", color: "b", id: "bk" }
    }
  },
  {
    moveLabel: "23. Bd7+",
    commentary: "The bishop returns to d7 with check, forcing the king to f8.",
    changes: {
      "f5": null,
      "d7": { type: "b", color: "w", id: "wb2" }
    }
  },
  {
    moveLabel: "23... Kf8",
    commentary: "Dufresne's king has only one square left.",
    changes: {
      "e8": null,
      "f8": { type: "k", color: "b", id: "bk" }
    }
  },
  {
    moveLabel: "24. Bxe7#",
    commentary: "The bishop from a3 captures the last defender on e7. Checkmate.",
    changes: {
      "a3": null,
      "e7": { type: "b", color: "w", id: "wb1" }
    }
  }
];

// Replay helper that computes the BoardState for a given ply.
export function getBoardStateAtPly(ply: number): BoardState {
  const board = getInitialBoard();
  
  // Apply all changes up to the specified ply
  const limit = Math.min(ply, EVERGREEN_PLAY_LIST.length);
  for (let i = 0; i < limit; i++) {
    const delta = EVERGREEN_PLAY_LIST[i];
    Object.entries(delta.changes).forEach(([square, piece]) => {
      board[square] = piece;
    });
  }
  
  return board;
}

// Puzzle State structure for the interactive puzzle portion
export interface PuzzleStep {
  step: number;
  whiteToMove: boolean;
  movesRemaining: number;
  hint: string;
  commentary: string;
  correctMove: { from: string; to: string };
  blackReply?: {
    moveLabel: string;
    commentary: string;
    from: string;
    to: string;
    changes: Record<string, ChessPiece | null>;
  };
}

export const PUZZLE_STEPS: PuzzleStep[] = [
  {
    step: 0,
    whiteToMove: true,
    movesRemaining: 5,
    hint: "Sacrifice a Rook to clear the e-file and draw Black's defense out.",
    commentary: "Black is threatening mate on g2. White must act forcefully and with checks. Look at your e1 Rook.",
    correctMove: { from: "e1", to: "e7" },
    blackReply: {
      moveLabel: "20... Nxe7",
      commentary: "Dufresne is forced to recapture with the knight from c6, leaving the king vulnerable to a queen sacrifice.",
      from: "c6",
      to: "e7",
      changes: {
        "c6": null,
        "e7": { type: "n", color: "b", id: "bn1" }
      }
    }
  },
  {
    step: 1,
    whiteToMove: true,
    movesRemaining: 4,
    hint: "Sacrifice the Queen! Lure the Black King to a lethal checking square.",
    commentary: "An absolute legend of a move. The White Queen must sacrifice herself on d7 to decoy the Black King.",
    correctMove: { from: "a4", to: "d7" },
    blackReply: {
      moveLabel: "21... Kxd7",
      commentary: "Black must capture the Queen with the King. The King is decoyed to d7, completely exposed.",
      from: "e8",
      to: "d7",
      changes: {
        "d7": { type: "k", color: "b", id: "bk" },
        "e8": null
      }
    }
  },
  {
    step: 2,
    whiteToMove: true,
    movesRemaining: 3,
    hint: "Use the bishop on d3 to check from f5.",
    commentary: "The bishop check starts the final king chase.",
    correctMove: { from: "d3", to: "f5" },
    blackReply: {
      moveLabel: "22... Ke8",
      commentary: "The King returns to e8, but White has another forcing check.",
      from: "d7",
      to: "e8",
      changes: {
        "d7": null,
        "e8": { type: "k", color: "b", id: "bk" }
      }
    }
  },
  {
    step: 3,
    whiteToMove: true,
    movesRemaining: 2,
    hint: "Keep checking with the same bishop.",
    commentary: "Move the bishop back to d7 to force the king to f8.",
    correctMove: { from: "f5", to: "d7" },
    blackReply: {
      moveLabel: "23... Kf8",
      commentary: "The King is driven to f8, where the final capture ends the game.",
      from: "e8",
      to: "f8",
      changes: {
        "e8": null,
        "f8": { type: "k", color: "b", id: "bk" }
      }
    }
  },
  {
    step: 4,
    whiteToMove: true,
    movesRemaining: 1,
    hint: "Use the other bishop to capture the pinned knight on e7.",
    commentary: "The last defender falls. Capture on e7 with the bishop from a3 to deliver checkmate.",
    correctMove: { from: "a3", to: "e7" }
  }
];
