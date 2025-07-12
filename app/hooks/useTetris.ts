import { useState, useEffect, useCallback, useRef } from 'react';
import { PIECES, Piece, Board, ThemeBoard, CondimentTheme } from '../types/tetris';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_DROP_TIME = 1000;

export const useTetris = (currentTheme: CondimentTheme = 'mustard', isRandomMode: boolean = false, getRandomTheme: () => CondimentTheme = () => 'mustard') => {
  const [board, setBoard] = useState<Board>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  );
  const [themeBoard, setThemeBoard] = useState<ThemeBoard>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  );
  const [textureBoard, setTextureBoard] = useState<(string | null)[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  );
  const [rotationBoard, setRotationBoard] = useState<(number | null)[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  );
  const [animatingLines, setAnimatingLines] = useState<number[]>([]);
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(true);
  const [paused, setPaused] = useState(false);
  const dropTime = useRef(INITIAL_DROP_TIME);
  const lastDrop = useRef(Date.now());

  const createRandomPiece = useCallback((): Piece => {
    const pieces = Object.keys(PIECES);
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    const pieceTheme = isRandomMode ? getRandomTheme() : currentTheme;
    return {
      shape: PIECES[randomPiece].shape,
      type: PIECES[randomPiece].type,
      textures: PIECES[randomPiece].textures,
      rotations: PIECES[randomPiece].rotations,
      x: 4,
      y: 0,
      theme: pieceTheme
    };
  }, [isRandomMode, getRandomTheme, currentTheme]);

  const isValidMove = useCallback((piece: Piece, deltaX: number, deltaY: number, newShape?: number[][]): boolean => {
    const shape = newShape || piece.shape;
    const newX = piece.x + deltaX;
    const newY = piece.y + deltaY;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = newX + x;
          const boardY = newY + y;
          
          if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (boardY >= 0 && board[boardY][boardX] !== null) {
            return false;
          }
        }
      }
    }
    return true;
  }, [board]);

  const placePiece = useCallback((piece: Piece, theme: CondimentTheme) => {
    const newBoard = board.map(row => [...row]);
    const newTextureBoard = textureBoard.map(row => [...row]);
    const newRotationBoard = rotationBoard.map(row => [...row]);
    const newThemeBoard = themeBoard.map(row => [...row]);
    
    piece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = piece.y + y;
          const boardX = piece.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.type;
            newTextureBoard[boardY][boardX] = piece.textures[y][x];
            newRotationBoard[boardY][boardX] = piece.rotations[y][x];
            newThemeBoard[boardY][boardX] = theme;
          }
        }
      });
    });

    // Check for completed lines
    const completedLines: number[] = [];
    newBoard.forEach((row, index) => {
      if (row.every(cell => cell !== null)) {
        completedLines.push(index);
      }
    });

    setBoard(newBoard);
    setTextureBoard(newTextureBoard);
    setRotationBoard(newRotationBoard);
    setThemeBoard(newThemeBoard);

    // If there are completed lines, animate them
    if (completedLines.length > 0) {
      setAnimatingLines(completedLines);
      
      // Wait 350ms, then clear the lines
      setTimeout(() => {
        const finalBoard = newBoard.map(row => [...row]);
        const finalTextureBoard = newTextureBoard.map(row => [...row]);
        const finalRotationBoard = newRotationBoard.map(row => [...row]);
        const finalThemeBoard = newThemeBoard.map(row => [...row]);
        
        // Remove completed lines (process from bottom to top to avoid index shifting)
        completedLines.sort((a, b) => b - a).forEach(lineIndex => {
          finalBoard.splice(lineIndex, 1);
          finalBoard.unshift(Array(BOARD_WIDTH).fill(null));
          finalTextureBoard.splice(lineIndex, 1);
          finalTextureBoard.unshift(Array(BOARD_WIDTH).fill(null));
          finalRotationBoard.splice(lineIndex, 1);
          finalRotationBoard.unshift(Array(BOARD_WIDTH).fill(null));
          finalThemeBoard.splice(lineIndex, 1);
          finalThemeBoard.unshift(Array(BOARD_WIDTH).fill(null));
        });

        setBoard(finalBoard);
        setTextureBoard(finalTextureBoard);
        setRotationBoard(finalRotationBoard);
        setThemeBoard(finalThemeBoard);
        setAnimatingLines([]);
        
        // Update score and lines after clearing
        const lineScore = [0, 40, 100, 300, 1200][completedLines.length] * level;
        setScore(prev => prev + lineScore);
        setLines(prev => {
          const newLines = prev + completedLines.length;
          const newLevel = Math.floor(newLines / 10) + 1;
          setLevel(newLevel);
          dropTime.current = Math.max(50, INITIAL_DROP_TIME - (newLevel - 1) * 50);
          return newLines;
        });
      }, 350);
    }

    // Check game over
    const newPiece = createRandomPiece();
    if (!isValidMove(newPiece, 0, 0)) {
      setGameOver(true);
    } else {
      setCurrentPiece(newPiece);
    }
  }, [board, textureBoard, rotationBoard, themeBoard, level, isValidMove, createRandomPiece]);

  const movePiece = useCallback((deltaX: number, deltaY: number) => {
    if (!currentPiece || gameOver || paused) return;

    if (isValidMove(currentPiece, deltaX, deltaY)) {
      setCurrentPiece(prev => prev ? { ...prev, x: prev.x + deltaX, y: prev.y + deltaY } : null);
    } else if (deltaY > 0) {
      // Piece hit bottom or another piece
      placePiece(currentPiece, currentPiece.theme || currentTheme);
    }
  }, [currentPiece, gameOver, paused, isValidMove, placePiece, currentTheme]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver || paused) return;

    const rotated = currentPiece.shape[0].map((_, index) =>
      currentPiece.shape.map(row => row[index]).reverse()
    );

    const rotatedTextures = currentPiece.textures[0].map((_, index) =>
      currentPiece.textures.map(row => row[index]).reverse()
    );

    // Rotate the rotation matrix AND add 90° to each rotation value
    const rotatedRotations = currentPiece.rotations[0].map((_, index) =>
      currentPiece.rotations.map(row => row[index]).reverse().map(rotation => (rotation + 90) % 360)
    );

    if (isValidMove(currentPiece, 0, 0, rotated)) {
      setCurrentPiece(prev => prev ? { 
        ...prev, 
        shape: rotated, 
        textures: rotatedTextures,
        rotations: rotatedRotations
      } : null);
    }
  }, [currentPiece, gameOver, paused, isValidMove]);

  const dropPiece = useCallback(() => {
    if (!currentPiece || gameOver || paused) return;

    let dropDistance = 0;
    while (isValidMove(currentPiece, 0, dropDistance + 1)) {
      dropDistance++;
    }
    
    if (dropDistance > 0) {
      setCurrentPiece(prev => prev ? { ...prev, y: prev.y + dropDistance } : null);
      setTimeout(() => {
        if (currentPiece) {
          placePiece({ ...currentPiece, y: currentPiece.y + dropDistance }, currentPiece.theme || currentTheme);
        }
      }, 50);
    }
  }, [currentPiece, gameOver, paused, isValidMove, placePiece, currentTheme]);

  const startGame = useCallback(() => {
    if (gameOver) {
      setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
      setTextureBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
      setRotationBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
      setThemeBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
      setCurrentPiece(createRandomPiece());
      setScore(0);
      setLevel(1);
      setLines(0);
      setGameOver(false);
      dropTime.current = INITIAL_DROP_TIME;
    }
    setPaused(false);
    lastDrop.current = Date.now();
  }, [gameOver, createRandomPiece]);

  const pauseGame = useCallback(() => {
    setPaused(true);
  }, []);

  const resetGame = useCallback(() => {
    startGame();
  }, [startGame]);

  const updateCurrentPieceTheme = useCallback((newTheme: CondimentTheme) => {
    setCurrentPiece(prev => prev ? { ...prev, theme: newTheme } : null);
  }, []);

  // Game loop
  useEffect(() => {
    if (gameOver || paused) return;

    const gameLoop = () => {
      const now = Date.now();
      if (now - lastDrop.current > dropTime.current) {
        movePiece(0, 1);
        lastDrop.current = now;
      }
    };

    const interval = setInterval(gameLoop, 50);
    return () => clearInterval(interval);
  }, [gameOver, paused, movePiece]);

  // Initialize game
  useEffect(() => {
    setCurrentPiece(createRandomPiece());
  }, [createRandomPiece]);

  return {
    board,
    textureBoard,
    rotationBoard,
    themeBoard,
    animatingLines,
    currentPiece,
    score,
    level,
    lines,
    gameOver,
    paused,
    movePiece,
    rotatePiece,
    dropPiece,
    startGame,
    pauseGame,
    resetGame,
    updateCurrentPieceTheme
  };
};