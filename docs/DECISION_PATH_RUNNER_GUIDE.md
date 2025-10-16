# Decision Path Runner Game

## Overview
Decision Path Runner is a Pou-inspired interactive game where players make moral decisions through a cute, animated character. The game features a charming virtual pet aesthetic with expressive facial animations and a friendly, engaging design.

## Game Features

### Gameplay Mechanics
- **Jump**: Press the Jump button when facing high obstacles (good choices)
- **Duck**: Press the Duck button when facing low obstacles (moral dilemmas)
- **Scoring**: +10 points for each correct decision
- **Lives System**: Start with 3 lives, lose one for each bad decision
- **Progressive Difficulty**: Game speed increases every 10 seconds

### Scenarios
The game includes 8 Filipino values-based scenarios:
1. Finding a wallet on the street
2. Classmate cheating on exam
3. Friends fighting
4. Litter on the ground
5. Lonely student
6. Peer pressure situations
7. Elderly person crossing the street
8. Sibling's diary privacy

Each scenario presents a good choice and a bad choice, requiring quick decision-making.

### Design (Pou-Inspired)
- **Cute Character**: Round purple gradient character with expressive face animations
- **Sky Blue Gradient Background**: Light, cheerful atmosphere (#87CEEB → #B0E0E6)
- **Speech Bubble UI**: Scenarios presented in chat bubble style
- **Bouncy Animations**: Spring-based animations with idle breathing effect
- **Facial Expressions**: 4 expressions (thinking, happy, sad, excited)
- **Rounded Stats**: Bubble-style stat display with heart and star icons
- **Gradient Buttons**: Colorful, rounded buttons with icon circles
- **Soft Shadows**: Pou-like depth and dimension

### Screens
1. **Start Screen**
   - Game title and instructions
   - Visual guide for jump and duck actions
   - Professional tips box
   - Start button

2. **Game Screen**
   - Score and lives display
   - Real-time feedback messages
   - Animated player character
   - Moving obstacles with scenarios
   - Jump and Duck control buttons

3. **Game Over Screen**
   - Final score display
   - Statistics (points earned, correct decisions)
   - Restart button
   - Return to menu option

## Technical Details

### File Location
`LearnITapp/app/DecisionPathRunner.tsx`

### Navigation
- Accessible from GamesScreen
- Integrated with expo-router
- Back button support

### Dependencies
- React Native
- expo-linear-gradient
- @expo/vector-icons (Ionicons)
- expo-router

### Performance
- Optimized animations using `useNativeDriver: true`
- Efficient obstacle spawning and cleanup
- Position tracking for accurate collision detection

## Color Scheme (Pou-Inspired)
- **Background Gradient**: #87CEEB → #98D8E8 → #B0E0E6 (Sky blue)
- **Character**: #A78BFA → #8B5CF6 (Purple gradient)
- **Jump Button**: #6BCF7F → #4CAF50 (Green gradient)
- **Duck Button**: #FFB75E → #FF9800 (Orange gradient)
- **Active State Jump**: #4ECDC4 → #44A08D (Teal)
- **Active State Duck**: #FF9A8B → #FF6A88 (Pink-red)
- **UI Elements**: #FFFFFF (White bubbles and cards)
- **Text/Icons**: #5D4E37 (Brown)
- **Heart Icon**: #FF6B6B (Red)
- **Star Icon**: #FFD93D (Yellow)

## Future Enhancements
- Add sound effects for actions and collisions
- Include power-ups (shield, slow-motion)
- Leaderboard integration
- Achievement system
- More scenario categories
- Daily challenges
