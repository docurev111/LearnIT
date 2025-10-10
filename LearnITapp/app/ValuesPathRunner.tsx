import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Image,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const GROUND_HEIGHT = 105;
const CHARACTER_SIZE = 50;
const ITEM_SIZE = 50;
const OBSTACLE_WIDTH = 50;
const OBSTACLE_HEIGHT = 60;
const JUMP_HEIGHT = 150;
const GAME_SPEED = 5;
const SPAWN_INTERVAL = 1500; // 1.5 seconds

interface GameObject {
  id: string;
  x: number;
  y: number;
  type: 'value' | 'obstacle';
  label: string;
  emoji: string;
  color: string;
  floatAnim?: Animated.Value; // Added for floating animation
}

const GOOD_VALUES = [
  { label: 'Respect', emoji: '🤝', color: '#10B981' },
  { label: 'Honesty', emoji: '✨', color: '#3B82F6' },
  { label: 'Kindness', emoji: '💝', color: '#8B5CF6' },
  { label: 'Love', emoji: '❤️', color: '#EF4444' },
  { label: 'Hope', emoji: '🌟', color: '#F59E0B' },
  { label: 'Faith', emoji: '🙏', color: '#84CC16' },
];

const BAD_OBSTACLES = [
  { label: 'Lies', emoji: '🚫', color: '#DC2626' },
  { label: 'Anger', emoji: '😡', color: '#991B1B' },
  { label: 'Greed', emoji: '💰', color: '#B45309' },
  { label: 'Envy', emoji: '😤', color: '#059669' },
];

export default function ValuesPathRunner() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'ended'>('intro');
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [lives, setLives] = useState(3);
  const [valuesCollected, setValuesCollected] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const [gameAreaHeight, setGameAreaHeight] = useState<number>(0);
  const [gameAreaMeasured, setGameAreaMeasured] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  
  const characterY = useRef(new Animated.Value(0)).current;
  const characterYValue = useRef(0);
  const gameLoopRef = useRef<any>(null);
  const spawnTimerRef = useRef<any>(null);
  const distanceTimerRef = useRef<any>(null);

  // Animation values for welcome screen
  const valuesOpacity = useRef(new Animated.Value(0)).current;
  const pathRunnerOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Keep a JS-side copy of characterY since useNativeDriver doesn't update _value reliably
    const listenerId = characterY.addListener(({ value }) => {
      characterYValue.current = value;
    });
    return () => {
      characterY.removeAllListeners();
    };
  }, [characterY]);

  useEffect(() => {
    if (gameState === 'intro') {
      // Fade in VALUES first
      Animated.timing(valuesOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        // Then fade in PATH RUNNER after VALUES
        Animated.timing(pathRunnerOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      });

      // Button pulsing animation (continuous loop)
      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonScale, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(buttonScale, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    if (gameState === 'playing' && gameAreaMeasured) {
      startGame();
    }
    return () => {
      cleanup();
    };
  }, [gameState, gameAreaMeasured]);

  const startGame = () => {
    setScore(0);
    setDistance(0);
    setLives(3);
    setValuesCollected(0);
    setGameObjects([]);
    
    // Start spawning objects
    spawnTimerRef.current = setInterval(spawnObject, SPAWN_INTERVAL);
    
    // Start game loop
    gameLoopRef.current = setInterval(gameLoop, 16); // ~60fps

    // Distance counter
    distanceTimerRef.current = setInterval(() => {
      setDistance(prev => prev + 1);
    }, 100);
  };

  const cleanup = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    if (distanceTimerRef.current) clearInterval(distanceTimerRef.current);
  };

  const spawnObject = () => {
    const isValue = Math.random() > 0.5;

    if (isValue) {
      const value = GOOD_VALUES[Math.floor(Math.random() * GOOD_VALUES.length)];
      // 🌤️ Spawn near the character's jump apex within the game area so it's reachable
      const groundTop = gameAreaHeight - GROUND_HEIGHT;
      const baseCharTop = groundTop - CHARACTER_SIZE;
      const targetY = baseCharTop - (JUMP_HEIGHT - 10);
      const yPos = targetY + (Math.random() * 40 - 20); // small variance around apex

      // 🪶 Floating animation (subtle and slow)
      const floatAnim = new Animated.Value(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -10,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      const newObject: GameObject = {
        id: Date.now().toString() + Math.random(),
        x: width + 50,
        y: yPos,
        type: 'value',
        label: value.label,
        emoji: value.emoji,
        color: value.color,
        floatAnim,
      };
      setGameObjects(prev => [...prev, newObject]);
    } else {
      const obstacle = BAD_OBSTACLES[Math.floor(Math.random() * BAD_OBSTACLES.length)];
      // 🟫 Spawn on the ground within the game area
      const groundTop = gameAreaHeight - GROUND_HEIGHT;
      const yPos = groundTop - OBSTACLE_HEIGHT;
      const newObject: GameObject = {
        id: Date.now().toString() + Math.random(),
        x: width + 50,
        y: yPos,
        type: 'obstacle',
        label: obstacle.label,
        emoji: obstacle.emoji,
        color: obstacle.color,
      };
      setGameObjects(prev => [...prev, newObject]);
    }
  };

  const gameLoop = () => {
    setGameObjects(prevObjects => {
      const updated = prevObjects.map(obj => ({
        ...obj,
        x: obj.x - GAME_SPEED,
      }));

      const characterX = 80;
      const groundTop = gameAreaHeight - GROUND_HEIGHT;
      const baseCharTop = groundTop - CHARACTER_SIZE;
      const charY = baseCharTop - characterYValue.current;

      updated.forEach(obj => {
        if (obj.type === 'value') {
          const objWidth = ITEM_SIZE;
          const objHeight = ITEM_SIZE;

          const horizontalOverlap =
            obj.x < characterX + CHARACTER_SIZE && obj.x + objWidth > characterX;

          if (horizontalOverlap) {
            // 🟢 Only collect if character's center is close in Y (needs to jump)
            const objCenterY = obj.y + objHeight / 2;
            const charCenterY = charY + CHARACTER_SIZE / 2;
            if (Math.abs(objCenterY - charCenterY) < 35) {
              setScore(prev => prev + 10);
              setValuesCollected(prev => prev + 1);
              obj.x = -1000;
            }
          }
        } else {
          // Obstacle hitbox aligned to emoji position (tighter hitbox to avoid false positives)
          const hitboxWidth = 46;
          const hitboxHeight = 24;
          const hitboxX = obj.x + (OBSTACLE_WIDTH - hitboxWidth) / 2; // Center horizontally
          const hitboxY = obj.y + (OBSTACLE_HEIGHT - hitboxHeight) / 2; // Center vertically

          const horizontalOverlap =
            hitboxX < characterX + CHARACTER_SIZE && hitboxX + hitboxWidth > characterX;

          if (horizontalOverlap) {
            // 🔴 Obstacle collision only if vertical ranges overlap (character not clearly above)
            const charBottom = charY + CHARACTER_SIZE;
            const hitboxBottom = hitboxY + hitboxHeight;
            const verticalOverlap = charBottom > hitboxY && charY < hitboxBottom;
            if (verticalOverlap) {
              setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) endGame();
                return newLives;
              });
              obj.x = -1000;
            }
          }
        }
      });

      return updated.filter(obj => obj.x > -100);
    });
  };

  const jump = () => {
    if (isJumping) return;
    
    setIsJumping(true);
    
    Animated.sequence([
      Animated.timing(characterY, {
        toValue: JUMP_HEIGHT,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(characterY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsJumping(false);
    });
  };

  const endGame = () => {
    setGameState('ended');
    cleanup();
  };

  const resetGame = () => {
    setGameState('intro');
    cleanup();
  };

  // INTRO SCREEN
  if (gameState === 'intro') {
    return (
      <>
        <View style={styles.container}>
          <ImageBackground 
          source={require('../assets/valuespathrunner/welcomescreen/bgimage.png')}
          style={styles.welcomeBackground}
          resizeMode="cover"
        >
          <View style={styles.welcomeContainer}>
            {/* Trophy at top */}
            <View style={styles.topSection}>
              <Image 
                source={require('../assets/valuespathrunner/welcomescreen/trophy.png')}
                style={styles.trophyImage}
                resizeMode="contain"
              />
            </View>

            {/* Middle section with titles and buttons */}
            <View style={styles.middleSection}>
              {/* Values Text - Fade in first */}
              <Animated.Image 
                source={require('../assets/valuespathrunner/welcomescreen/valuestext.png')}
                style={[styles.valuesTextImage, { opacity: valuesOpacity }]}
                resizeMode="contain"
              />

              {/* Path Runner Title - Fade in after VALUES */}
              <Animated.Image 
                source={require('../assets/valuespathrunner/welcomescreen/pathrunner.png')}
                style={[styles.pathRunnerImage, { opacity: pathRunnerOpacity }]}
                resizeMode="contain"
              />

              {/* Start Button - below Path Runner with pulse animation */}
              <TouchableOpacity 
                style={styles.welcomeStartButton} 
                onPress={() => {
                  console.log('START button pressed');
                  setGameState('playing');
                }}
                activeOpacity={0.8}
              >
                <Animated.Image 
                  source={require('../assets/valuespathrunner/welcomescreen/startbutton.png')}
                  style={[styles.startButtonImage, { transform: [{ scale: buttonScale }] }]}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              {/* Back Button - below Start with pulse animation */}
              <TouchableOpacity 
                style={styles.welcomeBackButtonBottom} 
                onPress={() => {
                  console.log('BACK button pressed');
                  router.push('/GamesScreen');
                }}
                activeOpacity={0.8}
              >
                <Animated.Image 
                  source={require('../assets/valuespathrunner/welcomescreen/backbutton.png')}
                  style={[styles.backButtonImageBottom, { transform: [{ scale: buttonScale }] }]}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              {/* How to Play - below Back with pulse animation */}
              <TouchableOpacity 
                style={styles.howToPlayButton} 
                onPress={() => {
                  setShowHowToPlay(true);
                }}
                activeOpacity={0.8}
              >
                <Animated.Image 
                  source={require('../assets/valuespathrunner/welcomescreen/howtoplay.png')}
                  style={[styles.howToPlayImage, { transform: [{ scale: buttonScale }] }]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
        </View>

        {/* How to Play Modal */}
        {showHowToPlay && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Image 
                source={require('../assets/valuespathrunner/welcomescreen/howtoplaytext.png')}
                style={styles.howToPlayTextImage}
                resizeMode="contain"
              />
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowHowToPlay(false)}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={30} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </>
    );
  }

  // PLAYING SCREEN
  if (gameState === 'playing') {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#87CEEB', '#E0F6FF']} style={styles.gameBackground}>
          {/* HUD */}
          <View style={styles.hud}>
            <View style={styles.hudLeft}>
              <Text style={styles.hudLabel}>Score</Text>
              <Text style={styles.hudValue}>{score}</Text>
            </View>
            <View style={styles.hudCenter}>
              <Text style={styles.hudLabel}>Distance</Text>
              <Text style={styles.hudValue}>{distance}m</Text>
            </View>
            <View style={styles.hudRight}>
              <Text style={styles.hudLabel}>Lives</Text>
              <View style={styles.livesContainer}>
                {[...Array(3)].map((_, i) => (
                  <Text key={i} style={styles.heart}>
                    {i < lives ? '❤️' : '🖤'}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          {/* Game Area */}
          <TouchableOpacity
            style={styles.gameArea}
            activeOpacity={1}
            onPress={jump}
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              if (h && h !== gameAreaHeight) {
                setGameAreaHeight(h);
                setGameAreaMeasured(true);
              }
            }}
          >
            {/* Debug: Show game object count */}
            {gameObjects.length > 0 && (
              <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 5, borderRadius: 5 }}>
                <Text style={{ color: 'white', fontSize: 12 }}>Objects: {gameObjects.length}</Text>
              </View>
            )}

            {/* Ground/Platform with trees and clouds */}
            <View style={styles.ground}>
              {/* Trees and clouds background - above platform */}
              <Image
                source={require('../assets/valuespathrunner/welcomescreen/treesandclouds.png')}
                style={styles.treesAndClouds}
                resizeMode="cover"
              />
              
              {/* Static platform at bottom */}
              <Image
                source={require('../assets/valuespathrunner/welcomescreen/platform1.png')}
                style={styles.platform}
                resizeMode="cover"
              />
            </View>

            {/* Game Objects */}
            {gameObjects.map(obj => (
              <Animated.View
                key={obj.id}
                style={[
                  obj.type === 'value' ? styles.valueItem : styles.obstacleItem,
                  {
                    left: obj.x,
                    top: obj.y,
                    backgroundColor: obj.color,
                    transform: obj.floatAnim ? [{ translateY: obj.floatAnim }] : [],
                  },
                ]}
              >
                <Text style={obj.type === 'value' ? styles.valueEmoji : styles.obstacleEmoji}>
                  {obj.emoji}
                </Text>
              </Animated.View>
            ))}

            {/* Character */}
            <Animated.View
              style={[
                styles.character,
                {
                  bottom: GROUND_HEIGHT,
                  transform: [{ translateY: Animated.multiply(characterY, -1) }],
                },
              ]}
            >
              <Image
                key={isJumping ? 'jump' : 'run'}
                source={
                  isJumping
                    ? require('../assets/valuespathrunner/jump_1.gif')
                    : require('../assets/valuespathrunner/run_16.gif')
                }
                style={styles.characterImage}
                resizeMode="contain"
                fadeDuration={0}
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Instruction */}
          <View style={styles.instructionBar}>
            <Text style={styles.instructionText}>TAP to JUMP! 👆</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // END GAME SCREEN
  if (gameState === 'ended') {
    const rating = score >= 100 ? '🌟 Excellent!' : score >= 50 ? '👍 Good Job!' : '💪 Keep Trying!';
    
    return (
      <LinearGradient colors={['#FF6B9D', '#C06C84']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.endContainer}>
          <Text style={styles.gameOverTitle}>🏁 Tapos ang Paglalakbay!</Text>
          
          <View style={styles.finalScoreCard}>
            <Text style={styles.finalScoreLabel}>Final Score:</Text>
            <Text style={styles.finalScoreValue}>{score}</Text>
            <Text style={styles.ratingText}>{rating}</Text>
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>📊 Estatistika:</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>📏 Distansya:</Text>
              <Text style={styles.statValue}>{distance} meters</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>⭐ Mga Halagang Nakolekta:</Text>
              <Text style={styles.statValue}>{valuesCollected}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>🎯 Average Score:</Text>
              <Text style={styles.statValue}>{distance > 0 ? Math.round(score / distance * 10) : 0} pts/10m</Text>
            </View>
          </View>

          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>💭 Aral ng Laro:</Text>
            <Text style={styles.messageText}>
              {score >= 100
                ? 'Napakagaling! Marunong kang pumili ng tamang landas at kolektahin ang mga mabubuting halaga. Sa buhay, gawin mo rin ito - piliin ang tama at iwasan ang mali!'
                : score >= 50
                ? 'Maganda ang simula! Patuloy mong sanayin ang iyong sarili na mabilis na makakita ng oportunidad at iwasan ang mga hadlang sa buhay.'
                : 'Huwag sumuko! Ang buhay ay puno ng pagsubok. Ang mahalaga ay patuloy kang sumusubok at natututo sa bawat pagkakamali. Subukan muli!'}
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.playAgainButton} onPress={resetGame}>
              <Text style={styles.playAgainButtonText}>🔄 Maglaro Muli</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
            <Text style={styles.backButtonText}>Bumalik sa Games</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameBackground: {
    flex: 1,
  },
  introContainer: {
    padding: 20,
    alignItems: 'center',
    paddingTop: 60,
  },
  welcomeBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trophyImage: {
    width: 60,
    height: 150,
    marginBottom: 120,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  pathRunnerImage: {
    width: 100,
    height: 70,
  },
  valuesTextImage: {
    width: 240,
    height: 60,
    marginTop: -180,
    marginBottom: -40,
  },
  welcomeStartButton: {
    marginTop: -25,
  },
  startButtonImage: {
    width: 90,
    height: 60,
    marginBottom: -45,
  },
  welcomeBackButtonBottom: {
    zIndex: 10,
  },
  backButtonImageBottom: {
    width: 90,
    height: 60,
    marginTop: -10,
  },
  howToPlayButton: {
  },
  howToPlayImage: {
    width: 120,
    height: 180,
    marginTop: -110,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 30,
    gap: 10,
  },
  gameTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFE5EC',
    marginBottom: 30,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  lessonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C06C84',
    marginBottom: 12,
    textAlign: 'center',
  },
  lessonText: {
    fontSize: 15,
    color: '#1E293B',
    lineHeight: 24,
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  instructionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  instructionItem: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
    paddingLeft: 5,
  },
  tipsCard: {
    backgroundColor: 'rgba(255, 235, 59, 0.2)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
    borderWidth: 2,
    borderColor: 'rgba(255, 235, 59, 0.5)',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  tipItem: {
    fontSize: 13,
    color: '#fff',
    marginBottom: 6,
  },
  startButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  hudLeft: {
    alignItems: 'flex-start',
  },
  hudCenter: {
    alignItems: 'center',
  },
  hudRight: {
    alignItems: 'flex-end',
  },
  hudLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  hudValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  livesContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  heart: {
    fontSize: 16,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  character: {
    position: 'absolute',
    left: 80,
    width: CHARACTER_SIZE,
    height: CHARACTER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  characterEmoji: {
    fontSize: 40,
  },
  characterImage: {
    width: CHARACTER_SIZE + 20,
    height: CHARACTER_SIZE + 20,
  },
  valueItem: {
    position: 'absolute',
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  valueEmoji: {
    fontSize: 32,
  },
  obstacleItem: {
    position: 'absolute',
    width: OBSTACLE_WIDTH,
    height: OBSTACLE_HEIGHT,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    borderWidth: 3,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 5,
    // Removed transform to avoid visual conflicts
  },
  obstacleEmoji: {
    fontSize: 36,
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: GROUND_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  treesAndClouds: {
    position: 'absolute',
    bottom: 100, // Position above platform
    left: 0,
    right: 0,
    width: '100%',
    height: 110,
  },
  platform: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 100, // Platform height
  },
  groundLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#654321',
  },
  groundText: {
    fontSize: 20,
    opacity: 0.5,
  },
  instructionBar: {
    backgroundColor: 'rgba(255, 107, 157, 0.9)',
    padding: 12,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  endContainer: {
    padding: 20,
    alignItems: 'center',
    paddingTop: 60,
  },
  gameOverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  finalScoreCard: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  finalScoreLabel: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 8,
  },
  finalScoreValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 20,
    color: '#10B981',
    fontWeight: 'bold',
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 15,
    color: '#475569',
  },
  statValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  messageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    width: '100%',
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C06C84',
    marginBottom: 12,
  },
  messageText: {
    fontSize: 15,
    color: '#1E293B',
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  playAgainButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 4,
  },
  playAgainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    position: 'relative',
    width: width * 0.9,
    maxWidth: 400,
  },
  howToPlayTextImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
  },
  closeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#EF4444',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
