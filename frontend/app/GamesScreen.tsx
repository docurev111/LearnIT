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
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNav from '../components/BottomNav';
import ErrorBoundary from '../components/ErrorBoundary';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Game interface for type safety
 */
interface Game {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  emoji: string;
  isLocked: boolean;
  accentColor: [string, string];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  route: string;
}

/**
 * GamesScreen Component
 * 
 * A consolidated games screen that displays all available educational mini-games
 * with proper animations, modal interactions, and navigation.
 * 
 * Features:
 * - Card-based game selection with animations
 * - Game details modal with descriptions
 * - Proper TypeScript interfaces
 * - Responsive design
 * - Error handling
 * 
 * @component
 */
export default function GamesScreen() {
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Animation values for each card
  const cardAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Modal animation
  const modalScale = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  /**
   * Game configuration with all available games
   */
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
      route: '/games/GoodVsBadCatchGame',
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
      route: '/games/MemoryCardGame',
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
      route: '/games/ValuesWordScramble',
    },
    {
      id: 'emotion_match',
      title: 'Emotion Match',
      shortDescription: 'Recognize emotions and respond with empathy!',
      description: 'A fast-paced game where you identify emotions in different situations and choose the best empathetic response. Perfect for developing pakikiramdam and emotional intelligence!',
      emoji: '💭',
      isLocked: false,
      accentColor: ['rgba(255, 255, 255, 0.1)', 'rgba(139, 92, 246, 0.9)'],
      difficulty: 'Medium',
      route: '/games/EmotionMatchGame',
    },
    {
      id: 'values_path_runner',
      title: 'Values Path Runner',
      shortDescription: 'Run and collect good values on your journey!',
      description: 'An endless runner where you jump to collect values and avoid obstacles. Test your reflexes and make good choices as you run through the path of life!',
      emoji: '🏃‍♂️',
      isLocked: false,
      accentColor: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 107, 157, 0.9)'],
      difficulty: 'Hard',
      route: '/games/ValuesPathRunner',
    },
  ];

  /**
   * Initialize component and animate cards
   */
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setIsInitializing(true);
        setError(null);
        
        // Simulate initialization delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Animate cards
        cardAnimations.forEach((anim, index) => {
          Animated.sequence([
            Animated.delay(index * 150),
            Animated.spring(anim, {
              toValue: 1,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }),
          ]).start();
        });
        
        setIsInitializing(false);
      } catch (err) {
        console.error('Error initializing GamesScreen:', err);
        setError('Failed to initialize games. Please try again.');
        setIsInitializing(false);
      }
    };

    initializeComponent();
  }, []);

  /**
   * Animate modal when showing/hiding
   */
  useEffect(() => {
    if (showGameModal) {
      Animated.parallel([
        Animated.spring(modalScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalScale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showGameModal]);

  /**
   * Handle game card press
   */
  const handleGamePress = (game: Game) => {
    if (game.isLocked || isLoading) return;
    setSelectedGame(game);
    setShowGameModal(true);
  };

  /**
   * Close game modal
   */
  const closeGameModal = () => {
    setShowGameModal(false);
    setTimeout(() => setSelectedGame(null), 300);
  };

  /**
   * Navigate to selected game
   */
  const playGame = async () => {
    if (!selectedGame || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    closeGameModal();
    
    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Validate route exists
      if (!selectedGame.route) {
        throw new Error('Game route not found');
      }
      
      router.push(selectedGame.route as any);
    } catch (error) {
      console.error('Error navigating to game:', error);
      setError(`Failed to start ${selectedGame.title}. Please try again.`);
      
      // Show error alert
      Alert.alert(
        'Navigation Error',
        `Unable to start ${selectedGame.title}. Please try again.`,
        [
          { text: 'OK', onPress: () => setError(null) }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Navigate back to previous screen
   */
  const goBack = () => {
    router.back();
  };

  /**
   * Get difficulty color based on difficulty level
   */
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <ErrorBoundary>
        <LoadingSpinner 
          message="Loading games..." 
          showIcon={true}
          iconName="game-controller-outline"
        />
      </ErrorBoundary>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <ErrorBoundary>
        <View style={styles.container}>
          <ErrorMessage
            message={error}
            title="Games Error"
            onRetry={() => {
              setError(null);
              setIsInitializing(true);
            }}
            type="error"
          />
        </View>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../assets/images/LandingLogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Mini Games</Text>
          <Text style={styles.subtitle}>Choose which game you'd like to play</Text>
        </View>

        {/* Games Grid */}
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
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <TouchableOpacity
                  style={styles.cardTouchable}
                  onPress={() => handleGamePress(game)}
                  disabled={game.isLocked || isLoading}
                  activeOpacity={0.8}
                >
                  {/* Game Icon */}
                  <View style={styles.emojiContainer}>
                    {game.id === 'values_path_runner' ? (
                      <Image 
                        source={require('../assets/valuespathrunner/run_16.gif')}
                        style={styles.cardGif}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.cardEmoji}>{game.emoji}</Text>
                    )}
                  </View>

                  {/* Game Info */}
                  <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>{game.title}</Text>
                    <View style={styles.difficultyContainer}>
                      <View 
                        style={[
                          styles.difficultyBadge, 
                          { backgroundColor: getDifficultyColor(game.difficulty) }
                        ]}
                      >
                        <Text style={styles.difficultyText}>{game.difficulty}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Game Details Modal */}
      <Modal
        visible={showGameModal}
        animationType="fade"
        transparent={true}
        onRequestClose={closeGameModal}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity: modalOpacity }
          ]}
        >
          <Animated.View 
            style={[
              styles.modalContent,
              { transform: [{ scale: modalScale }] }
            ]}
          >
            {selectedGame && (
              <>
                {/* Game Icon */}
                <View style={styles.modalIconContainer}>
                  {selectedGame.id === 'values_path_runner' ? (
                    <Image 
                      source={require('../assets/valuespathrunner/run_16.gif')}
                      style={styles.modalGif}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.modalEmoji}>{selectedGame.emoji}</Text>
                  )}
                </View>

                {/* Game Title */}
                <Text style={styles.modalTitle}>{selectedGame.title}</Text>

                {/* Difficulty Badge */}
                <View style={styles.modalDifficultyContainer}>
                  <View 
                    style={[
                      styles.modalDifficultyBadge, 
                      { backgroundColor: getDifficultyColor(selectedGame.difficulty) }
                    ]}
                  >
                    <Text style={styles.modalDifficultyText}>{selectedGame.difficulty}</Text>
                  </View>
                </View>

                {/* Game Description */}
                <Text style={styles.modalDescription}>{selectedGame.description}</Text>
                
                {/* Action Buttons */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={playGame}
                    disabled={isLoading}
                  >
                    <Text style={styles.playButtonText}>
                      {isLoading ? 'Loading...' : 'Play Now'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={closeGameModal}
                    disabled={isLoading}
                  >
                    <Text style={styles.cancelButtonText}>Maybe Later</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </Animated.View>
      </Modal>

        {/* Bottom Navigation */}
        <BottomNav />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: screenHeight * 0.05,
    paddingBottom: 10,
  },
  logo: { 
    width: screenWidth * 0.32, 
    height: screenHeight * 0.05,
  },
  backButton: {
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
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: screenWidth * 0.055,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: screenWidth * 0.035,
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
  cardGradient: {
    flex: 1,
    borderRadius: 15,
    overflow: "hidden",
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
  cardGif: {
    width: 40,
    height: 40,
  },
  textContainer: {
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  cardTitle: { 
    fontSize: screenWidth * 0.04, 
    color: "#fff", 
    fontWeight: "bold",
    marginBottom: 5,
  },
  difficultyContainer: {
    flexDirection: 'row',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
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
  modalIconContainer: {
    marginBottom: 15,
  },
  modalEmoji: {
    fontSize: 60,
  },
  modalGif: {
    width: 80,
    height: 80,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1D1D1F",
    marginBottom: 10,
    textAlign: "center",
  },
  modalDifficultyContainer: {
    marginBottom: 15,
  },
  modalDifficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalDifficultyText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
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