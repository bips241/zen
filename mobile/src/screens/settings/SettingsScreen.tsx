/**
 * Settings Screen - Unified Design
 *
 * App configuration and permissions management
 * Consistent with HomeShell design system
 */

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { Text } from "../../components/atoms";
import { launcher, blocker, notifications } from "../../services/nativeBridge";
import { useStore } from "../../store";
import EnhancedSettingsScreen from "../EnhancedSettingsScreen";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SettingItem {
  icon: string;
  label: string;
  type: "toggle" | "navigation" | "button";
  value?: boolean;
  onChange?: (value: boolean) => void;
  screen?: string;
  onPress?: () => void;
}

interface SettingsSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsScreen({ navigation }: any) {
  const [isDefaultLauncher, setIsDefaultLauncher] = useState(false);
  const [hasUsagePermission, setHasUsagePermission] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [systemUIHidden, setSystemUIHidden] = useState(true);
  const [viewMode, setViewMode] = useState<"standard" | "enhanced">("standard");

  const preferences = useStore((state) => state.preferences);
  const updatePreferences = useStore((state) => state.updatePreferences);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    checkPermissions();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Cleanup animations on unmount
    return () => {
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
    };
  }, [fadeAnim, slideAnim]);

  const checkPermissions = async () => {
    try {
      const [isLauncher, hasUsage, hasNotif, notifEnabled] = await Promise.all([
        launcher.isDefault(),
        blocker.hasUsageStatsPermission(),
        notifications.hasPermission(),
        notifications.isEnabled(),
      ]);

      setIsDefaultLauncher(isLauncher);
      setHasUsagePermission(hasUsage);
      setHasNotificationPermission(hasNotif);
      setNotificationsEnabled(notifEnabled);
    } catch (error) {
      console.error("[Settings] Error checking permissions:", error);
    }
  };

  const handleSetAsDefaultLauncher = async () => {
    try {
      const result = await launcher.setAsDefault();
      if (result.success) {
        Alert.alert(
          "Set as Default Launcher",
          'Please select Zen Mobile from the list and tap "Always"',
          [{ text: "OK", onPress: checkPermissions }]
        );
      } else {
        Alert.alert(
          "Error",
          result.error || "Failed to set as default launcher"
        );
      }
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  const handleRequestUsagePermission = async () => {
    try {
      await blocker.requestUsageStatsPermission();
      Alert.alert(
        "Usage Access Required",
        'Please enable "Permit usage access" for Zen Mobile',
        [{ text: "OK", onPress: checkPermissions }]
      );
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  const handleRequestNotificationPermission = async () => {
    try {
      await notifications.requestPermission();
      Alert.alert(
        "Notification Access Required",
        "Please enable notification access for Zen Mobile",
        [{ text: "OK", onPress: checkPermissions }]
      );
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    try {
      if (enabled) {
        await notifications.enable();
      } else {
        await notifications.disable();
      }
      setNotificationsEnabled(enabled);
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  const handleDailyGoalChange = (minutes: number) => {
    updatePreferences({ dailyGoalMinutes: minutes });
  };

  const handleToggleSystemUI = async (enabled: boolean) => {
    try {
      setSystemUIHidden(enabled);
      if (enabled) {
        await launcher.hideSystemUI();
      } else {
        await launcher.showSystemUI();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to toggle system UI");
    }
  };

  return (
    <>
      {viewMode === "enhanced" ? (
        <EnhancedSettingsScreen navigation={navigation} />
      ) : (
        <View style={styles.container}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.headerTitle}>⚙️ Settings</Text>
        <Text style={styles.headerSubtitle}>Configure app and permissions</Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Permissions Section */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Permissions</Text>

            {/* Default Launcher */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Default Launcher</Text>
                  <Text style={styles.cardSubtitle}>
                    Set Zen as home screen
                  </Text>
                </View>
                {isDefaultLauncher ? (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>✓ Active</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleSetAsDefaultLauncher}
                  >
                    <Text style={styles.actionButtonText}>Set Default</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Usage Stats Permission */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Usage Stats Access</Text>
                  <Text style={styles.cardSubtitle}>Track app usage time</Text>
                </View>
                {hasUsagePermission ? (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>✓ Granted</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleRequestUsagePermission}
                  >
                    <Text style={styles.actionButtonText}>Grant</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Fullscreen Mode */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Fullscreen Mode</Text>
                  <Text style={styles.cardSubtitle}>
                    Hide status bar and navigation
                  </Text>
                </View>
                <Switch
                  value={systemUIHidden}
                  onValueChange={handleToggleSystemUI}
                  trackColor={{ false: "#222222", true: "#00FF88" }}
                  thumbColor={systemUIHidden ? "#FFFFFF" : "#888888"}
                />
              </View>
            </View>

            {/* Notification Permission */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Notification Access</Text>
                  <Text style={styles.cardSubtitle}>
                    Block notifications during focus
                  </Text>
                </View>
                {hasNotificationPermission ? (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>✓ Granted</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleRequestNotificationPermission}
                  >
                    <Text style={styles.actionButtonText}>Grant</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Animated.View>

          {/* Focus Settings */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Focus Settings</Text>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Block Notifications</Text>
                  <Text style={styles.cardSubtitle}>
                    Hide notifications during sessions
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleToggleNotifications}
                  trackColor={{ false: "#222222", true: "#00FF88" }}
                  thumbColor={notificationsEnabled ? "#FFFFFF" : "#888888"}
                  disabled={!hasNotificationPermission}
                />
              </View>
            </View>

            {/* Friction Moments */}
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("FrictionSettings")}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Friction Moments</Text>
                  <Text style={styles.cardSubtitle}>
                    Breathing delay before opening apps
                  </Text>
                </View>
                <Text style={styles.arrowIcon}>→</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Daily Goal Settings */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Daily Goal</Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Focus Time Goal</Text>
              <Text style={styles.cardSubtitle}>
                Current: {preferences.dailyGoalMinutes} minutes
              </Text>

            <View style={styles.goalButtonsContainer}>
                {[30, 60, 90, 120, 180, 240].map((minutes) => (
                  <TouchableOpacity
                    key={minutes}
                    style={[
                      styles.goalButton,
                      preferences.dailyGoalMinutes === minutes &&
                        styles.goalButtonActive,
                    ]}
                    onPress={() => handleDailyGoalChange(minutes)}
                  >
                    <Text
                      style={[
                        styles.goalButtonText,
                        preferences.dailyGoalMinutes === minutes &&
                          styles.goalButtonTextActive,
                      ]}
                    >
                      {minutes}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* About Section */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>About</Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Zen Mobile</Text>
              <Text style={styles.cardSubtitle}>
                Distraction-free productivity launcher
              </Text>
              <Text style={styles.versionText}>Version 1.0.0 (Phase 3)</Text>
            </View>
          </Animated.View>

          {/* View Mode Toggle */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.viewModeButton}
              onPress={() =>
                setViewMode(viewMode === "standard" ? "enhanced" : "standard")
              }
              activeOpacity={0.7}
            >
              <Text style={styles.viewModeButtonText}>
                {viewMode === "standard"
                  ? "✨ View Enhanced Settings"
                  : "📋 View Standard Settings"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },

  headerTitle: {
    fontFamily: "ZenDots-Regular",
    fontSize: 32,
    fontWeight: "300",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.5)",
    marginBottom: 16,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 10,
    paddingBottom: 40,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.6)",
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 10,
    textTransform: "uppercase",
  },

  card: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    marginBottom: 8,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardInfo: {
    flex: 1,
    marginRight: 12,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  cardSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(0, 255, 136, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 136, 0.3)",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#00FF88",
  },

  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  actionButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },

  goalButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  goalButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  goalButtonActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },

  goalButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },

  goalButtonTextActive: {
    color: "#000000",
    fontWeight: "600",
  },

  arrowIcon: {
    fontSize: 24,
    color: "#888888",
  },

  versionText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.3)",
    marginTop: 8,
  },

  viewModeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  viewModeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
