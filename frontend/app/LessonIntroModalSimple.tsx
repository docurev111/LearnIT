// LessonIntroModalSimple.tsx - Modal for lesson introduction
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getActivityProgress } from '../services/activityService';
import { LESSON_CONTENT } from '../constants/lessonContent';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive values
const isSmallScreen = screenWidth < 375;
const titleFontSize = isSmallScreen ? 32 : 40;
const titleLineHeight = isSmallScreen ? 38 : 46;
const containerPaddingHorizontal = isSmallScreen ? 16 : 24;
const bottomCardPadding = isSmallScreen ? 16 : 20;
const pillPaddingHorizontal = isSmallScreen ? 24 : 38;

type LessonProp = {
  id: number;
  title: string;
  description?: string;
  content?: string;
  asset_url?: string;
  icon?: any;
  loading?: boolean;
};

type Props = {
  isVisible: boolean;
  onClose: () => void;
  lesson: LessonProp | null;
};

export default function LessonIntroModal({ isVisible, onClose, lesson }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activityProgress, setActivityProgress] = useState<any[]>([]);

  useEffect(() => {
    if (isVisible) {
      setIsLoading(lesson?.loading || false);
    }
  }, [isVisible, lesson]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (lesson?.id && isVisible) {
        try {
          const progress = await getActivityProgress(lesson.id);
          setActivityProgress(progress);
        } catch (error) {
          console.error('Error fetching activity progress:', error);
          setActivityProgress([]);
        }
      }
    };

    fetchProgress();
  }, [lesson?.id, isVisible]);

  // Calculate progress percentages per day
  const getDayProgress = (dayIndex: number) => {
    if (!activityProgress || activityProgress.length === 0) return 0;

    const lessonId = lesson?.id?.toString();
    const lessonData = lessonId ? LESSON_CONTENT[lessonId] : null;
    
    if (!lessonData || !lessonData.days || !lessonData.days[dayIndex]) return 0;
    
    const dayActivities = lessonData.days[dayIndex].activities;
    
    // Count only activities that match both index AND type to avoid false positives
    const completedCount = dayActivities.filter((activity: any, actIndex: number) =>
      activityProgress.some(
        prog => prog.day_index === dayIndex && 
                prog.activity_index === actIndex && 
                prog.activity_type === activity.type
      )
    ).length;
    
    if (dayActivities.length === 0) return 0;
    
    return Math.round((completedCount / dayActivities.length) * 100);
  };

  // Get overall lesson progress
  const getOverallProgress = () => {
    if (!activityProgress || activityProgress.length === 0) return 0;

    const lessonId = lesson?.id?.toString();
    const lessonData = lessonId ? LESSON_CONTENT[lessonId] : null;
    
    if (!lessonData || !lessonData.days) return 0;
    
    let totalActivities = 0;
    let completedActivities = 0;
    
    lessonData.days.forEach((day: any, dayIndex: number) => {
      totalActivities += day.activities.length;
      
      // Count only activities that match both index AND type
      const dayCompleted = day.activities.filter((activity: any, actIndex: number) =>
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

  // Get lesson data for dynamic content
  const lessonData = lesson?.id ? LESSON_CONTENT[lesson.id.toString()] : null;

  if (!lesson) return null;

  const handleClose = () => {
    onClose();
  };

  const handleStartLesson = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onClose();
      router.push({
        pathname: '/lessons/LessonIntroScreen',
        params: { lessonId: lesson.id.toString(), lessonTitle: lesson.title },
      });
    }, 500); // Simulate brief loading
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.lessonNumberContainer}>
            <Text style={styles.lessonNumberSmall}>LESSON {lesson.id}</Text>
          </View>

          <TouchableOpacity style={styles.closeButtonLeft} onPress={handleClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>

          <View style={styles.headerContainerNoImage}>
            <ScrollView style={styles.scrollViewHeader} showsVerticalScrollIndicator={false}>
              <Text style={styles.lessonTitleBig}>{lesson.title}</Text>

              {/* Progress Tracker */}
              <View style={styles.progressTracker}>
                <View style={styles.progressItem}>
                  <Text style={styles.progressText}>Overall Progress: {getOverallProgress()}%</Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressText}>Day 1: {getDayProgress(0)}%</Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressText}>Day 2: {getDayProgress(1)}%</Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressText}>Day 3: {getDayProgress(2)}%</Text>
                </View>
              </View>

              {isLoading ? (
                <ActivityIndicator size="small" color="#6366F1" style={{ marginTop: 16 }} />
              ) : (
                <Text style={styles.lessonDescriptionSmall}>
                  Tap "Start Lesson" to open the full lesson content.
                </Text>
              )}

              {/* Bottom purple card */}
              <View style={styles.bottomCard}>
                <Text style={styles.bottomNote}>
                  🎯 <Text style={styles.boldText}>What you'll learn:</Text> {lesson.description}
                  {'\n\n'}
                  ⏱️ <Text style={styles.boldText}>Time commitment:</Text> 15-20 minutes per day × {lessonData?.days?.length || 3} days
                  {'\n\n'}
                  {getOverallProgress() > 0 ? (
                    getOverallProgress() === 100 ? (
                      <Text>🎉 <Text style={styles.boldText}>Completed!</Text> Great job mastering this lesson. Ready to apply what you've learned?</Text>
                    ) : (
                      <Text>� <Text style={styles.boldText}>Keep going!</Text> You're {getOverallProgress()}% through. Every step brings you closer to understanding yourself better.</Text>
                    )
                  ) : (
                    <Text>�💪 <Text style={styles.boldText}>Why it matters:</Text> Understanding {lesson.title.toLowerCase()} helps you make better decisions and live more intentionally.</Text>
                  )}
                </Text>

                <TouchableOpacity 
                  style={[
                    styles.pillButton, 
                    isLoading && styles.disabledPillButton
                  ]} 
                  onPress={handleStartLesson}
                  disabled={isLoading}
                >
                  <Text style={styles.pillText}>
                    {getOverallProgress() > 0 ? 'Continue Lesson' : 'Start Lesson'}
                  </Text>
                </TouchableOpacity>

              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  lessonNumberContainer: {
    position: 'relative',
    marginBottom: 8,
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 18,
    paddingHorizontal: containerPaddingHorizontal,
    paddingBottom: 28,
    minHeight: screenHeight * 0.92,
  },
  closeButtonLeft: {
    position: 'absolute',
    left: 16,
    top: 12,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)'
  },
  closeText: {
    fontSize: 28,
    color: '#334155',
  },
  headerContainerNoImage: {
    marginTop: 18,
    paddingHorizontal: 4,
    flex: 1,
  },
  scrollViewHeader: {
    maxHeight: 1000,
  },
  lessonNumberSmall: {
    fontSize: 12,
    color: '#000000',
    letterSpacing: 1,
  },
  lessonTitleBig: {
    fontSize: titleFontSize,
    lineHeight: titleLineHeight,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  lessonDescriptionSmall: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    marginTop: 8,
  },
  bottomCard: {
    marginTop: 26,
    backgroundColor: '#6366F1',
    borderRadius: 28,
    padding: bottomCardPadding,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  bottomNote: {
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 22,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pillButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: pillPaddingHorizontal,
    borderRadius: 999,
    marginBottom: 12,
  },
  disabledPillButton: {
    opacity: 0.7,
  },
  pillText: {
    color: '#6366F1',
    fontWeight: '700',
    fontSize: 16,
  },
  progressTracker: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  progressItem: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
});
