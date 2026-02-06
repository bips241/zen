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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../store";
import { useSystemInsets } from "../hooks/useSystemInsets";
import BottomNavBar from "../components/molecules/BottomNavBar";
import Svg, {
  Path,
  Defs,
  ClipPath,
  G,
  LinearGradient,
  Stop,
} from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// SVG Path data for each letter
const LETTER_PATHS = {
  F: "M246.5 0.5V43.3184H52.8086V106.011H221.487V148.829H52.8086V231.5H0.5V0.5H246.5Z",
  O: "M145.639 0.5C178.212 0.500022 203.207 10.2636 220.544 29.8525C237.876 49.2249 246.5 77.9176 246.5 115.842C246.5 153.977 237.876 182.879 220.546 202.462L220.544 202.465C203.209 221.84 178.625 231.5 146.868 231.5H99.6396C68.2085 231.5 43.7897 221.839 26.4561 202.465L26.4541 202.463V202.462C9.12396 182.879 0.500062 153.977 0.5 115.842C0.5 77.9176 9.12413 49.2249 26.4561 29.8525C43.7926 10.2636 68.7881 0.500024 101.361 0.5H145.639ZM42.9053 136.962C45.5684 155.207 51.8969 168.418 61.832 176.685C71.8787 185.044 86.1802 189.259 104.806 189.259H142.933C161.228 189.259 175.282 185.045 185.165 176.688L185.168 176.685C195.103 168.418 201.432 155.207 204.095 136.962H42.9053ZM104.067 42.7412C85.9377 42.7412 71.8809 46.9543 61.832 55.3154C51.8971 63.5818 45.5696 76.6883 42.9062 94.7207H204.094C201.43 76.6883 195.103 63.5818 185.168 55.3154C175.119 46.9543 161.062 42.7412 142.933 42.7412H104.067Z",
  C: "M123.5 0.5C56.5736 0.5 0.5 56.5736 0.5 123.5C0.5 190.426 56.5736 246.5 123.5 246.5C157.032 246.5 186.764 232.314 207.5 210.5L177.688 180.688C164.764 193.612 145.632 202.688 123.5 202.688C80.7817 202.688 44.3125 166.218 44.3125 123.5C44.3125 80.7817 80.7817 44.3125 123.5 44.3125C145.632 44.3125 164.764 53.3876 177.688 66.3125L207.5 36.5C186.764 14.686 157.032 0.5 123.5 0.5Z",
  U: "M52.8086 0.5V123.5C52.8086 162.406 84.0938 194.5 123 194.5C161.906 194.5 193.191 162.406 193.191 123.5V0.5H246.5V123.5C246.5 191.5 191.5 246.5 123.5 246.5C55.5 246.5 0.5 191.5 0.5 123.5V0.5H52.8086Z",
  S: "M232.841 0.5V42.7422L232.34 42.7412L73.9473 42.4238C65.6995 42.4239 59.3438 44.517 54.8125 48.6387L54.8027 48.6475C50.3069 52.5326 48.0011 58.9179 48.001 67.9375C48.001 76.9487 50.3024 83.4462 54.8027 87.5459L55.2324 87.9072C59.7329 91.5841 65.9518 93.4521 73.9482 93.4521H177.993C199.59 93.4522 216.394 99.2948 228.332 111.044H228.331C240.471 122.589 246.5 139.764 246.5 162.476C246.5 184.982 240.469 202.156 228.329 213.911C216.392 225.658 199.588 231.5 177.993 231.5H5.44043V189.258L5.94141 189.259L173.053 189.576L173.838 189.569C181.894 189.443 187.983 187.352 192.18 183.368C196.689 179.06 198.999 172.136 198.999 162.476C198.999 152.811 196.688 146.002 192.188 141.908L192.171 141.892C187.838 137.573 181.493 135.376 173.053 135.376H69.0068C47.4143 135.376 30.5186 129.747 18.3877 118.428L18.3809 118.422C6.43486 106.878 0.5 90.0209 0.5 67.9375C0.500077 45.8552 6.43454 29.1016 18.3838 17.7686C30.5145 6.23567 47.4117 0.50005 69.0068 0.5H232.841Z",
};

const SVG_WIDTH = 247;
const SVG_HEIGHT = 260;

// Coffee mug SVG path for break mode
const COFFEE_MUG_PATH =
  "M50 80 L50 200 Q50 220 70 220 L180 220 Q200 220 200 200 L200 80 M210 110 Q240 110 240 140 Q240 170 210 170";
const MUG_WIDTH = 250;
const MUG_HEIGHT = 250;

// Calculate responsive mug size based on available space
const MAX_MUG_SIZE = Math.min(SCREEN_WIDTH * 0.55, SCREEN_HEIGHT * 0.3);

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

// Calculate responsive letter size
const TOTAL_LETTERS = 5;
const HORIZONTAL_PADDING = 48;
const LETTER_GAP = 4;
const TOTAL_GAP = LETTER_GAP * (TOTAL_LETTERS - 1);
const LETTER_WIDTH =
  (SCREEN_WIDTH - HORIZONTAL_PADDING - TOTAL_GAP) / TOTAL_LETTERS;
const LETTER_HEIGHT = (LETTER_WIDTH * SVG_HEIGHT) / SVG_WIDTH;

export default function FocusTimerScreen() {
  const [activeTab, setActiveTab] = useState("focus");
  const navigation = useNavigation();
  const { navBarHeight } = useSystemInsets();
  const safeNavBarHeight = navBarHeight || 0;
  const TAB_BAR_HEIGHT = 60;
  const bottomSpacing = TAB_BAR_HEIGHT + safeNavBarHeight + 16;

  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const minutesCountedRef = useRef(0);

  const todayMinutes = useStore((state) => state.todayMinutes);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const fillAnim = useRef(new Animated.Value(0)).current;

  // Update active tab when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setActiveTab("focus");
    }, []),
  );

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

    // Reset and start continuous smooth wave animation
    waveAnim.setValue(0);
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 5000,
        easing: Easing.sin,
        useNativeDriver: false,
      }),
    ).start();
  }, []);

  // Track minutes
  useEffect(() => {
    if (isRunning && mode === "focus") {
      const elapsedSeconds = initialTime - timeLeft;
      const currentMinutes = Math.floor(elapsedSeconds / 60);

      if (currentMinutes > minutesCountedRef.current) {
        const newMinutesToAdd = currentMinutes - minutesCountedRef.current;
        const dayRefreshTime = useStore.getState().preferences.dayRefreshTime;
        useStore
          .getState()
          .addFocusMinutes(newMinutesToAdd, dayRefreshTime)
          .catch(console.error);
        minutesCountedRef.current = currentMinutes;
      }
    }
  }, [timeLeft, isRunning, mode, initialTime]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            setIsRunning(false);
            if (mode === "focus") {
              setSessions((s) => s + 1);
              minutesCountedRef.current = 0;
            }
            return 0;
          }
          return newValue;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePlayPause = () => setIsRunning(!isRunning);

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

  const fillPercentage = ((initialTime - timeLeft) / initialTime) * 100;

  // Smoothly animate fill percentage
  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: fillPercentage,
      duration: 1000,
      easing: Easing.inOut(Easing.back(1)),
      useNativeDriver: false,
    }).start();
  }, [fillPercentage]);

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
      <View style={[styles.content, { paddingBottom: bottomSpacing }]}>
        {/* Mode Selector */}
        <Animated.View style={[styles.modeSelector, { opacity: fadeAnim }]}>
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

        {/* Liquid Wave FOCUS Letters / Coffee Mug */}
        <Animated.View
          style={[
            styles.liquidContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View
            style={[
              styles.focusLettersRow,
              mode !== "focus" && { display: "none" },
            ]}
          >
            {["F", "O", "C", "U", "S"].map((letter, index) => {
              const letterAnim = useRef(new Animated.Value(0)).current;

              useEffect(() => {
                Animated.timing(letterAnim, {
                  toValue: 1,
                  duration: 600,
                  delay: index * 100,
                  easing: Easing.out(Easing.cubic),
                  useNativeDriver: true,
                }).start();
              }, []);

              // Calculate wave Y position (fill from bottom) - use animated value
              const animatedWaveY = fillAnim.interpolate({
                inputRange: [0, 100],
                outputRange: [SVG_HEIGHT, 0],
              });

              return (
                <Animated.View
                  key={letter + index}
                  style={[
                    styles.letterContainer,
                    {
                      opacity: letterAnim,
                      transform: [
                        {
                          translateY: letterAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Svg
                    width={LETTER_WIDTH}
                    height={LETTER_HEIGHT}
                    viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                  >
                    <Defs>
                      <ClipPath id={`letter-clip-${index}`}>
                        <Path
                          d={LETTER_PATHS[letter as keyof typeof LETTER_PATHS]}
                        />
                      </ClipPath>

                      <LinearGradient
                        id={`liquid-gradient-${index}`}
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                        <Stop
                          offset="50%"
                          stopColor="#CCCCCC"
                          stopOpacity="1"
                        />
                        <Stop
                          offset="100%"
                          stopColor="#888888"
                          stopOpacity="1"
                        />
                      </LinearGradient>

                      {/* Wave 1 Gradient - Dark gray */}
                      <LinearGradient
                        id={`wave1-gradient-${index}`}
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <Stop offset="0%" stopColor="#222222" stopOpacity="1" />
                        <Stop
                          offset="50%"
                          stopColor="#333333"
                          stopOpacity="1"
                        />
                        <Stop
                          offset="100%"
                          stopColor="#444444"
                          stopOpacity="1"
                        />
                      </LinearGradient>

                      {/* Wave 2 Gradient - Medium gray */}
                      <LinearGradient
                        id={`wave2-gradient-${index}`}
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <Stop offset="0%" stopColor="#555555" stopOpacity="1" />
                        <Stop
                          offset="50%"
                          stopColor="#666666"
                          stopOpacity="1"
                        />
                        <Stop
                          offset="100%"
                          stopColor="#777777"
                          stopOpacity="1"
                        />
                      </LinearGradient>

                      {/* Wave 3 Gradient - Light gray */}
                      <LinearGradient
                        id={`wave3-gradient-${index}`}
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <Stop offset="0%" stopColor="#999999" stopOpacity="1" />
                        <Stop
                          offset="50%"
                          stopColor="#AAAAAA"
                          stopOpacity="1"
                        />
                        <Stop
                          offset="100%"
                          stopColor="#BBBBBB"
                          stopOpacity="1"
                        />
                      </LinearGradient>
                    </Defs>

                    {/* Base letter outline */}
                    <Path
                      d={LETTER_PATHS[letter as keyof typeof LETTER_PATHS]}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.15)"
                      strokeWidth="3"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />

                    {/* Liquid waves clipped to letter */}
                    <G clipPath={`url(#letter-clip-${index})`}>
                      <AnimatedG y={animatedWaveY}>
                        {/* Wave Layer 1 - Back - Huge slow rolling wave */}
                        <AnimatedPath
                          d={waveAnim.interpolate({
                            inputRange: [0, 0.33, 0.67, 1],
                            outputRange: [
                              "M-100 20 Q-25 -30 0 20 T100 20 T200 20 T300 20 T400 20 L400 500 L-100 500 Z",
                              "M-100 20 Q-25 70 0 20 T100 20 T200 20 T300 20 T400 20 L400 500 L-100 500 Z",
                              "M-100 20 Q-25 -30 0 20 T100 20 T200 20 T300 20 T400 20 L400 500 L-100 500 Z",
                              "M-100 20 Q-25 70 0 20 T100 20 T200 20 T300 20 T400 20 L400 500 L-100 500 Z",
                            ],
                          })}
                          fill={`url(#wave1-gradient-${index})`}
                          opacity={0.5}
                        />

                        {/* Wave Layer 2 - Middle - Fast choppy wave */}
                        <AnimatedPath
                          d={waveAnim.interpolate({
                            inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                            outputRange: [
                              "M-100 10 Q-15.5 -35 25 10 T87.5 10 T150 10 T212.5 10 T275 10 T337.5 10 T400 10 L400 500 L-100 500 Z",
                              "M-100 10 Q-15.5 55 25 10 T87.5 10 T150 10 T212.5 10 T275 10 T337.5 10 T400 10 L400 500 L-100 500 Z",
                              "M-100 10 Q-15.5 -35 25 10 T87.5 10 T150 10 T212.5 10 T275 10 T337.5 10 T400 10 L400 500 L-100 500 Z",
                              "M-100 10 Q-15.5 55 25 10 T87.5 10 T150 10 T212.5 10 T275 10 T337.5 10 T400 10 L400 500 L-100 500 Z",
                              "M-100 10 Q-15.5 -35 25 10 T87.5 10 T150 10 T212.5 10 T275 10 T337.5 10 T400 10 L400 500 L-100 500 Z",
                              "M-100 10 Q-15.5 55 25 10 T87.5 10 T150 10 T212.5 10 T275 10 T337.5 10 T400 10 L400 500 L-100 500 Z",
                            ],
                          })}
                          fill={`url(#wave2-gradient-${index})`}
                          opacity={0.7}
                        />

                        {/* Wave Layer 3 - Front - Huge smooth flowing wave */}
                        <AnimatedPath
                          d={waveAnim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [
                              "M-100 0 Q-8 -45 50 0 T125 0 T200 0 T275 0 T350 0 T425 0 L425 500 L-100 500 Z",
                              "M-100 0 Q-8 60 50 0 T125 0 T200 0 T275 0 T350 0 T425 0 L425 500 L-100 500 Z",
                              "M-100 0 Q-8 -45 50 0 T125 0 T200 0 T275 0 T350 0 T425 0 L425 500 L-100 500 Z",
                            ],
                          })}
                          fill={`url(#wave3-gradient-${index})`}
                          opacity={0.9}
                        />
                      </AnimatedG>
                    </G>

                    {/* Top outline when filled */}
                    {fillPercentage > 0 && (
                      <Path
                        d={LETTER_PATHS[letter as keyof typeof LETTER_PATHS]}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    )}
                  </Svg>
                </Animated.View>
              );
            })}
          </View>
          <View
            style={[
              styles.coffeeMugContainer,
              mode !== "break" && { display: "none" },
            ]}
          >
            <Svg
              width={MAX_MUG_SIZE}
              height={MAX_MUG_SIZE}
              viewBox="0 0 250 250"
            >
              <Defs>
                <LinearGradient
                  id="mug-gradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                  <Stop offset="50%" stopColor="#CCCCCC" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#888888" stopOpacity="1" />
                </LinearGradient>

                {/* Smoke gradients that fade as they rise */}
                <LinearGradient
                  id="smoke-gradient-1"
                  x1="0%"
                  y1="100%"
                  x2="0%"
                  y2="0%"
                >
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </LinearGradient>
                <LinearGradient
                  id="smoke-gradient-2"
                  x1="0%"
                  y1="100%"
                  x2="0%"
                  y2="0%"
                >
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </LinearGradient>
                <LinearGradient
                  id="smoke-gradient-3"
                  x1="0%"
                  y1="100%"
                  x2="0%"
                  y2="0%"
                >
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </LinearGradient>
                <LinearGradient
                  id="smoke-gradient-4"
                  x1="0%"
                  y1="100%"
                  x2="0%"
                  y2="0%"
                >
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </LinearGradient>
                <LinearGradient
                  id="smoke-gradient-5"
                  x1="0%"
                  y1="100%"
                  x2="0%"
                  y2="0%"
                >
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </LinearGradient>
              </Defs>

              {/* Coffee Mug */}
              <Path
                d={COFFEE_MUG_PATH}
                fill="none"
                stroke="url(#mug-gradient)"
                strokeWidth="6"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Coffee liquid fill */}
              <Path
                d="M55 85 L55 195 Q55 215 70 215 L180 215 Q195 215 195 195 L195 85 Z"
                fill={`rgba(136, 136, 136, ${fillPercentage / 200})`}
              />

              {/* Animated Smoke Waves - only when running */}
              {isRunning && (
                <>
                  {/* Smoke layer 1 - Left wisp with fade */}
                  <AnimatedPath
                    d={waveAnim.interpolate({
                      inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                      outputRange: [
                        "M80 75 Q75 68 80 60 Q85 52 78 44 Q72 34 78 24 Q82 14 75 4",
                        "M80 75 Q85 68 80 60 Q75 52 82 44 Q88 34 82 24 Q78 14 85 4",
                        "M80 75 Q75 68 80 60 Q85 52 78 44 Q72 34 78 24 Q82 14 75 4",
                        "M80 75 Q85 68 80 60 Q75 52 82 44 Q88 34 82 24 Q78 14 85 4",
                        "M80 75 Q75 68 80 60 Q85 52 78 44 Q72 34 78 24 Q82 14 75 4",
                        "M80 75 Q85 68 80 60 Q75 52 82 44 Q88 34 82 24 Q78 14 85 4",
                      ],
                    })}
                    fill="none"
                    stroke="url(#smoke-gradient-1)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity={waveAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.4, 0.5, 0.4],
                    })}
                  />

                  {/* Smoke layer 2 - Left-center wisp */}
                  <AnimatedPath
                    d={waveAnim.interpolate({
                      inputRange: [0, 0.25, 0.5, 0.75, 1],
                      outputRange: [
                        "M105 75 Q102 65 108 55 Q114 43 105 33 Q98 22 106 12 Q110 4 100 -5",
                        "M105 75 Q108 65 102 55 Q96 43 105 33 Q112 22 104 12 Q100 4 110 -5",
                        "M105 75 Q102 65 108 55 Q114 43 105 33 Q98 22 106 12 Q110 4 100 -5",
                        "M105 75 Q108 65 102 55 Q96 43 105 33 Q112 22 104 12 Q100 4 110 -5",
                        "M105 75 Q102 65 108 55 Q114 43 105 33 Q98 22 106 12 Q110 4 100 -5",
                      ],
                    })}
                    fill="none"
                    stroke="url(#smoke-gradient-2)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity={waveAnim.interpolate({
                      inputRange: [0, 0.3, 0.7, 1],
                      outputRange: [0.3, 0.45, 0.35, 0.3],
                    })}
                  />

                  {/* Smoke layer 3 - Center wisp (brightest) */}
                  <AnimatedPath
                    d={waveAnim.interpolate({
                      inputRange: [0, 0.33, 0.67, 1],
                      outputRange: [
                        "M125 75 Q132 63 125 52 Q118 38 130 28 Q138 16 125 5 Q118 -5 128 -12",
                        "M125 75 Q118 63 125 52 Q132 38 120 28 Q112 16 125 5 Q132 -5 122 -12",
                        "M125 75 Q132 63 125 52 Q118 38 130 28 Q138 16 125 5 Q118 -5 128 -12",
                        "M125 75 Q118 63 125 52 Q132 38 120 28 Q112 16 125 5 Q132 -5 122 -12",
                      ],
                    })}
                    fill="none"
                    stroke="url(#smoke-gradient-3)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    opacity={waveAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.6, 0.7, 0.6],
                    })}
                  />

                  {/* Smoke layer 4 - Right-center wisp */}
                  <AnimatedPath
                    d={waveAnim.interpolate({
                      inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                      outputRange: [
                        "M145 75 Q150 66 142 56 Q136 44 148 34 Q154 22 145 12 Q140 2 150 -8",
                        "M145 75 Q140 66 148 56 Q154 44 142 34 Q136 22 145 12 Q150 2 140 -8",
                        "M145 75 Q150 66 142 56 Q136 44 148 34 Q154 22 145 12 Q140 2 150 -8",
                        "M145 75 Q140 66 148 56 Q154 44 142 34 Q136 22 145 12 Q150 2 140 -8",
                        "M145 75 Q150 66 142 56 Q136 44 148 34 Q154 22 145 12 Q140 2 150 -8",
                        "M145 75 Q140 66 148 56 Q154 44 142 34 Q136 22 145 12 Q150 2 140 -8",
                      ],
                    })}
                    fill="none"
                    stroke="url(#smoke-gradient-4)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity={waveAnim.interpolate({
                      inputRange: [0, 0.4, 0.8, 1],
                      outputRange: [0.35, 0.5, 0.4, 0.35],
                    })}
                  />

                  {/* Smoke layer 5 - Right wisp */}
                  <AnimatedPath
                    d={waveAnim.interpolate({
                      inputRange: [0, 0.25, 0.5, 0.75, 1],
                      outputRange: [
                        "M170 75 Q175 67 168 58 Q162 46 172 36 Q178 24 168 14 Q162 4 175 -5",
                        "M170 75 Q165 67 172 58 Q178 46 168 36 Q162 24 172 14 Q178 4 165 -5",
                        "M170 75 Q175 67 168 58 Q162 46 172 36 Q178 24 168 14 Q162 4 175 -5",
                        "M170 75 Q165 67 172 58 Q178 46 168 36 Q162 24 172 14 Q178 4 165 -5",
                        "M170 75 Q175 67 168 58 Q162 46 172 36 Q178 24 168 14 Q162 4 175 -5",
                      ],
                    })}
                    fill="none"
                    stroke="url(#smoke-gradient-5)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity={waveAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.4, 0.5, 0.4],
                    })}
                  />

                  {/* Subtle background wisps for atmosphere */}
                  <AnimatedPath
                    d={waveAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [
                        "M95 75 Q90 62 98 50 Q104 36 92 24 Q88 12 98 0",
                        "M95 75 Q100 62 92 50 Q86 36 98 24 Q102 12 92 0",
                        "M95 75 Q90 62 98 50 Q104 36 92 24 Q88 12 98 0",
                      ],
                    })}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity={waveAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.2, 0.3, 0.2],
                    })}
                  />
                  <AnimatedPath
                    d={waveAnim.interpolate({
                      inputRange: [0, 0.4, 0.8, 1],
                      outputRange: [
                        "M155 75 Q160 64 152 52 Q146 38 158 26 Q164 14 152 2",
                        "M155 75 Q150 64 158 52 Q164 38 152 26 Q146 14 158 2",
                        "M155 75 Q160 64 152 52 Q146 38 158 26 Q164 14 152 2",
                        "M155 75 Q150 64 158 52 Q164 38 152 26 Q146 14 158 2",
                      ],
                    })}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity={waveAnim.interpolate({
                      inputRange: [0, 0.3, 0.7, 1],
                      outputRange: [0.2, 0.3, 0.25, 0.2],
                    })}
                  />
                </>
              )}
            </Svg>
          </View>

          {/* Timer and Progress */}
          <Text style={styles.liquidTimerText}>{formatTime(timeLeft)}</Text>
          <View style={styles.progressContainer}>
            <Text
              style={[
                styles.progressText,
                {
                  color:
                    fillPercentage > 0 ? "#FFFFFF" : "rgba(255, 255, 255, 0.3)",
                },
              ]}
            >
              {Math.round(fillPercentage)}%
            </Text>
            <Text style={styles.progressLabel}>filled</Text>
          </View>
          <Text style={styles.liquidModeText}>
            {mode === "focus" ? "DEEP FOCUS MODE" : "RECHARGE MODE"}
          </Text>
        </Animated.View>

        {/* Time Adjustment */}
        <Animated.View
          style={[
            styles.adjustmentContainer,
            {
              opacity: !isRunning ? fadeAnim : 0,
            },
          ]}
          pointerEvents={!isRunning ? "auto" : "none"}
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

        {/* Controls */}
        <Animated.View style={[styles.controls, { opacity: fadeAnim }]}>
          <TouchableOpacity onPress={handleReset} style={styles.controlButton}>
            <Text style={styles.controlIcon}>⟲</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePlayPause}
            style={[
              styles.playButton,
              fillPercentage > 0 && styles.playButtonActive,
            ]}
            activeOpacity={0.9}
          >
            {isRunning ? (
              <Ionicons
                name="pause"
                size={32}
                color={fillPercentage > 0 ? "#000000" : "#FFFFFF"}
              />
            ) : (
              <Ionicons
                name="play"
                size={32}
                color={fillPercentage > 0 ? "#000000" : "#FFFFFF"}
                style={{ marginLeft: 3 }}
              />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Stats */}
      <Animated.View
        style={[
          styles.stats,
          { opacity: fadeAnim, paddingBottom: bottomSpacing },
        ]}
      >
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{sessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{todayMinutes}</Text>
            <Text style={styles.statLabel}>Minutes Today</Text>
          </View>
        </View>
      </Animated.View>
      {/* Bottom Navigation */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "home") (navigation as any).navigate("Home");
          else if (tab === "tasks") (navigation as any).navigate("Tasks");
          else if (tab === "stats") (navigation as any).navigate("Stats");
        }}
        themeColors={{
          textPrimary: "#FFFFFF",
          textTertiary: "rgba(255, 255, 255, 0.5)",
          navBackground: "rgba(4, 4, 4, 0.3)",
        }}
      />
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
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 16,
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
  liquidContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    maxHeight: SCREEN_HEIGHT * 0.45,
    minHeight: 200,
  },
  focusLettersRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: LETTER_GAP,
  },
  coffeeMugContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: MAX_MUG_SIZE,
    height: MAX_MUG_SIZE,
  },
  letterContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  liquidTimerText: {
    fontFamily: "ZenDots-Regular",
    fontSize: Math.min(56, SCREEN_WIDTH * 0.13),
    color: "#FFFFFF",
    marginTop: 12,
    letterSpacing: 6,
    textShadowColor: "rgba(255, 255, 255, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  progressText: {
    fontFamily: "ZenDots-Regular",
    fontSize: Math.min(32, SCREEN_WIDTH * 0.075),
    letterSpacing: 2,
  },
  progressLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.4)",
    marginTop: 8,
  },
  liquidModeText: {
    fontFamily: "ZenDots-Regular",
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 8,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  adjustmentContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    height: 48,
    justifyContent: "center",
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
    lineHeight: 24,
    textAlign: "center",
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  stats: {
    paddingHorizontal: 24,
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
