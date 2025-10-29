// テトロミノの形状定義
export const TETROMINOS = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#00f0f0',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#f0f000',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#a000f0',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#00f000',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#f00000',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#0000f0',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#f0a000',
  },
};

export type TetrominoType = keyof typeof TETROMINOS;

export interface Position {
  x: number;
  y: number;
}

export interface Tetromino {
  shape: number[][];
  color: string;
  type: TetrominoType;
}

export interface GameState {
  board: (string | null)[][];
  currentPiece: Tetromino | null;
  currentPosition: Position;
  score: number;
  lines: number;
  level: number;
  gameOver: boolean;
  isPaused: boolean;
  nextPiece: Tetromino | null;
}

// ボードのサイズ
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// 空のボードを作成
export function createEmptyBoard(): (string | null)[][] {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null)
  );
}

// ランダムなテトロミノを生成
export function getRandomTetromino(): Tetromino {
  const types = Object.keys(TETROMINOS) as TetrominoType[];
  const randomType = types[Math.floor(Math.random() * types.length)];
  return {
    ...TETROMINOS[randomType],
    type: randomType,
  };
}

// 衝突判定
export function checkCollision(
  board: (string | null)[][],
  piece: Tetromino,
  position: Position
): boolean {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newY = position.y + y;
        const newX = position.x + x;

        // ボードの範囲外チェック
        if (
          newY < 0 ||
          newY >= BOARD_HEIGHT ||
          newX < 0 ||
          newX >= BOARD_WIDTH
        ) {
          return true;
        }

        // 既存のブロックとの衝突チェック
        if (board[newY] && board[newY][newX]) {
          return true;
        }
      }
    }
  }
  return false;
}

// テトロミノを回転
export function rotatePiece(piece: Tetromino): Tetromino {
  const rotated = piece.shape[0].map((_, index) =>
    piece.shape.map((row) => row[index]).reverse()
  );
  return { ...piece, shape: rotated };
}

// テトロミノをボードに固定
export function mergePieceToBoard(
  board: (string | null)[][],
  piece: Tetromino,
  position: Position
): (string | null)[][] {
  const newBoard = board.map((row) => [...row]);

  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const boardY = position.y + y;
        const boardX = position.x + x;
        if (boardY >= 0 && boardY < BOARD_HEIGHT) {
          newBoard[boardY][boardX] = piece.color;
        }
      }
    }
  }

  return newBoard;
}

// 完成したラインをクリア
export function clearLines(board: (string | null)[][]): {
  newBoard: (string | null)[][];
  linesCleared: number;
} {
  const newBoard = board.filter((row) => row.some((cell) => cell === null));
  const linesCleared = BOARD_HEIGHT - newBoard.length;

  // クリアされた分、新しい空行を追加
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array.from({ length: BOARD_WIDTH }, () => null));
  }

  return { newBoard, linesCleared };
}

// スコア計算
export function calculateScore(linesCleared: number, level: number): number {
  const baseScores = [0, 100, 300, 500, 800];
  return baseScores[linesCleared] * (level + 1);
}

// レベル計算
export function calculateLevel(lines: number): number {
  return Math.floor(lines / 10);
}

// 初期ゲームステートを作成
export function createInitialGameState(): GameState {
  const firstPiece = getRandomTetromino();
  const nextPiece = getRandomTetromino();

  return {
    board: createEmptyBoard(),
    currentPiece: firstPiece,
    currentPosition: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
    score: 0,
    lines: 0,
    level: 0,
    gameOver: false,
    isPaused: false,
    nextPiece,
  };
}
