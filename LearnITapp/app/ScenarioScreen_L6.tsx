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

export default function ScenarioScreenL6() {
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
  
  // L6 Video Scenes: main, badrun1, badrun2, safety1, evacuation1, goodending1
  const [currentVideoScene, setCurrentVideoScene] = useState<
    'l6_main' | 'l6_badrun1' | 'l6_badrun2' | 'l6_safety1' | 'l6_evacuation1' | 'l6_goodending1'
  >('l6_main');
  
  const [currentCharacter, setCurrentCharacter] = useState<'Carlos' | 'Teacher' | 'Aiko' | 'Maria'>('Carlos');
  const [currentDialogueSet, setCurrentDialogueSet] = useState<string[]>([]);
  const [currentChoiceSet, setCurrentChoiceSet] = useState<Array<{text: string, action: string}>>([]);
  const [showBadEnding, setShowBadEnding] = useState(false);
  const [badEndingMessage, setBadEndingMessage] = useState("");
  const [isMonologue, setIsMonologue] = useState(false);
  
  // Flags to prevent re-triggering freeze frames
  const [evacuation20sFreezeTriggered, setEvacuation20sFreezeTriggered] = useState(false);
  const [evacuation23sFreezeTriggered, setEvacuation23sFreezeTriggered] = useState(false);
  const [evacuation38sFreezeTriggered, setEvacuation38sFreezeTriggered] = useState(false);
  const [goodending1sFreezeTriggered, setGoodending1sFreezeTriggered] = useState(false);
  
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

  // Narrator subtitles for L6 main scene
  const subtitles = [
    "Nagsimula ng yumanig ang lupa habang kayo ay nag-aaral sa klase...",
    "Lumalaki ang takot ng mga estudyante sa paligid...",
    "Sa ganitong sitwasyon, bawat desisyon ay mahalaga...",
    "Ano ang tamang gawin?",
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
      backgroundColor: "#ef4444", // Red for Complex
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: "flex-start",
      marginBottom: 15,
    },
    difficultyText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    scenarioTitle: {
      color: "#fff",
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 15,
      lineHeight: 32,
    },
    scenarioDescription: {
      color: "#ccc",
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 25,
    },
    introButtonContainer: {
      gap: 12,
    },
    playButton: {
      backgroundColor: "#6B73FF",
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      shadowColor: "#6B73FF",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 5,
    },
    playButtonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
    },
    backButtonIntro: {
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: "#6B73FF",
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: "center",
    },
    backButtonIntroText: {
      color: "#6B73FF",
      fontSize: 16,
      fontWeight: "600",
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
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      padding: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: "#FFD700",
    },
    subtitleText: {
      color: "#fff",
      fontSize: 18,
      lineHeight: 26,
      fontFamily: "monospace",
    },
    cursor: {
      color: "#FFD700",
      fontWeight: "bold",
    },
    characterDialogueContainer: {
      position: "absolute",
      bottom: 100,
      left: 20,
      right: 20,
      backgroundColor: "rgba(0, 0, 0, 0.95)",
      borderRadius: 15,
      borderWidth: 3,
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
      padding: 20,
    },
    dialogueText: {
      color: "#fff",
      fontSize: 18,
      lineHeight: 26,
    },
    nextIndicator: {
      position: "absolute",
      bottom: 15,
      right: 20,
      color: "#FFD700",
      fontSize: 20,
      fontWeight: "bold",
    },
    choicesContainer: {
      position: "absolute",
      bottom: 180,
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
      backgroundColor: "rgba(107, 115, 255, 0.95)",
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: "#fff",
      shadowColor: "#6B73FF",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
      elevation: 5,
    },
    choiceText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
    },
    persona3CongratsContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(26, 26, 46, 0.98)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    persona3CongratsCard: {
      backgroundColor: "#1a1a2e",
      borderRadius: 15,
      padding: 30,
      maxWidth: 500,
      width: "100%",
      borderWidth: 3,
      borderColor: "#4A90E2",
      shadowColor: "#4A90E2",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 20,
      elevation: 15,
    },
    persona3CongratsTitle: {
      color: "#4A90E2",
      fontSize: 28,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 15,
      letterSpacing: 2,
      textTransform: "uppercase",
    },
    persona3Divider: {
      height: 2,
      backgroundColor: "#4A90E2",
      marginBottom: 20,
    },
    persona3CongratsMessage: {
      color: "#fff",
      fontSize: 16,
      lineHeight: 24,
      textAlign: "center",
      marginBottom: 20,
    },
    persona3CongratsValue: {
      color: "#FFD700",
      fontSize: 18,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 25,
      letterSpacing: 1,
    },
    persona3BackButton: {
      backgroundColor: "#4A90E2",
      paddingVertical: 14,
      paddingHorizontal: 25,
      borderRadius: 8,
      alignItems: "center",
      shadowColor: "#4A90E2",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 5,
    },
    persona3BackButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
      letterSpacing: 1,
    },
    badEndingContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(239, 68, 68, 0.95)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    badEndingCard: {
      backgroundColor: "#1a1a2e",
      borderRadius: 15,
      padding: 30,
      maxWidth: 500,
      width: "100%",
      borderWidth: 3,
      borderColor: "#ef4444",
      shadowColor: "#ef4444",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 20,
      elevation: 15,
    },
    badEndingTitle: {
      color: "#ef4444",
      fontSize: 28,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 15,
      letterSpacing: 2,
      textTransform: "uppercase",
    },
    badEndingMessage: {
      color: "#fff",
      fontSize: 16,
      lineHeight: 24,
      textAlign: "center",
      marginBottom: 25,
    },
    tryAgainButton: {
      backgroundColor: "#ef4444",
      paddingVertical: 14,
      paddingHorizontal: 25,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 10,
    },
    tryAgainButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
  });

  useEffect(() => {
    // Start in portrait for intro
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);

    // Fade in intro
    Animated.parallel([
      Animated.timing(introOpacity, {
        toValue: 1,
        duration: 600,
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
      case 'l6_main':
        return require("../assets/videos/L6Scenarios/scene1.mp4");
      case 'l6_badrun1':
        return require("../assets/videos/L6Scenarios/badrun1.mp4");
      case 'l6_badrun2':
        return require("../assets/videos/L6Scenarios/badrun2.mp4");
      case 'l6_safety1':
        return require("../assets/videos/L6Scenarios/safety1.mp4");
      case 'l6_evacuation1':
        return require("../assets/videos/L6Scenarios/evacuation1.mp4");
      case 'l6_goodending1':
        return require("../assets/videos/L6Scenarios/goodending1.mp4");
      default:
        return require("../assets/videos/L6Scenarios/scene1.mp4");
    }
  };

  const isLooping = false;

  const getCharacterBadgeColor = () => {
    switch (currentCharacter) {
      case 'Carlos':
        return 'rgba(59, 130, 246, 0.9)'; // Blue
      case 'Teacher':
        return 'rgba(59, 130, 246, 0.9)'; // Blue
      case 'Aiko':
        return 'rgba(147, 51, 234, 0.9)'; // Purple
      case 'Maria':
        return 'rgba(236, 72, 153, 0.9)'; // Pink
      default:
        return 'rgba(59, 130, 246, 0.9)';
    }
  };

  const playChildCryingSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/audio/childgirlcrying.mp3")
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log("Error playing child crying sound:", error);
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
      // Last dialogue in set - check for special transitions
      
      // Special case: Maria's first cry at 20s -> Switch to Aiko's inner monologue
      if (currentVideoScene === 'l6_evacuation1' && currentCharacter === 'Maria' && currentDialogueSet[0] === "Uwaah! Huhuhu") {
        playPopSound();
        setCurrentCharacter('Aiko');
        setCurrentDialogueSet(["Si Maria umiiyak, dapat tulungan natin siya para lahat tayo makalabas nang maayos at ligtas"]);
        setCurrentCharacterDialogue(0);
        setCharacterTypedText("");
        setIsMonologue(true); // Set monologue flag for italic text
        
        // Start typing for Aiko's monologue
        let index = 0;
        characterTypingIntervalRef.current = setInterval(() => {
          if (index < "Si Maria umiiyak, dapat tulungan natin siya para lahat tayo makalabas nang maayos at ligtas".length) {
            setCharacterTypedText("Si Maria umiiyak, dapat tulungan natin siya para lahat tayo makalabas nang maayos at ligtas".substring(0, index + 1));
            index++;
          } else {
            clearInterval(characterTypingIntervalRef.current);
            characterTypingIntervalRef.current = null;
          }
        }, 40);
        return;
      }
      
      // After Aiko's inner monologue at 20s -> Resume video
      if (currentVideoScene === 'l6_evacuation1' && currentCharacter === 'Aiko' && currentDialogueSet[0] === "Si Maria umiiyak, dapat tulungan natin siya para lahat tayo makalabas nang maayos at ligtas") {
        setShowCharacterDialogue(false);
        setIsFrozen(false);
        setIsMonologue(false);
        videoRef.current?.playAsync();
        return;
      }
      
      // Maria's dialogue at 23s -> Switch to Aiko
      if (currentVideoScene === 'l6_evacuation1' && currentCharacter === 'Maria' && currentDialogueSet[1] === "Aiko? Ikaw ba yan? Hindi ako makatayo.. sobrang natakot ako sa lindol!") {
        playPopSound();
        setCurrentCharacter('Aiko');
        setCurrentDialogueSet([
          "Oo Maria, ako 'to. Okay ka lang ba? May masakit ba sayo?"
        ]);
        setCurrentCharacterDialogue(0);
        setCharacterTypedText("");
        
        let index = 0;
        characterTypingIntervalRef.current = setInterval(() => {
          if (index < "Oo Maria, ako 'to. Okay ka lang ba? May masakit ba sayo?".length) {
            setCharacterTypedText("Oo Maria, ako 'to. Okay ka lang ba? May masakit ba sayo?".substring(0, index + 1));
            index++;
          } else {
            clearInterval(characterTypingIntervalRef.current);
            characterTypingIntervalRef.current = null;
          }
        }, 40);
        return;
      }
      
      // Aiko's first question -> Maria's response
      if (currentVideoScene === 'l6_evacuation1' && currentCharacter === 'Aiko' && currentDialogueSet[0] === "Oo Maria, ako 'to. Okay ka lang ba? May masakit ba sayo?") {
        playPopSound();
        setCurrentCharacter('Maria');
        setCurrentDialogueSet(["Wala Aiko, sadyang natakot lang talaga ako.."]);
        setCurrentCharacterDialogue(0);
        setCharacterTypedText("");
        
        let index = 0;
        characterTypingIntervalRef.current = setInterval(() => {
          if (index < "Wala Aiko, sadyang natakot lang talaga ako..".length) {
            setCharacterTypedText("Wala Aiko, sadyang natakot lang talaga ako..".substring(0, index + 1));
            index++;
          } else {
            clearInterval(characterTypingIntervalRef.current);
            characterTypingIntervalRef.current = null;
          }
        }, 40);
        return;
      }
      
      // Maria's response -> Aiko's reassurance
      if (currentVideoScene === 'l6_evacuation1' && currentCharacter === 'Maria' && currentDialogueSet[0] === "Wala Aiko, sadyang natakot lang talaga ako..") {
        playPopSound();
        setCurrentCharacter('Aiko');
        setCurrentDialogueSet(["Nakakatakot naman talaga ang paglindol, pero dapat makalabas muna tayo papunta sa assembly area para ma-check din ng ating guro kung okay lang tayo"]);
        setCurrentCharacterDialogue(0);
        setCharacterTypedText("");
        
        let index = 0;
        characterTypingIntervalRef.current = setInterval(() => {
          if (index < "Nakakatakot naman talaga ang paglindol, pero dapat makalabas muna tayo papunta sa assembly area para ma-check din ng ating guro kung okay lang tayo".length) {
            setCharacterTypedText("Nakakatakot naman talaga ang paglindol, pero dapat makalabas muna tayo papunta sa assembly area para ma-check din ng ating guro kung okay lang tayo".substring(0, index + 1));
            index++;
          } else {
            clearInterval(characterTypingIntervalRef.current);
            characterTypingIntervalRef.current = null;
          }
        }, 40);
        return;
      }
      
      // Aiko's reassurance -> Maria agrees
      if (currentVideoScene === 'l6_evacuation1' && currentCharacter === 'Aiko' && currentDialogueSet[0] === "Nakakatakot naman talaga ang paglindol, pero dapat makalabas muna tayo papunta sa assembly area para ma-check din ng ating guro kung okay lang tayo") {
        playPopSound();
        setCurrentCharacter('Maria');
        setCurrentDialogueSet(["Sige Aiko, sasama ako sayo"]);
        setCurrentCharacterDialogue(0);
        setCharacterTypedText("");
        
        let index = 0;
        characterTypingIntervalRef.current = setInterval(() => {
          if (index < "Sige Aiko, sasama ako sayo".length) {
            setCharacterTypedText("Sige Aiko, sasama ako sayo".substring(0, index + 1));
            index++;
          } else {
            clearInterval(characterTypingIntervalRef.current);
            characterTypingIntervalRef.current = null;
          }
        }, 40);
        return;
      }
      
      // Maria agrees -> Aiko's final encouragement
      if (currentVideoScene === 'l6_evacuation1' && currentCharacter === 'Maria' && currentDialogueSet[0] === "Sige Aiko, sasama ako sayo") {
        playPopSound();
        setCurrentCharacter('Aiko');
        setCurrentDialogueSet(["Mhm! Tara, sasamahan kita para hindi ka na matakot"]);
        setCurrentCharacterDialogue(0);
        setCharacterTypedText("");
        
        let index = 0;
        characterTypingIntervalRef.current = setInterval(() => {
          if (index < "Mhm! Tara, sasamahan kita para hindi ka na matakot".length) {
            setCharacterTypedText("Mhm! Tara, sasamahan kita para hindi ka na matakot".substring(0, index + 1));
            index++;
          } else {
            clearInterval(characterTypingIntervalRef.current);
            characterTypingIntervalRef.current = null;
          }
        }, 40);
        return;
      }
      
      // After Aiko's final encouragement at 23s -> Resume video
      if (currentVideoScene === 'l6_evacuation1' && currentCharacter === 'Aiko' && currentDialogueSet[0] === "Mhm! Tara, sasamahan kita para hindi ka na matakot") {
        setShowCharacterDialogue(false);
        setIsFrozen(false);
        videoRef.current?.playAsync();
        return;
      }
      
      // After Teacher's dialogue at 38s -> Resume video to goodending1
      if (currentVideoScene === 'l6_evacuation1' && currentCharacter === 'Teacher' && currentDialogueSet[1] === "Dahil sa inyong kahandaan at kooperasyon, tayong lahat ay nakalabas nang maayos.") {
        setShowCharacterDialogue(false);
        setIsFrozen(false);
        videoRef.current?.playAsync();
        return;
      }
      
      // Maria thanks Aiko at 1s in goodending1 -> Switch to Aiko
      if (currentVideoScene === 'l6_goodending1' && currentCharacter === 'Maria' && currentDialogueSet[0] === "Salamat Aiko, kung hindi mo ako tinulungan doon, baka may nangyari pa saakin na hindi maganda.") {
        playPopSound();
        setCurrentCharacter('Aiko');
        setCurrentDialogueSet([
          "Walang anuman Maria! Masaya ako dahil natulungan kita, at dahil lahat tayo ligtas.",
          "Yehey!"
        ]);
        setCurrentCharacterDialogue(0);
        setCharacterTypedText("");
        
        let index = 0;
        characterTypingIntervalRef.current = setInterval(() => {
          if (index < "Walang anuman Maria! Masaya ako dahil natulungan kita, at dahil lahat tayo ligtas.".length) {
            setCharacterTypedText("Walang anuman Maria! Masaya ako dahil natulungan kita, at dahil lahat tayo ligtas.".substring(0, index + 1));
            index++;
          } else {
            clearInterval(characterTypingIntervalRef.current);
            characterTypingIntervalRef.current = null;
          }
        }, 40);
        return;
      }
      
      // After Aiko's "Yehey!" -> Resume video to completion
      if (currentVideoScene === 'l6_goodending1' && currentCharacter === 'Aiko' && currentDialogueSet[1] === "Yehey!") {
        setShowCharacterDialogue(false);
        setIsFrozen(false);
        videoRef.current?.playAsync();
        return;
      }
      
      // Default: show choices if available
      if (currentChoiceSet.length > 0 && currentVideoScene !== 'l6_safety1') {
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
      case 'bad_run':
        // User chose to run - play badrun1.mp4
        setCurrentVideoScene('l6_badrun1');
        setTimeout(() => {
          videoRef.current?.playAsync();
        }, 100);
        break;
        
      case 'safety_drop':
        // User chose Drop, Cover, Hold - play safety1.mp4
        setCurrentVideoScene('l6_safety1');
        setTimeout(() => {
          videoRef.current?.playAsync();
        }, 100);
        break;
        
      case 'rush_exit':
        // User chose to rush - play badrun2.mp4
        setCurrentVideoScene('l6_badrun2');
        setTimeout(() => {
          videoRef.current?.playAsync();
        }, 100);
        break;
        
      case 'orderly_exit':
        // User chose orderly evacuation - play evacuation1.mp4
        setCurrentVideoScene('l6_evacuation1');
        // Reset evacuation flags for this scene
        setEvacuation20sFreezeTriggered(false);
        setEvacuation23sFreezeTriggered(false);
        setEvacuation38sFreezeTriggered(false);
        setTimeout(() => {
          videoRef.current?.playAsync();
        }, 100);
        break;
        
      case 'finish':
        // Show congratulations
        setShowCongrats(true);
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
        break;
    }
  };

  const handleTryAgain = () => {
    // Reset to intro screen
    setShowBadEnding(false);
    setShowIntro(true);
    setCurrentVideoScene('l6_main');
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
    setEvacuation20sFreezeTriggered(false);
    setEvacuation23sFreezeTriggered(false);
    setEvacuation38sFreezeTriggered(false);
    setGoodending1sFreezeTriggered(false);
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
              <Text style={styles.difficultyText}>⭐⭐⭐ Complex</Text>
            </View>
            
            <Text style={styles.scenarioTitle}>
              Ang Lindol sa Paaralan
            </Text>
            
            <Text style={styles.scenarioDescription}>
              Ikaw si Aiko, isang mag-aaral na nag-aaral sa klase. Biglang nagsimula ang lupa na yumanig. Ang iyong mga desisyon sa mga susunod na sandali ay maaaring makaligtas ng buhay - hindi lamang ang iyo, kundi pati na rin ang iyong mga kaklase.{"\n\n"}
              Sa sitwasyong ito, makikita natin ang kahalagahan ng <Text style={{ fontWeight: "bold", color: "#6B73FF" }}>kahandaan, katatagan ng loob,</Text> at <Text style={{ fontWeight: "bold", color: "#6B73FF" }}>pagtulong sa kapwa</Text> sa panahon ng kalamidad.
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

            // MAIN SCENE (scene1.mp4) - Earthquake begins
            if (currentVideoScene === 'l6_main') {
              // Narrator subtitles at 10-42 seconds
              if (currentTime >= 10 && currentTime < 42 && !showSubtitle) {
                setShowSubtitle(true);
                subtitleOpacity.setValue(0);
                subtitleSlideUp.setValue(20);
                
                // Play pop sound for narrator subtitle
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

                // Start typing animation for first subtitle
                let index = 0;
                typingIntervalRef.current = setInterval(() => {
                  if (index < subtitles[currentSubtitleIndex].length) {
                    setTypedText(subtitles[currentSubtitleIndex].substring(0, index + 1));
                    index++;
                  } else {
                    clearInterval(typingIntervalRef.current);
                    // Move to next subtitle after 5 second delay
                    setTimeout(() => {
                      if (currentSubtitleIndex < subtitles.length - 1) {
                        playPopSound(); // Play pop sound for next subtitle
                        setCurrentSubtitleIndex(prev => prev + 1);
                        setTypedText("");
                      }
                    }, 5000); // 5 seconds delay
                  }
                }, 30);
              }

              // Progress through subtitles
              if (showSubtitle && typedText === "" && currentSubtitleIndex > 0 && currentSubtitleIndex < subtitles.length) {
                let index = 0;
                typingIntervalRef.current = setInterval(() => {
                  if (index < subtitles[currentSubtitleIndex].length) {
                    setTypedText(subtitles[currentSubtitleIndex].substring(0, index + 1));
                    index++;
                  } else {
                    clearInterval(typingIntervalRef.current);
                    if (currentSubtitleIndex < subtitles.length - 1) {
                      setTimeout(() => {
                        playPopSound(); // Play pop sound for next subtitle
                        setCurrentSubtitleIndex(prev => prev + 1);
                        setTypedText("");
                      }, 5000); // 5 seconds delay
                    }
                  }
                }, 30);
              }

              // FREEZE at 42 seconds for Carlos dialogue
              if (currentTime >= 42 && !showCharacterDialogue && !isFrozen) {
                videoRef.current?.pauseAsync();
                setIsFrozen(true);
                setShowSubtitle(false); // Hide narrator subtitles
                setCurrentCharacter('Carlos');
                setCurrentDialogueSet([
                  "Oh no! Lumilindol!",
                  "Baka bumagsak yung ceiling! Takbo na!",
                  "Tara na, palabas na tayo!"
                ]);
                setCurrentChoiceSet([
                  { text: "Tumakbo palabas ng classroom!", action: "bad_run" },
                  { text: "Drop, Cover, Hold! Tago sa ilalim ng mesa!", action: "safety_drop" }
                ]);
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

            // BAD ENDING 1 - badrun1.mp4 ends, show bad ending screen
            if (currentVideoScene === 'l6_badrun1' && status.durationMillis && currentTime >= (status.durationMillis / 1000) - 0.5) {
              if (!showBadEnding) {
                videoRef.current?.pauseAsync();
                setShowBadEnding(true);
                setBadEndingMessage("Ang pagtakbo sa panahon ng lindol ay maaaring magdulot ng aksidente. Ang pagkabangga at pagkahulog ng mga bagay ay mas mapanganib.");
                
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

            // SAFETY1 SCENE - Drop, Cover, Hold
            if (currentVideoScene === 'l6_safety1') {
              // Teacher dialogue 1: "Drop, Cover, and Hold!" at 0-4 seconds
              if (currentTime >= 0 && currentTime < 0.5 && !showCharacterDialogue && !showSubtitle) {
                setCurrentCharacter('Teacher');
                setCurrentDialogueSet(["Drop, Cover, and Hold!"]);
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

              // Hide teacher dialogue at 4 seconds
              if (currentTime >= 4 && currentTime < 4.5 && showCharacterDialogue && !showSubtitle) {
                setShowCharacterDialogue(false);
                setCharacterTypedText("");
                if (characterTypingIntervalRef.current) {
                  clearInterval(characterTypingIntervalRef.current);
                  characterTypingIntervalRef.current = null;
                }
              }

              // Narrator subtitle at 5-8 seconds
              if (currentTime >= 5 && currentTime < 5.5 && !showSubtitle && !showCharacterDialogue) {
                setShowSubtitle(true);
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

                // Type out narrator subtitle
                const narratorText = "Nakinig sila Aiko at Carlos sa gabay ng guro, kaya't sila nakatago sa ilalim ng kanilang mga lamesa.";
                let index = 0;
                typingIntervalRef.current = setInterval(() => {
                  if (index < narratorText.length) {
                    setTypedText(narratorText.substring(0, index + 1));
                    index++;
                  } else {
                    clearInterval(typingIntervalRef.current);
                  }
                }, 25);
              }

              // Hide narrator subtitle at 8 seconds
              if (currentTime >= 8 && currentTime < 8.5 && showSubtitle) {
                setShowSubtitle(false);
                setTypedText("");
                if (typingIntervalRef.current) {
                  clearInterval(typingIntervalRef.current);
                }
              }

              // Teacher dialogues 2-4 at 9 seconds (continue presenting until 19 seconds)
              if (currentTime >= 9 && currentTime < 9.5 && !showCharacterDialogue && !showSubtitle) {
                setCurrentCharacter('Teacher');
                setCurrentDialogueSet([
                  "Mag-stay kayo sa ilalim ng mesa!",
                  "Huwag kayong tatayo hanggang tumigil ang lindol!",
                  "Kalmado lang, hintayin nating tumigil ang pag-yanig."
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

              // Auto-advance teacher dialogue 2 to 3 at 12 seconds
              if (currentTime >= 12 && currentTime < 12.5 && showCharacterDialogue && currentCharacterDialogue === 0) {
                if (characterTypingIntervalRef.current) {
                  clearInterval(characterTypingIntervalRef.current);
                  characterTypingIntervalRef.current = null;
                }
                playPopSound();
                setCurrentCharacterDialogue(1);
                setCharacterTypedText("");
                
                // Start typing for dialogue 2
                const nextText = "Huwag kayong tatayo hanggang tumigil ang lindol!";
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

              // Auto-advance teacher dialogue 3 to 4 at 15 seconds
              if (currentTime >= 15 && currentTime < 15.5 && showCharacterDialogue && currentCharacterDialogue === 1) {
                if (characterTypingIntervalRef.current) {
                  clearInterval(characterTypingIntervalRef.current);
                  characterTypingIntervalRef.current = null;
                }
                playPopSound();
                setCurrentCharacterDialogue(2);
                setCharacterTypedText("");
                
                // Start typing for dialogue 3
                const nextText = "Kalmado lang, hintayin nating tumigil ang pag-yanig.";
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

              // HIDE ALL DIALOGUES at 19 seconds - NO DIALOGUE SHOWING
              if (currentTime >= 19 && currentTime < 19.5 && showCharacterDialogue) {
                setShowCharacterDialogue(false);
                setCharacterTypedText("");
                if (characterTypingIntervalRef.current) {
                  clearInterval(characterTypingIntervalRef.current);
                  characterTypingIntervalRef.current = null;
                }
              }

              // FREEZE at 26 seconds and show ONLY CHOICES (no dialogue)
              if (currentTime >= 26 && !isFrozen && !showChoices) {
                videoRef.current?.pauseAsync();
                setIsFrozen(true);
                
                // Set choices
                setCurrentChoiceSet([
                  { text: "Mabilis na tumakbo palabas!", action: "rush_exit" },
                  { text: "Mag-line up, tulungan ang mga classmate", action: "orderly_exit" }
                ]);
                
                // Show ONLY choices (no dialogue)
                setShowChoices(true);
                choicesOpacity.setValue(0);
                Animated.timing(choicesOpacity, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }).start();
              }
            }

            // EVACUATION1 SCENE - Orderly evacuation with Maria
            if (currentVideoScene === 'l6_evacuation1') {
              // FREEZE at 20 seconds - Maria crying
              if (currentTime >= 20 && currentTime < 20.5 && !evacuation20sFreezeTriggered && !isFrozen) {
                videoRef.current?.pauseAsync();
                setIsFrozen(true);
                setEvacuation20sFreezeTriggered(true);
                setCurrentCharacter('Maria');
                setCurrentDialogueSet(["Uwaah! Huhuhu"]);
                setCurrentChoiceSet([]);
                setShowCharacterDialogue(true);
                setCurrentCharacterDialogue(0);
                setCharacterTypedText("");
                setIsMonologue(false);

                // Play child crying sound and pop sound
                playChildCryingSound();
                playPopSound();

                characterDialogueOpacity.setValue(0);
                Animated.timing(characterDialogueOpacity, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }).start();
              }

              // After Maria's first cry, show Aiko's inner monologue
              if (currentTime >= 20 && isFrozen && showCharacterDialogue && currentCharacter === 'Maria' && characterTypedText === "Uwaah! Huhuhu" && currentCharacterDialogue === 0) {
                // Check if user clicked to advance (this happens in handleCharacterDialogueClick)
                // We need to detect when to switch to Aiko's dialogue
              }

              // FREEZE at 23 seconds - Maria and Aiko conversation
              if (currentTime >= 23 && currentTime < 23.5 && !evacuation23sFreezeTriggered && !isFrozen) {
                videoRef.current?.pauseAsync();
                setIsFrozen(true);
                setEvacuation23sFreezeTriggered(true);
                setCurrentCharacter('Maria');
                setCurrentDialogueSet([
                  "Uwaah!.. Hmm?",
                  "Aiko? Ikaw ba yan? Hindi ako makatayo.. sobrang natakot ako sa lindol!"
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

              // FREEZE at 38 seconds - Teacher's final words
              if (currentTime >= 38 && currentTime < 38.5 && !evacuation38sFreezeTriggered && !isFrozen) {
                videoRef.current?.pauseAsync();
                setIsFrozen(true);
                setEvacuation38sFreezeTriggered(true);
                setCurrentCharacter('Teacher');
                setCurrentDialogueSet([
                  "Mabuti at ligtas tayong lahat.",
                  "Dahil sa inyong kahandaan at kooperasyon, tayong lahat ay nakalabas nang maayos."
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

              // EVACUATION1 ends -> Transition to GOODENDING1
              if (status.durationMillis && currentTime >= (status.durationMillis / 1000) - 0.5) {
                setCurrentVideoScene('l6_goodending1');
                setGoodending1sFreezeTriggered(false); // Reset for goodending1 scene
                setTimeout(() => {
                  videoRef.current?.playAsync();
                }, 100);
              }
            }

            // BAD ENDING 2 - badrun2.mp4 ends, show bad ending screen
            if (currentVideoScene === 'l6_badrun2' && status.durationMillis && currentTime >= (status.durationMillis / 1000) - 0.5) {
              if (!showBadEnding) {
                videoRef.current?.pauseAsync();
                setShowBadEnding(true);
                setBadEndingMessage("Ang pagmamadali at hindi pag-coordinate sa panahon ng evacuation ay maaaring magdulot ng stampede at mas maraming sakuna.");
                
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

            // GOODENDING1 SCENE - Maria thanks Aiko
            if (currentVideoScene === 'l6_goodending1') {
              // FREEZE at 1 second - Maria thanks Aiko
              if (currentTime >= 1 && currentTime < 1.5 && !goodending1sFreezeTriggered && !isFrozen) {
                videoRef.current?.pauseAsync();
                setIsFrozen(true);
                setGoodending1sFreezeTriggered(true);
                setCurrentCharacter('Maria');
                setCurrentDialogueSet(["Salamat Aiko, kung hindi mo ako tinulungan doon, baka may nangyari pa saakin na hindi maganda."]);
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

              // Check if video ends after goodending1, transition to congrats
              if (status.durationMillis && currentTime >= (status.durationMillis / 1000) - 0.5 && !showCongrats) {
                setShowCongrats(true);
                congratsOpacity.setValue(0);
                congratsScale.setValue(0);
                
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
      {showSubtitle && currentVideoScene === 'l6_main' && (
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
            currentVideoScene === 'l6_safety1' ? styles.choicesContainerCentered : styles.choicesContainer,
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
              Nai-demonstrate mo ang tamang pagtugon sa panahon ng lindol at nakatulong ka sa kaligtasan ng inyong klase.
            </Text>
            <Text style={styles.persona3CongratsValue}>
              Preparedness • Calmness • Teamwork
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
