/**
 * ChoiceButtons.tsx
 * 
 * Animated choice buttons for branching narrative scenarios.
 * Displays multiple choice options with fade-in animation.
 * 
 * @component
 * @example
 * ```tsx
 * <ChoiceButtons
 *   choices={[
 *     { text: 'Option 1', action: 'action1' },
 *     { text: 'Option 2', action: 'action2' },
 *   ]}
 *   onChoice={handleChoice}
 *   centered
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

export interface Choice {
  /** Text displayed on the button */
  text: string;
  /** Action identifier for this choice */
  action: string;
}

interface ChoiceButtonsProps {
  /** Array of choice options */
  choices: Choice[];
  /** Callback when a choice is selected */
  onChoice: (action: string) => void;
  /** Whether to center the buttons (default: bottom-right) */
  centered?: boolean;
  /** Custom button color */
  buttonColor?: string;
}

export default function ChoiceButtons({
  choices,
  onChoice,
  centered = false,
  buttonColor = 'rgba(107, 115, 255, 0.95)',
}: ChoiceButtonsProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        centered ? styles.containerCentered : styles.container,
        { opacity },
      ]}
    >
      {choices.map((choice, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={() => onChoice(choice.action)}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{choice.text}</Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 180,
    right: 20,
    gap: 12,
    minWidth: 300,
  },
  containerCentered: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -50 }],
    gap: 12,
    minWidth: 300,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#6B73FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
