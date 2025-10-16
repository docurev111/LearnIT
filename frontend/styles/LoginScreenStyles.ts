import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive utility functions
const getResponsiveFontSize = (baseSize: number) => {
  const scale = screenWidth / 375; // Base width (iPhone 6/7/8)
  return Math.round(baseSize * Math.min(scale, 1.2)); // Cap scaling at 1.2x
};

const getResponsiveSpacing = (baseSpacing: number) => {
  const scale = screenHeight / 667; // Base height (iPhone 6/7/8)
  return Math.round(baseSpacing * Math.min(scale, 1.2));
};

const getResponsiveImageSize = (baseSize: number) => {
  const scale = Math.min(screenWidth / 375, screenHeight / 667);
  return Math.round(baseSize * Math.min(scale, 1.2));
};

export const loginScreenStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: "transparent", // transparent background to show image
    justifyContent: "space-between",
  },
  whiteBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff", // white background behind mascot
    zIndex: -2, // Behind the mascot image
  },

  // Mascot and Logo styles
  mascot: {
    position: "absolute",
    top: "11%", // Start from 40% down from the top instead of 0
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "105%", // Cover only 60% of the screen height instead of 100%
    zIndex: -1, // Ensure it stays behind other elements
  },
  logo: {
    position: "absolute",
    top: "8%", // Responsive percentage instead of fixed
    left: "50%",
    opacity: 1,
  },

  // Form styles
  formContainer: {
    flex: 1,
    alignItems: "center",
    // paddingHorizontal and paddingTop are now set dynamically
  },
  title: {
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    color: "#E0DFFF",
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#F8F6FF",
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#D6D6F5",
    color: "#3E2DFF",
  },

  // Button styles
  button: {
    backgroundColor: "#fff",
    borderRadius: 25,
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: "#3E2DFF",
    fontWeight: "600",
  },

  // Text styles
  forgotText: {
    color: "#E0DFFF",
  },
  bottomText: {
    color: "#E0DFFF",
  },
  linkText: {
    color: "#fff",
    fontWeight: "600",
  },
  orText: {
    color: "#E0DFFF",
  },

  // Divider styles
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#B5AFFF",
  },
});

// Export responsive utility functions for use in LoginScreen
export { getResponsiveFontSize, getResponsiveSpacing, getResponsiveImageSize };