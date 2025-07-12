import React from 'react';
import { Piece, ThemeBoard } from '../types/tetris';
import { useTheme, getThemedTexturePath } from '../contexts/ThemeContext';

interface GameBoardProps {
  board: (number | null)[][];
  textureBoard: (string | null)[][];
  rotationBoard: (number | null)[][];
  themeBoard: ThemeBoard;
  animatingLines: number[];
  currentPiece: Piece | null;
  gameOver: boolean;
}

// This function is now replaced by getThemedTexturePath from ThemeContext

const GameBoard: React.FC<GameBoardProps> = ({ board, textureBoard, rotationBoard, themeBoard, animatingLines, currentPiece, gameOver }) => {
  const { currentTheme } = useTheme();
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    const displayTextureBoard = textureBoard.map(row => [...row]);
    const displayRotationBoard = rotationBoard.map(row => [...row]);
    const isPieceBoard: boolean[][] = Array(20).fill(null).map(() => Array(10).fill(false));
    
    // Override textures for animating lines - change them all to 'block' texture with no rotation
    animatingLines.forEach(lineIndex => {
      for (let x = 0; x < 10; x++) {
        if (displayBoard[lineIndex][x] !== null) {
          displayTextureBoard[lineIndex][x] = 'block';
          displayRotationBoard[lineIndex][x] = 0;
        }
      }
    });
    
    // Add current falling piece to display board with specific textures and rotations
    if (currentPiece && !gameOver) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const boardY = currentPiece.y + y;
            const boardX = currentPiece.x + x;
            if (boardY >= 0 && boardY < 20 && boardX >= 0 && boardX < 10) {
              displayBoard[boardY][boardX] = currentPiece.type;
              displayTextureBoard[boardY][boardX] = currentPiece.textures[y][x];
              displayRotationBoard[boardY][boardX] = currentPiece.rotations[y][x];
              isPieceBoard[boardY][boardX] = true; // This is a falling piece
            }
          }
        });
      });
    }
    
    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={x}
            className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 relative ${
              cell !== null 
                ? 'border border-gray-600' 
                : 'bg-gray-800 border border-gray-700'
            }`}
            style={{ 
              imageRendering: 'pixelated'
            }}
          >
            {cell !== null && displayTextureBoard[y][x] && (
              <img
                src={getThemedTexturePath(
                  displayTextureBoard[y][x]!,
                  isPieceBoard[y][x] 
                    ? (currentPiece?.theme || currentTheme) // Use falling piece's assigned theme
                    : (themeBoard[y][x] || currentTheme) // Use placed piece's original theme or current theme
                )}
                alt="Hot dog piece"
                className="w-full h-full object-cover"
                style={{ 
                  imageRendering: 'pixelated',
                  transform: displayRotationBoard[y][x] ? `rotate(${displayRotationBoard[y][x]}deg)` : undefined
                }}
              />
            )}
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div 
      className="inline-block border-2 sm:border-3 md:border-4 border-gray-600 bg-gray-900 p-1 sm:p-2"
      style={{ 
        boxShadow: 'inset 0 0 0 1px #374151',
        imageRendering: 'pixelated'
      }}
    >
      {renderBoard()}
    </div>
  );
};

export default GameBoard;