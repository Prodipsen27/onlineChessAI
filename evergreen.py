import chess

pgn_moves = [
    "e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4", "Bxb4", "c3", "Ba5", 
    "d4", "exd4", "O-O", "d3", "Qb3", "Qf6", "e5", "Qg6", "Re1", "Nge7", 
    "Ba3", "b5", "Qxb5", "Rb8", "Qa4", "Bb6", "Nbd2", "Bb7", "Ne4", "Qf5", 
    "Bxd3", "Qh5", "Nf6+", "gxf6", "exf6", "Rg8", "Rad1", "Qxf3"
]

board = chess.Board()
for move in pgn_moves:
    board.push_san(move)

print(board)

board.push_san("Rxe7+")
board.push_san("Nxe7")
board.push_san("Qxd7+")
board.push_san("Kxd7")
board.push_san("Bf5+")
print("After Bf5+:")
print(board)
print("Is Kc6 legal?", "Kc6" in [board.san(m) for m in board.legal_moves])

board2 = board.copy()
board2.push_san("Kc6")
print("If Kc6:")
print(board2.legal_moves)
try:
    board2.push_san("Bd7#")
    print("Bd7 is checkmate")
except Exception as e:
    print("Error on Bd7#:", e)
