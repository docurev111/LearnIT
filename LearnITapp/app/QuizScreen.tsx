/**
 * QuizScreen.tsx
 * 
 * Interactive quiz interface with multiple question types (multiple choice, true/false).
 * Fetches questions from backend, tracks user answers, calculates scores, and awards XP.
 * 
 * @component
 * @param {string} lessonId - The ID of the lesson this quiz belongs to (from route params)
 * 
 * Features:
 * - Dynamic question loading from API
 * - Progress tracking
 * - XP rewards on completion
 * - Anti-farming protection
 * 
 * TODO: Extract reusable components:
 * - QuestionCard component
 * - ProgressBar component
 * - ScoreCard component
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Alert,
  Animated
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { app } from '../firebaseConfig';
import { Colors, Spacing, Typography, BorderRadius, TouchTargets } from '../constants/theme';
import API_BASE_URL from '../config/api';
import XPFeedback from '../components/XPFeedback';
import { useAchievements } from '../contexts/AchievementContext';

interface Quiz {
  id: number;
  lesson_id: number;
  question: string;
  answer: string;
}

export default function QuizScreen() {
  const router = useRouter();
  const auth = getAuth(app);
  const { lessonId, lessonTitle } = useLocalSearchParams();
  const { checkAndAwardAchievements } = useAchievements();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [xpFeedbackVisible, setXpFeedbackVisible] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);

  useEffect(() => {
    if (lessonId) {
      fetchQuizzes();
    } else {
      // If no lessonId provided, redirect to lessons screen
      setTimeout(() => {
        router.replace('/LessonScreenNew');
      }, 1000);
    }
  }, [lessonId]);

  const fetchQuizzes = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.replace('/LoginScreen');
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch(`${API_BASE_URL}/quizzes/${lessonId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      } else {
        setError('Failed to load quiz questions');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch quizzes error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) {
      Alert.alert('Please enter an answer', 'Type your answer before submitting.');
      return;
    }

    const currentQuiz = quizzes[currentQuizIndex];
    const isCorrect = userAnswer.toLowerCase().trim() === currentQuiz.answer.toLowerCase().trim();
    
    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setUserAnswer('');
      setShowResult(false);
    } else {
      // Quiz completed
      setQuizCompleted(true);
      saveProgress();
    }
  };

  const saveProgress = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const finalScore = Math.round((score / quizzes.length) * 100);

      // Call complete-quiz endpoint to award XP
      const response = await fetch(`${API_BASE_URL}/complete-quiz`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.uid,
          lesson_id: parseInt(lessonId as string),
          score: finalScore,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setXpAmount(data.xp_earned || 30);
        setXpFeedbackVisible(true);
        
        // Check for new achievements
        await checkAndAwardAchievements('quiz_score', {
          lesson_id: parseInt(lessonId as string),
          score: finalScore,
          total_questions: quizzes.length,
          percentage: finalScore
        });
      } else {
        console.error('Failed to complete quiz');
      }

      // Also save progress (existing functionality)
      await fetch(`${API_BASE_URL}/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1, // You'll need to get actual user ID from your user system
          lesson_id: parseInt(lessonId as string),
          completed: 1,
          score: finalScore,
        }),
      });
    } catch (err) {
      console.error('Save progress error:', err);
    }
  };

  const goBack = () => {
    router.back();
  };

  const goHome = () => {
    router.push('/HomeScreen');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || quizzes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || 'No quiz questions available for this lesson.'}
          </Text>
          <TouchableOpacity onPress={goBack} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (quizCompleted) {
    const finalScore = Math.round((score / quizzes.length) * 100);
    const isGoodScore = finalScore >= 70;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultContainer}>
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>{isGoodScore ? '🎉' : '📚'}</Text>
            <Text style={styles.resultTitle}>
              {isGoodScore ? 'Great Job!' : 'Keep Learning!'}
            </Text>
            <Text style={styles.resultScore}>
              You scored {score} out of {quizzes.length}
            </Text>
            <Text style={styles.resultPercentage}>{finalScore}%</Text>
            
            <Text style={styles.resultMessage}>
              {isGoodScore
                ? '🎉 Fantastic! You\'re an ICT superstar! Keep up the amazing work!'
                : '💪 Great effort! Let\'s review the ICT lesson together and try again!'}
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={goBack} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Review Lesson</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={goHome} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Continue Learning</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentQuiz = quizzes[currentQuizIndex];
  const isCorrect = showResult && userAnswer.toLowerCase().trim() === currentQuiz.answer.toLowerCase().trim();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{lessonTitle} Quiz</Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Question {currentQuizIndex + 1} of {quizzes.length}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentQuizIndex + 1) / quizzes.length) * 100}%` }
            ]} 
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuiz.question}</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.answerInput,
                showResult && (isCorrect ? styles.correctInput : styles.incorrectInput)
              ]}
              placeholder="Type your answer here..."
              value={userAnswer}
              onChangeText={setUserAnswer}
              editable={!showResult}
              autoCapitalize="words"
              placeholderTextColor={Colors.light.icon}
            />
          </View>

          {showResult && (
            <View style={styles.resultFeedback}>
              <Text style={[styles.feedbackText, isCorrect ? styles.correctText : styles.incorrectText]}>
                {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
              </Text>
              {!isCorrect && (
                <Text style={styles.correctAnswerText}>
                  The correct answer is: <Text style={styles.boldText}>{currentQuiz.answer}</Text>
                </Text>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              showResult && styles.nextButton,
              (!userAnswer.trim() && !showResult) && styles.disabledButton
            ]}
            onPress={showResult ? handleNextQuestion : handleSubmitAnswer}
            disabled={!userAnswer.trim() && !showResult}
          >
            <Text style={styles.submitButtonText}>
              {showResult 
                ? (currentQuizIndex < quizzes.length - 1 ? 'Next Question' : 'Finish Quiz')
                : 'Submit Answer'
              }
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Current Score: {score}/{currentQuizIndex + (showResult ? 1 : 0)}</Text>
        </View>
      </ScrollView>
      <XPFeedback
        visible={xpFeedbackVisible}
        xpAmount={xpAmount}
        onComplete={() => setXpFeedbackVisible(false)}
      />
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
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginLeft: 16,
    flex: 1,
  },
  progressContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  progressText: {
    fontSize: 14,
    color: Colors.light.icon,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e1e5e9',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.tint,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    padding: 20,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 24,
    lineHeight: 26,
  },
  inputContainer: {
    marginBottom: 20,
  },
  answerInput: {
    borderWidth: 2,
    borderColor: '#e1e5e9',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  correctInput: {
    borderColor: '#28a745',
    backgroundColor: '#d4edda',
  },
  incorrectInput: {
    borderColor: '#dc3545',
    backgroundColor: '#f8d7da',
  },
  resultFeedback: {
    marginBottom: 20,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  correctText: {
    color: '#28a745',
  },
  incorrectText: {
    color: '#dc3545',
  },
  correctAnswerText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  boldText: {
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButton: {
    backgroundColor: '#28a745',
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  scoreContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 18,
    color: Colors.light.icon,
    marginBottom: 4,
  },
  resultPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginBottom: 16,
  },
  resultMessage: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.light.tint,
    fontSize: 16,
    fontWeight: '600',
  },
});
