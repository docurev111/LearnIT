import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import API_BASE_URL from '../config/api';
import { auth } from '../firebaseConfig';

interface TeacherDashboardProps {
  visible: boolean;
  onClose: () => void;
  classId: string;
}

interface Student {
  id: number;
  displayName: string;
  email: string;
  class_id?: string;
  total_xp: number;
  current_level: number;
  badge_count: number;
  lessons_completed: number;
}

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  rarity: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  target_type: string;
  target_value: number;
  participants_count: number;
  completed_count: number;
}

export default function TeacherDashboard({
  visible,
  onClose,
  classId,
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'badges' | 'challenges' | 'analytics'>('leaderboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [newSectionId, setNewSectionId] = useState('');

  useEffect(() => {
    if (visible) {
      loadDashboardData();
    }
  }, [visible, classId]);

  const getAuthHeaders = async () => {
    const currentUser = auth.currentUser;
    const token = currentUser ? await currentUser.getIdToken() : '';
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      // Load students list with stats (real data)
      const studentsResponse = await fetch(`${API_BASE_URL}/class/${classId}/students`, { headers });
      if (studentsResponse.ok) {
        const studentsJson = await studentsResponse.json();
        setStudents(studentsJson.students || []);
      }

      // Load badges
  const badgesResponse = await fetch(`${API_BASE_URL}/badges`, { headers });
      if (badgesResponse.ok) {
        const badgesData = await badgesResponse.json();
        setBadges(badgesData);
      }

      // Load challenges
  const challengesResponse = await fetch(`${API_BASE_URL}/challenges/${classId}`, { headers });
      if (challengesResponse.ok) {
        const challengesData = await challengesResponse.json();
        setChallenges(challengesData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const awardBadge = async () => {
    if (!selectedStudent || !selectedBadge) return;

    try {
      const headers = await getAuthHeaders();
      const currentUser = auth.currentUser;
      const response = await fetch(`${API_BASE_URL}/teacher/award-badge`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: selectedStudent.id,
          badge_id: selectedBadge.id,
          awarded_by: currentUser ? currentUser.uid : undefined,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', `Badge "${selectedBadge.name}" awarded to ${selectedStudent.displayName}!`);
        setShowBadgeModal(false);
        setSelectedStudent(null);
        setSelectedBadge(null);
        loadDashboardData(); // Refresh data
      } else {
        Alert.alert('Error', 'Failed to award badge');
      }
    } catch (error) {
      console.error('Error awarding badge:', error);
      Alert.alert('Error', 'Failed to award badge');
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#FF69B4';
      case 'rare': return '#9370DB';
      default: return Colors.light.primary;
    }
  };

  const renderLeaderboardList = () => (
    <FlatList
      data={students}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.section}
      ListHeaderComponent={<Text style={styles.sectionTitle}>Class Leaderboard</Text>}
      renderItem={({ item, index }) => (
        <View style={styles.studentCard}>
          <View style={styles.rankContainer}>
            <Text style={styles.rank}>#{index + 1}</Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{item.displayName}</Text>
            <Text style={styles.studentEmail}>{item.email}</Text>
            {!!item.class_id && (
              <Text style={styles.studentEmail}>Section: {item.class_id}</Text>
            )}
          </View>
          <View style={styles.studentStats}>
            <Text style={styles.statText}>Level {item.current_level}</Text>
            <Text style={styles.statText}>{item.total_xp} XP</Text>
            <Text style={styles.statText}>{item.badge_count} badges</Text>
          </View>
          <View style={{ gap: 6 }}>
            <TouchableOpacity
              style={styles.awardButton}
              onPress={() => {
                setSelectedStudent(item);
                setShowBadgeModal(true);
              }}
            >
              <Text style={styles.awardButtonText}>Award Badge</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.awardButton, { backgroundColor: Colors.light.textSecondary }]}
              onPress={() => {
                setSelectedStudent(item);
                setNewSectionId(item.class_id || '');
                setAssignModalVisible(true);
              }}
            >
              <Text style={styles.awardButtonText}>Assign Section</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );

  const renderBadgesList = () => (
    <FlatList
      data={badges}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.section}
      ListHeaderComponent={<Text style={styles.sectionTitle}>Available Badges</Text>}
      renderItem={({ item }) => (
        <View style={styles.badgeCard}>
          <Text style={styles.badgeIcon}>{item.icon}</Text>
          <View style={styles.badgeInfo}>
            <Text style={styles.badgeName}>{item.name}</Text>
            <Text style={styles.badgeDescription}>{item.description}</Text>
            <Text style={[styles.badgeRarity, { color: getRarityColor(item.rarity) }]}>
              {item.rarity.toUpperCase()}
            </Text>
          </View>
        </View>
      )}
    />
  );

  const renderChallengesList = () => (
    <FlatList
      data={challenges}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.section}
      ListHeaderComponent={<Text style={styles.sectionTitle}>Class Challenges</Text>}
      renderItem={({ item }) => (
        <View style={styles.challengeCard}>
          <Text style={styles.challengeTitle}>{item.title}</Text>
          <Text style={styles.challengeDescription}>{item.description}</Text>
          <View style={styles.challengeProgress}>
            <Text style={styles.progressText}>
              {item.completed_count}/{item.participants_count} completed
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(item.participants_count ? (item.completed_count / item.participants_count) * 100 : 0)}%` }
                ]}
              />
            </View>
          </View>
        </View>
      )}
    />
  );

  const renderAnalytics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Class Analytics</Text>
      <View style={styles.analyticsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{students.length}</Text>
          <Text style={styles.statLabel}>Total Students</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {students.reduce((sum, student) => sum + student.total_xp, 0)}
          </Text>
          <Text style={styles.statLabel}>Total XP Earned</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {students.reduce((sum, student) => sum + student.badge_count, 0)}
          </Text>
          <Text style={styles.statLabel}>Badges Earned</Text>
        </View>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Teacher Dashboard</Text>
          <Text style={styles.subtitle}>Class {classId}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          {[
            { key: 'leaderboard', label: 'Leaderboard' },
            { key: 'badges', label: 'Badges' },
            { key: 'challenges', label: 'Challenges' },
            { key: 'analytics', label: 'Analytics' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : (
            <>
              {activeTab === 'leaderboard' && renderLeaderboardList()}
              {activeTab === 'badges' && renderBadgesList()}
              {activeTab === 'challenges' && renderChallengesList()}
              {activeTab === 'analytics' && renderAnalytics()}
            </>
          )}
        </View>

        <Modal visible={showBadgeModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Award Badge</Text>
              <Text style={styles.modalSubtitle}>
                to {selectedStudent?.displayName}
              </Text>

              <ScrollView style={styles.badgeList}>
                {badges.map((badge) => (
                  <TouchableOpacity
                    key={badge.id}
                    style={[
                      styles.badgeOption,
                      selectedBadge?.id === badge.id && styles.selectedBadgeOption,
                    ]}
                    onPress={() => setSelectedBadge(badge)}
                  >
                    <Text style={styles.badgeIcon}>{badge.icon}</Text>
                    <View style={styles.badgeOptionInfo}>
                      <Text style={styles.badgeName}>{badge.name}</Text>
                      <Text style={styles.badgeDescription}>{badge.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowBadgeModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.awardModalButton, !selectedBadge && styles.disabledButton]}
                  onPress={awardBadge}
                  disabled={!selectedBadge}
                >
                  <Text style={styles.awardModalButtonText}>Award Badge</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Assign Section Modal */}
        <Modal visible={assignModalVisible} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Assign to Section</Text>
              <Text style={styles.modalSubtitle}>Student: {selectedStudent?.displayName}</Text>

              <TextInput
                placeholder="Enter section/class ID (e.g., class-7a)"
                value={newSectionId}
                onChangeText={setNewSectionId}
                style={{ borderWidth: 1, borderColor: Colors.light.cardBorder, borderRadius: BorderRadius.md, padding: Spacing.md }}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setAssignModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.awardModalButton, !newSectionId && styles.disabledButton]}
                  disabled={!newSectionId}
                  onPress={async () => {
                    if (!selectedStudent) return;
                    try {
                      const headers = await getAuthHeaders();
                      const res = await fetch(`${API_BASE_URL}/users/${selectedStudent.id}/class`, {
                        method: 'PUT',
                        headers,
                        body: JSON.stringify({ class_id: newSectionId.trim() })
                      });
                      if (!res.ok) throw new Error('Failed to assign section');
                      setAssignModalVisible(false);
                      setNewSectionId('');
                      setSelectedStudent(null);
                      loadDashboardData();
                    } catch (e) {
                      console.error('Assign section error:', e);
                      Alert.alert('Error', 'Failed to assign section');
                    }
                  }}
                >
                  <Text style={styles.awardModalButtonText}>Assign</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl + 40,
    backgroundColor: Colors.light.primary,
  },
  title: {
    ...Typography.h1,
    color: 'white',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: 'white',
    opacity: 0.8,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.xl + 40,
    right: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.cardBorder,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  activeTabText: {
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h2,
    marginBottom: Spacing.md,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rankContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  rank: {
    color: 'white',
    fontWeight: 'bold',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    ...Typography.body,
    fontWeight: 'bold',
  },
  studentEmail: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  studentStats: {
    alignItems: 'flex-end',
    marginRight: Spacing.md,
  },
  statText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  awardButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  awardButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    ...Typography.body,
    fontWeight: 'bold',
  },
  badgeDescription: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  badgeRarity: {
    ...Typography.caption,
    fontWeight: 'bold',
    marginTop: Spacing.xs,
  },
  challengeCard: {
    backgroundColor: 'white',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  challengeTitle: {
    ...Typography.body,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  challengeDescription: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
  },
  challengeProgress: {
    marginTop: Spacing.sm,
  },
  progressText: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.light.cardBorder,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
  analyticsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minWidth: 100,
  },
  statNumber: {
    ...Typography.h2,
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    padding: Spacing.xl,
    color: Colors.light.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    margin: Spacing.lg,
    maxHeight: '80%',
    width: '90%',
  },
  modalTitle: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.lg,
  },
  badgeList: {
    maxHeight: 300,
  },
  badgeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
  },
  selectedBadgeOption: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '10',
  },
  badgeOptionInfo: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
  },
  cancelButton: {
    flex: 1,
    padding: Spacing.md,
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.light.textSecondary,
  },
  awardModalButton: {
    flex: 1,
    padding: Spacing.md,
    marginLeft: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.light.cardBorder,
  },
  awardModalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
