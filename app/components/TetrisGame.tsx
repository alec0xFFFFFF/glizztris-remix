import React, { useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useTetris } from '../hooks/useTetris';
import GameBoard from './GameBoard';
import { Button } from '~/components/ui/button';

export interface TetrisGameRef {
  pause: () => void;
  resume: () => void;
  isPaused: boolean;
}

export const TetrisGame = forwardRef<TetrisGameRef, { onClose?: () => void }>(
  function TetrisGame({ onClose }, ref) {
  const { 
    board, 
    textureBoard,
    rotationBoard,
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
    resetGame 
  } = useTetris();

  // Touch gesture handling
  const [touchStart, setTouchStart] = React.useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    const minSwipeDistance = 50;
    
    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          // Swipe left
          movePiece(-1, 0);
        } else {
          // Swipe right
          movePiece(1, 0);
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY < 0) {
          // Swipe down
          movePiece(0, 1);
        }
      }
    }
  };

  useImperativeHandle(ref, () => ({
    pause: pauseGame,
    resume: startGame,
    isPaused: paused
  }));

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameOver || paused) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        movePiece(-1, 0);
        break;
      case 'ArrowRight':
        event.preventDefault();
        movePiece(1, 0);
        break;
      case 'ArrowDown':
        event.preventDefault();
        movePiece(0, 1);
        break;
      case ' ':
        event.preventDefault();
        rotatePiece();
        break;
      case 'ArrowUp':
        event.preventDefault();
        dropPiece();
        break;
    }
  }, [gameOver, paused, movePiece, rotatePiece, dropPiece]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Start game on mount
  useEffect(() => {
    if (gameOver) {
      startGame();
    }
  }, [gameOver, startGame]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50 touch-none">
      {/* Header */}
      <div className="flex justify-between items-center p-2 bg-gradient-to-r from-amber-900 to-amber-800 border-b-2 border-yellow-600">
        <div className="flex items-center gap-2">
          <div className="text-lg">🌭</div>
          <div>
            <h2 className="text-base font-black bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              GLIZZTRIS
            </h2>
          </div>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs px-2 py-1">
            Close
          </Button>
        )}
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-start p-1 bg-gradient-to-br from-slate-900 to-slate-800">
        {/* Score Info */}
        <div className="w-full max-w-xs mb-2">
          <div className="flex justify-between text-yellow-400 text-xs font-bold" style={{ fontFamily: 'monospace' }}>
            <div>SCORE: {score.toLocaleString()}</div>
            <div>LVL: {level}</div>
            <div>FOOT LONGS COMPLETED: {lines}</div>
          </div>
        </div>

        {/* Game Board */}
        <div 
          className="mb-2 flex items-center justify-center" 
          style={{
            imageRendering: 'pixelated'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={() => rotatePiece()}
        >
          <GameBoard 
            board={board}
            textureBoard={textureBoard}
            rotationBoard={rotationBoard}
            animatingLines={animatingLines}
            currentPiece={currentPiece}
            gameOver={gameOver}
          />
        </div>

        {/* Game Status */}
        {(gameOver || paused) && (
          <div className="mb-2 text-center">
            <p className="text-yellow-200 font-bold text-base" style={{ fontFamily: 'monospace' }}>
              {gameOver ? 'GAME OVER!' : 'PAUSED'}
            </p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="w-full max-w-xs mb-2">
          <div className="flex justify-center gap-2">
            {!gameOver ? (
              <button
                onClick={paused ? startGame : pauseGame}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold border-2 border-red-800 transition-colors text-xs"
                style={{ fontFamily: 'monospace' }}
              >
                {paused ? 'RESUME' : 'PAUSE'}
              </button>
            ) : (
              <button
                onClick={resetGame}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold border-2 border-green-800 transition-colors text-xs"
                style={{ fontFamily: 'monospace' }}
              >
                NEW GAME
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Touch Controls */}
      <div className="bg-slate-800 border-t-2 border-slate-600 p-2">
        {/* Instructions */}
        <div className="text-center mb-2">
          <p className="text-slate-300 text-xs">
            Swipe board: ← → ↓ | Double-tap: rotate
          </p>
        </div>
        
        <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
          {/* Left */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              movePiece(-1, 0);
            }}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 px-2 rounded border-2 border-blue-800 transition-colors text-sm"
            style={{ fontFamily: 'monospace' }}
          >
            ←
          </button>
          
          {/* Down */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              movePiece(0, 1);
            }}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 px-2 rounded border-2 border-blue-800 transition-colors text-sm"
            style={{ fontFamily: 'monospace' }}
          >
            ↓
          </button>
          
          {/* Right */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              movePiece(1, 0);
            }}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 px-2 rounded border-2 border-blue-800 transition-colors text-sm"
            style={{ fontFamily: 'monospace' }}
          >
            →
          </button>
          
          {/* Rotate */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              rotatePiece();
            }}
            className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold py-2 px-2 rounded border-2 border-purple-800 transition-colors text-sm"
            style={{ fontFamily: 'monospace' }}
          >
            ↻
          </button>
        </div>
        
        {/* Drop Button */}
        <div className="mt-2 max-w-xs mx-auto">
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              dropPiece();
            }}
            className="w-full bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold py-2 px-4 rounded border-2 border-orange-800 transition-colors text-sm"
            style={{ fontFamily: 'monospace' }}
          >
            DROP ⬇
          </button>
        </div>
      </div>
    </div>
  );
});