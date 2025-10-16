import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import pickApiBase from '../config/api_probe';
import { AppState } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'achievement' | 'lesson' | 'system' | 'reminder';
  created_at: string;
  is_read: boolean;
}

interface NotificationBellProps {
  style?: any;
  iconSize?: number;
  showBadge?: boolean;
}

export default function NotificationBell({ 
  style, 
  iconSize = 24, 
  showBadge = true 
}: NotificationBellProps) {
  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [lastRefresh, setLastRefresh] = useState(0);

  useEffect(() => {
    // PRESENTATION MODE: Load once, no auto-refresh
    loadNotifications();
    
    // Optional: Only refresh when app becomes active after being backgrounded
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        const now = Date.now();
        // Only refresh if more than 10 minutes have passed (presentation-safe)
        if (now - lastRefresh > 600000) {
          loadNotifications();
        }
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // PRESENTATION MODE: Mock notifications function
  const setMockNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: 1,
        title: 'Achievement Unlocked! 🏆',
        message: 'Congratulations! You completed Lesson 1: Dignidad ng Tao',
        type: 'achievement',
        created_at: new Date().toISOString(),
        is_read: false,
      },
      {
        id: 2,
        title: 'New Lesson Available 📚',
        message: 'Lesson 2: Pagpapahalaga sa Sarili is now available',
        type: 'lesson',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        is_read: false,
      },
      {
        id: 3,
        title: 'Great Progress! 🌟',
        message: 'You\'re doing amazing! Keep up the excellent work in ESP.',
        type: 'system',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        is_read: true,
      },
    ];
    
    setNotifications(mockNotifications);
    const unread = mockNotifications.filter(n => !n.is_read).length;
    setUnreadCount(unread);
  };

  const loadNotifications = async () => {
    // PRESENTATION MODE: Demo mode active - no API calls
    setMockNotifications();
    return;
    
    // BACKUP CODE (inactive): Real API calls with fallback
    const now = Date.now();
    if (now - lastRefresh < 300000) { // 5 minute cooldown
      return;
    }
    
    setLoading(true);
    setLastRefresh(now);
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('No authenticated user - using mock data');
        setMockNotifications();
        return;
      }

      const idToken = await user.getIdToken();
      const API_BASE_URL = await pickApiBase();
      
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        const unread = (data.notifications || []).filter((n: Notification) => !n.is_read).length;
        setUnreadCount(unread);
      } else if (response.status === 429) {
        console.log('Rate limited - using mock data for presentation');
        setMockNotifications(); // Fallback to mock data
        return;
      } else {
        console.error('API failed - using mock data:', response.status);
        setMockNotifications(); // Fallback to mock data
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setShowModal(true);
    // Only refresh if notifications are empty or haven't been refreshed in 5 minutes
    const now = Date.now();
    if (notifications.length === 0 || (now - lastRefresh > 300000)) {
      loadNotifications();
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowModal(false);
    });
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const idToken = await user.getIdToken();
      const API_BASE_URL = await pickApiBase();
      
      const response = await fetch(`${API_BASE_URL}/notifications/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notification_ids: [notificationId] })
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length === 0) return;

      const idToken = await user.getIdToken();
      const API_BASE_URL = await pickApiBase();
      
      const response = await fetch(`${API_BASE_URL}/notifications/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notification_ids: unreadIds })
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return '🏆';
      case 'lesson':
        return '📚';
      case 'system':
        return '⚙️';
      case 'reminder':
        return '⏰';
      default:
        return '📱';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Now';
    if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  };

  return (
    <>
      <TouchableOpacity onPress={openModal} style={[styles.bellContainer, style]}>
        <Image
          source={unreadCount > 0 
            ? require("../assets/images/has-notif.png")
            : require("../assets/images/notificationsicon.png")
          }
          style={[styles.bellIcon, { width: iconSize, height: iconSize }]}
        />
        {showBadge && unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={closeModal}
        >
          <Animated.View 
            style={[
              styles.modalContent,
              { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }
            ]}
          >
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.headerLeft}>
                  <Image
                    source={require("../assets/images/notificationsicon.png")}
                    style={styles.headerIcon}
                  />
                  <Text style={styles.modalTitle}>Notifications</Text>
                </View>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Image source={require("../assets/images/xbutton.png")} style={{ width: 20, height: 25 }} />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text style={styles.loadingText}>Loading notifications...</Text>
                  </View>
                ) : notifications.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🔔</Text>
                    <Text style={styles.emptyTitle}>No notifications</Text>
                    <Text style={styles.emptyMessage}>You're all caught up!</Text>
                  </View>
                ) : (
                  notifications.map((notification) => (
                    <TouchableOpacity
                      key={notification.id}
                      style={[
                        styles.notificationItem,
                        !notification.is_read && styles.unreadItem
                      ]}
                      onPress={() => markAsRead(notification.id)}
                    >
                      <View style={styles.notificationIconContainer}>
                        <View style={[styles.notificationDot, !notification.is_read && styles.unreadDot]} />
                      </View>
                      <View style={styles.notificationContent}>
                        <Text style={styles.notificationTitle}>
                          {notification.title}
                        </Text>
                        <Text style={styles.notificationMessage}>
                          {notification.message}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {formatTime(notification.created_at)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>

              {/* Mark all as read button */}
              {notifications.length > 0 && unreadCount > 0 && (
                <TouchableOpacity 
                  onPress={markAllAsRead} 
                  style={styles.markAllAsReadButton}
                >
                  <Text style={styles.markAllAsReadText}>Mark all as read</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bellContainer: {
    position: 'relative',
  },
  bellIcon: {
    width: 24,
    height: 24,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.7,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 28,
    height: 28,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  notificationsList: {
    maxHeight: height * 0.5,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'flex-start',
  },
  unreadItem: {
    backgroundColor: '#FAFAFA',
  },
  notificationIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
  },
  unreadDot: {
    backgroundColor: '#6366F1',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000',
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  markAllAsReadButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
  },
  markAllAsReadText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '400',
  },
});