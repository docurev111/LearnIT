import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Game {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  emoji: string;
  isLocked: boolean;
  accentColor: string[];
}

export default function GamesScreen() {
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showGameModal, setShowGameModal] = useState(false);

  const games: Game[] = [
    {
      id: 'good_vs_bad_catch',
      title: 'Good vs. Bad Catch',
      shortDescription: 'Test your reflexes by catching good values!',
      description: 'An exciting arcade game where you catch falling good values while avoiding bad behaviors. Quick thinking and fast reflexes will help you become a values champion!',
      emoji: '🎮',
      isLocked: false,
      accentColor: ['#FF6B6B', '#FF8E53'],
    },
    {
      id: 'memory_card_game',
      title: 'Values Memory Match',
      shortDescription: 'Match values with their meanings!',
      description: 'Challenge your memory by matching Filipino values with their definitions. A fun way to learn and remember the important values that guide us every day.',
      emoji: '🎴',
      isLocked: false,
      accentColor: ['#4FACFE', '#00F2FE'],
    },
  ];

  const goBack = () => {
    router.back();
  };

  const openGameModal = (game: Game) => {
    if (game.isLocked) return;
    setSelectedGame(game);
    setShowGameModal(true);
  };

  const closeGameModal = () => {
    setShowGameModal(false);
    setTimeout(() => setSelectedGame(null), 300);
  };

  const playGame = () => {
    if (!selectedGame) return;
    
    closeGameModal();
    
    setTimeout(() => {
      if (selectedGame.id === 'good_vs_bad_catch') {
        router.push('/GoodVsBadCatchGame');
      } else if (selectedGame.id === 'memory_card_game') {
        router.push('/MemoryCardGame' as any);
      }
    }, 300);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4A5578', '#4A5578']}
        style={styles.gradientBackground}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.menuButton}>
              <View style={styles.menuButtonInner}>
                <Text style={styles.menuIcon}>☰</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationButton}>
              <Text style={styles.bellIcon}>🔔</Text>
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>3</Text>
              </View>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {/* Title */}
            <Text style={styles.pageTitle}>ESP Games</Text>

            {/* Games List */}
            <View style={styles.gamesList}>
              {games.map((game) => (
                <TouchableOpacity
                  key={game.id}
                  style={styles.gameItem}
                  onPress={() => openGameModal(game)}
                  disabled={game.isLocked}
                  activeOpacity={0.8}
                >
                  <View style={styles.gameItemInner}>
                    <View style={styles.gameIconWrapper}>
                      <View style={styles.gameIconBox}>
                        <Text style={styles.gameIconEmoji}>{game.emoji}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.gameItemContent}>
                      <Text style={styles.gameItemTitle}>{game.title}</Text>
                      <Text style={styles.gameItemDescription} numberOfLines={1}>
                        {game.shortDescription}
                      </Text>
                    </View>

                    <TouchableOpacity 
                      style={styles.playButtonSmall}
                      onPress={() => openGameModal(game)}
                    >
                      <LinearGradient
                        colors={['#E91E63', '#E91E63']}
                        style={styles.playButtonGradient}
                      >
                        <Text style={styles.playButtonTextSmall}>Play</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Coming Soon Items */}
              {[1, 2, 3].map((item) => (
                <View key={`coming-${item}`} style={[styles.gameItem, styles.gameItemLocked]}>
                  <View style={styles.gameItemInner}>
                    <View style={styles.gameIconWrapper}>
                      <View style={[styles.gameIconBox, styles.gameIconBoxLocked]}>
                        <Text style={styles.gameIconEmoji}>🎯</Text>
                      </View>
                    </View>
                    
                    <View style={styles.gameItemContent}>
                      <Text style={[styles.gameItemTitle, styles.gameItemTitleLocked]}>Coming Soon</Text>
                      <Text style={[styles.gameItemDescription, styles.gameItemDescriptionLocked]} numberOfLines={1}>
                        More games to unlock!
                      </Text>
                    </View>

                    <View style={[styles.playButtonSmall, styles.playButtonLocked]}>
                      <Text style={styles.lockIconSmall}>🔒</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Game Detail Modal */}
      <Modal
        visible={showGameModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeGameModal}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#4A5578', '#4A5578']}
            style={styles.modalGradient}
          >
            <SafeAreaView style={styles.modalSafeArea}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={closeGameModal} style={styles.backButtonModal}>
                  <View style={styles.backButtonModalInner}>
                    <Text style={styles.backButtonModalText}>←</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.notificationButtonModal}>
                  <Text style={styles.bellIcon}>🔔</Text>
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationCount}>3</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.modalContent}
                contentContainerStyle={styles.modalContentContainer}
                showsVerticalScrollIndicator={false}
              >
                {selectedGame && (
                  <>
                    {/* Game Icon Large */}
                    <View style={styles.modalIconContainer}>
                      <View style={styles.modalIconFrame}>
                        <LinearGradient
                          colors={selectedGame.accentColor as any}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.modalIconGradient}
                        >
                          <View style={styles.modalIconInner}>
                            <Text style={styles.modalIconEmoji}>{selectedGame.emoji}</Text>
                          </View>
                        </LinearGradient>
                      </View>
                    </View>

                    {/* Game Title */}
                    <Text style={styles.modalTitle}>{selectedGame.title}</Text>

                    {/* Game Description */}
                    <Text style={styles.modalDescription}>{selectedGame.description}</Text>

                    {/* Start Button */}
                    <TouchableOpacity 
                      style={styles.startButton}
                      onPress={playGame}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#E91E63', '#E91E63']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.startButtonGradient}
                      >
                        <Text style={styles.startButtonText}>Start</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                )}
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A5578',
  },
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 10,
  },
  menuButton: {
    width: 50,
    height: 50,
  },
  menuButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
    color: '#fff',
  },
  notificationButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E91E63',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  // CONTENT
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  // GAMES LIST
  gamesList: {
    paddingHorizontal: 20,
  },
  gameItem: {
    marginBottom: 15,
  },
  gameItemLocked: {
    opacity: 0.6,
  },
  gameItemInner: {
    backgroundColor: 'rgba(96, 111, 148, 0.6)',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameIconWrapper: {
    marginRight: 15,
  },
  gameIconBox: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameIconBoxLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  gameIconEmoji: {
    fontSize: 32,
  },
  gameItemContent: {
    flex: 1,
    marginRight: 12,
  },
  gameItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  gameItemTitleLocked: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  gameItemDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  gameItemDescriptionLocked: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  playButtonSmall: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  playButtonLocked: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  playButtonTextSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  lockIconSmall: {
    fontSize: 20,
  },
  // MODAL STYLES
  modalOverlay: {
    flex: 1,
  },
  modalGradient: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 10,
  },
  backButtonModal: {
    width: 50,
    height: 50,
  },
  backButtonModalInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonModalText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  notificationButtonModal: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  modalIconContainer: {
    marginTop: 30,
    marginBottom: 40,
  },
  modalIconFrame: {
    padding: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 80,
    borderWidth: 6,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  modalIconGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  modalIconInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalIconEmoji: {
    fontSize: 60,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  startButton: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  startButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
});
