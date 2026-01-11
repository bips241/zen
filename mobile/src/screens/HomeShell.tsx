/**
 * HomeShell Screen - Minimalist Launcher
 * Based on Figma design with frosted glass cards
 * Enhanced with animations and consistent styling
 * Dynamic layout adjustment based on system UI visibility
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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { Text } from "../components/atoms";
import { colors } from "../theme";
import { launcher } from "../services/nativeBridge";
import { useStore } from "../store";
import { useSystemInsets } from "../hooks/useSystemInsets";

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

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type HomeShellNavigationProp = {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
};

interface HomeShellProps {
  navigation: HomeShellNavigationProp;
}

export default function HomeShell({ navigation }: HomeShellProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Dynamic system insets monitoring
  const { navBarHeight, isNavBarVisible, isKeyboardVisible } =
    useSystemInsets();

  // Safe navbar height with default
  const safeNavBarHeight =
    typeof navBarHeight === "number" && !isNaN(navBarHeight) ? navBarHeight : 0;

  // Connect to store
  const todayMinutes = useStore((state) => state.todayMinutes);
  const dailyGoalMinutes = useStore(
    (state) => state.preferences.dailyGoalMinutes
  );
  const currentStreak = useStore((state) => state.currentStreak);
  const dayRefreshTime = useStore((state) => state.preferences.dayRefreshTime);
  const isHydrated = useStore((state) => state.isHydrated);
  const hydrateFromDatabase = useStore((state) => state.hydrateFromDatabase);
  const checkAndResetDaily = useStore((state) => state.checkAndResetDaily);

  // Log when todayMinutes changes
  useEffect(() => {
    console.log("[HomeShell] todayMinutes updated:", todayMinutes);
  }, [todayMinutes]);

  // Log system UI changes
  useEffect(() => {
    console.log(
      "[HomeShell] System UI changed - NavBar:",
      safeNavBarHeight,
      "px, Visible:",
      isNavBarVisible
    );
  }, [safeNavBarHeight, isNavBarVisible]);

  // Hydrate from database on mount
  useEffect(() => {
    if (!isHydrated) {
      hydrateFromDatabase(dayRefreshTime);
    }
  }, [isHydrated, dayRefreshTime]);

  // Check for daily reset periodically
  useEffect(() => {
    checkAndResetDaily(dayRefreshTime);

    // Check every minute if day has changed
    const checkInterval = setInterval(() => {
      checkAndResetDaily(dayRefreshTime);
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, [dayRefreshTime]);

  // Calculate progress percentage
  const progressPercentage = Math.min(
    (todayMinutes / dailyGoalMinutes) * 100,
    100
  );

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const circleAnim = useRef(new Animated.Value(0)).current;

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
  }, []);

  // Progress animations - updates when todayMinutes changes
  useEffect(() => {
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: progressPercentage,
        duration: 1200,
        delay: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(circleAnim, {
        toValue: progressPercentage,
        duration: 1500,
        delay: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [progressPercentage]);

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

  // Circular progress calculation
  const radius = 50;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = circleAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
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
          onPress={() => navigation.navigate("AmbientMusic")}
        >
          <Ionicons name="musical-notes" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
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
        <View style={styles.productivityHeader}>
          <Text style={styles.productivityTitle}>productivity tracker</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Stats")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="stats-chart"
              size={20}
              color="rgba(255, 255, 255, 0.6)"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.trackerContent}>
          {/* Circular Progress Loader */}
          <View style={styles.circularProgress}>
            <Svg width={120} height={120} viewBox="0 0 120 120">
              {/* Background circle */}
              <Circle
                cx="60"
                cy="60"
                r={radius}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progress circle */}
              <AnimatedCircle
                cx="60"
                cy="60"
                r={radius}
                stroke="#FFFFFF"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin="60, 60"
              />
            </Svg>
            <View style={styles.circularProgressContent}>
              <Text style={styles.progressPercentage}>
                {Math.round(progressPercentage)}%
              </Text>
              <Text style={styles.progressSubtext}>complete</Text>
            </View>
          </View>

          {/* Stats Info */}
          <View style={styles.trackerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{todayMinutes}</Text>
              <Text style={styles.statLabel}>minutes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dailyGoalMinutes}</Text>
              <Text style={styles.statLabel}>goal</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.streakRow}>
                <MaterialCommunityIcons name="fire" size={18} color="#FFFFFF" />
                <Text style={styles.statValue}>{currentStreak}</Text>
              </View>
              <Text style={styles.statLabel}>streak</Text>
            </View>
          </View>
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

      {/* Focus Modes Container */}
      <Animated.View
        style={[
          styles.focusModesContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        <View style={styles.focusModesGrid}>
          {/* Tratak */}
          <TouchableOpacity
            style={styles.focusModeCard}
            onPress={handleTratak}
            activeOpacity={0.8}
          >
            <View style={styles.focusModeIconContainer}>
              <MaterialCommunityIcons name="candle" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.focusModeLabel}>Tratak</Text>
          </TouchableOpacity>

          {/* Pomodoro */}
          <TouchableOpacity
            style={styles.focusModeCard}
            onPress={() => navigation.navigate("Pomodoro")}
            activeOpacity={0.8}
          >
            <View style={styles.focusModeIconContainer}>
              <Ionicons name="timer-outline" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.focusModeLabel}>Pomodoro</Text>
          </TouchableOpacity>

          {/* Eisenhower Matrix */}
          <TouchableOpacity
            style={styles.focusModeCard}
            onPress={() => navigation.navigate("EisenhowerMatrix")}
            activeOpacity={0.8}
          >
            <View style={styles.focusModeIconContainer}>
              <MaterialCommunityIcons name="grid" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.focusModeLabel}>Matrix</Text>
          </TouchableOpacity>

          {/* Forest Focus */}
          <TouchableOpacity
            style={styles.focusModeCard}
            onPress={() => navigation.navigate("ForestFocus")}
            activeOpacity={0.8}
          >
            <View style={styles.focusModeIconContainer}>
              <MaterialCommunityIcons name="tree" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.focusModeLabel}>Forest</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Quick Actions - Dynamically positioned above tab bar */}
      <Animated.View style={[styles.quickActionsContainer]}>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate("AppDrawer")}
            activeOpacity={0.7}
          >
            <Ionicons name="apps" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleLaunchApp(APP_PACKAGES.SEARCH)}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleLaunchApp(APP_PACKAGES.DIALER)}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleLaunchApp(APP_PACKAGES.MESSAGES)}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate("DNDSettings")}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="bell-off" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
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

  // Header
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
  },

  headerIcon: {
    fontSize: 20,
    color: "#FFFFFF",
  },

  // Time Display
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
    textShadowColor: "rgba(255, 255, 255, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 39,
  },

  // Productivity Card
  productivityCard: {
    position: "absolute",
    left: 10,
    top: SCREEN_HEIGHT * 0.25,
    width: SCREEN_WIDTH - 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 29,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },

  productivityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  productivityTitle: {
    fontFamily: "ZenDots-Regular",
    fontSize: 13,
    lineHeight: 16,
    color: "#FFFFFF",
  },

  trackerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
  },

  circularProgress: {
    position: "relative",
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },

  circularProgressContent: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },

  progressPercentage: {
    fontFamily: "ZenDots-Regular",
    fontSize: 24,
    lineHeight: 28,
    color: "#FFFFFF",
    fontWeight: "300",
  },

  progressSubtext: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
  },

  trackerStats: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  statItem: {
    alignItems: "center",
    gap: 4,
  },

  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  statValue: {
    fontFamily: "ZenDots-Regular",
    fontSize: 15,
    lineHeight: 22,
    color: "#FFFFFF",
    fontWeight: "300",
  },

  statLabel: {
    fontSize: 8,
    color: "rgba(255, 255, 255, 0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },

  // Section Title
  sectionTitleContainer: {
    position: "absolute",
    left: 24,
    top: SCREEN_HEIGHT * 0.58,
    width: SCREEN_WIDTH - 48,
  },

  sectionTitle: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.6)",
    letterSpacing: 1.5,
    fontWeight: "400",
    marginBottom: 12,
  },

  // Focus Modes Container
  focusModesContainer: {
    position: "absolute",
    left: 10,
    top: SCREEN_HEIGHT * 0.63,
    width: SCREEN_WIDTH - 20,
    height: SCREEN_HEIGHT * 0.14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 12,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 13,
    elevation: 10,
  },

  focusModesGrid: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "stretch",
    gap: 8,
  },

  focusModeCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },

  focusModeIconContainer: {
    flex: 1,
    width: "80%",
    height: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 1,
  },

  focusModeLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    fontWeight: "400",
  },

  // Quick Actions
  quickActionsContainer: {
    position: "absolute",
    left: 10,
    width: SCREEN_WIDTH - 20,
    bottom: 60,
    height: 72,
  },

  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 29,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  quickActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    textAlign: "center",
    marginTop: 4,
  },
});
