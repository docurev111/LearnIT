/**
 * CharacterDialogue.tsx
 * 
 * Animated character dialogue box with typewriter effect.
 * Displays character name badge and scrolling dialogue text.
 * 
 * @component
 * @example
 * ```tsx
 * <CharacterDialogue
 *   character="Maria"
 *   dialogue="Uwaah! Huhuhu"
 *   characterColor="#FF6B9D"
 *   onNext={handleNext}
 *   showNextIndicator
 * />
 * ```
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';

interface CharacterDialogueProps {
  /** Name of the character speaking */
  character: string;
  /** The dialogue text to display */
  dialogue: string;
  /** Color for the character's name badge */
  characterColor?: string;
  /** Whether to show the "next" indicator arrow */
  showNextIndicator?: boolean;
  /** Callback when dialogue is tapped (for advancing) */
  onNext?: () => void;
  /** Speed of typewriter effect in milliseconds */
  typingSpeed?: number;
  /** Whether dialogue is a monologue (different styling) */
  isMonologue?: boolean;
}

export default function CharacterDialogue({
  character,
  dialogue,
  characterColor = '#6B73FF',
  showNextIndicator = false,
  onNext,
  typingSpeed = 40,
  isMonologue = false,
}: CharacterDialogueProps) {
  const [typedText, setTypedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const typingIntervalRef = useRef<any>(null);

  useEffect(() => {
    // Fade in animation
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Typewriter effect
    let index = 0;
    setTypedText('');
    setIsTypingComplete(false);

    typingIntervalRef.current = setInterval(() => {
      if (index < dialogue.length) {
        setTypedText(dialogue.substring(0, index + 1));
        index++;
      } else {
        clearInterval(typingIntervalRef.current);
        setIsTypingComplete(true);
      }
    }, typingSpeed);

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [dialogue]);

  const handleTap = () => {
    if (!isTypingComplete) {
      // Skip typing animation
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      setTypedText(dialogue);
      setIsTypingComplete(true);
    } else if (onNext) {
      // Advance to next dialogue
      onNext();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleTap}
      style={styles.container}
    >
      <Animated.View style={[styles.dialogueBox, { opacity }]}>
        {!isMonologue && (
          <View style={[styles.characterBadge, { backgroundColor: characterColor }]}>
            <Text style={styles.characterName}>{character}</Text>
          </View>
        )}

        <View style={styles.dialogueContent}>
          <Text style={styles.dialogueText}>
            {typedText}
            {!isTypingComplete && <Text style={styles.cursor}>▌</Text>}
          </Text>

          {showNextIndicator && isTypingComplete && (
            <Text style={styles.nextIndicator}>▼</Text>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
  },
  dialogueBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  characterBadge: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  characterName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dialogueContent: {
    padding: 20,
  },
  dialogueText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 26,
  },
  cursor: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  nextIndicator: {
    position: 'absolute',
    bottom: 15,
    right: 20,
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
