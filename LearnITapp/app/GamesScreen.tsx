import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal,
  Animated,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNav from '../components/BottomNav';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface Game {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  emoji: string;
  isLocked: boolean;
  accentColor: [string, string];
  difficulty: string;
}

export default function GamesScreen() {
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showGameModal, setShowGameModal] = useState(false);

  // Animation values for each card
  const cardAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const games: Game[] = [
    {
      id: 'good_vs_bad_catch',
      title: 'Good vs. Bad Catch',
      shortDescription: 'Test your reflexes by catching good values!',
      description: 'An exciting arcade game where you catch falling good values while avoiding bad behaviors. Quick thinking and fast reflexes will help you become a values champion!',
      emoji: '🎮',
      isLocked: false,
      accentColor: ['rgba(255, 255, 255, 0.1)', 'rgba(74, 144, 226, 0.9)'],
      difficulty: 'Easy',
    },
    {
      id: 'memory_card_game',
      title: 'Values Memory Match',
      shortDescription: 'Match values with their meanings!',
      description: 'Challenge your memory by matching Filipino values with their definitions. A fun way to learn and remember the important values that guide us every day.',
      emoji: '🎴',
      isLocked: false,
      accentColor: ['rgba(255, 255, 255, 0.1)', 'rgba(52, 199, 89, 0.9)'],
      difficulty: 'Medium',
    },
    {
      id: 'values_word_scramble',
      title: 'Values Word Scramble',
      shortDescription: 'Unscramble Filipino values words!',
      description: 'Test your word skills by unscrambling Filipino values words. Use hints if you need help, and earn points for each correct answer. Can you complete all the words?',
      emoji: '🧩',
      isLocked: false,
      accentColor: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 149, 0, 0.9)'],
      difficulty: 'Medium',
    },
  ];

  useEffect(() => {
    // Animate cards on mount
    cardAnimations.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(index * 200),
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const handleGamePress = (game: Game) => {
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
      } else if (selectedGame.id === 'values_word_scramble') {
        router.push('/ValuesWordScramble' as any);
      }
    }, 300);
  };

  const goBack = () => {
    router.back();
  };

  return (
    <>
      <View style={styles.container}>
        {/* Logo */}
        <Image
          source={require("../assets/images/LandingLogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Back Button */}
        <TouchableOpacity onPress={goBack} style={styles.backButtonTop}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Mini Games</Text>
        <Text style={styles.subtitle}>Choose which game you'd like to play</Text>

        {/* Game Cards */}
        <ScrollView 
          contentContainerStyle={styles.cardsContainer}
          showsVerticalScrollIndicator={false}
        >
          {games.map((game, index) => (
            <Animated.View
              key={game.id}
              style={[
                styles.card,
                {
                  transform: [{ scale: cardAnimations[index] }],
                },
              ]}
            >
              <LinearGradient
                colors={game.accentColor}
                style={{ flex: 1, borderRadius: 15, overflow: "hidden" }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <TouchableOpacity
                  style={styles.cardTouchable}
                  onPress={() => handleGamePress(game)}
                  disabled={game.isLocked}
                >
                  <View style={styles.emojiContainer}>
                    <Text style={styles.cardEmoji}>{game.emoji}</Text>
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>{game.title}</Text>
                    <Text style={styles.cardDetails}>{game.difficulty}</Text>
                  </View>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          ))}

          {/* Coming Soon Cards */}
          {[1, 2].map((_, index) => (
            <View key={`coming-${index}`} style={styles.card}>
              <View style={styles.comingSoonCard}>
                <Text style={styles.comingSoonEmoji}>🔒</Text>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Game Details Modal */}
      <Modal
        visible={showGameModal}
        animationType="fade"
        transparent={true}
        onRequestClose={closeGameModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedGame && (
              <>
                <Text style={styles.modalEmoji}>{selectedGame.emoji}</Text>
                <Text style={styles.modalTitle}>{selectedGame.title}</Text>
                <Text style={styles.modalDescription}>{selectedGame.description}</Text>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={playGame}
                  >
                    <Text style={styles.playButtonText}>Play Now</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={closeGameModal}
                  >
                    <Text style={styles.cancelButtonText}>Maybe Later</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <BottomNav />
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  logo: { 
    width: screenWidth * 0.32, 
    height: screenHeight * 0.05, 
    marginTop: screenHeight * 0.05, 
    marginLeft: 20 
  },
  backButtonTop: {
    position: "absolute",
    right: 20,
    top: screenHeight * 0.055,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: 24,
    color: "#1D1D1F",
    fontWeight: "600",
  },
  title: {
    fontSize: screenWidth * 0.055,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginTop: 20,
    color: "#222",
  },
  subtitle: {
    fontSize: screenWidth * 0.035,
    marginHorizontal: 20,
    marginBottom: 15,
    color: "#7f7f7f",
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    width: "47%",
    height: screenHeight * 0.22,
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    position: "relative",
  },
  cardTouchable: { 
    flex: 1, 
    justifyContent: "flex-end" 
  },
  emojiContainer: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  cardEmoji: { 
    fontSize: 28,
  },
  textContainer: {
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  cardTitle: { 
    fontSize: screenWidth * 0.04, 
    color: "#fff", 
    fontWeight: "bold" 
  },
  cardDetails: { 
    fontSize: screenWidth * 0.03, 
    color: "#eee", 
    marginTop: 5 
  },
  comingSoonCard: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  comingSoonEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  comingSoonText: {
    fontSize: 14,
    color: "#6D6D80",
    fontWeight: "600",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
  },
  modalEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1D1D1F",
    marginBottom: 15,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 16,
    color: "#6D6D80",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 25,
  },
  modalButtons: {
    width: "100%",
    gap: 12,
  },
  playButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: "center",
  },
  playButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "#F2F2F7",
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#6D6D80",
    fontSize: 16,
    fontWeight: "600",
  },
});
