import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';

interface Lesson3DCardProps {
  title: string;
  description: string;
}

export default function Lesson3DCard({ title, description }: Lesson3DCardProps) {
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const handleFlip = () => {
    setFlipped(!flipped);
    Animated.spring(flipAnim, {
      toValue: flipped ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <TouchableOpacity onPress={handleFlip} style={styles.cardContainer}>
      <Animated.View
        style={[
          styles.card,
          styles.front,
          {
            transform: [{ rotateY: frontInterpolate }],
          },
        ]}
      >
        <Text style={styles.title}>{title}</Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.card,
          styles.back,
          {
            transform: [{ rotateY: backInterpolate }],
          },
        ]}
      >
        <Text style={styles.description}>{description}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 150,
    height: 150,
    margin: 10,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  front: {
    backfaceVisibility: 'hidden',
  },
  back: {
    backfaceVisibility: 'hidden',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  },
});
