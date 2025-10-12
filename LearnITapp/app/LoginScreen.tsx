// LoginScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebaseConfig"; // adjust if needed
import API_BASE_URL from "../config/api";
import pickApiBase from '../config/api_probe';

// Import styles
import { loginScreenStyles, getResponsiveFontSize, getResponsiveSpacing, getResponsiveImageSize } from '../styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return; // prevent double taps
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
  // Diagnostic: show which API base URL the app is using (config value)
  console.log('Login attempt, config API_BASE_URL =', API_BASE_URL);
  // TEMP: Skip probe and use direct IP
  const picked = API_BASE_URL; // await pickApiBase();
  console.log('Login attempt, using API_BASE_URL =', picked);
      // Also expose platform/time for easier debugging
      console.log('Platform:', Platform.OS, 'Time:', new Date().toISOString());
      
      setLoading(true);
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get ID token for API authentication
      const idToken = await user.getIdToken();

      // Verify user exists in SQLite database
      // Diagnostic: wrap fetch to log network errors
      let response;
      try {
        console.log('fetching', `${picked}/users/${user.uid}`);
        response = await fetch(`${picked}/users/${user.uid}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });
        console.log('fetch response status', response.status);
      } catch (fetchErr) {
        console.error('Fetch error when contacting backend:', fetchErr);
        console.error('Attempted URL:', `${picked}/users/${user.uid}`);
        setLoading(false);
        Alert.alert(
          'Network Error', 
          `Unable to reach backend server at ${picked}.\n\nPlease ensure:\n1. Backend server is running on port 3000\n2. You're on the same network (if using physical device)\n3. Check console logs for details.`
        );
        return;
      }

      // If not found and this is the demo teacher, auto-provision in SQLite
      if (response.status === 404 && email.toLowerCase() === 'admin@gmail.com') {
        const createRes = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Demo Admin',
            role: 'admin',
            class_id: 'class-7a',
          })
        });
        if (createRes.ok) {
          response = await fetch(`${API_BASE_URL}/users/${user.uid}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${idToken}` },
          });
        }
      }

      if (response.ok) {
        const userData = await response.json();
        const role = (userData.role || '').toLowerCase();
        Alert.alert("Success", `Welcome back, ${userData.displayName || user.email}!`);
        if (role === 'admin' || role === 'teacher') {
          router.push('/TeacherDashboardScreen');
        } else {
          router.push('/HomeScreen');
        }
        setLoading(false);
      } else if (response.status === 401) {
        // Likely email not verified
        try {
          await sendEmailVerification(user);
          Alert.alert('Verify Email', 'We sent a verification link to your email. Please verify and try again.');
        } catch {}
        setLoading(false);
      } else {
        Alert.alert("Error", "Account not found. Please sign up first.");
        router.push("/SignUpScreen");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      // DEV fallback for admin if Firebase is not configured
      const isAdminCreds = email.toLowerCase() === 'admin@gmail.com' && password === 'admin123';
      if (isAdminCreds) {
        try {
          const res = await fetch(`${API_BASE_URL}/users/${'dev-admin'}`, {
            headers: {
              Authorization: 'Bearer DEV',
              'x-dev-uid': 'dev-admin',
              'x-dev-email': 'admin@gmail.com',
              'x-dev-role': 'admin'
            }
          });
          if (res.ok) {
            Alert.alert('Dev Mode', 'Logged in as admin without Firebase.');
            // Navigate directly to teacher dashboard
            router.push('/TeacherDashboardScreen');
            setLoading(false);
            return;
          }
          // Auto-provision admin if missing
          if (res.status === 404) {
            const createRes = await fetch(`${API_BASE_URL}/users`, {
              method: 'POST',
              headers: {
                Authorization: 'Bearer DEV',
                'x-dev-uid': 'dev-admin',
                'x-dev-email': 'admin@gmail.com',
                'x-dev-role': 'admin',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                uid: 'dev-admin',
                email: 'admin@gmail.com',
                displayName: 'Demo Admin',
                role: 'admin',
                class_id: 'class-7a',
              }),
            });
            if (createRes.ok) {
              Alert.alert('Dev Mode', 'Admin account created.');
              router.push('/TeacherDashboardScreen');
              setLoading(false);
              return;
            }
          }
        } catch {}
      }
      Alert.alert("Error", error.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <View style={loginScreenStyles.container}>
      {/* White Background Layer */}
      <View style={loginScreenStyles.whiteBackground} />

      {/* Mascot Background */}
      <Image
        source={require("../assets/images/LoginBg.png")}
        style={loginScreenStyles.mascot}
      />

      {/* Logo */}
      <Image
        source={require("../assets/images/LandingLogo2.png")}
        style={[
          loginScreenStyles.logo,
          {
            width: getResponsiveImageSize(120),
            height: getResponsiveImageSize(40),
            marginLeft: -getResponsiveImageSize(60),
          }
        ]}
        resizeMode="contain"
      />

      {/* Login Form */}
      <View style={[
        loginScreenStyles.formContainer,
        {
          paddingTop: getResponsiveSpacing(screenHeight * 0.3), // Dynamic spacing based on screen height
          paddingHorizontal: getResponsiveSpacing(30),
        }
      ]}>
        <Text style={[
          loginScreenStyles.title,
          {
            fontSize: getResponsiveFontSize(32),
            marginBottom: getResponsiveSpacing(5),
          }
        ]}>
          welcome back!
        </Text>
        <Text style={[
          loginScreenStyles.subtitle,
          {
            fontSize: getResponsiveFontSize(14),
            marginBottom: getResponsiveSpacing(30),
          }
        ]}>
          Ready to continue your learning journey?
        </Text>

        {/* Inputs */}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#A5A5C1"
          value={email}
          onChangeText={setEmail}
          style={[
            loginScreenStyles.input,
            {
              padding: getResponsiveSpacing(15),
              marginBottom: getResponsiveSpacing(15),
              fontSize: getResponsiveFontSize(14),
            }
          ]}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#A5A5C1"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={[
            loginScreenStyles.input,
            {
              padding: getResponsiveSpacing(15),
              marginBottom: getResponsiveSpacing(15),
              fontSize: getResponsiveFontSize(14),
            }
          ]}
        />

        {/* Login Button */}
        <TouchableOpacity
          style={[
            loginScreenStyles.button,
            {
              paddingVertical: getResponsiveSpacing(15),
              marginBottom: getResponsiveSpacing(15),
            }
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={[
            loginScreenStyles.buttonText,
            {
              fontSize: getResponsiveFontSize(16),
            }
          ]}>
            {loading ? 'Logging in…' : 'Log In'}
          </Text>
        </TouchableOpacity>

        {/* Forgot Password */}
        <TouchableOpacity>
          <Text style={[
            loginScreenStyles.forgotText,
            {
              fontSize: getResponsiveFontSize(13),
              marginBottom: getResponsiveSpacing(20),
            }
          ]}>
            Forgot Password
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={[
          loginScreenStyles.dividerContainer,
          {
            marginBottom: getResponsiveSpacing(20),
          }
        ]}>
          <View style={loginScreenStyles.line} />
          <Text style={[
            loginScreenStyles.orText,
            {
              fontSize: getResponsiveFontSize(13),
              marginHorizontal: getResponsiveSpacing(10),
            }
          ]}>
            or
          </Text>
          <View style={loginScreenStyles.line} />
        </View>

        {/* Bottom Link */}
        <Text style={[
          loginScreenStyles.bottomText,
          {
            fontSize: getResponsiveFontSize(13),
          }
        ]}>
          First time here?{" "}
          <Text
            style={loginScreenStyles.linkText}
            onPress={() => router.push("/SignUpScreen")}
          >
            Create an account
          </Text>
        </Text>
      </View>
    </View>
  );
}
