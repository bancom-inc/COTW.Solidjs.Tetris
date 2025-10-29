import { createSignal, onMount, onCleanup, Show, For } from 'solid-js';
import {
  GameState,
  createInitialGameState,
  checkCollision,
  rotatePiece,
  mergePieceToBoard,
  clearLines,
  calculateScore,
  calculateLevel,
  getRandomTetromino,
  BOARD_WIDTH,
  BOARD_HEIGHT,
} from './tetris';
import './App.css';

function App() {
  const [gameState, setGameState] = createSignal<GameState>(createInitialGameState());
  let gameLoopInterval: number | undefined;

  // ピースを下に移動
  const movePieceDown = () => {
    const state = gameState();
    if (!state.currentPiece || state.gameOver || state.isPaused) return false;

    const newPosition = { x: state.currentPosition.x, y: state.currentPosition.y + 1 };

    if (!checkCollision(state.board, state.currentPiece, newPosition)) {
      setGameState({ ...state, currentPosition: newPosition });
      return true;
    } else {
      // ピースを固定してラインをクリア
      lockPiece();
      return false;
    }
  };

  // ピースを固定
  const lockPiece = () => {
    const state = gameState();
    if (!state.currentPiece) return;

    // ボードにピースを固定
    let newBoard = mergePieceToBoard(state.board, state.currentPiece, state.currentPosition);

    // ラインクリア
    const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
    const newLines = state.lines + linesCleared;
    const newLevel = calculateLevel(newLines);
    const newScore = state.score + calculateScore(linesCleared, state.level);

    // 次のピース
    const nextPiece = state.nextPiece || getRandomTetromino();
    const newCurrentPiece = getRandomTetromino();
    const initialPosition = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };

    // ゲームオーバーチェック
    const gameOver = checkCollision(clearedBoard, nextPiece, initialPosition);

    setGameState({
      ...state,
      board: clearedBoard,
      currentPiece: gameOver ? null : nextPiece,
      nextPiece: newCurrentPiece,
      currentPosition: initialPosition,
      score: newScore,
      lines: newLines,
      level: newLevel,
      gameOver,
    });
  };

  // ピースを左に移動
  const movePieceLeft = () => {
    const state = gameState();
    if (!state.currentPiece || state.gameOver || state.isPaused) return;

    const newPosition = { x: state.currentPosition.x - 1, y: state.currentPosition.y };

    if (!checkCollision(state.board, state.currentPiece, newPosition)) {
      setGameState({ ...state, currentPosition: newPosition });
    }
  };

  // ピースを右に移動
  const movePieceRight = () => {
    const state = gameState();
    if (!state.currentPiece || state.gameOver || state.isPaused) return;

    const newPosition = { x: state.currentPosition.x + 1, y: state.currentPosition.y };

    if (!checkCollision(state.board, state.currentPiece, newPosition)) {
      setGameState({ ...state, currentPosition: newPosition });
    }
  };

  // ピースを回転
  const rotatePieceAction = () => {
    const state = gameState();
    if (!state.currentPiece || state.gameOver || state.isPaused) return;

    const rotated = rotatePiece(state.currentPiece);

    if (!checkCollision(state.board, rotated, state.currentPosition)) {
      setGameState({ ...state, currentPiece: rotated });
    }
  };

  // ハードドロップ
  const hardDrop = () => {
    const state = gameState();
    if (!state.currentPiece || state.gameOver || state.isPaused) return;

    let newPosition = { ...state.currentPosition };

    while (!checkCollision(state.board, state.currentPiece, { x: newPosition.x, y: newPosition.y + 1 })) {
      newPosition.y++;
    }

    setGameState({ ...state, currentPosition: newPosition });
    lockPiece();
  };

  // ゲームループ
  const startGameLoop = () => {
    const state = gameState();
    const speed = Math.max(100, 1000 - state.level * 100);

    if (gameLoopInterval) {
      clearInterval(gameLoopInterval);
    }

    gameLoopInterval = setInterval(() => {
      movePieceDown();
    }, speed) as unknown as number;
  };

  // キーボード入力
  const handleKeyPress = (event: KeyboardEvent) => {
    const state = gameState();

    if (state.gameOver) {
      if (event.key === 'Enter') {
        restartGame();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        movePieceLeft();
        break;
      case 'ArrowRight':
        event.preventDefault();
        movePieceRight();
        break;
      case 'ArrowDown':
        event.preventDefault();
        movePieceDown();
        break;
      case 'ArrowUp':
      case ' ':
        event.preventDefault();
        rotatePieceAction();
        break;
      case 'Enter':
        event.preventDefault();
        hardDrop();
        break;
      case 'p':
      case 'P':
        event.preventDefault();
        togglePause();
        break;
    }
  };

  // ポーズ切り替え
  const togglePause = () => {
    const state = gameState();
    setGameState({ ...state, isPaused: !state.isPaused });
  };

  // ゲーム再開
  const restartGame = () => {
    setGameState(createInitialGameState());
    startGameLoop();
  };

  // ボードを描画用に結合
  const getDisplayBoard = () => {
    const state = gameState();
    const board = state.board.map((row) => [...row]);

    if (state.currentPiece) {
      for (let y = 0; y < state.currentPiece.shape.length; y++) {
        for (let x = 0; x < state.currentPiece.shape[y].length; x++) {
          if (state.currentPiece.shape[y][x]) {
            const boardY = state.currentPosition.y + y;
            const boardX = state.currentPosition.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              board[boardY][boardX] = state.currentPiece.color;
            }
          }
        }
      }
    }

    return board;
  };

  onMount(() => {
    window.addEventListener('keydown', handleKeyPress);
    startGameLoop();
  });

  onCleanup(() => {
    window.removeEventListener('keydown', handleKeyPress);
    if (gameLoopInterval) {
      clearInterval(gameLoopInterval);
    }
  });

  return (
    <div class="game-container">
      <div class="game-wrapper">
        <div class="side-panel">
          <h2>次のピース</h2>
          <div class="next-piece">
            <Show when={gameState().nextPiece}>
              {(piece) => (
                <div class="mini-board">
                  <For each={piece().shape}>
                    {(row) => (
                      <div class="mini-row">
                        <For each={row}>
                          {(cell) => (
                            <div
                              class="mini-cell"
                              style={{
                                background: cell ? piece().color : 'transparent',
                              }}
                            />
                          )}
                        </For>
                      </div>
                    )}
                  </For>
                </div>
              )}
            </Show>
          </div>
        </div>

        <div class="game-board-wrapper">
          <h1>TETRIS</h1>
          <div class="board">
            <For each={getDisplayBoard()}>
              {(row) => (
                <div class="row">
                  <For each={row}>
                    {(cell) => (
                      <div
                        class="cell"
                        style={{
                          background: cell || '#1a1a2e',
                          border: cell ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
                        }}
                      />
                    )}
                  </For>
                </div>
              )}
            </For>
          </div>

          <Show when={gameState().gameOver}>
            <div class="game-over-overlay">
              <div class="game-over-message">
                <h2>ゲームオーバー</h2>
                <p>スコア: {gameState().score}</p>
                <button onClick={restartGame}>もう一度プレイ (Enter)</button>
              </div>
            </div>
          </Show>

          <Show when={gameState().isPaused && !gameState().gameOver}>
            <div class="game-over-overlay">
              <div class="game-over-message">
                <h2>一時停止</h2>
                <p>Pキーで再開</p>
              </div>
            </div>
          </Show>
        </div>

        <div class="side-panel">
          <div class="stats">
            <div class="stat">
              <label>スコア</label>
              <div class="stat-value">{gameState().score}</div>
            </div>
            <div class="stat">
              <label>ライン</label>
              <div class="stat-value">{gameState().lines}</div>
            </div>
            <div class="stat">
              <label>レベル</label>
              <div class="stat-value">{gameState().level}</div>
            </div>
          </div>

          <div class="controls">
            <h3>操作方法</h3>
            <ul>
              <li>← →: 移動</li>
              <li>↑ / Space: 回転</li>
              <li>↓: 高速落下</li>
              <li>Enter: ハードドロップ</li>
              <li>P: ポーズ</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
