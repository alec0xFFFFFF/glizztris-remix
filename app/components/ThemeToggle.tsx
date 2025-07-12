import React from 'react';
import { useTheme, CondimentTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { currentTheme, setTheme, isRandomMode, resetToRandomMode } = useTheme();

  const themes: { value: CondimentTheme; label: string; emoji: string; color: string }[] = [
    { value: 'mustard', label: 'Mustard', emoji: '🟡', color: 'bg-yellow-500' },
    { value: 'ketchup', label: 'Ketchup', emoji: '🔴', color: 'bg-red-500' },
    { value: 'relish', label: 'Relish', emoji: '🟢', color: 'bg-green-500' },
  ];

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-slate-300 mr-1">
        {isRandomMode ? 'Random:' : 'Theme:'}
      </span>
      {themes.map((theme) => (
        <button
          key={theme.value}
          onClick={() => setTheme(theme.value)}
          className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs
            ${isRandomMode 
              ? 'border-yellow-400 animate-pulse border-dashed' 
              : currentTheme === theme.value 
                ? 'border-white shadow-lg' 
                : 'border-gray-400 opacity-70 hover:opacity-100'
            }
            ${theme.color}
            transition-all duration-200
          `}
          title={theme.label}
        >
          {theme.emoji}
        </button>
      ))}
      {/* Debug button - remove in production */}
      <button
        onClick={resetToRandomMode}
        className="ml-2 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-500"
        title="Reset to Random Mode (Debug)"
      >
        🎲
      </button>
    </div>
  );
};

export default ThemeToggle;
