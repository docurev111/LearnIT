/**
 * HomeScreen.tsx
 * 
 * Main dashboard screen displaying user profile, stats, featured lessons,
 * daily sign-in bonus, and quick access to major app sections.
 * 
 * @component
 * 
 * Features:
 * - User profile card with avatar, level, and XP
 * - Featured lessons carousel
 * - Daily sign-in rewards
 * - Notifications bell
 * - Internationalization support
 * - Pull-to-refresh functionality
 * 
 * TODO: Extract reusable components:
 * - ProfileCard component
 * - FeaturedLessonCard component
 * - StatsWidget component
 */
import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import BottomNav from "../components/BottomNav";
import DailySignInBonus from "../components/DailySignInBonus";
import NotificationBell from "../components/NotificationBell";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../firebaseConfig";
import pickApiBase from '../config/api_probe';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from "react-i18next";

// Import styles
import { homeScreenStyles, commonStyles, colors } from '../styles';

interface LeaderboardUser {
  id: number;
  displayName: string;
  total_xp: number;
  current_level: number;
  profile_picture?: string;
  position: number;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
  teacher_name: string;
}

// Session tracking to prevent multiple daily sign-in popups
let hasShownDailySignIn = false;

const HomeScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  
  // Daily login modal state
  const [showDailyLogin, setShowDailyLogin] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'Featured' | 'Leaderboards' | 'Announcements'>('Featured');
  
  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Leaderboard state
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [leaderboardLastFetch, setLeaderboardLastFetch] = useState<number>(0);
  
  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [announcementsError, setAnnouncementsError] = useState<string | null>(null);
  const [announcementsLastFetch, setAnnouncementsLastFetch] = useState<number>(0);
  
  // User data caching
  const [userClass, setUserClass] = useState<string | null>(null);
  
  // Cache duration (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    let isMounted = true;
    
    const initializeScreen = async () => {
      try {
        // Animate fade in and slide up on mount
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();

        // Initialize data loading
        if (isMounted) {
          await Promise.all([
            checkDailyLoginStatus(),
            loadInitialData()
          ]);
        }
      } catch (error) {
        console.error('Error initializing screen:', error);
      } finally {
        if (isMounted) {
          setIsInitialLoading(false);
        }
      }
    };

    initializeScreen();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Removed dependencies for better performance

  // Initialize data loading
  const loadInitialData = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const apiBase = await pickApiBase();
      const token = await user.getIdToken();

      // Get user's class data and cache it
      const userRes = await fetch(`${apiBase}/users/${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        setUserClass(userData.class_id);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }, []);

  const checkDailyLoginStatus = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const API_BASE_URL = await pickApiBase();
      const idToken = await user.getIdToken();
      
      const response = await fetch(`${API_BASE_URL}/user/login-streak/${user.uid}`, {
        headers: { 
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Show modal if user hasn't claimed today's reward AND we haven't shown it this session
        if (!data.claimed_today && !hasShownDailySignIn) {
          hasShownDailySignIn = true; // Mark as shown for this session
          // Add a small delay so the animation completes first
          setTimeout(() => {
            setShowDailyLogin(true);
          }, 1000);
        }
      }
    } catch (error) {
      console.log('Error checking daily login status:', error);
    }
  };

  // Navigation handlers for cards
  const handleNavigateLessons = () => {
    navigation.navigate("LessonScreenNew" as never);
  };

  const handleNavigateQuiz = () => {
    navigation.navigate("QuizScreen" as never);
  };

  const handleNavigateGames = () => {
    navigation.navigate("GamesScreen" as never);
  };

  const handleNavigateLeaderboards = () => {
    navigation.navigate('LeaderboardScreen' as never);
  };

  const handleNavigateAchievements = () => {
    navigation.navigate("AchievementsScreen" as never);
  };

  const handleNavigateSettings = () => {
    navigation.navigate("SettingsScreen" as never);
  };

  // Tab handlers - will be defined after the fetch functions
  const handleTabPress = (tab: 'Featured' | 'Leaderboards' | 'Announcements') => {
    setActiveTab(tab);
    
    if (tab === 'Leaderboards') {
      fetchLeaderboardData();
    } else if (tab === 'Announcements') {
      fetchAnnouncements();
    }
  };

  // Start Learning button handler
  const handleStartLearning = () => {
    navigation.navigate("LessonScreenNew" as never);
  };

  // Optimized fetch leaderboard with caching
  const fetchLeaderboardData = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Check cache validity
    if (!forceRefresh && leaderboardData.length > 0 && (now - leaderboardLastFetch) < CACHE_DURATION) {
      return; // Use cached data
    }

    try {
      setLoadingLeaderboard(true);
      setLeaderboardError(null);
      
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const apiBase = await pickApiBase();
      const token = await user.getIdToken();

      // Use cached user class if available
      let classId = userClass;
      if (!classId) {
        const userRes = await fetch(`${apiBase}/users/${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!userRes.ok) {
          throw new Error('Failed to get user data');
        }

        const userData = await userRes.json();
        classId = userData.class_id;
        setUserClass(classId);
      }

      if (!classId) {
        setLeaderboardData([]);
        setLeaderboardError('User not assigned to a class');
        return;
      }

      const response = await fetch(`${apiBase}/leaderboard/${classId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data?.success && data?.leaderboard && Array.isArray(data.leaderboard)) {
          const top10 = data.leaderboard.slice(0, 10).map((user: any, index: number) => ({
            ...user,
            position: index + 1
          }));
          setLeaderboardData(top10);
          setLeaderboardLastFetch(now);
          setLeaderboardError(null);
        } else {
          setLeaderboardData([]);
          setLeaderboardError('No leaderboard data available');
        }
      } else {
        throw new Error(`API request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboardError(error instanceof Error ? error.message : 'Failed to load leaderboard');
    } finally {
      setLoadingLeaderboard(false);
    }
  }, [userClass, leaderboardData.length, leaderboardLastFetch, CACHE_DURATION]);

  // Optimized fetch announcements with caching
  const fetchAnnouncements = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Check cache validity
    if (!forceRefresh && announcements.length > 0 && (now - announcementsLastFetch) < CACHE_DURATION) {
      return; // Use cached data
    }

    try {
      setLoadingAnnouncements(true);
      setAnnouncementsError(null);
      
      // Mock announcements with EsP content - replace with real API call later
      const mockAnnouncements: Announcement[] = [
        {
          id: 1,
          title: "Welcome to EsP Class!",
          content: "Maligayang pagdating sa aming bagong semester! Matutuhan natin ang mga pagpapahalaga, moral decision making, at character development.",
          created_at: "2025-09-28",
          teacher_name: "Guro Maria"
        },
        {
          id: 2,
          title: "Quiz sa Susunod na Linggo",
          content: "Huwag kalimutang may quiz tayo sa Dignidad ng Tao next Tuesday. Siguraduhing i-review ang Lessons 1-3.",
          created_at: "2025-09-27",
          teacher_name: "Guro Maria"
        },
        {
          id: 3,
          title: "Project Deadline Reminder",
          content: "Ang Pagpapahalaga at Virtue project ay due sa October 15. I-submit ang presentations sa LearnIT app.",
          created_at: "2025-09-26",
          teacher_name: "Guro Maria"
        }
      ];
      
      // Simulate network delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAnnouncements(mockAnnouncements);
      setAnnouncementsLastFetch(now);
      setAnnouncementsError(null);
      
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncementsError(error instanceof Error ? error.message : 'Failed to load announcements');
    } finally {
      setLoadingAnnouncements(false);
    }
  }, [announcements.length, announcementsLastFetch, CACHE_DURATION]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (activeTab === 'Leaderboards') {
        await fetchLeaderboardData(true);
      } else if (activeTab === 'Announcements') {
        await fetchAnnouncements(true);
      } else {
        // Refresh general data
        await loadInitialData();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [activeTab, fetchLeaderboardData, fetchAnnouncements, loadInitialData]);

  const handleNavigateScenario = () => {
    navigation.navigate("ExploreScenarios" as never);
  };

  return (
    <View style={homeScreenStyles.container}>
      <ScrollView 
        contentContainerStyle={homeScreenStyles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#4A90E2"
            colors={["#4A90E2"]}
          />
        }
      >
        {/* Top Bar with Logo and Icons */}
        <Animated.View style={[homeScreenStyles.topBar, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Image
            source={require("../assets/images/LandingLogo.png")}
            style={homeScreenStyles.logo}
            resizeMode="contain"
          />
          <View style={homeScreenStyles.topIcons}>
            <NotificationBell style={homeScreenStyles.icon} />
            <TouchableOpacity onPress={() => setShowDailyLogin(true)}>
              <Image
                source={require("../assets/images/calendar.png")}
                style={homeScreenStyles.icon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNavigateSettings}>
              <Image
                source={require("../assets/images/settings.png")}
                style={homeScreenStyles.icon}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Welcome Card */}
        <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient
            colors={['#6D5FFD', '#8B78FF', '#A994FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={homeScreenStyles.welcomeCard}
          >
            <View style={homeScreenStyles.welcomeContent}>
              <Text style={homeScreenStyles.welcomeText}>Welcome to</Text>
              <Text style={homeScreenStyles.learnIT}>LearnIT!</Text>
              <Text style={homeScreenStyles.subText}>
                Your go-to application{"\n"}for learning about ICT
              </Text>
              <TouchableOpacity style={homeScreenStyles.startButton} onPress={handleStartLearning}>
                <Text style={homeScreenStyles.startButtonText}>Start Learning</Text>
              </TouchableOpacity>
            </View>
            <View style={homeScreenStyles.mascotContainer}>
              <Image
                source={require("../assets/images/mascot.png")}
                style={homeScreenStyles.mascot}
                resizeMode="contain"
              />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Tabs (Featured, Leaderboards, Announcements) */}
        <Animated.View style={[homeScreenStyles.tabs, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity onPress={() => handleTabPress('Featured')}>
            <Text style={[homeScreenStyles.tab, activeTab === 'Featured' && homeScreenStyles.tabActive]}>{t('navigation.home')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleTabPress('Leaderboards')}>
            <Text style={[homeScreenStyles.tab, activeTab === 'Leaderboards' && homeScreenStyles.tabActive]}>{t('leaderboard.title')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleTabPress('Announcements')}>
            <Text style={[homeScreenStyles.tab, activeTab === 'Announcements' && homeScreenStyles.tabActive]}>Announcements</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Content Based on Active Tab */}
        {activeTab === 'Featured' && (
          <>
            {/* Featured Cards */}
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              <TouchableOpacity style={homeScreenStyles.exploreLessonsCard} onPress={handleNavigateLessons}>
                <Image
                  source={require("../assets/images/ExploreLessonsCard.png")}
                  style={homeScreenStyles.cardBackground}
                  resizeMode="cover"
                />
                <View style={homeScreenStyles.cardOverlay}>
                  <View style={homeScreenStyles.textContainer}>
                    <Text style={homeScreenStyles.cardTitle}>Explore Lessons</Text>
                    <Text style={homeScreenStyles.cardSubtitle}>
                      Discover amazing topics about ICT
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              <TouchableOpacity style={homeScreenStyles.exploreLessonsCard} onPress={handleNavigateAchievements}>
                <Image
                  source={require("../assets/images/AchievementsCard.png")}
                  style={homeScreenStyles.cardBackground}
                  resizeMode="cover"
                />
                <View style={homeScreenStyles.cardOverlay}>
                  <View style={homeScreenStyles.textContainer}>
                    <Text style={homeScreenStyles.cardTitle}>Achievements</Text>
                    <Text style={homeScreenStyles.cardSubtitle}>
                      Your efforts will always be rewarded
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              <TouchableOpacity style={homeScreenStyles.exploreLessonsCard} onPress={handleNavigateLeaderboards}>
                <Image
                  source={require("../assets/images/LeaderBoardsCard.png")}
                  style={homeScreenStyles.cardBackground}
                  resizeMode="cover"
                />
                <View style={homeScreenStyles.cardOverlay}>
                  <View style={homeScreenStyles.textContainer}>
                    <Text style={homeScreenStyles.cardTitle}>{t('leaderboard.title')}</Text>
                    <Text style={homeScreenStyles.cardSubtitle}>
                      See how you rank among your peers
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              <TouchableOpacity style={homeScreenStyles.exploreLessonsCard} onPress={handleNavigateGames}>
                <Image
                  source={require("../assets/images/PlayGamesCard.png")}
                  style={homeScreenStyles.cardBackground}
                  resizeMode="cover"
                />
                <View style={homeScreenStyles.cardOverlay}>
                  <View style={homeScreenStyles.textContainer}>
                    <Text style={homeScreenStyles.cardTitle}>Play Games</Text>
                    <Text style={homeScreenStyles.cardSubtitle}>
                      Fun mini games for Edukasyon sa Pagpapakatao
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              <TouchableOpacity style={homeScreenStyles.exploreLessonsCard} onPress={handleNavigateScenario}>
                <Image
                  source={require("../assets/images/3DScenariosCard.png")}
                  style={homeScreenStyles.cardBackground}
                  resizeMode="cover"
                />
                <View style={homeScreenStyles.cardOverlay}>
                  <View style={homeScreenStyles.textContainer}>
                    <Text style={homeScreenStyles.cardTitle}>3D Scenario!</Text>
                    <Text style={homeScreenStyles.cardSubtitle}>
                      Explore interactive 3D environments
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}

        {activeTab === 'Leaderboards' && (
          <Animated.View style={[homeScreenStyles.leaderboardContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={homeScreenStyles.sectionTitleContainer}>
              <Image source={require("../assets/images/trophy.png")} style={homeScreenStyles.sectionIcon} />
              <Text style={homeScreenStyles.sectionTitle}>{t('leaderboard.top10')}</Text>
            </View>
            {loadingLeaderboard ? (
              <View style={homeScreenStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#7A5CFA" />
                <Text style={homeScreenStyles.loadingText}>{t('leaderboard.loading')}</Text>
              </View>
            ) : leaderboardError ? (
              <View style={homeScreenStyles.errorContainer}>
                <Ionicons name="warning-outline" size={48} color="#FF6B6B" />
                <Text style={homeScreenStyles.errorText}>{leaderboardError}</Text>
                <TouchableOpacity 
                  style={homeScreenStyles.retryButton} 
                  onPress={() => fetchLeaderboardData(true)}
                >
                  <Text style={homeScreenStyles.retryText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
              </View>
            ) : leaderboardData.length === 0 ? (
              <View style={homeScreenStyles.emptyContainer}>
                <Ionicons name="trophy-outline" size={48} color="#CCC" />
                <Text style={homeScreenStyles.emptyText}>{t('leaderboard.noData')}</Text>
                <Text style={homeScreenStyles.emptySubtext}>Complete lessons to appear on the leaderboard</Text>
              </View>
            ) : (
              <View style={homeScreenStyles.leaderboardList}>
                {leaderboardData.map((user, index) => (
                  <View key={user.id} style={homeScreenStyles.leaderboardItem}>
                    <View style={homeScreenStyles.positionContainer}>
                      <Text style={[
                        homeScreenStyles.position,
                        index < 3 && homeScreenStyles.topThreePosition
                      ]}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${user.position}`}
                      </Text>
                    </View>
                    
                    <View style={homeScreenStyles.userInfo}>
                      <Text style={homeScreenStyles.userName}>{user.displayName}</Text>
                      <Text style={homeScreenStyles.userStats}>Level {user.current_level} • {user.total_xp} XP</Text>
                    </View>

                    <LinearGradient
                      colors={index < 3 ? ['#7A5CFA', '#9C7EFB'] : ['#E5E5E5', '#F0F0F0']}
                      style={homeScreenStyles.xpBar}
                    >
                      <Text style={[
                        homeScreenStyles.xpText,
                        { color: index < 3 ? 'white' : '#666' }
                      ]}>
                        {user.total_xp} XP
                      </Text>
                    </LinearGradient>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        )}

        {activeTab === 'Announcements' && (
          <Animated.View style={[homeScreenStyles.announcementsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={homeScreenStyles.sectionTitleContainer}>
              <Image source={require("../assets/images/announcementicon.png")} style={homeScreenStyles.sectionIcon} />
              <Text style={homeScreenStyles.sectionTitle}>Class Announcements</Text>
            </View>
            {loadingAnnouncements ? (
              <View style={homeScreenStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#7A5CFA" />
                <Text style={homeScreenStyles.loadingText}>Loading announcements...</Text>
              </View>
            ) : announcements.length === 0 ? (
              <View style={homeScreenStyles.emptyContainer}>
                <Ionicons name="megaphone-outline" size={48} color="#CCC" />
                <Text style={homeScreenStyles.emptyText}>No announcements yet</Text>
                <Text style={homeScreenStyles.emptySubtext}>Your teacher will post updates here</Text>
              </View>
            ) : (
              <View style={homeScreenStyles.announcementsList}>
                {announcements.map((announcement) => (
                  <View key={announcement.id} style={homeScreenStyles.announcementItem}>
                    <View style={homeScreenStyles.announcementHeader}>
                      <Text style={homeScreenStyles.announcementTitle}>{announcement.title}</Text>
                      <Text style={homeScreenStyles.announcementDate}>{announcement.created_at}</Text>
                    </View>
                    <Text style={homeScreenStyles.announcementContent}>{announcement.content}</Text>
                    <Text style={homeScreenStyles.announcementTeacher}>- {announcement.teacher_name}</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>
      
      {/* Daily Sign-In Modal */}
      <DailySignInBonus 
        visible={showDailyLogin} 
        onClose={() => setShowDailyLogin(false)} 
      />
      
      {/* Bottom Navbar */}
      <BottomNav />
    </View>
  );
};

export default HomeScreen;
