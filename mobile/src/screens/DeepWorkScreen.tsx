import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function DeepWorkScreen() {
  const navigation = useNavigation();
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes default
  const [initialTime, setInitialTime] = useState(90 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);

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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    const progress = ((initialTime - timeLeft) / initialTime) * 100;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, initialTime]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    setCompletedSessions((prev) => prev + 1);
    setTotalMinutes((prev) => prev + Math.floor(initialTime / 60));
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
  };

  const adjustTime = (delta: number) => {
    if (!isRunning) {
      const newTime = Math.max(
        60 * 60,
        Math.min(240 * 60, initialTime + delta * 60)
      );
      setInitialTime(newTime);
      setTimeLeft(newTime);
    }
  };

  const setPreset = (minutes: number) => {
    if (!isRunning) {
      const seconds = minutes * 60;
      setInitialTime(seconds);
      setTimeLeft(seconds);
    }
  };

  const progress = ((initialTime - timeLeft) / initialTime) * 100;
  const hoursRemaining = Math.floor(timeLeft / 3600);
  const minutesRemaining = Math.floor((timeLeft % 3600) / 60);

  const progressRotation = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0deg", "360deg"],
  });

  const presets = [
    { label: "90 min", value: 90 },
    { label: "120 min", value: 120 },
    { label: "180 min", value: 180 },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View>
          <Text style={styles.headerTitle}>Deep Work Mode</Text>
          <Text style={styles.headerSubtitle}>
            Extended focus sessions 90+ min
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <Animated.View
          style={[
            styles.infoCard,
            { opacity: fadeAnim, transform: [{ scale: fadeAnim }] },
          ]}
        >
          <Text style={styles.infoText}>
            Deep work is the ability to focus without distraction on cognitively
            demanding tasks. Aim for 90+ minute sessions for maximum
            productivity.
          </Text>
        </Animated.View>

        {/* Circular Progress */}
        <Animated.View
          style={[
            styles.timerContainer,
            { transform: [{ scale: scaleAnim }], opacity: scaleAnim },
          ]}
        >
          <View style={styles.timerCircle}>
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
              <Text style={styles.timeRemaining}>
                {hoursRemaining > 0 && `${hoursRemaining}h `}
                {minutesRemaining}min remaining
              </Text>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>
                  {isRunning ? "DEEP FOCUS ACTIVE" : "READY TO BEGIN"}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Preset Durations */}
        {!isRunning && (
          <Animated.View
            style={[
              styles.presetsContainer,
              { opacity: fadeAnim, transform: [{ translateY: fadeAnim }] },
            ]}
          >
            {presets.map((preset) => (
              <TouchableOpacity
                key={preset.value}
                onPress={() => setPreset(preset.value)}
                style={[
                  styles.presetButton,
                  initialTime === preset.value * 60 && styles.presetButtonActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.presetText,
                    initialTime === preset.value * 60 &&
                      styles.presetTextActive,
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {/* Time Adjustment */}
        {!isRunning && (
          <Animated.View
            style={[
              styles.adjustmentContainer,
              { opacity: fadeAnim, transform: [{ scale: fadeAnim }] },
            ]}
          >
            <TouchableOpacity
              onPress={() => adjustTime(-15)}
              style={styles.adjustButton}
              activeOpacity={0.7}
            >
              <Text style={styles.adjustIcon}>−</Text>
            </TouchableOpacity>
            <Text style={styles.adjustLabel}>
              Custom: {Math.floor(initialTime / 60)} min
            </Text>
            <TouchableOpacity
              onPress={() => adjustTime(15)}
              style={styles.adjustButton}
              activeOpacity={0.7}
            >
              <Text style={styles.adjustIcon}>+</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Controls */}
        <Animated.View
          style={[
            styles.controls,
            { opacity: fadeAnim, transform: [{ scale: fadeAnim }] },
          ]}
        >
          <TouchableOpacity
            onPress={handleReset}
            style={styles.controlButton}
            activeOpacity={0.7}
          >
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

        {/* Stats */}
        <Animated.View style={[styles.statsCard, { opacity: fadeAnim }]}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalMinutes}</Text>
            <Text style={styles.statLabel}>Total Minutes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.floor(totalMinutes / 60)}h</Text>
            <Text style={styles.statLabel}>Deep Work</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Warning overlay */}
      {isRunning && (
        <Animated.View
          style={[
            styles.warningContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>
              🔒 All distractions blocked • Stay immersed
            </Text>
          </View>
        </Animated.View>
      )}
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
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "400",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 32,
    color: "#FFFFFF",
    lineHeight: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
  },
  infoText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    lineHeight: 18,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  timerCircle: {
    width: 280,
    height: 280,
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    position: "absolute",
    width: 260,
    height: 260,
  },
  progressBackground: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 16,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  progressRing: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 16,
    borderColor: "transparent",
    borderTopColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
  },
  timerDisplay: {
    alignItems: "center",
  },
  timerText: {
    fontSize: 60,
    color: "#FFFFFF",
    fontWeight: "300",
    marginBottom: 8,
    textShadowColor: "rgba(255, 255, 255, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  timeRemaining: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.5)",
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  statusText: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.4)",
    letterSpacing: 1,
  },
  presetsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  presetButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 24,
  },
  presetButtonActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  presetText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  presetTextActive: {
    color: "#000000",
    fontWeight: "500",
  },
  adjustmentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  adjustButton: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  adjustIcon: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "400",
  },
  adjustLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    minWidth: 120,
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  controlButton: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 28,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    fontSize: 32,
    color: "#000000",
  },
  statsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
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
  warningContainer: {
    position: "absolute",
    top: 100,
    left: 24,
    right: 24,
  },
  warningCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  warningText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
  },
});
