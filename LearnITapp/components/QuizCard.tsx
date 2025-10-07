import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, TouchTargets, Shadows } from '../constants/theme';
import { Quiz } from '../src/types';

interface QuizCardProps {
  quiz: Quiz;
  onPress: (quiz: Quiz) => void;
  index?: number;
}

export default function QuizCard({ quiz, onPress, index = 0 }: QuizCardProps) {
  const handlePress = () => {
    onPress(quiz);
  };

  return (
    <TouchableOpacity
      style={styles.quizCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradientBackground}
      >
        <View style={styles.quizIcon}>
          <Text style={styles.quizIconText}>🧠</Text>
        </View>
        <View style={styles.quizContent}>
          <Text style={styles.quizTitle}>Quiz {quiz.id}</Text>
          <Text style={styles.quizQuestion} numberOfLines={2}>
            {quiz.question}
          </Text>
        </View>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>→</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  quizCard: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
    elevation: 3,
  },
  gradientBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    minHeight: TouchTargets.large,
  },
  quizIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  quizIconText: {
    fontSize: 28,
  },
  quizContent: {
    flex: 1,
  },
  quizTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.light.card,
    marginBottom: 4,
  },
  quizQuestion: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.card,
    opacity: 0.9,
    lineHeight: 20,
  },
  arrowContainer: {
    marginLeft: 12,
  },
  arrow: {
    fontSize: 20,
    color: Colors.light.card,
  },
});
