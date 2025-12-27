/**
 * Pomodoro Screen - 25/5 minute work/break cycles
 * Translated from figma-dump for React Native
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { Text } from "../components/atoms";
import { useStore } from "../store";
import { colors } from "../theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type PomodoroPhase = "work" | "shortBreak" | "longBreak";

interface PomodoroScreenProps {
  navigation: any;
}

export default function PomodoroScreen({ navigation }: PomodoroScreenProps) {
  const [phase, setPhase] = useState<PomodoroPhase>("work");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [cycle, setCycle] = useState(1);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const phaseDurations = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Update progress animation
  useEffect(() => {
    const progress =
      ((phaseDurations[phase] - timeLeft) / phaseDurations[phase]) * 100;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, phase]);

  const handlePhaseComplete = async () => {
    setIsRunning(false);

    if (phase === "work") {
      const newCompleted = completedPomodoros + 1;
      setCompletedPomodoros(newCompleted);

      // Update global productivity tracker (25 minutes per pomodoro)
      const dayRefreshTime = useStore.getState().preferences.dayRefreshTime;
      await useStore.getState().addFocusMinutes(25, dayRefreshTime);

      // After 4 pomodoros, take a long break
      if (newCompleted % 4 === 0) {
        setPhase("longBreak");
        setTimeLeft(phaseDurations.longBreak);
      } else {
        setPhase("shortBreak");
        setTimeLeft(phaseDurations.shortBreak);
      }
    } else {
      setPhase("work");
      setTimeLeft(phaseDurations.work);
      if (phase === "longBreak") {
        setCycle((prev) => prev + 1);
      }
    }
  };

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
    setTimeLeft(phaseDurations[phase]);
  };

  const progress =
    ((phaseDurations[phase] - timeLeft) / phaseDurations[phase]) * 100;
  const pomodorosInCycle = completedPomodoros % 4;

  const progressRotation = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View>
          <Text style={styles.headerTitle}>Pomodoro</Text>
          <Text style={styles.headerSubtitle}>Cycle {cycle}</Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Phase Indicator */}
        <Animated.View
          style={[
            styles.phaseIndicator,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.phaseIcon}>{phase === "work" ? "🧠" : "☕"}</Text>
          <View style={styles.phaseText}>
            <Text style={styles.phaseTitle}>
              {phase === "work"
                ? "Focus Time"
                : phase === "longBreak"
                ? "Long Break"
                : "Short Break"}
            </Text>
            <Text style={styles.phaseSubtitle}>
              {phase === "work"
                ? "Stay focused on your task"
                : "Take a rest, you deserve it"}
            </Text>
          </View>
        </Animated.View>

        {/* Circular Timer */}
        <Animated.View
          style={[
            styles.timerContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Progress Circle */}
          <View style={styles.progressCircle}>
            <Animated.View
              style={[
                styles.progressRing,
                { transform: [{ rotate: progressRotation }] },
              ]}
            />
            <View style={styles.timerInner}>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Pomodoro Dots */}
        <Animated.View
          style={[styles.pomodoroDotsContainer, { opacity: fadeAnim }]}
        >
          {[0, 1, 2, 3].map((index) => (
            <View
              key={index}
              style={[
                styles.pomodoroDot,
                index < pomodorosInCycle && styles.pomodoroDotActive,
              ]}
            />
          ))}
        </Animated.View>

        {/* Controls */}
        <Animated.View style={[styles.controls, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <Text style={styles.controlIcon}>↻</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayPause}
            activeOpacity={0.7}
          >
            <Text style={styles.playIcon}>{isRunning ? "⏸" : "▶"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handlePhaseComplete()}
            activeOpacity={0.7}
          >
            <Text style={styles.controlIcon}>⏭</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Stats */}
        <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{completedPomodoros}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {Math.floor((completedPomodoros * 25) / 60)}h{" "}
              {(completedPomodoros * 25) % 60}m
            </Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },

  headerTitle: {
    fontFamily: "ZenDots-Regular",
    fontSize: 24,
    color: "#FFFFFF",
  },

  headerSubtitle: {
    fontFamily: "ZenDots-Regular",
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 4,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  closeIcon: {
    fontSize: 20,
    color: "#FFFFFF",
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  phaseIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 40,
  },

  phaseIcon: {
    fontSize: 32,
  },

  phaseText: {
    flex: 1,
  },

  phaseTitle: {
    fontFamily: "ZenDots-Regular",
    fontSize: 20,
    color: "#FFFFFF",
    marginBottom: 4,
  },

  phaseSubtitle: {
    fontFamily: "ZenDots-Regular",
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.5)",
  },

  timerContainer: {
    marginBottom: 40,
  },

  progressCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  progressRing: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 8,
    borderColor: "#FFFFFF",
    borderTopColor: "transparent",
    borderRightColor: "transparent",
  },

  timerInner: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },

  timerText: {
    fontFamily: "ZenDots-Regular",
    fontSize: 48,
    color: "#FFFFFF",
  },

  pomodoroDotsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 40,
  },

  pomodoroDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },

  pomodoroDotActive: {
    backgroundColor: "#FFFFFF",
  },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 40,
  },

  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  controlIcon: {
    fontSize: 24,
    color: "#FFFFFF",
  },

  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },

  playIcon: {
    fontSize: 32,
    color: "#000000",
  },

  statsContainer: {
    flexDirection: "row",
    gap: 20,
  },

  statBox: {
    flex: 1,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },

  statValue: {
    fontFamily: "ZenDots-Regular",
    fontSize: 20,
    color: "#FFFFFF",
    marginBottom: 8,
  },

  statLabel: {
    fontFamily: "ZenDots-Regular",
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.6)",
  },
});
