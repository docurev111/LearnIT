# Style Architecture Guide

This directory contains externalized styles for better code organization and maintainability.

## Structure

- `HomeScreenStyles.ts` - Styles specific to the HomeScreen component
- `LoginScreenStyles.ts` - Styles for the LoginScreen with responsive utilities
- `ProfileScreenStyles.ts` - Styles for the ProfileScreen with achievement/stats styles
- `LeaderboardScreenStyles.ts` - Styles for the LeaderboardScreen with podium/ranking styles
- `CommonStyles.ts` - Shared styles, color palette, and design tokens
- `index.ts` - Central export file for easy imports

## Usage

### Import styles in components:
```tsx
// Import specific screen styles and common utilities
import { 
  homeScreenStyles, 
  loginScreenStyles, 
  profileScreenStyles, 
  leaderboardScreenStyles, 
  commonStyles, 
  colors 
} from '../styles';

// Import responsive utilities for LoginScreen
import { 
  getResponsiveFontSize, 
  getResponsiveSpacing, 
  getResponsiveImageSize 
} from '../styles';
```

### Apply styles:
```tsx
<View style={homeScreenStyles.container}>
  <Text style={homeScreenStyles.title}>Hello World</Text>
</View>

// Using responsive utilities
<Text style={[
  loginScreenStyles.title,
  { fontSize: getResponsiveFontSize(24) }
]}>
  Responsive Text
</Text>
```

## Benefits

1. **Better Organization**: Styles are separated from component logic
2. **Reusability**: Common styles and design tokens can be shared
3. **Maintainability**: Easier to update styles across the app
4. **Consistency**: Centralized color palette and design system
5. **Performance**: Styles are created once and reused

## Design Tokens

The `CommonStyles.ts` file includes:
- Color palette (`colors` object)
- Common UI patterns
- Shared component styles
- Design system foundations

## Adding New Screen Styles

1. Create a new file: `[ScreenName]Styles.ts`
2. Follow the existing pattern and structure
3. Export from `index.ts`
4. Import in your component

## Best Practices

- Group related styles together
- Use descriptive names for style objects
- Leverage common colors and patterns
- Keep screen-specific styles in separate files
- Use TypeScript for better type safety