/**
 * HomeShell Screen - Custom Launcher Home
 *
 * Minimalist launcher with 3 customizable rows:
 * - Row 1: User's favorite apps (customizable)
 * - Row 2: Focus/Productivity methods (Tratak, Pomodoro, Matrix, Forest)
 * - Row 3: Essential actions (Call, Message, DND)
 */

import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Text, Spacer } from "../components/atoms";
import { colors, spacing } from "../theme";
import { launcher } from "../services/nativeBridge";

// Icon Component for Apps
interface AppIconProps {
  icon: string;
  onPress: () => void;
}

const AppIcon: React.FC<AppIconProps> = ({ icon, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.appIcon}>
    <Text style={styles.appIconEmoji}>{icon}</Text>
  </TouchableOpacity>
);

// Row Container Component
interface AppRowProps {
  children: React.ReactNode;
}

const AppRow: React.FC<AppRowProps> = ({ children }) => (
  <View style={styles.appRow}>{children}</View>
);

export default function HomeShell({ navigation }: any) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Hide system UI on mount
  useEffect(() => {
    // Initial hide
    launcher.hideSystemUI();

    // Re-hide periodically as a safety measure (less aggressive than before)
    const interval = setInterval(() => {
      launcher.hideSystemUI();
    }, 3000); // Every 3 seconds instead of 500ms

    return () => clearInterval(interval);
  }, []);

  // Update time every second for smooth display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDate = (date: Date) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${days[date.getDay()]}, ${
      months[date.getMonth()]
    } ${date.getDate()}`;
  };

  // App launch handlers
  const handleLaunchApp = async (packageName: string) => {
    try {
      await launcher.launchApp(packageName);
    } catch (error) {
      console.error("Failed to launch app:", error);
    }
  };

  // Focus method handlers
  const handleTratak = () => {
    // navigate to Tratak screen
    try {
      // @ts-ignore - navigation type from tab navigator
      navigation.navigate("Tratak");
    } catch (e) {
      console.log("Navigation to Tratak failed", e);
    }
  };

  const handlePomodoro = () => {
    console.log("Open Pomodoro Timer");
    // TODO: Navigate to Pomodoro screen
  };

  const handleMatrix = () => {
    console.log("Open Eisenhower Matrix");
    // TODO: Navigate to Matrix screen
  };

  const handleForest = () => {
    console.log("Open Forest Focus");
    // TODO: Navigate to Forest screen
  };

  // Essential action handlers
  const handleCall = async () => {
    await handleLaunchApp("com.google.android.dialer");
  };

  const handleMessage = async () => {
    await handleLaunchApp("com.google.android.apps.messaging");
  };

  const handleDND = () => {
    console.log("Toggle DND");
    // TODO: Toggle Do Not Disturb mode
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Time Display - Large and Centered */}
        <View style={styles.timeSection}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Spacer size="xs" />
          <Text
            variant="small"
            color={colors.gray[500]}
            style={styles.dateText}
          >
            {formatDate(currentTime)}
          </Text>
        </View>

        <Spacer size="xxl" />

        {/* Row 1: User's Favorite Apps */}
        <AppRow>
          <AppIcon
            icon="🌐"
            onPress={() => handleLaunchApp("com.android.chrome")}
          />
          <AppIcon
            icon="📦"
            onPress={() => handleLaunchApp("com.google.android.gm")}
          />
          <AppIcon
            icon="🔍"
            onPress={() =>
              handleLaunchApp("com.google.android.googlequicksearchbox")
            }
          />
          <AppIcon
            icon="⚙️"
            onPress={() => handleLaunchApp("com.android.settings")}
          />
        </AppRow>

        <Spacer size="lg" />

        {/* Row 2: Focus & Productivity Methods */}
        <AppRow>
          <AppIcon icon="🕯️" onPress={handleTratak} />
          <AppIcon icon="⏱️" onPress={handlePomodoro} />
          <AppIcon icon="📊" onPress={handleMatrix} />
          <AppIcon icon="🌳" onPress={handleForest} />
        </AppRow>

        <Spacer size="lg" />

        {/* Row 3: Essential Actions */}
        <AppRow>
          <AppIcon icon="📞" onPress={handleCall} />
          <AppIcon icon="💬" onPress={handleMessage} />
          <AppIcon icon="🔕" onPress={handleDND} />
        </AppRow>

        <Spacer size="xxl" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    justifyContent: "center",
  },
  timeSection: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  timeText: {
    fontSize: 72,
    fontWeight: "200",
    color: colors.white,
    letterSpacing: -2,
  },
  dateText: {
    fontSize: 16,
    opacity: 0.6,
  },
  appRow: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 40,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 4,
    shadowColor: colors.white,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
  },
  appIconEmoji: {
    fontSize: 28,
    textAlign: "center",
  },
});
