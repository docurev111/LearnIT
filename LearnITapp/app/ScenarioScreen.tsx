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
import { useRouter } from "expo-router";
import { useWindowDimensions } from "react-native";

export default function ScenarioScreen() {
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
  const [currentVideoScene, setCurrentVideoScene] = useState<'main' | 'return1' | 'returndialogue1' | 'returndialogue2' | 'returndialogue3' | 'returndialogue4'>('main');
  const [currentCharacter, setCurrentCharacter] = useState<'Aiko' | 'Carlos'>('Aiko');
  const [currentDialogueSet, setCurrentDialogueSet] = useState<string[]>([]);
  const [currentChoiceSet, setCurrentChoiceSet] = useState<Array<{text: string, action: string}>>([]);
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
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const congratsOpacity = useRef(new Animated.Value(0)).current;
  const congratsScale = useRef(new Animated.Value(0)).current;
  const idleButtonOpacity = useRef(new Animated.Value(0)).current;
  const typingIntervalRef = useRef<any>(null);

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
      backgroundColor: "#4ade80",
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
      color: "#a8b2d1",
      fontSize: 14,
      lineHeight: 22,
      marginBottom: 20,
    },
    introButtonContainer: {
      flexDirection: "row",
      gap: 12,
      justifyContent: "center",
      marginTop: 10,
    },
    playButton: {
      backgroundColor: "#6B73FF",
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 25,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      elevation: 5,
      shadowColor: "#6B73FF",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    playButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    backButtonIntro: {
      backgroundColor: "#e74c3c",
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 25,
      elevation: 5,
      shadowColor: "#e74c3c",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    backButtonIntroText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    video: {
      flex: 1,
    },
    buttonContainer: {
      position: "absolute",
      bottom: 50,
      left: 50,
      right: 50,
      alignItems: "center",
    },
    button: {
      backgroundColor: "#6B73FF",
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 25,
      marginBottom: 10,
      minWidth: 150,
    },
    buttonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
    },
    goBackButton: {
      backgroundColor: "#ccc",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
    },
    goBackText: {
      color: "#333",
      fontSize: 16,
      textAlign: "center",
    },
    choicesContainer: {
      position: "absolute",
      bottom: 50,
      left: 50,
      right: 50,
      alignItems: "center",
      gap: 15,
    },
    choiceButton: {
      backgroundColor: "#6B73FF",
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 25,
      minWidth: 200,
    },
    choiceButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
    },
    title: {
      position: "absolute",
      bottom: 200,
      left: 50,
      right: 50,
      color: "#fff",
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      textShadowColor: "#000",
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 5,
    },
    congratsOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.8)",
      justifyContent: "center",
      alignItems: "center",
    },
    congratsText: {
      color: "#fff",
      fontSize: 48,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 20,
    },
    closeButton: {
      backgroundColor: "#6B73FF",
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 25,
    },
    closeButtonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
    },
    subtitleContainer: {
      position: "absolute",
      bottom: 40,
      left: 20,
      right: 20,
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      borderLeftWidth: 6,
      borderLeftColor: "#FFD700",
      paddingVertical: 20,
      paddingHorizontal: 25,
      borderRadius: 8,
    },
    subtitleText: {
      color: "#FFFFFF",
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "500",
    },
    subtitleCursor: {
      color: "#FFD700",
      fontSize: 16,
      fontWeight: "bold",
    },
    characterDialogueContainer: {
      position: "absolute",
      bottom: 30,
      left: 20,
      right: 20,
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      borderRadius: 12,
      padding: 20,
      borderWidth: 2,
      borderColor: "#6B73FF",
    },
    characterName: {
      position: "absolute",
      top: 10,
      left: 20,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 4,
    },
    characterNameText: {
      color: "#FFD700",
      fontSize: 14,
      fontWeight: "bold",
      textTransform: "uppercase",
    },
    characterDialogueText: {
      color: "#FFFFFF",
      fontSize: 16,
      lineHeight: 24,
      marginTop: 10,
    },
    nextArrow: {
      position: "absolute",
      bottom: 15,
      right: 20,
      width: 30,
      height: 30,
      justifyContent: "center",
      alignItems: "center",
    },
    persona5ChoicesContainer: {
      position: "absolute",
      bottom: 180,
      right: 20,
      gap: 15,
    },
    persona5ChoiceButton: {
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      paddingVertical: 15,
      paddingHorizontal: 25,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: "#6B73FF",
      minWidth: 250,
    },
    persona5ChoiceButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    persona3CongratsCard: {
      backgroundColor: "#1a1a2e",
      borderWidth: 3,
      borderColor: "#4A90E2",
      borderRadius: 8,
      padding: 30,
      width: "85%",
      alignItems: "center",
    },
    persona3CongratsTitle: {
      color: "#4A90E2",
      fontSize: 28,
      fontWeight: "bold",
      letterSpacing: 2,
      marginBottom: 15,
    },
    persona3Divider: {
      width: "100%",
      height: 2,
      backgroundColor: "#4A90E2",
      marginBottom: 20,
    },
    persona3CongratsMessage: {
      color: "#ffffff",
      fontSize: 16,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 20,
    },
    persona3CongratsValue: {
      color: "#FFD700",
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 25,
      letterSpacing: 1,
    },
    persona3BackButton: {
      backgroundColor: "#4A90E2",
      paddingHorizontal: 30,
      paddingVertical: 15,
      borderRadius: 4,
    },
    persona3BackButtonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "bold",
      letterSpacing: 1,
    },
  });

  useEffect(() => {
    // Start in portrait for intro screen
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);

    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    // Animate intro and setup orientation
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);

    // Animate intro screen
    if (showIntro) {
      Animated.parallel([
        Animated.timing(introOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(introScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      // Unlock on unmount
      ScreenOrientation.unlockAsync();
    };
  }, []);



  const subtitles = [
    "Makikita natin dito si Carlos na, masayang gumagamit ng kaniyang phone.",
    "Break time kasi sa kaniyang klase, kaya siya ay masayang gumagamit ng kaniyang phone, siguradong kayo din ay kagaya din kay Carlos kapag break time.",
    "Kaso, nang siya ay tumayo papaalis, ay hindi niya namalayan na nahulog na pala ang kaniyang phone mula sa bulsa niya.",
    "Kaya nang makita mo ito, ay tumayo ka agad at nag isip kung kanino man itong phone at wallet na ito"
  ];

  const characterDialogues = [
    "Huh? Kanino kaya itong Phone na ito?",
    "Parang nakita ko ata ito kanina na hawak ni Carlos ah, hmm.. sakaniya ata itong phone na 'to!",
    "Isasauli ba natin to sakanya o hinde? Kapag hindi, pwede ko itago at ibenta to. pero kung oo, maibabalik natin 'to nang maayos kay Carlos at di na siya maghahanap!"
  ];

  useEffect(() => {
    if (videoRef.current && videoPlaying) {
      videoRef.current.playAsync();
    }
  }, [videoPlaying]);

  // Character dialogue typing effect
  useEffect(() => {
    if (showCharacterDialogue && currentCharacterDialogue < currentDialogueSet.length) {
      const fullText = currentDialogueSet[currentCharacterDialogue];
      let currentChar = 0;
      setCharacterTypedText("");

      characterTypingIntervalRef.current = setInterval(() => {
        if (currentChar < fullText.length) {
          setCharacterTypedText(fullText.substring(0, currentChar + 1));
          currentChar++;
        } else {
          if (characterTypingIntervalRef.current) {
            clearInterval(characterTypingIntervalRef.current);
            characterTypingIntervalRef.current = null;
          }
        }
      }, 40);

      return () => {
        if (characterTypingIntervalRef.current) {
          clearInterval(characterTypingIntervalRef.current);
          characterTypingIntervalRef.current = null;
        }
      };
    }
  }, [showCharacterDialogue, currentCharacterDialogue, currentDialogueSet]);

  // Typing animation effect
  useEffect(() => {
    console.log(`Subtitle effect triggered - showSubtitle: ${showSubtitle}, currentSubtitleIndex: ${currentSubtitleIndex}`);
    
    if (showSubtitle && currentSubtitleIndex < subtitles.length) {
      const fullText = subtitles[currentSubtitleIndex];
      let currentChar = 0;
      let audioCheckInterval: any = null;
      setTypedText("");

      console.log(`Starting subtitle ${currentSubtitleIndex + 1}: "${fullText}"`);

      // Play corresponding audio
      const playDialogueAudio = async () => {
        try {
          // Unload previous audio if exists
          if (audioRef.current) {
            await audioRef.current.unloadAsync();
            audioRef.current = null;
          }

          // Only play audio if it's dialogue 1 or 2 (dialogue 3 doesn't have audio yet)
          if (currentSubtitleIndex < 2) {
            // Load and play the correct dialogue audio
            const audioSource = currentSubtitleIndex === 0
              ? require("../assets/audio/dialogue1.mp3")
              : require("../assets/audio/dialogue2.mp3");

            const { sound } = await Audio.Sound.createAsync(audioSource);
            audioRef.current = sound;
            
            // Set up audio finish listener
            sound.setOnPlaybackStatusUpdate(async (status) => {
              if (status.isLoaded && status.didJustFinish) {
                console.log(`Audio ${currentSubtitleIndex + 1} finished via callback`);
                if (currentSubtitleIndex < subtitles.length - 1) {
                  console.log(`Moving to subtitle ${currentSubtitleIndex + 2}`);
                  // Add 1 second delay before dialogue 3
                  if (currentSubtitleIndex === 1) {
                    console.log("Waiting 1 second before dialogue 3...");
                    setTimeout(() => {
                      setCurrentSubtitleIndex(prev => prev + 1);
                    }, 1000);
                  } else {
                    setCurrentSubtitleIndex(prev => prev + 1);
                  }
                }
              }
            });
            
            await sound.playAsync();
            console.log(`Playing dialogue ${currentSubtitleIndex + 1}`);
          } else {
            // Dialogue 3 - no audio yet, just show text
            console.log(`Dialogue 3 - showing text only (no audio file yet)`);
          }
        } catch (error) {
          console.log("Error playing dialogue audio:", error);
        }
      };

      playDialogueAudio();

      typingIntervalRef.current = setInterval(() => {
        if (currentChar < fullText.length) {
          setTypedText(fullText.substring(0, currentChar + 1));
          currentChar++;
        } else {
          // Typing complete, just stop typing
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
        }
      }, 30); // 30ms per character for typing speed

      return () => {
        console.log(`Cleanup for subtitle ${currentSubtitleIndex + 1}`);
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        if (audioCheckInterval) {
          clearInterval(audioCheckInterval);
        }
      };
    }
  }, [showSubtitle, currentSubtitleIndex]);

  const getVideoSource = () => {
    switch (currentVideoScene) {
      case 'main':
        return require("../assets/videos/L1Scenarios/scene1.mp4");
      case 'return1':
        return require("../assets/videos/L1Scenarios/return1.mp4");
      case 'returndialogue1':
        return require("../assets/videos/L1Scenarios/returndialogue1.mp4");
      case 'returndialogue2':
        return require("../assets/videos/L1Scenarios/returndialogue2.mp4");
      case 'returndialogue3':
        return require("../assets/videos/L1Scenarios/returndialogue3.mp4");
      case 'returndialogue4':
        return require("../assets/videos/L1Scenarios/returndialogue4.mp4");
      default:
        return require("../assets/videos/L1Scenarios/scene1.mp4");
    }
  };

  const isLooping = false;

  const handleStartScenario = async () => {
    // Fade out intro first
    Animated.parallel([
      Animated.timing(introOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(introScale, {
        toValue: 0.8,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      // Switch to landscape
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
      
      // Hide intro and show video
      setShowIntro(false);
      
      // Fade in video
      videoOpacity.setValue(0);
      Animated.timing(videoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    });
  };



  const handleGoBack = async () => {
    await ScreenOrientation.unlockAsync();
    router.back();
  };

  const handleCharacterDialogueClick = () => {
    // If typing is in progress, complete it immediately
    if (characterTypingIntervalRef.current) {
      clearInterval(characterTypingIntervalRef.current);
      characterTypingIntervalRef.current = null;
      setCharacterTypedText(currentDialogueSet[currentCharacterDialogue]);
      return;
    }

    // Move to next dialogue
    if (currentCharacterDialogue < currentDialogueSet.length - 1) {
      setCurrentCharacterDialogue(prev => prev + 1);
    } else {
      // Last dialogue in set
      if (currentChoiceSet.length > 0) {
        // Show choices if available
        setShowChoices(true);
        Animated.timing(choicesOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      } else {
        // No choices, continue to next scene
        handleSceneTransition();
      }
    }
  };

  const handleSceneTransition = async () => {
    console.log(`Transitioning from ${currentVideoScene}`);
    setShowCharacterDialogue(false);
    setIsFrozen(false);
    setCurrentCharacterDialogue(0);
    setCharacterTypedText("");
    
    // Reset character dialogue opacity
    characterDialogueOpacity.setValue(0);
    
    // Determine next scene based on current scene
    if (currentVideoScene === 'returndialogue1') {
      setCurrentVideoScene('returndialogue2');
      setTimeout(() => {
        videoRef.current?.playAsync();
      }, 100);
    }
  };

  const handleChoice = async (action: string) => {
    console.log(`User chose action: ${action}`);
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
      case 'return':
        // Play return1.mp4
        console.log("Playing return1 scene");
        // Reset subtitle system for return path
        setShowSubtitle(false);
        setCurrentSubtitleIndex(0);
        setTypedText("");
        setCurrentVideoScene('return1');
        // Wait for video to remount, then play
        setTimeout(() => {
          videoRef.current?.playAsync();
        }, 100);
        break;
      case 'keep':
        // Bad ending - show different result
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
      case 'confirmphone':
        // Aiko confirms the phone - go to returndialogue3
        setCurrentVideoScene('returndialogue3');
        setTimeout(() => {
          videoRef.current?.playAsync();
        }, 100);
        break;
      case 'denyphone':
        // Aiko denies - bad ending
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
      case 'checkpocket':
        // Carlos checks pocket - go to returndialogue4
        setCurrentVideoScene('returndialogue4');
        setTimeout(() => {
          videoRef.current?.playAsync();
        }, 100);
        break;
      case 'finish':
        // Aiko's final response - show congratulations
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



  if (showIntro) {
    return (
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
              <Text style={styles.difficultyText}>⭐ Easy</Text>
            </View>
            
            <Text style={styles.scenarioTitle}>
              Ang Phone na Aking Natagpuan sa Klase
            </Text>
            
            <Text style={styles.scenarioDescription}>
              Habang break time, si Carlos ay abala sa paggamit ng kanyang phone. Nang matapos siyang gamitin ito, nahulog ang phone mula sa kanyang bulsa at hindi niya napansin habang lumalabas ng silid-aralan.{"\n\n"}
              Ano ang gagawin mo kung ikaw ang nakakita ng phone? Dito natin makikita kung paano nakakaimpluwensya ang ating <Text style={{ fontWeight: "bold", color: "#6B73FF" }}>isip at kilos-loob</Text> sa ating mga desisyon at ang mga kahihinatnan nito.
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
    );
  }

  return (
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

          // Show subtitle at 6 seconds (ONLY in main scene)
          if (currentVideoScene === 'main' && currentTime >= 6 && currentTime < 36 && !showSubtitle) {
            console.log("Starting subtitle system at 6 seconds");
            setShowSubtitle(true);
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

          // Hide subtitle at 36 seconds (ONLY in main scene)
          if (currentVideoScene === 'main' && currentTime >= 36 && showSubtitle) {
            console.log("Hiding narrator subtitle at 36 seconds");
            
            Animated.parallel([
              Animated.timing(subtitleOpacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(subtitleSlideUp, {
                toValue: 20,
                duration: 400,
                useNativeDriver: true,
              }),
            ]).start(() => {
              setShowSubtitle(false);
              setCurrentSubtitleIndex(0);
              setTypedText("");
              // Clean up audio
              if (audioRef.current) {
                audioRef.current.unloadAsync().catch(() => {});
              }
            });
          }

          // Freeze frame and show character dialogue at 42 seconds (main scene)
          if (currentVideoScene === 'main' && currentTime >= 42 && !isFrozen) {
            console.log("Freezing video at 42 seconds");
            videoRef.current?.pauseAsync();
            setIsFrozen(true);
            setShowCharacterDialogue(true);
            setCurrentCharacter('Aiko');
            setCurrentDialogueSet(characterDialogues);
            setCurrentChoiceSet([
              {text: "Isauli kay Carlos", action: "return"},
              {text: "Itago para sa sarili", action: "keep"}
            ]);
            Animated.timing(characterDialogueOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }).start();
          }

          // returndialogue1: Show Aiko dialogue at 1 second
          if (currentVideoScene === 'returndialogue1' && currentTime >= 1 && !isFrozen) {
            console.log("Freezing returndialogue1 at 1 second");
            videoRef.current?.pauseAsync();
            setIsFrozen(true);
            setShowCharacterDialogue(true);
            setCurrentCharacter('Aiko');
            setCurrentDialogueSet(["Huy Carlos! Nakita ko yung phone mo! Nalaglag siguro ito nung pagtayo mo galing sa upuan mo."]);
            setCurrentChoiceSet([]);
            setCurrentCharacterDialogue(0);
            Animated.timing(characterDialogueOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }).start();
          }

          // returndialogue2: Show Carlos dialogue at 1 second with choices
          if (currentVideoScene === 'returndialogue2' && currentTime >= 1 && !isFrozen) {
            console.log("Freezing returndialogue2 at 1 second");
            videoRef.current?.pauseAsync();
            setIsFrozen(true);
            setShowCharacterDialogue(true);
            setCurrentCharacter('Carlos');
            setCurrentDialogueSet(["Ah! Ay Aiko, ikaw lang pala yan. May sinasabi ka ba tungkol sa phone ko?"]);
            setCurrentChoiceSet([
              {text: "Oo! Nasa sahig ng upuan mo, nahulog siya nung pagka-tayo mo!", action: "confirmphone"},
              {text: "Hinde, wala pala. Sige, balik lang ako sa classroom.", action: "denyphone"}
            ]);
            setCurrentCharacterDialogue(0);
            Animated.timing(characterDialogueOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }).start();
          }

          // returndialogue3: Show Carlos dialogue at 1 second
          if (currentVideoScene === 'returndialogue3' && currentTime >= 1 && !isFrozen) {
            console.log("Freezing returndialogue3 at 1 second");
            videoRef.current?.pauseAsync();
            setIsFrozen(true);
            setShowCharacterDialogue(true);
            setCurrentCharacter('Carlos');
            setCurrentDialogueSet(["Hahahaha! Seryoso ba?"]);
            setCurrentChoiceSet([
              {text: "Oo! I-try mong kapain yung bulsa mo.", action: "checkpocket"}
            ]);
            setCurrentCharacterDialogue(0);
            Animated.timing(characterDialogueOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }).start();
          }

          // returndialogue4: Show Carlos dialogue at 3.5 seconds
          if (currentVideoScene === 'returndialogue4' && currentTime >= 3.5 && !showCharacterDialogue && !isFrozen) {
            console.log("Showing Carlos dialogue at 3.5 seconds");
            videoRef.current?.pauseAsync();
            setIsFrozen(true);
            setShowCharacterDialogue(true);
            setCurrentCharacter('Carlos');
            setCurrentDialogueSet(["Oo nga no! Buti nalang nakita mo, Hahahaha! Maraming Salamat, Aiko!"]);
            // Set choices but don't show yet - will show after typing completes
            setCurrentChoiceSet([
              {text: "Walang anuman, Carlos!", action: "finish"}
            ]);
            setCurrentCharacterDialogue(0);
            Animated.timing(characterDialogueOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }).start();
          }

          // When video finishes, handle scene transitions
          if (status.didJustFinish && !showCongrats && !isFrozen) {
            console.log(`Video finished: ${currentVideoScene}`);
            // Transition to next scene
            if (currentVideoScene === 'return1') {
              // Reset character dialogue state before next scene
              setShowCharacterDialogue(false);
              setCurrentCharacterDialogue(0);
              setCharacterTypedText("");
              characterDialogueOpacity.setValue(0);
              setCurrentVideoScene('returndialogue1');
              setTimeout(() => {
                videoRef.current?.playAsync();
              }, 100);
            } else if (currentVideoScene === 'main') {
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
            }
          }

          setStatus(status);
        }}
        onLoad={() => console.log('Video loaded: scene1.mp4')}
        onError={(error) =>
          console.log('Video error:', error)
        }
      />
      </Animated.View>

      {showSubtitle && (
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
            <Text style={styles.subtitleCursor}>▊</Text>
          </Text>
        </Animated.View>
      )}

      {showCharacterDialogue && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleCharacterDialogueClick}
        >
          <Animated.View
            style={[
              styles.characterDialogueContainer,
              { opacity: characterDialogueOpacity },
            ]}
          >
            <View style={[styles.characterName, {
              backgroundColor: currentCharacter === 'Aiko' ? 'rgba(147, 51, 234, 0.9)' : 'rgba(59, 130, 246, 0.9)'
            }]}>
              <Text style={styles.characterNameText}>{currentCharacter}</Text>
            </View>
            <Text style={styles.characterDialogueText}>
              {characterTypedText}
              {characterTypedText.length < currentDialogueSet[currentCharacterDialogue]?.length && (
                <Text style={styles.subtitleCursor}>▊</Text>
              )}
            </Text>
            {characterTypedText.length === currentDialogueSet[currentCharacterDialogue]?.length && !showChoices && (
              <View style={styles.nextArrow}>
                <Text style={{ color: "#6B73FF", fontSize: 24 }}>▶</Text>
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>
      )}

      {showChoices && (
        <Animated.View style={[styles.persona5ChoicesContainer, { opacity: choicesOpacity }]}>
          {currentChoiceSet.map((choice, index) => (
            <TouchableOpacity
              key={index}
              style={styles.persona5ChoiceButton}
              onPress={() => handleChoice(choice.action)}
            >
              <Text style={styles.persona5ChoiceButtonText}>{choice.text}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {showCongrats && (
        <Animated.View
          style={[
            styles.congratsOverlay,
            { opacity: congratsOpacity, transform: [{ scale: congratsScale }] },
          ]}
        >
          <View style={styles.persona3CongratsCard}>
            <Text style={styles.persona3CongratsTitle}>SCENARIO COMPLETE</Text>
            <View style={styles.persona3Divider} />
            <Text style={styles.persona3CongratsMessage}>
              You demonstrated integrity and honesty{'\n'}by returning the phone to Carlos.
            </Text>
            <Text style={styles.persona3CongratsValue}>
              Integrity • Empathy • Responsibility
            </Text>
            <TouchableOpacity
              style={styles.persona3BackButton}
              onPress={async () => {
                await ScreenOrientation.unlockAsync();
                router.push('/ExploreScenarios');
              }}
            >
              <Text style={styles.persona3BackButtonText}>▶ RETURN TO SCENARIOS</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
