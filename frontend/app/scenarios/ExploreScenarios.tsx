import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Animated LinearGradient
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
import Navbar from "../../components/BottomNav";
import NotificationBell from "../../components/NotificationBell";
import { Stack } from "expo-router";
import { useRouter } from "expo-router";

export default function ExploreScenarios() {
  const router = useRouter();

  // Animation values
  const firstScenarioScale = useRef(new Animated.Value(0)).current;
  const secondScenarioScale = useRef(new Animated.Value(0)).current;
  const thirdScenarioScale = useRef(new Animated.Value(0)).current;
  const fourthScenarioScale = useRef(new Animated.Value(0)).current;
  const fifthScenarioScale = useRef(new Animated.Value(0)).current;
  const sixthScenarioScale = useRef(new Animated.Value(0)).current;
  const seventhScenarioScale = useRef(new Animated.Value(0)).current;

  const shimmerAnim = useRef(new Animated.Value(-1)).current;
  const glassOpacity = useRef(new Animated.Value(0.3)).current;

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [lockedScenario, setLockedScenario] = useState("");

  const handleNavigateSettings = () => {
    router.push("/SettingsScreen");
  };

  const animateCard = (animatedValue: Animated.Value, delay: number = 0) => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(animatedValue, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Shimmer animation
  const startShimmerAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: -1,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  // Glass overlay animation
  const startGlassAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glassOpacity, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glassOpacity, {
          toValue: 0.1,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    animateCard(firstScenarioScale, 0);
    animateCard(secondScenarioScale, 200);
    animateCard(thirdScenarioScale, 400);
    animateCard(fourthScenarioScale, 600);
    animateCard(fifthScenarioScale, 800);
    animateCard(sixthScenarioScale, 1000);
    animateCard(seventhScenarioScale, 1200);
    startShimmerAnimation();
    startGlassAnimation();
  }, []);

  // Shimmer movement
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-150, 150],
  });

  const handleFirstScenarioPress = () => {
    Animated.sequence([
      Animated.timing(firstScenarioScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(firstScenarioScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push("/scenarios/ScenarioScreenL1");
    });
  };

  const handleSecondScenarioPress = () => {
    Animated.sequence([
      Animated.timing(secondScenarioScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(secondScenarioScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push("/scenarios/ScenarioScreenL2");
    });
  };

  const handleThirdScenarioPress = () => {
    Animated.sequence([
      Animated.timing(thirdScenarioScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(thirdScenarioScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // TODO: Add ScenarioScreen_L3
      console.log("Lesson 3 scenario not yet implemented");
    });
  };

  const handleFourthScenarioPress = () => {
    Animated.sequence([
      Animated.timing(fourthScenarioScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fourthScenarioScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // TODO: Add ScenarioScreen_L4
      console.log("Lesson 4 scenario not yet implemented");
    });
  };

  const handleFifthScenarioPress = () => {
    Animated.sequence([
      Animated.timing(fifthScenarioScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fifthScenarioScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // TODO: Add ScenarioScreen_L5
      console.log("Lesson 5 scenario not yet implemented");
    });
  };

  const handleSixthScenarioPress = () => {
    Animated.sequence([
      Animated.timing(sixthScenarioScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sixthScenarioScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push("/scenarios/ScenarioScreenL6");
    });
  };

  const handleSeventhScenarioPress = () => {
    Animated.sequence([
      Animated.timing(seventhScenarioScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(seventhScenarioScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // TODO: Add ScenarioScreen_L7
      console.log("Lesson 7 scenario not yet implemented");
    });
  };

  const handleLockedScenarioPress = (scenarioName: string) => {
    setLockedScenario(scenarioName);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setLockedScenario("");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        {/* Logo */}
        <Image
          source={require("../../assets/images/LandingLogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Top icons */}
        <View style={styles.topIcons}>
          <NotificationBell style={styles.icon} />
          <TouchableOpacity onPress={handleNavigateSettings}>
            <Image
              source={require("../../assets/images/settings.png")}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title}>Explore Scenarios</Text>
        <Text style={styles.subtitle}>Choose which scenario you'd like to play</Text>

        {/* Scenario Cards */}
        <ScrollView contentContainerStyle={styles.cardsContainer}>
          {/* First Scenario (Unlocked) */}
          <Animated.View
            style={[
              styles.card,
              {
                transform: [{ scale: firstScenarioScale }],
              },
            ]}
          >
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.1)", "rgba(147, 51, 234, 0.9)"]}
              style={{ flex: 1, borderRadius: 15, overflow: "hidden" }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Glass Overlay */}
              <Animated.View
                style={[
                  styles.glassOverlay,
                  {
                    opacity: glassOpacity,
                  },
                ]}
              />

              {/* Shimmer Effect */}
              <AnimatedLinearGradient
                colors={[
                  "transparent",
                  "rgba(255,255,255,0.6)",
                  "transparent",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.shimmer,
                  {
                    transform: [{ translateX: shimmerTranslate }],
                  },
                ]}
              />

              {/* Content */}
              <TouchableOpacity
                style={styles.cardTouchable}
                onPress={handleFirstScenarioPress}
              >
                <View style={styles.numberContainer}>
                  <Text style={styles.cardNumber}>1</Text>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>First Scenario</Text>
                  <Text style={styles.cardDetails}>Difficulty Easy</Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Second Scenario (Unlocked - Lesson 2 Dignity) */}
          <Animated.View
            style={[
              styles.card,
              {
                transform: [{ scale: secondScenarioScale }],
              },
            ]}
          >
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.1)", "rgba(245, 158, 11, 0.9)"]}
              style={{ flex: 1, borderRadius: 15, overflow: "hidden" }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Glass Overlay */}
              <Animated.View
                style={[
                  styles.glassOverlay,
                  {
                    opacity: glassOpacity,
                  },
                ]}
              />

              {/* Shimmer Effect */}
              <AnimatedLinearGradient
                colors={[
                  "transparent",
                  "rgba(255,255,255,0.6)",
                  "transparent",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.shimmer,
                  {
                    transform: [{ translateX: shimmerTranslate }],
                  },
                ]}
              />

              {/* Content */}
              <TouchableOpacity
                style={styles.cardTouchable}
                onPress={handleSecondScenarioPress}
              >
                <View style={styles.numberContainer}>
                  <Text style={styles.cardNumber}>2</Text>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>Ang Bagong Kaklase</Text>
                  <Text style={styles.cardDetails}>Difficulty Medium</Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Third Scenario (Unlocked - Lesson 3) */}
          <Animated.View
            style={[
              styles.card,
              {
                transform: [{ scale: thirdScenarioScale }],
              },
            ]}
          >
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.1)", "rgba(34, 197, 94, 0.9)"]}
              style={{ flex: 1, borderRadius: 15, overflow: "hidden" }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Animated.View
                style={[
                  styles.glassOverlay,
                  {
                    opacity: glassOpacity,
                  },
                ]}
              />
              <AnimatedLinearGradient
                colors={[
                  "transparent",
                  "rgba(255,255,255,0.6)",
                  "transparent",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.shimmer,
                  {
                    transform: [{ translateX: shimmerTranslate }],
                  },
                ]}
              />
              <TouchableOpacity
                style={styles.cardTouchable}
                onPress={handleThirdScenarioPress}
              >
                <View style={styles.numberContainer}>
                  <Text style={styles.cardNumber}>3</Text>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>Third Scenario</Text>
                  <Text style={styles.cardDetails}>Difficulty Medium</Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Fourth Scenario (Unlocked - Lesson 4) */}
          <Animated.View
            style={[
              styles.card,
              {
                transform: [{ scale: fourthScenarioScale }],
              },
            ]}
          >
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.1)", "rgba(59, 130, 246, 0.9)"]}
              style={{ flex: 1, borderRadius: 15, overflow: "hidden" }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Animated.View
                style={[
                  styles.glassOverlay,
                  {
                    opacity: glassOpacity,
                  },
                ]}
              />
              <AnimatedLinearGradient
                colors={[
                  "transparent",
                  "rgba(255,255,255,0.6)",
                  "transparent",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.shimmer,
                  {
                    transform: [{ translateX: shimmerTranslate }],
                  },
                ]}
              />
              <TouchableOpacity
                style={styles.cardTouchable}
                onPress={handleFourthScenarioPress}
              >
                <View style={styles.numberContainer}>
                  <Text style={styles.cardNumber}>4</Text>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>Fourth Scenario</Text>
                  <Text style={styles.cardDetails}>Difficulty Medium</Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Fifth Scenario (Unlocked - Lesson 5) */}
          <Animated.View
            style={[
              styles.card,
              {
                transform: [{ scale: fifthScenarioScale }],
              },
            ]}
          >
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.1)", "rgba(168, 85, 247, 0.9)"]}
              style={{ flex: 1, borderRadius: 15, overflow: "hidden" }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Animated.View
                style={[
                  styles.glassOverlay,
                  {
                    opacity: glassOpacity,
                  },
                ]}
              />
              <AnimatedLinearGradient
                colors={[
                  "transparent",
                  "rgba(255,255,255,0.6)",
                  "transparent",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.shimmer,
                  {
                    transform: [{ translateX: shimmerTranslate }],
                  },
                ]}
              />
              <TouchableOpacity
                style={styles.cardTouchable}
                onPress={handleFifthScenarioPress}
              >
                <View style={styles.numberContainer}>
                  <Text style={styles.cardNumber}>5</Text>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>Fifth Scenario</Text>
                  <Text style={styles.cardDetails}>Difficulty Medium</Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Sixth Scenario (Unlocked - Lesson 6 Earthquake) */}
          <Animated.View
            style={[
              styles.card,
              {
                transform: [{ scale: sixthScenarioScale }],
              },
            ]}
          >
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.1)", "rgba(239, 68, 68, 0.9)"]}
              style={{ flex: 1, borderRadius: 15, overflow: "hidden" }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Glass Overlay */}
              <Animated.View
                style={[
                  styles.glassOverlay,
                  {
                    opacity: glassOpacity,
                  },
                ]}
              />

              {/* Shimmer Effect */}
              <AnimatedLinearGradient
                colors={[
                  "transparent",
                  "rgba(255,255,255,0.6)",
                  "transparent",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.shimmer,
                  {
                    transform: [{ translateX: shimmerTranslate }],
                  },
                ]}
              />

              {/* Content */}
              <TouchableOpacity
                style={styles.cardTouchable}
                onPress={handleSixthScenarioPress}
              >
                <View style={styles.numberContainer}>
                  <Text style={styles.cardNumber}>6</Text>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>Ang Lindol sa Paaralan</Text>
                  <Text style={styles.cardDetails}>Difficulty Complex</Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Seventh Scenario (Unlocked - Lesson 7) */}
          <Animated.View
            style={[
              styles.card,
              {
                transform: [{ scale: seventhScenarioScale }],
              },
            ]}
          >
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.1)", "rgba(236, 72, 153, 0.9)"]}
              style={{ flex: 1, borderRadius: 15, overflow: "hidden" }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Animated.View
                style={[
                  styles.glassOverlay,
                  {
                    opacity: glassOpacity,
                  },
                ]}
              />
              <AnimatedLinearGradient
                colors={[
                  "transparent",
                  "rgba(255,255,255,0.6)",
                  "transparent",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.shimmer,
                  {
                    transform: [{ translateX: shimmerTranslate }],
                  },
                ]}
              />
              <TouchableOpacity
                style={styles.cardTouchable}
                onPress={handleSeventhScenarioPress}
              >
                <View style={styles.numberContainer}>
                  <Text style={styles.cardNumber}>7</Text>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>Seventh Scenario</Text>
                  <Text style={styles.cardDetails}>Difficulty Medium</Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </ScrollView>

        {/* Motivational Text */}
        <Text style={styles.motivation}>All your efforts will bear fruit</Text>

        {/* Bottom Navbar */}
        <Navbar />
      </View>

      {/* Scenario Locked Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Mascot Character */}
            <View style={styles.mascotContainer}>
              <Image
                source={require("../../assets/images/PopUp.png")}
                style={styles.mascotImage}
                resizeMode="contain"
              />
            </View>

            {/* Modal Text */}
            <Text style={styles.modalTitle}>Scenario Locked</Text>
            <Text style={styles.modalText}>
              You have to finish the scenarios in your current level in order to unlock this Scenario.
            </Text>

            {/* I Understand Button */}
            <TouchableOpacity
              style={styles.understandButton}
              onPress={closeModal}
            >
              <Text style={styles.understandButtonText}>I understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  logo: { 
    width: screenWidth * 0.32, 
    height: screenHeight * 0.05, 
    marginTop: screenHeight * 0.05, 
    marginLeft: 20 
  },
  topIcons: {
    position: "absolute",
    right: 20,
    top: screenHeight * 0.055,
    flexDirection: "row",
    gap: 15,
  },
  icon: { 
    width: screenWidth * 0.06, 
    height: screenWidth * 0.06 
  },
  searchBar: {
    marginHorizontal: 20,
    marginTop: 15,
    backgroundColor: "#f4f4f4",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchPlaceholder: { color: "#aaa" },
  searchIcon: { width: 18, height: 18 },
  title: {
    fontSize: screenWidth * 0.055,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginTop: 20,
    color: "#222",
  },
  subtitle: {
    fontSize: screenWidth * 0.035,
    marginHorizontal: 20,
    marginBottom: 15,
    color: "#7f7f7f",
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    width: "47%",
    height: screenHeight * 0.22,
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    position: "relative",
  },
  cardTouchable: { flex: 1, justifyContent: "flex-end" },
  numberContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 10,
  },
  cardNumber: { fontSize: 18, color: "#9333ea", fontWeight: "bold" },
  textContainer: {
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  cardTitle: { fontSize: screenWidth * 0.04, color: "#fff", fontWeight: "bold" },
  cardDetails: { fontSize: screenWidth * 0.03, color: "#eee", marginTop: 5 },
  locked: { 
    backgroundColor: "#9a8cfc", 
    justifyContent: "center", 
    alignItems: "center",
    flexDirection: "column",
  },
  lockIcon: { 
    width: screenWidth * 0.075, 
    height: screenWidth * 0.075, 
    marginBottom: 5, 
    zIndex: 2,
    position: "absolute",
    top: 10,
    right: 10,
  },
  numberContainerLocked: {
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 10,
    marginTop: 10,
  },
  cardNumberLocked: { fontSize: 18, color: "#9a8cfc", fontWeight: "bold" },
  textContainerLocked: {
    alignItems: "center",
    marginTop: 10,
    zIndex: 2,
  },
  lockedTitle: { fontSize: screenWidth * 0.035, fontWeight: "bold", color: "#333" },
  cardDetailsLocked: { fontSize: screenWidth * 0.03, color: "#666", marginTop: 5 },
  clouds: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "120%",
    height: "60%",
    resizeMode: "stretch",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  motivation: { textAlign: "center", color: "#aaa", fontSize: 12, marginBottom: 10 },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: "500%",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: "85%",
    maxWidth: 350,
  },
  mascotContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  mascotImage: {
    width: 120,
    height: 120,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 25,
  },
  understandButton: {
    backgroundColor: "#6B73FF",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    minWidth: 140,
  },
  understandButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
