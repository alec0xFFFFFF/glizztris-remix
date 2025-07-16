import React, { useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useTetris } from '../hooks/useTetris';
import { useTheme, getThemedTexturePath } from '../contexts/ThemeContext';
import GameBoard from './GameBoard';
import ThemeToggle from './ThemeToggle';
import { Button } from '~/components/ui/button';

export interface TetrisGameRef {
  pause: () => void;
  resume: () => void;
  isPaused: boolean;
}

export const TetrisGame = forwardRef<TetrisGameRef, { onClose?: () => void }>(
  function TetrisGame({ onClose }, ref) {
  const { currentTheme, nextTheme, isRandomMode, getRandomTheme } = useTheme();
  const { 
    board, 
    textureBoard,
    rotationBoard,
    themeBoard,
    animatingLines,
    currentPiece,
    nextPiece, 
    score,
    highScore,
    isNewHighScore, 
    level, 
    lines, 
    gameOver,
    gameStarted, 
    paused,
    condimentStats,
    movePiece, 
    rotatePiece, 
    dropPiece, 
    startGame, 
    pauseGame
  } = useTetris(currentTheme, isRandomMode, getRandomTheme);

  // Note: Removed theme updating effect to prevent board freezing issues

  // Touch gesture handling
  const [touchStart, setTouchStart] = React.useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now()
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now()
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart) return;
    
    // If no touchEnd, it's a tap
    if (!touchEnd) {
      rotatePiece();
      return;
    }
    
    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    const minSwipeDistance = 50;
    const tapThreshold = 10; // Small movement threshold for tap detection
    
    // Check if it's a tap (small movement)
    if (Math.abs(deltaX) < tapThreshold && Math.abs(deltaY) < tapThreshold) {
      rotatePiece();
      return;
    }
    
    // Calculate swipe time and velocity
    const swipeTime = touchEnd.time - touchStart.time;
    const velocityX = Math.abs(deltaX) / swipeTime;
    
    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        // Calculate blocks to move based on velocity (faster swipe = more blocks)
        const blocksToMove = velocityX > 1.0 ? 3 : velocityX > 0.5 ? 2 : 1;
        
        if (deltaX > 0) {
          // Swipe left
          for (let i = 0; i < blocksToMove; i++) {
            movePiece(-1, 0);
          }
        } else {
          // Swipe right
          for (let i = 0; i < blocksToMove; i++) {
            movePiece(1, 0);
          }
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY < 0) {
          // Swipe down - drop piece
          dropPiece();
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
        rotatePiece();
        break;
      case ' ':
        event.preventDefault();
        dropPiece();
        break;
      case 'ArrowUp':
        event.preventDefault();
        nextTheme();
        break;
    }
  }, [gameOver, paused, movePiece, rotatePiece, dropPiece, nextTheme]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Don't auto-start - wait for user to start

  // Render next piece preview
  const renderNextPiece = () => {
    if (!nextPiece) return null;
    
    // Find the actual bounds of the piece (non-zero cells)
    let minY = nextPiece.shape.length;
    let maxY = -1;
    let minX = nextPiece.shape[0].length;
    let maxX = -1;
    
    for (let y = 0; y < nextPiece.shape.length; y++) {
      for (let x = 0; x < nextPiece.shape[y].length; x++) {
        if (nextPiece.shape[y][x]) {
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
        }
      }
    }
    
    const pieceHeight = maxY - minY + 1;
    const pieceWidth = maxX - minX + 1;
    
    return (
      <div className="bg-black/50 p-2 rounded-lg border-2 border-yellow-600">
        <div className="text-yellow-400 text-xs font-bold mb-1 text-center" style={{ fontFamily: 'monospace' }}>
          NEXT
        </div>
        <div className="flex items-center justify-center" style={{ minHeight: '64px' }}>
          <div className="grid gap-0.5" style={{ gridTemplateRows: `repeat(${pieceHeight}, 1fr)` }}>
            {nextPiece.shape.slice(minY, maxY + 1).map((row, y) => (
              <div key={y} className="flex gap-0.5">
                {row.slice(minX, maxX + 1).map((cell, x) => {
                  const actualY = y + minY;
                  const actualX = x + minX;
                  
                  return cell ? (
                    <div
                      key={x}
                      className="w-4 h-4 border border-gray-600"
                      style={{ imageRendering: 'pixelated' }}
                    >
                      <img
                        src={getThemedTexturePath(
                          nextPiece.textures[actualY][actualX],
                          nextPiece.theme || currentTheme
                        )}
                        alt="Next piece"
                        className="w-full h-full object-cover"
                        style={{ 
                          imageRendering: 'pixelated',
                          transform: nextPiece.rotations[actualY][actualX] ? 
                            `rotate(${nextPiece.rotations[actualY][actualX]}deg)` : undefined
                        }}
                      />
                    </div>
                  ) : (
                    <div key={x} className="w-4 h-4" />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

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
          <ThemeToggle />
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs px-2 py-1">
            Close
          </Button>
        )}
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800">
        {!gameStarted ? (
          /* Landing Screen */
          <div className="text-center max-w-md space-y-6">
            {/* Main Logo */}
            <div className="space-y-2">
              <div className="text-6xl mb-4">🌭</div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent" style={{ fontFamily: 'monospace' }}>
                GLIZZTRIS
              </h1>
              <p className="text-lg text-orange-300 font-bold">
                The Ultimate Hot Dog Tetris Experience!
              </p>
            </div>

            {/* Selling Points */}
            <div className="space-y-4 text-left bg-black/50 p-4 rounded-lg border-2 border-yellow-600">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="text-yellow-400 font-bold text-sm">Stack & Clear Lines</div>
                  <div className="text-gray-300 text-xs">Build the perfect hot dog with condiment blocks!</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🟡🔴🟢</span>
                <div>
                  <div className="text-yellow-400 font-bold text-sm">Three Condiment Themes</div>
                  <div className="text-gray-300 text-xs">Mustard, Ketchup, and Relish - collect them all!</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <div className="text-yellow-400 font-bold text-sm">Mobile Optimized</div>
                  <div className="text-gray-300 text-xs">Swipe gestures and touch controls for smooth gameplay</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <div className="text-yellow-400 font-bold text-sm">Track Your Progress</div>
                  <div className="text-gray-300 text-xs">Beat your high score and master each condiment!</div>
                </div>
              </div>
            </div>

            {/* High Score Display */}
            {highScore > 0 && (
              <div className="bg-gradient-to-r from-amber-900 to-amber-700 p-3 rounded-lg border-2 border-yellow-500">
                <div className="text-yellow-300 text-sm font-bold">Your Best Score</div>
                <div className="text-yellow-100 text-2xl font-black" style={{ fontFamily: 'monospace' }}>
                  {highScore.toLocaleString()}
                </div>
                <div className="text-yellow-400 text-xs">Think you can beat it?</div>
              </div>
            )}

            {/* Call to Action */}
            <div className="space-y-3">
              <button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 active:from-orange-800 active:to-red-800 text-white font-black text-xl py-4 px-8 rounded-lg border-4 border-yellow-500 shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95"
                style={{ fontFamily: 'monospace' }}
              >
                🚀 START PLAYING 🚀
              </button>
              <p className="text-gray-400 text-xs">
                Swipe to move • Tap to rotate • Space to drop
              </p>
            </div>
          </div>
        ) : (
          /* Game Screen */
          <>
            {/* Score Info */}
            <div className="w-full max-w-lg mb-2">
              <div className="flex justify-between text-yellow-400 text-xs font-bold" style={{ fontFamily: 'monospace' }}>
                <div>SCORE: {score.toLocaleString()}</div>
                <div>HIGH: {highScore.toLocaleString()}</div>
                <div>LVL: {level}</div>
                <div>FOOT LONGS: {lines}</div>
              </div>
            </div>

        {/* Main Game Container */}
        <div className="flex gap-4 items-start">
          {/* Left Column - Game Board */}
          <div className="flex flex-col items-center">
            {/* Condiment Stats - hide during game over */}
            {!gameOver && (
              <div className="w-full max-w-xs mb-2">
                <div className="grid grid-cols-3 gap-1 text-xs" style={{ fontFamily: 'monospace' }}>
                  <div className="text-center">
                    <div className="text-yellow-400 font-bold">🟡 MUSTARD</div>
                    <div className="text-yellow-300">Used: {condimentStats.blocksUsed.mustard}</div>
                    <div className="text-yellow-200">Done: {condimentStats.blocksCompleted.mustard}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-400 font-bold">🔴 KETCHUP</div>
                    <div className="text-red-300">Used: {condimentStats.blocksUsed.ketchup}</div>
                    <div className="text-red-200">Done: {condimentStats.blocksCompleted.ketchup}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-bold">🟢 RELISH</div>
                    <div className="text-green-300">Used: {condimentStats.blocksUsed.relish}</div>
                    <div className="text-green-200">Done: {condimentStats.blocksCompleted.relish}</div>
                  </div>
                </div>
              </div>
            )}

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
                themeBoard={themeBoard}
                animatingLines={animatingLines}
                currentPiece={currentPiece}
                gameOver={gameOver}
              />
            </div>
          </div>

          {/* Right Column - Next Piece */}
          {!gameOver && (
            <div className="flex flex-col gap-2">
              {renderNextPiece()}
            </div>
          )}
        </div>

        {/* Game Over Stats */}
        {gameOver && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative text-center bg-black/90 p-4 rounded-lg border-2 border-yellow-600 max-w-md w-full">
              {isNewHighScore && (
                <div className="mb-3 p-2 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-lg border-2 border-yellow-400">
                  <p className="text-black font-bold text-lg" style={{ fontFamily: 'monospace' }}>
                    🎉 NEW HIGH SCORE! 🎉
                  </p>
                </div>
              )}
              <p className="text-yellow-200 font-bold text-xl mb-3" style={{ fontFamily: 'monospace' }}>
                GAME OVER!
              </p>
            <div className="text-yellow-400 text-sm mb-3" style={{ fontFamily: 'monospace' }}>
              <div>FINAL SCORE: {score.toLocaleString()}</div>
              <div>HIGH SCORE: {highScore.toLocaleString()}</div>
              <div>LEVEL: {level}</div>
              <div>FOOT LONGS: {lines}</div>
            </div>
            <div className="text-xs space-y-2" style={{ fontFamily: 'monospace' }}>
              <div className="text-yellow-300">
                🟡 MUSTARD: {condimentStats.blocksUsed.mustard} used / {condimentStats.blocksCompleted.mustard} completed
                {condimentStats.blocksUsed.mustard > 0 && (
                  <span className="text-yellow-200"> ({Math.round((condimentStats.blocksCompleted.mustard / condimentStats.blocksUsed.mustard) * 100)}%)</span>
                )}
              </div>
              <div className="text-red-300">
                🔴 KETCHUP: {condimentStats.blocksUsed.ketchup} used / {condimentStats.blocksCompleted.ketchup} completed
                {condimentStats.blocksUsed.ketchup > 0 && (
                  <span className="text-red-200"> ({Math.round((condimentStats.blocksCompleted.ketchup / condimentStats.blocksUsed.ketchup) * 100)}%)</span>
                )}
              </div>
              <div className="text-green-300">
                🟢 RELISH: {condimentStats.blocksUsed.relish} used / {condimentStats.blocksCompleted.relish} completed
                {condimentStats.blocksUsed.relish > 0 && (
                  <span className="text-green-200"> ({Math.round((condimentStats.blocksCompleted.relish / condimentStats.blocksUsed.relish) * 100)}%)</span>
                )}
              </div>
            </div>
            <div className="mt-3 text-yellow-400 text-xs">
              TOTAL BLOCKS: {condimentStats.blocksUsed.mustard + condimentStats.blocksUsed.ketchup + condimentStats.blocksUsed.relish} used / {condimentStats.blocksCompleted.mustard + condimentStats.blocksCompleted.ketchup + condimentStats.blocksCompleted.relish} completed
            </div>
            </div>
          </div>
        )}
        
        {/* Paused Status */}
        {paused && !gameOver && (
          <div className="mb-2 text-center">
            <p className="text-yellow-200 font-bold text-base" style={{ fontFamily: 'monospace' }}>
              PAUSED
            </p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="w-full max-w-xs mb-2">
          <div className="flex justify-center gap-2">
            {gameOver ? (
              <button
                onClick={startGame}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold border-2 border-green-800 transition-colors text-xs"
                style={{ fontFamily: 'monospace' }}
              >
                {currentPiece ? 'NEW GAME' : 'START GAME'}
              </button>
            ) : (
              <button
                onClick={paused ? startGame : pauseGame}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold border-2 border-red-800 transition-colors text-xs"
                style={{ fontFamily: 'monospace' }}
              >
                {paused ? 'RESUME' : 'PAUSE'}
              </button>
            )}
          </div>
        </div>
          </>
        )}
      </div>

      {/* Touch Controls */}
      <div className="bg-slate-800 border-t-2 border-slate-600 p-2">
        {/* Instructions */}
        <div className="text-center mb-2">
          <p className="text-slate-300 text-xs">
            Swipe: ← → ↓(drop) | Tap: rotate | Space: drop | ↓: rotate | ↑: theme
            {isRandomMode && <span className="text-yellow-400"> (Random condiments active!)</span>}
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
          
          {/* Soft Drop */}
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