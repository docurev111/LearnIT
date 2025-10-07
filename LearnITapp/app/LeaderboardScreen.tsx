import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  StatusBar,
  Image,
  Modal,
} from 'react-native';

// Import styles
import { leaderboardScreenStyles } from '../styles';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import pickApiBase from '../config/api_probe';
import { useLayoutEffect } from 'react';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LeaderboardEntry {
  id: string;
  displayName: string;
  email: string;
  class_id: string;
  total_xp: number;
  current_level: number;
  lessons_completed: number;
  average_score: number;
  best_streak: number;
  badge_count: number;
  profile_picture?: string;
}

export default function LeaderboardScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'weekly' | 'alltime'>('weekly');

  // Hide the default navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [userPercentile, setUserPercentile] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);

  useEffect(() => {
    fetchLeaderboardData();
  }, [activeTab]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'Please log in to view leaderboard');
        return;
      }

      setCurrentUser(user);
      const API_BASE_URL = await pickApiBase();
      const idToken = await user.getIdToken();

      // Get user's class info first
      const userResponse = await fetch(`${API_BASE_URL}/users/${user.uid}`, {
        headers: { 
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const userData = await userResponse.json();
      const classId = userData.class_id;

      if (!classId) {
        Alert.alert('Error', 'You are not assigned to a class yet');
        return;
      }

      // Fetch leaderboard data
      const leaderboardResponse = await fetch(`${API_BASE_URL}/leaderboard/${classId}`, {
        headers: { 
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!leaderboardResponse.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const leaderboardResult = await leaderboardResponse.json();
      let leaderboard = leaderboardResult.leaderboard || [];
      
      // Debug logging
      console.log('Leaderboard API response:', leaderboardResult);
      console.log('Leaderboard data:', leaderboard);
      leaderboard.forEach((user: LeaderboardEntry) => {
        console.log(`User ${user.displayName}: has profile_picture = ${!!user.profile_picture}`);
      });
      
      // For weekly tab, simulate by showing only top performers
      if (activeTab === 'weekly') {
        leaderboard = leaderboard.map((entry: LeaderboardEntry) => ({
          ...entry,
          total_xp: Math.floor(entry.total_xp * 0.3), // Simulate weekly XP
        })).sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.total_xp - a.total_xp);
      }
      setLeaderboardData(leaderboard);

      // Find user's position
      const userIndex = leaderboard.findIndex((entry: LeaderboardEntry) => entry.id === user.uid);
      if (userIndex !== -1) {
        setUserPosition(userIndex + 1);
        const totalPlayers = leaderboard.length;
        const betterThanCount = totalPlayers - (userIndex + 1);
        const percentile = Math.round((betterThanCount / totalPlayers) * 100);
        setUserPercentile(percentile);
      }

    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      Alert.alert('Error', 'Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const getProfileImage = (user: LeaderboardEntry, position: number) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const color = colors[position % colors.length];
    const initial = user.displayName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase();
    
    // Debug logging
    console.log('User profile data:', user.displayName, 'has profile_picture:', !!user.profile_picture);
    if (user.profile_picture) {
      console.log('Profile picture length:', user.profile_picture.length);
      console.log('Profile picture starts with:', user.profile_picture.substring(0, 50));
    }
    
    // Check if user has profile picture and it's valid base64 data
    if (user.profile_picture && user.profile_picture.startsWith('data:image/')) {
      return (
        <Image 
          source={{ uri: user.profile_picture }}
          style={[leaderboardScreenStyles.profilePicture, { backgroundColor: 'transparent' }]}
          onError={(error) => {
            console.log('Image load error for', user.displayName, ':', error);
            console.log('Profile picture preview:', user.profile_picture?.substring(0, 100));
          }}
          onLoad={() => console.log('Image loaded successfully for:', user.displayName)}
          resizeMode="cover"
        />
      );
    }
    
    // Fallback to colored circle with initial
    return (
      <View style={[leaderboardScreenStyles.profilePicture, { backgroundColor: color }]}>
        <Text style={leaderboardScreenStyles.profileInitial}>{initial}</Text>
      </View>
    );
  };

  const renderUserPositionCard = () => {
    if (userPosition === null || userPercentile === null) return null;

    return (
      <View style={leaderboardScreenStyles.userPositionCard}>
        <View style={leaderboardScreenStyles.positionBadge}>
          <Text style={leaderboardScreenStyles.positionText}>#{userPosition}</Text>
        </View>
        <View style={leaderboardScreenStyles.positionInfo}>
          <Text style={leaderboardScreenStyles.positionTitle}>
            You are doing better than
          </Text>
          <Text style={leaderboardScreenStyles.positionSubtitle}>
            {100 - userPercentile}% of other players!
          </Text>
        </View>
        <Image 
          source={require("../assets/images/trophy.png")}
          style={leaderboardScreenStyles.trophyIcon}
        />
      </View>
    );
  };

  const renderPodium = () => {
    if (leaderboardData.length < 3) return null;

    const [first, second, third] = leaderboardData;
    
    // Calculate dynamic heights based on XP relative to first place
    const maxXP = first.total_xp || 1;
    const baseHeight = 100;
    const minHeight = 60;
    
    const firstHeight = baseHeight;
    const secondHeight = Math.max(minHeight, (second.total_xp || 0) / maxXP * baseHeight * 0.8);
    const thirdHeight = Math.max(minHeight, (third.total_xp || 0) / maxXP * baseHeight * 0.65);

    return (
      <View style={leaderboardScreenStyles.podiumContainer}>
        {/* Second Place */}
        <View style={leaderboardScreenStyles.podiumItem}>
          <View style={leaderboardScreenStyles.podiumPlayerInfo}>
            {getProfileImage(second, 1)}
            <Text style={leaderboardScreenStyles.podiumName}>{second.displayName || second.email.split('@')[0]}</Text>
            <View style={leaderboardScreenStyles.xpBadge}>
              <Text style={leaderboardScreenStyles.xpText}>{second.total_xp || 0} EXP</Text>
            </View>
          </View>
          <View style={[leaderboardScreenStyles.podiumBlock, { height: secondHeight }]}>
            <Image 
              source={require("../assets/images/leaderboard/silverpodium.png")}
              style={[leaderboardScreenStyles.podiumImage, { height: secondHeight }]}
              resizeMode="stretch"
            />
            <Image 
              source={require("../assets/images/leaderboard/2.png")}
              style={leaderboardScreenStyles.podiumNumber}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* First Place */}
        <View style={leaderboardScreenStyles.podiumItem}>
          <View style={leaderboardScreenStyles.podiumPlayerInfo}>
            {getProfileImage(first, 0)}
            <Text style={leaderboardScreenStyles.podiumName}>{first.displayName || first.email.split('@')[0]}</Text>
            <View style={[leaderboardScreenStyles.xpBadge, leaderboardScreenStyles.firstPlaceXP]}>
              <Text style={leaderboardScreenStyles.xpText}>{first.total_xp || 0} EXP</Text>
            </View>
          </View>
          <View style={[leaderboardScreenStyles.podiumBlock, { height: firstHeight }]}>
            <Image 
              source={require("../assets/images/leaderboard/yellowpodium.png")}
              style={[leaderboardScreenStyles.podiumImage, { height: firstHeight }]}
              resizeMode="stretch"
            />
            <Image 
              source={require("../assets/images/leaderboard/1.png")}
              style={leaderboardScreenStyles.podiumNumber}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Third Place */}
        <View style={leaderboardScreenStyles.podiumItem}>
          <View style={leaderboardScreenStyles.podiumPlayerInfo}>
            {getProfileImage(third, 2)}
            <Text style={leaderboardScreenStyles.podiumName}>{third.displayName || third.email.split('@')[0]}</Text>
            <View style={[leaderboardScreenStyles.xpBadge, leaderboardScreenStyles.thirdPlaceXP]}>
              <Text style={leaderboardScreenStyles.xpText}>{third.total_xp || 0} EXP</Text>
            </View>
          </View>
          <View style={[leaderboardScreenStyles.podiumBlock, { height: thirdHeight }]}>
            <Image 
              source={require("../assets/images/leaderboard/brownpodium.png")}
              style={[leaderboardScreenStyles.podiumImage, { height: thirdHeight }]}
              resizeMode="stretch"
            />
            <Image 
              source={require("../assets/images/leaderboard/3.png")}
              style={leaderboardScreenStyles.podiumNumber}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    );
  };

  const renderLeaderboardList = () => {
    if (leaderboardData.length <= 3) return null;

    return (
      <View style={leaderboardScreenStyles.listContainer}>
        {leaderboardData.slice(3).map((item, index) => {
          const position = index + 4;
          const isCurrentUser = item.id === currentUser?.uid;
          
          return (
            <View key={item.id} style={[leaderboardScreenStyles.listItem, isCurrentUser && leaderboardScreenStyles.currentUserItem]}>
              <View style={leaderboardScreenStyles.listRankContainer}>
                <Text style={[leaderboardScreenStyles.listRank, isCurrentUser && leaderboardScreenStyles.currentUserText]}>{position}</Text>
              </View>
              {getProfileImage(item, position - 1)}
              <View style={leaderboardScreenStyles.listPlayerInfo}>
                <Text style={[leaderboardScreenStyles.listPlayerName, isCurrentUser && leaderboardScreenStyles.currentUserText]}>
                  {item.displayName || item.email.split('@')[0]}
                </Text>
                <Text style={[leaderboardScreenStyles.listPlayerPoints, isCurrentUser && leaderboardScreenStyles.currentUserSubText]}>
                  {item.total_xp} {activeTab === 'weekly' ? 'Weekly' : ''} points
                </Text>
              </View>
              {/* Flag icon for variety */}
              <View style={leaderboardScreenStyles.flagContainer}>
                <View style={[leaderboardScreenStyles.flag, { backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][position % 4] }]} />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderFullLeaderboardModal = () => {
    return (
      <Modal
        visible={showFullLeaderboard}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFullLeaderboard(false)}
      >
        <View style={leaderboardScreenStyles.modalContainer}>
          {/* Modal Header */}
          <View style={leaderboardScreenStyles.modalHeader}>
            <Text style={leaderboardScreenStyles.modalTitle}>Full Rankings</Text>
            <TouchableOpacity 
              onPress={() => setShowFullLeaderboard(false)}
              style={leaderboardScreenStyles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {/* Full Rankings List */}
          <ScrollView style={leaderboardScreenStyles.modalContent} showsVerticalScrollIndicator={false}>
            {leaderboardData.map((item, index) => {
              const position = index + 1;
              const isCurrentUser = item.id === currentUser?.uid;
              
              return (
                <View key={item.id} style={[leaderboardScreenStyles.modalListItem, isCurrentUser && leaderboardScreenStyles.modalCurrentUserItem]}>
                  <View style={leaderboardScreenStyles.modalRankContainer}>
                    <Text style={[leaderboardScreenStyles.modalRank, isCurrentUser && leaderboardScreenStyles.modalCurrentUserText]}>
                      #{position}
                    </Text>
                  </View>
                  {getProfileImage(item, position - 1)}
                  <View style={leaderboardScreenStyles.modalPlayerInfo}>
                    <Text style={[leaderboardScreenStyles.modalPlayerName, isCurrentUser && leaderboardScreenStyles.modalCurrentUserText]}>
                      {item.displayName || item.email.split('@')[0]}
                    </Text>
                    <Text style={[leaderboardScreenStyles.modalPlayerPoints, isCurrentUser && leaderboardScreenStyles.modalCurrentUserSubText]}>
                      {item.total_xp || 0} {activeTab === 'weekly' ? 'Weekly' : ''} XP • Level {item.current_level || 1}
                    </Text>
                  </View>
                  {position <= 3 && (
                    <View style={leaderboardScreenStyles.medalContainer}>
                      <Ionicons 
                        name="medal" 
                        size={20} 
                        color={position === 1 ? '#FFD700' : position === 2 ? '#C0C0C0' : '#CD7F32'} 
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <View style={leaderboardScreenStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A3AFF" />
      
      {/* Header */}
      <View style={leaderboardScreenStyles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={leaderboardScreenStyles.backButton}
        >
          <Text style={leaderboardScreenStyles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={leaderboardScreenStyles.headerTitle}>Leaderboard</Text>
        <View style={leaderboardScreenStyles.headerSpacer} />
      </View>

      <ScrollView 
        style={leaderboardScreenStyles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={leaderboardScreenStyles.scrollContent}
      >
        {/* Tab Selector */}
        <View style={leaderboardScreenStyles.tabContainer}>
          <TouchableOpacity
            style={[leaderboardScreenStyles.tab, activeTab === 'weekly' && leaderboardScreenStyles.activeTab]}
            onPress={() => setActiveTab('weekly')}
          >
            <Text style={[leaderboardScreenStyles.tabText, activeTab === 'weekly' && leaderboardScreenStyles.activeTabText]}>
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[leaderboardScreenStyles.tab, activeTab === 'alltime' && leaderboardScreenStyles.activeTab]}
            onPress={() => setActiveTab('alltime')}
          >
            <Text style={[leaderboardScreenStyles.tabText, activeTab === 'alltime' && leaderboardScreenStyles.activeTabText]}>
              All Time
            </Text>
          </TouchableOpacity>
        </View>

        {/* User Position Card */}
        {renderUserPositionCard()}

        {/* Podium */}
        {loading ? (
          <View style={leaderboardScreenStyles.loadingContainer}>
            <Text style={leaderboardScreenStyles.loadingText}>Loading leaderboard...</Text>
          </View>
        ) : leaderboardData.length === 0 ? (
          <View style={leaderboardScreenStyles.loadingContainer}>
            <Text style={leaderboardScreenStyles.loadingText}>No leaderboard data found</Text>
            <Text style={leaderboardScreenStyles.loadingText}>Check console for debug info</Text>
          </View>
        ) : (
          <>
            {renderPodium()}
            {leaderboardData.length > 3 && (
              <TouchableOpacity 
                style={leaderboardScreenStyles.viewMoreButton} 
                onPress={() => setShowFullLeaderboard(true)}
              >
                <Text style={leaderboardScreenStyles.viewMoreText}>View Full Rankings</Text>
                <Ionicons name="chevron-up" size={20} color="white" />
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
      
      {/* Full Leaderboard Modal */}
      {renderFullLeaderboardModal()}
    </View>
  );
}
