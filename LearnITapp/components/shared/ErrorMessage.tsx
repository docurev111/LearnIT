/**
 * ErrorMessage.tsx
 * 
 * Reusable error message component with optional retry action.
 * Displays error state with icon, message, and action button.
 * 
 * @component
 * @example
 * ```tsx
 * <ErrorMessage
 *   message="Failed to load data"
 *   onRetry={handleRetry}
 * />
 * ```
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ErrorMessageProps {
  /** Error message to display */
  message?: string;
  /** Optional retry callback */
  onRetry?: () => void;
  /** Custom retry button text */
  retryButtonText?: string;
  /** Custom icon/emoji */
  icon?: string;
}

export default function ErrorMessage({
  message = 'Something went wrong. Please try again.',
  onRetry,
  retryButtonText = 'Retry',
  icon = '⚠️',
}: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>{retryButtonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#6B73FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
