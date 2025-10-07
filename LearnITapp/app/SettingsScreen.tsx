// SettingsScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import LogoutPopup from "../components/LogoutPopup";
import LanguagePicker from "../components/LanguagePicker";

export default function SettingsScreen({ navigation: propNavigation }: any) {
  const navigation = propNavigation || useNavigation();
  const { t, i18n } = useTranslation();

  // States for toggles
  const [notifications, setNotifications] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [showLogout, setShowLogout] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  // Reusable Toggle
  const Toggle = ({ value, onPress }: { value: boolean; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress}>
      <Image
        source={
          value
            ? require("../assets/images/toggleon.png")
            : require("../assets/images/toggleoff.png")
        }
        style={styles.toggleIcon}
      />
    </TouchableOpacity>
  );

  const handleLogoutPress = () => {
    setShowLogoutPopup(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await signOut(auth);
      setShowLogoutPopup(false);
      navigation.navigate("LoginScreen" as never);
    } catch (error) {
      Alert.alert(t("common.error"), t("settings.logoutError"));
      setShowLogoutPopup(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutPopup(false);
  };

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      Alert.alert(t("common.success"), t("settings.languageChanged"));
    } catch (error) {
      Alert.alert(t("common.error"), "Failed to change language");
    }
  };

  const getCurrentLanguageName = () => {
    return i18n.language === 'fil' ? t('languages.filipino') : t('languages.english');
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isScrolledToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    setShowLogout(isScrolledToBottom);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require("../assets/images/backbutton.png")} style={{ width: 24, height: 30, marginTop: 8 }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Account Section */}
        <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>{t('settings.accountInformation')}</Text>
            <Ionicons name="chevron-forward" size={20} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowText}>{t('settings.notifications')}</Text>
            <Toggle value={notifications} onPress={() => setNotifications(!notifications)} />
          </View>
        </View>

        {/* Accessibility Section */}
        <Text style={styles.sectionTitle}>{t('settings.accessibility')}</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowText}>{t('settings.largeText')}</Text>
            <Toggle value={largeText} onPress={() => setLargeText(!largeText)} />
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowText}>{t('settings.highContrast')}</Text>
            <Toggle value={highContrast} onPress={() => setHighContrast(!highContrast)} />
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowText}>{t('settings.soundEffects')}</Text>
            <Toggle value={soundEffects} onPress={() => setSoundEffects(!soundEffects)} />
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowText}>{t('settings.hapticFeedback')}</Text>
            <Toggle value={hapticFeedback} onPress={() => setHapticFeedback(!hapticFeedback)} />
          </View>
        </View>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => setShowLanguagePicker(true)}>
            <Text style={styles.rowText}>{t('settings.languageOptions')}</Text>
            <View style={styles.languageContainer}>
              <Text style={styles.secondaryText}>{getCurrentLanguageName()}</Text>
              <Ionicons name="chevron-forward" size={16} color="#666" style={{ marginLeft: 5 }} />
            </View>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowText}>{t('settings.appVersion')}</Text>
            <Text style={styles.secondaryText}>1.0.0</Text>
          </View>
        </View>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>{t('settings.helpSupport')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>{t('settings.privacyPolicy')}</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing for logout button */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Logout Button - Shows when scrolled to bottom */}
      {showLogout && (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>{t('settings.logout')}</Text>
        </TouchableOpacity>
      )}

      {/* Custom Logout Popup */}
      <LogoutPopup
        visible={showLogoutPopup}
        onLogout={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />

      {/* Language Picker Modal */}
      <LanguagePicker
        visible={showLanguagePicker}
        onClose={() => setShowLanguagePicker(false)}
        onLanguageSelect={handleLanguageChange}
        currentLanguage={i18n.language}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "black",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "black",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 18,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowText: {
    fontSize: 16,
    color: "black",
  },
  secondaryText: {
    fontSize: 14,
    color: "gray",
  },
  languageContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleIcon: {
    width: 45,
    height: 25,
    resizeMode: "contain",
  },
  bottomSpacing: {
    height: 80, // Space for logout button
  },
  logoutButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#FF3B30",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
