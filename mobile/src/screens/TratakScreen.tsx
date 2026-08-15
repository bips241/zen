import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Video, ResizeMode } from "expo-av";
import { Text, Spacer } from "../components/atoms";
import { colors, spacing } from "../theme";
import { useNavigation } from "@react-navigation/native";
import { database, collections } from "../database";
import { Q } from "@nozbe/watermelondb";

const { width, height } = Dimensions.get("window");
const CANDLE_VIDEO = require("../assets/candle-flame.mp4");

type SessionPhase = "ready" | "focusing" | "paused" | "complete";
type SessionMode = "meditation" | "studying";

export default function TratakScreen() {
  const [mode, setMode] = useState<SessionMode>("meditation");
  const [phase, setPhase] = useState<SessionPhase>("ready");
  const [seconds, setSeconds] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [goalMinutes, setGoalMinutes] = useState(10); // Default for meditation
  const navigation = useNavigation();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const instructionFade = useRef(new Animated.Value(1)).current;

  // Load user preferences on mount
  useEffect(() => {
    loadUserPreferences();

    // Fade in on mount
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Gentle pulse animation for candle
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const studyTimeSetting = await collections.settings
        .query(Q.where("key", "tratak_study_minutes"))
        .fetch();

      if (studyTimeSetting.length > 0) {
        const savedMinutes = studyTimeSetting[0].value;
        setCustomMinutes(savedMinutes);
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    }
  };

  const saveStudyTimePref = async (minutes: number) => {
    try {
      const existing = await collections.settings
        .query(Q.where("key", "tratak_study_minutes"))
        .fetch();

      await database.write(async () => {
        if (existing.length > 0) {
          await existing[0].update((record: any) => {
            record.valueRaw = JSON.stringify(minutes);
          });
        } else {
          await collections.settings.create((record: any) => {
            record.key = "tratak_study_minutes";
            record.valueRaw = JSON.stringify(minutes);
          });
        }
      });
    } catch (error) {
      console.error("Failed to save preference:", error);
    }
  };

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (phase === "focusing") {
      timer = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [phase]);

  // Check for goal completion
  useEffect(() => {
    if (phase === "focusing" && seconds >= goalMinutes * 60) {
      setPhase("complete");
      setTotalSessions((prev) => prev + 1);
    }
  }, [seconds, goalMinutes, phase]);

  // Hide instructions after 5 seconds when focusing
  useEffect(() => {
    if (phase === "focusing" && showInstructions) {
      const timeout = setTimeout(() => {
        Animated.timing(instructionFade, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start(() => setShowInstructions(false));
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [phase, showInstructions]);

  const handleModeSelect = (selectedMode: SessionMode) => {
    setMode(selectedMode);
    if (selectedMode === "meditation") {
      setGoalMinutes(10);
    } else {
      setGoalMinutes(customMinutes);
    }
  };

  const handleStart = () => {
    setPhase("focusing");
    setSeconds(0);
    setShowInstructions(true);
    instructionFade.setValue(1);
  };

  const handleSetCustomTime = () => {
    setShowTimePicker(true);
  };

  const handleSaveCustomTime = async () => {
    if (customMinutes < 1) {
      setCustomMinutes(1);
    }
    setGoalMinutes(customMinutes);
    await saveStudyTimePref(customMinutes);
    setShowTimePicker(false);
  };

  const handlePause = () => {
    setPhase("paused");
  };

  const handleResume = () => {
    setPhase("focusing");
  };

  const handleReset = () => {
    setPhase("ready");
    setSeconds(0);
    setShowInstructions(true);
    instructionFade.setValue(1);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${String(remainingSecs).padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    return Math.min((seconds / (goalMinutes * 60)) * 100, 100);
  };

  const renderTimePicker = () => (
    <Modal
      visible={showTimePicker}
      transparent
      animationType="fade"
      onRequestClose={() => setShowTimePicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text variant="large" style={styles.modalTitle}>
            Set Study Time
          </Text>
          <Spacer size="md" />
          <Text variant="small" color={colors.gray[400]}>
            Choose your default study duration
          </Text>
          <Spacer size="xl" />

          <View style={styles.timeInputContainer}>
            <TextInput
              style={styles.timeInput}
              value={String(customMinutes)}
              onChangeText={(text) => {
                const num = parseInt(text) || 0;
                setCustomMinutes(num);
              }}
              keyboardType="number-pad"
              maxLength={3}
              placeholderTextColor={colors.gray[600]}
            />
            <Text
              variant="large"
              color={colors.white}
              style={styles.minutesLabel}
            >
              minutes
            </Text>
          </View>

          <View style={styles.quickSelectContainer}>
            <Text
              variant="small"
              color={colors.gray[500]}
              style={styles.quickSelectLabel}
            >
              Quick select:
            </Text>
            <View style={styles.quickSelectRow}>
              {[15, 25, 30, 45, 60, 90].map((mins) => (
                <TouchableOpacity
                  key={mins}
                  style={[
                    styles.quickSelectButton,
                    customMinutes === mins && styles.quickSelectButtonActive,
                  ]}
                  onPress={() => setCustomMinutes(mins)}
                >
                  <Text
                    variant="small"
                    color={
                      customMinutes === mins ? colors.black : colors.gray[400]
                    }
                  >
                    {mins}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Spacer size="xl" />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowTimePicker(false)}
            >
              <Text variant="body" color={colors.gray[400]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSaveCustomTime}
            >
              <Text variant="body" style={styles.modalSaveButtonText}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderTimePicker()}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text variant="body" color={colors.accent}>
            ← Back
          </Text>
        </TouchableOpacity>
        {totalSessions > 0 && (
          <View style={styles.sessionBadge}>
            <Text variant="small" color={colors.gray[400]}>
              {totalSessions} {totalSessions === 1 ? "session" : "sessions"}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Mode Selection */}
          {phase === "ready" && (
            <View style={styles.modeSelector}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === "meditation" && styles.modeButtonActive,
                ]}
                onPress={() => handleModeSelect("meditation")}
              >
                <Text
                  variant="body"
                  color={
                    mode === "meditation" ? colors.black : colors.gray[400]
                  }
                  style={styles.modeButtonText}
                >
                  🧘 Meditation
                </Text>
                <Text
                  variant="small"
                  color={
                    mode === "meditation" ? colors.black : colors.gray[600]
                  }
                >
                  10 min
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === "studying" && styles.modeButtonActive,
                ]}
                onPress={() => handleModeSelect("studying")}
              >
                <Text
                  variant="body"
                  color={mode === "studying" ? colors.black : colors.gray[400]}
                  style={styles.modeButtonText}
                >
                  📚 Study
                </Text>
                <TouchableOpacity
                  onPress={handleSetCustomTime}
                  style={styles.customTimeButton}
                >
                  <Text
                    variant="small"
                    color={
                      mode === "studying" ? colors.black : colors.gray[600]
                    }
                  >
                    {customMinutes} min ⚙️
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          )}

          {/* Title */}
          <Text variant="large" style={styles.title}>
            {mode === "meditation"
              ? "Tratak Meditation"
              : "Focus Study Session"}
          </Text>
          <Text
            variant="small"
            color={colors.gray[500]}
            style={styles.subtitle}
          >
            {mode === "meditation"
              ? "Ancient candle gazing practice"
              : "Deep focus with candle"}
          </Text>

          <Spacer size="lg" />

          {/* Candle Container */}
          <View style={styles.candleContainer}>
            <Animated.View
              style={[
                styles.candleWrapper,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Video
                source={CANDLE_VIDEO}
                style={styles.candleGif}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                isLooping
                isMuted
              />
            </Animated.View>
          </View>

          <Spacer size="lg" />

          {/* Timer Display */}
          <View style={styles.timerContainer}>
            <Text variant="huge" style={styles.timerText}>
              {formatTime(seconds)}
            </Text>
            <Text variant="small" color={colors.gray[500]}>
              {phase === "complete"
                ? "Session Complete"
                : `${Math.floor(
                    getProgressPercentage()
                  )}% to ${goalMinutes} min`}
            </Text>
          </View>

          {/* Progress Bar */}
          {phase !== "ready" && (
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${getProgressPercentage()}%` },
                ]}
              />
            </View>
          )}

          <Spacer size="lg" />

          {/* Instructions */}
          {showInstructions && phase !== "complete" && (
            <Animated.View
              style={[
                styles.instructionsCard,
                { opacity: phase === "focusing" ? instructionFade : 1 },
              ]}
            >
              {mode === "meditation" ? (
                <>
                  <Text
                    variant="small"
                    color={colors.gray[400]}
                    style={styles.instructionText}
                  >
                    {phase === "ready" && "• Sit comfortably in a dim room"}
                  </Text>
                  <Text
                    variant="small"
                    color={colors.gray[400]}
                    style={styles.instructionText}
                  >
                    • Gaze softly at the flame's center
                  </Text>
                  <Text
                    variant="small"
                    color={colors.gray[400]}
                    style={styles.instructionText}
                  >
                    • Blink naturally when needed
                  </Text>
                  <Text
                    variant="small"
                    color={colors.gray[400]}
                    style={styles.instructionText}
                  >
                    • Let thoughts pass without judgment
                  </Text>
                </>
              ) : (
                <>
                  <Text
                    variant="small"
                    color={colors.gray[400]}
                    style={styles.instructionText}
                  >
                    • Use the flame as an anchor point
                  </Text>
                  <Text
                    variant="small"
                    color={colors.gray[400]}
                    style={styles.instructionText}
                  >
                    • Return your gaze when distracted
                  </Text>
                  <Text
                    variant="small"
                    color={colors.gray[400]}
                    style={styles.instructionText}
                  >
                    • Maintain deep focus on your work
                  </Text>
                </>
              )}
            </Animated.View>
          )}

          {/* Complete Message */}
          {phase === "complete" && (
            <View style={styles.completeCard}>
              <Text
                variant="large"
                color={colors.accent}
                style={styles.completeTitle}
              >
                {mode === "meditation" ? "🕉️ Well Done" : "🎯 Great Work"}
              </Text>
              <Spacer size="sm" />
              <Text
                variant="body"
                color={colors.gray[300]}
                style={styles.completeText}
              >
                You completed a {goalMinutes}-minute{" "}
                {mode === "meditation" ? "meditation" : "study"} session
              </Text>
              <Text
                variant="small"
                color={colors.gray[500]}
                style={styles.completeSubtext}
              >
                Your focus muscle is getting stronger
              </Text>
            </View>
          )}

          <Spacer size="xxl" />

          {/* Controls */}
          <View style={styles.controls}>
            {phase === "ready" && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleStart}
              >
                <Text variant="body" style={styles.primaryButtonText}>
                  Begin Session
                </Text>
              </TouchableOpacity>
            )}

            {phase === "focusing" && (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handlePause}
                >
                  <Text variant="body" color={colors.gray[300]}>
                    Pause
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.textButton}
                  onPress={handleReset}
                >
                  <Text variant="small" color={colors.gray[600]}>
                    Reset
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {phase === "paused" && (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleResume}
                >
                  <Text variant="body" style={styles.primaryButtonText}>
                    Resume
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleReset}
                >
                  <Text variant="body" color={colors.gray[300]}>
                    Reset
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {phase === "complete" && (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleStart}
                >
                  <Text variant="body" style={styles.primaryButtonText}>
                    Start New Session
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.textButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text variant="small" color={colors.gray[600]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  sessionBadge: {
    backgroundColor: colors.gray[900],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  modeSelector: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
    width: "100%",
  },
  modeButton: {
    flex: 1,
    backgroundColor: colors.gray[900],
    borderWidth: 1,
    borderColor: colors.gray[800],
    borderRadius: 12,
    padding: spacing.md,
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  modeButtonText: {
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  customTimeButton: {
    marginTop: spacing.xs,
  },
  title: {
    fontSize: 28,
    color: colors.white,
    fontWeight: "300",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
  candleContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: width * 0.85,
    height: width * 0.85,
    maxWidth: 400,
    maxHeight: 400,
  },
  candleWrapper: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  candleGif: {
    width: "100%",
    height: "100%",
  },
  timerContainer: {
    alignItems: "center",
  },
  timerText: {
    fontSize: 56,
    color: colors.white,
    fontWeight: "200",
    letterSpacing: 4,
    fontVariant: ["tabular-nums"],
  },
  progressBarContainer: {
    width: "100%",
    height: 2,
    backgroundColor: colors.gray[900],
    borderRadius: 1,
    overflow: "hidden",
    marginTop: spacing.md,
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.accent,
  },
  instructionsCard: {
    backgroundColor: colors.gray[900],
    borderWidth: 1,
    borderColor: colors.gray[800],
    borderRadius: 12,
    padding: spacing.md,
    width: "100%",
  },
  instructionText: {
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  completeCard: {
    alignItems: "center",
    backgroundColor: colors.gray[900],
    borderWidth: 1,
    borderColor: colors.accent + "40",
    borderRadius: 16,
    padding: spacing.xl,
    width: "100%",
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: "400",
  },
  completeText: {
    textAlign: "center",
    lineHeight: 22,
  },
  completeSubtext: {
    marginTop: spacing.xs,
    textAlign: "center",
    fontStyle: "italic",
  },
  controls: {
    width: "100%",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 999,
    minWidth: 160,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.black,
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.gray[700],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 999,
    minWidth: 120,
    alignItems: "center",
  },
  textButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.gray[900],
    borderWidth: 1,
    borderColor: colors.gray[800],
    borderRadius: 16,
    padding: spacing.xl,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    color: colors.white,
    fontWeight: "400",
    textAlign: "center",
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  timeInput: {
    backgroundColor: colors.black,
    borderWidth: 1,
    borderColor: colors.gray[700],
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 32,
    color: colors.white,
    fontWeight: "300",
    textAlign: "center",
    minWidth: 80,
  },
  minutesLabel: {
    fontSize: 18,
    fontWeight: "300",
  },
  quickSelectContainer: {
    marginTop: spacing.lg,
  },
  quickSelectLabel: {
    marginBottom: spacing.sm,
  },
  quickSelectRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  quickSelectButton: {
    backgroundColor: colors.black,
    borderWidth: 1,
    borderColor: colors.gray[700],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 50,
    alignItems: "center",
  },
  quickSelectButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  modalButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.gray[700],
    borderRadius: 999,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  modalSaveButtonText: {
    color: colors.black,
    fontWeight: "600",
  },
});
