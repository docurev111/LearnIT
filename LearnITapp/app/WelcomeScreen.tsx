import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const LandingPage = () => {
  const navigation = useNavigation();

  // Animation values
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.3)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance animation sequence
    Animated.sequence([
      Animated.delay(300), // Wait a bit before starting
      Animated.parallel([
        Animated.timing(logoFadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(logoScaleAnim, {
          toValue: 1,
          tension: 10,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotateAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Button and text animations
    Animated.sequence([
      Animated.delay(1200), // Start after logo animation
      Animated.timing(buttonFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(1500), // Start after button animation
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const logoRotate = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      {/* Top spacer to center logo */}
      <View style={styles.topSpacer} />

      {/* Logo with animations - now centered */}
      <Animated.Image
        source={require("../assets/images/LandingLogo.png")}
        style={[
          styles.logo,
          {
            opacity: logoFadeAnim,
            transform: [
              { scale: logoScaleAnim },
              { rotate: logoRotate },
            ],
          },
        ]}
        resizeMode="contain"
      />

      {/* Bottom spacer - smaller to bring button/text higher */}
      <View style={styles.bottomSpacer} />

      {/* Start Learning Button with animation */}
      <Animated.View style={{ opacity: buttonFadeAnim }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("LoginScreen" as never)}
        >
          <Text style={styles.buttonText}>START LEARNING</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Create Account Link with animation */}
      <Animated.Text style={[styles.footerText, { opacity: textFadeAnim }]}>
        First time here?{" "}
        <Text
          style={styles.linkText}
          onPress={() => navigation.navigate("SignUpScreen" as never)}
        >
          Create an account
        </Text>
      </Animated.Text>
    </View>
  );
};

export default LandingPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start", // Changed to flex-start for manual spacing control
    padding: 20,
  },
  logo: {
    width: 250,
    height: 120,
    marginBottom: 0, // Removed bottom margin since we're using spacers
  },
  topSpacer: {
    flex: 0.5, // Takes up 80% of available space, centering the logo
  },
  bottomSpacer: {
    flex: 0.4, // Smaller spacer to bring button/text higher
  },
  button: {
    backgroundColor: "#002DFF",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    flexDirection: "row",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
  footerText: {
    fontSize: 14,
    color: "#333",
  },
  linkText: {
    color: "#002DFF",
    fontWeight: "500",
  },
});
