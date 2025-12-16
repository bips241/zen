/**
 * HomeShell Screen - Minimalist Launcher
 * Based on Figma design with frosted glass cards
 */

import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Text } from "../components/atoms";
import { colors } from "../theme";
import { launcher } from "../services/nativeBridge";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function HomeShell({ navigation }: any) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    launcher.hideSystemUI();
    const hideInterval = setInterval(() => launcher.hideSystemUI(), 3000);
    return () => clearInterval(hideInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
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
    } catch (e) {
      console.log("Navigation failed", e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.background} />

      {/* Time Display */}
      <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

      {/* Notification Bell */}
      <TouchableOpacity style={styles.notificationBell}>
        <Text style={styles.bellIcon}>🔔</Text>
      </TouchableOpacity>

      {/* Productivity Tracker Card */}
      <View style={styles.productivityCard}>
        <Text style={styles.productivityTitle}>productivity tracker</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressLabel}>30%</Text>
          <Text style={styles.timeLabel}>120 min</Text>
        </View>
      </View>

      {/* Main Actions Container */}
      <View style={styles.actionsContainer}>
        {/* Row 1: Essential Apps */}
        <View style={styles.appRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleLaunchApp("com.android.chrome")}
          >
            <Text style={styles.iconEmoji}>🌐</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleLaunchApp("com.google.android.gm")}
          >
            <Text style={styles.iconEmoji}>📧</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              handleLaunchApp("com.google.android.googlequicksearchbox")
            }
          >
            <Text style={styles.iconEmoji}>🔍</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleLaunchApp("com.android.settings")}
          >
            <Text style={styles.iconEmoji}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Row 2: Focus Methods */}
        <View style={styles.appRow}>
          <TouchableOpacity style={styles.iconButton} onPress={handleTratak}>
            <Text style={styles.iconEmoji}>🕯️</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
            <Text style={styles.iconEmoji}>⏱️</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
            <Text style={styles.iconEmoji}>📊</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
            <Text style={styles.iconEmoji}>🌳</Text>
          </TouchableOpacity>
        </View>

        {/* Row 3: Core Actions */}
        <View style={styles.appRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleLaunchApp("com.google.android.dialer")}
          >
            <Text style={styles.iconEmoji}>📞</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleLaunchApp("com.google.android.apps.messaging")}
          >
            <Text style={styles.iconEmoji}>💬</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
            <Text style={styles.iconEmoji}>🔕</Text>
          </TouchableOpacity>

          <View style={styles.iconButton} />
        </View>
      </View>
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

  timeText: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.1,
    alignSelf: "center",
    fontFamily: "ZenDots-Regular",
    fontSize: 43,
    lineHeight: 52,
    color: "#FFFFFF",
    textShadowColor: "rgba(255, 253, 253, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 39,
  },

  notificationBell: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.06,
    right: 20,
    width: 35,
    height: 35,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
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
    backgroundColor: "rgba(0, 0, 0, 1)",
    borderRadius: 29,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
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
    backgroundColor: "#000000",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#FFFBFB",
    shadowColor: "rgba(255, 250, 250, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
    overflow: "hidden",
  },

  progressFill: {
    width: "30%",
    height: "100%",
    backgroundColor: "#D9D9D9",
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

  actionsContainer: {
    position: "absolute",
    left: 10,
    top: SCREEN_HEIGHT * 0.66,
    width: SCREEN_WIDTH - 20,
    height: 212,
    backgroundColor: "rgba(0, 0, 0, 1)",
    borderRadius: 29,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    padding: 15,
    justifyContent: "space-between",
  },

  appRow: {
    flexDirection: "row",
    height: 53,
    backgroundColor: "#FFFAFA",
    borderRadius: 29,
    shadowColor: "rgba(178, 171, 171, 0.5)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 14,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },

  iconButton: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
  },

  iconEmoji: {
    fontSize: 28,
    textAlign: "center",
  },
});
