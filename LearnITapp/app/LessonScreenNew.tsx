// ExploreLesson.tsx
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
import Navbar from "../components/BottomNav";
import NotificationBell from "../components/NotificationBell";
import { Stack } from "expo-router";
import { useRouter } from "expo-router";

export default function ExploreLesson() {
  const router = useRouter();

  // Animation values
  const firstQuarterScale = useRef(new Animated.Value(0)).current;
  const secondQuarterScale = useRef(new Animated.Value(0)).current;
  const thirdQuarterScale = useRef(new Animated.Value(0)).current;
  const fourthQuarterScale = useRef(new Animated.Value(0)).current;

  const shimmerAnim = useRef(new Animated.Value(-1)).current;
  const glassOpacity = useRef(new Animated.Value(0.3)).current;

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [lockedQuarter, setLockedQuarter] = useState("");

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
    animateCard(firstQuarterScale, 0);
    animateCard(secondQuarterScale, 200);
    animateCard(thirdQuarterScale, 400);
    animateCard(fourthQuarterScale, 600);
    startShimmerAnimation();
    startGlassAnimation();
  }, []);

  // Shimmer movement
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-150, 150],
  });

  const handleFirstQuarterPress = () => {
    Animated.sequence([
      Animated.timing(firstQuarterScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(firstQuarterScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push("/FirstQuarter");
    });
  };

  const handleLockedQuarterPress = (quarterName: string) => {
    setLockedQuarter(quarterName);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setLockedQuarter("");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        {/* Logo */}
        <Image
          source={require("../assets/images/LandingLogo2.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Top icons */}
        <View style={styles.topIcons}>
          <NotificationBell style={styles.icon} />
          <TouchableOpacity onPress={handleNavigateSettings}>
            <Image
              source={require("../assets/images/settings.png")}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchPlaceholder}>Search lesson....</Text>
          <Image
            source={require("../assets/images/search.png")}
            style={styles.searchIcon}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Explore Lessons</Text>
        <Text style={styles.subtitle}>CHOOSE WHICH QUARTER TO LEARN</Text>

        {/* Lesson Cards */}
        <ScrollView contentContainerStyle={styles.cardsContainer}>
          {/* First Quarter */}
          <Animated.View
            style={[
              styles.card,
              {
                transform: [{ scale: firstQuarterScale }],
              },
            ]}
          >
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.1)", "rgba(63, 55, 201, 0.9)"]}
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
                onPress={handleFirstQuarterPress}
              >
                <View style={styles.numberContainer}>
                  <Text style={styles.cardNumber}>1</Text>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>First Quarter</Text>
                  <Text style={styles.cardDetails}>40% | 7 LESSONS</Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Second Quarter (Locked) */}
          <TouchableOpacity
            style={[
              styles.card,
              styles.locked,
              {
                transform: [{ scale: secondQuarterScale }],
              },
            ]}
            onPress={() => handleLockedQuarterPress("Second Quarter")}
          >
            <Image
              source={require("../assets/images/lock.png")}
              style={styles.lockIcon}
            />
            <Text style={styles.lockedTitle}>Second Quarter</Text>
            <Image
              source={require("../assets/images/clouds.png")}
              style={styles.clouds}
            />
          </TouchableOpacity>

          {/* Third Quarter (Locked) */}
          <TouchableOpacity
            style={[
              styles.card,
              styles.locked,
              {
                transform: [{ scale: thirdQuarterScale }],
              },
            ]}
            onPress={() => handleLockedQuarterPress("Third Quarter")}
          >
            <Image
              source={require("../assets/images/lock.png")}
              style={styles.lockIcon}
            />
            <Text style={styles.lockedTitle}>Third Quarter</Text>
            <Image
              source={require("../assets/images/clouds.png")}
              style={styles.clouds}
            />
          </TouchableOpacity>

          {/* Fourth Quarter (Locked) */}
          <TouchableOpacity
            style={[
              styles.card,
              styles.locked,
              {
                transform: [{ scale: fourthQuarterScale }],
              },
            ]}
            onPress={() => handleLockedQuarterPress("Fourth Quarter")}
          >
            <Image
              source={require("../assets/images/lock.png")}
              style={styles.lockIcon}
            />
            <Text style={styles.lockedTitle}>Fourth Quarter</Text>
            <Image
              source={require("../assets/images/clouds.png")}
              style={styles.clouds}
            />
          </TouchableOpacity>
        </ScrollView>

        {/* Motivational Text */}
        <Text style={styles.motivation}>All your efforts will bear fruit</Text>

        {/* Bottom Navbar */}
        <Navbar />
      </View>

      {/* Quarter Locked Modal */}
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
                source={require("../assets/images/PopUp.png")}
                style={styles.mascotImage}
                resizeMode="contain"
              />
            </View>

            {/* Modal Text */}
            <Text style={styles.modalTitle}>Quarter Locked</Text>
            <Text style={styles.modalText}>
              You have to finish the lessons in your current Quarter in order to unlock this Quarter.
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
    backgroundColor: "#3f37c9",
    borderRadius: 15,
    marginBottom: 15,
    justifyContent: "flex-end",
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
  cardNumber: { fontSize: 18, color: "#3f37c9", fontWeight: "bold" },
  textContainer: {
    marginBottom: 12, // lifts text a little higher
    paddingHorizontal: 8,
  },
  cardTitle: { fontSize: screenWidth * 0.04, color: "#fff", fontWeight: "bold" },
  cardDetails: { fontSize: screenWidth * 0.03, color: "#eee", marginTop: 5 },
  locked: { backgroundColor: "#9a8cfc", justifyContent: "center", alignItems: "center" },
  lockIcon: { 
    width: screenWidth * 0.075, 
    height: screenWidth * 0.075, 
    marginBottom: 10, 
    zIndex: 2 
  },
  lockedTitle: { 
    fontSize: screenWidth * 0.035, 
    fontWeight: "bold", 
    color: "#333", 
    zIndex: 2 
  },
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
