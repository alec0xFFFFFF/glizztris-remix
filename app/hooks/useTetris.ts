import { useState, useEffect, useCallback, useRef } from 'react';
import { PIECES, Piece, Board, ThemeBoard, CondimentTheme, CondimentStats } from '../types/tetris';

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
  
  // Condiment tracking stats
  const [condimentStats, setCondimentStats] = useState<CondimentStats>({
    blocksUsed: { mustard: 0, ketchup: 0, relish: 0 },
    blocksCompleted: { mustard: 0, ketchup: 0, relish: 0 }
  });
  const dropTime = useRef(INITIAL_DROP_TIME);
  const lastDrop = useRef(Date.now());
  const currentThemeRef = useRef(currentTheme);
  const isRandomModeRef = useRef(isRandomMode);
  const getRandomThemeRef = useRef(getRandomTheme);

  // Keep refs updated
  useEffect(() => {
    currentThemeRef.current = currentTheme;
    isRandomModeRef.current = isRandomMode;
    getRandomThemeRef.current = getRandomTheme;
  }, [currentTheme, isRandomMode, getRandomTheme]);

  const createRandomPiece = (): Piece => {
    const pieces = Object.keys(PIECES);
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    const pieceTheme = isRandomModeRef.current ? getRandomThemeRef.current() : currentThemeRef.current;
    return {
      shape: PIECES[randomPiece].shape,
      type: PIECES[randomPiece].type,
      textures: PIECES[randomPiece].textures,
      rotations: PIECES[randomPiece].rotations,
      x: 4,
      y: 0,
      theme: pieceTheme
    };
  };

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

    // Track blocks used for this piece
    const blocksInPiece = piece.shape.flat().filter(cell => cell !== 0).length;
    setCondimentStats(prev => ({
      ...prev,
      blocksUsed: {
        ...prev.blocksUsed,
        [theme]: prev.blocksUsed[theme] + blocksInPiece
      }
    }));

    // If there are completed lines, animate them
    if (completedLines.length > 0) {
      setAnimatingLines(completedLines);
      
      // Wait 350ms, then clear the lines
      setTimeout(() => {
        // Track completed blocks by theme BEFORE removing lines
        const completedBlocksCount = { mustard: 0, ketchup: 0, relish: 0 };
        completedLines.forEach(lineIndex => {
          for (let x = 0; x < BOARD_WIDTH; x++) {
            const theme = newThemeBoard[lineIndex][x];
            if (theme) {
              completedBlocksCount[theme]++;
            }
          }
        });

        // Create new boards with completed lines removed
        const completedSet = new Set(completedLines);
        const remainingBoard: (number | null)[][] = [];
        const remainingTextureBoard: (string | null)[][] = [];
        const remainingRotationBoard: (number | null)[][] = [];
        const remainingThemeBoard: (CondimentTheme | null)[][] = [];
        
        // Keep only non-completed lines
        for (let i = 0; i < BOARD_HEIGHT; i++) {
          if (!completedSet.has(i)) {
            remainingBoard.push([...newBoard[i]]);
            remainingTextureBoard.push([...newTextureBoard[i]]);
            remainingRotationBoard.push([...newRotationBoard[i]]);
            remainingThemeBoard.push([...newThemeBoard[i]]);
          }
        }
        
        // Add empty lines at the top
        const emptyLinesNeeded = completedLines.length;
        for (let i = 0; i < emptyLinesNeeded; i++) {
          remainingBoard.unshift(Array(BOARD_WIDTH).fill(null));
          remainingTextureBoard.unshift(Array(BOARD_WIDTH).fill(null));
          remainingRotationBoard.unshift(Array(BOARD_WIDTH).fill(null));
          remainingThemeBoard.unshift(Array(BOARD_WIDTH).fill(null));
        }

        setBoard(remainingBoard);
        setTextureBoard(remainingTextureBoard);
        setRotationBoard(remainingRotationBoard);
        setThemeBoard(remainingThemeBoard);
        setAnimatingLines([]);
        
        setCondimentStats(prev => ({
          ...prev,
          blocksCompleted: {
            mustard: prev.blocksCompleted.mustard + completedBlocksCount.mustard,
            ketchup: prev.blocksCompleted.ketchup + completedBlocksCount.ketchup,
            relish: prev.blocksCompleted.relish + completedBlocksCount.relish
          }
        }));
        
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
  }, [board, textureBoard, rotationBoard, themeBoard, level, isValidMove]);

  const movePiece = useCallback((deltaX: number, deltaY: number) => {
    if (!currentPiece || gameOver || paused) return;

    if (isValidMove(currentPiece, deltaX, deltaY)) {
      setCurrentPiece(prev => prev ? { ...prev, x: prev.x + deltaX, y: prev.y + deltaY } : null);
    } else if (deltaY > 0) {
      // Piece hit bottom or another piece
      placePiece(currentPiece, currentPiece.theme || currentThemeRef.current);
    }
  }, [currentPiece, gameOver, paused, isValidMove, placePiece]);

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
          placePiece({ ...currentPiece, y: currentPiece.y + dropDistance }, currentPiece.theme || currentThemeRef.current);
        }
      }, 50);
    }
  }, [currentPiece, gameOver, paused, isValidMove, placePiece]);

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
      setCondimentStats({
        blocksUsed: { mustard: 0, ketchup: 0, relish: 0 },
        blocksCompleted: { mustard: 0, ketchup: 0, relish: 0 }
      });
      setGameOver(false);
      dropTime.current = INITIAL_DROP_TIME;
    }
    setPaused(false);
    lastDrop.current = Date.now();
  }, [gameOver]);

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
  }, []);

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
    condimentStats,
    movePiece,
    rotatePiece,
    dropPiece,
    startGame,
    pauseGame,
    resetGame,
    updateCurrentPieceTheme
  };
};