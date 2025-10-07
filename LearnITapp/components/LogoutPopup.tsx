import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Dimensions,
} from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LogoutPopupProps {
  visible: boolean;
  onLogout: () => void;
  onCancel: () => void;
}

const LogoutPopup: React.FC<LogoutPopupProps> = ({ visible, onLogout, onCancel }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          {/* White Background */}
          <View style={styles.backgroundContainer}>
            {/* Mascot Character */}
            <Image
              source={require("../assets/images/LogOutMascot.png")}
              style={styles.mascot}
              resizeMode="contain"
            />

            {/* Question Text */}
            <Text style={styles.questionText}>
              Are you sure you want to log out?
            </Text>

            {/* Buttons Container */}
            <View style={styles.buttonsContainer}>
              {/* Logout Button */}
              <TouchableOpacity
                style={[styles.button, styles.logoutButton]}
                onPress={onLogout}
              >
                <Text style={[styles.buttonText, styles.logoutButtonText]}>
                  Log out
                </Text>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    width: screenWidth * 0.85,
    height: screenHeight * 0.45,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  mascot: {
    width: "100%",
    height: 120,
    marginBottom: 0,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: "#E5E5E5",
    borderWidth: 1,
    borderColor: "#CCC",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  cancelButtonText: {
    color: "#333",
  },
  logoutButtonText: {
    color: "#fff",
  },
});

export default LogoutPopup;
