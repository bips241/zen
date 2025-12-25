/**
 * FrictionOverlay Screen - Breathing animation delay
 *
 * Shows when user tries to open a blocked app
 * Forces user to complete breathing exercise before proceeding
 */

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Text } from "../components/atoms";
import { colors, spacing } from "../theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CIRCLE_SIZE = SCREEN_WIDTH * 0.6;

interface FrictionOverlayProps {
  route?: {
    params?: {
      packageName?: string;
      appName?: string;
      delaySeconds?: number;
    };
  };
  navigation?: any;
}

export default function FrictionOverlay({
  route,
  navigation,
}: FrictionOverlayProps) {
  const delaySeconds = route?.params?.delaySeconds || 5;
  const appName = route?.params?.appName || "this app";

  const [countdown, setCountdown] = useState(delaySeconds);
  const [canProceed, setCanProceed] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Breathing animation loop
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    breathe.start();

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanProceed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      breathe.stop();
    };
  }, []);

  const handleGoBack = () => {
    // Take me out - go back to home
    if (navigation?.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleGrantTime = (minutes: number) => {
    // Grant temporary access for specified minutes
    console.log(`Granting ${minutes} minutes access`);
    // TODO: Implement temporary bypass in OverlayService
    if (navigation?.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleProceed = () => {
    if (canProceed && navigation?.canGoBack()) {
      navigation.goBack();
    }
  };

  const circleScale = breatheAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const circleOpacity = breatheAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Breathing Circle */}
        <View style={styles.circleContainer}>
          <Animated.View
            style={[
              styles.breathingCircle,
              {
                transform: [{ scale: circleScale }],
                opacity: circleOpacity,
              },
            ]}
          />
          <View style={styles.centerCircle}>
            {!canProceed ? (
              <>
                <Text style={styles.countdownText}>{countdown}</Text>
                <Text style={styles.instructionText}>Take a breath</Text>
              </>
            ) : (
              <>
                <Text style={styles.readyText}>✓</Text>
                <Text style={styles.instructionText}>Ready</Text>
              </>
            )}
          </View>
        </View>

        {/* App Name */}
        <Text style={styles.appNameText}>Opening {appName}</Text>

        {/* Breathing Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionTitle}>
            {countdown > 0 ? "Breathe in... breathe out..." : "You may proceed"}
          </Text>
          <Text style={styles.instructionSubtitle}>
            {countdown > 0
              ? "Use this moment to check if you really need to open this app"
              : "Are you sure you want to continue?"}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleGoBack}
          >
            <Text style={styles.cancelButtonText}>Take Me Out</Text>
          </TouchableOpacity>

          {canProceed && (
            <>
              <View style={styles.timeGrantContainer}>
                <TouchableOpacity
                  style={[styles.timeButton]}
                  onPress={() => handleGrantTime(5)}
                >
                  <Text style={styles.timeButtonText}>Grant 5 min</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.timeButton]}
                  onPress={() => handleGrantTime(10)}
                >
                  <Text style={styles.timeButtonText}>Grant 10 min</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={[styles.button, styles.proceedButton]}
                onPress={handleProceed}
              >
                <Text style={styles.proceedButtonText}>Continue Anyway</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    width: "100%",
  },

  circleContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xxl,
  },

  breathingCircle: {
    position: "absolute",
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: colors.accent,
  },

  centerCircle: {
    width: CIRCLE_SIZE * 0.6,
    height: CIRCLE_SIZE * 0.6,
    borderRadius: (CIRCLE_SIZE * 0.6) / 2,
    backgroundColor: colors.gray[900],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.accent,
  },

  countdownText: {
    fontFamily: "ZenDots-Regular",
    fontSize: 80,
    color: colors.white,
    marginBottom: spacing.sm,
  },

  readyText: {
    fontSize: 80,
    color: colors.accent,
    marginBottom: spacing.sm,
  },

  instructionText: {
    fontSize: 16,
    color: colors.gray[500],
  },

  appNameText: {
    fontFamily: "ZenDots-Regular",
    fontSize: 20,
    color: colors.white,
    marginBottom: spacing.xl,
    textAlign: "center",
  },

  instructionsCard: {
    backgroundColor: colors.gray[900],
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },

  instructionTitle: {
    fontSize: 18,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: "center",
  },

  instructionSubtitle: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: "center",
    lineHeight: 20,
  },

  buttonContainer: {
    flexDirection: "column",
    gap: spacing.md,
    width: "100%",
  },

  timeGrantContainer: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },

  button: {
    width: "100%",
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  timeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[800],
    borderWidth: 1,
    borderColor: colors.accent,
  },

  timeButtonText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: "600",
  },

  cancelButton: {
    backgroundColor: colors.gray[900],
    borderWidth: 1,
    borderColor: colors.gray[700],
  },

  cancelButtonText: {
    fontSize: 16,
    color: colors.white,
  },

  proceedButton: {
    backgroundColor: colors.accent,
  },

  proceedButtonText: {
    fontSize: 16,
    color: colors.black,
    fontWeight: "600",
  },
});
