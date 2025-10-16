import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';

type LessonCardProps = {
  lesson: any;
  onPress: (lesson: any) => void;
  themeStyles: {
    background: string;
    cardBg: string;
    accent: string;
  };
  index: number;
};

export default function LessonCard({ lesson, onPress, themeStyles, index }: LessonCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: themeStyles.cardBg }, index % 2 === 0 ? styles.evenCard : styles.oddCard]}
      onPress={() => onPress(lesson)}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Image source={{ uri: lesson.icon || 'https://via.placeholder.com/40' }} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: themeStyles.accent }]} numberOfLines={1}>
            {lesson.title}
          </Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{lesson.progress || 0}%</Text>
          <Text style={[styles.arrow, { color: themeStyles.accent }]}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  evenCard: {
    // Optional styling for even cards
  },
  oddCard: {
    // Optional styling for odd cards
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: Typography.h3.fontSize,
    fontWeight: 'bold',
  },
  progressContainer: {
    alignItems: 'flex-end',
  },
  progressText: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.textSecondary,
  },
  arrow: {
    fontSize: Typography.h3.fontSize,
  },
});
