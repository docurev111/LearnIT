import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import { LESSON_CONTENT, Activity } from '../constants/lessonContent';

export default function LessonIntroScreen() {
  const { lessonId, lessonTitle } = useLocalSearchParams();
  const router = require('expo-router').useRouter();

  const lessonContent = LESSON_CONTENT[lessonId as string];

  if (!lessonContent) {
    return (
      <View style={styles.container}>
        <Text>Lesson not found</Text>
      </View>
    );
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'video':
        return '▶️';
      case 'reading':
        return '📖';
      case 'quiz':
        return '📝';
      default:
        return '📌';
    }
  };

  const handleActivityPress = (activity: Activity) => {
    switch (activity.type) {
      case 'video':
        // Find the day number for this activity
        let dayNumber = '';
        lessonContent.days.forEach((day, idx) => {
          if (day.activities.includes(activity)) {
            dayNumber = (idx + 1).toString();
          }
        });
        router.push({
          pathname: '/WatchLesson',
          params: { 
            lessonId: lessonId?.toString(),
            videoId: activity.videoId,
            lessonTitle: lessonContent.title,
            day: dayNumber
          }
        });
        break;
      case 'reading':
        // Find the day number for this activity
        let readingDayNumber = '';
        lessonContent.days.forEach((day, idx) => {
          if (day.activities.includes(activity)) {
            readingDayNumber = (idx + 1).toString();
          }
        });
        router.push({
          pathname: '/ReadLesson',
          params: { 
            lessonId: lessonId?.toString(),
            content: activity.content,
            lessonTitle: lessonContent.title,
            day: readingDayNumber
          }
        });
        break;
      case 'quiz':
        router.push({
          pathname: '/QuizScreen',
          params: { 
            lessonId: lessonId?.toString()
          }
        });
        break;
      default:
        Alert.alert('Coming soon!');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerBackVisible: true, title: `First Quarter`}} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Lesson {lessonId} | {lessonContent.title}</Text>

        <View style={styles.daysContainer}>
          {lessonContent.days.map((day, dayIndex) => (
            <View key={dayIndex} style={styles.dayCard}>
              <Text style={styles.dayTitle}>{day.title}</Text>
              {day.activities.map((activity, actIndex) => (
                <React.Fragment key={actIndex}>
                  <TouchableOpacity 
                    style={styles.actionRow}
                    onPress={() => handleActivityPress(activity)}
                  >
                    <Text style={styles.actionRowText}>
                      {getActivityIcon(activity.type)} {activity.title}
                    </Text>
                  </TouchableOpacity>
                  {actIndex < day.activities.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  daysContainer: {
    width: '100%',
    gap: 16,
  },
  dayCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },
  actionRow: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionRowText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
});
