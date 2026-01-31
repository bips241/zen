import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "../store";
import LottieView from "lottie-react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Create animated version of LottieView
const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

interface Tree {
  id: string;
  size: number;
  x: number;
  y: number;
  type: "small" | "medium" | "large";
}

export default function ForestFocusScreen() {
  const navigation = useNavigation();
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [currentTreeGrowth, setCurrentTreeGrowth] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const growthAnim = useRef(new Animated.Value(0)).current;
  const lottieProgressAnim = useRef(new Animated.Value(0)).current;

  // Lottie animation ref
  const lottieRef = useRef<LottieView>(null);

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
        delay: 400,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleSessionComplete = useCallback(async () => {
    setIsRunning(false);

    // Update global productivity tracker
    const minutes = Math.floor(initialTime / 60);
    const dayRefreshTime = useStore.getState().preferences.dayRefreshTime;
    await useStore.getState().addFocusMinutes(minutes, dayRefreshTime);

    // Add completed tree to forest
    const treeType: Tree["type"] =
      initialTime >= 90 * 60
        ? "large"
        : initialTime >= 45 * 60
        ? "medium"
        : "small";

    const newTree: Tree = {
      id: Date.now().toString(),
      size: treeType === "large" ? 1 : treeType === "medium" ? 0.75 : 0.5,
      x: Math.random() * 60 + 20,
      y: Math.random() * 40 + 30,
      type: treeType,
    };

    setTrees((prevTrees) => [...prevTrees, newTree]);
    setCurrentTreeGrowth(0);
    growthAnim.setValue(0);
  }, [initialTime, growthAnim]);

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
  }, [isRunning, timeLeft, handleSessionComplete]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const progress = ((initialTime - timeLeft) / initialTime) * 100;
      setCurrentTreeGrowth(progress);

      // Animate growth scale
      Animated.timing(growthAnim, {
        toValue: progress / 100,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      // Animate Lottie progress
      Animated.timing(lottieProgressAnim, {
        toValue: progress / 100,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
  }, [isRunning, timeLeft, initialTime, growthAnim, lottieProgressAnim]);

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
    if (!hasStarted) {
      // First time starting - set the time
      const newTime = selectedMinutes * 60;
      setTimeLeft(newTime);
      setInitialTime(newTime);
      setHasStarted(true);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setHasStarted(false);
    setTimeLeft(selectedMinutes * 60);
    setInitialTime(selectedMinutes * 60);
    setCurrentTreeGrowth(0);
    growthAnim.setValue(0);
    lottieProgressAnim.setValue(0);

    // Reset Lottie animation
    if (lottieRef.current) {
      lottieRef.current.reset();
    }
  };

  const timeOptions = [5, 10, 15, 25, 30, 45, 60, 90];

  const progressRotation = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View>
          <Text style={styles.headerTitle}>Forest Focus</Text>
          <Text style={styles.headerSubtitle}>Grow your focus forest</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Timer Display (when started) */}
      {hasStarted && (
        <Animated.View style={[styles.timerHeader, { opacity: fadeAnim }]}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          <Text style={styles.timerSubtext}>
            {isRunning ? "Growing..." : "Paused"}
          </Text>
        </Animated.View>
      )}

      {/* Time Selection (before start) */}
      {!hasStarted && (
        <Animated.View style={[styles.timeSelection, { opacity: fadeAnim }]}>
          <Text style={styles.selectionTitle}>Choose Focus Time</Text>
          <View style={styles.timeOptions}>
            {timeOptions.map((minutes) => (
              <TouchableOpacity
                key={minutes}
                onPress={() => setSelectedMinutes(minutes)}
                style={[
                  styles.timeOption,
                  selectedMinutes === minutes && styles.timeOptionActive,
                ]}
              >
                <Text
                  style={[
                    styles.timeOptionText,
                    selectedMinutes === minutes && styles.timeOptionTextActive,
                  ]}
                >
                  {minutes}
                </Text>
                <Text
                  style={[
                    styles.timeOptionLabel,
                    selectedMinutes === minutes && styles.timeOptionLabelActive,
                  ]}
                >
                  min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Main Content Area - Forest Canvas */}
      <View style={styles.mainContent}>
        <View style={styles.forestCanvas}>
          <Animated.View style={[styles.forestContent, { opacity: fadeAnim }]}>
            {/* Ground line */}
            {/* <View style={styles.groundLine} /> */}

            {/* Existing trees */}
            {trees.map((tree) => (
              <Animated.View
                key={tree.id}
                style={[
                  styles.treeContainer,
                  {
                    left: `${tree.x}%`,
                    bottom: `${tree.y}%`,
                    transform: [{ scale: tree.size }],
                    opacity: fadeAnim,
                  },
                ]}
              >
                <LottieView
                  source={require("../assets/plant.lottie")}
                  style={styles.completedTreeAnimation}
                  autoPlay={false}
                  loop={false}
                  progress={1}
                />
              </Animated.View>
            ))}

            {/* Growing tree (current session) */}
            {hasStarted && (
              <Animated.View
                style={[
                  styles.growingTreeContainer,
                  {
                    transform: [
                      {
                        scale: growthAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <AnimatedLottieView
                  ref={lottieRef}
                  source={require("../assets/plant.lottie")}
                  style={styles.lottieAnimation}
                  autoPlay={false}
                  loop={false}
                  speed={1}
                  progress={lottieProgressAnim}
                />
                <Text style={styles.growthPercentage}>
                  {Math.round(currentTreeGrowth)}%
                </Text>
              </Animated.View>
            )}

            {/* Empty state */}
            {trees.length === 0 && !hasStarted && (
              <Animated.View
                style={[
                  styles.emptyState,
                  {
                    opacity: fadeAnim,
                  },
                ]}
              >
                <Text style={styles.emptyText}>Your forest awaits</Text>
                <Text style={styles.emptySubtext}>
                  Select a time and start growing
                </Text>
              </Animated.View>
            )}
          </Animated.View>
        </View>

        {/* Info/Warning Messages */}
        <View style={styles.messageContainer}>
          {!hasStarted && (
            <Animated.View style={{ opacity: fadeAnim }}>
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                  🌱 Watch your plant grow from seed to tree
                </Text>
              </View>
            </Animated.View>
          )}

          {hasStarted && isRunning && (
            <Animated.View style={{ opacity: fadeAnim }}>
              <View style={styles.warningCard}>
                <Text style={styles.warningText}>
                  ⚠️ If you exit now, your tree will die
                </Text>
              </View>
            </Animated.View>
          )}
        </View>
      </View>

      {/* Bottom Controls */}
      <Animated.View style={[styles.controlsContainer, { opacity: fadeAnim }]}>
        <View style={styles.controlButtons}>
          {/* Left button - visible only when started */}
          <View style={styles.controlButtonWrapper}>
            {hasStarted ? (
              <TouchableOpacity
                onPress={handleReset}
                style={styles.controlButton}
                activeOpacity={0.8}
              >
                <Text style={styles.controlIcon}>⟲</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.controlButtonPlaceholder} />
            )}
          </View>

          {/* Center - Play/Pause button */}
          <TouchableOpacity
            onPress={handlePlayPause}
            style={styles.playButton}
            activeOpacity={0.9}
          >
            <Text style={styles.playIcon}>{isRunning ? "❚❚" : "▶"}</Text>
          </TouchableOpacity>

          {/* Right button - visible only when started */}
          <View style={styles.controlButtonWrapper}>
            {hasStarted ? (
              <TouchableOpacity
                onPress={handleReset}
                style={styles.controlButton}
                activeOpacity={0.8}
              >
                <Text style={styles.controlIcon}>✕</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.controlButtonPlaceholder} />
            )}
          </View>
        </View>

        {/* Stats Card */}
        {hasStarted && (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{trees.length}</Text>
              <Text style={styles.statLabel}>Trees</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {trees.filter((t) => t.type === "large").length}
              </Text>
              <Text style={styles.statLabel}>Deep Focus</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{trees.length * 25}</Text>
              <Text style={styles.statLabel}>Total Min</Text>
            </View>
          </View>
        )}
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
    paddingTop: SCREEN_HEIGHT > 700 ? 48 : 40,
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
  timerHeader: {
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  timerText: {
    fontSize: 48,
    color: "#FFFFFF",
    fontWeight: "300",
  },
  timerSubtext: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.4)",
    marginTop: 4,
  },
  timeSelection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  selectionTitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 16,
    textAlign: "center",
  },
  timeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  timeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    minWidth: 70,
    alignItems: "center",
  },
  timeOptionActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  timeOptionText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "400",
  },
  timeOptionTextActive: {
    color: "#000000",
    fontWeight: "500",
  },
  timeOptionLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
  },
  timeOptionLabelActive: {
    color: "rgba(0, 0, 0, 0.6)",
  },
  mainContent: {
    flex: 1,
    position: "relative",
  },
  forestCanvas: {
    flex: 1,
    position: "relative",
  },
  forestContent: {
    flex: 1,
    position: "relative",
  },
  groundLine: {
    position: "absolute",
    bottom: "20%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  treeContainer: {
    position: "absolute",
  },
  treeEmoji: {
    fontSize: 48,
  },
  growingTreeContainer: {
    position: "absolute",
    left: "50%",
    bottom: "6%",
    marginLeft: -225,
    alignItems: "center",
    width: 450,
    height: 450,
  },
  lottieAnimation: {
    width: 450,
    height: 450,
  },
  completedTreeAnimation: {
    width: 80,
    height: 80,
  },
  growthPercentage: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 8,
    fontWeight: "500",
  },
  emptyState: {
    position: "absolute",
    top: "35%",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.4)",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.3)",
  },
  messageContainer: {
    position: "absolute",
    bottom: SCREEN_HEIGHT > 700 ? 24 : 16,
    left: 24,
    right: 24,
  },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  infoText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  warningCard: {
    backgroundColor: "rgba(255, 170, 0, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 170, 0, 0.3)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  warningText: {
    fontSize: 13,
    color: "rgba(255, 170, 0, 0.9)",
    textAlign: "center",
  },
  controlsContainer: {
    paddingHorizontal: 24,
    paddingBottom: SCREEN_HEIGHT > 700 ? 32 : 20,
    paddingTop: 16,
    backgroundColor: "transparent",
  },
  controlButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  controlButtonWrapper: {
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  controlButtonPlaceholder: {
    width: 64,
    height: 64,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  controlIcon: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "400",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playIcon: {
    fontSize: 32,
    color: "#000000",
    fontWeight: "500",
  },
  statsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
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
});
