/**
 * CongratsScreen.tsx
 * 
 * Success screen displayed when the user completes a scenario successfully.
 * Shows congratulations message and navigation options.
 * 
 * @component
 * @example
 * ```tsx
 * <CongratsScreen
 *   title="Mahusay!"
 *   message="Natapos mo ang scenario nang tama!"
 *   onContinue={handleContinue}
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

interface CongratsScreenProps {
  /** Title text */
  title?: string;
  /** Success message */
  message: string;
  /** Callback when continue button is pressed */
  onContinue: () => void;
  /** Callback when back button is pressed */
  onGoBack?: () => void;
  /** Custom continue button text */
  continueButtonText?: string;
  /** Custom back button text */
  backButtonText?: string;
  /** Whether to show back button */
  showBackButton?: boolean;
}

export default function CongratsScreen({
  title = '🎉 Mahusay!',
  message,
  onContinue,
  onGoBack,
  continueButtonText = 'Magpatuloy',
  backButtonText = 'Bumalik',
  showBackButton = true,
}: CongratsScreenProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
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
          <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
            <Text style={styles.continueButtonText}>{continueButtonText}</Text>
          </TouchableOpacity>

          {showBackButton && onGoBack && (
            <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
              <Text style={styles.backButtonText}>{backButtonText}</Text>
            </TouchableOpacity>
          )}
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
    backgroundColor: 'rgba(26, 26, 46, 0.98)',
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
    borderColor: '#4A90E2',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4A90E2',
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
  continueButton: {
    backgroundColor: '#6B73FF',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  continueButtonText: {
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
