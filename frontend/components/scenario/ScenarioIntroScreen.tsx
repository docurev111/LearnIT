/**
 * ScenarioIntroScreen.tsx
 * 
 * Reusable intro screen component for scenario-based lessons.
 * Displays lesson title, description, difficulty badge, and action buttons.
 * 
 * @component
 * @example
 * ```tsx
 * <ScenarioIntroScreen
 *   title="Ang Lindol sa Paaralan"
 *   description="Ikaw si Aiko..."
 *   difficulty="⭐⭐⭐ Complex"
 *   onStart={handleStart}
 *   onBack={handleBack}
 * />
 * ```
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleSheet,
} from 'react-native';

interface ScenarioIntroScreenProps {
  /** Title of the scenario */
  title: string;
  /** Description/context for the scenario */
  description: string;
  /** Difficulty rating (e.g., "⭐⭐⭐ Complex") */
  difficulty?: string;
  /** Callback when start button is pressed */
  onStart: () => void;
  /** Callback when back button is pressed */
  onBack: () => void;
  /** Custom start button text */
  startButtonText?: string;
  /** Custom back button text */
  backButtonText?: string;
}

export default function ScenarioIntroScreen({
  title,
  description,
  difficulty,
  onStart,
  onBack,
  startButtonText = '▶ Magsimula',
  backButtonText = 'Bumalik',
}: ScenarioIntroScreenProps) {
  const introOpacity = useRef(new Animated.Value(0)).current;
  const introScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(introOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(introScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: introOpacity,
              transform: [{ scale: introScale }],
            },
          ]}
        >
          {difficulty && (
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>{difficulty}</Text>
            </View>
          )}

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.description}>{description}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.playButton} onPress={onStart}>
              <Text style={styles.playButtonText}>{startButtonText}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>{backButtonText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    marginBottom: 25,
  },
  difficultyText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 25,
    textShadowColor: 'rgba(107, 115, 255, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  description: {
    fontSize: 18,
    color: '#ddd',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 40,
    maxWidth: 700,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 15,
    width: '100%',
    maxWidth: 300,
  },
  playButton: {
    backgroundColor: '#6B73FF',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#6B73FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6B73FF',
  },
  backButtonText: {
    color: '#6B73FF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
