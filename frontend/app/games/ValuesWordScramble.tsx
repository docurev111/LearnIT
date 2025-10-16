import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';

const { width, height } = Dimensions.get('window');

// Filipino values words with Filipino descriptions
const WORDS = [
  { 
    word: 'RESPETO', 
    description: 'Ang "_______" ay ang pagpapakita ng mabuting asal, paggalang, at pagpapahalaga sa kapwa, sa kanilang opinyon, damdamin, o karapatan.',
    difficulty: 1 
  },
  { 
    word: 'PAGMAMAHAL', 
    description: 'Ang "_______" ay malalim na pagmamahal at pag-aalaga sa kapwa, pamilya, at sa ating sarili.',
    difficulty: 2 
  },
  { 
    word: 'KATAPATAN', 
    description: 'Ang "_______" ay ang pagiging tapat at totoo sa lahat ng oras, lalo na sa mga mahihirap na sitwasyon.',
    difficulty: 2 
  },
  { 
    word: 'PASASALAMAT', 
    description: 'Ang "_______" ay ang pagpapahayag ng pagsalamatan at pagpapahalaga sa mga bagay na natanggap.',
    difficulty: 3 
  },
  { 
    word: 'KAPAKUMBABAAN', 
    description: 'Ang "_______" ay ang pagkakaroon ng mababang pagtingin sa sarili at pagtanggap na hindi tayo perpekto.',
    difficulty: 3 
  },
  { 
    word: 'MALASAKIT', 
    description: 'Ang "_______" ay ang malalim na pagmamalasakit at pagtulong sa kapwa nang walang hinihinging kapalit.',
    difficulty: 2 
  },
  { 
    word: 'RESPONSIBILIDAD', 
    description: 'Ang "_______" ay ang pagiging mananagot sa ating mga gawa at desisyon sa buhay.',
    difficulty: 3 
  },
  { 
    word: 'PAGTITIWALA', 
    description: 'Ang "_______" ay ang paniniwala at kumpiyansa sa kapwa na hindi ka bibiguin o lolokohin.',
    difficulty: 2 
  },
  { 
    word: 'DETERMINASYON', 
    description: 'Ang "_______" ay ang matibay na pagpupunyagi at pagtatagumpay sa kabila ng mga hadlang.',
    difficulty: 3 
  },
  { 
    word: 'KABUTIHAN', 
    description: 'Ang "_______" ay ang paggawa ng mabuti at pagtulong sa kapwa nang walang hinihinging kapalit.',
    difficulty: 2 
  },
];

export default function ValuesWordScramble() {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'ended'>('intro');
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [scrambledWord, setScrambledWord] = useState('');
  const [selectedLetters, setSelectedLetters] = useState<number[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [completedWords, setCompletedWords] = useState(0);

  // Animation values
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const successAnimation = useRef(new Animated.Value(0)).current;
  const letterAnimations = useRef<Animated.Value[]>([]).current;
  
  // Welcome screen animations
  const valuesOpacity = useRef(new Animated.Value(0)).current;
  const wordScrambleOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const currentWord = WORDS[currentWordIndex];

  // Welcome screen animations
  useEffect(() => {
    if (gameState === 'intro') {
      // Fade in VALUES first
      Animated.timing(valuesOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        // Then fade in WORD SCRAMBLE
        Animated.timing(wordScrambleOpacity, {
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
  }, [gameState]);

  // Initialize game
  useEffect(() => {
    if (gameState === 'playing') {
      initializeWord();
    }
  }, [currentWordIndex, gameState]);

  const initializeWord = () => {
    const word = WORDS[currentWordIndex].word;
    const letters = word.split('');
    
    // Scramble the letters
    const scrambled = [...letters].sort(() => Math.random() - 0.5);
    setAvailableLetters(scrambled);
    setScrambledWord(scrambled.join(''));
    setSelectedLetters([]);
    setShowHint(false);
    setIsCorrect(null);
    
    // Initialize letter animations
    letterAnimations.length = 0;
    for (let i = 0; i < scrambled.length; i++) {
      letterAnimations.push(new Animated.Value(0));
    }

    // Animate letters in
    Animated.stagger(
      50,
      letterAnimations.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      )
    ).start();
  };

  const handleLetterPress = (index: number) => {
    if (selectedLetters.includes(index)) return;

    const newSelected = [...selectedLetters, index];
    setSelectedLetters(newSelected);

    // Animate letter selection
    Animated.spring(letterAnimations[index], {
      toValue: 1.2,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(letterAnimations[index], {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }).start();
    });

    // Check if word is complete
    if (newSelected.length === currentWord.word.length) {
      checkAnswer(newSelected);
    }
  };

  const handleLetterRemove = (indexInSelected: number) => {
    const newSelected = [...selectedLetters];
    const removedIndex = newSelected[indexInSelected];
    newSelected.splice(indexInSelected, 1);
    setSelectedLetters(newSelected);

    // Animate letter removal
    Animated.sequence([
      Animated.timing(letterAnimations[removedIndex], {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(letterAnimations[removedIndex], {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const checkAnswer = (selected: number[]) => {
    const userWord = selected.map(i => availableLetters[i]).join('');
    const correct = userWord === currentWord.word;

    setIsCorrect(correct);

    if (correct) {
      // Calculate score with bonus
      const baseScore = 100;
      const hintPenalty = showHint ? 20 : 0;
      const difficultyBonus = currentWord.difficulty * 10;
      const earnedScore = baseScore - hintPenalty + difficultyBonus;
      
      setScore(score + earnedScore);
      setCompletedWords(completedWords + 1);

      // Success animation
      Animated.sequence([
        Animated.spring(successAnimation, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(successAnimation, {
          toValue: 0,
          duration: 300,
          delay: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Move to next word or finish game
        setTimeout(() => {
          if (currentWordIndex < WORDS.length - 1) {
            setCurrentWordIndex(currentWordIndex + 1);
          } else {
            showGameComplete();
          }
        }, 500);
      });
    } else {
      // Shake animation for wrong answer
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Clear selection after shake
        setTimeout(() => {
          setSelectedLetters([]);
          setIsCorrect(null);
        }, 500);
      });
    }
  };

  const toggleHint = () => {
    // Add the next missing letter to the answer
    const correctWord = currentWord.word;
    const currentAnswer = selectedLetters.map(i => availableLetters[i]).join('');
    
    // Find the next letter that's missing
    for (let i = 0; i < correctWord.length; i++) {
      if (i >= currentAnswer.length || currentAnswer[i] !== correctWord[i]) {
        // Find the index of this letter in availableLetters that hasn't been selected
        const letterToAdd = correctWord[i];
        const indexToAdd = availableLetters.findIndex(
          (letter, idx) => letter === letterToAdd && !selectedLetters.includes(idx)
        );
        
        if (indexToAdd !== -1) {
          handleLetterPress(indexToAdd);
        }
        break;
      }
    }
    
    setShowHint(false);
  };

  const showGameComplete = () => {
    Alert.alert(
      'Congratulations! 🎉',
      `You completed all words!\n\nFinal Score: ${score}\nWords Completed: ${completedWords}/${WORDS.length}`,
      [
        { text: 'Play Again', onPress: resetGame },
        { text: 'Back to Games', onPress: () => router.back() },
      ]
    );
  };

  const resetGame = () => {
    setCurrentWordIndex(0);
    setScore(0);
    setCompletedWords(0);
    setIsCorrect(null);
  };

  const skipWord = () => {
    Alert.alert(
      'Skip Word?',
      'You will not earn points for this word.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => {
            if (currentWordIndex < WORDS.length - 1) {
              setCurrentWordIndex(currentWordIndex + 1);
            } else {
              showGameComplete();
            }
          },
        },
      ]
    );
  };

  // WELCOME SCREEN
  if (gameState === 'intro') {
    return (
      <>
        <View style={styles.container}>
          <Video
            source={require('../../assets/valueswordscramble/welcomescreen/bg.mp4')}
            style={styles.videoBackground}
            resizeMode={ResizeMode.COVER}
            isLooping
            shouldPlay
            isMuted
          />
          
          <View style={styles.welcomeOverlay}>
            <View style={styles.welcomeContainer}>
              {/* Top Section - empty to match structure */}
              <View style={styles.topSection}>
              </View>

              {/* Middle section with titles and buttons */}
              <View style={styles.middleSection}>
                {/* Values Text - Fade in first with custom font */}
                <Animated.Text style={[styles.titleValues, { opacity: valuesOpacity }]}>
                  VALUES
                </Animated.Text>

                {/* Word Scramble Title - Fade in after VALUES with custom font */}
                <Animated.Text style={[styles.titleWordScramble, { opacity: wordScrambleOpacity }]}>
                  WORD SCRAMBLE
                </Animated.Text>

                {/* Start Button - below title with pulse animation */}
                <TouchableOpacity 
                  style={styles.welcomeStartButton}
                  onPress={() => {
                    setGameState('playing');
                  }}
                  activeOpacity={0.8}
                >
                  <Animated.Image 
                    source={require('../../assets/valueswordscramble/welcomescreen/startbutton.png')}
                    style={[styles.startButtonImage, { transform: [{ scale: buttonScale }] }]}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                {/* Back Button - below Start with pulse animation */}
                <TouchableOpacity 
                  style={styles.welcomeBackButtonBottom}
                  onPress={() => {
                    router.back();
                  }}
                  activeOpacity={0.8}
                >
                  <Animated.Image 
                    source={require('../../assets/valueswordscramble/welcomescreen/backbutton.png')}
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
                    source={require('../../assets/valueswordscramble/welcomescreen/howtoplay.png')}
                    style={[styles.howToPlayImage, { transform: [{ scale: buttonScale }] }]}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* How to Play Modal */}
        {showHowToPlay && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.howToPlayContent}>
                <Text style={styles.howToPlayTitle}>Paano Maglaro? 🎮</Text>
                <ScrollView style={styles.howToPlayScroll}>
                  <Text style={styles.howToPlayText}>
                    {'\n'}📖 <Text style={styles.bold}>Layunin:</Text>{'\n'}
                    Hulaan ang tamang salita ng Values sa pamamagitan ng pag-ayos ng mga letra!{'\n\n'}
                    
                    {'\n'}🎯 <Text style={styles.bold}>Paano:</Text>{'\n'}
                    • Tingnan ang larawan at basahin ang paliwanag{'\n'}
                    • I-tap ang mga letra sa tamang pagkakasunod-sunod{'\n'}
                    • Kumpletuhin ang salita para sa puntos!{'\n\n'}
                    
                    {'\n'}💡 <Text style={styles.bold}>Mga Tip:</Text>{'\n'}
                    • Gumamit ng "Hint" button kung nahihirapan ka{'\n'}
                    • Basahing mabuti ang paliwanag{'\n'}
                    • Subukang hulaan bago gumamit ng hint!{'\n\n'}
                    
                    {'\n'}🌟 <Text style={styles.bold}>Puntos:</Text>{'\n'}
                    • Tamang sagot = +10 puntos{'\n'}
                    • Gamit ng Hint = -5 puntos{'\n\n'}
                    
                    {'\n'}✨ Magsaya at matuto ng mga Filipino Values!
                  </Text>
                </ScrollView>
              </View>
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
      <LinearGradient colors={['#4A90E2', '#357ABD']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Values Word Scramble</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Score Bar */}
        <View style={styles.scoreContainer}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Progress</Text>
          <Text style={styles.scoreValue}>
            {completedWords}/{WORDS.length}
          </Text>
        </View>
      </View>

      {/* Main Game Area */}
      <ScrollView 
        style={styles.gameArea}
        contentContainerStyle={styles.gameAreaContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Description and Difficulty */}
        <View style={styles.infoContainer}>
          <Text style={styles.descriptionText}>{currentWord.description}</Text>
          <View style={styles.difficultyContainer}>
            {[...Array(3)].map((_, i) => (
              <Ionicons
                key={i}
                name="star"
                size={16}
                color={i < currentWord.difficulty ? '#FFD700' : '#FFFFFF50'}
              />
            ))}
          </View>
        </View>

        {/* Hint Button */}
        <TouchableOpacity onPress={toggleHint} style={styles.hintButton}>
          <Ionicons name="bulb-outline" size={20} color="#FFFFFF" />
          <Text style={styles.hintButtonText}>Show Hint</Text>
        </TouchableOpacity>

        {/* Answer Area */}
        <Animated.View
          style={[
            styles.answerArea,
            {
              transform: [{ translateX: shakeAnimation }],
              backgroundColor:
                isCorrect === true
                  ? '#34C75930'
                  : isCorrect === false
                  ? '#FF453A30'
                  : '#FFFFFF20',
            },
          ]}
        >
          {selectedLetters.length === 0 ? (
            <Text style={styles.placeholderText}>Tap letters to spell the word</Text>
          ) : (
            <View style={styles.selectedLettersContainer}>
              {selectedLetters.map((letterIndex, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleLetterRemove(i)}
                  style={styles.selectedLetter}
                >
                  <Text style={styles.selectedLetterText}>
                    {availableLetters[letterIndex]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Available Letters */}
        <View style={styles.lettersGrid}>
          {availableLetters.map((letter, index) => {
            const isSelected = selectedLetters.includes(index);
            const animValue = letterAnimations[index] || new Animated.Value(1);

            return (
              <Animated.View
                key={index}
                style={{
                  opacity: animValue,
                  transform: [
                    {
                      scale: animValue,
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  onPress={() => handleLetterPress(index)}
                  disabled={isSelected}
                  style={[
                    styles.letterBox,
                    isSelected && styles.letterBoxSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.letterText,
                      isSelected && styles.letterTextSelected,
                    ]}
                  >
                    {letter}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Success Message */}
        {isCorrect && (
          <Animated.View
            style={[
              styles.successMessage,
              {
                opacity: successAnimation,
                transform: [
                  {
                    scale: successAnimation,
                  },
                ],
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={48} color="#34C759" />
            <Text style={styles.successText}>Correct! 🎉</Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
          <TouchableOpacity onPress={skipWord} style={styles.skipButton}>
            <Ionicons name="play-skip-forward-outline" size={20} color="#FF9500" />
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedLetters([])}
            style={styles.clearButton}
            disabled={selectedLetters.length === 0}
          >
            <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  scoreBox: {
    backgroundColor: '#FFFFFF20',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    minWidth: 100,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#FFFFFF80',
    marginBottom: 3,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gameArea: {
    flex: 1,
  },
  gameAreaContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  infoContainer: {
    backgroundColor: '#FFFFFF20',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF20',
    borderRadius: 12,
    padding: 12,
    marginBottom: 5,
    gap: 8,
  },
  hintButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  answerArea: {
    height: 100,
    borderRadius: 15,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF40',
  },
  placeholderText: {
    fontSize: 16,
    color: '#FFFFFF60',
    fontStyle: 'italic',
  },
  selectedLettersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 5,
  },
  selectedLetter: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  selectedLetterText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A90E2',
  },
  lettersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  letterBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 55,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  letterBoxSelected: {
    backgroundColor: '#FFFFFF30',
    opacity: 0.5,
  },
  letterText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A90E2',
  },
  letterTextSelected: {
    color: '#FFFFFF60',
  },
  successMessage: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -50 }],
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: 150,
  },
  successText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34C759',
    marginTop: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 15,
    backgroundColor: '#357ABD',
  },
  skipButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    gap: 8,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF9500',
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF30',
    borderRadius: 15,
    padding: 15,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Welcome Screen Styles
  videoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  welcomeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
  middleSection: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  titleValues: {
    fontSize: 62,
    fontFamily: 'Architype-Aubette',
    color: '#FFD700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    letterSpacing: 8,
    marginTop: -180,
    marginBottom: -40,
  },
  titleWordScramble: {
    fontSize: 42,
    fontFamily: 'Architype-Aubette',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    letterSpacing: 4,
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
  howToPlayContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: height * 0.7,
  },
  howToPlayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: 10,
  },
  howToPlayScroll: {
    maxHeight: height * 0.6,
  },
  howToPlayText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  bold: {
    fontWeight: 'bold',
    color: '#4A90E2',
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
