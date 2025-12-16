/**
 * HomeShell Screen - Custom Launcher Home
 * Minimalist, distraction-free launcher UI
 */

import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Text, Spacer } from "../components/atoms";
import { colors, spacing } from "../theme";
import { launcher } from "../services/nativeBridge";

/* -------------------------------------------------------------------------- */
/*                                UI Primitives                               */
/* -------------------------------------------------------------------------- */

interface AppIconProps {
  icon: string;
  onPress: () => void;
}

const AppIcon: React.FC<AppIconProps> = ({ icon, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      style={styles.appIcon}
    >
      <Text style={styles.appIconEmoji}>{icon}</Text>
    </TouchableOpacity>
  );
};

interface AppRowProps {
  children: React.ReactNode;
}

const AppRow: React.FC<AppRowProps> = ({ children }) => {
  return <View style={styles.appRow}>{children}</View>;
};

/* -------------------------------------------------------------------------- */
/*                                  Screen                                    */
/* -------------------------------------------------------------------------- */

export default function HomeShell({ navigation }: any) {
  const [currentTime, setCurrentTime] = useState(new Date());

  /* ------------------------------ System UI -------------------------------- */

  useEffect(() => {
    launcher.hideSystemUI();

    const interval = setInterval(() => {
      launcher.hideSystemUI();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  /* ------------------------------- Clock ----------------------------------- */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h} : ${m}`;
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

  /* ------------------------------ Actions ---------------------------------- */

  const handleLaunchApp = async (packageName: string) => {
    try {
      await launcher.launchApp(packageName);
    } catch (err) {
      console.error("App launch failed:", err);
    }
  };

  const handleTratak = () => navigation.navigate("Tratak");

  /* -------------------------------------------------------------------------- */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.black}
        hidden={false}
      />
      <View style={styles.container}>
        {/* Time */}
        <View style={styles.timeSection}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
        </View>

        {/* Favorite Apps */}
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

        {/* Focus Tools */}
        <AppRow>
          <AppIcon icon="🕯️" onPress={handleTratak} />
          <AppIcon icon="⏱️" onPress={() => {}} />
          <AppIcon icon="📊" onPress={() => {}} />
          <AppIcon icon="🌳" onPress={() => {}} />
        </AppRow>

        <Spacer size="lg" />

        {/* Essentials */}
        <AppRow>
          <AppIcon
            icon="📞"
            onPress={() => handleLaunchApp("com.google.android.dialer")}
          />
          <AppIcon
            icon="💬"
            onPress={() => handleLaunchApp("com.google.android.apps.messaging")}
          />
          <AppIcon icon="🔕" onPress={() => {}} />
        </AppRow>
      </View>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const ZEN_FONT = "ZenDots-Regular";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.black,
  },

  container: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl,
    alignContent: "center",
  },

  timeSection: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },

  timeText: {
    fontFamily: ZEN_FONT,
    fontSize: 48,
    color: colors.white,
    letterSpacing: -1,
    lineHeight: 56,
    textAlign: "center",
  },

  dateText: {
    fontFamily: ZEN_FONT,
    fontSize: 13,
    color: colors.white,
    opacity: 0.7,
    lineHeight: 20,
    textAlign: "center",
    marginTop: spacing.xs,
  },

  appRow: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 36,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 72,

    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  appIcon: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  appIconEmoji: {
    fontSize: 28,
    lineHeight: 32,
    textAlign: "center",
  },
});
