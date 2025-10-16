/**
 * Main types export file for LearnIT application
 * 
 * Re-exports all types from common.ts for easy importing
 * and maintains backward compatibility with existing types
 */

// Re-export all types from common.ts
export * from './common';

// Legacy types for backward compatibility
export interface LegacyLesson {
  id: number;
  title: string;
  content: string;
  subject?: string;
  grade?: number;
  duration?: number; // in minutes
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  hasVideo?: boolean;
  has3DModel?: boolean;
  videoSource?: string | { uri: string } | number; // Support local assets, URIs, and require() imports
  modelPath?: string;
}

export interface LegacyLessonPage {
  id: number;
  title: string;
  content: string;
  hasVideo?: boolean;
  has3DModel?: boolean;
  videoSource?: string | { uri: string } | number; // Support local assets, URIs, and require() imports
  modelPath?: string;
}

export interface LegacyQuiz {
  id: number;
  lesson_id: number;
  question: string;
  answer: string;
  options?: string[]; // For multiple choice questions
  type?: 'text' | 'multiple-choice';
}

export interface LegacyProgress {
  id?: number;
  user_id: string;
  lesson_id: number;
  completed: boolean;
  score: number;
  completed_at?: Date;
  time_spent?: number; // in minutes
}

export interface LegacyUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  grade?: number;
  role?: 'student' | 'teacher' | 'admin';
}

export interface LegacyAchievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  requirement: string;
  earned: boolean;
  earnedDate?: Date;
}

export interface ThemeStyles {
  background: string;
  cardBg: string;
  accent: string;
}

export interface LegacyNavigationParams {
  lessonId?: string;
  lessonTitle?: string;
  quizId?: string;
  score?: number;
}

// API Response types
export interface LegacyApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Firebase types
export interface FirebaseUser extends LegacyUser {
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
}

// Component props types
export interface LessonCardProps {
  lesson: LegacyLesson;
  onPress: (lesson: LegacyLesson) => void;
  themeStyles: ThemeStyles;
}

export interface QuizQuestionProps {
  quiz: LegacyQuiz;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  showResult?: boolean;
}

export interface ProgressBarProps {
  progress: number;
  total: number;
  completed: number;
  color?: string;
  height?: number;
}