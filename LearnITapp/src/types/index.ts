// Updated types for the SciSteps e-learning app with proper video source types

export interface Lesson {
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

export interface LessonPage {
  id: number;
  title: string;
  content: string;
  hasVideo?: boolean;
  has3DModel?: boolean;
  videoSource?: string | { uri: string } | number; // Support local assets, URIs, and require() imports
  modelPath?: string;
}

export interface Quiz {
  id: number;
  lesson_id: number;
  question: string;
  answer: string;
  options?: string[]; // For multiple choice questions
  type?: 'text' | 'multiple-choice';
}

export interface Progress {
  id?: number;
  user_id: string;
  lesson_id: number;
  completed: boolean;
  score: number;
  completed_at?: Date;
  time_spent?: number; // in minutes
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  grade?: number;
  role?: 'student' | 'teacher' | 'admin';
}

export interface Achievement {
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

export interface NavigationParams {
  lessonId?: string;
  lessonTitle?: string;
  quizId?: string;
  score?: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Firebase types
export interface FirebaseUser extends User {
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
}

// Component props types
export interface LessonCardProps {
  lesson: Lesson;
  onPress: (lesson: Lesson) => void;
  themeStyles: ThemeStyles;
}

export interface QuizQuestionProps {
  quiz: Quiz;
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
