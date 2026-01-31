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
  AppState,
  AppStateStatus,
  DeviceEventEmitter,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { Text } from "../components/atoms";
import { colors } from "../theme";
import { launcher } from "../services/nativeBridge";
import { appDetector } from "../services/appDetector";
import { useStore } from "../store";
import { useThemeStore } from "../store/themeStore";
import { useSystemInsets } from "../hooks/useSystemInsets";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Essential app package names - dialer and messages will be auto-detected
const APP_PACKAGES = {
  CHROME: "com.android.chrome",
  GMAIL: "com.google.android.gm",
  SEARCH: "com.google.android.googlequicksearchbox",
  SETTINGS: "com.android.settings",
} as const;

type HomeShellNavigationProp = {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
};

interface HomeShellProps {
  navigation: HomeShellNavigationProp;
}

export default function HomeShell({ navigation }: HomeShellProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dialerApp, setDialerApp] = useState<string>("");
  const [messagesApp, setMessagesApp] = useState<string>("");
  const [activeTab, setActiveTab] = useState("home");
  const [showNavAfterWake, setShowNavAfterWake] = useState(true);

  // Video playback state
  const videoRef = useRef<Video>(null);
  const [videoReady, setVideoReady] = useState(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const [videoOpacity] = useState(new Animated.Value(1));

  // Theme store
  const activeTheme = useThemeStore((state) => state.activeTheme);
  const screensaverEnabled = useThemeStore((state) => state.screensaverEnabled);
  const screensaverTimeout = useThemeStore((state) => state.screensaverTimeout);

  // Reset video ready state on theme change
  useEffect(() => {
    setVideoReady(false);
  }, [activeTheme.id]);

  // Dynamic theme colors based on active theme
  const getThemeColors = () => {
    if (activeTheme.type === "oled-black" || !activeTheme.localPath) {
      // OLED Mode - Keep current black/white minimalist styling
      return {
        cardBackground: "rgba(255, 255, 255, 0.05)",
        cardBackgroundAlt: "rgba(255, 255, 255, 0.1)",
        cardBorder: "rgba(255, 255, 255, 0.1)",
        buttonBackground: "rgba(255, 255, 255, 0.1)",
        buttonBorder: "rgba(255, 255, 255, 0.05)",
        textPrimary: "#FFFFFF",
        textSecondary: "rgba(255, 255, 255, 0.6)",
        textTertiary: "rgba(255, 255, 255, 0.5)",
        divider: "rgba(255, 255, 255, 0.1)",
        navBackground: "rgba(4, 4, 4, 0.3)",
      };
    } else {
      // Video Theme Mode - Dark overlay for light/white video backgrounds (like snowy themes)
      return {
        cardBackground: "rgba(0, 0, 0, 0.25)",
        cardBackgroundAlt: "rgba(0, 0, 0, 0.35)",
        cardBorder: "rgba(0, 0, 0, 0.3)",
        buttonBackground: "rgba(0, 0, 0, 0.3)",
        buttonBorder: "rgba(0, 0, 0, 0.2)",
        textPrimary: "#FFFFFF",
        textSecondary: "rgba(255, 255, 255, 0.9)",
        textTertiary: "rgba(255, 255, 255, 0.8)",
        divider: "rgba(0, 0, 0, 0.3)",
        navBackground: "rgba(0, 0, 0, 0.4)",
      };
    }
  };

  const themeColors = getThemeColors();

  // Dynamic system insets monitoring
  const { navBarHeight, isNavBarVisible, isKeyboardVisible } =
    useSystemInsets();

  // Safe navbar height with default
  const safeNavBarHeight =
    typeof navBarHeight === "number" && !isNaN(navBarHeight) ? navBarHeight : 0;

  // Connect to store
  const todayMinutes = useStore((state) => state.todayMinutes);
  const dailyGoalMinutes = useStore(
    (state) => state.preferences.dailyGoalMinutes,
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
      isNavBarVisible,
    );
  }, [safeNavBarHeight, isNavBarVisible]);

  // Hydrate from database on mount
  useEffect(() => {
    if (!isHydrated) {
      hydrateFromDatabase(dayRefreshTime);
    }
  }, [isHydrated, dayRefreshTime]);

  // Detect system apps on mount
  useEffect(() => {
    const detectApps = async () => {
      try {
        const [dialer, messages] = await Promise.all([
          appDetector.getDialerApp(),
          appDetector.getMessagesApp(),
        ]);
        setDialerApp(dialer);
        setMessagesApp(messages);
        console.log(
          "[HomeShell] Detected apps - Dialer:",
          dialer,
          "Messages:",
          messages,
        );
      } catch (error) {
        console.error("[HomeShell] App detection failed:", error);
      }
    };
    detectApps();
  }, []);

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
    100,
  );

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const circleAnim = useRef(new Animated.Value(0)).current;
  const navBarAnim = useRef(new Animated.Value(1)).current;

  // Handle nav bar visibility based on system navbar
  useEffect(() => {
    Animated.timing(navBarAnim, {
      toValue: isNavBarVisible ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();
  }, [isNavBarVisible]);

  useEffect(() => {
    launcher.hideSystemUI();
    const hideInterval = setInterval(() => launcher.hideSystemUI(), 3000);
    return () => clearInterval(hideInterval);
  }, []);

  // Native screen on/off listener
  useEffect(() => {
    // Start listening for screen events
    launcher
      .startScreenListener()
      .catch((err: unknown) =>
        console.error("[HomeShell] Failed to start screen listener:", err),
      );

    const onScreenOn = DeviceEventEmitter.addListener("onScreenOn", () => {
      console.log("[HomeShell] Screen turned ON - hiding nav");
      setShowNavAfterWake(false);

      // Show navigation after 2 seconds delay
      setTimeout(() => {
        console.log("[HomeShell] Showing navigation after screen on delay");
        setShowNavAfterWake(true);
      }, 2000);
    });

    const onScreenOff = DeviceEventEmitter.addListener("onScreenOff", () => {
      console.log("[HomeShell] Screen turned OFF");
    });

    return () => {
      onScreenOn.remove();
      onScreenOff.remove();
      launcher
        .stopScreenListener()
        .catch((err: unknown) =>
          console.error("[HomeShell] Failed to stop screen listener:", err),
        );
    };
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

  // Generate dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: themeColors.buttonBackground,
      borderWidth: 1,
      borderColor: themeColors.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    productivityCard: {
      position: "absolute",
      left: 10,
      top: SCREEN_HEIGHT * 0.25,
      width: SCREEN_WIDTH - 20,
      backgroundColor: themeColors.cardBackground,
      borderRadius: 29,
      borderWidth: 1,
      borderColor: themeColors.cardBorder,
      padding: 20,
      paddingTop: 16,
      paddingBottom: 16,
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: themeColors.divider,
    },
    focusModesContainer: {
      position: "absolute",
      left: 10,
      top: SCREEN_HEIGHT * 0.63,
      width: SCREEN_WIDTH - 20,
      height: SCREEN_HEIGHT * 0.14,
      backgroundColor: themeColors.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: themeColors.cardBorder,
      padding: 12,
    },
    focusModeIconContainer: {
      flex: 1,
      width: "80%",
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: themeColors.buttonBorder,
      backgroundColor: themeColors.buttonBackground,
      marginBottom: 8,
    },
    quickActionsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      backgroundColor: themeColors.cardBackground,
      borderRadius: 29,
      borderWidth: 1,
      borderColor: themeColors.cardBorder,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    quickActionButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: themeColors.buttonBackground,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: themeColors.buttonBorder,
      textAlign: "center",
      marginTop: 4,
    },
    navBackground: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: themeColors.navBackground,
    },
  });

  return (
    <View style={styles.container}>
      {/* Background - Video or OLED Black */}
      {activeTheme.type === "video" && activeTheme.localPath ? (
        <Animated.View
          style={[styles.backgroundVideo, { opacity: videoOpacity }]}
        >
          <Video
            key={activeTheme.id}
            ref={videoRef}
            source={{ uri: activeTheme.localPath }}
            style={styles.backgroundVideo}
            resizeMode={ResizeMode.COVER}
            isLooping
            isMuted
            shouldPlay={true}
            useNativeControls={false}
            progressUpdateIntervalMillis={500}
            onLoad={() => {
              console.log("[HomeShell] Video loaded and ready");
              setVideoReady(true);
            }}
            onError={(error) => {
              console.error("[HomeShell] Video error:", error);
              setVideoReady(false);
            }}
          />
        </Animated.View>
      ) : (
        <View style={styles.background} />
      )}

      {/* Header Buttons */}
      <Animated.View style={[styles.headerButtons, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={dynamicStyles.headerButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("ThemeStore")}
        >
          <Ionicons
            name="color-palette-outline"
            size={24}
            color={themeColors.textPrimary}
          />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            style={dynamicStyles.headerButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("AmbientMusic")}
          >
            <Ionicons
              name="musical-notes"
              size={24}
              color={themeColors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={dynamicStyles.headerButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("Settings")}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={themeColors.textPrimary}
            />
          </TouchableOpacity>
        </View>
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
          dynamicStyles.productivityCard,
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
              color={themeColors.textSecondary}
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
              <Circle
                cx="60"
                cy="60"
                r={radius}
                stroke="#FFFFFF"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={
                  circumference * (1 - progressPercentage / 100)
                }
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
            <View style={dynamicStyles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dailyGoalMinutes}</Text>
              <Text style={styles.statLabel}>goal</Text>
            </View>
            <View style={dynamicStyles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.streakRow}>
                <MaterialCommunityIcons
                  name="fire"
                  size={18}
                  color={themeColors.textPrimary}
                />
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
          dynamicStyles.focusModesContainer,
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
            <View style={dynamicStyles.focusModeIconContainer}>
              <MaterialCommunityIcons
                name="candle"
                size={32}
                color={themeColors.textPrimary}
              />
            </View>
            <Text style={styles.focusModeLabel}>Tratak</Text>
          </TouchableOpacity>

          {/* Pomodoro */}
          <TouchableOpacity
            style={styles.focusModeCard}
            onPress={() => navigation.navigate("Pomodoro")}
            activeOpacity={0.8}
          >
            <View style={dynamicStyles.focusModeIconContainer}>
              <Ionicons
                name="timer-outline"
                size={32}
                color={themeColors.textPrimary}
              />
            </View>
            <Text style={styles.focusModeLabel}>Pomodoro</Text>
          </TouchableOpacity>

          {/* Eisenhower Matrix */}
          <TouchableOpacity
            style={styles.focusModeCard}
            onPress={() => navigation.navigate("EisenhowerMatrix")}
            activeOpacity={0.8}
          >
            <View style={dynamicStyles.focusModeIconContainer}>
              <MaterialCommunityIcons
                name="grid"
                size={32}
                color={themeColors.textPrimary}
              />
            </View>
            <Text style={styles.focusModeLabel}>Matrix</Text>
          </TouchableOpacity>

          {/* Forest Focus */}
          <TouchableOpacity
            style={styles.focusModeCard}
            onPress={() => navigation.navigate("ForestFocus")}
            activeOpacity={0.8}
          >
            <View style={dynamicStyles.focusModeIconContainer}>
              <MaterialCommunityIcons
                name="tree"
                size={32}
                color={themeColors.textPrimary}
              />
            </View>
            <Text style={styles.focusModeLabel}>Forest</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Bottom Navigation */}
      <Animated.View
        style={[
          styles.bottomNavigation,
          {
            bottom: safeNavBarHeight,
            opacity: showNavAfterWake ? navBarAnim : 0,
            transform: [
              {
                translateY: navBarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={dynamicStyles.navBackground} />
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab("home")}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === "home" ? "home" : "home-outline"}
            size={18}
            color={
              activeTab === "home"
                ? themeColors.textPrimary
                : themeColors.textTertiary
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            setActiveTab("tasks");
            navigation.navigate("Tasks");
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === "tasks" ? "checkbox" : "checkbox-outline"}
            size={18}
            color={
              activeTab === "tasks"
                ? themeColors.textPrimary
                : themeColors.textTertiary
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            setActiveTab("focus");
            navigation.navigate("FocusTimer");
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === "focus" ? "timer" : "timer-outline"}
            size={18}
            color={
              activeTab === "focus"
                ? themeColors.textPrimary
                : themeColors.textTertiary
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            setActiveTab("stats");
            navigation.navigate("Stats");
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === "stats" ? "stats-chart" : "stats-chart-outline"}
            size={18}
            color={
              activeTab === "stats"
                ? themeColors.textPrimary
                : themeColors.textTertiary
            }
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Quick Actions - Above bottom nav */}
      <Animated.View
        style={[
          styles.quickActionsContainer,
          {
            bottom: safeNavBarHeight + 140,
            opacity: showNavAfterWake ? 1 : 0,
          },
        ]}
      >
        <View style={dynamicStyles.quickActionsRow}>
          <TouchableOpacity
            style={dynamicStyles.quickActionButton}
            onPress={() => navigation.navigate("AppDrawer")}
            activeOpacity={0.7}
          >
            <Ionicons name="apps" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.quickActionButton}
            onPress={() => handleLaunchApp(APP_PACKAGES.SEARCH)}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.quickActionButton}
            onPress={() => dialerApp && handleLaunchApp(dialerApp)}
            activeOpacity={0.7}
            disabled={!dialerApp}
          >
            <Ionicons name="call" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.quickActionButton}
            onPress={() => messagesApp && handleLaunchApp(messagesApp)}
            activeOpacity={0.7}
            disabled={!messagesApp}
          >
            <Ionicons name="chatbubble" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.quickActionButton}
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
  },

  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000000",
  },

  backgroundVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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

  headerIcon: {
    fontSize: 20,
    color: "#FFFFFF",
  },

  // Time Display
  timeContainer: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.15,
    alignSelf: "center",
  },

  timeText: {
    fontFamily: "ZenDots-Regular",
    fontSize: 55,
    lineHeight: 60,
    color: "#FFFFFF",
    textShadowColor: "rgba(255, 255, 255, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 39,
  },

  // Productivity Card
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

  // Focus Modes Grid
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

  focusModeLabel: {
    fontSize: 10,
    textAlign: "center",
    fontWeight: "400",
  },

  // Quick Actions
  quickActionsContainer: {
    position: "absolute",
    left: 10,
    width: SCREEN_WIDTH - 20,
    bottom: 160,
    height: 72,
  },

  // Bottom Navigation
  bottomNavigation: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingBottom: 0,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    zIndex: 1,
  },

  navLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "400",
  },

  navLabelActive: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
});
