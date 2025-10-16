/**
 * SciSteps - Child-Friendly Educational App Theme
 * Designed for Grade 3 students (ages 8-9) with accessibility and engagement in mind
 */

import { Platform } from 'react-native';

// Child-friendly color palette
const primaryBlue = '#4A90E2';      // Bright, trustworthy blue
const secondaryOrange = '#FF9500';   // Warm, energetic orange
const successGreen = '#34C759';      // Vibrant success green
const warningYellow = '#FFCC02';     // Friendly warning yellow
const errorRed = '#FF3B30';          // Clear error red
const purpleAccent = '#AF52DE';      // Fun purple accent

export const Colors = {
  light: {
    // Primary colors
    primary: primaryBlue,
    secondary: secondaryOrange,
    accent: purpleAccent,
    
    // Status colors
    success: successGreen,
    warning: warningYellow,
    error: errorRed,
    
    // Text colors
    text: '#1D1D1F',           // High contrast for readability
    textSecondary: '#6D6D80',   // Softer secondary text
    textLight: '#8E8E93',       // Light text for hints
    
    // Background colors
    background: '#FFFFFF',
    backgroundSecondary: '#F2F2F7',
    backgroundTertiary: '#FFFFFF',
    
    // Interactive elements
    tint: primaryBlue,
    button: primaryBlue,
    buttonSecondary: secondaryOrange,
    
    // Navigation
    tabIconDefault: '#8E8E93',
    tabIconSelected: primaryBlue,
    
    // Cards and surfaces
    card: '#FFFFFF',
    cardBorder: '#E5E5EA',
    
    // Legacy support
    icon: '#6D6D80',
  },
  dark: {
    // Primary colors (adjusted for dark mode)
    primary: '#64B5F6',
    secondary: '#FFB74D',
    accent: '#CE93D8',
    
    // Status colors
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    
    // Text colors
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textLight: '#71717A',
    
    // Background colors
    background: '#000000',
    backgroundSecondary: '#1C1C1E',
    backgroundTertiary: '#2C2C2E',
    
    // Interactive elements
    tint: '#64B5F6',
    button: '#64B5F6',
    buttonSecondary: '#FFB74D',
    
    // Navigation
    tabIconDefault: '#A1A1AA',
    tabIconSelected: '#64B5F6',
    
    // Cards and surfaces
    card: '#1C1C1E',
    cardBorder: '#38383A',
    
    // Legacy support
    icon: '#A1A1AA',
  },
};

// Child-friendly typography system
export const Typography = {
  // Headers - Large, bold, attention-grabbing
  h1: {
    fontSize: 32,
    fontWeight: '800' as const,
    lineHeight: 38,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 30,
  },
  
  // Body text - Clear and readable
  body: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  
  // Interactive elements
  button: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  buttonSmall: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  
  // Special text
  caption: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
};

// Spacing system for consistent layouts
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius for child-friendly rounded corners
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 50,
};

// Shadow system for depth and engagement
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Platform-specific fonts with child-friendly options
export const Fonts = Platform.select({
  ios: {
    regular: 'SF Pro Display',
    rounded: 'SF Pro Rounded',
    bold: 'SF Pro Display',
    mono: 'Menlo',
  },
  android: {
    regular: 'Roboto',
    rounded: 'Roboto',
    bold: 'Roboto',
    mono: 'monospace',
  },
  default: {
    regular: 'System',
    rounded: 'System',
    bold: 'System',
    mono: 'monospace',
  },
  web: {
    regular: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    rounded: "'SF Pro Rounded', 'Comic Sans MS', cursive, sans-serif",
    bold: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Animation durations for smooth interactions
export const Animations = {
  fast: 150,
  normal: 250,
  slow: 350,
};

// Touch target sizes for child-friendly interactions
export const TouchTargets = {
  small: 44,    // Minimum recommended
  medium: 56,   // Comfortable for children
  large: 72,    // Easy for small fingers
};
