import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "../store";

export default function FocusTimerScreen() {
  const navigation = useNavigation();
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const minutesCountedRef = useRef(0); // Track minutes already counted

  // Connect to productivity tracker
  const todayMinutes = useStore((state) => state.todayMinutes);
  const dailyGoalMinutes = useStore(
    (state) => state.preferences.dailyGoalMinutes
  );
  const currentStreak = useStore((state) => state.currentStreak);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: 200,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Track minutes elapsed and add to productivity tracker
  useEffect(() => {
    if (isRunning && mode === "focus") {
      const elapsedSeconds = initialTime - timeLeft;
      const currentMinutes = Math.floor(elapsedSeconds / 60);

      if (currentMinutes > minutesCountedRef.current) {
        const newMinutesToAdd = currentMinutes - minutesCountedRef.current;
        console.log(
          "[FocusTimerScreen] 🎯 New minute(s) elapsed! Adding:",
          newMinutesToAdd
        );

        const dayRefreshTime = useStore.getState().preferences.dayRefreshTime;
        useStore
          .getState()
          .addFocusMinutes(newMinutesToAdd, dayRefreshTime)
          .then(() => {
            console.log(
              "[FocusTimerScreen] ✅ Added",
              newMinutesToAdd,
              "minute(s) to tracker"
            );
          })
          .catch((error) => {
            console.error(
              "[FocusTimerScreen] ❌ Failed to add minutes:",
              error
            );
          });

        minutesCountedRef.current = currentMinutes;
      }
    }
  }, [timeLeft, isRunning, mode, initialTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      console.log(
        "[FocusTimerScreen] Timer started, mode:",
        mode,
        "initialTime:",
        initialTime
      );
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newValue = prev - 1;

          // Log every 10 seconds or in last 5 seconds
          if (newValue % 10 === 0 || newValue < 5) {
            console.log("[FocusTimerScreen] Timer tick:", prev, "->", newValue);
          }

          if (newValue <= 0) {
            console.log("[FocusTimerScreen] ⏰ Timer reached completion!");
            setIsRunning(false);

            if (mode === "focus") {
              console.log("[FocusTimerScreen] ✅ FOCUS SESSION COMPLETE!");
              setSessions((prevSessions) => prevSessions + 1);
              // Minutes already tracked in real-time via useEffect, just reset counter
              minutesCountedRef.current = 0;
            } else {
              console.log("[FocusTimerScreen] Break complete, not tracking");
            }
            return 0;
          }
          return newValue;
        });
      }, 1000);
    }
    return () => {
      if (interval) {
        console.log("[FocusTimerScreen] Cleaning up interval");
        clearInterval(interval);
      }
    };
  }, [isRunning, mode, initialTime]);

  useEffect(() => {
    const progress = ((initialTime - timeLeft) / initialTime) * 100;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, initialTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    minutesCountedRef.current = 0;
    setTimeLeft(initialTime);
  };

  const handleModeChange = (newMode: "focus" | "break") => {
    setMode(newMode);
    setIsRunning(false);
    const newTime = newMode === "focus" ? 25 * 60 : 5 * 60;
    minutesCountedRef.current = 0;
    setTimeLeft(newTime);
    setInitialTime(newTime);
  };

  const adjustTime = (delta: number) => {
    if (!isRunning) {
      minutesCountedRef.current = 0;
      const newTime = Math.max(60, initialTime + delta * 60);
      setInitialTime(newTime);
      setTimeLeft(newTime);
    }
  };

  const progressRotation = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.headerTitle}>Focus Timer</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Mode Selector */}
        <Animated.View
          style={[
            styles.modeSelector,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => handleModeChange("focus")}
            style={[
              styles.modeButton,
              mode === "focus" && styles.modeButtonActive,
            ]}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === "focus" && styles.modeButtonTextActive,
              ]}
            >
              Focus
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleModeChange("break")}
            style={[
              styles.modeButton,
              mode === "break" && styles.modeButtonActive,
            ]}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === "break" && styles.modeButtonTextActive,
              ]}
            >
              Break
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Circular Progress */}
        <Animated.View
          style={[
            styles.timerCircle,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Progress Ring */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground} />
            <Animated.View
              style={[
                styles.progressRing,
                { transform: [{ rotate: progressRotation }] },
              ]}
            />
          </View>

          {/* Timer Display */}
          <View style={styles.timerDisplay}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.timerLabel}>
              {mode === "focus" ? "STAY FOCUSED" : "TAKE A BREAK"}
            </Text>
          </View>
        </Animated.View>

        {/* Time Adjustment */}
        {!isRunning && (
          <Animated.View
            style={[
              styles.adjustmentContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => adjustTime(-5)}
              style={styles.adjustButton}
            >
              <Text style={styles.adjustIcon}>−</Text>
            </TouchableOpacity>
            <Text style={styles.adjustLabel}>
              {Math.floor(initialTime / 60)} min
            </Text>
            <TouchableOpacity
              onPress={() => adjustTime(5)}
              style={styles.adjustButton}
            >
              <Text style={styles.adjustIcon}>+</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Controls */}
        <Animated.View
          style={[
            styles.controls,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity onPress={handleReset} style={styles.controlButton}>
            <Text style={styles.controlIcon}>⟲</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePlayPause}
            style={styles.playButton}
            activeOpacity={0.9}
          >
            <Text style={styles.playIcon}>{isRunning ? "❚❚" : "▶"}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Stats */}
      <Animated.View style={[styles.stats, { opacity: fadeAnim }]}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{sessions}</Text>
            <Text style={styles.statLabel}>Sessions (This Screen)</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{todayMinutes}</Text>
            <Text style={styles.statLabel}>Total Minutes Today</Text>
          </View>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "400",
  },
  closeButton: {
    padding: 8,
    borderRadius: 999,
  },
  closeIcon: {
    fontSize: 32,
    color: "#FFFFFF",
    lineHeight: 32,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  modeSelector: {
    flexDirection: "row",
    gap: 8,
  },
  modeButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "transparent",
  },
  modeButtonActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  modeButtonText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 16,
  },
  modeButtonTextActive: {
    color: "#000000",
    fontWeight: "600",
  },
  timerCircle: {
    width: 280,
    height: 280,
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    position: "absolute",
    width: 240,
    height: 240,
  },
  progressBackground: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 6,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  progressRing: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 6,
    borderColor: "transparent",
    borderTopColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
  },
  timerDisplay: {
    alignItems: "center",
  },
  timerText: {
    fontSize: 64,
    color: "#FFFFFF",
    fontWeight: "300",
    marginBottom: 12,
  },
  timerLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    letterSpacing: 2,
  },
  adjustmentContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  adjustButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  adjustIcon: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  adjustLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
    minWidth: 80,
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  controlIcon: {
    fontSize: 24,
    color: "#FFFFFF",
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    fontSize: 32,
    color: "#000000",
  },
  stats: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  statsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
});
