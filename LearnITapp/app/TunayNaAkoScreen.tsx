import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Animated,
  Alert,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

interface IdentityQuestion {
  id: number;
  question: string;
  options: string[];
  values: { [key: string]: string }; // Maps option to character trait
  category: 'strength' | 'values' | 'goals' | 'personality';
}

interface IdentityResult {
  strengths: string[];
  values: string[];
  personality: string[];
  goalType: string;
}

export default function TunayNaAkoScreen() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [identityResult, setIdentityResult] = useState<IdentityResult | null>(null);
  const [gamePhase, setGamePhase] = useState<'intro' | 'questions' | 'results'>('intro');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulsing animation for buttons
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [gamePhase]);

  const gameScenarios: IdentityQuestion[] = [
    {
      id: 1,
      question: "🏫 Sa school cafeteria, nakita mo ang classmate mo na nag-iisa at mukhang malungkot. Ano ang gagawin mo?",
      options: [
        "💭 Tignan ko muna kung okay siya bago lumapit",
        "🤝 Lapitan ko agad at tanungin kung pwede sumama sa kanya", 
        "🎨 Gumawa ako ng funny drawing para mapangiti siya",
        "🍎 Ibahagi ko yung baon ko at makipag-usap"
      ],
      values: {
        "💭 Tignan ko muna kung okay siya bago lumapit": "Thoughtful Observer",
        "🤝 Lapitan ko agad at tanungin kung pwede sumama sa kanya": "Social Connector",
        "🎨 Gumawa ako ng funny drawing para mapangiti siya": "Creative Helper",
        "🍎 Ibahagi ko yung baon ko at makipag-usap": "Caring Friend"
      },
      category: 'personality'
    },
    {
      id: 2,
      question: "⚡ Group project deadline bukas na! Ang team leader ay hindi pa nagsisimula. Ano ang action mo?",
      options: [
        "👑 Kunin ko ang lead at mag-organize ng tasks para sa lahat",
        "📚 Mag-research ako ng maraming info para sa project",
        "🎪 Gumawa ako ng creative presentation para magmukhang maganda",
        "🤗 Tumulong ako sa lahat ng kailangan nila"
      ],
      values: {
        "👑 Kunin ko ang lead at mag-organize ng tasks para sa lahat": "Natural Leader",
        "📚 Mag-research ako ng maraming info para sa project": "Knowledge Seeker", 
        "🎪 Gumawa ako ng creative presentation para magmukhang maganda": "Creative Innovator",
        "🤗 Tumulong ako sa lahat ng kailangan nila": "Team Player"
      },
      category: 'strength'
    },
    {
      id: 3,
      question: "💔 Ang best friend mo ay nagsinungaling sa'yo tungkol sa isang importante. Paano mo ito haharapin?",
      options: [
        "💯 Confrontin ko siya directly - honesty is everything!",
        "💪 Hindi ko siya iiwan - friendship comes first",
        "😄 Try ko pa rin maging masaya para hindi awkward",
        "🤝 Pag-usapan namin ito nang maayos para sa trust"
      ],
      values: {
        "💯 Confrontin ko siya directly - honesty is everything!": "Katapatan",
        "💪 Hindi ko siya iiwan - friendship comes first": "Loyalty",
        "😄 Try ko pa rin maging masaya para hindi awkward": "Positivity",
        "🤝 Pag-usapan namin ito nang maayos para sa trust": "Trust Builder"
      },
      category: 'values'
    },
    {
      id: 4,
      question: "🌪️ Biglaang problem: Hindi ka makakaattend ng birthday ng kaibigan mo dahil may family emergency. Ano ang gagawin mo?",
      options: [
        "🧠 Mag-isip muna ng best solution bago mag-decide",
        "📞 Tawagan ko agad ang family at friends para sa advice",
        "🏃‍♂️ Gawin ko agad yung naisip ko na solution",
        "🙏 Magdasal muna at mag-reflect kung ano ang tama"
      ],
      values: {
        "🧠 Mag-isip muna ng best solution bago mag-decide": "Strategic Thinker",
        "📞 Tawagan ko agad ang family at friends para sa advice": "Community Oriented",
        "🏃‍♂️ Gawin ko agad yung naisip ko na solution": "Quick Decider",
        "🙏 Magdasal muna at mag-reflect kung ano ang tama": "Spiritual Guide"
      },
      category: 'personality'
    },
    {
      id: 5,
      question: "✨ Flash forward 10 years: Anong version of yourself ang makikita mo sa future?",
      options: [
        "🏆 CEO/Boss ng sariling business - successful sa career!",
        "👨‍👩‍👧‍👦 May masayang pamilya at mga anak na proud sa'kin",
        "🌍 Tumutulong sa community - may impact sa bansa",
        "⭐ Kilala sa buong mundo sa ginagawa ko"
      ],
      values: {
        "🏆 CEO/Boss ng sariling business - successful sa career!": "Achievement Seeker",
        "👨‍👩‍👧‍👦 May masayang pamilya at mga anak na proud sa'kin": "Family Builder",
        "🌍 Tumutulong sa community - may impact sa bansa": "World Changer",
        "⭐ Kilala sa buong mundo sa ginagawa ko": "Fame Seeker"
      },
      category: 'goals'
    }
  ];

  const startGame = () => {
    setGamePhase('questions');
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAnswer = (option: string, optionIndex: number) => {
    setSelectedOption(optionIndex);
    
    // Brief pause to show selection feedback
    setTimeout(() => {
      const newAnswers = { ...answers, [currentQuestionIndex]: option };
      setAnswers(newAnswers);
      setSelectedOption(null);

      if (currentQuestionIndex < gameScenarios.length - 1) {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Calculate results
        calculateIdentityResult(newAnswers);
      }
    }, 300);
  };

  const calculateIdentityResult = (finalAnswers: { [key: number]: string }) => {
    const strengths: string[] = [];
    const values: string[] = [];
    const personality: string[] = [];
    let goalType = "Balanced";

    gameScenarios.forEach((question, index) => {
      const answer = finalAnswers[index];
      const trait = question.values[answer];
      
      if (question.category === 'strength') {
        strengths.push(trait);
      } else if (question.category === 'values') {
        values.push(trait);
      } else if (question.category === 'personality') {
        personality.push(trait);
      } else if (question.category === 'goals') {
        goalType = trait;
      }
    });

    const result: IdentityResult = {
      strengths,
      values,
      personality,
      goalType
    };

    setIdentityResult(result);
    setGamePhase('results');
    
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const restartGame = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIdentityResult(null);
    setGamePhase('intro');
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderIntro = () => (
    <Animated.View style={[
      styles.contentContainer,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      {/* Animated Character Avatar */}
      <Animated.View style={[styles.avatarContainer, { 
        transform: [{ 
          scale: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          })
        }] 
      }]}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>🧑‍🎓</Text>
          <View style={styles.avatarPulse} />
        </View>
        <Text style={styles.avatarText}>Ikaw</Text>
      </Animated.View>

      <View style={styles.heroSection}>
        <Text style={styles.gameTitle}>🪞 Tunay na Ako</Text>
        <Text style={styles.gameSubtitle}>Identity Adventure Game</Text>
        <View style={styles.gameDescriptionBox}>
          <Text style={styles.gameDescription}>
            Sumama sa isang exciting adventure para matuklasan ang inyong tunay na pagkatao! 
          </Text>
          <Text style={styles.gameDescriptionSub}>
            5 challenges • Personalized results • ESP Grade 7
          </Text>
        </View>
      </View>
      
      <View style={styles.gameFeatures}>
        <View style={styles.featureCard}>
          <View style={styles.featureIconContainer}>
            <Text style={styles.featureIcon}>💪</Text>
          </View>
          <Text style={styles.featureTitle}>Strengths</Text>
          <Text style={styles.featureDesc}>Tuklasin ang inyong mga kakayahan</Text>
        </View>
        <View style={styles.featureCard}>
          <View style={styles.featureIconContainer}>
            <Text style={styles.featureIcon}>❤️</Text>
          </View>
          <Text style={styles.featureTitle}>Values</Text>
          <Text style={styles.featureDesc}>Alamin ang inyong mga paniniwala</Text>
        </View>
        <View style={styles.featureCard}>
          <View style={styles.featureIconContainer}>
            <Text style={styles.featureIcon}>🎯</Text>
          </View>
          <Text style={styles.featureTitle}>Goals</Text>
          <Text style={styles.featureDesc}>I-set ang inyong mga pangarap</Text>
        </View>
      </View>

      {/* Game Stats */}
      <View style={styles.gameStats}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>⏱️</Text>
          <Text style={styles.statLabel}>Est. Time</Text>
          <Text style={styles.statValue}>3-5 min</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🎯</Text>
          <Text style={styles.statLabel}>Scenarios</Text>
          <Text style={styles.statValue}>5 Levels</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🏆</Text>
          <Text style={styles.statLabel}>Rewards</Text>
          <Text style={styles.statValue}>Identity Map</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.startGameButton} onPress={startGame}>
        <View style={styles.startButtonContent}>
          <Text style={styles.startButtonEmoji}>🎮</Text>
          <Text style={styles.startButtonText}>Begin Journey</Text>
        </View>
        <View style={styles.startButtonGlow} />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderQuestion = () => {
    const currentQuestion = gameScenarios[currentQuestionIndex];
    
    return (
      <Animated.View style={[
        styles.contentContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}>
        {/* Progress Header with Character */}
        <View style={styles.questionHeader}>
          <View style={styles.characterBubble}>
            <Text style={styles.characterEmoji}>🤔</Text>
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>Challenge {currentQuestionIndex + 1}</Text>
            </View>
          </View>
          
          <View style={styles.progressGameContainer}>
            <View style={styles.progressTrack}>
              {Array.from({ length: gameScenarios.length }, (_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.progressDot, 
                    i <= currentQuestionIndex ? styles.progressDotActive : styles.progressDotInactive
                  ]} 
                >
                  {i < currentQuestionIndex && <Text style={styles.progressCheck}>✓</Text>}
                  {i === currentQuestionIndex && <Text style={styles.progressCurrent}>•</Text>}
                </View>
              ))}
            </View>
            <Text style={styles.progressLabel}>
              {currentQuestionIndex + 1} / {gameScenarios.length}
            </Text>
          </View>
        </View>

        {/* Story Scene Card */}
        <View style={styles.storyScene}>
          <View style={styles.sceneHeader}>
            <Text style={styles.sceneTitle}>
              {currentQuestion.category === 'strength' ? '💪 Leadership Test' : 
               currentQuestion.category === 'values' ? '❤️ Friendship Challenge' :
               currentQuestion.category === 'goals' ? '🎯 Future Vision' : 
               currentQuestion.category === 'personality' ? '🧠 Character Moment' : '🌟 Adventure'}
            </Text>
            <View style={styles.sceneBadge}>
              <Text style={styles.sceneBadgeText}>LEVEL {currentQuestionIndex + 1}</Text>
            </View>
          </View>
          <View style={styles.storyContainer}>
            <Text style={styles.storyText}>{currentQuestion.question}</Text>
          </View>
          <View style={styles.choicePrompt}>
            <Text style={styles.choicePromptText}>🎮 Choose Your Action:</Text>
          </View>
        </View>

        {/* Action Choices */}
        <View style={styles.actionChoices}>
          {currentQuestion.options.map((option, index) => {
            const actionColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
            const isSelected = selectedOption === index;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.actionButton,
                  { borderLeftColor: actionColors[index] },
                  isSelected && styles.actionButtonSelected
                ]}
                onPress={() => handleAnswer(option, index)}
              >
                <View style={[styles.actionIcon, { backgroundColor: actionColors[index] }]}>
                  <Text style={styles.actionIconText}>{index + 1}</Text>
                </View>
                <View style={styles.actionContent}>
                  <Text style={[styles.actionText, isSelected && styles.actionTextSelected]}>
                    {option}
                  </Text>
                </View>
                <View style={styles.actionArrow}>
                  <Text style={[styles.actionArrowText, isSelected && styles.actionArrowSelected]}>
                    {isSelected ? '✓' : '▶'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    );
  };

  const renderResults = () => {
    if (!identityResult) return null;

    return (
      <Animated.View style={[
        styles.contentContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}>
        {/* Victory Header */}
        <View style={styles.victoryHeader}>
          <View style={styles.victoryBadge}>
            <Text style={styles.victoryEmoji}>🏆</Text>
          </View>
          <Text style={styles.victoryTitle}>Mission Complete!</Text>
          <Text style={styles.victorySubtitle}>Identity Unlocked! 🔓</Text>
        </View>

        {/* Character Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileEmoji}>🧑‍🎓</Text>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>YOU</Text>
            </View>
          </View>
          <Text style={styles.profileName}>Ang Tunay na Ikaw</Text>
        </View>

        <ScrollView style={styles.resultsGameScroll} showsVerticalScrollIndicator={false}>
          {/* Achievement Cards */}
          <View style={styles.achievementGrid}>
            <View style={styles.achievementCard}>
              <Text style={styles.achievementIcon}>💪</Text>
              <Text style={styles.achievementTitle}>STRENGTHS</Text>
              <View style={styles.achievementItems}>
                {identityResult.strengths.map((strength, index) => (
                  <View key={index} style={styles.achievementBadge}>
                    <Text style={styles.achievementBadgeText}>{strength}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.achievementCard}>
              <Text style={styles.achievementIcon}>❤️</Text>
              <Text style={styles.achievementTitle}>VALUES</Text>
              <View style={styles.achievementItems}>
                {identityResult.values.map((value, index) => (
                  <View key={index} style={styles.achievementBadge}>
                    <Text style={styles.achievementBadgeText}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.achievementCard}>
              <Text style={styles.achievementIcon}>🎯</Text>
              <Text style={styles.achievementTitle}>GOAL TYPE</Text>
              <View style={styles.achievementItems}>
                <View style={styles.achievementBadge}>
                  <Text style={styles.achievementBadgeText}>{identityResult.goalType}</Text>
                </View>
              </View>
            </View>

            <View style={styles.achievementCard}>
              <Text style={styles.achievementIcon}>🌟</Text>
              <Text style={styles.achievementTitle}>PERSONALITY</Text>
              <View style={styles.achievementItems}>
                {identityResult.personality.map((trait, index) => (
                  <View key={index} style={styles.achievementBadge}>
                    <Text style={styles.achievementBadgeText}>{trait}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Game Actions */}
        <View style={styles.gameActions}>
          <TouchableOpacity style={styles.playAgainButton} onPress={restartGame}>
            <Text style={styles.playAgainEmoji}>🔄</Text>
            <Text style={styles.playAgainText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeButton} onPress={() => router.back()}>
            <Text style={styles.homeEmoji}>🏠</Text>
            <Text style={styles.homeText}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Text style={styles.headerBackText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tunay na Ako</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {gamePhase === 'intro' && renderIntro()}
        {gamePhase === 'questions' && renderQuestion()}
        {gamePhase === 'results' && renderResults()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerBackButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
  },
  headerBackText: {
    color: Colors.light.background,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  headerSpacer: {
    width: 80,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },

  // INTRO SCREEN STYLES
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFE4B5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarEmoji: {
    fontSize: 60,
  },
  avatarPulse: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: Colors.light.primary,
    opacity: 0.3,
  },
  avatarText: {
    fontSize: Typography.h3.fontSize,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginTop: Spacing.md,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  gameTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  gameSubtitle: {
    fontSize: Typography.h3.fontSize,
    color: Colors.light.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
    fontWeight: '600',
  },
  gameDescriptionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameDescription: {
    fontSize: Typography.body.fontSize,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.sm,
  },
  gameDescriptionSub: {
    fontSize: Typography.caption.fontSize,
    color: Colors.light.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  gameFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Spacing.xl,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: '30%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: Spacing.md,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E6FFFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: Typography.caption.fontSize,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 10,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 14,
  },
  startGameButton: {
    backgroundColor: '#38B2AC',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 30,
    minWidth: screenWidth * 0.7,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonEmoji: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  startButtonText: {
    color: Colors.light.background,
    fontSize: Typography.h3.fontSize,
    fontWeight: 'bold',
  },
  startButtonGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 32,
    backgroundColor: 'rgba(56, 178, 172, 0.3)',
    zIndex: -1,
  },

  // QUESTION SCREEN STYLES
  questionHeader: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  characterBubble: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  characterEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  speechText: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  progressGameContainer: {
    alignItems: 'center',
  },
  progressTrack: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  progressDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotActive: {
    backgroundColor: Colors.light.primary,
  },
  progressDotInactive: {
    backgroundColor: '#E2E8F0',
  },
  progressCheck: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressCurrent: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: Typography.caption.fontSize,
    color: '#718096',
    fontWeight: '600',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  questionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E6FFFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  questionEmoji: {
    fontSize: 30,
  },
  questionGameText: {
    fontSize: Typography.h3.fontSize,
    color: '#2D3748',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '600',
  },
  optionsGameContainer: {
    width: '100%',
  },
  optionGameButton: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionLabel: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  optionLabelText: {
    color: '#FFFFFF',
    fontSize: Typography.body.fontSize,
    fontWeight: 'bold',
  },
  optionGameText: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    color: '#2D3748',
    lineHeight: 22,
  },
  optionArrow: {
    marginLeft: Spacing.md,
  },
  optionArrowText: {
    fontSize: 20,
    color: Colors.light.primary,
  },

  // RESULTS SCREEN STYLES
  victoryHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  victoryBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  victoryEmoji: {
    fontSize: 50,
  },
  victoryTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  victorySubtitle: {
    fontSize: Typography.h3.fontSize,
    color: Colors.light.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileAvatar: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  profileEmoji: {
    fontSize: 60,
  },
  profileBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  profileBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: Typography.h2.fontSize,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  resultsGameScroll: {
    width: '100%',
    maxHeight: 500,
  },
  achievementGrid: {
    width: '100%',
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 36,
    marginBottom: Spacing.md,
  },
  achievementTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: Spacing.md,
  },
  achievementItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  achievementBadge: {
    backgroundColor: '#E6FFFA',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    margin: 4,
  },
  achievementBadgeText: {
    fontSize: Typography.caption.fontSize,
    color: '#2D3748',
    fontWeight: '600',
  },
  gameActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: Spacing.lg,
  },
  playAgainButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    flex: 1,
    marginRight: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playAgainEmoji: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  playAgainText: {
    color: Colors.light.background,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    flex: 1,
    marginLeft: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeEmoji: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  homeText: {
    color: Colors.light.primary,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
  },

  // GAME STATS
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#718096',
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    color: '#2D3748',
    fontWeight: 'bold',
  },

  // STORY SCENE STYLES
  storyScene: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  sceneHeader: {
    backgroundColor: Colors.light.primary,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sceneTitle: {
    color: '#FFFFFF',
    fontSize: Typography.h3.fontSize,
    fontWeight: 'bold',
    flex: 1,
  },
  sceneBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  sceneBadgeText: {
    color: '#FFFFFF',
    fontSize: Typography.caption.fontSize,
    fontWeight: 'bold',
  },
  storyContainer: {
    backgroundColor: '#F7FAFC',
    padding: Spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: '#38B2AC',
  },
  storyText: {
    fontSize: Typography.body.fontSize,
    color: '#2D3748',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  choicePrompt: {
    backgroundColor: '#E6FFFA',
    padding: Spacing.lg,
    alignItems: 'center',
  },
  choicePromptText: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.primary,
    fontWeight: 'bold',
  },

  // ACTION CHOICE STYLES  
  actionChoices: {
    width: '100%',
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 5,
    transform: [{ scale: 1 }],
  },
  actionButtonSelected: {
    backgroundColor: '#F0FFF4',
    borderColor: '#38A169',
    shadowOpacity: 0.25,
    transform: [{ scale: 0.98 }],
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  actionIconText: {
    color: '#FFFFFF',
    fontSize: Typography.body.fontSize,
    fontWeight: 'bold',
  },
  actionContent: {
    flex: 1,
  },
  actionText: {
    fontSize: Typography.body.fontSize,
    color: '#2D3748',
    lineHeight: 22,
    fontWeight: '500',
  },
  actionTextSelected: {
    color: '#38A169',
    fontWeight: '600',
  },
  actionArrow: {
    marginLeft: Spacing.md,
    minWidth: 30,
    alignItems: 'center',
  },
  actionArrowText: {
    fontSize: 18,
    color: '#A0AEC0',
    fontWeight: 'bold',
  },
  actionArrowSelected: {
    color: '#38A169',
  },
});