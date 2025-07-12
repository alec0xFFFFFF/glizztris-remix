# Glizztris TODO List

## 🏆 Leaderboard System

### Data Structure & Storage
- [ ] Create `LeaderboardEntry` interface
  ```typescript
  interface LeaderboardEntry {
    id: string;
    playerName: string;
    score: number;
    level: number;
    footLongsCompleted: number; // lines cleared
    gameDate: Date;
    gameDuration?: number; // in seconds
    pieceCount?: number; // total pieces placed
  }
  ```
- [ ] Implement local storage utilities for leaderboard data
- [ ] Create leaderboard hook (`useLeaderboard`)
- [ ] Add data validation and sanitization

### Leaderboard Categories
- [ ] **High Score**: Top overall scores
- [ ] **Most Foot Longs**: Most lines cleared in single game
- [ ] **Highest Level**: Deepest level reached
- [ ] **Speed Records**: Fastest to reach milestones (100 lines, level 10, etc.)
- [ ] **Efficiency**: Best score-to-time ratio

### UI Components
- [ ] Create `LeaderboardDisplay` component
- [ ] Create `PlayerNameInput` component for high score entry
- [ ] Create `LeaderboardModal` or dedicated route
- [ ] Add leaderboard navigation/tabs for different categories
- [ ] Create `PersonalStats` component
- [ ] Add "View Leaderboard" button to game over screen

### Game Integration
- [ ] Track game start time and duration
- [ ] Check for high score qualification on game over
- [ ] Show congratulations message for new records
- [ ] Add leaderboard access from main menu
- [ ] Implement score submission flow

### Advanced Features
- [ ] Player profiles with avatar selection
- [ ] Achievement system with badges
- [ ] Daily/weekly challenge leaderboards
- [ ] Score sharing (social media integration)
- [ ] Export/import leaderboard data

## 🎮 Next/Held Piece Display

### Core Functionality
- [ ] Add `nextPiece` state to tetris hook
- [ ] Add `heldPiece` state to tetris hook
- [ ] Implement piece hold mechanism (C key or hold button)
- [ ] Generate next piece preview (show 1-3 upcoming pieces)
- [ ] Add hold piece swap logic with cooldown

### UI Components
- [ ] Create `NextPieceDisplay` component
  - Mini game board showing next 1-3 pieces
  - Styled to match game aesthetic
  - Responsive sizing
- [ ] Create `HeldPieceDisplay` component
  - Shows currently held piece
  - Visual indicator when hold is on cooldown
  - "HOLD" label with hot dog theme
- [ ] Position displays on sides of main game board
- [ ] Add mobile-friendly layout adjustments

### Visual Design
- [ ] Use same hot dog textures for preview pieces
- [ ] Add "NEXT" and "HOLD" labels with glizzy styling
- [ ] Implement proper scaling for different screen sizes
- [ ] Add subtle animations for piece transitions
- [ ] Match color scheme with main game board

### Controls Integration
- [ ] Add 'C' key for hold functionality
- [ ] Add hold button for mobile interface
- [ ] Update control instructions
- [ ] Add hold piece tutorial/hints

## 🎨 UI/UX Improvements

### Theming & Customization
- [ ] **Condiment Theme Toggle**
  - [ ] Create condiment-themed piece textures
    - **Relish**: Green-tinted hot dog pieces
    - **Mustard**: Yellow/golden hot dog pieces  
    - **Ketchup**: Red-tinted hot dog pieces
    - **Classic**: Original hot dog textures
  - [ ] Add theme selector in settings/menu
  - [ ] Implement theme persistence in local storage
  - [ ] Update piece texture loading system to support themes
  - [ ] Add theme preview in selector
  - [ ] Consider theme-specific UI color schemes

### Game Board Enhancements
- [x] Fix container border to fit game board properly
- [ ] Add particle effects for line clears
- [ ] Implement screen shake on tetris (4-line clear)
- [ ] Add combo multiplier visual feedback

### Mobile Experience
- [ ] Improve touch controls responsiveness
- [ ] Add haptic feedback for piece placement
- [ ] Optimize layout for different screen orientations
- [ ] Add gesture hints overlay

### Accessibility
- [ ] Add keyboard navigation for menus
- [ ] Implement high contrast mode
- [ ] Add sound effects toggle
- [ ] Screen reader compatibility

## 🔧 Technical Improvements

### Performance
- [ ] Optimize rendering with React.memo
- [ ] Implement piece preview caching
- [ ] Add service worker for offline play
- [ ] Optimize image loading and caching

### Code Organization
- [ ] Refactor useTetris hook (currently empty file)
- [ ] Add TypeScript strict mode compliance
- [ ] Implement proper error boundaries
- [ ] Add unit tests for game logic

### Theming System
- [ ] Create theme configuration interface
  ```typescript
  interface GameTheme {
    id: string;
    name: string;
    pieceTextures: Record<string, string>;
    uiColors?: {
      primary: string;
      secondary: string;
      accent: string;
    };
  }
  ```
- [ ] Implement theme context provider
- [ ] Create theme switching utilities
- [ ] Add theme-aware texture loading in GameBoard
- [ ] Create condiment-specific texture assets

### Data Persistence
- [ ] Implement settings persistence
- [ ] Add game state save/resume
- [ ] Create backup/restore functionality
- [ ] Add data migration utilities

## 🎵 Audio & Effects

### Sound System
- [ ] Add piece placement sounds
- [ ] Add line clear sound effects
- [ ] Add background music toggle
- [ ] Add level up fanfare

### Visual Effects
- [ ] Add piece drop shadow
- [ ] Implement line clear animations
- [ ] Add level transition effects
- [ ] Create game over animation

## 🌐 Deployment & Distribution

### Production Ready
- [ ] Add error tracking (Sentry)
- [ ] Implement analytics
- [ ] Add PWA manifest
- [ ] Optimize bundle size

### Future Considerations
- [ ] Multiplayer support planning
- [ ] Cloud save integration
- [ ] Tournament mode
- [ ] Custom themes/skins

---

## Priority Order
1. **High Priority**: Next/Held piece display, Leaderboard core functionality
2. **Medium Priority**: UI/UX improvements, Mobile optimization
3. **Low Priority**: Advanced features, Audio effects, Multiplayer planning

## Notes
- Keep the hot dog/glizzy theme consistent throughout
- Maintain mobile-first responsive design
- Focus on smooth 60fps gameplay
- Preserve the retro Tetris feel with modern touches
