import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Colors, Typography } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

interface XPFeedbackProps {
  visible: boolean;
  xpAmount: number;
  onComplete?: () => void;
}

export default function XPFeedback({
  visible,
  xpAmount,
  onComplete,
}: XPFeedbackProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      translateYAnim.setValue(50);

      // Start XP feedback animation
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
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Auto-hide after 2 seconds
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
              toValue: -30,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onComplete?.();
          });
        }, 2000);
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim },
          ],
        },
      ]}
    >
      <View style={styles.feedbackContainer}>
        <Text style={styles.xpText}>+{xpAmount} XP</Text>
        <Text style={styles.messageText}>Great Job! 🎉</Text>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  feedbackContainer: {
    backgroundColor: Colors.light.success,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 120,
  },
  xpText: {
    ...Typography.h2,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageText: {
    ...Typography.body,
    color: 'white',
    fontWeight: '600',
  },
});
