// Account Information Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '../../firebaseConfig';
import { updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export default function AccountInformation() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    // Get current user email
    const user = auth.currentUser;
    if (user?.email) {
      setUserEmail(user.email);
    }
  }, []);

  const handleResetPassword = () => {
    router.push('/auth/reset-password-request');
  };

  const handleTwoFactorAuth = () => {
    Alert.alert(
      'Two-Factor Authentication',
      'Two-factor authentication setup will be available soon.',
      [{ text: 'OK' }]
    );
  };

  const maskEmail = (email: string) => {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return email;
    
    const visibleStart = localPart.substring(0, 2);
    const maskedPart = '*'.repeat(Math.min(localPart.length - 2, 6));
    const [domainName, domainExt] = domain.split('.');
    const maskedDomain = domainName.substring(0, 2) + '*'.repeat(Math.min(domainName.length - 2, 2));
    
    return `${visibleStart}${maskedPart}@${maskedDomain}.${domainExt}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Account Information</Text>

      {/* Form Fields */}
      <View style={styles.card}>
        <Text style={styles.label}>Email Address</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            editable={false}
            value={maskEmail(userEmail)}
            placeholder="Email"
            placeholderTextColor="#999"
          />
        </View>
        <Text style={styles.helperText}>
          Your registered email address
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry
            editable={false}
            value="************"
            placeholder="Password"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={handleResetPassword}
      >
        <View style={styles.actionCardContent}>
          <Ionicons name="lock-closed-outline" size={22} color="#5B4DE1" />
          <Text style={styles.actionLabel}>Reset Password</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={handleTwoFactorAuth}
      >
        <View style={styles.actionCardContent}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#5B4DE1" />
          <Text style={styles.actionLabel}>Enable Two-Factor Authentication</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

      {/* Account Info */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color="#666" />
        <Text style={styles.infoText}>
          Keep your account secure by enabling two-factor authentication and using a strong password.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  backButton: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 8,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 16,
    color: '#B0B0B0',
    fontWeight: '500',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 8,
  },
  input: {
    fontSize: 16,
    color: '#666',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
  infoCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginTop: 20,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
});
