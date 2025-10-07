import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LoadingScreenProps {
  visible?: boolean;
}

export default function LoadingScreen({ visible = true }: LoadingScreenProps) {
  const mascotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Cycle between mascot images with a fade effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(mascotAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.delay(500),
          Animated.timing(mascotAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.delay(500),
        ])
      ).start();
    }
  }, [visible]);

  if (!visible) return null;

  // Interpolate opacity for mascot switching
  const mascot1Opacity = mascotAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const mascot2Opacity = mascotAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 1],
  });

  return (
    <View style={styles.container}>
      {/* Mascot Images - Cycling Animation */}
      <View style={styles.mascotContainer}>
        <Animated.Image
          source={require('../assets/images/loading/mascotloading.png')}
          style={[
            styles.mascot,
            {
              opacity: mascot1Opacity,
              position: 'absolute',
            },
          ]}
          resizeMode="contain"
        />
        <Animated.Image
          source={require('../assets/images/loading/mascotloading1.png')}
          style={[
            styles.mascot,
            {
              opacity: mascot2Opacity,
              position: 'absolute',
              top: -17,
              right: -10,
            },
          ]}
          resizeMode="contain"
        />
      </View>

      {/* Loading Bar GIF */}
      <Image
        source={require('../assets/gifs/loader.gif')}
        style={styles.loader}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotContainer: {
    width: screenWidth * 0.4,
    height: screenWidth * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  mascot: {
    width: '100%',
    height: '100%',
  },
  loader: {
    width: screenWidth * 0.6,
    height: 60,
  },
});
