import React from "react";
import { View, TouchableOpacity, Image, StyleSheet, Animated, Platform } from "react-native";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { useResponsive } from "../hooks/useResponsive";

const BottomNav = () => {
  const navigation = useNavigation();
  const currentRoute = useNavigationState(state => 
    state ? state.routes[state.index]?.name : null
  );
  
  // Use responsive hook for adaptive sizing
  const { isSmallDevice, isTablet, scale } = useResponsive();
  
  // Responsive sizes
  // changed navheight for small devices to 80
  const navHeight = isTablet ? 80 : isSmallDevice ? 80 : 70;
  const iconSize = scale(32);
  const homeIconSize = scale(36);
  const paddingVertical = isTablet ? 16 : isSmallDevice ? 8 : 12;
  const borderRadius = isTablet ? 25 : 20;

  const AnimatedTouchable = ({ routeName, iconSource, pressedIconSource, onPress, size }: {
    routeName: string;
    iconSource: any;
    pressedIconSource: any;
    onPress: () => void;
    size?: number;
  }) => {
    const scaleValue = React.useRef(new Animated.Value(1)).current;
    const isActive = currentRoute === routeName;

    const handlePressIn = () => {
      Animated.spring(scaleValue, {
        toValue: 0.85,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <Image 
            source={isActive ? pressedIconSource : iconSource} 
            style={[styles.icon, size ? { width: size, height: size } : null, isActive && styles.activeIcon]} 
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, {
      height: navHeight,
      paddingVertical: paddingVertical,
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
      paddingHorizontal: isTablet ? 40 : isSmallDevice ? 8 : 16,
    }]}>
      <AnimatedTouchable
        routeName="HomeScreen"
        iconSource={require("../assets/images/homeicon.png")}
        pressedIconSource={require("../assets/images/homeiconpressed.png")}
        onPress={() => navigation.navigate("HomeScreen" as never)}
        size={homeIconSize}
      />

      <AnimatedTouchable
        routeName="LessonScreenNew"
        iconSource={require("../assets/images/lessonsicon.png")}
        pressedIconSource={require("../assets/images/lessoniconpressed.png")}
        onPress={() => navigation.navigate("LessonScreenNew" as never)}
        size={iconSize}
      />

      <AnimatedTouchable
        routeName="GamesScreen"
        iconSource={require("../assets/images/gameicon.png")}
        pressedIconSource={require("../assets/images/gameiconpressed.png")}
        onPress={() => navigation.navigate("GamesScreen" as never)}
        size={iconSize}
      />

      <AnimatedTouchable
        routeName="LeaderboardScreen"
        iconSource={require("../assets/images/trophy.png")}
        pressedIconSource={require("../assets/images/trophypressed.png")}
        onPress={() => navigation.navigate("LeaderboardScreen" as never)}
        size={iconSize}
      />

      <AnimatedTouchable
        routeName="ProfileScreen"
        iconSource={require("../assets/images/profileicon.png")}
        pressedIconSource={require("../assets/images/profileiconpressed.png")}
        onPress={() => navigation.navigate("ProfileScreen" as never)}
        size={iconSize}
      />
    </View>
  );
};

export default BottomNav;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#4A3AFF",
    position: "absolute",
    bottom: 0,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    // Add safe area support for devices with notches/home indicators
      paddingBottom: Platform.OS === 'ios' ? 20 : Platform.OS === 'android' ? 40 : 0,
  },
  icon: {
    tintColor: "#fff",
  },
  activeIcon: {
    tintColor: "#fff", // Keep white for active state
    shadowColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
});
