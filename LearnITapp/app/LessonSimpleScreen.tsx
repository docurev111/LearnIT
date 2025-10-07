import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, TouchableOpacity, ScrollView, Modal, Animated } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { auth } from '../firebaseConfig';
import pickApiBase from '../config/api_probe';

interface PageRow {
  id: number;
  title: string;
  content: string;
  page_number?: number;
}

export default function LessonSimpleScreen() {
  const { lessonId } = useLocalSearchParams();
  const navigation = useNavigation();
  const idNum = Number(lessonId || 1) || 1;
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [lessonTitle, setLessonTitle] = useState<string>('');
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [completionAnimation] = useState(new Animated.Value(0));
  const router = useRouter();

  // Save current page progress to AsyncStorage
  const savePageProgress = async (pageIndex: number) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const progressKey = `lesson_${idNum}_progress_${currentUser.uid}`;
        const progressData = {
          lessonId: idNum,
          currentPage: pageIndex,
          totalPages: pages.length,
          lastAccessed: new Date().toISOString(),
          progress: ((pageIndex + 1) / pages.length * 100).toFixed(1)
        };
        // For now, save to global variable (in production, use AsyncStorage or API)
        (global as any).lessonProgress = (global as any).lessonProgress || {};
        (global as any).lessonProgress[progressKey] = progressData;
        console.log(`Saved progress for lesson ${idNum}: page ${pageIndex + 1}/${pages.length}`);
      }
    } catch (error) {
      console.error('Error saving page progress:', error);
    }
  };

  // Load saved page progress from AsyncStorage
  const loadPageProgress = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const progressKey = `lesson_${idNum}_progress_${currentUser.uid}`;
        // For now, load from global variable (in production, use AsyncStorage or API)
        const savedProgress = (global as any).lessonProgress?.[progressKey];
        if (savedProgress) {
          console.log('Loaded saved progress:', savedProgress);
          return savedProgress.currentPage || 0;
        }
      }
    } catch (error) {
      console.error('Error loading page progress:', error);
    }
    return 0;
  };

  // Handle lesson completion
  const handleFinishLesson = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // DON'T clear progress yet - wait until completion is confirmed
        const progressKey = `lesson_${idNum}_progress_${currentUser.uid}`;
        
        // First mark as 100% completed in progress data
        (global as any).lessonProgress = (global as any).lessonProgress || {};
        (global as any).lessonProgress[progressKey] = {
          lessonId: idNum,
          currentPage: pages.length - 1,
          totalPages: pages.length,
          lastAccessed: new Date().toISOString(),
          progress: '100.0'
        };
        
        // Save completion to API/database
        const base = await pickApiBase();
        const idToken = await currentUser.getIdToken();
        
        // Get user's database ID first, then call completion endpoint
        try {
          const userRes = await fetch(`${base}/users/${currentUser.uid}`, {
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (userRes.ok) {
            const userData = await userRes.json();
            const userDatabaseId = userData.id;
            
            // Call completion endpoint with correct user_id format
            const completeRes = await fetch(`${base}/complete-lesson`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_id: userDatabaseId, // Use database ID, not Firebase UID
                lesson_id: idNum
              })
            });
            
            if (completeRes.ok) {
              const result = await completeRes.json();
              console.log('✅ Lesson completion recorded successfully:', result);
              
              // Now that completion is confirmed, we can update the completion status
              (global as any).lessonCompletion = (global as any).lessonCompletion || {};
              (global as any).lessonCompletion[`${currentUser.uid}_${idNum}`] = {
                lessonId: idNum,
                completed: true,
                completedAt: new Date().toISOString(),
                progress: 100,
                userDatabaseId: userDatabaseId
              };
              
              // Only NOW clear the page progress since we have confirmed completion
              delete (global as any).lessonProgress?.[progressKey];
              
              console.log('🎯 Completion confirmed - updated status and cleared page progress');
            } else {
              const errorText = await completeRes.text();
              console.error('❌ Failed to record completion:', errorText);
              
              // If API fails, still mark as completed locally
              (global as any).lessonCompletion = (global as any).lessonCompletion || {};
              (global as any).lessonCompletion[`${currentUser.uid}_${idNum}`] = {
                lessonId: idNum,
                completed: true,
                completedAt: new Date().toISOString(),
                progress: 100,
                userDatabaseId: userDatabaseId,
                apiError: true
              };
              
              console.log('⚠️ API failed but marked as completed locally');
            }
          }
        } catch (error) {
          console.error('Error recording lesson completion:', error);
        }
        
        // Show congratulations modal
        setShowCongratulations(true);
        
        // Start celebration animation
        Animated.sequence([
          Animated.timing(completionAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(completionAnimation, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(completionAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  // Close congratulations and go back
  const handleCloseCongratulations = async () => {
    setShowCongratulations(false);
    
    // Add a small delay to ensure database operations complete
    setTimeout(() => {
      router.back(); // Go back to lesson selection
    }, 500);
  };

  async function load() {
    setLoading(true); setError(null);
    try {
      const base = await pickApiBase();
      
      // First, get the actual lesson title from the lessons endpoint
      let actualLessonTitle = `Lesson ${idNum}`;
      try {
        const lessonsRes = await fetch(`${base}/test/lessons`);
        if (lessonsRes.ok) {
          const lessonsData = await lessonsRes.json();
          const lessons = lessonsData.lessons || [];
          const currentLesson = lessons.find((lesson: any) => lesson.id === idNum);
          if (currentLesson && currentLesson.title) {
            actualLessonTitle = currentLesson.title;
          }
        }
      } catch (e) {
        console.log('Could not fetch lesson title, using default');
      }
      
      // Then get the lesson pages
      const testRes = await fetch(`${base}/test/lesson-pages/${idNum}`);
      if (!testRes.ok) throw new Error(`HTTP ${testRes.status}`);
      const tj = await testRes.json();
      const rows = Array.isArray(tj) ? tj : (tj.pages || []);
      if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error('No pages returned');
      }
      const mapped = rows.map((r:any, i:number) => ({
        id: r.id || i+1,
        title: r.title || `Page ${r.page_number || i+1}`,
        content: r.content || r.body || '',
        page_number: r.page_number
      }));
      setPages(mapped);
      
      // Set the actual lesson title
      setLessonTitle(actualLessonTitle);
      
      // Update navigation header title with the correct lesson title
      navigation.setOptions({
        title: `Lesson ${idNum}: ${actualLessonTitle}`
      });
      
      // Load saved page progress
      const savedPageIndex = await loadPageProgress();
      if (savedPageIndex > 0 && savedPageIndex < mapped.length) {
        setCurrentPageIndex(savedPageIndex);
        console.log(`Resumed lesson ${idNum} at page ${savedPageIndex + 1}`);
      }
    } catch(e:any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  const handleNext = () => {
    if (currentPageIndex < pages.length - 1) {
      const newIndex = currentPageIndex + 1;
      setCurrentPageIndex(newIndex);
      savePageProgress(newIndex);
    }
  };

  const handlePrevious = () => {
    if (currentPageIndex > 0) {
      const newIndex = currentPageIndex - 1;
      setCurrentPageIndex(newIndex);
      savePageProgress(newIndex);
    }
  };

  useEffect(() => { load(); }, [lessonId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#6366F1" size="large" />
        <Text style={styles.dim}>Loading lesson pages...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>{error}</Text>
        <TouchableOpacity style={styles.retry} onPress={load}>
          <Text style={styles.retryTxt}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (pages.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>No lesson pages found</Text>
        <TouchableOpacity style={styles.retry} onPress={load}>
          <Text style={styles.retryTxt}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentPage = pages[currentPageIndex];
  const progress = ((currentPageIndex + 1) / pages.length) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentPageIndex + 1} of {pages.length}
        </Text>
      </View>

      {/* Flashcard */}
      <View style={styles.flashcardContainer}>
        <View style={styles.flashcard}>
          <Text style={styles.cardTitle}>{currentPage.title}</Text>
          <ScrollView style={styles.cardContentScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.cardContent}>{currentPage.content}</Text>
          </ScrollView>
        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.prevButton, currentPageIndex === 0 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentPageIndex === 0}
        >
          <Text style={[styles.navButtonText, currentPageIndex === 0 && styles.disabledButtonText]}>
            ← Previous
          </Text>
        </TouchableOpacity>

        {currentPageIndex === pages.length - 1 ? (
          <TouchableOpacity
            style={[styles.navButton, styles.finishButton]}
            onPress={handleFinishLesson}
          >
            <Text style={styles.navButtonText}>
              🎉 Finish Lesson
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={handleNext}
          >
            <Text style={styles.navButtonText}>
              Next →
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Congratulations Modal */}
      <Modal
        visible={showCongratulations}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseCongratulations}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.congratulationsModal,
              { 
                opacity: completionAnimation,
                transform: [{ scale: completionAnimation }] 
              }
            ]}
          >
            <View style={styles.celebrationHeader}>
              <Text style={styles.celebrationEmoji}>🎉</Text>
              <Text style={styles.congratulationsTitle}>Congratulations!</Text>
              <Text style={styles.celebrationEmoji}>🎊</Text>
            </View>
            
            <View style={styles.completionContent}>
              <Text style={styles.completionMessage}>
                You have successfully completed
              </Text>
              <Text style={styles.completedLessonTitle}>
                {lessonTitle}
              </Text>
              
              <View style={styles.achievementBadge}>
                <Ionicons name="trophy" size={48} color="#FFD700" />
                <Text style={styles.badgeText}>Lesson Complete!</Text>
              </View>
              
              <Text style={styles.encouragementText}>
                Great job! Keep up the excellent work on your learning journey! 📚✨
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={handleCloseCongratulations}
              >
                <Text style={styles.continueButtonText}>Continue Learning</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  dim: { marginTop: 8, color: '#64748B', fontWeight: '600' },
  err: { color: '#EF4444', fontWeight: '700', marginBottom: 12 },
  retry: { backgroundColor: '#6366F1', paddingHorizontal: 22, paddingVertical: 10, borderRadius: 999 },
  retryTxt: { color: '#fff', fontWeight: '700' },
  
  // Flashcard interface styles
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Progress bar styles
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Flashcard styles
  flashcardContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  flashcard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 300,
    maxHeight: '70%',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardContentScroll: {
    flex: 1,
  },
  cardContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
    textAlign: 'justify',
  },
  
  // Navigation button styles
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  navButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
  },
  prevButton: {
    backgroundColor: '#64748B',
  },
  nextButton: {
    backgroundColor: '#6366F1',
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
  },
  navButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  disabledButtonText: {
    color: '#94A3B8',
  },
  
  // Finish button style
  finishButton: {
    backgroundColor: '#10B981', // Green color for finish
  },
  
  // Congratulations modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  congratulationsModal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    margin: 20,
    maxWidth: 350,
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
  },
  celebrationHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  celebrationEmoji: {
    fontSize: 32,
    marginHorizontal: 8,
  },
  congratulationsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
  },
  completionContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  completionMessage: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  completedLessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366F1',
    textAlign: 'center',
    marginBottom: 20,
  },
  achievementBadge: {
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    padding: 20,
    marginVertical: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  badgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D97706',
    marginTop: 8,
  },
  encouragementText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  modalActions: {
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    minWidth: 200,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
