import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';

export default function ReadLesson() {
  const { content, lessonTitle, day } = useLocalSearchParams();

  let displayTitle = lessonTitle || 'Read Lesson';
  if (Array.isArray(displayTitle)) {
    displayTitle = displayTitle[0];
  }
  let dayNumber = day || '';
  if (Array.isArray(dayNumber)) {
    dayNumber = dayNumber[0];
  }
  const screenTitle = dayNumber ? `Day ${dayNumber} | ${displayTitle}` : displayTitle;

  return (
    <ScrollView contentContainerStyle={styles.container}>
        <Stack.Screen options={{ headerBackVisible: true, title: 'Read Lesson' }} />
      <Text style={styles.title}>{screenTitle}</Text>
      <Text style={styles.body}>{content || 'No content available.'}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 18,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    marginBottom: 12,
  },
});
