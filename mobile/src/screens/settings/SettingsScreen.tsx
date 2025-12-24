/**
 * Settings Screen
 *
 * App configuration and permissions management
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
  Text,
} from "react-native";
import { launcher, blocker, notifications } from "../../services/nativeBridge";
import { useStore } from "../../store";

export default function SettingsScreen() {
  const [isDefaultLauncher, setIsDefaultLauncher] = useState(false);
  const [hasUsagePermission, setHasUsagePermission] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [systemUIHidden, setSystemUIHidden] = useState(true);

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
  }, []);

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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                  <Text style={styles.cardSubtitle}>Set Zen as home screen</Text>
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

              <View style={styles.goalButtons}>
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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "400",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 16,
    fontWeight: "400",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
    fontWeight: "500",
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
    fontSize: 12,
    color: "#00FF88",
    fontWeight: "500",
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  actionButtonText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  goalButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  goalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  goalButtonActive: {
    backgroundColor: "#00FF88",
    borderColor: "#00FF88",
  },
  goalButtonText: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  goalButtonTextActive: {
    color: "#000000",
    fontWeight: "600",
  },
  versionText: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.3)",
    marginTop: 8,
  },
});
