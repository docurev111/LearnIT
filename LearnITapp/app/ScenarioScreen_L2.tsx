import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  ScrollView,
} from "react-native";
import { Video, Audio, AVPlaybackStatus, ResizeMode } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";
import { useRouter, Stack } from "expo-router";
import { useWindowDimensions } from "react-native";

export default function ScenarioScreenL2() {
  const router = useRouter();
  const dimensions = useWindowDimensions();
  const [showIntro, setShowIntro] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isFrozen, setIsFrozen] = useState(false);
  const [showCharacterDialogue, setShowCharacterDialogue] = useState(false);
  const [currentCharacterDialogue, setCurrentCharacterDialogue] = useState(0);
  const [characterTypedText, setCharacterTypedText] = useState("");
  const [showChoices, setShowChoices] = useState(false);
  
  // L2 Video Scenes: main, exclude1, ignore1, defend1, friendship1, goodending1
  const [currentVideoScene, setCurrentVideoScene] = useState<
    'l2_main' | 'l2_exclude1' | 'l2_ignore1' | 'l2_defend1' | 'l2_friendship1' | 'l2_goodending1'
  >('l2_main');
  
  const [currentCharacter, setCurrentCharacter] = useState<'Carlos' | 'RandomStudentA' | 'RandomStudentB' | 'Teacher' | 'Aiko' | 'Maria' | 'Miguel'>('RandomStudentA');
  const [currentDialogueSet, setCurrentDialogueSet] = useState<string[]>([]);
  const [currentChoiceSet, setCurrentChoiceSet] = useState<Array<{text: string, action: string}>>([]);
  const [showBadEnding, setShowBadEnding] = useState(false);
  const [badEndingMessage, setBadEndingMessage] = useState("");
  const [isMonologue, setIsMonologue] = useState(false);
  
  // Flags to prevent re-triggering freeze frames
  const [scene1_30sFreezeTriggered, setScene1_30sFreezeTriggered] = useState(false);
  const [scene1_40sFreezeTriggered, setScene1_40sFreezeTriggered] = useState(false);
  const [scene1_42sFreezeTriggered, setScene1_42sFreezeTriggered] = useState(false);
  const [scene1_EndFreezeTriggered, setScene1_EndFreezeTriggered] = useState(false);
  
  // Defend1 scene freeze flags
  const [defend1_15sFreezeTriggered, setDefend1_15sFreezeTriggered] = useState(false);
  const [defend1_20sFreezeTriggered, setDefend1_20sFreezeTriggered] = useState(false);
  const [defend1_35sFreezeTriggered, setDefend1_35sFreezeTriggered] = useState(false);
  
  // Friendship1 scene freeze flags
  const [friendship1_5sFreezeTriggered, setFriendship1_5sFreezeTriggered] = useState(false);
  const [friendship1_11sFreezeTriggered, setFriendship1_11sFreezeTriggered] = useState(false);
  const [friendship1_16sFreezeTriggered, setFriendship1_16sFreezeTriggered] = useState(false);
  const [friendship1_21sFreezeTriggered, setFriendship1_21sFreezeTriggered] = useState(false);
  
  const videoRef = useRef<Video>(null);
  const audioRef = useRef<Audio.Sound | null>(null);
  const characterTypingIntervalRef = useRef<any>(null);
  const introOpacity = useRef(new Animated.Value(0)).current;
  const introScale = useRef(new Animated.Value(0.8)).current;
  const videoOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleSlideUp = useRef(new Animated.Value(20)).current;
  const characterDialogueOpacity = useRef(new Animated.Value(0)).current;
  const choicesOpacity = useRef(new Animated.Value(0)).current;
  const congratsOpacity = useRef(new Animated.Value(0)).current;
  const congratsScale = useRef(new Animated.Value(0)).current;
  const badEndingOpacity = useRef(new Animated.Value(0)).current;
  const typingIntervalRef = useRef<any>(null);

  // Narrator subtitles for L2 main scene
  const subtitles = [
    "Dumating ang bagong estudyante, si Miguel...",
    "Napansin ng mga kaklase na luma ang kanyang damit...",
    "Nagsimula ang mga bulong at tinginan...",
    "Ano ang dapat mong gawin?",
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#000",
    },
    introContainer: {
      flex: 1,
      backgroundColor: "#1a1a2e",
    },
    introScrollView: {
      flex: 1,
    },
    introScrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    introContent: {
      backgroundColor: "#16213e",
      borderRadius: 20,
      padding: 20,
      maxWidth: 600,
      width: "100%",
      borderWidth: 2,
      borderColor: "#6B73FF",
      shadowColor: "#6B73FF",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
    },
    difficultyBadge: {
      backgroundColor: "#f59e0b", // Orange for Medium
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      alignSelf: "center",
      marginBottom: 20,
    },
    difficultyText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "bold",
    },
    scenarioTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#fff",
      textAlign: "center",
      marginBottom: 20,
    },
    scenarioDescription: {
      fontSize: 16,
      color: "#ddd",
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 30,
    },
    introButtonContainer: {
      gap: 10,
    },
    playButton: {
      backgroundColor: "#6B73FF",
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 10,
      alignItems: "center",
    },
    playButtonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
    },
    backButtonIntro: {
      backgroundColor: "#374151",
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 10,
      alignItems: "center",
    },
    backButtonIntroText: {
      color: "#fff",
      fontSize: 16,
    },
    video: {
      width: "100%",
      height: "100%",
    },
    subtitleContainer: {
      position: "absolute",
      bottom: 100,
      left: 20,
      right: 20,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: 15,
      borderRadius: 10,
      borderLeftWidth: 4,
      borderLeftColor: "#fbbf24", // Gold for narrator
    },
    subtitleText: {
      color: "#fff",
      fontSize: 18,
      textAlign: "center",
    },
    cursor: {
      color: "#fbbf24",
      fontWeight: "bold",
    },
    characterDialogueContainer: {
      position: "absolute",
      bottom: 20,
      left: 20,
      right: 20,
      backgroundColor: "rgba(26, 26, 46, 0.95)",
      borderRadius: 15,
      borderWidth: 2,
      overflow: "hidden",
    },
    characterNameBadge: {
      paddingVertical: 8,
      paddingHorizontal: 20,
    },
    characterName: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    characterDialogueText: {
      padding: 15,
    },
    dialogueText: {
      color: "#fff",
      fontSize: 18,
      lineHeight: 26,
    },
    nextIndicator: {
      color: "#6B73FF",
      fontSize: 20,
      marginTop: 10,
      textAlign: "right",
    },
    choicesContainer: {
      position: "absolute",
      bottom: 120,
      right: 20,
      gap: 12,
      minWidth: 300,
    },
    choicesContainerCentered: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: [{ translateX: -150 }, { translateY: -50 }],
      gap: 12,
      minWidth: 300,
    },
    choiceButton: {
      backgroundColor: "rgba(107, 115, 255, 0.9)",
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: "#fff",
    },
    choiceText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
    },
    persona3CongratsContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    persona3CongratsCard: {
      backgroundColor: "#16213e",
      borderRadius: 20,
      padding: 30,
      maxWidth: 500,
      width: "100%",
      borderWidth: 3,
      borderColor: "#fbbf24",
      alignItems: "center",
    },
    persona3CongratsTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#fbbf24",
      marginBottom: 15,
      textAlign: "center",
    },
    persona3Divider: {
      width: "100%",
      height: 2,
      backgroundColor: "#6B73FF",
      marginBottom: 20,
    },
    persona3CongratsMessage: {
      fontSize: 16,
      color: "#ddd",
      textAlign: "center",
      marginBottom: 20,
      lineHeight: 24,
    },
    persona3CongratsValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#6B73FF",
      marginBottom: 30,
      textAlign: "center",
    },
    persona3BackButton: {
      backgroundColor: "#6B73FF",
      paddingVertical: 15,
      paddingHorizontal: 40,
      borderRadius: 10,
    },
    persona3BackButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    badEndingContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.95)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    badEndingCard: {
      backgroundColor: "#1a1a2e",
      borderRadius: 20,
      padding: 30,
      maxWidth: 500,
      width: "100%",
      borderWidth: 3,
      borderColor: "#ef4444",
      alignItems: "center",
    },
    badEndingTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#ef4444",
      marginBottom: 15,
      textAlign: "center",
    },
    badEndingMessage: {
      fontSize: 16,
      color: "#ddd",
      textAlign: "center",
      marginBottom: 30,
      lineHeight: 24,
    },
    tryAgainButton: {
      backgroundColor: "#ef4444",
      paddingVertical: 15,
      paddingHorizontal: 40,
      borderRadius: 10,
      marginBottom: 10,
    },
    tryAgainButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
  });

  useEffect(() => {
    // Animate intro on mount
    Animated.parallel([
      Animated.timing(introOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(introScale, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      // Unlock orientation on unmount
      ScreenOrientation.unlockAsync();
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      if (characterTypingIntervalRef.current) {
        clearInterval(characterTypingIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.unloadAsync();
      }
    };
  }, []);

  const handleStartScenario = async () => {
    // Lock to landscape for video
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    
    setShowIntro(false);
    setVideoPlaying(true);
    
    // Fade in video
    Animated.timing(videoOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const handleGoBack = async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    );
    router.back();
  };

  const playPopSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/audio/popsfx.mp3")
      );
      await sound.playAsync();
      // Unload after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log("Error playing pop sound:", error);
    }
  };

  const playButtonPressSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/audio/buttonpress.mp3")
      );
      await sound.playAsync();
      // Unload after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log("Error playing button press sound:", error);
    }
  };

  const getVideoSource = () => {
    switch (currentVideoScene) {
      case 'l2_main':
        return require("../assets/videos/L2Scenarios/scene1.mp4");
      case 'l2_exclude1':
        return require("../assets/videos/L2Scenarios/exclude1.mp4");
      case 'l2_ignore1':
        return require("../assets/videos/L2Scenarios/ignore1.mp4");
      case 'l2_defend1':
        return require("../assets/videos/L2Scenarios/defend1.mp4");
      case 'l2_friendship1':
        return require("../assets/videos/L2Scenarios/friendship1.mp4");
      case 'l2_goodending1':
        return require("../assets/videos/L2Scenarios/goodending1.mp4");
      default:
        return require("../assets/videos/L2Scenarios/scene1.mp4");
    }
  };

  const isLooping = false;

  const getCharacterBadgeColor = () => {
    switch (currentCharacter) {
      case 'Carlos':
        return 'rgba(59, 130, 246, 0.9)'; // Blue
      case 'RandomStudentA':
        return 'rgba(156, 163, 175, 0.9)'; // Gray
      case 'RandomStudentB':
        return 'rgba(156, 163, 175, 0.9)'; // Gray
      case 'Teacher':
        return 'rgba(59, 130, 246, 0.9)'; // Blue
      case 'Aiko':
        return 'rgba(147, 51, 234, 0.9)'; // Purple
      case 'Maria':
        return 'rgba(236, 72, 153, 0.9)'; // Pink
      case 'Miguel':
        return 'rgba(34, 197, 94, 0.9)'; // Green
      default:
        return 'rgba(59, 130, 246, 0.9)';
    }
  };

  const handleCharacterDialogueClick = () => {
    // If typing is still in progress, complete it immediately (skip animation)
    if (characterTypedText.length < currentDialogueSet[currentCharacterDialogue]?.length) {
      if (characterTypingIntervalRef.current) {
        clearInterval(characterTypingIntervalRef.current);
        characterTypingIntervalRef.current = null;
      }
      setCharacterTypedText(currentDialogueSet[currentCharacterDialogue]);
      return; // User needs to click again to advance
    }

    // Text is fully typed - move to next dialogue or show choices
    if (currentCharacterDialogue < currentDialogueSet.length - 1) {
      // Clear any existing interval
      if (characterTypingIntervalRef.current) {
        clearInterval(characterTypingIntervalRef.current);
        characterTypingIntervalRef.current = null;
      }
      
      playPopSound(); // Play pop sound for next dialogue
      
      // Advance to next dialogue
      const nextIndex = currentCharacterDialogue + 1;
      setCurrentCharacterDialogue(nextIndex);
      setCharacterTypedText(""); // Reset typed text
      
      // Start typing animation for next dialogue immediately
      const nextText = currentDialogueSet[nextIndex];
      if (nextText) {
        let index = 0;
        characterTypingIntervalRef.current = setInterval(() => {
          if (index < nextText.length) {
            setCharacterTypedText(nextText.substring(0, index + 1));
            index++;
          } else {
            clearInterval(characterTypingIntervalRef.current);
            characterTypingIntervalRef.current = null;
          }
        }, 40);
      }
    } else {
      // Last dialogue in set
      
      // Special case: Random Student A's dialogue at 30s -> Switch to Random Student B
      if (currentVideoScene === 'l2_main' && currentCharacter === 'RandomStudentA' && currentDialogueSet[0] === "Ayan ba yung bago nating kaklase? Ang dumi pala ng damit, parang pinaglumaan pa.") {
        // Clear any existing interval
        if (characterTypingIntervalRef.current) {
          clearInterval(characterTypingIntervalRef.current);
          characterTypingIntervalRef.current = null;
        }
        
        playPopSound();
        setCurrentCharacter('RandomStudentB');
        const newDialogue = "Oo nga eh, ang itim pa niya, mukha talaga siyang madumi.";
        setCurrentDialogueSet([newDialogue]);
        setCurrentCharacterDialogue(0);
        setCharacterTypedText("");
        
        // Manually start typing animation for RandomStudentB
        let index = 0;
        characterTypingIntervalRef.current = setInterval(() => {
          if (index < newDialogue.length) {
            setCharacterTypedText(newDialogue.substring(0, index + 1));
            index++;
          } else {
            clearInterval(characterTypingIntervalRef.current);
            characterTypingIntervalRef.current = null;
          }
        }, 40);
        
        return;
      }
      
      // Special case: Random Student B's dialogue at 30s -> Switch to video playback
      if (currentVideoScene === 'l2_main' && currentCharacter === 'RandomStudentB' && currentDialogueSet[0] === "Oo nga eh, ang itim pa niya, mukha talaga siyang madumi.") {
        setShowCharacterDialogue(false);
        setIsFrozen(false);
        videoRef.current?.playAsync();
        return;
      }
      
      // Special case: Carlos' 1st dialogue at 40s (single dialogue) -> Resume video for 2 seconds
      if (currentVideoScene === 'l2_main' && currentCharacter === 'Carlos' && currentDialogueSet[0] === "Psst! Tingnan mo yung bagong estudyante" && currentDialogueSet.length === 1) {
        setShowCharacterDialogue(false);
        setIsFrozen(false);
        videoRef.current?.playAsync();
        return;
      }
      
      // Special case: Carlos' 2nd set of dialogues at 42s (after 2nd dialogue) -> Resume video
      if (currentVideoScene === 'l2_main' && currentCharacter === 'Carlos' && currentDialogueSet[1] === "Ayoko siyang maging kagrupo natin") {
        setShowCharacterDialogue(false);
        setIsFrozen(false);
        videoRef.current?.playAsync();
        return;
      }
      
      // Special case: Aiko's dialogues in defend1 scene -> Resume video
      if (currentVideoScene === 'l2_defend1' && currentCharacter === 'Aiko') {
        setShowCharacterDialogue(false);
        setIsFrozen(false);
        videoRef.current?.playAsync();
        return;
      }
      
      // Special case: Maria's last dialogue in defend1 -> Resume and let video play to end
      if (currentVideoScene === 'l2_defend1' && currentCharacter === 'Maria' && currentDialogueSet[1] === "Baka naman kailangan niya ng kaibigan, tulad natin.") {
        setShowCharacterDialogue(false);
        setIsFrozen(false);
        videoRef.current?.playAsync();
        return;
      }
      
      // Special case: All dialogues in friendship1 scene -> Resume video
      if (currentVideoScene === 'l2_friendship1' && (currentCharacter === 'Aiko' || currentCharacter === 'Maria' || currentCharacter === 'Miguel')) {
        setShowCharacterDialogue(false);
        setIsFrozen(false);
        videoRef.current?.playAsync();
        return;
      }
      
      // Default: show choices if available
      if (currentChoiceSet.length > 0) {
        setShowChoices(true);
        Animated.timing(choicesOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handleChoice = async (action: string) => {
    console.log(`User chose action: ${action}`);
    
    // Play button press sound
    playButtonPressSound();
    
    setShowCharacterDialogue(false);
    setShowChoices(false);
    setIsFrozen(false);
    setCurrentCharacterDialogue(0);
    setCharacterTypedText("");
    
    Animated.timing(characterDialogueOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(choicesOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    switch (action) {
      case 'exclude':
        // User chose to exclude Miguel - play exclude1.mp4
        setCurrentVideoScene('l2_exclude1');
        setTimeout(() => {
          videoRef.current?.playAsync();
        }, 100);
        break;
        
      case 'ignore':
        // User chose to ignore - play ignore1.mp4
        setCurrentVideoScene('l2_ignore1');
        setTimeout(() => {
          videoRef.current?.playAsync();
        }, 100);
        break;
        
      case 'defend':
        // User chose to defend Miguel - play defend1.mp4
        setCurrentVideoScene('l2_defend1');
        // Reset defend1 freeze flags
        setDefend1_15sFreezeTriggered(false);
        setDefend1_20sFreezeTriggered(false);
        setDefend1_35sFreezeTriggered(false);
        setTimeout(() => {
          videoRef.current?.playAsync();
        }, 100);
        break;
    }
  };

  const handleTryAgain = () => {
    // Reset to intro screen
    setShowBadEnding(false);
    setShowIntro(true);
    setCurrentVideoScene('l2_main');
    setIsFrozen(false);
    setShowCharacterDialogue(false);
    setShowChoices(false);
    setCurrentCharacterDialogue(0);
    setCharacterTypedText("");
    setShowSubtitle(false);
    setCurrentSubtitleIndex(0);
    setTypedText("");
    setIsMonologue(false);
    // Reset freeze frame flags
    setScene1_30sFreezeTriggered(false);
    setScene1_40sFreezeTriggered(false);
    setScene1_42sFreezeTriggered(false);
    setScene1_EndFreezeTriggered(false);
    setDefend1_15sFreezeTriggered(false);
    setDefend1_20sFreezeTriggered(false);
    setDefend1_35sFreezeTriggered(false);
    setFriendship1_5sFreezeTriggered(false);
    setFriendship1_11sFreezeTriggered(false);
    setFriendship1_16sFreezeTriggered(false);
    setFriendship1_21sFreezeTriggered(false);
    badEndingOpacity.setValue(0);
  };

  if (showIntro) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.introContainer}>
          <ScrollView 
          style={styles.introScrollView}
          contentContainerStyle={styles.introScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.introContent,
              {
                opacity: introOpacity,
                transform: [{ scale: introScale }],
              },
            ]}
          >
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>⭐⭐ Medium</Text>
            </View>
            
            <Text style={styles.scenarioTitle}>
              Ang Bagong Kaklase
            </Text>
            
            <Text style={styles.scenarioDescription}>
              Ikaw si Aiko, isang mag-aaral sa klase. May bagong estudyanteng dumating na si Miguel. Napansin ng mga kaklase na mahirap siya at may iba't ibang itsura. Nagsimula ang diskriminasyon at pang-aapi.{"\n\n"}
              Ang iyong mga desisyon ay magpapakita kung paano mo pinahahalagahan ang <Text style={{ fontWeight: "bold", color: "#6B73FF" }}>dignidad ng bawat tao</Text>, ang <Text style={{ fontWeight: "bold", color: "#6B73FF" }}>paggalang</Text>, at ang <Text style={{ fontWeight: "bold", color: "#6B73FF" }}>pagkakapantay-pantay</Text>.
            </Text>
            
            <View style={styles.introButtonContainer}>
              <TouchableOpacity 
                style={styles.playButton} 
                onPress={handleStartScenario}
              >
                <Text style={styles.playButtonText}>▶ Magsimula</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.backButtonIntro} 
                onPress={handleGoBack}
              >
                <Text style={styles.backButtonIntroText}>Bumalik</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
      <Animated.View style={{ flex: 1, opacity: videoOpacity }}>
        <Video
          key={currentVideoScene}
          ref={videoRef}
          source={getVideoSource()}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping={isLooping}
          onPlaybackStatusUpdate={(status) => {
            if (!status.isLoaded) return;

            const currentTime = status.positionMillis / 1000; // Convert to seconds
            console.log(`Scene: ${currentVideoScene}, Time: ${currentTime.toFixed(2)}s`);

            // MAIN SCENE (scene1.mp4) - Miguel arrives
            if (currentVideoScene === 'l2_main') {
              // Narrator subtitle 1 at 10 seconds
              if (currentTime >= 10 && currentTime < 10.5 && currentSubtitleIndex === 0 && !showSubtitle) {
                setShowSubtitle(true);
                setCurrentSubtitleIndex(0);
                setTypedText("");
                
                subtitleOpacity.setValue(0);
                subtitleSlideUp.setValue(20);
                
                playPopSound();
                
                Animated.parallel([
                  Animated.timing(subtitleOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                  }),
                  Animated.timing(subtitleSlideUp, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                  }),
                ]).start();
              }

              // Narrator subtitle 2 at 15 seconds
              if (currentTime >= 15 && currentTime < 15.5 && currentSubtitleIndex === 0) {
                setCurrentSubtitleIndex(1);
                setTypedText("");
                playPopSound();
              }

              // Narrator subtitle 3 at 20 seconds
              if (currentTime >= 20 && currentTime < 20.5 && currentSubtitleIndex === 1) {
                setCurrentSubtitleIndex(2);
                setTypedText("");
                playPopSound();
              }

              // Narrator subtitle 4 at 25 seconds
              if (currentTime >= 25 && currentTime < 25.5 && currentSubtitleIndex === 2) {
                setCurrentSubtitleIndex(3);
                setTypedText("");
                playPopSound();
              }

              // Typing animation for narrator subtitles
              if (showSubtitle && typedText.length < subtitles[currentSubtitleIndex].length && !typingIntervalRef.current) {
                let index = typedText.length;
                typingIntervalRef.current = setInterval(() => {
                  if (index < subtitles[currentSubtitleIndex].length) {
                    setTypedText(subtitles[currentSubtitleIndex].substring(0, index + 1));
                    index++;
                  } else {
                    clearInterval(typingIntervalRef.current);
                    typingIntervalRef.current = null;
                  }
                }, 30);
              }

              // Hide subtitles at 30 seconds (before freeze)
              if (currentTime >= 29.5 && showSubtitle) {
                setShowSubtitle(false);
                if (typingIntervalRef.current) {
                  clearInterval(typingIntervalRef.current);
                  typingIntervalRef.current = null;
                }
              }

              // FREEZE at 30 seconds for Random Students dialogue
              if (currentTime >= 30 && currentTime < 30.5 && !scene1_30sFreezeTriggered && !isFrozen) {
                videoRef.current?.pauseAsync();
                setIsFrozen(true);
                setScene1_30sFreezeTriggered(true);
                setShowSubtitle(false); // Hide narrator subtitles
                setCurrentCharacter('RandomStudentA');
                setCurrentDialogueSet([
                  "Ayan ba yung bago nating kaklase? Ang dumi pala ng damit, parang pinaglumaan pa."
                ]);
                setCurrentChoiceSet([]);
                setShowCharacterDialogue(true);
                setCurrentCharacterDialogue(0);
                setCharacterTypedText("");

                // Play pop sound effect
                playPopSound();

                // Animate character dialogue in
                characterDialogueOpacity.setValue(0);
                Animated.timing(characterDialogueOpacity, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }).start();
              }

              // After Random Student A's dialogue, switch to Random Student B
              if (currentTime >= 30 && isFrozen && scene1_30sFreezeTriggered && showCharacterDialogue && currentCharacter === 'RandomStudentA' && characterTypedText === currentDialogueSet[0]) {
                // This will be handled in handleCharacterDialogueClick when user clicks
              }

              // FREEZE at 40 seconds for Carlos' 1st dialogue
              if (currentTime >= 40 && currentTime < 40.5 && !scene1_40sFreezeTriggered && !isFrozen) {
                videoRef.current?.pauseAsync();
                setIsFrozen(true);
                setScene1_40sFreezeTriggered(true);
                setCurrentCharacter('Carlos');
                setCurrentDialogueSet([
                  "Psst! Tingnan mo yung bagong estudyante"
                ]);
                setCurrentChoiceSet([]);
                setShowCharacterDialogue(true);
                setCurrentCharacterDialogue(0);
                setCharacterTypedText("");

                playPopSound();

                characterDialogueOpacity.setValue(0);
                Animated.timing(characterDialogueOpacity, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }).start();
              }

              // After Carlos' 1st dialogue ends, play video for 2 seconds then freeze for 2nd dialogue
              if (currentTime >= 42 && currentTime < 42.5 && scene1_40sFreezeTriggered && !scene1_42sFreezeTriggered && !showCharacterDialogue && !isFrozen) {
                videoRef.current?.pauseAsync();
                setIsFrozen(true);
                setScene1_42sFreezeTriggered(true);
                setCurrentCharacter('Carlos');
                setCurrentDialogueSet([
                  "Mukha siyang napakahirap, luma pa ang damit!",
                  "Ayoko siyang maging kagrupo natin"
                ]);
                setCurrentChoiceSet([]);
                setShowCharacterDialogue(true);
                setCurrentCharacterDialogue(0);
                setCharacterTypedText("");

                playPopSound();

                characterDialogueOpacity.setValue(0);
                Animated.timing(characterDialogueOpacity, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }).start();
              }

              // At end of video, show Carlos' 3rd dialogue with choices
              if (status.durationMillis && currentTime >= (status.durationMillis / 1000) - 0.5 && !scene1_EndFreezeTriggered && !isFrozen) {
                videoRef.current?.pauseAsync();
                setIsFrozen(true);
                setScene1_EndFreezeTriggered(true);
                setCurrentCharacter('Carlos');
                setCurrentDialogueSet([
                  "Ano sa tingin mo Aiko? Dapat ba nating lapitan siya?"
                ]);
                setCurrentChoiceSet([
                  { text: "Oo nga, huwag na natin siyang lapitan", action: "exclude" },
                  { text: "Hayaan na lang natin siya", action: "ignore" },
                  { text: "Bakit naman? Tao rin siya, may dignidad din siya tulad natin", action: "defend" }
                ]);
                setShowCharacterDialogue(true);
                setCurrentCharacterDialogue(0);
                setCharacterTypedText("");

                playPopSound();

                characterDialogueOpacity.setValue(0);
                Animated.timing(characterDialogueOpacity, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }).start();
              }
            }

            // Start typing animation for character dialogue
            if (showCharacterDialogue && currentDialogueSet[currentCharacterDialogue]) {
              const targetText = currentDialogueSet[currentCharacterDialogue];
              if (characterTypedText.length < targetText.length && !characterTypingIntervalRef.current) {
                let index = characterTypedText.length;
                characterTypingIntervalRef.current = setInterval(() => {
                  if (index < targetText.length) {
                    setCharacterTypedText(targetText.substring(0, index + 1));
                    index++;
                  } else {
                    clearInterval(characterTypingIntervalRef.current);
                    characterTypingIntervalRef.current = null;
                  }
                }, 40);
              }
            }

            // DEFEND1 SCENE - Aiko defends Miguel
            if (currentVideoScene === 'l2_defend1') {
              // FREEZE at 15 seconds for Aiko's 1st dialogue
              if (currentTime >= 15 && currentTime < 15.5 && !defend1_15sFreezeTriggered && !isFrozen) {
                videoRef.current?.pauseAsync();
                setIsFrozen(true);
                setDefend1_15sFreezeTriggered(true);
                setCurrentCharacter('Aiko');
                setCurrentDialogueSet([
                  "Sandali lang! Bakit natin siya huhusgahan base sa hitsura niya?"
                ]);
                setCurrentChoiceSet([]);
                setShowCharacterDialogue(true);
                setCurrentCharacterDialogue(0);
                setCharacterTypedText("");
                setIsMonologue(false);

                playPopSound();

                characterDialogueOpacity.setValue(0);
                Animated.timing(characterDialogueOpacity, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }).start();
              }

              // FREEZE at 20 seconds for Aiko's 2nd dialogue
              if (currentTime >= 20 && currentTime < 20.5 && defend1_15sFreezeTriggered && !defend1_20sFreezeTriggered && !showCharacterDialogue && !isFrozen) {
                videoRef.current?.pauseAsync();
                setIsFrozen(true);
                setDefend1_20sFreezeTriggered(true);
                setCurrentCharacter('Aiko');
                setCurrentDialogueSet([
                  "Lahat tayo ay pantay-pantay, walang mas mataas o mas mababa."
                ]);
                setCurrentChoiceSet([]);
                setShowCharacterDialogue(true);
                setCurrentCharacterDialogue(0);
                setCharacterTypedText("");
                setIsMonologue(false);

                playPopSound();

                characterDialogueOpacity.setValue(0);
                Animated.timing(characterDialogueOpacity, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }).start();
              }

              // MONOLOGUE from 20s to 30s (after 2nd dialogue is clicked, during video playback)
              if (currentTime >= 20 && currentTime < 30 && defend1_20sFreezeTriggered && !showCharacterDialogue && !isFrozen && !showSubtitle) {
                setShowSubtitle(true);
                setIsMonologue(true);
                setCurrentCharacter('Aiko');
                setTypedText("Alam kong tama ang ginawa ko. Ang dignidad ng tao ay hindi nakadepende sa materyal na bagay.");
                
                subtitleOpacity.setValue(0);
                subtitleSlideUp.setValue(20);
                
                Animated.parallel([
                  Animated.timing(subtitleOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                  }),
                  Animated.timing(subtitleSlideUp, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                  }),
                ]).start();
              }

              // Hide monologue at 30 seconds
              if (currentTime >= 30 && showSubtitle && isMonologue) {
                setShowSubtitle(false);
                setIsMonologue(false);
              }

              // FREEZE at 35 seconds for Maria's dialogues
              if (currentTime >= 35 && currentTime < 35.5 && !defend1_35sFreezeTriggered && !isFrozen) {
                videoRef.current?.pauseAsync();
                setIsFrozen(true);
                setDefend1_35sFreezeTriggered(true);
                setCurrentCharacter('Maria');
                setCurrentDialogueSet([
                  "Tama ka Aiko! Hindi tayo dapat manghusga.",
                  "Baka naman kailangan niya ng kaibigan, tulad natin."
                ]);
                setCurrentChoiceSet([]);
                setShowCharacterDialogue(true);
                setCurrentCharacterDialogue(0);
                setCharacterTypedText("");
                setIsMonologue(false);

                playPopSound();

                characterDialogueOpacity.setValue(0);
                Animated.timing(characterDialogueOpacity, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }).start();
              }

              // Transition to friendship1.mp4 after video ends
              if (status.durationMillis && currentTime >= (status.durationMillis / 1000) - 0.5 && defend1_35sFreezeTriggered && !showCharacterDialogue) {
                setCurrentVideoScene('l2_friendship1');
                // Reset friendship1 freeze flags
                setFriendship1_5sFreezeTriggered(false);
                setFriendship1_11sFreezeTriggered(false);
                setFriendship1_16sFreezeTriggered(false);
                setFriendship1_21sFreezeTriggered(false);
                setTimeout(() => {
                  videoRef.current?.playAsync();
                }, 100);
              }
            }

            // FRIENDSHIP1 SCENE - Aiko and Maria befriend Miguel
            if (currentVideoScene === 'l2_friendship1') {
              // FREEZE at 5 seconds for Aiko's introduction
              if (currentTime >= 5 && currentTime < 5.5 && !friendship1_5sFreezeTriggered && !isFrozen) {
                videoRef.current?.pauseAsync();
                setIsFrozen(true);
                setFriendship1_5sFreezeTriggered(true);
                setCurrentCharacter('Aiko');
                setCurrentDialogueSet([
                  "Hi Miguel! Ako si Aiko"
                ]);
                setCurrentChoiceSet([]);
                setShowCharacterDialogue(true);
                setCurrentCharacterDialogue(0);
                setCharacterTypedText("");
                setIsMonologue(false);

                playPopSound();

                characterDialogueOpacity.setValue(0);
                Animated.timing(characterDialogueOpacity, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }).start();
              }

              // FREEZE at 11 seconds for Aiko introducing Maria
              if (currentTime >= 11 && currentTime < 11.5 && friendship1_5sFreezeTriggered && !friendship1_11sFreezeTriggered && !showCharacterDialogue && !isFrozen) {
                videoRef.current?.pauseAsync();
                setIsFrozen(true);
                setFriendship1_11sFreezeTriggered(true);
                setCurrentCharacter('Aiko');
                setCurrentDialogueSet([
                  "Siya si Maria"
                ]);
                setCurrentChoiceSet([]);
                setShowCharacterDialogue(true);
                setCurrentCharacterDialogue(0);
                setCharacterTypedText("");
                setIsMonologue(false);

                playPopSound();

                characterDialogueOpacity.setValue(0);
                Animated.timing(characterDialogueOpacity, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }).start();
              }

              // FREEZE at 16 seconds for Aiko asking to sit
              if (currentTime >= 16 && currentTime < 16.5 && friendship1_11sFreezeTriggered && !friendship1_16sFreezeTriggered && !showCharacterDialogue && !isFrozen) {
                videoRef.current?.pauseAsync();
                setIsFrozen(true);
                setFriendship1_16sFreezeTriggered(true);
                setCurrentCharacter('Aiko');
                setCurrentDialogueSet([
                  "Pwede ba kaming umupo dito?"
                ]);
                setCurrentChoiceSet([]);
                setShowCharacterDialogue(true);
                setCurrentCharacterDialogue(0);
                setCharacterTypedText("");
                setIsMonologue(false);

                playPopSound();

                characterDialogueOpacity.setValue(0);
                Animated.timing(characterDialogueOpacity, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }).start();
              }

              // FREEZE at 21 seconds for Miguel's response
              if (currentTime >= 21 && currentTime < 21.5 && friendship1_16sFreezeTriggered && !friendship1_21sFreezeTriggered && !showCharacterDialogue && !isFrozen) {
                videoRef.current?.pauseAsync();
                setIsFrozen(true);
                setFriendship1_21sFreezeTriggered(true);
                setCurrentCharacter('Miguel');
                setCurrentDialogueSet([
                  "Opo! Salamat po!"
                ]);
                setCurrentChoiceSet([]);
                setShowCharacterDialogue(true);
                setCurrentCharacterDialogue(0);
                setCharacterTypedText("");
                setIsMonologue(false);

                playPopSound();

                characterDialogueOpacity.setValue(0);
                Animated.timing(characterDialogueOpacity, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }).start();
              }

              // NARRATOR at 25 seconds
              if (currentTime >= 25 && currentTime < 37 && friendship1_21sFreezeTriggered && !showSubtitle && !isFrozen) {
                setShowSubtitle(true);
                setIsMonologue(false);
                setTypedText("Makikita natin dito na masayang nakikipag-usap si Miguel kela Aiko at Maria.");
                
                subtitleOpacity.setValue(0);
                subtitleSlideUp.setValue(20);
                
                playPopSound();
                
                Animated.parallel([
                  Animated.timing(subtitleOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                  }),
                  Animated.timing(subtitleSlideUp, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                  }),
                ]).start();
              }

              // Hide narrator at 37 seconds
              if (currentTime >= 37 && showSubtitle) {
                setShowSubtitle(false);
              }

              // Transition to goodending1.mp4 at end
              if (status.durationMillis && currentTime >= (status.durationMillis / 1000) - 0.5 && friendship1_21sFreezeTriggered && !showCharacterDialogue) {
                setCurrentVideoScene('l2_goodending1');
                setTimeout(() => {
                  videoRef.current?.playAsync();
                }, 100);
              }
            }

            // BAD ENDING 1 - exclude1.mp4 ends
            if (currentVideoScene === 'l2_exclude1' && status.durationMillis && currentTime >= (status.durationMillis / 1000) - 0.5) {
              if (!showBadEnding) {
                videoRef.current?.pauseAsync();
                setShowBadEnding(true);
                setBadEndingMessage("Ang pagbabahale-wala sa dignidad ng kapwa ay nagdudulot ng sakit at kawalan ng respeto. Lahat tayo ay may karapatang tratuhin ng may paggalang.");
                
                // Play game over sound
                const playGameOverSound = async () => {
                  try {
                    const { sound } = await Audio.Sound.createAsync(
                      require("../assets/audio/gameover.mp3")
                    );
                    await sound.playAsync();
                    sound.setOnPlaybackStatusUpdate((status) => {
                      if (status.isLoaded && status.didJustFinish) {
                        sound.unloadAsync();
                      }
                    });
                  } catch (error) {
                    console.log("Error playing game over sound:", error);
                  }
                };
                playGameOverSound();
                
                badEndingOpacity.setValue(0);
                Animated.timing(badEndingOpacity, {
                  toValue: 1,
                  duration: 500,
                  useNativeDriver: true,
                }).start();
              }
            }

            // BAD ENDING 2 - ignore1.mp4 ends
            if (currentVideoScene === 'l2_ignore1' && status.durationMillis && currentTime >= (status.durationMillis / 1000) - 0.5) {
              if (!showBadEnding) {
                videoRef.current?.pauseAsync();
                setShowBadEnding(true);
                setBadEndingMessage("Ang pagiging tahimik sa panahon ng pang-aapi ay katumbas ng pagsang-ayon dito. Dapat tayong tumayo para sa dignidad ng bawat isa.");
                
                const playGameOverSound = async () => {
                  try {
                    const { sound } = await Audio.Sound.createAsync(
                      require("../assets/audio/gameover.mp3")
                    );
                    await sound.playAsync();
                    sound.setOnPlaybackStatusUpdate((status) => {
                      if (status.isLoaded && status.didJustFinish) {
                        sound.unloadAsync();
                      }
                    });
                  } catch (error) {
                    console.log("Error playing game over sound:", error);
                  }
                };
                playGameOverSound();
                
                badEndingOpacity.setValue(0);
                Animated.timing(badEndingOpacity, {
                  toValue: 1,
                  duration: 500,
                  useNativeDriver: true,
                }).start();
              }
            }

            // GOOD ENDING - goodending1.mp4 ends
            if (currentVideoScene === 'l2_goodending1' && status.durationMillis && currentTime >= (status.durationMillis / 1000) - 0.5) {
              if (!showCongrats) {
                videoRef.current?.pauseAsync();
                setShowCongrats(true);
                
                // Play victory sound
                const playVictorySound = async () => {
                  try {
                    const { sound } = await Audio.Sound.createAsync(
                      require("../assets/audio/victory.mp3")
                    );
                    await sound.playAsync();
                    sound.setOnPlaybackStatusUpdate((status) => {
                      if (status.isLoaded && status.didJustFinish) {
                        sound.unloadAsync();
                      }
                    });
                  } catch (error) {
                    console.log("Error playing victory sound:", error);
                  }
                };
                playVictorySound();
                
                congratsOpacity.setValue(0);
                congratsScale.setValue(0);
                Animated.parallel([
                  Animated.timing(congratsOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                  }),
                  Animated.spring(congratsScale, {
                    toValue: 1,
                    friction: 5,
                    useNativeDriver: true,
                  }),
                ]).start();
              }
            }
          }}
        />
      </Animated.View>

      {/* Narrator Subtitles (Main Scene Only) */}
      {showSubtitle && currentVideoScene === 'l2_main' && (
        <Animated.View
          style={[
            styles.subtitleContainer,
            {
              opacity: subtitleOpacity,
              transform: [{ translateY: subtitleSlideUp }],
            },
          ]}
        >
          <Text style={styles.subtitleText}>
            {typedText}
            {typedText.length < subtitles[currentSubtitleIndex].length && (
              <Text style={styles.cursor}>▊</Text>
            )}
          </Text>
        </Animated.View>
      )}

      {/* Narrator Subtitles for Other Scenes (if needed) */}
      {showSubtitle && currentVideoScene !== 'l2_main' && (
        <Animated.View
          style={[
            styles.subtitleContainer,
            {
              opacity: subtitleOpacity,
              transform: [{ translateY: subtitleSlideUp }],
            },
          ]}
        >
          <Text style={styles.subtitleText}>
            {typedText}
            {typedText.length < subtitles[currentSubtitleIndex]?.length && (
              <Text style={styles.cursor}>▊</Text>
            )}
          </Text>
        </Animated.View>
      )}

      {/* Character Dialogue */}
      {showCharacterDialogue && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleCharacterDialogueClick}
        >
          <Animated.View
            style={[
              styles.characterDialogueContainer,
              {
                opacity: characterDialogueOpacity,
                borderColor: getCharacterBadgeColor(),
              },
            ]}
          >
            <View
              style={[
                styles.characterNameBadge,
                { backgroundColor: getCharacterBadgeColor() },
              ]}
            >
              <Text style={styles.characterName}>{currentCharacter}</Text>
            </View>

            <View style={styles.characterDialogueText}>
              <Text style={[styles.dialogueText, isMonologue && { fontStyle: 'italic' }]}>
                {characterTypedText}
                {characterTypedText.length < currentDialogueSet[currentCharacterDialogue]?.length && (
                  <Text style={styles.cursor}>▊</Text>
                )}
              </Text>

              {characterTypedText === currentDialogueSet[currentCharacterDialogue] && (
                <Text style={styles.nextIndicator}>▶</Text>
              )}
            </View>
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* Choices */}
      {showChoices && (
        <Animated.View
          style={[
            styles.choicesContainer,
            { opacity: choicesOpacity },
          ]}
        >
          {currentChoiceSet.map((choice, index) => (
            <TouchableOpacity
              key={index}
              style={styles.choiceButton}
              onPress={() => handleChoice(choice.action)}
            >
              <Text style={styles.choiceText}>{choice.text}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* Persona 3 Congratulations Screen */}
      {showCongrats && (
        <Animated.View
          style={[
            styles.persona3CongratsContainer,
            {
              opacity: congratsOpacity,
              transform: [{ scale: congratsScale }],
            },
          ]}
        >
          <View style={styles.persona3CongratsCard}>
            <Text style={styles.persona3CongratsTitle}>SCENARIO COMPLETE</Text>
            <View style={styles.persona3Divider} />
            <Text style={styles.persona3CongratsMessage}>
              Ipinakita mo ang tunay na paggalang sa dignidad ng kapwa. Natutunan mong lahat ng tao ay may pantay na halaga anuman ang kanilang kalagayan sa buhay.
            </Text>
            <Text style={styles.persona3CongratsValue}>
              Dignidad • Paggalang • Pagkakapantay-pantay
            </Text>
            <TouchableOpacity
              style={styles.persona3BackButton}
              onPress={handleGoBack}
            >
              <Text style={styles.persona3BackButtonText}>▶ RETURN TO SCENARIOS</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Bad Ending Screen */}
      {showBadEnding && (
        <Animated.View
          style={[
            styles.badEndingContainer,
            { opacity: badEndingOpacity },
          ]}
        >
          <View style={styles.badEndingCard}>
            <Text style={styles.badEndingTitle}>MALI ANG DESISYON</Text>
            <View style={[styles.persona3Divider, { backgroundColor: "#ef4444" }]} />
            <Text style={styles.badEndingMessage}>
              {badEndingMessage}
            </Text>
            <TouchableOpacity
              style={styles.tryAgainButton}
              onPress={handleTryAgain}
            >
              <Text style={styles.tryAgainButtonText}>↻ Subukan Muli</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.backButtonIntro, { marginTop: 10 }]}
              onPress={handleGoBack}
            >
              <Text style={styles.backButtonIntroText}>Bumalik</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
    </>
  );
}
