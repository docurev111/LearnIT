import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

interface MascotProps {
  size?: 'small' | 'medium' | 'large';
  emotion?: 'happy' | 'excited' | 'thinking' | 'celebrating';
  message?: string;
}

export default function Mascot({
  size = 'medium',
  emotion = 'happy',
  message
}: MascotProps) {
  const getEmoji = () => {
    switch (emotion) {
      case 'happy':
        return '😊';
      case 'excited':
        return '🤩';
      case 'thinking':
        return '🤔';
      case 'celebrating':
        return '🎉';
      default:
        return '😊';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'small':
        return { emoji: 32, container: 60 };
      case 'medium':
        return { emoji: 48, container: 80 };
      case 'large':
        return { emoji: 64, container: 100 };
      default:
        return { emoji: 48, container: 80 };
    }
  };

  const { emoji: emojiSize, container: containerSize } = getSize();

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }]}>
      <Text style={[styles.emoji, { fontSize: emojiSize }]}>
        {getEmoji()}
      </Text>
      {message && (
        <View style={styles.speechBubble}>
          <Text style={styles.message}>{message}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  emoji: {
    textAlign: 'center',
  },
  speechBubble: {
    position: 'absolute',
    top: -40,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 150,
  },
  message: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
  },
});
