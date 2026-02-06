/**
 * BottomNavBar Component
 * Reusable bottom navigation bar with screen wake animations
 * Extracted from HomeShell for consistent behavior across all screens
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  DeviceEventEmitter,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSystemInsets } from "@/hooks/useSystemInsets";
import { launcher } from "@/services/nativeBridge";

interface BottomNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  themeColors: {
    textPrimary: string;
    textTertiary: string;
    navBackground: string;
  };
}

export default function BottomNavBar({
  activeTab,
  onTabChange,
  themeColors,
}: BottomNavBarProps) {
  // Dynamic system insets
  const { navBarHeight, isNavBarVisible } = useSystemInsets();

  // Safe navbar height with default
  const safeNavBarHeight =
    typeof navBarHeight === "number" && !isNaN(navBarHeight) ? navBarHeight : 0;

  // Animation values
  const navBarAnim = useRef(new Animated.Value(1)).current;
  const navBarOffsetAnim = useRef(new Animated.Value(0)).current;

  // Handle nav bar visibility based on system navbar
  useEffect(() => {
    Animated.timing(navBarAnim, {
      toValue: isNavBarVisible ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();
  }, [isNavBarVisible]);

  // Screen on/off listener for temporary offset
  useEffect(() => {
    const onScreenOn = DeviceEventEmitter.addListener("onScreenOn", () => {
      // Move navbar up temporarily to avoid system navbar
      navBarOffsetAnim.setValue(48);

      // After 3.7 seconds, animate navbar back to normal position
      setTimeout(() => {
        Animated.timing(navBarOffsetAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      }, 3700);
    });

    return () => {
      onScreenOn.remove();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.bottomNavigation,
        {
          bottom: safeNavBarHeight,
          opacity: navBarAnim,
          transform: [
            {
              translateY: Animated.add(
                navBarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
                navBarOffsetAnim.interpolate({
                  inputRange: [0, 80],
                  outputRange: [0, -80],
                }),
              ),
            },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.navBackground,
          { backgroundColor: themeColors.navBackground },
        ]}
      />

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onTabChange("home")}
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
        onPress={() => onTabChange("tasks")}
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
        onPress={() => onTabChange("focus")}
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
        onPress={() => onTabChange("stats")}
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
  );
}

const styles = StyleSheet.create({
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

  navBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 0,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    zIndex: 1,
  },
});
