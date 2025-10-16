import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import LoadingScreen from '../components/LoadingScreen';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import API_BASE_URL from '../config/api';
import pickApiBase from '../config/api_probe';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  badge_type: string;
  earned_at?: string;
  isEarned: boolean;
}

// Memoized Badge Card Component for better performance
const BadgeCard = memo(({ badge, shimmerAnim }: { badge: Badge; shimmerAnim: Animated.Value }) => {
  const rarityColor = getRarityColor(badge.rarity);
  const badgeImage = getBadgeImage(badge.name);
  const hasCustomImage = hasBadgeImage(badge.name);
  
  return (
    <View
      style={[
        styles.card,
        { 
          borderColor: rarityColor, 
          opacity: badge.isEarned ? 1 : 0.5,
          backgroundColor: badge.isEarned ? '#FFF' : '#F5F5F5'
        },
      ]}
    >
      <Animated.View 
        style={[
          styles.iconWrapper,
          hasCustomImage && badge.isEarned && {
            transform: [{
              scale: shimmerAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 1.08, 1]
              })
            }]
          }
        ]}
      >
        {hasCustomImage ? (
          <>
            <Image 
              source={badgeImage} 
              style={[
                styles.badgeImage,
                { 
                  opacity: badge.isEarned ? 1 : 0.5,
                }
              ]} 
              resizeMode="contain"
            />
            {badge.isEarned && (
              <Animated.View 
                style={[
                  styles.shimmerOverlay,
                  {
                    opacity: shimmerAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 0.6, 0]
                    })
                  }
                ]}
              />
            )}
          </>
        ) : (
          <View style={styles.placeholderIcon}>
            <Text style={styles.placeholderText}>?</Text>
          </View>
        )}
        {badge.isEarned && (
          <View style={styles.earnedBadge}>
            <Ionicons name="checkmark" size={12} color="#FFF" />
          </View>
        )}
      </Animated.View>
      <Text style={[styles.title, { color: badge.isEarned ? '#000' : '#6B7280' }]}>
        {badge.name}
      </Text>
      <Text style={[styles.description, { color: badge.isEarned ? '#555' : '#9CA3AF' }]}>
        {badge.description}
      </Text>
      <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
        <Text style={styles.rarityText}>{badge.rarity?.toUpperCase() || 'COMMON'}</Text>
      </View>
    </View>
  );
});

// Badge GIF mapping - Complete mapping for all achievement GIFs
const BADGE_IMAGES: { [key: string]: any } = {
  'First Steps': require('../assets/images/achievements/firststeps.gif'),
  'Knowledge Seeker': require('../assets/images/achievements/knowledgeseeker.gif'),
  'Bookworm': require('../assets/images/achievements/bookworm.gif'),
  'Speed Learner': require('../assets/images/achievements/speedlearner.gif'),
  'Perfect Score': require('../assets/images/achievements/perfectscore.gif'),
  'Sharpshooter': require('../assets/images/achievements/sharpshooter.gif'),
  'Lucky Streak': require('../assets/images/achievements/luckystreak.gif'),
  'Quiz Master': require('../assets/images/achievements/quizmaster.gif'),
  'Perfectionist': require('../assets/images/achievements/perfectionist.gif'),
  'Daily Dedication': require('../assets/images/achievements/dailydedication.gif'),
  'Night Owl': require('../assets/images/achievements/nightowl.gif'),
  'Early Bird': require('../assets/images/achievements/earlybird.gif'),
  'Lightning Fast': require('../assets/images/achievements/lightningfast.gif'),
  'Marathon Runner': require('../assets/images/achievements/marathonrunner.gif'),
  'Game Champion': require('../assets/images/achievements/gamechampion.gif'),
  'Scenario Explorer': require('../assets/images/achievements/scenarioexplorer.gif'),
  'Welcome Aboard': require('../assets/images/achievements/welcomeaboard.gif'),
  'Comeback Kid': require('../assets/images/achievements/comebackkid.gif'),
  'Drama Queen/King': require('../assets/images/achievements/dramaqueenking.gif'),
  'Helper': require('../assets/images/achievements/helper.gif'),
  'Class Legend': require('../assets/images/achievements/classlegend.gif'),
  'Show Off': require('../assets/images/achievements/showoff.gif'),
  'Collector': require('../assets/images/achievements/collector.gif'),
  'Lucky Number': require('../assets/images/achievements/luckynumber.gif'),
};

// Function to get badge GIF for specific achievements
const getBadgeImage = (badgeName: string) => {
  return BADGE_IMAGES[badgeName] || null;
};

// Function to check if badge has custom GIF
const hasBadgeImage = (badgeName: string) => {
  return badgeName in BADGE_IMAGES;
};

// Color mapping for badge rarities
const getRarityColor = (rarity: string): string => {
  switch (rarity?.toLowerCase()) {
    case 'common': return '#10B981';
    case 'uncommon': return '#3B82F6';
    case 'rare': return '#8B5CF6';
    case 'epic': return '#F59E0B';
    case 'legendary': return '#EF4444';
    default: return '#6B7280';
  }
};

export default function AchievementsScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rarity' | 'earned' | 'name'>('rarity');
  const [rarityAscending, setRarityAscending] = useState(false); // false = descending (legendary first), true = ascending (common first)
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerShown: false,
  //   });
  // }, [navigation]);

  const fetchBadgesData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      console.log('Fetching badges data for user:', user.email);
      
      // Use same API detection as ProfileScreen (this works!)
      const apiBase = await pickApiBase();
      const token = await user.getIdToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('Using API base:', apiBase);

      // Get user profile first (same as ProfileScreen)
      const profileRes = await fetch(`${apiBase}/users/${user.uid}`, { headers });
      if (!profileRes.ok) {
        throw new Error(`Profile fetch failed: ${profileRes.status}`);
      }

      const userProfile = await profileRes.json();
      console.log('✅ User profile loaded:', userProfile.displayName);

      // Get user's earned badges (same as ProfileScreen)
      const badgesRes = await fetch(`${apiBase}/user/badges/${userProfile.id}`, { headers });
      let earnedBadgeIds = new Set<number>();
      
      if (badgesRes.ok) {
        const earnedBadges = await badgesRes.json();
        console.log('✅ Earned badges loaded:', earnedBadges.length);
        earnedBadgeIds = new Set<number>(earnedBadges.map((badge: any) => Number(badge.id)));
        setUserBadges(earnedBadgeIds);
      } else {
        console.log('⚠️ Badges fetch failed:', badgesRes.status);
      }

      // Complete comprehensive list of all available badges
      const allPossibleBadges = [
        // 📚 LEARNING MASTERY BADGES
        { id: 15, name: "First Steps", description: "Complete your very first lesson", icon: "🌟", rarity: "common", badge_type: "Learning Mastery" },
        { id: 16, name: "Knowledge Seeker", description: "Complete 10 lessons across different topics", icon: "🎓", rarity: "common", badge_type: "Learning Mastery" },
        { id: 17, name: "Bookworm", description: "Complete an entire quarter's worth of lessons", icon: "📖", rarity: "rare", badge_type: "Learning Mastery" },
        { id: 18, name: "Speed Learner", description: "Complete 5 lessons in a single day", icon: "⚡", rarity: "rare", badge_type: "Learning Mastery" },
        
        // 🎯 QUIZ & ASSESSMENT BADGES
        { id: 19, name: "Perfect Score", description: "Get 100% on any quiz", icon: "🎪", rarity: "common", badge_type: "Quiz & Assessment" },
        { id: 20, name: "Sharpshooter", description: "Get 100% on 10 different quizzes", icon: "🏹", rarity: "epic", badge_type: "Quiz & Assessment" },
        { id: 21, name: "Lucky Streak", description: "Pass 5 quizzes in a row without failing", icon: "🎲", rarity: "rare", badge_type: "Quiz & Assessment" },
        { id: 22, name: "Quiz Master", description: "Maintain 85%+ average across all quizzes", icon: "🔥", rarity: "rare", badge_type: "Quiz & Assessment" },
        { id: 23, name: "Perfectionist", description: "Never score below 90% on any quiz (minimum 10 quizzes)", icon: "💎", rarity: "legendary", badge_type: "Quiz & Assessment" },
        
        // ⏰ CONSISTENCY & ENGAGEMENT BADGES
        { id: 24, name: "Daily Dedication", description: "Log in and complete activities for 7 days straight", icon: "📅", rarity: "common", badge_type: "Consistency & Engagement" },
        { id: 25, name: "Night Owl", description: "Complete lessons between 9 PM and 6 AM", icon: "🌙", rarity: "rare", badge_type: "Consistency & Engagement" },
        { id: 26, name: "Early Bird", description: "Complete lessons between 5 AM and 8 AM", icon: "🌅", rarity: "rare", badge_type: "Consistency & Engagement" },
        { id: 27, name: "Lightning Fast", description: "Complete a lesson in under 5 minutes", icon: "⚡", rarity: "common", badge_type: "Consistency & Engagement" },
        { id: 28, name: "Marathon Runner", description: "Study for 30+ consecutive days", icon: "🏃", rarity: "epic", badge_type: "Consistency & Engagement" },
        
        // 🎮 INTERACTIVE & ENGAGEMENT BADGES
        { id: 29, name: "Game Champion", description: "Complete all available mini-games", icon: "🎯", rarity: "rare", badge_type: "Interactive & Engagement" },
        { id: 30, name: "Scenario Explorer", description: "Complete all 3D scenario adventures", icon: "🎪", rarity: "rare", badge_type: "Interactive & Engagement" },
        
        // 🏅 SPECIAL ACHIEVEMENT BADGES
        { id: 31, name: "Welcome Aboard", description: "Complete profile setup and first lesson", icon: "🎉", rarity: "common", badge_type: "Special Achievement" },
        { id: 32, name: "Comeback Kid", description: "Return after 7+ days of inactivity and complete a lesson", icon: "🌟", rarity: "rare", badge_type: "Special Achievement" },
        { id: 33, name: "Drama Queen/King", description: "Complete a scenario with maximum engagement", icon: "🎭", rarity: "rare", badge_type: "Special Achievement" },
        { id: 34, name: "Helper", description: "Share a lesson or achievement (future social feature)", icon: "🤝", rarity: "common", badge_type: "Special Achievement" },
        { id: 35, name: "Class Legend", description: "Rank #1 in your class for a full week", icon: "🏆", rarity: "legendary", badge_type: "Special Achievement" },
        
        // 🎨 CREATIVE & SPECIAL BADGES
        { id: 36, name: "Show Off", description: "Display 10+ badges on your profile", icon: "🎪", rarity: "rare", badge_type: "Creative & Special" },
        { id: 37, name: "Collector", description: "Earn badges from every category", icon: "🌈", rarity: "epic", badge_type: "Creative & Special" },
        { id: 38, name: "Lucky Number", description: "Complete exactly 7 lessons in a day", icon: "🎲", rarity: "rare", badge_type: "Creative & Special" },
      ];

      // Combine badges with earned status
      const badgesWithEarnedStatus = allPossibleBadges.map((badge: any) => {
        const isEarned = earnedBadgeIds.has(badge.id);
        return {
          ...badge,
          isEarned: isEarned
        };
      });

      setBadges(badgesWithEarnedStatus);
      setLoading(false);
      console.log('✅ Badges loaded successfully');

    } catch (error: any) {
      console.error('Error fetching badges:', error);
      setError(`${error.message || 'Failed to load achievements'}\n\n⬇️ Showing demo badges below:`);
      
      // Fallback: show variety of demo badges from different categories
      console.log('🔄 Loading fallback badge data...');
      const fallbackBadges: Badge[] = [
        // Custom image badges (earned for demo)
        { id: 15, name: "First Steps", description: "Complete your very first lesson", icon: "🌟", rarity: "common", badge_type: "Learning Mastery", isEarned: true },
        { id: 16, name: "Knowledge Seeker", description: "Complete 10 lessons across different topics", icon: "🎓", rarity: "common", badge_type: "Learning Mastery", isEarned: false },
        { id: 20, name: "Sharpshooter", description: "Get 100% on 10 different quizzes", icon: "🏹", rarity: "epic", badge_type: "Quiz & Assessment", isEarned: true },
        
        // Learning badges
        { id: 17, name: "Bookworm", description: "Complete an entire quarter's worth of lessons", icon: "📖", rarity: "rare", badge_type: "Learning Mastery", isEarned: false },
        { id: 18, name: "Speed Learner", description: "Complete 5 lessons in a single day", icon: "⚡", rarity: "rare", badge_type: "Learning Mastery", isEarned: false },
        
        // Quiz badges
        { id: 19, name: "Perfect Score", description: "Get 100% on any quiz", icon: "🎪", rarity: "common", badge_type: "Quiz & Assessment", isEarned: false },
        { id: 23, name: "Perfectionist", description: "Never score below 90% on any quiz (minimum 10 quizzes)", icon: "💎", rarity: "legendary", badge_type: "Quiz & Assessment", isEarned: false },
        
        // Engagement badges
        { id: 24, name: "Daily Dedication", description: "Log in and complete activities for 7 days straight", icon: "📅", rarity: "common", badge_type: "Consistency & Engagement", isEarned: false },
        { id: 28, name: "Marathon Runner", description: "Study for 30+ consecutive days", icon: "🏃", rarity: "epic", badge_type: "Consistency & Engagement", isEarned: false },
        
        // Special badges
        { id: 31, name: "Welcome Aboard", description: "Complete profile setup and first lesson", icon: "🎉", rarity: "common", badge_type: "Special Achievement", isEarned: true },
        { id: 35, name: "Class Legend", description: "Rank #1 in your class for a full week", icon: "🏆", rarity: "legendary", badge_type: "Special Achievement", isEarned: false },
        { id: 37, name: "Collector", description: "Earn badges from every category", icon: "🌈", rarity: "epic", badge_type: "Creative & Special", isEarned: false },
      ];
      
      setBadges(fallbackBadges);
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Start shimmer animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user && mounted) {
      console.log('User is authenticated:', user.email);
      fetchBadgesData();
    } else {
      console.log('User is not authenticated');
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingScreen visible={loading} />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={require("../assets/images/backbutton.png")} style={{ width: 24, height: 30, marginTop: 8 }} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{t('achievements.title').toUpperCase()}</Text>
          <Text style={styles.headerEarnedCount}>{badges.filter(b => b.isEarned).length}/{badges.length} earned</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Error Message Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={20} color="#EF4444" />
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButtonSmall}
            onPress={() => {
              setError(null);
              setLoading(true);
              fetchBadgesData();
            }}
          >
            <Text style={styles.retryButtonSmallText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortButtons}>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'rarity' && styles.sortButtonActive]}
            onPress={() => {
              if (sortBy === 'rarity') {
                // Toggle between ascending and descending
                setRarityAscending(!rarityAscending);
              } else {
                // First click on rarity: set to rarity and reset to descending
                setSortBy('rarity');
                setRarityAscending(false);
              }
            }}
          >
            <Text style={[styles.sortButtonText, sortBy === 'rarity' && styles.sortButtonTextActive]}>Rarity</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'earned' && styles.sortButtonActive]}
            onPress={() => setSortBy('earned')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'earned' && styles.sortButtonTextActive]}>Earned</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
            onPress={() => setSortBy('name')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'name' && styles.sortButtonTextActive]}>Name</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Achievements Grid */}
      <FlatList
        data={[...badges].sort((a, b) => {
          if (sortBy === 'rarity') {
            // Rarity order: legendary > epic > rare > uncommon > common
            const rarityOrder: { [key: string]: number } = {
              'legendary': 5,
              'epic': 4,
              'rare': 3,
              'uncommon': 2,
              'common': 1
            };
            const rarityA = rarityOrder[a.rarity?.toLowerCase()] || 0;
            const rarityB = rarityOrder[b.rarity?.toLowerCase()] || 0;
            // Toggle between descending (legendary first) and ascending (common first)
            return rarityAscending ? (rarityA - rarityB) : (rarityB - rarityA);
          } else if (sortBy === 'earned') {
            // Earned first, then unearned
            return (b.isEarned ? 1 : 0) - (a.isEarned ? 1 : 0);
          } else {
            // Sort by name alphabetically
            return a.name.localeCompare(b.name);
          }
        })}
        renderItem={({ item }) => <BadgeCard badge={item} shimmerAnim={shimmerAnim} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        initialNumToRender={8}
        windowSize={5}
        updateCellsBatchingPeriod={50}
      />
    </View>
  );
}

const CARD_WIDTH = width / 2.3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#FAFAFA",
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  headerEarnedCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
  settingsButton: {
    padding: 8,
  },
  sortContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sortButtonActive: {
    backgroundColor: '#7A5CFA',
    borderColor: '#7A5CFA',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  sortButtonTextActive: {
    color: '#FFF',
  },
  earnedCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 8,
  },
  retryButtonSmall: {
    backgroundColor: '#EF4444',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  retryButtonSmallText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sortText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  grid: {
    paddingBottom: 40,
  },
  row: {
    justifyContent: "space-around",
    paddingHorizontal: 8,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#FFF",
    margin: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    elevation: 3,
    position: 'relative',
  },
  iconWrapper: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    position: 'relative',
  },
  badgeImage: {
    width: 60,
    height: 60,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
  },
  earnedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
    marginBottom: 8,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFF",
  },
  placeholderIcon: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 30,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#9CA3AF',
  },
});