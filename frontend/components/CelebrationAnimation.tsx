import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Colors } from '../constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CelebrationAnimationProps {
  visible: boolean;
  onComplete?: () => void;
  message?: string;
}

export default function CelebrationAnimation({
  visible,
  onComplete,
  message = "Great Job! 🎉"
}: CelebrationAnimationProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      confettiAnim.setValue(0);

      // Start celebration animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
      ]).start(() => {
        // Auto-hide after 3 seconds
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            onComplete?.();
          });
        }, 3000);
      });
    }
  }, [visible]);

  if (!visible) return null;

  const confettiCount = 50;
  const confetti = Array.from({ length: confettiCount }, (_, i) => {
    const randomX = Math.random() * screenWidth;
    const randomDelay = Math.random() * 1000;
    const randomDuration = 2000 + Math.random() * 2000;

    return (
      <Animated.View
        key={i}
        style={[
          styles.confetti,
          {
            left: randomX,
            backgroundColor: [
              Colors.light.primary,
              Colors.light.secondary,
              Colors.light.success,
              Colors.light.warning,
              Colors.light.accent,
            ][Math.floor(Math.random() * 5)],
            transform: [
              {
                translateY: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, screenHeight + 50],
                }),
              },
              {
                rotate: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      />
    );
  });

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <View style={styles.confettiContainer}>
        {confetti}
      </View>
      <Animated.View style={[styles.messageContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.emoji}>⭐</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  messageContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  message: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
});
