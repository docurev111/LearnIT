# Extracted Components Library

## Overview

This directory contains reusable components extracted from large screen files to improve code maintainability, testability, and reusability.

## Component Categories

### 📖 Scenario Components (`scenario/`)

Interactive components for scenario-based lessons with branching narratives.

#### ScenarioIntroScreen
Displays lesson introduction with title, description, difficulty badge, and action buttons.

```tsx
import { ScenarioIntroScreen } from '../components/scenario';

<ScenarioIntroScreen
  title="Ang Lindol sa Paaralan"
  description="Ikaw si Aiko, isang mag-aaral..."
  difficulty="⭐⭐⭐ Complex"
  onStart={handleStartScenario}
  onBack={() => router.back()}
/>
```

#### CharacterDialogue
Animated dialogue box with typewriter effect for character speech.

```tsx
import { CharacterDialogue } from '../components/scenario';

<CharacterDialogue
  character="Maria"
  dialogue="Uwaah! Huhuhu"
  characterColor="#FF6B9D"
  onNext={handleNextDialogue}
  showNextIndicator
/>
```

#### ChoiceButtons
Multiple choice buttons for branching narrative decisions.

```tsx
import { ChoiceButtons } from '../components/scenario';

<ChoiceButtons
  choices={[
    { text: 'Tumakbo palabas', action: 'run' },
    { text: 'Manatili sa ilalim ng mesa', action: 'duck' },
  ]}
  onChoice={handleChoice}
  centered
/>
```

#### BadEndingScreen
Failure screen with retry option for wrong choices.

```tsx
import { BadEndingScreen } from '../components/scenario';

<BadEndingScreen
  message="Ang pagtakbo sa panahon ng lindol ay mapanganib."
  onRetry={handleRetry}
  onGoBack={() => router.back()}
/>
```

#### CongratsScreen
Success screen for completed scenarios.

```tsx
import { CongratsScreen } from '../components/scenario';

<CongratsScreen
  title="🎉 Mahusay!"
  message="Natapos mo ang scenario nang tama!"
  onContinue={handleContinue}
  onGoBack={() => router.back()}
/>
```

---

### 🔄 Shared Components (`shared/`)

Common UI patterns used across multiple screens.

#### LoadingSpinner
Simple loading indicator with optional message.

```tsx
import { LoadingSpinner } from '../components/shared';

{isLoading && <LoadingSpinner message="Loading lessons..." />}
```

#### LoadingSkeleton
Animated placeholder for content that's loading.

```tsx
import { LoadingSkeleton } from '../components/shared';

<LoadingSkeleton width={200} height={20} borderRadius={8} />
<LoadingSkeleton width="100%" height={100} />
```

#### ErrorMessage
Error state display with retry action.

```tsx
import { ErrorMessage } from '../components/shared';

{error && (
  <ErrorMessage
    message="Failed to load lessons. Please try again."
    onRetry={fetchLessons}
  />
)}
```

---

## Benefits of Component Extraction

### Before (Monolithic Screen)
```tsx
// ScenarioScreen_L6.tsx - 1543 lines
export default function ScenarioScreenL6() {
  // 100+ lines of state
  // 500+ lines of effects and handlers
  // 900+ lines of JSX with inline styles
  // Difficult to test, reuse, or modify
}
```

### After (Modular Components)
```tsx
// ScenarioScreen_L6.tsx - ~300 lines
import {
  ScenarioIntroScreen,
  CharacterDialogue,
  ChoiceButtons,
  BadEndingScreen,
  CongratsScreen,
} from '../components/scenario';

export default function ScenarioScreenL6() {
  // Core scenario logic only
  // Delegates rendering to reusable components
}
```

### Advantages:
✅ **Easier to test** - Test components in isolation  
✅ **Reusable** - Use same components across multiple scenarios  
✅ **Maintainable** - Changes in one place affect all uses  
✅ **Readable** - Clear component boundaries and responsibilities  
✅ **Performant** - Can optimize individual components with `React.memo`  

---

## Migration Guide

### Step 1: Identify Reusable Patterns
Look for repeated JSX blocks or similar UI patterns across files.

### Step 2: Extract to Component
Create a new component file with:
- Clear JSDoc documentation
- TypeScript prop interface
- Isolated state and logic
- Reusable styles

### Step 3: Update Parent Screen
Replace inline JSX with component imports:

```tsx
// Before
<View style={styles.dialogueBox}>
  <View style={styles.characterBadge}>
    <Text style={styles.characterName}>{character}</Text>
  </View>
  <Text style={styles.dialogueText}>{dialogue}</Text>
</View>

// After
<CharacterDialogue
  character={character}
  dialogue={dialogue}
  characterColor="#6B73FF"
/>
```

### Step 4: Test Thoroughly
Ensure functionality remains identical after extraction.

---

## Future Enhancements

### Planned Extractions:
- [ ] **VideoPlayer** component (from scenario screens)
- [ ] **LessonCard** component (from FirstQuarter, ExploreScenarios)
- [ ] **ProfileCard** component (from HomeScreen)
- [ ] **QuestionCard** component (from QuizScreen)
- [ ] **ProgressBar** component (from various screens)
- [ ] **GameControls** component (from game screens)

### Improvements:
- [ ] Add unit tests for each component
- [ ] Add Storybook for component showcase
- [ ] Create theme system for consistent colors/spacing
- [ ] Add accessibility props to all components
- [ ] Performance optimization with React.memo

---

## Component Development Guidelines

### 1. Props Interface
Always define TypeScript interfaces for props:
```tsx
interface ComponentProps {
  /** Required prop description */
  requiredProp: string;
  /** Optional prop description */
  optionalProp?: number;
}
```

### 2. Documentation
Add JSDoc header with usage example:
```tsx
/**
 * ComponentName.tsx
 * 
 * Brief description.
 * 
 * @component
 * @example
 * ```tsx
 * <ComponentName prop="value" />
 * ```
 */
```

### 3. Default Props
Use default parameters for optional props:
```tsx
function Component({
  color = '#6B73FF',
  size = 'medium',
}: ComponentProps) { ... }
```

### 4. Accessibility
Include accessibility props where applicable:
```tsx
<TouchableOpacity
  accessible
  accessibilityLabel="Retry button"
  accessibilityRole="button"
>
```

---

## Questions?

Refer to `COMPONENT_STRUCTURE.md` for overall architecture guidelines.

See `COMPONENT_TEMPLATE.tsx` for the standard component template.

---

Last updated: October 8, 2025
