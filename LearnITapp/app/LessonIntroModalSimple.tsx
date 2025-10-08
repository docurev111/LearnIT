// LessonIntroModalSimple.tsx - Fancy single modal (merged and cleaned)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';

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

  if (!lesson) return null;

  const handleStartLesson = () => {
    onClose();
    router.push({
      pathname: '/LessonSimpleScreen',
      params: { lessonId: lesson.id.toString(), lessonTitle: lesson.title },
    });
  };

  // Intentionally do not display full lesson content in the modal.
  // Show a short static prompt instead to avoid leaking lesson body here.

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.lessonNumberContainer}>
            <Text style={styles.lessonNumberSmall}>LESSON {lesson.id}</Text>
          </View>

          {/* Close top-left */}
          <TouchableOpacity style={styles.closeButtonLeft} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>

          {/* Title + brief description */}
          <View style={styles.headerContainerNoImage}>
            <Text style={styles.lessonTitleBig}>{lesson.title}</Text>

            {lesson.loading ? (
              <ActivityIndicator size="small" color="#6366F1" style={{ marginTop: 16 }} />
            ) : (
              <Text style={styles.lessonDescriptionSmall}>
                Tap “Start Lesson” to open the full lesson content.
              </Text>
            )}
          </View>

          {/* Bottom purple card (fixed) */}
          <View style={styles.bottomCard}>
            <Text style={styles.bottomNote}>
              💡 Remember: learning about {lesson.title.toLowerCase()} is not just about using them—it's about discovering how they can empower you to think critically, work creatively, and communicate effectively in the digital age.
            </Text>

            <TouchableOpacity style={styles.pillButton} onPress={handleStartLesson}>
              <Text style={styles.pillText}>Start Lesson</Text>
            </TouchableOpacity>
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
    minHeight: screenHeight * 0.75,
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
  },
  // removed top progress and scrollable styles
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
  lessonDescription: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
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
  pillButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: pillPaddingHorizontal,
    borderRadius: 999,
  },
  pillText: {
    color: '#6366F1',
    fontWeight: '700',
    fontSize: 16,
  },
});
