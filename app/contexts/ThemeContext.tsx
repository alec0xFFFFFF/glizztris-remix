import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CondimentTheme = 'mustard' | 'ketchup' | 'relish';

interface ThemeContextType {
  currentTheme: CondimentTheme;
  setTheme: (theme: CondimentTheme) => void;
  nextTheme: () => void;
  isRandomMode: boolean;
  getRandomTheme: () => CondimentTheme;
  resetToRandomMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<CondimentTheme>('mustard');
  const [isRandomMode, setIsRandomMode] = useState<boolean>(true);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('glizztris-theme') as CondimentTheme;
    const savedRandomMode = localStorage.getItem('glizztris-random-mode');
    
    if (savedTheme && ['mustard', 'ketchup', 'relish'].includes(savedTheme)) {
      setCurrentTheme(savedTheme);
    }
    
    // Only disable random mode if it was explicitly set to false
    if (savedRandomMode === 'false') {
      setIsRandomMode(false);
    }
  }, []);

  // Save theme to localStorage when it changes
  const setTheme = (theme: CondimentTheme) => {
    setCurrentTheme(theme);
    setIsRandomMode(false); // Disable random mode when user manually selects
    localStorage.setItem('glizztris-theme', theme);
    localStorage.setItem('glizztris-random-mode', 'false');
  };

  // Cycle to next theme
  const nextTheme = () => {
    const themes: CondimentTheme[] = ['mustard', 'ketchup', 'relish'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // Get random theme for pieces
  const getRandomTheme = (): CondimentTheme => {
    const themes: CondimentTheme[] = ['mustard', 'ketchup', 'relish'];
    return themes[Math.floor(Math.random() * themes.length)];
  };

  // Reset to random mode (for testing/debugging)
  const resetToRandomMode = () => {
    setIsRandomMode(true);
    localStorage.removeItem('glizztris-random-mode');
    localStorage.removeItem('glizztris-theme');
    setCurrentTheme('mustard');
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, nextTheme, isRandomMode, getRandomTheme, resetToRandomMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper function to get texture path for a given theme
export const getThemedTexturePath = (textureName: string, theme: CondimentTheme): string => {
  return `/glizztris-pieces/${theme}/${getTextureFileName(textureName)}`;
};

// Helper function to get the actual filename from texture name
const getTextureFileName = (textureName: string): string => {
  switch (textureName) {
    case 'block':
      return 'glizz-tris-block.png';
    case 'elbow-right':
      return 'glizz-tris-block-elbow-right.png';
    case 'elbow-left':
      return 'glizz-tris-block-elbow-left.png';
    case 't-center':
      return 'glizz-tris-block-t-center.png';
    case 'top_left':
      return 'glizz-tris-block_top_left.png';
    case 'top_right':
      return 'glizz-tris-block_top_right.png';
    case 'bottom_left':
      return 'glizz-tris-block_bottom_left.png';
    case 'bottom_right':
      return 'glizz-tris-block_bottom_right.png';
    default:
      return 'glizz-tris-block.png';
  }
};
