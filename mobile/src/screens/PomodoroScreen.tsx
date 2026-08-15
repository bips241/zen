/**
 * Pomodoro Screen - 25/5 minute work/break cycles
 * Redesigned with minimal emoji-focused UI and AOD support
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
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

    // Keep screen awake when timer is running
    return () => {
      deactivateKeepAwake();
    };
  }, []);

  useEffect(() => {
    // Manage wake lock based on running state
    if (isRunning) {
      activateKeepAwakeAsync().catch((err) =>
        console.error("Failed to activate wake lock:", err),
      );
    } else {
      deactivateKeepAwake();
    }
  }, [isRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (isRunning && timeLeft === 0) {
      handlePhaseComplete();
    }
  }, [timeLeft, isRunning]);

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

  // Get icon for current phase
  const getPhaseIcon = () => {
    if (phase === "work") {
      return (
        <MaterialCommunityIcons
          name="brain"
          size={SCREEN_HEIGHT * 0.15}
          color="#FFFFFF"
        />
      );
    }
    if (phase === "longBreak") {
      return (
        <Ionicons name="cafe" size={SCREEN_HEIGHT * 0.15} color="#FFFFFF" />
      );
    }
    return (
      <Ionicons
        name="cafe-outline"
        size={SCREEN_HEIGHT * 0.15}
        color="#FFFFFF"
      />
    );
  };

  const getPhaseTitle = () => {
    if (phase === "work") return "Focus Time";
    if (phase === "longBreak") return "Long Break";
    return "Short Break";
  };

  return (
    <View style={styles.container}>
      {/* Minimal Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.cycleText}>Cycle {cycle}</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main Content - Emoji Focused */}
      <View style={styles.content}>
        {/* Giant Icon Display */}
        <Animated.View
          style={[
            styles.emojiContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {getPhaseIcon()}
        </Animated.View>

        {/* Phase Title */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.phaseTitle}>{getPhaseTitle()}</Text>
        </Animated.View>

        {/* Timer Display */}
        <Animated.View
          style={[
            styles.timerDisplay,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </Animated.View>

        {/* Progress Bar (Simple Line) */}
        <Animated.View
          style={[styles.progressBarContainer, { opacity: fadeAnim }]}
        >
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
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
            {isRunning ? (
              <Ionicons
                name="pause"
                size={SCREEN_WIDTH * 0.08}
                color="#000000"
              />
            ) : (
              <Ionicons
                name="play"
                size={SCREEN_WIDTH * 0.08}
                color="#000000"
                style={{ marginLeft: SCREEN_WIDTH * 0.005 }}
              />
            )}
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
    paddingHorizontal: SCREEN_WIDTH * 0.06,
    paddingTop: SCREEN_HEIGHT * 0.06,
    paddingBottom: SCREEN_HEIGHT * 0.02,
  },

  cycleText: {
    fontFamily: "ZenDots-Regular",
    fontSize: SCREEN_WIDTH * 0.03,
    color: "rgba(255, 255, 255, 0.4)",
    textTransform: "uppercase",
    letterSpacing: 2,
  },

  closeButton: {
    width: SCREEN_WIDTH * 0.1,
    height: SCREEN_WIDTH * 0.1,
    borderRadius: SCREEN_WIDTH * 0.05,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },

  closeIcon: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: "rgba(255, 255, 255, 0.6)",
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SCREEN_WIDTH * 0.08,
  },

  emojiContainer: {
    marginBottom: SCREEN_HEIGHT * 0.03,
    height: SCREEN_HEIGHT * 0.2,
    justifyContent: "center",
    alignItems: "center",
  },

  phaseTitle: {
    fontFamily: "ZenDots-Regular",
    fontSize: SCREEN_WIDTH * 0.04,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: SCREEN_HEIGHT * 0.025,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 3,
  },

  timerDisplay: {
    marginBottom: SCREEN_HEIGHT * 0.03,
    height: SCREEN_HEIGHT * 0.1,
  },

  timerText: {
    fontFamily: "ZenDots-Regular",
    fontSize: SCREEN_WIDTH * 0.15,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 4,
    lineHeight: SCREEN_HEIGHT * 0.1,
  },

  progressBarContainer: {
    width: "100%",
    maxWidth: SCREEN_WIDTH * 0.85,
    marginBottom: SCREEN_HEIGHT * 0.04,
  },

  progressBarTrack: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },

  progressBarFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 2,
  },

  pomodoroDotsContainer: {
    flexDirection: "row",
    gap: SCREEN_WIDTH * 0.03,
    marginBottom: SCREEN_HEIGHT * 0.05,
  },

  pomodoroDot: {
    width: SCREEN_WIDTH * 0.02,
    height: SCREEN_WIDTH * 0.02,
    borderRadius: SCREEN_WIDTH * 0.01,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },

  pomodoroDotActive: {
    backgroundColor: colors.accent,
    width: SCREEN_WIDTH * 0.025,
    height: SCREEN_WIDTH * 0.025,
    borderRadius: SCREEN_WIDTH * 0.0125,
  },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: SCREEN_WIDTH * 0.05,
    marginBottom: SCREEN_HEIGHT * 0.05,
  },

  controlButton: {
    width: SCREEN_WIDTH * 0.14,
    height: SCREEN_WIDTH * 0.14,
    borderRadius: SCREEN_WIDTH * 0.07,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  controlIcon: {
    fontSize: SCREEN_WIDTH * 0.06,
    color: "rgba(255, 255, 255, 0.7)",
  },

  playButton: {
    width: SCREEN_WIDTH * 0.18,
    height: SCREEN_WIDTH * 0.18,
    borderRadius: SCREEN_WIDTH * 0.09,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },

  statsContainer: {
    flexDirection: "row",
    gap: SCREEN_WIDTH * 0.04,
    width: "100%",
    maxWidth: SCREEN_WIDTH * 0.85,
  },

  statBox: {
    flex: 1,
    padding: SCREEN_WIDTH * 0.04,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
  },

  statValue: {
    fontFamily: "ZenDots-Regular",
    fontSize: SCREEN_WIDTH * 0.045,
    color: "#FFFFFF",
    marginBottom: 4,
  },

  statLabel: {
    fontFamily: "ZenDots-Regular",
    fontSize: SCREEN_WIDTH * 0.022,
    color: "rgba(255, 255, 255, 0.4)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
