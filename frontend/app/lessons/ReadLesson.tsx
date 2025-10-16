import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LESSON_CONTENT } from '../../constants/lessonContent';
import { recordActivityCompletion } from '../../services/activityService';

export default function ReadLesson() {
  const { content, lessonTitle, day, lessonId } = useLocalSearchParams();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  let displayTitle = lessonTitle || 'Read Lesson';
  if (Array.isArray(displayTitle)) {
    displayTitle = displayTitle[0];
  }
  let dayNumber = day || '';
  if (Array.isArray(dayNumber)) {
    dayNumber = dayNumber[0];
  }
  let lessonIdStr = lessonId || '1';
  if (Array.isArray(lessonIdStr)) {
    lessonIdStr = lessonIdStr[0];
  }

  const lessonData = LESSON_CONTENT[lessonIdStr];
  const termCards = lessonData?.termCards || [];

  const totalContent = JSON.stringify(termCards);
  const readingTime = Math.max(1, Math.ceil(totalContent.length / 1000));

  const parseTextWithBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <Text key={index} style={styles.boldText}>
            {boldText}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 300);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleCompleteLesson = async () => {
    if (isCompleted || isCompleting) return;

    setIsCompleting(true);
    try {
      const lessonIdNum = parseInt(lessonIdStr) || 1;
      const dayIndex = parseInt(dayNumber) - 1 || 0;
      const activityIndex = 1;

      const result = await recordActivityCompletion(lessonIdNum, dayIndex, activityIndex, 'reading');
      if (result.success) {
        setIsCompleted(true);
        Alert.alert('Success', 'Reading lesson marked as complete!');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to mark reading as complete');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleGoToFlashcards = () => {
    router.push({
      pathname: '/lessons/LessonFlashcardScreen',
      params: { lessonId, day }
    });
  };

  const theme = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#F5F7FA',
    textColor: isDarkMode ? '#e0e0e0' : '#64748B',
    titleColor: isDarkMode ? '#ffffff' : '#1E293B',
    cardColor: isDarkMode ? '#2a2a2a' : '#FFFFFF',
    accentColor: '#5B67DE',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { backgroundColor: theme.backgroundColor }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={theme.titleColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.titleColor }]}>Read Lesson</Text>
          <TouchableOpacity
            onPress={() => setIsDarkMode(!isDarkMode)}
            style={styles.themeToggle}
          >
            <Ionicons
              name={isDarkMode ? 'sunny' : 'moon'}
              size={24}
              color={theme.titleColor}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.lessonHeader}>
          <Text style={[styles.lessonNumber, { color: theme.titleColor }]}>
            LESSON {lessonIdStr} | <Text style={styles.dayNumber}>Day {dayNumber}</Text>
          </Text>
          <Text style={[styles.lessonTitle, { color: theme.textColor }]}>
            {displayTitle}
          </Text>
          <View style={styles.readingTimeContainer}>
            <Ionicons name="time-outline" size={16} color={theme.textColor} />
            <Text style={[styles.readingTime, { color: theme.textColor }]}>
              {readingTime} minute read
            </Text>
          </View>
        </View>

        {termCards.map((card, index) => (
          <View key={index} style={[styles.contentCard, { backgroundColor: theme.cardColor }]}>
            <Text style={[styles.questionText, { color: theme.accentColor }]}>
              {card.term}
            </Text>
            <Text style={[styles.answerText, { color: theme.titleColor }]}>
              {parseTextWithBold(card.definition)}
            </Text>
            {card.halimbawa && (
              <View style={styles.exampleSection}>
                <Text style={[styles.exampleText, { color: theme.textColor }]}>
                  {card.halimbawa}
                </Text>
              </View>
            )}
          </View>
        ))}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton, 
              styles.primaryButton,
              { backgroundColor: isCompleted ? '#10B981' : theme.accentColor },
              isCompleting && styles.actionButtonDisabled
            ]}
            onPress={handleCompleteLesson}
            disabled={isCompleted || isCompleting}
          >
            <Ionicons
              name={isCompleting ? 'time' : (isCompleted ? 'checkmark-circle' : 'checkmark')}
              size={20}
              color="#fff"
            />
            <Text style={styles.primaryButtonText}>
              {isCompleting ? 'Marking Complete...' : (isCompleted ? 'Completed!' : 'Mark as Complete')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton, { borderColor: theme.accentColor }]}
            onPress={handleGoToFlashcards}
          >
            <Ionicons name="flash-outline" size={20} color={theme.accentColor} />
            <Text style={[styles.secondaryButtonText, { color: theme.accentColor }]}>
              Go to Flashcards
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showScrollTop && (
        <TouchableOpacity style={styles.scrollTopButton} onPress={scrollToTop}>
          <Ionicons name="arrow-up" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  themeToggle: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  lessonHeader: {
    marginBottom: 24,
  },
  lessonNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  dayNumber: {
    color: '#5B67DE',
  },
  lessonTitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 12,
  },
  readingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readingTime: {
    fontSize: 14,
    color: '#64748B',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  questionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#5B67DE',
    lineHeight: 26,
    marginBottom: 16,
  },
  answerText: {
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#1E293B',
  },
  exampleSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  exampleText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  actionButtons: {
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#5B67DE',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#5B67DE',
  },
  secondaryButtonText: {
    color: '#5B67DE',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  scrollTopButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#5B67DE',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
