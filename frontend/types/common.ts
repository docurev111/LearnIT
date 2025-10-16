/**
 * Common TypeScript interfaces and types for LearnIT application
 * 
 * This file contains shared type definitions used across the application
 * to ensure type safety and consistency.
 */

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export interface User {
  id: number;
  uid: string;
  displayName: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  class_id?: string;
  profile_picture?: string;
  created_at: string;
}

export interface UserProfile extends User {
  total_xp: number;
  current_level: number;
  xp_to_next_level: number;
  login_streak: number;
  last_login_date?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// LESSON & CONTENT TYPES
// ============================================================================

export interface Lesson {
  id: number;
  title: string;
  content: string;
  description?: string;
  subject?: string;
  grade?: number;
  duration?: number; // in minutes
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  hasVideo?: boolean;
  has3DModel?: boolean;
  videoSource?: string | { uri: string } | number;
  modelPath?: string;
  asset_url?: string;
  icon?: any;
  loading?: boolean;
}

export interface LessonPage {
  id: number;
  lesson_id: number;
  page_number: number;
  title: string;
  content: string;
  hasVideo?: boolean;
  has3DModel?: boolean;
  videoSource?: string | { uri: string } | number;
}

export interface LessonProgress {
  lessonId: number;
  currentPage: number;
  totalPages: number;
  lastAccessed: string;
  progress: number; // percentage
  completed: boolean;
  completed_at?: string;
}

// ============================================================================
// QUIZ & ASSESSMENT TYPES
// ============================================================================

export interface Quiz {
  id: number;
  lesson_id: number;
  question: string;
  choices?: string; // JSON string for multiple choice
  correct_answer: string;
  answer: string; // For open-ended questions
  points: number;
  question_type: 'multiple_choice' | 'true_false' | 'open_ended';
}

export interface QuizAnswer {
  questionId: number;
  answer: string;
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  answers: QuizAnswer[];
  xp_earned: number;
  leveledUp: boolean;
}

// ============================================================================
// GAMIFICATION TYPES
// ============================================================================

export interface XPResult {
  xp_earned: number;
  new_total_xp: number;
  level: number;
  leveledUp: boolean;
  badges: Badge[];
  action: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  xp_required: number;
  condition_type: 'lesson_completion' | 'quiz_score' | 'login_streak' | 'daily_lessons' | 'quiz_average' | 'quiz_streak' | 'badge_collection' | 'manual';
  condition_value: string; // JSON string for complex conditions
  badge_type: 'achievement' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserBadge {
  id: number;
  user_id: number;
  badge_id: number;
  earned_at: string;
  awarded_by?: number; // teacher user_id for manual badges
  badge?: Badge; // populated badge details
}

export interface AchievementNotification {
  id: string;
  type: 'badge' | 'level_up' | 'streak' | 'milestone';
  title: string;
  message: string;
  icon?: string;
  xp_earned?: number;
  badge?: Badge;
}

// ============================================================================
// GAME TYPES
// ============================================================================

export interface Game {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  emoji: string;
  isLocked: boolean;
  accentColor: [string, string];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  route: string;
}

export interface GameResult {
  score: number;
  timeSpent: number;
  accuracy: number;
  xp_earned: number;
  completed: boolean;
  achievements?: Badge[];
}

// ============================================================================
// SCENARIO TYPES
// ============================================================================

export interface ScenarioChoice {
  text: string;
  action: string;
  consequence?: string;
  xp_earned?: number;
}

export interface ScenarioDialogue {
  character: string;
  text: string;
  emotion?: 'happy' | 'sad' | 'angry' | 'confused' | 'excited';
}

export interface ScenarioState {
  currentScene: string;
  currentCharacter: string;
  currentDialogueSet: string[];
  currentChoiceSet: ScenarioChoice[];
  showIntro: boolean;
  showDialogue: boolean;
  showChoices: boolean;
  showCongrats: boolean;
  showBadEnding: boolean;
  isFrozen: boolean;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export interface NavigationParams {
  lessonId?: string;
  lessonTitle?: string;
  gameId?: string;
  scenarioId?: string;
  userId?: string;
}

export interface RouteParams extends NavigationParams {
  [key: string]: string | undefined;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}

export interface ErrorState {
  hasError: boolean;
  errorMessage?: string;
  errorCode?: string;
}

export interface ModalState {
  isVisible: boolean;
  title?: string;
  content?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
}

// ============================================================================
// THEME & STYLING TYPES
// ============================================================================

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface Typography {
  h1: object;
  h2: object;
  h3: object;
  body: object;
  caption: object;
  button: object;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type UserRole = 'student' | 'teacher' | 'admin';
export type GameStatus = 'locked' | 'unlocked' | 'completed';
export type LessonStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed';

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface BaseComponentProps {
  children?: React.ReactNode;
  style?: object;
  testID?: string;
}

export interface TouchableProps extends BaseComponentProps {
  onPress: () => void;
  disabled?: boolean;
  activeOpacity?: number;
}

export interface ModalProps extends BaseComponentProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  animationType?: 'slide' | 'fade' | 'none';
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export * from './index';
