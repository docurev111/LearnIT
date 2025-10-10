import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface Scenario {
  id: number;
  situation: string;
  emotion: string;
  emoji: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    situation: "Ang iyong kaibigan ay umiiyak dahil bumagsak siya sa pagsusulit.",
    emotion: "Malungkot",
    emoji: "😢",
    correctAnswer: "Yakapin at sabihing, 'Nandito lang ako para sa'yo.'",
    options: [
      "Yakapin at sabihing, 'Nandito lang ako para sa'yo.'",
      "Tumawa at sabihing, 'Ang tanga mo naman!'",
      "Iwanan at lumayo",
      "Magalit at sabihing dapat nag-aral siya",
    ],
    explanation: "Ang pakikiramdam at pakikiisa sa kapwa ay nagpapakita ng malalim na pagmamahal at pag-unawa.",
  },
  {
    id: 2,
    situation: "Nakita mong nag-iisa ang bagong estudyante sa recess.",
    emotion: "Nag-iisa",
    emoji: "😔",
    correctAnswer: "Lapitan at anyayahang kumain kasama ninyo",
    options: [
      "Lapitan at anyayahang kumain kasama ninyo",
      "Iwanan lang at kumain kasama ng iba",
      "Tawanan dahil wala siyang kaibigan",
      "Kunin ang baon niya",
    ],
    explanation: "Ang pagtanggap at pagiging bukas sa bagong kakilala ay nagpapakita ng kagandahang loob.",
  },
  {
    id: 3,
    situation: "Ang iyong kuya ay masayang nagsasabi ng kanyang achievement sa basketball.",
    emotion: "Masaya at Proud",
    emoji: "😄",
    correctAnswer: "Batiin at sabihing, 'Proud ako sa'yo kuya!'",
    options: [
      "Batiin at sabihing, 'Proud ako sa'yo kuya!'",
      "Mainggit at sabihing, 'Suwerte mo lang yan'",
      "Hindi pansinin at umalis",
      "Manginsulto at sabihing hindi importante yun",
    ],
    explanation: "Ang pagbati sa tagumpay ng iba ay nagpapakita ng tunay na pagmamahal at pagiging masaya para sa kanila.",
  },
  {
    id: 4,
    situation: "Galit na galit ang iyong nanay dahil sa gulo sa bahay.",
    emotion: "Galit",
    emoji: "😠",
    correctAnswer: "Huminahon, humingi ng tawad, at tumulong sa paglilinis",
    options: [
      "Huminahon, humingi ng tawad, at tumulong sa paglilinis",
      "Sumagot ng bastos at magsalita ng masama",
      "Umalis at iwanan ang problema",
      "Magalit din at magsigaw",
    ],
    explanation: "Ang respeto at paghingi ng tawad ay nagpapakita ng pagkilala sa ating pagkakamali at paggalang sa nakakatanda.",
  },
  {
    id: 5,
    situation: "Takot na takot ang iyong kapatid dahil sa kulog at kidlat.",
    emotion: "Takot",
    emoji: "😨",
    correctAnswer: "Yakapin at sabihing, 'Huwag kang matakot, nandito ako'",
    options: [
      "Yakapin at sabihing, 'Huwag kang matakot, nandito ako'",
      "Takutin pa lalo at magsalita ng horror stories",
      "Tawanan dahil duwag",
      "Iwanan mag-isa sa dilim",
    ],
    explanation: "Ang pagkalinga at pagprotekta sa mas bata ay nagpapakita ng pagmamahal at responsibilidad.",
  },
  {
    id: 6,
    situation: "Excited na excited ang iyong kaklase tungkol sa kanyang birthday party bukas.",
    emotion: "Excited",
    emoji: "🎉",
    correctAnswer: "Makiexcited at tanungin kung ano ang plano",
    options: [
      "Makiexcited at tanungin kung ano ang plano",
      "Pagsabihan na walang mahalaga sa birthday",
      "Mainggit at hindi makipag-usap",
      "Sabihing mas maganda ang sariling party",
    ],
    explanation: "Ang pakikisaya sa kasiyahan ng iba ay nagpapakita ng mabuting kalooban at tunay na pakikipagkaibigan.",
  },
  {
    id: 7,
    situation: "Nahihiya ang iyong kaklase na sumagot sa klase kahit alam niya ang tamang sagot.",
    emotion: "Nahihiya",
    emoji: "😳",
    correctAnswer: "Hikayatin ng mahinahon at sabihing kaya niya",
    options: [
      "Hikayatin ng mahinahon at sabihing kaya niya",
      "Tawanan at sabihing mahina",
      "Ituro sa buong klase na nahihiya siya",
      "Awayin kung bakit hindi sumasagot",
    ],
    explanation: "Ang pag-encourage at pagtitiwala sa kakayahan ng iba ay tumutulong sa kanilang pag-unlad at kumpiyansa.",
  },
  {
    id: 8,
    situation: "Nalungkot ang iyong lolo dahil wala siyang kasama ngayong araw.",
    emotion: "Nalulungkot at Nag-iisa",
    emoji: "👴😔",
    correctAnswer: "Maglaan ng oras at makipag-usap sa kanya",
    options: [
      "Maglaan ng oras at makipag-usap sa kanya",
      "Magcellphone lang at hindi pansinin",
      "Sabihing abala ka sa ibang gawain",
      "Iwanan mag-isa at maglaro sa labas",
    ],
    explanation: "Ang pagbigay ng oras at atensyon sa matatanda ay nagpapakita ng malalim na paggalang at pagmamahal.",
  },
  {
    id: 9,
    situation: "Naiinis ang iyong kapatid dahil nasira ang kanyang laruan.",
    emotion: "Naiinis at Disappointed",
    emoji: "😤",
    correctAnswer: "Intindihin at tulungang ayusin o gumawa ng paraan",
    options: [
      "Intindihin at tulungang ayusin o gumawa ng paraan",
      "Sabihing kasalanan niya kaya nasira",
      "Tawanan at sabihing maarte lang",
      "Kunin ang iba pa niyang laruan",
    ],
    explanation: "Ang pag-unawa at pagtutulungan ay nagpapalakas ng samahan at nagtuturo ng solusyon sa problema.",
  },
  {
    id: 10,
    situation: "Nahihirapan ang iyong kaklase sa kanyang assignment at baka hindi niya matapos.",
    emotion: "Stressed at Nalilito",
    emoji: "😰",
    correctAnswer: "Alok ng tulong at explain kung paano gawin",
    options: [
      "Alok ng tulong at explain kung paano gawin",
      "Sabihing problema niya yun",
      "Magpakitang-gilas na tapos mo na ang sa'yo",
      "Tawanan dahil hindi niya alam",
    ],
    explanation: "Ang bayanihan at pagtutulungan ay nagpapakita ng tunay na pakikipagkapwa-tao at pagmamahal sa kapwa.",
  },
  {
    id: 11,
    situation: "Natutuwa ang iyong guro sa inyong magandang project presentation.",
    emotion: "Proud at Masaya",
    emoji: "👩‍🏫😊",
    correctAnswer: "Magpasalamat at ibahagi ang credit sa buong grupo",
    options: [
      "Magpasalamat at ibahagi ang credit sa buong grupo",
      "Sabihing ikaw lang ang gumawa ng lahat",
      "Hindi magpasalamat at umalis na lang",
      "Magyabang sa iba",
    ],
    explanation: "Ang pagkilala sa kontribusyon ng lahat at pagiging humble ay nagpapakita ng tunay na karakter.",
  },
  {
    id: 12,
    situation: "Disappointed ang iyong kaibigan dahil hindi natuloy ang field trip.",
    emotion: "Disappointed",
    emoji: "😞",
    correctAnswer: "Intindihin at mag-suggest ng alternative na masayang gawin",
    options: [
      "Intindihin at mag-suggest ng alternative na masayang gawin",
      "Sabihing ang arte-arte naman",
      "Umalis at hindi makiisa sa nararamdaman",
      "Magalit din at magreklamo",
    ],
    explanation: "Ang pag-empathize at paghanap ng solusyon ay nagpapakita ng matalinong pagkilos at mabuting kalooban.",
  },
  {
    id: 13,
    situation: "Proud na proud ang iyong kapatid na natuto na mag-bike nang walang training wheels.",
    emotion: "Proud at Achieved",
    emoji: "🚴😁",
    correctAnswer: "I-celebrate at batiin ang achievement",
    options: [
      "I-celebrate at batiin ang achievement",
      "Sabihing madali lang naman yun",
      "Mainggit at hindi batiin",
      "Isipin na mas magaling ka pa rin",
    ],
    explanation: "Ang pagdiriwang ng tagumpay ng iba ay nagpapakita ng suporta at pagmamahal sa pamilya.",
  },
  {
    id: 14,
    situation: "Nahihiya ang iyong nanay na humingi ng tulong sa kapitbahay.",
    emotion: "Nahihiya",
    emoji: "😳",
    correctAnswer: "Tulungan siya at sabayan sa paghingi ng tulong",
    options: [
      "Tulungan siya at sabayan sa paghingi ng tulong",
      "Sabihing huwag na lang humingi ng tulong",
      "Iwanang mag-isa sa sitwasyon",
      "Mapahiya pa siya sa harap ng iba",
    ],
    explanation: "Ang pagtayo kasama ng pamilya sa mahirap na sitwasyon ay nagpapakita ng tapang at pagkakaisa.",
  },
  {
    id: 15,
    situation: "Masaya at grateful ang iyong lola sa regalo mo sa kanya.",
    emotion: "Grateful at Touched",
    emoji: "👵❤️",
    correctAnswer: "Yakapin at sabihing mahal mo siya",
    options: [
      "Yakapin at sabihing mahal mo siya",
      "Humingi agad ng pera kapalit",
      "Umalis na agad pagkabigay",
      "Sabihing obligation lang yun",
    ],
    explanation: "Ang pagpapakita ng tunay na pagmamahal at hindi umaasa ng kapalit ay nagpapakita ng dalisay na puso.",
  },
];

export default function EmotionMatchGame() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'ended'>('intro');
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answeredScenarios, setAnsweredScenarios] = useState<number[]>([]);
  
  const timerRef = useRef<any>(null);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  const currentScenario = SCENARIOS[currentScenarioIndex];
  const totalScenarios = SCENARIOS.length;

  useEffect(() => {
    if (gameState === 'playing' && !showFeedback) {
      startTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentScenarioIndex, showFeedback]);

  const startTimer = () => {
    setTimeLeft(10);
    progressAnim.setValue(1);

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 10000,
      useNativeDriver: false,
    }).start();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowFeedback(true);
    setIsCorrect(false);
    animateFeedback();
    setTimeout(nextScenario, 3000);
  };

  const handleOptionSelect = (option: string) => {
    if (showFeedback) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    setSelectedOption(option);
    const correct = option === currentScenario.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore((prev) => prev + (timeLeft * 10)); // Points based on speed
    }
    
    setShowFeedback(true);
    animateFeedback();
    
    setTimeout(nextScenario, 3000);
  };

  const animateFeedback = () => {
    feedbackAnim.setValue(0);
    Animated.spring(feedbackAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const nextScenario = () => {
    setAnsweredScenarios([...answeredScenarios, currentScenario.id]);
    
    if (currentScenarioIndex + 1 >= totalScenarios) {
      endGame();
    } else {
      setCurrentScenarioIndex(currentScenarioIndex + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      feedbackAnim.setValue(0);
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCurrentScenarioIndex(0);
    setAnsweredScenarios([]);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const endGame = () => {
    setGameState('ended');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resetGame = () => {
    setGameState('intro');
    setCurrentScenarioIndex(0);
    setScore(0);
    setAnsweredScenarios([]);
  };

  // INTRO SCREEN
  if (gameState === 'intro') {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.introContainer}>
          <Text style={styles.gameTitle}>💭 Emotion Match</Text>
          <Text style={styles.subtitle}>Pagkilala sa Damdamin</Text>
          
          <View style={styles.lessonCard}>
            <Text style={styles.lessonTitle}>📖 Bakit Mahalaga?</Text>
            <Text style={styles.lessonText}>
              Ang <Text style={styles.bold}>pakikiramdam</Text> at <Text style={styles.bold}>pakikipagkapwa</Text> ay 
              mahalagang bahagi ng pagiging mabuting tao. Sa larong ito, matututo kang tugunan ang iba't ibang emosyon 
              ng mga taong nakapaligid sa'yo.
            </Text>
          </View>

          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>🎮 Paano Maglaro:</Text>
            <Text style={styles.instructionItem}>• Basahin ang sitwasyon at emosyon</Text>
            <Text style={styles.instructionItem}>• May 10 segundong oras para pumili</Text>
            <Text style={styles.instructionItem}>• Piliin ang tamang tugon o aksyon</Text>
            <Text style={styles.instructionItem}>• Mas mabilis, mas mataas ang puntos!</Text>
            <Text style={styles.instructionItem}>• {totalScenarios} sitwasyon ang dapat sagutin</Text>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>🚀 Simulan ang Laro</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
            <Text style={styles.backButtonText}>Bumalik</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  // PLAYING SCREEN
  if (gameState === 'playing') {
    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreText}>Puntos: {score}</Text>
            <Text style={styles.progressText}>
              {currentScenarioIndex + 1} / {totalScenarios}
            </Text>
          </View>
          
          {/* Timer Progress Bar */}
          <View style={styles.timerBarContainer}>
            <Animated.View 
              style={[
                styles.timerBar, 
                { 
                  width: progressWidth,
                  backgroundColor: timeLeft > 5 ? '#10B981' : timeLeft > 2 ? '#F59E0B' : '#EF4444'
                }
              ]} 
            />
          </View>
          <Text style={styles.timerText}>⏱️ {timeLeft}s</Text>
        </View>

        <ScrollView style={styles.gameContent}>
          {/* Scenario Card */}
          <View style={styles.scenarioCard}>
            <Text style={styles.emotionEmoji}>{currentScenario.emoji}</Text>
            <Text style={styles.emotionLabel}>{currentScenario.emotion}</Text>
            <Text style={styles.situation}>{currentScenario.situation}</Text>
            <Text style={styles.question}>Ano ang dapat mong gawin?</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentScenario.options.map((option, index) => {
              const isSelected = selectedOption === option;
              const isCorrectOption = option === currentScenario.correctAnswer;
              const showAsCorrect = showFeedback && isCorrectOption;
              const showAsWrong = showFeedback && isSelected && !isCorrect;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    showAsCorrect && styles.optionCorrect,
                    showAsWrong && styles.optionWrong,
                  ]}
                  onPress={() => handleOptionSelect(option)}
                  disabled={showFeedback}
                >
                  <Text style={styles.optionNumber}>{String.fromCharCode(65 + index)}.</Text>
                  <Text style={[
                    styles.optionText,
                    (showAsCorrect || showAsWrong) && styles.optionTextBold
                  ]}>
                    {option}
                  </Text>
                  {showAsCorrect && <Ionicons name="checkmark-circle" size={24} color="#10B981" />}
                  {showAsWrong && <Ionicons name="close-circle" size={24} color="#EF4444" />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Feedback */}
          {showFeedback && (
            <Animated.View 
              style={[
                styles.feedbackCard,
                {
                  opacity: feedbackAnim,
                  transform: [{ scale: feedbackAnim }]
                }
              ]}
            >
              <Text style={styles.feedbackTitle}>
                {isCorrect ? '✅ Tama!' : '❌ Mali'}
              </Text>
              <Text style={styles.feedbackExplanation}>
                {currentScenario.explanation}
              </Text>
              {isCorrect && (
                <Text style={styles.pointsEarned}>
                  +{timeLeft * 10} puntos!
                </Text>
              )}
            </Animated.View>
          )}
        </ScrollView>
      </LinearGradient>
    );
  }

  // END GAME SCREEN
  if (gameState === 'ended') {
    const percentage = Math.round((score / (totalScenarios * 100)) * 100);
    
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.endContainer}>
          <Text style={styles.gameOverTitle}>🎉 Tapos na!</Text>
          
          <View style={styles.finalScoreCard}>
            <Text style={styles.finalScoreLabel}>Final na Puntos:</Text>
            <Text style={styles.finalScoreValue}>{score}</Text>
            <Text style={styles.percentageText}>{percentage}% Tumpak</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📊 Buod:</Text>
            <Text style={styles.summaryItem}>
              ✅ Sitwasyon na Nasagot: {totalScenarios}
            </Text>
            <Text style={styles.summaryItem}>
              🎯 Average Score: {Math.round(score / totalScenarios)} puntos bawat tanong
            </Text>
          </View>

          <View style={styles.messageCard}>
            <Text style={styles.messageText}>
              {percentage >= 80
                ? '🌟 Napakagaling! Ikaw ay may mataas na pakikiramdam at pag-unawa sa damdamin ng iba. Patuloy mong ipakita ang empathy sa iyong buhay!'
                : percentage >= 60
                ? '👍 Magaling! May magandang pag-unawa ka sa emosyon ng iba. Patuloy kang matuto at magpraktis ng pakikiramdam.'
                : '💪 Magpatuloy! Ang pag-unawa sa damdamin ng iba ay isang kasanayan na natututo sa pagsasanay. Subukan ulit!'}
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
  introContainer: {
    padding: 20,
    alignItems: 'center',
    paddingTop: 60,
  },
  gameTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#E0E7FF',
    marginBottom: 30,
    fontStyle: 'italic',
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
    color: '#667eea',
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
    color: '#764ba2',
  },
  instructionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
  instructionItem: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
    paddingLeft: 5,
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
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
    paddingTop: 50,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  timerBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  timerBar: {
    height: '100%',
    borderRadius: 4,
  },
  timerText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  gameContent: {
    flex: 1,
    padding: 16,
  },
  scenarioCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    alignItems: 'center',
  },
  emotionEmoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  emotionLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#764ba2',
    marginBottom: 16,
  },
  situation: {
    fontSize: 16,
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionCorrect: {
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  optionWrong: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  optionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    marginRight: 12,
    minWidth: 24,
  },
  optionText: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
    lineHeight: 20,
  },
  optionTextBold: {
    fontWeight: 'bold',
  },
  feedbackCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  feedbackTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  feedbackExplanation: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
  pointsEarned: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
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
    color: '#667eea',
    marginBottom: 8,
  },
  percentageText: {
    fontSize: 20,
    color: '#10B981',
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  summaryItem: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 8,
  },
  messageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    width: '100%',
  },
  messageText: {
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
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
});
