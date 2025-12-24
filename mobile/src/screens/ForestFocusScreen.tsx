import React, { useState, useEffect, useRef } from "react";
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Tree {
  id: string;
  size: number;
  x: number;
  y: number;
  type: "small" | "medium" | "large";
}

export default function ForestFocusScreen() {
  const navigation = useNavigation();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [currentTreeGrowth, setCurrentTreeGrowth] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const growthAnim = useRef(new Animated.Value(0)).current;

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
    if (isRunning && timeLeft > 0) {
      const progress = ((initialTime - timeLeft) / initialTime) * 100;
      setCurrentTreeGrowth(progress);
      
      // Animate tree growth
      Animated.timing(growthAnim, {
        toValue: progress / 100,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [isRunning, timeLeft, initialTime]);

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

    // Add completed tree to forest
    const treeType: Tree["type"] =
      initialTime >= 90 * 60 ? "large" : initialTime >= 45 * 60 ? "medium" : "small";

    const newTree: Tree = {
      id: Date.now().toString(),
      size: treeType === "large" ? 1 : treeType === "medium" ? 0.75 : 0.5,
      x: Math.random() * 60 + 20,
      y: Math.random() * 40 + 30,
      type: treeType,
    };

    setTrees([...trees, newTree]);
    setCurrentTreeGrowth(0);
    growthAnim.setValue(0);
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
    setTimeLeft(initialTime);
    setCurrentTreeGrowth(0);
    growthAnim.setValue(0);
  };

  const progressRotation = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0deg", "360deg"],
  });

  // Plant growth stages based on growth percentage
  const getPlantStage = (growth: number) => {
    if (growth < 20) return "seed"; // 🌱
    if (growth < 40) return "sprout"; // 🌿
    if (growth < 60) return "sapling"; // 🌳
    if (growth < 80) return "tree"; // 🌲
    return "full-tree"; // 🌴
  };

  const getPlantEmoji = (growth: number) => {
    const stage = getPlantStage(growth);
    switch (stage) {
      case "seed":
        return "🌱";
      case "sprout":
        return "🌿";
      case "sapling":
        return "🌳";
      case "tree":
        return "🌲";
      case "full-tree":
        return "🌴";
    }
  };

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

      {/* Forest Canvas */}
      <View style={styles.forestCanvas}>
        <Animated.View style={[styles.forestContent, { opacity: fadeAnim }]}>
          {/* Ground line */}
          <View style={styles.groundLine} />

          {/* Existing trees */}
          {trees.map((tree, index) => (
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
              <Text style={styles.treeEmoji}>🌲</Text>
            </Animated.View>
          ))}

          {/* Growing tree (current session) */}
          {isRunning && currentTreeGrowth > 0 && (
            <Animated.View
              style={[
                styles.growingTreeContainer,
                {
                  transform: [{ scale: growthAnim }],
                  opacity: growthAnim,
                },
              ]}
            >
              <Text style={styles.growingTreeEmoji}>
                {getPlantEmoji(currentTreeGrowth)}
              </Text>
              <Text style={styles.growthPercentage}>
                {Math.round(currentTreeGrowth)}%
              </Text>
            </Animated.View>
          )}

          {/* Empty state */}
          {trees.length === 0 && !isRunning && (
            <Animated.View
              style={[
                styles.emptyState,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <Text style={styles.emptyText}>Your forest is empty</Text>
              <Text style={styles.emptySubtext}>
                Complete focus sessions to grow trees
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Timer Overlay */}
        <Animated.View
          style={[
            styles.timerOverlay,
            {
              transform: [{ scale: scaleAnim }],
              opacity: scaleAnim,
            },
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
              <Text style={styles.timerLabel}>
                {isRunning ? "Stay focused" : "Ready to grow"}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Controls */}
      <Animated.View style={[styles.controls, { opacity: fadeAnim }]}>
        <View style={styles.controlButtons}>
          <TouchableOpacity
            onPress={handleReset}
            style={styles.controlButton}
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
        </View>

        {/* Stats */}
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
      </Animated.View>

      {/* Warning message */}
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
              ⚠️ If you exit now, your tree will die
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
    bottom: 150,
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
    bottom: 150,
    marginLeft: -40,
    alignItems: "center",
  },
  growingTreeEmoji: {
    fontSize: 80,
  },
  growthPercentage: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 8,
  },
  emptyState: {
    position: "absolute",
    top: "40%",
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
  timerOverlay: {
    position: "absolute",
    top: "35%",
    left: "50%",
    marginLeft: -96,
  },
  timerCircle: {
    width: 192,
    height: 192,
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    position: "absolute",
    width: 176,
    height: 176,
  },
  progressBackground: {
    position: "absolute",
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: 8,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  progressRing: {
    position: "absolute",
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: 8,
    borderColor: "transparent",
    borderTopColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
  },
  timerDisplay: {
    alignItems: "center",
  },
  timerText: {
    fontSize: 36,
    color: "#FFFFFF",
    fontWeight: "300",
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.4)",
  },
  controls: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  controlButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 16,
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
    color: "rgba(255, 255, 255, 0.6)",
  },
});
