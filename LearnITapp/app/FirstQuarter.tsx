import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import BottomNav from '../components/BottomNav';
import NotificationBell from '../components/NotificationBell';
import LessonIntroModal from './LessonIntroModalSimple';
import pickApiBase from '../config/api_probe';
import { auth } from '../firebaseConfig';

const INITIAL_LESSONS = [
  {
    id: 1,
    title: 'Gamit ng Isip at Kilos-loob sa Sariling Pagpapasiya at Pagkilos',
    description: 'Araling tungkol sa katangian, gamit, at tunguhin ng isip at kilos-loob.',
    icon: require('../assets/gifs/number1.gif'),
    status: 'available',
    progressPercentage: 0,
  },
  {
    id: 2,
    title: 'Dignidad ng Tao Bilang Batayan ng Paggalang sa Sarili, Pamilya, at kapuwa',
    description: 'Pag-unawa sa dignidad ng tao at ang batayan ng paggalang sa sarili at sa kapuwa.',
    icon: require('../assets/gifs/2.gif'),
    status: 'available',
    progressPercentage: 0,
  },
  {
    id: 3,
    title: 'Pagpapahalaga at Virtue Bilang Batayan ng Sariling Pagpapasiya',
    description: 'Pag-aaral sa mga halaga at birtud na nagbibigay-daan sa mabuting pagpapasiya.',
    icon: require('../assets/gifs/3.gif'),
    status: 'locked',
    progressPercentage: 0,
  },
  {
    id: 4,
    title: 'Sariling Pananampalataya sa Diyos',
    description: 'Pag-unawa sa sariling pananampalataya at ang papel nito sa buhay.',
    icon: require('../assets/gifs/4.gif'),
    status: 'locked',
    progressPercentage: 0,
  },
  {
    id: 5,
    title: 'Pagtitipid at Pagiimpok Bilang Sariling Pangangasiwa sa mga Biyaya ng Diyos',
    description: 'Pag-aaral sa kahalagahan ng pagtitipid at pagiimpok sa mga biyaya.',
    icon: require('../assets/gifs/5.gif'),
    status: 'locked',
    progressPercentage: 0,
  },
  {
    id: 6,
    title: 'Pansariling Pagtugon sa Panahon ng Kalamidad',
    description: 'Pag-unawa sa tamang pagtugon sa mga kalamidad at sakuna.',
    icon: require('../assets/gifs/6.gif'),
    status: 'locked',
    progressPercentage: 0,
  },
  {
    id: 7,
    title: 'Pagtupad ng Sariling Tungkulin Bilang Mamamayan',
    description: 'Pag-aaral sa mga tungkulin at responsibilidad bilang mamamayan.',
    icon: require('../assets/gifs/7.gif'),
    status: 'locked',
    progressPercentage: 0,
  },
];

const FilterButton = ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => (
  <TouchableOpacity
    style={[styles.filterButton, isActive && styles.activeFilterButton]}
    onPress={onPress}>
    <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const LessonCard = ({ lesson, index, onPress }: { lesson: any; index: number; onPress: (lesson: any) => void }) => {
  const isCompleted = lesson.status === 'completed';
  const isLocked = lesson.status === 'locked';
  const showProgress = !isLocked; // Show progress bar for all non-locked lessons

  return (
    <TouchableOpacity
      style={[styles.lessonCard, isLocked && styles.lockedLessonCard]}
      onPress={() => onPress(lesson)}
      disabled={isLocked}
    >
      <View style={styles.lessonIconContainer}>
        <Image source={lesson.icon} style={styles.lessonIcon} />
      </View>
      <View style={styles.lessonContent}>
        <Text style={styles.lessonNumber}>Lesson {lesson.id}</Text>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        {showProgress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${lesson.progressPercentage || 0}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {lesson.progressPercentage || 0}% complete
            </Text>
          </View>
        )}
      </View>
      <View style={styles.lessonStatus}>
        {isCompleted && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
        {isLocked && (
          <Image source={require('../assets/images/lock.png')} style={styles.lockIcon} />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function FirstQuarter() {
  const router = useRouter();
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [lessons, setLessons] = useState<any[]>(INITIAL_LESSONS);
  const [progressLoading, setProgressLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'ongoing' | 'completed'>('all');
  const loadedRef = React.useRef(false);

  // On mount, fetch lesson metadata and progress, apply updates sequentially
  React.useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    (async () => {
      try {
        const picked = await pickApiBase();

        // First, fetch and merge lesson metadata (description/asset_url only, keep local titles)
        let currentLessons = [...INITIAL_LESSONS]; // Use initial to avoid state snapshot issues
        const lessonsRes = await fetch(`${picked}/test/lessons`);
        if (lessonsRes.ok) {
          const json = await lessonsRes.json();
          const remote = json.lessons || json;
          if (Array.isArray(remote)) {
            currentLessons = currentLessons.map(l => {
              const r = remote.find((x: any) => Number(x.id) === Number(l.id));
              if (r) {
                return {
                  ...l,
                  description: r.content || r.description || l.description,
                  asset_url: r.asset_url
                };
              }
              return l;
            });
          }
        }

        // Then, fetch and apply progress
        const progressRes = await fetch(`${picked}/progress/2`);
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          currentLessons = currentLessons.map(lesson => {
            const prog = progressData.find((p: any) => p.lesson_id === lesson.id);
            if (prog) {
              const isCompleted = prog.completed === 1;
              const percentage = isCompleted ? 100 : (prog.score || 0);
              const newStatus = lesson.id > 2 ? 'locked' : (isCompleted ? 'completed' : 'in-progress');
              return {
                ...lesson,
                status: newStatus,
                progressPercentage: percentage
              };
            }
            return lesson;
          });
        }

        setLessons(currentLessons);
      } catch (e) {
        // ignore - keep defaults
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load detailed progress data for each lesson
  useEffect(() => {
    loadLessonProgress();
  }, []);

  // Refresh progress when screen comes into focus (after completing lesson)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 FirstQuarter screen focused - refreshing progress');
      // Only refresh once per focus to avoid rate limiting
      loadLessonProgress();
    }, [])
  );

  const loadLessonProgress = async () => {
    setProgressLoading(true);
    
    // Initialize global state if it doesn't exist
    if (!(global as any).lessonCompletion) {
      (global as any).lessonCompletion = {};
      console.log('🔧 Initialized global lessonCompletion');
    }
    if (!(global as any).lessonProgress) {
      (global as any).lessonProgress = {};
      console.log('🔧 Initialized global lessonProgress');
    }
    
    try {
      const base = await pickApiBase();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        console.log('No authenticated user found');
        setProgressLoading(false);
        return;
      }

      // Get user's actual progress from database
      let userProgressData = [];
      let userDatabaseId = null;
      
      try {
        // First, get user's ID token for authentication
        const idToken = await currentUser.getIdToken();
        
        // Get user's database record to find their database ID
        const userRes = await fetch(`${base}/users/${currentUser.uid}`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (userRes.ok) {
          const userData = await userRes.json();
          userDatabaseId = userData.id;
          console.log('User database record:', userData);
          
          // Now fetch user progress using database ID
          const progressRes = await fetch(`${base}/progress/${userDatabaseId}`, {
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (progressRes.ok) {
            userProgressData = await progressRes.json();
            console.log('📊 User progress data from API:', userProgressData);
            console.log(`📈 Found ${userProgressData.length} progress records`);
            
            // Debug: Show what lessons have progress
            userProgressData.forEach((progress: any) => {
              console.log(`  - Lesson ${progress.lesson_id}: completed=${progress.completed}, score=${progress.score}`);
            });
          } else {
            console.log('❌ No progress data found or error fetching progress');
            console.log('Response status:', progressRes.status);
            console.log('Response text:', await progressRes.text());
          }
        } else {
          console.log('Error fetching user data:', await userRes.text());
        }
      } catch (error) {
        console.error('Error fetching user progress:', error);
      }

      const updatedLessons = [...lessons];
      
      // Update lessons with real progress data
      for (let i = 0; i < updatedLessons.length; i++) {
        const lesson = updatedLessons[i];
        
        // Find user's progress for this lesson
        const lessonProgress = userProgressData.find(
          (progress: any) => progress.lesson_id === lesson.id
        );
        
        let progressPercentage = 0;
        let status = lesson.status;
        
        // Priority 1: Check database completion record
        if (lessonProgress && lessonProgress.completed === 1) {
          progressPercentage = 100;
          status = 'completed';
          console.log(`✅ Lesson ${lesson.id} completed from database: 100%`);
        }
        // Priority 2: Check recent completion data (global state)
        else {
          const completionKey = `${currentUser.uid}_${lesson.id}`;
          const completionData = (global as any).lessonCompletion?.[completionKey];
          
          if (completionData && completionData.completed) {
            progressPercentage = 100;
            status = 'completed';
            console.log(`✅ Found recent completion for lesson ${lesson.id}: 100%`);
          }
          // Priority 3: Check database partial progress
          else if (lessonProgress && lessonProgress.score) {
            progressPercentage = lessonProgress.score;
            status = 'available';
            console.log(`📊 Database progress for lesson ${lesson.id}: ${progressPercentage}%`);
          }
          // Priority 4: Check page-level progress (in-progress)
          else {
            try {
              const progressKey = `lesson_${lesson.id}_progress_${currentUser.uid}`;
              const pageProgress = (global as any).lessonProgress?.[progressKey];
              if (pageProgress && parseFloat(pageProgress.progress) > 0) {
                progressPercentage = parseFloat(pageProgress.progress) || 0;
                status = 'available';
                console.log(`📖 Page progress for lesson ${lesson.id}: ${progressPercentage}%`);
              } else {
                progressPercentage = 0;
                console.log(`⭕ No progress found for lesson ${lesson.id}`);
              }
            } catch (error) {
              console.error('Error reading page progress:', error);
              progressPercentage = 0;
            }
          }
        }
        
        // Get lesson pages for additional metadata
        try {
          const pagesRes = await fetch(`${base}/test/lesson-pages/${lesson.id}`);
          if (pagesRes.ok) {
            const pagesData = await pagesRes.json();
            const totalPages = pagesData.pages ? pagesData.pages.length : 0;
            
            // Special unlock logic for deanalcober@gmail.com
            let finalStatus = status;
            if (currentUser.email === 'deanalcober@gmail.com') {
              // Unlock all lessons for this specific user
              if (finalStatus === 'locked') {
                finalStatus = 'available';
                console.log(`🔓 Unlocked lesson ${lesson.id} for deanalcober@gmail.com`);
              }
            }
            
            updatedLessons[i] = { 
              ...lesson, 
              progressPercentage, 
              status: finalStatus,
              totalPages,
              pagesLoaded: true,
              completed: lessonProgress?.completed === 1,
              completedAt: lessonProgress?.completed_at
            };
          }
        } catch (error) {
          console.error(`Error loading pages for lesson ${lesson.id}:`, error);
          
          // Special unlock logic for deanalcober@gmail.com (fallback case)
          let finalStatus = status;
          if (currentUser.email === 'deanalcober@gmail.com') {
            if (finalStatus === 'locked') {
              finalStatus = 'available';
              console.log(`🔓 Unlocked lesson ${lesson.id} for deanalcober@gmail.com (fallback)`);
            }
          }
          
          // Still update with progress data even if pages fail
          updatedLessons[i] = { 
            ...lesson, 
            progressPercentage, 
            status: finalStatus,
            completed: lessonProgress?.completed === 1,
            completedAt: lessonProgress?.completed_at
          };
        }
      }
      
      setLessons(updatedLessons);
      
      // Debug: Log progress summary for all lessons
      console.log('📊 PROGRESS SUMMARY:');
      updatedLessons.forEach(lesson => {
        console.log(`  Lesson ${lesson.id}: ${lesson.progressPercentage}% (${lesson.status})`);
      });
      
      // Debug: Log global state
      console.log('🌐 Global lesson completion state:', (global as any).lessonCompletion);
      console.log('📖 Global lesson progress state:', (global as any).lessonProgress);
    } catch (error) {
      console.error('Error loading lesson progress:', error);
    } finally {
      setProgressLoading(false);
    }
  };

  const handleNavigateSettings = () => {
    router.push("/SettingsScreen");
  };

  const handleFilterPress = (filterType: 'all' | 'ongoing' | 'completed') => {
    console.log(`Filter pressed: ${filterType}`);
    setActiveFilter(filterType);
  };

  // Filter lessons based on active filter
  const filteredLessons = lessons.filter((lesson) => {
    if (activeFilter === 'all') {
      return true;
    } else if (activeFilter === 'ongoing') {
      return lesson.progressPercentage < 100;
    } else {
      return lesson.progressPercentage === 100;
    }
  });

  const handleLessonPress = (lesson: any) => {
    if (lesson.status !== "locked") {
      router.push({
        pathname: '/LessonIntroScreen',
        params: { lessonId: lesson.id.toString(), lessonTitle: lesson.title },
      });
    }
  };

  const handleCloseModal = () => {
    console.log('Closing modal'); // Debug log
    setModalVisible(false);
    setSelectedLesson(null);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../assets/images/LandingLogo2.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerIcons}>
            <NotificationBell style={styles.icon} />
            <TouchableOpacity onPress={handleNavigateSettings}>
              <Image
                source={require("../assets/images/settings.png")}
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Section Title */}
          <Text style={styles.sectionTitle}>First Quarter</Text>

          {/* Filter Buttons */}
          {/* added horizontal scrolling on filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            <FilterButton
              title="All Lessons"
              isActive={activeFilter === 'all'}
              onPress={() => handleFilterPress('all')}
            />
            <FilterButton
              title="On-going"
              isActive={activeFilter === 'ongoing'}
              onPress={() => handleFilterPress('ongoing')}
            />
            <FilterButton
              title="Completed"
              isActive={activeFilter === 'completed'}
              onPress={() => handleFilterPress('completed')}
            />
          </ScrollView>

          {/* Lessons List */}
          <View style={styles.lessonsList}>
            {filteredLessons.map((lesson, index) => (
              <LessonCard key={lesson.id} lesson={lesson} index={index} onPress={handleLessonPress} />
            ))}
          </View>
        </ScrollView>

        {/* Bottom Navbar */}
        <BottomNav />

        {/* Lesson Intro Modal */}
        {/* Removed LessonIntroModal. Navigation now opens LessonIntroScreen. */}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  activeFilterButton: {
    backgroundColor: '#6366F1',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  lessonsList: {
    gap: 16,
    paddingBottom: 100,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  lockedLessonCard: {
    opacity: 0.6,
  },
  lessonIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  lessonContent: {
    flex: 1,
  },
  lessonNumber: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  lessonStatus: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  lessonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  lockIcon: {
    width: 18,
    height: 18,
  },
  logo: {
    width: 120,
    height: 40,
  },
  icon: {
    width: 24,
    height: 24,
    marginLeft: 16,
  },
});
