import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Animated,
  ScrollView,
} from "react-native";
import styles from './ScenarioScreenL1.styles';
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
  const [showBadEnding, setShowBadEnding] = useState(false);
  const [badEndingMessage, setBadEndingMessage] = useState("");
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
  const [isSkipping, setIsSkipping] = useState(false);
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
  const badEndingOpacity = useRef(new Animated.Value(0)).current;
  const badEndingScale = useRef(new Animated.Value(0)).current;
  const idleButtonOpacity = useRef(new Animated.Value(0)).current;
  const typingIntervalRef = useRef<any>(null);
  

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
              ? require("../../assets/audio/dialogue1.mp3")
              : require("../../assets/audio/dialogue2.mp3");

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
        return require("../../assets/videos/L1Scenarios/scene1.mp4");
      case 'return1':
        return require("../../assets/videos/L1Scenarios/return1.mp4");
      case 'returndialogue1':
        return require("../../assets/videos/L1Scenarios/returndialogue1.mp4");
      case 'returndialogue2':
        return require("../../assets/videos/L1Scenarios/returndialogue2.mp4");
      case 'returndialogue3':
        return require("../../assets/videos/L1Scenarios/returndialogue3.mp4");
      case 'returndialogue4':
        return require("../../assets/videos/L1Scenarios/returndialogue4.mp4");
      default:
        return require("../../assets/videos/L1Scenarios/scene1.mp4");
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
        // Bad ending - kept the phone for yourself
        setBadEndingMessage("You chose to keep the phone for yourself. This showed a lack of integrity and honesty. Carlos was left searching for his phone, feeling distressed and violated.");
        setShowBadEnding(true);
        badEndingOpacity.setValue(0);
        badEndingScale.setValue(0);
        Animated.parallel([
          Animated.timing(badEndingOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(badEndingScale, {
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
        // Aiko denies having the phone - bad ending
        setBadEndingMessage("You denied having Carlos's phone. This showed dishonesty and a lack of responsibility. Carlos continued searching desperately while you walked away.");
        setShowBadEnding(true);
        badEndingOpacity.setValue(0);
        badEndingScale.setValue(0);
        Animated.parallel([
          Animated.timing(badEndingOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(badEndingScale, {
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

      {/* DEBUG: Skip Button */}
      {!showCongrats && !showBadEnding && !isSkipping && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={async () => {
            if (isSkipping) return; // Prevent multiple clicks
            setIsSkipping(true);
            
            // Skip to the end of current video to trigger scene transition
            if (videoRef.current) {
              const status = await videoRef.current.getStatusAsync();
              if (status.isLoaded && status.durationMillis) {
                // Seek to near the end to trigger didJustFinish
                await videoRef.current.setPositionAsync(status.durationMillis - 100);
              }
            }
            
            // Reset after a delay
            setTimeout(() => setIsSkipping(false), 1000);
          }}
        >
          <Text style={styles.skipButtonText}>⏭️ SKIP VIDEO (DEBUG)</Text>
        </TouchableOpacity>
      )}

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
                router.push('/scenarios/ExploreScenarios');
              }}
            >
              <Text style={styles.persona3BackButtonText}>▶ RETURN TO SCENARIOS</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {showBadEnding && (
        <Animated.View
          style={[
            styles.congratsOverlay,
            { opacity: badEndingOpacity, transform: [{ scale: badEndingScale }] },
          ]}
        >
          <View style={[styles.persona3CongratsCard, styles.badEndingCard]}>
            <Text style={[styles.persona3CongratsTitle, styles.badEndingTitle]}>SCENARIO FAILED</Text>
            <View style={[styles.persona3Divider, styles.badEndingDivider]} />
            <Text style={styles.persona3CongratsMessage}>
              {badEndingMessage}
            </Text>
            <Text style={[styles.persona3CongratsValue, styles.badEndingValues]}>
              Lack of Integrity • Dishonesty • Irresponsibility
            </Text>
            <TouchableOpacity
              style={[styles.persona3BackButton, styles.tryAgainButton]}
              onPress={async () => {
                await ScreenOrientation.unlockAsync();
                router.push('/scenarios/ExploreScenarios');
              }}
            >
              <Text style={styles.persona3BackButtonText}>▶ TRY AGAIN</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
