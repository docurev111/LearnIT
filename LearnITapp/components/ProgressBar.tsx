import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

interface ProgressBarProps {
  progress: number; // 0-1
  total: number;
  completed: number;
  color?: string;
  showText?: boolean;
}

export default function ProgressBar({
  progress,
  total,
  completed,
  color = Colors.light.success,
  showText = true
}: ProgressBarProps) {
  return (
    <View style={styles.container}>
      {showText && (
        <Text style={styles.progressText}>
          {completed}/{total} Complete
        </Text>
      )}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${progress * 100}%`, backgroundColor: color }
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
});
