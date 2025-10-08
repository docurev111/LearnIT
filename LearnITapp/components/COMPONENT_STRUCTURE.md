# Component Organization Guide

## Folder Structure

```
components/
├── lesson/          # Lesson-related reusable components
├── game/            # Game components (memory, scramble, catch)
├── scenario/        # Scenario/dialogue components
├── quiz/            # Quiz-related components
├── shared/          # Shared UI components (buttons, cards, inputs)
└── [root]/          # General components (BottomNav, Notifications, etc.)
```

## Naming Conventions

### Files
- **Screens**: `PascalCase` + `Screen` suffix (e.g., `HomeScreen.tsx`)
- **Components**: `PascalCase` (e.g., `LessonCard.tsx`, `ProfileAvatar.tsx`)
- **Modals**: `PascalCase` + `Modal` suffix (e.g., `LessonIntroModal.tsx`)
- **Utilities**: `camelCase` (e.g., `formatDate.ts`, `calculateXP.ts`)

### Component Names
- File name should match the default export name
  - ✅ File: `FirstQuarter.tsx` → Export: `export default function FirstQuarter()`
  - ❌ File: `FirstQuarter.tsx` → Export: `export default function LessonsScreen()`

### Avoid
- Underscores in component names (`Modal_simple` ❌)
- Duplicate versions without clear naming (`GamesScreen`, `GamesScreenNew`, `GamesScreenOld` ❌)
- Generic names that don't match purpose

## Documentation Standards

Every major component should have a JSDoc header:

```tsx
/**
 * ComponentName.tsx
 * 
 * Brief description of what this component does.
 * 
 * @component
 * @param {Type} propName - Description
 * 
 * Features:
 * - Feature 1
 * - Feature 2
 * 
 * TODO: Future improvements
 * - Item 1
 * - Item 2
 */
```

## When to Extract a Component

Extract into a reusable component when:
1. **Repeated code**: Same UI pattern used 3+ times
2. **Complex logic**: Component has 300+ lines
3. **Single responsibility**: Component does multiple unrelated things
4. **Testing**: Isolated logic needs unit tests

## Component Extraction Checklist

- [ ] Create new file in appropriate subfolder
- [ ] Add JSDoc documentation
- [ ] Define clear prop interface (TypeScript)
- [ ] Move component logic
- [ ] Update imports in parent file
- [ ] Test functionality

## Examples

### Good Component Structure
```tsx
// components/lesson/LessonCard.tsx
interface LessonCardProps {
  lesson: Lesson;
  onPress: () => void;
  progress?: number;
}

export default function LessonCard({ lesson, onPress, progress }: LessonCardProps) {
  // Component implementation
}
```

### Good Screen Structure
```tsx
// app/HomeScreen.tsx
import LessonCard from '../components/lesson/LessonCard';
import ProfileCard from '../components/shared/ProfileCard';

export default function HomeScreen() {
  // Screen uses composed components
  return (
    <View>
      <ProfileCard user={user} />
      <LessonCard lesson={lesson} onPress={handlePress} />
    </View>
  );
}
```

## Migration Priority

1. ✅ Rename inconsistent files
2. ✅ Add documentation to large screens
3. 🔄 Extract components from 1000+ line files
4. 🔄 Create shared UI library
5. 📋 Add TypeScript prop interfaces
6. 📋 Write unit tests for extracted components

---

Last updated: October 8, 2025
