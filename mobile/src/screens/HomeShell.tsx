/**
 * HomeShell Screen - Minimalist Launcher
 * Based on Figma design with frosted glass cards
 * Enhanced with animations and focus modes styling
 */

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text } from "../components/atoms";
import { colors } from "../theme";
import { launcher } from "../services/nativeBridge";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Essential app package names
const APP_PACKAGES = {
  CHROME: "com.android.chrome",
  GMAIL: "com.google.android.gm",
  SEARCH: "com.google.android.googlequicksearchbox",
  SETTINGS: "com.android.settings",
  DIALER: "com.google.android.dialer",
  MESSAGES: "com.google.android.apps.messaging",
} as const;

// Mock progress value - replace with real data from store
const CURRENT_PROGRESS = 30;

type HomeShellNavigationProp = NativeStackNavigationProp<any>;

interface HomeShellProps {
  navigation: HomeShellNavigationProp;
}

export default function HomeShell({ navigation }: HomeShellProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    launcher.hideSystemUI();
    const hideInterval = setInterval(() => launcher.hideSystemUI(), 3000);
    return () => clearInterval(hideInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: CURRENT_PROGRESS,
      duration: 1000,
      delay: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  const formatTime = (date: Date) => {
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const handleLaunchApp = async (pkg: string) => {
    try {
      await launcher.launchApp(pkg);
    } catch (err) {
      console.error("App launch failed:", err);
    }
  };

  const handleTratak = () => {
    try {
      navigation.navigate("Tratak");
    } catch (error) {
      console.error("Navigation to Tratak failed:", error);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.background} />

      {/* Header Buttons */}
      <Animated.View style={[styles.headerButtons, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("AppDrawer")}
        >
          <Text style={styles.headerIcon}>☰</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Settings")}
        >
          <Text style={styles.headerIcon}>⚙️</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Time Display */}
      <Animated.View
        style={[
          styles.timeContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
      </Animated.View>

      {/* Productivity Tracker Card */}
      <Animated.View
        style={[
          styles.productivityCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        <Text style={styles.productivityTitle}>productivity tracker</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>
          <Text style={styles.progressLabel}>{CURRENT_PROGRESS}%</Text>
          <Text style={styles.timeLabel}>120 min</Text>
        </View>
      </Animated.View>

      {/* Section Title */}
      <Animated.View
        style={[
          styles.sectionTitleContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        <Text style={styles.sectionTitle}>FOCUS MODES</Text>
      </Animated.View>

      {/* Main Actions Container */}
      <Animated.View
        style={[
          styles.actionsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        {/* Row 1: Essential Apps */}
        <Animated.View style={[styles.appRow, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleLaunchApp(APP_PACKAGES.CHROME)}
            activeOpacity={0.7}
          >
            <Text style={styles.iconEmoji}>🌐</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleLaunchApp(APP_PACKAGES.GMAIL)}
            activeOpacity={0.7}
          >
            <Text style={styles.iconEmoji}>📧</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleLaunchApp(APP_PACKAGES.SEARCH)}
            activeOpacity={0.7}
          >
            <Text style={styles.iconEmoji}>🔍</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleLaunchApp(APP_PACKAGES.SETTINGS)}
            activeOpacity={0.7}
          >
            <Text style={styles.iconEmoji}>⚙️</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Row 2: Focus Methods */}
        <Animated.View style={[styles.appRow, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleTratak}
            activeOpacity={0.7}
          >
            <Text style={styles.iconEmoji}>🕯️</Text>
            <Text style={styles.iconLabel}>Tratak</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Pomodoro")}
            activeOpacity={0.7}
          >
            <Text style={styles.iconEmoji}>⏱️</Text>
            <Text style={styles.iconLabel}>Pomodoro</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("EisenhowerMatrix")}
            activeOpacity={0.7}
          >
            <Text style={styles.iconEmoji}>📊</Text>
            <Text style={styles.iconLabel}>Matrix</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("ForestFocus")}
            activeOpacity={0.7}
          >
            <Text style={styles.iconEmoji}>🌳</Text>
            <Text style={styles.iconLabel}>Forest</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Row 3: Core Actions */}
        <Animated.View style={[styles.appRow, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleLaunchApp(APP_PACKAGES.DIALER)}
            activeOpacity={0.7}
          >
            <Text style={styles.iconEmoji}>📞</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleLaunchApp(APP_PACKAGES.MESSAGES)}
            activeOpacity={0.7}
          >
            <Text style={styles.iconEmoji}>💬</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("DNDSettings")}
            activeOpacity={0.7}
          >
            <Text style={styles.iconEmoji}>🔕</Text>
          </TouchableOpacity>

          <View style={styles.iconButton} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },

  background: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#000000",
  },

  timeContainer: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.1,
    alignSelf: "center",
  },

  timeText: {
    fontFamily: "ZenDots-Regular",
    fontSize: 43,
    lineHeight: 52,
    color: "#FFFFFF",
    textShadowColor: "rgba(255, 253, 253, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 39,
  },

  headerButtons: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.04,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  headerIcon: {
    fontSize: 20,
    color: "#FFFFFF",
  },

  notificationBell: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.06,
    right: 20,
    width: 35,
    height: 35,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(255, 250, 250, 0.1)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },

  bellIcon: {
    fontSize: 18,
  },

  productivityCard: {
    position: "absolute",
    left: 10,
    top: SCREEN_HEIGHT * 0.25,
    width: SCREEN_WIDTH - 20,
    height: 113,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 29,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 13,
    elevation: 10,
    padding: 20,
  },

  productivityTitle: {
    fontFamily: "ZenDots-Regular",
    fontSize: 13,
    lineHeight: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 15,
  },

  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    borderColor: "#fffdfdff",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },

  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 13,
    shadowColor: "rgba(255, 250, 250, 0.15)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
  },

  progressLabel: {
    fontFamily: "ZenDots-Regular",
    fontSize: 12,
    lineHeight: 14,
    color: "#FFFFFF",
    marginLeft: 10,
  },

  timeLabel: {
    fontFamily: "ZenDots-Regular",
    fontSize: 12,
    lineHeight: 14,
    color: "#FFFFFF",
    marginLeft: 10,
  },

  sectionTitleContainer: {
    position: "absolute",
    left: 20,
    top: SCREEN_HEIGHT * 0.61,
    width: SCREEN_WIDTH - 40,
  },

  sectionTitle: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.6)",
    letterSpacing: 1.5,
    fontWeight: "400",
    marginBottom: 8,
  },

  actionsContainer: {
    position: "absolute",
    left: 10,
    top: SCREEN_HEIGHT * 0.66,
    width: SCREEN_WIDTH - 20,
    height: 212,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 29,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 13,
    elevation: 10,
    padding: 15,
    justifyContent: "space-between",
  },

  appRow: {
    flexDirection: "row",
    height: 53,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 29,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 13,
    elevation: 10,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },

  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 60,
    transform: [{ scale: 1 }],
  },

  iconEmoji: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 2,
  },

  iconLabel: {
    fontFamily: "ZenDots-Regular",
    fontSize: 8,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },
});
