import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const BASKET_WIDTH = 80;
const BASKET_HEIGHT = 80;
const OBJECT_SIZE = 50;
const GAME_DURATION = 60000; // 60 seconds
const MAX_MISSES = 10;

interface FallingObject {
  id: string;
  x: number;
  y: Animated.Value;
  type: 'good' | 'bad';
  label: string;
  emoji: string;
  color: string;
}

const GOOD_VALUES = [
  { label: 'Respect', emoji: '🤝', color: '#10B981' },
  { label: 'Honesty', emoji: '✨', color: '#3B82F6' },
  { label: 'Kindness', emoji: '💝', color: '#8B5CF6' },
  { label: 'Helping', emoji: '🤗', color: '#06B6D4' },
  { label: 'Love', emoji: '❤️', color: '#EF4444' },
  { label: 'Hope', emoji: '🌟', color: '#F59E0B' },
  { label: 'Faith', emoji: '🙏', color: '#84CC16' },
  { label: 'Peace', emoji: '☮️', color: '#6366F1' },
];

const BAD_BEHAVIORS = [
  { label: 'Cheating', emoji: '🚫', color: '#DC2626' },
  { label: 'Bullying', emoji: '😠', color: '#991B1B' },
  { label: 'Lying', emoji: '🤥', color: '#7F1D1D' },
  { label: 'Disrespect', emoji: '👎', color: '#B91C1C' },
  { label: 'Hatred', emoji: '💢', color: '#DC2626' },
  { label: 'Anger', emoji: '😡', color: '#991B1B' },
  { label: 'Greed', emoji: '💰', color: '#B45309' },
  { label: 'Jealousy', emoji: '😤', color: '#059669' },
];

export default function GoodVsBadCatchGame() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'ended'>('intro');
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [fallingObjects, setFallingObjects] = useState<FallingObject[]>([]);
  const [goodCaught, setGoodCaught] = useState<string[]>([]);
  const [badAvoided, setBadAvoided] = useState<string[]>([]);
  const [showReflection, setShowReflection] = useState(false);
  const [characterState, setCharacterState] = useState<'idle' | 'left' | 'right'>('idle');
  
  const basketPosition = useRef(new Animated.Value(width / 2 - BASKET_WIDTH / 2)).current;
  const lastPosition = useRef(width / 2 - BASKET_WIDTH / 2);
  const gameLoopRef = useRef<number | null>(null);
  const spawnIntervalRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  // Pan responder for basket movement
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newX = Math.max(0, Math.min(width - BASKET_WIDTH, gestureState.moveX - BASKET_WIDTH / 2));
      basketPosition.setValue(newX);
      
      // Determine character direction based on movement
      if (newX > lastPosition.current + 5) {
        setCharacterState('right');
      } else if (newX < lastPosition.current - 5) {
        setCharacterState('left');
      }
      lastPosition.current = newX;
    },
    onPanResponderRelease: () => {
      // Return to idle when user stops moving
      setTimeout(() => setCharacterState('idle'), 200);
    },
  });

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setMisses(0);
    setTimeLeft(60);
    setFallingObjects([]);
    setGoodCaught([]);
    setBadAvoided([]);

    // Game timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Spawn objects
    spawnIntervalRef.current = setInterval(spawnObject, 1500);

    // Game loop for collision detection
    gameLoopRef.current = setInterval(checkCollisions, 50);
  };

  const spawnObject = () => {
    const isGood = Math.random() > 0.4; // 60% chance for good values
    const values = isGood ? GOOD_VALUES : BAD_BEHAVIORS;
    const selectedValue = values[Math.floor(Math.random() * values.length)];
    
    const newObject: FallingObject = {
      id: Date.now().toString() + Math.random(),
      x: Math.random() * (width - OBJECT_SIZE),
      y: new Animated.Value(-OBJECT_SIZE),
      type: isGood ? 'good' : 'bad',
      label: selectedValue.label,
      emoji: selectedValue.emoji,
      color: selectedValue.color,
    };

    setFallingObjects(prev => [...prev, newObject]);

    // Animate the object falling
    Animated.timing(newObject.y, {
      toValue: height + OBJECT_SIZE,
      duration: 4000,
      useNativeDriver: false,
    }).start(() => {
      // Object reached bottom without being caught
      if (newObject.type === 'good') {
        setMisses(prev => {
          const newMisses = prev + 1;
          if (newMisses >= MAX_MISSES) {
            endGame();
          }
          return newMisses;
        });
      } else {
        // Missing a bad behavior is actually good (avoided it)
        setBadAvoided(prev => [...prev, newObject.label]);
      }
      
      setFallingObjects(prev => prev.filter(obj => obj.id !== newObject.id));
    });
  };

  const checkCollisions = () => {
    setFallingObjects(prevObjects => {
      return prevObjects.filter(obj => {
        const objY = (obj.y as any)._value;
        const basketX = (basketPosition as any)._value;
        
        // Check if object is at basket level
        if (objY >= height - 150 && objY <= height - 100) {
          // Check horizontal collision
          if (obj.x >= basketX - OBJECT_SIZE / 2 && obj.x <= basketX + BASKET_WIDTH + OBJECT_SIZE / 2) {
            // Collision detected!
            if (obj.type === 'good') {
              setScore(prev => prev + 10);
              setGoodCaught(prev => [...prev, obj.label]);
            } else {
              setScore(prev => prev - 5);
            }
            return false; // Remove the object
          }
        }
        return true; // Keep the object
      });
    });
  };

  const endGame = () => {
    setGameState('ended');
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resetGame = () => {
    setGameState('intro');
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const showReflectionModal = () => {
    setShowReflection(true);
  };

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (gameState === 'intro') {
    return (
      <View style={styles.container}>
        <View style={styles.introContainer}>
          <Text style={styles.gameTitle}>🎮 Good vs. Bad Catch</Text>
          
          <View style={styles.lessonModal}>
            <Text style={styles.lessonTitle}>📖 ESP Lesson Reminder</Text>
            <Text style={styles.lessonText}>
              "In life, we face many choices. Learn to keep the good values and avoid the bad ones. 
              Your goal is to catch the good values while avoiding the bad behaviors!"
            </Text>
          </View>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>🕹️ How to Play:</Text>
            <Text style={styles.instructionText}>• Move the basket left and right</Text>
            <Text style={styles.instructionText}>• Catch good values (✅ +10 points)</Text>
            <Text style={styles.instructionText}>• Avoid bad behaviors (❌ -5 points)</Text>
            <Text style={styles.instructionText}>• Don't miss more than 10 good values!</Text>
            <Text style={styles.instructionText}>• Game lasts 60 seconds</Text>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>🚀 Start Game</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#6366F1" />
            <Text style={styles.backButtonText}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (gameState === 'playing') {
    return (
      <View style={styles.container}>
        {/* Game HUD */}
        <View style={styles.hud}>
          <Text style={styles.hudText}>Score: {score}</Text>
          <Text style={styles.hudText}>Time: {timeLeft}s</Text>
          <Text style={styles.hudText}>Misses: {misses}/{MAX_MISSES}</Text>
        </View>

        {/* Game Area */}
        <View style={styles.gameArea} {...panResponder.panHandlers}>
          {/* Falling Objects */}
          {fallingObjects.map(obj => (
            <Animated.View
              key={obj.id}
              style={[
                styles.fallingObject,
                {
                  left: obj.x,
                  top: obj.y,
                  backgroundColor: obj.color,
                }
              ]}
            >
              <Text style={styles.objectEmoji}>{obj.emoji}</Text>
              <Text style={styles.objectLabel}>{obj.label}</Text>
            </Animated.View>
          ))}

          {/* Character Catcher */}
          <Animated.View
            style={[
              styles.basket,
              {
                left: basketPosition,
                bottom: 100,
              }
            ]}
          >
            <Image
              source={require('../assets/goodvsbad/character.png')}
              style={[
                styles.characterImage,
                characterState === 'left' && { transform: [{ scaleX: -1 }] }
              ]}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Instructions */}
        <View style={styles.gameInstructions}>
          <Text style={styles.gameInstructionText}>Move the basket to catch good values! 🎯</Text>
        </View>
      </View>
    );
  }

  if (gameState === 'ended') {
    return (
      <View style={styles.container}>
        <View style={styles.resultsContainer}>
          <Text style={styles.gameOverTitle}>🎉 Game Complete!</Text>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.finalScore}>Final Score: {score}</Text>
            <Text style={styles.scoreDetail}>Good Values Caught: {goodCaught.length}</Text>
            <Text style={styles.scoreDetail}>Bad Behaviors Avoided: {badAvoided.length}</Text>
          </View>

          <View style={styles.valuesContainer}>
            <Text style={styles.valuesTitle}>✅ Values You Collected:</Text>
            <View style={styles.valuesList}>
              {goodCaught.map((value, index) => (
                <Text key={index} style={styles.valueItem}>• {value}</Text>
              ))}
            </View>
          </View>

          <Text style={styles.motivationalMessage}>
            {score >= 50 
              ? "🌟 Excellent! You chose kindness and good values! Remember, small actions matter."
              : score >= 20
              ? "👍 Good job! Keep practicing to make better choices in life."
              : "💪 Keep trying! Learning to choose good values takes practice."
            }
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.reflectionButton} onPress={showReflectionModal}>
              <Text style={styles.reflectionButtonText}>💭 Reflect</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.playAgainButton} onPress={resetGame}>
              <Text style={styles.playAgainButtonText}>🔄 Play Again</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#6366F1" />
            <Text style={styles.backButtonText}>Back to Games</Text>
          </TouchableOpacity>
        </View>

        {/* Reflection Modal */}
        <Modal visible={showReflection} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.reflectionModal}>
              <Text style={styles.reflectionTitle}>🤔 Time to Reflect</Text>
              <Text style={styles.reflectionQuestion}>
                What value do you think is most important in your daily life?
              </Text>
              
              <View style={styles.reflectionOptions}>
                {['Respect', 'Honesty', 'Kindness', 'Love', 'Faith'].map(value => (
                  <TouchableOpacity
                    key={value}
                    style={styles.reflectionOption}
                    onPress={() => {
                      Alert.alert(
                        'Great Choice! 🌟',
                        `${value} is indeed a wonderful value to live by. Keep practicing it in your daily life!`,
                        [{ text: 'OK', onPress: () => setShowReflection(false) }]
                      );
                    }}
                  >
                    <Text style={styles.reflectionOptionText}>{value}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setShowReflection(false)}
              >
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  introContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 30,
    textAlign: 'center',
  },
  lessonModal: {
    backgroundColor: '#EFF6FF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 12,
    textAlign: 'center',
  },
  lessonText: {
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
    textAlign: 'center',
  },
  instructionsContainer: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 6,
    paddingLeft: 10,
  },
  startButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  backButtonText: {
    color: '#6366F1',
    fontSize: 16,
    marginLeft: 8,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hudText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  fallingObject: {
    position: 'absolute',
    width: OBJECT_SIZE,
    height: OBJECT_SIZE,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  objectEmoji: {
    fontSize: 20,
  },
  objectLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  basket: {
    position: 'absolute',
    width: BASKET_WIDTH,
    height: BASKET_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  basketEmoji: {
    fontSize: 40,
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterEmoji: {
    fontSize: 50,
    marginBottom: -10,
  },
  basketIconSmall: {
    fontSize: 30,
  },
  characterImage: {
    width: BASKET_WIDTH,
    height: BASKET_HEIGHT,
  },
  gameInstructions: {
    padding: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
  },
  gameInstructionText: {
    fontSize: 16,
    color: '#92400E',
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 30,
    textAlign: 'center',
  },
  scoreContainer: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  finalScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 10,
  },
  scoreDetail: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  valuesContainer: {
    backgroundColor: '#ECFDF5',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
  },
  valuesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 12,
  },
  valuesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  valueItem: {
    fontSize: 14,
    color: '#047857',
    marginRight: 10,
    marginBottom: 4,
  },
  motivationalMessage: {
    fontSize: 16,
    color: '#1E293B',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  reflectionButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  reflectionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playAgainButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  playAgainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reflectionModal: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
  },
  reflectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  reflectionQuestion: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  reflectionOptions: {
    gap: 12,
    marginBottom: 20,
  },
  reflectionOption: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  reflectionOptionText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '600',
  },
  closeModalButton: {
    backgroundColor: '#64748B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});