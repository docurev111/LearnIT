/**
 * BadEndingScreen.tsx
 * 
 * Modal screen displayed when the user makes a wrong choice in a scenario.
 * Shows failure message and retry option.
 * 
 * @component
 * @example
 * ```tsx
 * <BadEndingScreen
 *   message="Ang pagtakbo sa panahon ng lindol ay mapanganib."
 *   onRetry={handleRetry}
 *   onGoBack={handleBack}
 * />
 * ```
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { Audio } from 'expo-av';

interface BadEndingScreenProps {
  /** Message explaining why the choice was wrong */
  message: string;
  /** Callback when retry button is pressed */
  onRetry: () => void;
  /** Callback when back button is pressed */
  onGoBack: () => void;
  /** Custom title text */
  title?: string;
  /** Whether to play game over sound */
  playSound?: boolean;
}

export default function BadEndingScreen({
  message,
  onRetry,
  onGoBack,
  title = '💀 Maling Desisyon',
  playSound = true,
}: BadEndingScreenProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Play game over sound
    if (playSound) {
      const playGameOverSound = async () => {
        try {
          const { sound } = await Audio.Sound.createAsync(
            require('../../assets/audio/gameover.mp3')
          );
          await sound.playAsync();
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              sound.unloadAsync();
            }
          });
        } catch (error) {
          console.log('Error playing game over sound:', error);
        }
      };
      playGameOverSound();
    }
  }, []);

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.card,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <Text style={styles.title}>{title}</Text>

        <Text style={styles.message}>{message}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>🔄 Subukan Muli</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
            <Text style={styles.backButtonText}>← Bumalik</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 15,
    padding: 30,
    maxWidth: 500,
    width: '100%',
    borderWidth: 3,
    borderColor: '#FF4444',
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 30,
  },
  buttonContainer: {
    gap: 15,
  },
  retryButton: {
    backgroundColor: '#6B73FF',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6B73FF',
  },
  backButtonText: {
    color: '#6B73FF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
