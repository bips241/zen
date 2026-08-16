/**
 * BottomNavBar Component — Production-Grade Edge-to-Edge Implementation
 *
 * Architecture (informed by expo-android-navbar-overlap-fix.md + android-navbar-overlap-case-study.md):
 *
 * This is a custom launcher using Android Immersive Mode (BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE).
 * In this mode:
 *   - System bars are HIDDEN by default (opacity=0 system overlay)
 *   - When user swipes from edge, bars appear TRANSIENTLY over app content (no window resize)
 *   - App window always draws edge-to-edge behind where the bars would appear
 *
 * CORRECT approach (this implementation):
 *   1. Outer dock container is translated UP dynamically by (activeHeight - safeBottom)
 *      when the system bar is showing, so the icons clear the system buttons.
 *   2. To prevent lockscreen / unlock timing mismatch, we track AppState:
 *      - When app goes to background (device sleeps/locks), we set isWakeActive = true.
 *      - When the app is resumed (active), the dock renders shifted up INSTANTLY (duration: 0).
 *      - We then start a 3.7 second countdown (matching the transient system bar timeout)
 *        to slide the dock back down smoothly (duration: 200ms).
 *   3. This eliminates layout bridge latency and makes the layout shift seamless and OS-tuned.
 */

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  AppState,
  AppStateStatus,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSystemInsets } from "../../hooks/useSystemInsets";

interface BottomNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  themeColors: {
    textPrimary: string;
    textTertiary: string;
    navBackground: string;
  };
}

// Icon height (40dp) + icon padding (paddingVertical: 4 × 2 = 8) = 48dp touch target
const ICON_AREA_HEIGHT = 48;

export default function BottomNavBar({
  activeTab,
  onTabChange,
  themeColors,
}: BottomNavBarProps) {
  // Safe area fallback for stable bottom navigation safe-space
  const insets = useSafeAreaInsets();
  const safeBottom = Math.max(insets.bottom, 0);

  // Dynamic system UI monitoring
  const { navBarHeight, isNavBarVisible } = useSystemInsets();
  const safeNavBarHeight = typeof navBarHeight === "number" && !isNaN(navBarHeight) ? navBarHeight : 0;

  // Screen wake state
  const [isWakeActive, setIsWakeActive] = useState(false);

  // Animation values
  const entranceAnim = useRef(new Animated.Value(80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shiftAnim = useRef(new Animated.Value(0)).current;

  // Mount entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(entranceAnim, {
        toValue: 0,
        duration: 280,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 240,
        delay: 120,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Monitor AppState lifecycle for lockscreen wakeup sync
  useEffect(() => {
    let dismissTimer: NodeJS.Timeout | null = null;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "background") {
        // Device is locked / screen turned off
        // Immediately set isWakeActive to true (with no transition)
        setIsWakeActive(true);
        if (dismissTimer) clearTimeout(dismissTimer);
      } else if (nextAppState === "active") {
        // App unlocked and visible
        // Start the OS auto-hide countdown
        dismissTimer = setTimeout(() => {
          setIsWakeActive(false);
        }, 3700);
      }
    };

    const sub = AppState.addEventListener("change", handleAppStateChange);

    // Initial check on mount
    if (AppState.currentState === "active") {
      setIsWakeActive(true);
      dismissTimer = setTimeout(() => {
        setIsWakeActive(false);
      }, 3700);
    }

    return () => {
      sub.remove();
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, []);

  // Handle dynamic translateY shifting of the entire container
  useEffect(() => {
    const activeHeight = safeNavBarHeight > 0 ? safeNavBarHeight : 48;
    const isShowing = isNavBarVisible || isWakeActive;

    const targetOffset = isShowing ? -(Math.max(activeHeight, safeBottom) - safeBottom) : 0;

    // Apply translation INSTANTLY (0ms) when entering wake/lock state to prevent flash,
    // but slide back down/up smoothly on interactive swipes
    const duration = isWakeActive ? 0 : 200;

    Animated.timing(shiftAnim, {
      toValue: targetOffset,
      duration: duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [isNavBarVisible, isWakeActive, safeNavBarHeight, safeBottom]);

  // Combined vertical translation: entrance slide-in + visibility shift
  const combinedTranslateY = Animated.add(entranceAnim, shiftAnim);

  return (
    <Animated.View
      style={[
        styles.dockWrapper,
        {
          bottom: 0,
          paddingBottom: safeBottom,
          height: ICON_AREA_HEIGHT + safeBottom,
          opacity: opacityAnim,
          transform: [{ translateY: combinedTranslateY }],
        },
      ]}
    >
      {/* Background bleeds edge-to-edge and extends downward as a skirt */}
      <View
        style={[
          styles.navBackground,
          { backgroundColor: themeColors.navBackground },
        ]}
      />

      {/* Icon row */}
      <View style={styles.iconRow}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onTabChange("home")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Home"
          accessibilityState={{ selected: activeTab === "home" }}
        >
          <Ionicons
            name={activeTab === "home" ? "home" : "home-outline"}
            size={22}
            color={
              activeTab === "home"
                ? themeColors.textPrimary
                : themeColors.textTertiary
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onTabChange("tasks")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Tasks"
          accessibilityState={{ selected: activeTab === "tasks" }}
        >
          <Ionicons
            name={activeTab === "tasks" ? "checkbox" : "checkbox-outline"}
            size={22}
            color={
              activeTab === "tasks"
                ? themeColors.textPrimary
                : themeColors.textTertiary
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onTabChange("focus")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Focus"
          accessibilityState={{ selected: activeTab === "focus" }}
        >
          <Ionicons
            name={activeTab === "focus" ? "timer" : "timer-outline"}
            size={22}
            color={
              activeTab === "focus"
                ? themeColors.textPrimary
                : themeColors.textTertiary
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onTabChange("stats")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Stats"
          accessibilityState={{ selected: activeTab === "stats" }}
        >
          <Ionicons
            name={activeTab === "stats" ? "stats-chart" : "stats-chart-outline"}
            size={22}
            color={
              activeTab === "stats"
                ? themeColors.textPrimary
                : themeColors.textTertiary
            }
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dockWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "column",
    justifyContent: "flex-start",
  },

  navBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: -120, // Background skirt to cover translation gaps at bottom
  },

  iconRow: {
    height: ICON_AREA_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 16,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: ICON_AREA_HEIGHT,
    zIndex: 1,
  },
});
