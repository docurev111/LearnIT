import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { AchievementProvider, useAchievements } from '../contexts/AchievementContext';
import AchievementNotification from '../components/AchievementNotification';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
// Initialize i18n
import '../i18n';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function MainLayout() {
  const colorScheme = useColorScheme();
  const { currentNotification, notificationVisible, hideNotification } = useAchievements();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
          <Stack.Screen name="SignUpScreen" options={{ headerShown: false }} />
          <Stack.Screen name="HomeScreen" options={{ headerShown: false }} />
          <Stack.Screen name="LessonScreen" options={{ headerShown: false }} />
          <Stack.Screen name="LessonScreenNew" options={{ headerShown: false }} />
          <Stack.Screen name="QuizScreen" options={{ headerShown: false }} />
          <Stack.Screen name="RewardScreen" options={{ headerShown: false }} />
          <Stack.Screen name="LessonContentScreen" options={{ headerShown: false }} />
          <Stack.Screen name="FirstQuarter" options={{ headerShown: false }} />
          <Stack.Screen name="GamesScreen" options={{ headerShown: false }} />
          <Stack.Screen name="ScienceLabScreen" options={{ headerShown: false }} />
          <Stack.Screen name="SettingsScreen" options={{ headerShown: false }} />
          <Stack.Screen name="ProfileScreen" options={{ headerShown: false }} />
          <Stack.Screen name="WelcomeScreen" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          
          {/* Scenario Screens */}
          <Stack.Screen name="scenarios/ScenarioScreenL1" options={{ headerShown: false }} />
          <Stack.Screen name="scenarios/ScenarioScreenL2" options={{ headerShown: false }} />
          <Stack.Screen name="scenarios/ScenarioScreenL6" options={{ headerShown: false }} />
          <Stack.Screen name="scenarios/ExploreScenarios" options={{ headerShown: false }} />
          
          <Stack.Screen name="AchievementsScreen" options={{ headerShown: false }} />
          
          {/* Game Screens */}
          <Stack.Screen name="games/ValuesWordScramble" options={{ headerShown: false }} />
          <Stack.Screen name="games/ValuesPathRunner" options={{ headerShown: false }} />
          <Stack.Screen name="games/EmotionMatchGame" options={{ headerShown: false }} />
          <Stack.Screen name="games/GoodVsBadCatchGame" options={{ headerShown: false }} />
          <Stack.Screen name="games/MemoryCardGame" options={{ headerShown: false }} />
          
          {/* Lesson Screens */}
          <Stack.Screen name="lessons/LessonFlashcardScreen" options={{ headerShown: false }} />
          <Stack.Screen name="LessonChoiceScreen" options={{ headerShown: false }} />
          <Stack.Screen name="lessons/ReadLesson" options={{ headerShown: false }} />
          <Stack.Screen name="lessons/LessonIntroScreen" options={{ headerShown: false }} />
          <Stack.Screen name="lessons/WatchLesson" options={{ headerShown: false }} />
          <Stack.Screen 
            name="lessons/LessonSimpleScreen" 
            options={{ 
              headerShown: true,
              title: 'Lesson',
              headerStyle: { backgroundColor: '#6366F1' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' }
            }} 
          />
          
          <Stack.Screen name="QuizLandingScreen" options={{ headerShown: false }} />
          
          {/* Auth Screens */}
          <Stack.Screen name="auth/reset-password-request" options={{ headerShown: false }} />
          <Stack.Screen name="auth/email-sent" options={{ headerShown: false }} />
          <Stack.Screen name="auth/password-updated" options={{ headerShown: false }} />
          
          {/* Account Screens */}
          <Stack.Screen name="account/information" options={{ headerShown: false }} />
          
        </Stack>
        <StatusBar style="auto" />
        
        {/* Achievement Notification Overlay */}
        <AchievementNotification
          achievement={currentNotification}
          visible={notificationVisible}
          onClose={hideNotification}
        />
      </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Architype-Aubette': require('../assets/fonts/Architype Aubette W90.ttf'),
  });

  useEffect(() => {
    if (fontError) {
      console.error('Font loading error:', fontError);
    }
    if (fontsLoaded) {
      console.log('Fonts loaded successfully!');
      SplashScreen.hideAsync();
    } else if (fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AchievementProvider>
        <MainLayout />
      </AchievementProvider>
    </GestureHandlerRootView>
  );
}
