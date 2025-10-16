import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * LoadingSpinner Component
 * 
 * A reusable loading component with customizable message and spinner
 * 
 * @component
 * @param {string} message - Loading message to display
 * @param {string} size - Size of the spinner ('small' | 'large')
 * @param {string} color - Color of the spinner
 * @param {boolean} showIcon - Whether to show an icon alongside the spinner
 * @param {string} iconName - Name of the icon to display
 */
interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  showIcon?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
  style?: object;
}

export default function LoadingSpinner({
  message = 'Loading...',
  size = 'large',
  color = '#4A90E2',
  showIcon = false,
  iconName = 'hourglass-outline',
  style,
}: LoadingSpinnerProps) {
  return (
    <View style={[styles.container, style]}>
      {showIcon && (
        <Ionicons 
          name={iconName} 
          size={32} 
          color={color} 
          style={styles.icon}
        />
      )}
      <ActivityIndicator size={size} color={color} />
      <Text style={[styles.message, { color }]}>{message}</Text>
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
    marginBottom: 16,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
