import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import pickApiBase from '../config/api_probe';

const { width } = Dimensions.get('window');

interface DailySignInProps {
  visible: boolean;
  onClose: () => void;
  onRewardClaimed?: (xpEarned: number) => void;
}

interface LoginStreak {
  currentStreak: number;
  lastLoginDate: string;
  canClaim: boolean;
  nextRewardIn: number; // hours until next reward
}

const DAILY_REWARDS = [
  { day: 1, xp: 50, label: 'Day 1' },
  { day: 2, xp: 75, label: 'Day 2' },
  { day: 3, xp: 100, label: 'Day 3' },
  { day: 4, xp: 125, label: 'Day 4' },
  { day: 5, xp: 150, label: 'Day 5' },
  { day: 6, xp: 200, label: 'Day 6' },
  { day: 7, xp: 300, label: 'Day 7' },
];

export default function DailySignInBonus({ visible, onClose, onRewardClaimed }: DailySignInProps) {
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [loginStreak, setLoginStreak] = useState<LoginStreak | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState('');

  useEffect(() => {
    if (visible) {
      loadLoginStreak();
    }
  }, [visible]);

  useEffect(() => {
    let interval: any;
    if (loginStreak && !loginStreak.canClaim) {
      interval = setInterval(() => {
        updateCountdown();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loginStreak]);

  const loadLoginStreak = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const apiBase = await pickApiBase();
      const token = await user.getIdToken();

      // Get user ID first
      const userRes = await fetch(`${apiBase}/users/${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!userRes.ok) {
        throw new Error('Failed to get user data');
      }

      const userData = await userRes.json();
      
      // Get login streak data
      const streakRes = await fetch(`${apiBase}/user/login-streak/${userData.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (streakRes.ok) {
        const streakData = await streakRes.json();
        setLoginStreak(streakData);
      } else {
        // If no streak data, create initial state
        setLoginStreak({
          currentStreak: 0,
          lastLoginDate: '',
          canClaim: true,
          nextRewardIn: 0
        });
      }
    } catch (error) {
      console.error('Error loading login streak:', error);
      Alert.alert('Error', 'Failed to load daily login data');
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = () => {
    if (!loginStreak || loginStreak.canClaim) return;

    const now = new Date();
    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0);
    
    const diff = nextMidnight.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeUntilNext(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const claimDailyReward = async () => {
    if (!loginStreak?.canClaim) return;

    try {
      setClaiming(true);
      const user = auth.currentUser;
      if (!user) return;

      const apiBase = await pickApiBase();
      const token = await user.getIdToken();

      // Get user ID first
      const userRes = await fetch(`${apiBase}/users/${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!userRes.ok) {
        throw new Error('Failed to get user data');
      }

      const userData = await userRes.json();

      // Claim daily login reward
      const claimRes = await fetch(`${apiBase}/daily-login/${userData.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (claimRes.ok) {
        const result = await claimRes.json();
        console.log('✅ Daily login claimed:', result);
        
        // Update streak data
        setLoginStreak({
          currentStreak: result.newStreak,
          lastLoginDate: new Date().toISOString().split('T')[0],
          canClaim: false,
          nextRewardIn: 24
        });

        // Notify parent component
        if (onRewardClaimed) {
          onRewardClaimed(result.xpEarned);
        }

        Alert.alert(
          '🎉 Daily Reward Claimed!',
          `You earned ${result.xpEarned} XP! Current streak: ${result.newStreak} days`,
          [{ text: 'Awesome!', onPress: onClose }]
        );
      } else {
        const errorText = await claimRes.text();
        console.error('❌ Failed to claim daily reward:', errorText);
        Alert.alert('Error', 'Failed to claim daily reward. Please try again.');
      }
    } catch (error) {
      console.error('💥 Error claiming daily reward:', error);
      Alert.alert('Error', 'Failed to claim daily reward. Please check your connection.');
    } finally {
      setClaiming(false);
    }
  };

  const getCurrentReward = () => {
    if (!loginStreak) return DAILY_REWARDS[0];
    const nextDay = (loginStreak.currentStreak % 7) + 1;
    return DAILY_REWARDS[nextDay - 1] || DAILY_REWARDS[6]; // Max at Day 7
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Image source={require("../assets/images/xbutton.png")} style={{ width: 24, height: 30, marginTop: 8 }} />
          </TouchableOpacity>

          <Text style={styles.title}>DAILY LOGIN</Text>
          <Text style={styles.subtitle}>Come back everyday to claim a new reward</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={styles.loadingText}>Loading streak data...</Text>
            </View>
          ) : (
            <>
              {/* Flame Animation */}
              <View style={styles.flameContainer}>
                <Image 
                  source={require('../assets/images/GIFS/flame.gif')} 
                  style={styles.flameGif}
                  resizeMode="contain"
                />
              </View>

              {/* Streak Number */}
              <Text style={styles.streakNumber}>{loginStreak?.currentStreak || 0}</Text>
              <Text style={styles.streakLabel}>LOGIN STREAK</Text>

              {/* 7-Day Reward Layout - Swipeable */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.rewardsScrollContainer}
                style={styles.rewardsContainer}
              >
                {DAILY_REWARDS.map((reward, index) => {
                  const currentStreak = loginStreak?.currentStreak || 0;
                  const isCompleted = currentStreak > index;
                  const isCurrent = currentStreak === (index + 1) && loginStreak?.canClaim;
                  
                  return (
                    <View key={reward.day} style={styles.rewardDay}>
                      <View style={[
                        styles.rewardBox,
                        isCompleted && styles.completedRewardBox,
                        isCurrent && styles.currentRewardBox
                      ]}>
                        {isCompleted ? (
                          <Image 
                            source={require("../assets/images/checked.png")} 
                            style={styles.checkedIcon}
                          />
                        ) : isCurrent ? (
                          <Image 
                            source={require("../assets/images/checked.png")} 
                            style={[styles.checkedIcon, { opacity: 0.3 }]}
                          />
                        ) : (
                          <Text style={styles.rewardXP}>{reward.xp} XP</Text>
                        )}
                      </View>
                      <Text style={[
                        styles.dayText,
                        (isCompleted || isCurrent) && styles.activeDayText
                      ]}>
                        DAY {reward.day}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarTrack}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { width: `${((loginStreak?.currentStreak || 0) / 7) * 100}%` }
                    ]} 
                  />
                </View>
              </View>

              {/* Claim Button */}
              {loginStreak?.canClaim ? (
                <TouchableOpacity
                  style={[styles.claimButton, claiming && styles.claimButtonDisabled]}
                  onPress={claimDailyReward}
                  disabled={claiming}
                >
                  {claiming ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.claimButtonText}>I GOT THIS</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.claimButtonDisabled} disabled>
                  <Text style={styles.claimButtonText}>COME BACK TOMORROW</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 25,
    width: width * 0.75,
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 6,
    letterSpacing: 0.5,
    marginTop: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#9CA3AF',
  },
  flameContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  flameGif: {
    width: 60,
    height: 60,
  },
  streakNumber: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 5,
  },
  streakLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F97316',
    letterSpacing: 1,
    marginBottom: 25,
  },
  rewardsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  rewardsScrollContainer: {
    paddingHorizontal: 10,
    gap: 15,
  },
  rewardDay: {
    alignItems: 'center',
    width: 60,
  },
  rewardBox: {
    width: 45,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  completedRewardBox: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  currentRewardBox: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  checkedIcon: {
    width: 45,
    height: 50,
  },
  rewardXP: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  dayText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  activeDayText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 25,
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  claimButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  claimButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  claimButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});