import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LESSON_CONTENT, Activity } from '../../constants/lessonContent';
import { LinearGradient } from 'expo-linear-gradient';
import { getActivityProgress } from '../../services/activityService';

export default function LessonIntroScreen() {
  const { lessonId, lessonTitle } = useLocalSearchParams();
  const router = require('expo-router').useRouter();
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [activityProgress, setActivityProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const lessonContent = LESSON_CONTENT[lessonId as string];

  useEffect(() => {
    const fetchProgress = async () => {
      if (lessonId) {
        try {
          setIsLoading(true);
          const progress = await getActivityProgress(parseInt(lessonId as string));
          setActivityProgress(progress);
        } catch (error) {
          console.error('Error fetching activity progress:', error);
          setActivityProgress([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProgress();
  }, [lessonId]);

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
        return require('../../assets/images/play-circle.png');
      case 'reading':
        return require('../../assets/images/square.png');
      case 'quiz':
        return require('../../assets/images/edit-2.png');
      case 'flashcards':
        return require('../../assets/images/square.png');
      default:
        return require('../../assets/images/square.png');
    }
  };

  // Check if specific activity is completed
  const isActivityCompleted = (dayIndex: number, activityIndex: number) => {
    return activityProgress.some(
      activity => activity.day_index === dayIndex && activity.activity_index === activityIndex
    );
  };

  // Calculate progress for a specific day
  const getDayProgress = (dayIndex: number) => {
    if (!lessonContent.days[dayIndex]) return 0;
    
    const dayActivities = lessonContent.days[dayIndex].activities;
    
    // Count only activities that match both index AND type
    const completedCount = dayActivities.filter((activity, actIndex) =>
      activityProgress.some(
        prog => prog.day_index === dayIndex && 
                prog.activity_index === actIndex && 
                prog.activity_type === activity.type
      )
    ).length;
    
    if (dayActivities.length === 0) return 0;
    return Math.round((completedCount / dayActivities.length) * 100);
  };

  // Check if entire day is completed
  const isDayCompleted = (dayIndex: number) => {
    return getDayProgress(dayIndex) === 100;
  };

  // Calculate overall progress
  const calculateProgress = () => {
    let totalActivities = 0;
    let completedActivities = 0;
    
    lessonContent.days.forEach((day, dayIndex) => {
      totalActivities += day.activities.length;
      
      // Count only activities that match both index AND type
      const dayCompleted = day.activities.filter((activity, actIndex) =>
        activityProgress.some(
          prog => prog.day_index === dayIndex && 
                  prog.activity_index === actIndex && 
                  prog.activity_type === activity.type
        )
      ).length;
      
      completedActivities += dayCompleted;
    });
    
    return totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
  };

  // Count completed days
  const getCompletedDaysCount = () => {
    return lessonContent.days.filter((_, idx) => isDayCompleted(idx)).length;
  };

  const handleActivityPress = (activity: Activity, dayIndex: number) => {
    const dayNumber = (dayIndex + 1).toString();
    
    switch (activity.type) {
      case 'video':
        router.push({
          pathname: '/lessons/WatchLesson',
          params: { 
            lessonId: lessonId?.toString(),
            videoId: activity.videoId,
            lessonTitle: lessonContent.title,
            day: dayNumber
          }
        });
        break;
      case 'reading':
        router.push({
          pathname: '/lessons/ReadLesson',
          params: { 
            lessonId: lessonId?.toString(),
            content: activity.content,
            lessonTitle: lessonContent.title,
            day: dayNumber
          }
        });
        break;
      case 'quiz':
        router.push({
          pathname: '/QuizLandingScreen',
          params: { 
            lessonId: lessonId?.toString(),
            activityTitle: activity.title,
            lessonTitle: lessonContent.title
          }
        });
        break;
      case 'flashcards':
        router.push({
          pathname: '/lessons/LessonFlashcardScreen',
          params: { 
            lessonId: lessonId?.toString(),
            day: dayNumber
          }
        });
        break;
      default:
        Alert.alert('Coming soon!');
    }
  };

  const toggleDay = (dayIndex: number) => {
    setExpandedDay(expandedDay === dayIndex ? null : dayIndex);
  };

  const totalDays = lessonContent.days.length;
  const completedDays = getCompletedDaysCount();

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#5B67DE" />
          <Text style={styles.loadingText}>Loading lesson progress...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#5B67DE', '#7C4DFF']}
        style={styles.gradientHeader}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Image 
              source={require('../../assets/images/arrow-left.png')} 
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.lessonInfoCard}>
          <Text style={styles.lessonNumber}>LESSON {lessonId}</Text>
          <Text style={styles.lessonTitle}>{lessonContent.title}</Text>
          <Text style={styles.lessonMeta}>
            {totalDays} Days | 6 hours
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${calculateProgress()}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {calculateProgress()}% complete • {completedDays} of {totalDays} days finished
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {lessonContent.days.map((day, dayIndex) => {
          const dayProgress = getDayProgress(dayIndex);
          const isCompleted = isDayCompleted(dayIndex);
          const isExpanded = expandedDay === dayIndex;
          
          return (
            <View key={dayIndex} style={styles.daySection}>
              <TouchableOpacity 
                style={styles.dayHeader}
                onPress={() => toggleDay(dayIndex)}
              >
                <View style={styles.dayHeaderLeft}>
                  {isCompleted && <Ionicons name="checkmark" size={24} color="#10B981" />}
                  <Text style={[styles.dayTitle, isCompleted && styles.dayTitleCompleted]}>
                    {day.title.toUpperCase()}
                  </Text>
                  {!isCompleted && dayProgress > 0 && (
                    <Text style={styles.dayProgressBadge}>{dayProgress}%</Text>
                  )}
                </View>
                <Ionicons 
                  name={isExpanded ? "chevron-up" : "chevron-forward"} 
                  size={24} 
                  color="#1E293B" 
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.activitiesContainer}>
                  {day.activities.map((activity, actIndex) => {
                    // Check completion by matching both index AND type to avoid false positives
                    const activityCompleted = activityProgress.some(
                      prog => prog.day_index === dayIndex && 
                              prog.activity_index === actIndex && 
                              prog.activity_type === activity.type
                    );
                    
                    return (
                      <TouchableOpacity
                        key={actIndex}
                        style={[
                          styles.activityCard,
                          activityCompleted && styles.activityCardCompleted
                        ]}
                        onPress={() => handleActivityPress(activity, dayIndex)}
                      >
                        <View style={styles.activityContent}>
                          <View style={styles.activityIconContainer}>
                            <Image 
                              source={getActivityIcon(activity.type)} 
                              style={styles.activityIcon}
                            />
                          </View>
                          <Text style={[
                            styles.activityTitle,
                            activityCompleted && styles.activityTitleCompleted
                          ]}>
                            {activity.title}
                          </Text>
                        </View>
                        {activityCompleted && (
                          <Ionicons name="checkmark" size={20} color="#10B981" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  gradientHeader: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 56,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  menuButton: {
    padding: 8,
  },
  lessonInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  lessonNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 24,
    marginBottom: 12,
  },
  lessonMeta: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5B67DE',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  daySection: {
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  dayTitleCompleted: {
    color: '#10B981',
  },
  dayProgressBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B67DE',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  activitiesContainer: {
    marginTop: 8,
    gap: 12,
  },
  activityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF3F8',
    borderRadius: 16,
    padding: 16,
  },
  activityCardCompleted: {
    backgroundColor: '#A5B4FC',
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  activityTitleCompleted: {
    color: '#fff',
  },
});
