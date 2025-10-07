import { StyleSheet } from 'react-native';

// Common colors used throughout the app
export const colors = {
  primary: '#4A3AFF',
  primaryLight: '#F4F2FF',
  secondary: '#7A5CFA',
  success: '#4CAF50',
  error: '#FF6B6B',
  warning: '#FFC107',
  
  // Text colors
  textPrimary: '#333',
  textSecondary: '#666',
  textLight: '#999',
  textWhite: '#fff',
  
  // Background colors
  background: '#fff',
  backgroundLight: '#F2F2F2',
  backgroundDark: '#E5E5E5',
  
  // Border colors
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
};

// Common dimensions
export const dimensions = {
  padding: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
  },
  margin: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
};

// Common/shared styles that can be reused across screens
export const commonStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    padding: dimensions.padding.lg,
    paddingBottom: 100,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Text styles
  titleText: {
    fontSize: dimensions.fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headingText: {
    fontSize: dimensions.fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  bodyText: {
    fontSize: dimensions.fontSize.md,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  captionText: {
    fontSize: dimensions.fontSize.xs,
    color: colors.textLight,
  },

  // Button styles
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: dimensions.padding.sm,
    paddingHorizontal: dimensions.padding.md,
    borderRadius: dimensions.borderRadius.xl,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.textWhite,
    fontSize: dimensions.fontSize.md,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: dimensions.padding.sm,
    paddingHorizontal: dimensions.padding.md,
    borderRadius: dimensions.borderRadius.xl,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: dimensions.fontSize.md,
    fontWeight: '600',
  },

  // Card styles
  card: {
    backgroundColor: colors.background,
    borderRadius: dimensions.borderRadius.md,
    padding: dimensions.padding.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: dimensions.fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: dimensions.margin.sm,
  },

  // Loading styles
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: dimensions.fontSize.sm,
  },

  // Error styles
  errorContainer: {
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: dimensions.fontSize.md,
    fontWeight: '600',
    color: colors.error,
    marginTop: 12,
    textAlign: 'center',
  },

  // Empty state styles
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: dimensions.fontSize.md,
    fontWeight: '600',
    color: colors.textLight,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: dimensions.fontSize.sm,
    color: colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },

  // Form styles
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: dimensions.borderRadius.sm,
    padding: dimensions.padding.md,
    fontSize: dimensions.fontSize.md,
    backgroundColor: colors.background,
  },
  inputFocused: {
    borderColor: colors.primary,
  },

  // Shadow styles
  shadowSmall: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  shadowMedium: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  shadowLarge: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
});