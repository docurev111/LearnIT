// ProfileScreen.tsx
import React, { useState, useEffect, memo } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { auth } from "../firebaseConfig";
import API_BASE_URL from "../config/api";
import pickApiBase from '../config/api_probe';
import { useTranslation } from "react-i18next";
import ProfileCustomizationModal from "./ProfileCustomizationModal";

// Import title options from ProfileCustomizationModal
const TITLE_OPTIONS = [
  {
    id: 'matalinong_isip',
    name: 'Matalinong Isip',
    description: 'Nagpapakita ng karunungan sa pag-aaral',
    unlockRequirement: 500,
    rarity: 'common',
    color: '#10B981', // Green
    icon: '🧠',
  },
  {
    id: 'busilak_puso',
    name: 'Busilak na Puso',
    description: 'Huwaran ng kabaitan at pagmamahal',
    unlockRequirement: 1000,
    rarity: 'rare',
    color: '#EC4899', // Pink
    icon: '💖',
  },
  {
    id: 'tagapagtuklas',
    name: 'Tagapagtuklas',
    description: 'Palaging naghahanap ng bagong kaalaman',
    unlockRequirement: 1500,
    rarity: 'rare',
    color: '#3B82F6', // Blue
    icon: '🚀',
  },
  {
    id: 'bayani_kaalaman',
    name: 'Bayani ng Kaalaman',
    description: 'Huwaran sa larangan ng edukasyon',
    unlockRequirement: 2000,
    rarity: 'epic',
    color: '#F59E0B', // Gold
    icon: '🎓',
  },
  {
    id: 'tunay_aralero',
    name: 'Tunay na Aralero',
    description: 'Perpektong halimbawa ng isang mag-aaral',
    unlockRequirement: 3000,
    rarity: 'legendary',
    color: '#EF4444', // Red
    icon: '👑',
  },
];

// Import styles
import { profileScreenStyles } from '../styles';

// Badge GIF mapping - Same as AchievementsScreen
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
};

const getBadgeImage = (badgeName: string) => {
  return BADGE_IMAGES[badgeName] || null;
};

const hasBadgeImage = (badgeName: string) => {
  return badgeName in BADGE_IMAGES;
};

// Get rarity color
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

// Achievement interfaces
interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  earned_at?: string;
  earned?: boolean;
}

interface AchievementStats {
  totalBadges: number;
  badgesByRarity: { [key: string]: number };
  badgesByCategory: { [key: string]: number };
  recentBadges: Achievement[];
  completionPercentage: number;
}

interface UserProfile {
  id: number;
  displayName: string;
  email: string;
  class_id?: string;
  total_xp: number;
  virtue_points: number;
  current_level: number;
  profile_picture?: string;
}

// Memoized Achievement Card Component
const AchievementCard = memo(({ ach }: { ach: Achievement }) => {
  const badgeImage = getBadgeImage(ach.name);
  const hasCustomImage = hasBadgeImage(ach.name);
  const rarityColor = getRarityColor(ach.rarity);

  return (
    <View
      style={[
        profileScreenStyles.achievementCard,
        !ach.earned && profileScreenStyles.lockedCard,
        { borderLeftColor: rarityColor, borderLeftWidth: 4 }
      ]}
    >
      {hasCustomImage ? (
        <Image 
          source={badgeImage} 
          style={[
            profileScreenStyles.achievementGif,
            { opacity: ach.earned ? 1 : 0.5 }
          ]} 
          resizeMode="contain"
        />
      ) : (
        <Text style={profileScreenStyles.achievementIconText}>{ach.icon}</Text>
      )}
      <View style={profileScreenStyles.achievementTextContainer}>
        <Text
          style={[
            profileScreenStyles.achievementTitle,
            !ach.earned && profileScreenStyles.lockedText,
          ]}
        >
          {ach.name}
        </Text>
        <Text
          style={[
            profileScreenStyles.achievementDesc,
            !ach.earned && profileScreenStyles.lockedText,
          ]}
        >
          {ach.description}
        </Text>
        <View style={[profileScreenStyles.rarityBadge, { backgroundColor: rarityColor }]}>
          <Text style={profileScreenStyles.rarityBadgeText}>{ach.rarity.toUpperCase()}</Text>
        </View>
      </View>
    </View>
  );
});

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"Achievements" | "Statistics">("Achievements");
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementStats, setAchievementStats] = useState<AchievementStats | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Profile customization modal states
  const [customizationModalVisible, setCustomizationModalVisible] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedBorder, setSelectedBorder] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  // Load user data and achievements on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Reload customization data when screen comes back into focus
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        reloadCustomization();
      }
    }, [userId])
  );

  const reloadCustomization = async () => {
    try {
      const apiBase = await pickApiBase();
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        await loadCustomization(userId!, apiBase, headers);
      }
    } catch (error) {
      console.error('Error reloading customization on focus:', error);
    }
  };

  const loadUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'Please log in to view your profile');
        navigation.goBack();
        return;
      }

      const apiBase = await pickApiBase();
      const token = await user.getIdToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Get user profile
      const profileRes = await fetch(`${apiBase}/users/${user.uid}`, { headers });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setUserProfile(profile);
        setUserId(profile.id);

        // Load achievements for this user
        await loadAchievements(profile.id, apiBase, headers);
        
        // Load customization settings
        await loadCustomization(profile.id, apiBase, headers);
      } else {
        console.log('Profile not found, using default data');
        // Fallback to demo data if user not found
        setUserProfile({
          id: 1,
          displayName: user.displayName || 'Student',
          email: user.email || '',
          total_xp: 420,
          virtue_points: 150,
          current_level: 6
        });
        setUserId(1);
        await loadAchievements(1, apiBase, headers);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomization = async (uid: number, apiBase: string, headers: any) => {
    try {
      const customizationRes = await fetch(`${apiBase}/users/${uid}/customization`, { headers });
      if (customizationRes.ok) {
        const customization = await customizationRes.json();
        setSelectedAvatar(customization.selected_avatar);
        setSelectedBorder(customization.selected_border);
        setSelectedTitle(customization.selected_title);
      }
    } catch (error) {
      console.error('Error loading customization:', error);
      // Set defaults if loading fails
      setSelectedAvatar('avatar1');
      setSelectedBorder('none');
      setSelectedTitle(null);
    }
  };

  const loadAchievements = async (uid: number, apiBase: string, headers: any) => {
    try {
      // Get user's earned badges
      const badgesRes = await fetch(`${apiBase}/user/badges/${uid}`, { headers });
      if (badgesRes.ok) {
        const earnedBadges = await badgesRes.json();
        setAchievements(earnedBadges.map((badge: any) => ({ ...badge, earned: true })));
      }

      // Get achievement statistics
      const statsRes = await fetch(`${apiBase}/user/achievements/${uid}`, { headers });
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setAchievementStats(stats);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
      // Set fallback achievements
      setAchievements([
        {
          id: 1,
          name: "First Steps",
          description: "Complete your very first lesson",
          icon: "🌟",
          rarity: "common",
          earned: true
        }
      ]);
    }
  };

  // Component will auto-refresh achievements when user earns new ones

  // Handle profile picture selection
  const pickImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload a profile picture.');
        return;
      }

      // Show options for camera or gallery
      Alert.alert(
        'Select Profile Picture',
        'Choose how you would like to select your profile picture',
        [
          { text: 'Camera', onPress: () => openCamera() },
          { text: 'Photo Library', onPress: () => openImageLibrary() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to open image picker');
    }
  };

  const openCamera = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (!cameraPermission.granted) {
        Alert.alert('Permission Required', 'Please allow camera access to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePicture(result.assets[0]);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openImageLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePicture(result.assets[0]);
      }
    } catch (error) {
      console.error('Error opening image library:', error);
      Alert.alert('Error', 'Failed to open photo library');
    }
  };

  const uploadProfilePicture = async (imageAsset: ImagePicker.ImagePickerAsset) => {
    if (!userProfile) return;

    setUploadingImage(true);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'Please log in to update your profile picture');
        return;
      }

      const apiBase = await pickApiBase();
      const token = await user.getIdToken();
      
      // Convert to base64 data URL
      const base64Image = `data:image/jpeg;base64,${imageAsset.base64}`;
      
      const response = await fetch(`${apiBase}/users/${userProfile.id}/profile-picture`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profile_picture: base64Image
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Profile picture uploaded successfully');
        
        // Update the user profile with the new picture
        setUserProfile(result.user);
        
        Alert.alert('Success', 'Profile picture updated successfully!');
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to upload profile picture:', errorText);
        Alert.alert('Error', 'Failed to update profile picture. Please try again.');
      }
    } catch (error) {
      console.error('💥 Error uploading profile picture:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please check your connection.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveCustomization = async (avatar: string | null, border: string | null, title: string | null) => {
    try {
      setSelectedAvatar(avatar);
      setSelectedBorder(border);
      setSelectedTitle(title);
      
      // Save to backend if needed
      const user = auth.currentUser;
      if (user && userProfile) {
        const apiBase = await pickApiBase();
        const token = await user.getIdToken();
        
        // Save customization preferences to backend
        const response = await fetch(`${apiBase}/users/${userProfile.id}/customization`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            avatar,
            border,
            title
          })
        });

        if (response.ok) {
          Alert.alert('Success', 'Profile customization saved!');
        }
      }
    } catch (error) {
      console.error('Error saving customization:', error);
      Alert.alert('Success', 'Profile customization applied locally!');
    }
  };

  return (
    <SafeAreaView style={profileScreenStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={profileScreenStyles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={require("../assets/images/backbutton.png")} style={{ width: 24, height: 30, marginTop: 8 }} />
          </TouchableOpacity>
          <Text style={profileScreenStyles.headerTitle}>{t('profile.title')}</Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={profileScreenStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#6c63ff" />
            <Text style={profileScreenStyles.loadingText}>{t('common.loading')}</Text>
          </View>
        ) : (
          <>
            {/* Profile Info */}
            <View style={profileScreenStyles.profileSection}>
              <TouchableOpacity 
                style={profileScreenStyles.avatarContainer}
                onPress={() => setCustomizationModalVisible(true)}
              >
                <View style={{ position: 'relative' }}>
                  <Image 
                    source={
                      userProfile?.profile_picture 
                        ? { uri: userProfile.profile_picture }
                        : require("../assets/images/LandingLogo.png")
                    } 
                    style={profileScreenStyles.avatar} 
                  />
                  {selectedBorder && selectedBorder !== 'none' && (
                    <Image 
                      source={
                        selectedBorder === 'border1' ? require('../assets/images/borders/border1.png') :
                        selectedBorder === 'border2' ? require('../assets/images/borders/border2.png') :
                        selectedBorder === 'border3' ? require('../assets/images/borders/border3.png') :
                        null
                      }
                      style={{
                        position: 'absolute',
                        top: -10,
                        left: -10,
                        width: 120,
                        height: 120,
                        resizeMode: 'contain',
                      }}
                    />
                  )}
                </View>
                <View style={profileScreenStyles.editAvatarButton}>
                  <Ionicons name="pencil" size={16} color="white" />
                </View>
              </TouchableOpacity>
              <Text style={profileScreenStyles.name}>{userProfile?.displayName || 'Student'}</Text>

              <View style={profileScreenStyles.badgesRow}>
                {achievementStats && achievementStats.totalBadges >= 5 && (
                  <View style={profileScreenStyles.badge}>
                    <Text style={profileScreenStyles.badgeText}>TOP ACHIEVER</Text>
                  </View>
                )}
                {selectedTitle && (
                  <View style={[profileScreenStyles.badge, { backgroundColor: TITLE_OPTIONS.find(t => t.id === selectedTitle)?.color }]}>
                    <Text style={profileScreenStyles.badgeText}>
                      {TITLE_OPTIONS.find(t => t.id === selectedTitle)?.icon} {TITLE_OPTIONS.find(t => t.id === selectedTitle)?.name}
                    </Text>
                  </View>
                )}
                <View style={profileScreenStyles.badgeGray}>
                  <Text style={profileScreenStyles.badgeTextGray}>{userProfile?.class_id || 'SECTION A'}</Text>
                </View>
              </View>
            </View>

            {/* Achievement Stats */}
            <View style={profileScreenStyles.tasksContainer}>
              <Text style={profileScreenStyles.tasksTitle}>{t('profile.achievements')}</Text>
              <Text style={profileScreenStyles.tasksSubtitle}>
                Your learning accomplishments
              </Text>

              <View style={profileScreenStyles.taskStatsRow}>
                <View style={profileScreenStyles.taskCard}>
                  <Ionicons name="trophy-outline" size={24} color="black" />
                  <Text style={profileScreenStyles.taskNumber}>
                    {achievementStats?.totalBadges || 0}
                  </Text>
                  <Text style={profileScreenStyles.taskLabel}>Badges Earned</Text>
                </View>

                <View style={profileScreenStyles.taskCard}>
                  <Ionicons name="star-outline" size={24} color="black" />
                  <Text style={profileScreenStyles.taskNumber}>{t('profile.level')} {userProfile?.current_level || 1}</Text>
                  <Text style={profileScreenStyles.taskLabel}>Current Level</Text>
                </View>

                <View style={profileScreenStyles.taskCard}>
                  <Ionicons name="flame-outline" size={24} color="#FF6B35" />
                  <Text style={profileScreenStyles.taskNumber}>
                    {userProfile?.total_xp || 0}
                  </Text>
                  <Text style={profileScreenStyles.taskLabel}>EXP Points</Text>
                </View>

                <View style={profileScreenStyles.taskCard}>
                  <Ionicons name="heart-outline" size={24} color="#E91E63" />
                  <Text style={profileScreenStyles.taskNumber}>
                    {userProfile?.virtue_points || 0}
                  </Text>
                  <Text style={profileScreenStyles.taskLabel}>Virtue Points</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Tabs */}
        <View style={profileScreenStyles.tabRow}>
          <TouchableOpacity
            style={[
              profileScreenStyles.tab,
              activeTab === "Achievements" && profileScreenStyles.tabActive,
            ]}
            onPress={() => setActiveTab("Achievements")}
          >
            <Text
              style={[
                profileScreenStyles.tabText,
                activeTab === "Achievements" && profileScreenStyles.tabTextActive,
              ]}
            >
              {t('profile.achievements')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[profileScreenStyles.tab, activeTab === "Statistics" && profileScreenStyles.tabActive]}
            onPress={() => setActiveTab("Statistics")}
          >
            <Text
              style={[
                profileScreenStyles.tabText,
                activeTab === "Statistics" && profileScreenStyles.tabTextActive,
              ]}
            >
              {t('profile.statistics')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Achievements Section */}
        {activeTab === "Achievements" && (
          <View style={profileScreenStyles.achievementList}>
            {achievements.length > 0 ? (
              achievements.map((ach) => <AchievementCard key={ach.id} ach={ach} />)
            ) : (
              <View style={profileScreenStyles.emptyState}>
                <Ionicons name="trophy-outline" size={48} color="#ccc" />
                <Text style={profileScreenStyles.emptyText}>No achievements yet</Text>
                <Text style={profileScreenStyles.emptySubtext}>Complete lessons and quizzes to earn badges!</Text>
              </View>
            )}
          </View>
        )}

        {/* Statistics Section */}
        {activeTab === "Statistics" && (
          <View style={profileScreenStyles.statsContainer}>
            {achievementStats ? (
              <>
                <View style={profileScreenStyles.statCard}>
                  <Text style={profileScreenStyles.statTitle}>Achievement Progress</Text>
                  <Text style={profileScreenStyles.statValue}>{achievementStats.completionPercentage}%</Text>
                  <Text style={profileScreenStyles.statLabel}>Overall Completion</Text>
                </View>
                
                <View style={profileScreenStyles.statCard}>
                  <Text style={profileScreenStyles.statTitle}>Badges by Rarity</Text>
                  {Object.entries(achievementStats.badgesByRarity).map(([rarity, count]) => (
                    <View key={rarity} style={profileScreenStyles.rarityRow}>
                      <Text style={profileScreenStyles.rarityLabel}>{rarity}</Text>
                      <Text style={profileScreenStyles.rarityCount}>{count}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={profileScreenStyles.statCard}>
                  <Text style={profileScreenStyles.statTitle}>Recent Achievements</Text>
                  {achievementStats.recentBadges.slice(0, 3).map((badge) => (
                    <View key={badge.id} style={profileScreenStyles.recentBadgeRow}>
                      <Text style={profileScreenStyles.recentBadgeIcon}>{badge.icon}</Text>
                      <Text style={profileScreenStyles.recentBadgeName}>{badge.name}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <Text style={profileScreenStyles.statsText}>Loading statistics...</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Profile Customization Modal */}
      <ProfileCustomizationModal
        visible={customizationModalVisible}
        onClose={() => setCustomizationModalVisible(false)}
        currentAvatar={selectedAvatar || 'avatar1'}
        currentBorder={selectedBorder || 'none'}
        currentTitle={selectedTitle}
        userXP={userProfile?.total_xp || 0}
        userVirtuePoints={userProfile?.virtue_points || 0}
        onSave={handleSaveCustomization}
      />
    </SafeAreaView>
  );
}

