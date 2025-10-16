// ProfileCustomizationModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

// Avatar options
const SYSTEM_AVATARS = [
  { id: 'avatar1', source: require('../assets/images/LandingLogo.png'), name: 'Default Mascot' },
  { id: 'avatar2', source: require('../assets/images/mascot.png'), name: 'Mascot' },
  { id: 'avatar3', source: require('../assets/images/LoadingMascot.png'), name: 'Loading Mascot' },
  { id: 'avatar4', source: require('../assets/images/LogOutMascot.png'), name: 'Logout Mascot' },
];

// Border options
const BORDERS = [
  { id: 'none', source: null, name: 'No Border', cost: 0 },
  { id: 'border1', source: require('../assets/images/borders/border1.png'), name: 'Bronze Border', cost: 50 },
  { id: 'border2', source: require('../assets/images/borders/border2.png'), name: 'Silver Border', cost: 150 },
  { id: 'border3', source: require('../assets/images/borders/border3.png'), name: 'Gold Border', cost: 300 },
];

// Title options - Wuthering Waves style elegant text banners
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

type TabType = 'avatar' | 'border' | 'title';

interface ProfileCustomizationModalProps {
  visible: boolean;
  onClose: () => void;
  currentAvatar: string | null;
  currentBorder: string | null;
  currentTitle: string | null;
  userXP: number;
  userVirtuePoints: number;
  onSave: (avatar: string | null, border: string | null, title: string | null) => void;
}

export default function ProfileCustomizationModal({
  visible,
  onClose,
  currentAvatar,
  currentBorder,
  currentTitle,
  userXP,
  userVirtuePoints,
  onSave,
}: ProfileCustomizationModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('avatar');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar);
  const [selectedBorder, setSelectedBorder] = useState<string | null>(currentBorder);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(currentTitle);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Reset state when modal opens
  React.useEffect(() => {
    if (visible) {
      setSelectedAvatar(currentAvatar);
      setSelectedBorder(currentBorder);
      setSelectedTitle(currentTitle);
      setCustomAvatar(null);
      setShowPreview(false);
    }
  }, [visible, currentAvatar, currentBorder, currentTitle]);

  const handleSave = () => {
    onSave(
      customAvatar || selectedAvatar,
      selectedBorder,
      selectedTitle
    );
    setShowPreview(false);
    onClose();
  };

  const pickCustomImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCustomAvatar(result.assets[0].uri);
        setSelectedAvatar('custom');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const renderAvatarTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>System Avatars</Text>
      <View style={styles.avatarGrid}>
        {SYSTEM_AVATARS.map((avatar) => (
          <TouchableOpacity
            key={avatar.id}
            style={[
              styles.avatarOption,
              selectedAvatar === avatar.id && styles.selectedOption,
            ]}
            onPress={() => {
              setSelectedAvatar(avatar.id);
              setCustomAvatar(null);
            }}
          >
            <Image source={avatar.source} style={styles.avatarImage} />
            <Text style={styles.avatarName}>{avatar.name}</Text>
            {selectedAvatar === avatar.id && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Custom Avatar</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={pickCustomImage}>
        {customAvatar ? (
          <Image source={{ uri: customAvatar }} style={styles.customAvatarPreview} />
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={40} color="#6c63ff" />
            <Text style={styles.uploadText}>Upload Your Own</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderBorderTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Avatar Borders</Text>
      <View style={styles.borderGrid}>
        {BORDERS.map((border) => (
          <TouchableOpacity
            key={border.id}
            style={[
              styles.borderOption,
              selectedBorder === border.id && styles.selectedOption,
            ]}
            onPress={() => {
              if (border.cost > 0 && userVirtuePoints < border.cost) {
                Alert.alert(
                  'Insufficient Virtue Points',
                  `You need ${border.cost} Virtue Points to unlock this border. You currently have ${userVirtuePoints}.`
                );
                return;
              }
              setSelectedBorder(border.id);
            }}
          >
            <View style={styles.borderPreviewContainer}>
              <View style={styles.borderPreviewWrapper}>
                <Image 
                  source={require('../assets/images/LandingLogo.png')} 
                  style={styles.borderPreviewAvatar}
                />
                {border.source && (
                  <Image 
                    source={border.source} 
                    style={styles.borderPreviewBorder}
                  />
                )}
              </View>
            </View>
            <Text style={styles.borderName}>{border.name}</Text>
            {selectedBorder === border.id && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderTitleTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Achievement Titles</Text>
      <View style={styles.titleGrid}>
        {TITLE_OPTIONS.map((title) => {
          const isUnlocked = userXP >= title.unlockRequirement;
          return (
            <TouchableOpacity
              key={title.id}
              style={[
                styles.titleOption,
                selectedTitle === title.id && styles.selectedTitleOption,
                !isUnlocked && styles.lockedTitleOption,
              ]}
              onPress={() => {
                if (isUnlocked) {
                  setSelectedTitle(title.id);
                  setShowPreview(true);
                } else {
                  Alert.alert(
                    'Title Locked',
                    `You need ${title.unlockRequirement - userXP} more XP to unlock "${title.name}"`
                  );
                }
              }}
              disabled={!isUnlocked}
            >
              <View style={[styles.titleBanner, { backgroundColor: title.color }]}>
                <Text style={styles.titleIcon}>{title.icon}</Text>
                <Text style={styles.titleBannerText}>{title.name}</Text>
                {selectedTitle === title.id && (
                  <View style={styles.titleSelectedIndicator}>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  </View>
                )}
              </View>

              <View style={styles.titleInfo}>
                <Text style={[styles.titleDescription, !isUnlocked && styles.lockedTitleText]}>
                  {title.description}
                </Text>
                <View style={styles.titleMeta}>
                  <Text style={[styles.titleRarity, { color: title.color }]}>
                    {title.rarity.toUpperCase()}
                  </Text>
                  {!isUnlocked && (
                    <View style={styles.lockIndicator}>
                      <Ionicons name="lock-closed" size={14} color="#666" />
                      <Text style={styles.xpRequirement}>{title.unlockRequirement} XP</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Customize Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'avatar' && styles.activeTab]}
              onPress={() => setActiveTab('avatar')}
            >
              <Ionicons 
                name="person" 
                size={20} 
                color={activeTab === 'avatar' ? '#6c63ff' : '#999'} 
              />
              <Text style={[styles.tabText, activeTab === 'avatar' && styles.activeTabText]}>
                Avatar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'border' && styles.activeTab]}
              onPress={() => setActiveTab('border')}
            >
              <Ionicons 
                name="square-outline" 
                size={20} 
                color={activeTab === 'border' ? '#6c63ff' : '#999'} 
              />
              <Text style={[styles.tabText, activeTab === 'border' && styles.activeTabText]}>
                Border
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'title' && styles.activeTab]}
              onPress={() => setActiveTab('title')}
            >
              <Ionicons 
                name="trophy" 
                size={20} 
                color={activeTab === 'title' ? '#6c63ff' : '#999'} 
              />
              <Text style={[styles.tabText, activeTab === 'title' && styles.activeTabText]}>
                Title
              </Text>
            </TouchableOpacity>
          </View>

          {/* Title Preview */}
          {showPreview && selectedTitle && (
            <View style={styles.titlePreviewContainer}>
              <Text style={styles.previewLabel}>Preview</Text>
              <View style={styles.titlePreview}>
                <View style={[styles.titlePreviewBanner, { backgroundColor: TITLE_OPTIONS.find(t => t.id === selectedTitle)?.color }]}>
                  <Text style={styles.titlePreviewIcon}>{TITLE_OPTIONS.find(t => t.id === selectedTitle)?.icon}</Text>
                  <Text style={styles.titlePreviewText}>{TITLE_OPTIONS.find(t => t.id === selectedTitle)?.name}</Text>
                </View>
                <View style={styles.avatarPreviewContainer}>
                  <View style={styles.avatarPreviewWrapper}>
                    <Image
                      source={selectedAvatar ? { uri: selectedAvatar } : require('../assets/images/avatars/default.jpg')}
                      style={styles.avatarPreviewImage}
                    />
                    {selectedBorder && (
                      <Image
                        source={BORDERS.find(b => b.id === selectedBorder)?.source}
                        style={styles.avatarPreviewBorder}
                      />
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Tab Content */}
          {activeTab === 'avatar' && renderAvatarTab()}
          {activeTab === 'border' && renderBorderTab()}
          {activeTab === 'title' && renderTitleTab()}

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 5,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6c63ff',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
  },
  activeTabText: {
    color: '#6c63ff',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  avatarOption: {
    width: (width - 60) / 2,
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#6c63ff',
    backgroundColor: '#f0f0ff',
  },
  avatarImage: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },
  avatarName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  uploadButton: {
    width: '100%',
    height: 150,
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#6c63ff',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadText: {
    fontSize: 14,
    color: '#6c63ff',
    marginTop: 10,
    fontWeight: '600',
  },
  customAvatarPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
  },
  borderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  borderOption: {
    width: (width - 60) / 2,
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  borderPreviewContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borderPreviewWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borderPreviewAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  borderPreviewBorder: {
    position: 'absolute',
    width: 100,
    height: 100,
    resizeMode: 'contain',
    top: 0,
    left: 0,
  },
  borderName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  titleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  titleOption: {
    width: (width - 60) / 2,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  lockedOption: {
    opacity: 0.6,
  },
  titleCardContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  titleCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titleGifContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleGif: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpRequirement: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  titleCheckmark: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  titleName: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  lockedText: {
    color: '#999',
  },
  selectedTitleOption: {
    borderColor: '#6c63ff',
    backgroundColor: '#f0f0ff',
  },
  lockedTitleOption: {
    opacity: 0.6,
  },
  titleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
    position: 'relative',
  },
  titleIcon: {
    fontSize: 16,
    color: '#fff',
    marginRight: 8,
  },
  titleBannerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  titleSelectedIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 2,
  },
  titleInfo: {
    paddingHorizontal: 8,
  },
  titleDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 16,
  },
  lockedTitleText: {
    color: '#999',
  },
  titleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRarity: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  lockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  titlePreviewContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  titlePreview: {
    alignItems: 'center',
  },
  titlePreviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 10,
    minWidth: 150,
  },
  titlePreviewIcon: {
    fontSize: 14,
    color: '#fff',
    marginRight: 6,
  },
  titlePreviewText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  avatarPreviewContainer: {
    alignItems: 'center',
  },
  avatarPreviewWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPreviewImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPreviewBorder: {
    position: 'absolute',
    width: 80,
    height: 80,
    resizeMode: 'contain',
    top: 0,
    left: 0,
  },
  saveButton: {
    backgroundColor: '#6c63ff',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
