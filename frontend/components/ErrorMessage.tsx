import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * ErrorMessage Component
 * 
 * A reusable error message component with retry functionality
 * 
 * @component
 * @param {string} message - Error message to display
 * @param {string} title - Error title
 * @param {Function} onRetry - Function to call when retry is pressed
 * @param {boolean} showRetry - Whether to show retry button
 * @param {string} type - Type of error ('error' | 'warning' | 'info')
 */
interface ErrorMessageProps {
  message: string;
  title?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  type?: 'error' | 'warning' | 'info';
  style?: object;
}

export default function ErrorMessage({
  message,
  title = 'Error',
  onRetry,
  showRetry = true,
  type = 'error',
  style,
}: ErrorMessageProps) {
  const getIconName = () => {
    switch (type) {
      case 'warning':
        return 'warning-outline';
      case 'info':
        return 'information-circle-outline';
      default:
        return 'alert-circle-outline';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return '#F59E0B';
      case 'info':
        return '#3B82F6';
      default:
        return '#EF4444';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'warning':
        return '#FEF3C7';
      case 'info':
        return '#DBEAFE';
      default:
        return '#FEE2E2';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }, style]}>
      <View style={styles.content}>
        <Ionicons 
          name={getIconName()} 
          size={24} 
          color={getIconColor()} 
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: getIconColor() }]}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
      
      {showRetry && onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
});
