import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { AchievementProvider, useAchievements } from '../contexts/AchievementContext';
import AchievementNotification from '../components/AchievementNotification';
// Initialize i18n
import '../i18n';

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
          <Stack.Screen name="ScenarioScreen" options={{ headerShown: false }} />
          <Stack.Screen name="AchievementsScreen" options={{ headerShown: false }} />
          <Stack.Screen name="ValuesWordScramble" options={{ headerShown: false }} />
          <Stack.Screen name="ValuesPathRunner" options={{ headerShown: false }} />
          <Stack.Screen 
            name="LessonSimpleScreen" 
            options={{ 
              headerShown: true,
              title: 'Lesson',
              headerStyle: { backgroundColor: '#6366F1' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' }
            }} 
          />
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
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AchievementProvider>
        <MainLayout />
      </AchievementProvider>
    </GestureHandlerRootView>
  );
}
