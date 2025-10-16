// QuizLandingScreen.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";

interface QuizLandingScreenProps {
  title?: string;
  instructions?: string;
  questionCount?: number;
  points?: number;
  onTakeQuiz?: () => void;
  onNotReady?: () => void;
  quizType?: string;
}

const QuizLandingScreen: React.FC<QuizLandingScreenProps> = ({
  title = "Gamit ng Isip at Kilos-loob sa Sariling Pagpapasiya at Pagkilos",
  instructions = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  questionCount = 15,
  points = 30,
  onTakeQuiz,
  onNotReady,
  quizType = "quiz"
}) => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get data from params if available
  const lessonId = params.lessonId as string;
  const lessonTitle = params.lessonTitle as string;
  const activityTitle = params.activityTitle as string;

  // Use param data if available, otherwise use props
  const displayTitle = activityTitle || title;
  const displayQuestionCount = params.questionCount ? parseInt(params.questionCount as string) : questionCount;
  const displayPoints = params.points ? parseInt(params.points as string) : points;
  const displayInstructions = params.instructions as string || instructions;

  const handleTakeQuiz = () => {
    if (onTakeQuiz) {
      onTakeQuiz();
    } else {
      // Default navigation based on quiz type
      if (quizType === 'quiz' && lessonId) {
        router.push({
          pathname: '/QuizScreen',
          params: { lessonId }
        });
      } else {
        router.push("/QuizScreen");
      }
    }
  };

  const handleNotReady = () => {
    if (onNotReady) {
      onNotReady();
    } else {
      // Default behavior: go back
      router.back();
    }
  };

  return (
    <LinearGradient
      colors={["#2E26D9", "#3B2DCB", "#4330C3"]}
      style={styles.container}
    >
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.quizMeta}>
          {displayQuestionCount} QUESTIONS | {displayPoints} POINTS
        </Text>
        <Text style={styles.title}>
          {displayTitle}
        </Text>
        <Text style={styles.instructions}>
          <Text style={styles.instructionsBold}>Instructions: </Text>
          {displayInstructions}
        </Text>
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={handleTakeQuiz}
        >
          <Text style={styles.primaryButtonText}>
            {quizType === 'quiz' ? 'Take Quiz' : 'Start Exercise'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.8}
          onPress={handleNotReady}
        >
          <Text style={styles.secondaryButtonText}>I'm not ready</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Cloud Decoration (optional placeholder) */}
      <View style={styles.bottomShape}>
        <View style={styles.cloudLeft} />
        <View style={styles.cloudRight} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 80,
  },
  headerContainer: {
    width: "85%",
    alignItems: "center",
  },
  quizMeta: {
    color: "#D1CFFF",
    fontSize: 13,
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  instructions: {
    color: "#C5C3F9",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  instructionsBold: {
    fontWeight: "bold",
    color: "#C5C3F9",
  },
  buttonContainer: {
    alignItems: "center",
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 50,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#3B2DCB",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 45,
  },
  secondaryButtonText: {
    color: "#A7A3E6",
    fontSize: 15,
    fontWeight: "500",
  },
  bottomShape: {
    position: "absolute",
    bottom: -40,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  cloudLeft: {
    width: 160,
    height: 90,
    borderRadius: 100,
    backgroundColor: "#5A4DE1",
    marginRight: -40,
  },
  cloudRight: {
    width: 160,
    height: 90,
    borderRadius: 100,
    backgroundColor: "#5A4DE1",
  },
});

export default QuizLandingScreen;
