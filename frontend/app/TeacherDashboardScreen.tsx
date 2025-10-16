import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TeacherDashboard from '../components/TeacherDashboard';
import API_BASE_URL from '../config/api';
import { auth } from '../firebaseConfig';

export default function TeacherDashboardScreen() {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(true);
  const [classId, setClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadUserClass = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert('Not signed in', 'Please log in first.');
          navigation.goBack();
          return;
        }

        const token = await user.getIdToken();
        const res = await fetch(`${API_BASE_URL}/users/${user.uid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to load user');
        }
  const userData = await res.json();
  setClassId(userData.class_id || null);
  setUserId(userData.id || null);
      } catch (e: any) {
        console.error('Failed to load class id:', e);
        Alert.alert('Error', e.message || 'Failed to load user info');
      } finally {
        setLoading(false);
      }
    };

    loadUserClass();
  }, [navigation]);

  const handleClose = () => {
    setVisible(false);
    // Small delay to allow modal close animation
    setTimeout(() => navigation.goBack(), 150);
  };

  if (loading || !classId) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <TeacherDashboard visible={visible} onClose={handleClose} classId={classId} />
    </View>
  );
}
