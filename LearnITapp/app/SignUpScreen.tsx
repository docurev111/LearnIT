// Signup.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebaseConfig"; // adjust path if needed
import API_BASE_URL from "../config/api";
import pickApiBase from '../config/api_probe';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive utility functions
const getResponsiveFontSize = (baseSize: number) => {
  const scale = screenWidth / 375; // Base width (iPhone 6/7/8)
  return Math.round(baseSize * Math.min(scale, 1.2)); // Cap scaling at 1.2x
};

const getResponsiveSpacing = (baseSpacing: number) => {
  const scale = screenHeight / 667; // Base height (iPhone 6/7/8)
  return Math.round(baseSpacing * Math.min(scale, 1.2));
};

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password should be at least 6 characters long!");
      return;
    }

    setIsLoading(true);

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send verification email (non-blocking UI, but await to show message on success)
      try {
        await sendEmailVerification(user);
      } catch (e) {
        console.warn('Failed to send verification email:', e);
      }

      // Get ID token for API authentication
      const idToken = await user.getIdToken();

      // Probe and pick API base URL
      const picked = await pickApiBase();
      console.log('SignUp attempt, picked API_BASE_URL =', picked);

      // Create user in SQLite database
      const response = await fetch(`${picked}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || email.split('@')[0],
          role: 'student',
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        Alert.alert(
          "Verify your email",
          "We sent a verification link to your email. Please verify your address, then log in.",
          [
            {
              text: "OK",
              onPress: () => router.push("/LoginScreen")
            }
          ]
        );
      } else {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        Alert.alert("Error", errorData.error || "Failed to create user account");
        // Still navigate to login since Firebase auth was successful
        router.push("/LoginScreen");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      Alert.alert("Error", error.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* LearnIT Logo */}
      <Image
        source={require("../assets/images/LandingLogo2.png")}
        style={[
          styles.logo,
          {
            width: getResponsiveFontSize(120),
            height: getResponsiveFontSize(40),
            marginLeft: -getResponsiveFontSize(60),
          }
        ]}
        resizeMode="contain"
      />

      {/* Sign Up Form */}
      <View style={[
        styles.formContainer,
        {
          paddingTop: getResponsiveSpacing(screenHeight * 0.2),
          paddingHorizontal: getResponsiveSpacing(30),
        }
      ]}>
        <Text style={[
          styles.title,
          {
            fontSize: getResponsiveFontSize(70),
            marginBottom: getResponsiveSpacing(5),
          }
        ]}>
          Sign Up
        </Text>
        <Text style={[
          styles.subtitle,
          {
            fontSize: getResponsiveFontSize(14),
            marginBottom: getResponsiveSpacing(25),
          }
        ]}>
          start your journey with us!
        </Text>

        {/* Email Input */}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#A5A5C1"
          value={email}
          onChangeText={setEmail}
          style={[
            styles.input,
            {
              padding: getResponsiveSpacing(15),
              marginBottom: getResponsiveSpacing(15),
              fontSize: getResponsiveFontSize(14),
            }
          ]}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password Input */}
        <TextInput
          placeholder="Password"
          placeholderTextColor="#A5A5C1"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secureText}
          style={[
            styles.input,
            {
              padding: getResponsiveSpacing(15),
              marginBottom: getResponsiveSpacing(15),
              fontSize: getResponsiveFontSize(14),
            }
          ]}
        />

        {/* Confirm Password with Eye Icon */}
        <View style={[
          styles.passwordContainer,
          {
            marginBottom: getResponsiveSpacing(15),
          }
        ]}>
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#A5A5C1"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={secureText}
            style={[
              styles.input,
              {
                flex: 1,
                marginBottom: 0,
                padding: getResponsiveSpacing(15),
                fontSize: getResponsiveFontSize(14),
              }
            ]}
          />
          <TouchableOpacity
            onPress={() => setSecureText(!secureText)}
            style={[
              styles.iconContainer,
              {
                paddingHorizontal: getResponsiveSpacing(10),
              }
            ]}
          >
            <Ionicons
              name={secureText ? "eye-off-outline" : "eye-outline"}
              size={getResponsiveFontSize(22)}
              color="#6C63FF"
            />
          </TouchableOpacity>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[
            styles.button,
            {
              paddingVertical: getResponsiveSpacing(15),
              marginBottom: getResponsiveSpacing(25),
            }
          ]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          <Text style={[
            styles.buttonText,
            {
              fontSize: getResponsiveFontSize(16),
            }
          ]}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        {/* Bottom Link */}
        <Text style={[
          styles.bottomText,
          {
            fontSize: getResponsiveFontSize(13),
          }
        ]}>
          Have an Account already?{" "}
          <Text
            style={styles.linkText}
            onPress={() => router.push("/LoginScreen")}
          >
            Sign in.
          </Text>
        </Text>
      </View>

      {/* Mascot Background */}
      <Image
        source={require("../assets/images/SignUpFooter.png")}
        style={[
          styles.mascot,
          {
            height: getResponsiveSpacing(140),
          }
        ]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  formContainer: {
    flex: 1,
    alignItems: "center",
    // paddingHorizontal and paddingTop are now set dynamically
  },
  title: {
    fontWeight: "bold",
    color: "#3E2DFF",
    textAlign: "center",
  },
  subtitle: {
    color: "#7B7B9D",
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#F8F6FF",
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#D6D6F5",
    color: "#3E2DFF",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#D6D6F5",
    borderRadius: 10,
    backgroundColor: "#F8F6FF",
  },
  iconContainer: {
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#3E2DFF",
    borderRadius: 25,
    alignItems: "center",
    width: "100%",
    marginBottom: 25,
    shadowColor: "#3E2DFF",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  bottomText: {
    color: "#7B7B9D",
    textAlign: "center",
    zIndex: 2,
  },
  linkText: {
    color: "#3E2DFF",
    fontWeight: "600",
  },
  mascot: {
    width: "100%",
    position: "absolute",
    bottom: -30,
    zIndex: 1,
  },
  logo: {
    position: "absolute",
    top: "8%",
    left: "50%",
    opacity: 0.5,
  },
});
