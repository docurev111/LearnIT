// app/RewardScreen.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { app } from '../firebaseConfig';
import { Colors } from '../constants/theme';
import API_BASE_URL from '../config/api';

interface Progress {
  id: number;
  user_id: number;
  lesson_id: number;
  score: number;
  completed: boolean;
}

interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  earned: boolean;
  requirement: string;
}

export default function RewardScreen() {
  const router = useRouter();
  const auth = getAuth(app);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalScore, setTotalScore] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.replace('/LoginScreen');
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch(`${API_BASE_URL}/progress/1`, { // Using user ID 1 for now
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(data);
        calculateStats(data);
        generateBadges(data);
      } else {
        setError('Failed to load progress');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch progress error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (progressData: Progress[]) => {
    const completed = progressData.filter(p => p.completed).length;
    const total = progressData.reduce((sum, p) => sum + (p.score || 0), 0);
    const average = progressData.length > 0 ? Math.round(total / progressData.length) : 0;
    
    setCompletedLessons(completed);
    setTotalScore(average);
  };

  const generateBadges = (progressData: Progress[]) => {
    const completed = progressData.filter(p => p.completed).length;
    const highScores = progressData.filter(p => p.score >= 90).length;
    const perfectScores = progressData.filter(p => p.score === 100).length;
    const averageScore = progressData.length > 0 
      ? progressData.reduce((sum, p) => sum + (p.score || 0), 0) / progressData.length 
      : 0;

    const badgeList: Badge[] = [
      {
        id: 'first_lesson',
        title: 'First Steps',
        description: 'Complete your first lesson',
        emoji: '🎯',
        earned: completed >= 1,
        requirement: 'Complete 1 lesson',
      },
      {
        id: 'plant_expert',
        title: 'Plant Expert',
        description: 'Master the Plants lesson',
        emoji: '🌱',
        earned: progressData.some(p => p.lesson_id === 1 && p.completed && p.score >= 80),
        requirement: 'Score 80%+ on Plants lesson',
      },
      {
        id: 'animal_lover',
        title: 'Animal Lover',
        description: 'Master the Animals lesson',
        emoji: '🐾',
        earned: progressData.some(p => p.lesson_id === 2 && p.completed && p.score >= 80),
        requirement: 'Score 80%+ on Animals lesson',
      },
      {
        id: 'high_achiever',
        title: 'High Achiever',
        description: 'Score 90% or higher on any quiz',
        emoji: '⭐',
        earned: highScores >= 1,
        requirement: 'Score 90%+ on any quiz',
      },
      {
        id: 'perfectionist',
        title: 'Perfectionist',
        description: 'Get a perfect score!',
        emoji: '💯',
        earned: perfectScores >= 1,
        requirement: 'Score 100% on any quiz',
      },
      {
        id: 'dedicated_learner',
        title: 'Dedicated Learner',
        description: 'Complete all available lessons',
        emoji: '🏆',
        earned: completed >= 2, // Assuming 2 lessons available
        requirement: 'Complete all lessons',
      },
      {
        id: 'science_star',
        title: 'Science Star',
        description: 'Maintain an average score of 85%+',
        emoji: '🌟',
        earned: averageScore >= 85,
        requirement: 'Average score of 85%+',
      },
    ];

    setBadges(badgeList);
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Loading rewards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const earnedBadges = badges.filter(badge => badge.earned);
  const lockedBadges = badges.filter(badge => !badge.earned);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Rewards</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchProgress} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Stats Section */}
            <View style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>Your Progress</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{completedLessons}</Text>
                  <Text style={styles.statLabel}>Lessons Completed</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{totalScore}%</Text>
                  <Text style={styles.statLabel}>Average Score</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{earnedBadges.length}</Text>
                  <Text style={styles.statLabel}>Badges Earned</Text>
                </View>
              </View>
            </View>

            {/* Earned Badges */}
            <View style={styles.badgesContainer}>
              <Text style={styles.sectionTitle}>🏆 Earned Badges ({earnedBadges.length})</Text>
              {earnedBadges.length > 0 ? (
                <View style={styles.badgesGrid}>
                  {earnedBadges.map((badge) => (
                    <View key={badge.id} style={[styles.badgeCard, styles.earnedBadge]}>
                      <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                      <Text style={styles.badgeTitle}>{badge.title}</Text>
                      <Text style={styles.badgeDescription}>{badge.description}</Text>
                      <View style={styles.earnedIndicator}>
                        <Text style={styles.earnedText}>✓ Earned!</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>🎯</Text>
                  <Text style={styles.emptyTitle}>No badges yet!</Text>
                  <Text style={styles.emptyText}>
                    Complete lessons and quizzes to earn your first badge.
                  </Text>
                </View>
              )}
            </View>

            {/* Locked Badges */}
            {lockedBadges.length > 0 && (
              <View style={styles.badgesContainer}>
                <Text style={styles.sectionTitle}>🔒 Available Badges ({lockedBadges.length})</Text>
                <View style={styles.badgesGrid}>
                  {lockedBadges.map((badge) => (
                    <View key={badge.id} style={[styles.badgeCard, styles.lockedBadge]}>
                      <Text style={styles.badgeEmojiLocked}>❓</Text>
                      <Text style={styles.badgeTitleLocked}>{badge.title}</Text>
                      <Text style={styles.badgeDescriptionLocked}>{badge.description}</Text>
                      <View style={styles.requirementContainer}>
                        <Text style={styles.requirementText}>{badge.requirement}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Motivational Section */}
            <View style={styles.motivationContainer}>
              <Text style={styles.motivationTitle}>Keep Learning! 📚</Text>
            <Text style={styles.motivationText}>
              🌟 Every lesson you complete and every quiz you take brings you closer to becoming a science superstar! Keep exploring and learning amazing things! 🚀
            </Text>
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={() => router.push('/ExploreLessonScreen')}
              >
                <Text style={styles.continueButtonText}>Continue Learning</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.icon,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.icon,
    textAlign: 'center',
  },
  badgesContainer: {
    padding: 20,
    paddingTop: 0,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 80,
  },
  earnedBadge: {
    borderWidth: 2,
    borderColor: '#28a745',
  },
  lockedBadge: {
    opacity: 0.6,
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeEmojiLocked: {
    fontSize: 32,
    marginBottom: 8,
    opacity: 0.5,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeTitleLocked: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.icon,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 12,
    color: Colors.light.icon,
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeDescriptionLocked: {
    fontSize: 12,
    color: Colors.light.icon,
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.7,
  },
  earnedIndicator: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  earnedText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  requirementContainer: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  requirementText: {
    fontSize: 10,
    color: Colors.light.icon,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.icon,
    textAlign: 'center',
    lineHeight: 20,
  },
  motivationContainer: {
    margin: 20,
    backgroundColor: '#f0f8ff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: Colors.light.icon,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
