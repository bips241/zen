/**
 * Settings Screen
 *
 * App configuration and permissions management
 */

import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { Text, Container, Spacer, Button } from "../../components/atoms";
import { Card } from "../../components/molecules";
import { colors, spacing } from "../../theme";
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

  useEffect(() => {
    checkPermissions();
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
    <Container padding="lg">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text variant="title">Settings</Text>
        <Text variant="small" color={colors.gray[500]}>
          Configure app and permissions
        </Text>

        <Spacer size="xl" />

        {/* Permissions Section */}
        <Text variant="heading">Permissions</Text>
        <Spacer size="md" />

        {/* Default Launcher */}
        <Card>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="bodyBold">Default Launcher</Text>
              <Text variant="small" color={colors.gray[500]}>
                Set Zen as home screen
              </Text>
            </View>
            {isDefaultLauncher ? (
              <View style={styles.statusBadge}>
                <Text variant="small" color={colors.success}>
                  ✓ Active
                </Text>
              </View>
            ) : (
              <Button
                label="Set Default"
                onPress={handleSetAsDefaultLauncher}
                variant="primary"
              />
            )}
          </View>
        </Card>

        <Spacer size="sm" />

        {/* Usage Stats Permission */}
        <Card>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="bodyBold">Usage Stats Access</Text>
              <Text variant="small" color={colors.gray[500]}>
                Track app usage time
              </Text>
            </View>
            {hasUsagePermission ? (
              <View style={styles.statusBadge}>
                <Text variant="small" color={colors.success}>
                  ✓ Granted
                </Text>
              </View>
            ) : (
              <Button
                label="Grant"
                onPress={handleRequestUsagePermission}
                variant="secondary"
              />
            )}
          </View>
        </Card>

        <Spacer size="sm" />

        {/* Fullscreen Mode */}
        <Card>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="bodyBold">Fullscreen Mode</Text>
              <Text variant="small" color={colors.gray[500]}>
                Hide status bar and navigation
              </Text>
            </View>
            <Switch
              value={systemUIHidden}
              onValueChange={handleToggleSystemUI}
              trackColor={{ false: colors.gray[700], true: colors.accent }}
              thumbColor={systemUIHidden ? colors.white : colors.gray[500]}
            />
          </View>
        </Card>

        <Spacer size="sm" />

        {/* Notification Permission */}
        <Card>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="bodyBold">Notification Access</Text>
              <Text variant="small" color={colors.gray[500]}>
                Block notifications during focus
              </Text>
            </View>
            {hasNotificationPermission ? (
              <View style={styles.statusBadge}>
                <Text variant="small" color={colors.success}>
                  ✓ Granted
                </Text>
              </View>
            ) : (
              <Button
                label="Grant"
                onPress={handleRequestNotificationPermission}
                variant="secondary"
              />
            )}
          </View>
        </Card>

        <Spacer size="xl" />

        {/* Focus Settings */}
        <Text variant="heading">Focus Settings</Text>
        <Spacer size="md" />

        {/* Block Notifications Toggle */}
        <Card>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="bodyBold">Block Notifications</Text>
              <Text variant="small" color={colors.gray[500]}>
                Hide notifications during sessions
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.gray[700], true: colors.accentDark }}
              thumbColor={
                notificationsEnabled ? colors.accent : colors.gray[500]
              }
              disabled={!hasNotificationPermission}
            />
          </View>
        </Card>

        <Spacer size="xl" />

        {/* Daily Goal Settings */}
        <Text variant="heading">Daily Goal</Text>
        <Spacer size="md" />

        <Card>
          <Text variant="bodyBold">Focus Time Goal</Text>
          <Text variant="small" color={colors.gray[500]}>
            Current: {preferences.dailyGoalMinutes} minutes
          </Text>
          <Spacer size="md" />

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
                  variant="small"
                  color={
                    preferences.dailyGoalMinutes === minutes
                      ? colors.black
                      : colors.white
                  }
                >
                  {minutes}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Spacer size="xl" />

        {/* About Section */}
        <Text variant="heading">About</Text>
        <Spacer size="md" />

        <Card>
          <Text variant="bodyBold">Zen Mobile</Text>
          <Text variant="small" color={colors.gray[500]}>
            Distraction-free productivity launcher
          </Text>
          <Spacer size="sm" />
          <Text variant="tiny" color={colors.gray[600]}>
            Version 1.0.0 (Phase 3)
          </Text>
        </Card>

        <Spacer size="xxl" />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.gray[900],
    borderRadius: 8,
  },
  goalButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  goalButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.gray[800],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  goalButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
});
