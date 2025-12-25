/**
 * Stats Screen - Usage analytics and productivity insights
 * Translated from figma-dump for React Native
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { Text } from "../components/atoms";
import { colors } from "../theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface StatsScreenProps {
  navigation: any;
}

export default function StatsScreen({ navigation }: StatsScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const progressWidthAnim = useRef(new Animated.Value(0)).current;

  const weekData = [
    { day: "Mon", value: 85, hours: 6.8 },
    { day: "Tue", value: 92, hours: 7.4 },
    { day: "Wed", value: 78, hours: 6.2 },
    { day: "Thu", value: 95, hours: 7.6 },
    { day: "Fri", value: 88, hours: 7.0 },
    { day: "Sat", value: 70, hours: 5.6 },
    { day: "Sun", value: 65, hours: 5.2 },
  ];

  const stats = [
    { icon: "⏰", label: "Total Hours", value: "156h", change: "+12%" },
    { icon: "🎯", label: "Tasks Done", value: "47", change: "+8%" },
    { icon: "⚡", label: "Streak Days", value: "12", change: "+2" },
    { icon: "📈", label: "Avg. Focus", value: "82%", change: "+5%" },
  ];

  const maxValue = Math.max(...weekData.map((d) => d.value));

  useEffect(() => {
    const animations = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(progressWidthAnim, {
        toValue: 1,
        duration: 800,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // Width animation requires JS driver
      }),
    ]);
    
    animations.start();

    return () => {
      animations.stop();
      fadeAnim.setValue(0);
      slideUpAnim.setValue(30);
      progressWidthAnim.setValue(0);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.headerTitle}>Statistics</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Cards */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
          ]}
        >
          <Text style={styles.sectionTitle}>OVERVIEW</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.statCard,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        scale: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.9, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.statCardHeader}>
                  <View style={styles.statIconContainer}>
                    <Text style={styles.statIcon}>{stat.icon}</Text>
                  </View>
                  <Text style={styles.statChange}>{stat.change}</Text>
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Weekly Chart */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
          ]}
        >
          <Text style={styles.sectionTitle}>THIS WEEK</Text>
          <View style={styles.chartCard}>
            {/* Bar Chart */}
            <View style={styles.chart}>
              {weekData.map((day, index) => (
                <View key={day.day} style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      { height: `${(day.value / maxValue) * 100}%` },
                    ]}
                  >
                    <Text style={styles.barTooltip}>{day.hours}h</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Labels */}
            <View style={styles.chartLabels}>
              {weekData.map((day, index) => (
                <Animated.Text
                  key={day.day}
                  style={[
                    styles.chartLabel,
                    {
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [10, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {day.day}
                </Animated.Text>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Productivity Score */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
          ]}
        >
          <Text style={styles.sectionTitle}>PRODUCTIVITY SCORE</Text>
          <View style={styles.scoreCard}>
            <View style={styles.scoreMain}>
              <View>
                <Text style={styles.scoreValue}>82</Text>
                <Text style={styles.scoreSubtitle}>Out of 100</Text>
              </View>
              <View style={styles.scoreChange}>
                <Text style={styles.scoreChangeValue}>+5</Text>
                <Text style={styles.scoreChangeLabel}>From last week</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.scoreProgress}>
              <Animated.View
                style={[
                  styles.scoreProgressFill,
                  {
                    width: progressWidthAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "82%"],
                    }),
                  },
                ]}
              />
            </View>

            {/* Breakdown */}
            <View style={styles.breakdown}>
              <View style={styles.breakdownItem}>
                <View style={styles.breakdownDot} />
                <Text style={styles.breakdownLabel}>Focus Time</Text>
                <Text style={styles.breakdownValue}>92%</Text>
              </View>
              <View style={styles.breakdownItem}>
                <View
                  style={[
                    styles.breakdownDot,
                    { backgroundColor: "rgba(255, 255, 255, 0.5)" },
                  ]}
                />
                <Text style={styles.breakdownLabel}>Task Completion</Text>
                <Text style={styles.breakdownValue}>78%</Text>
              </View>
              <View style={styles.breakdownItem}>
                <View
                  style={[
                    styles.breakdownDot,
                    { backgroundColor: "rgba(255, 255, 255, 0.3)" },
                  ]}
                />
                <Text style={styles.breakdownLabel}>Consistency</Text>
                <Text style={styles.breakdownValue}>86%</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
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

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 24,
  },

  section: {
    marginBottom: 32,
  },

  sectionTitle: {
    fontFamily: "ZenDots-Regular",
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 16,
    letterSpacing: 1,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },

  statCard: {
    width: (SCREEN_WIDTH - 64) / 2,
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
  },

  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  statIcon: {
    fontSize: 16,
  },

  statChange: {
    fontFamily: "ZenDots-Regular",
    fontSize: 10,
    color: "#4ADE80",
  },

  statValue: {
    fontFamily: "ZenDots-Regular",
    fontSize: 24,
    color: "#FFFFFF",
    marginBottom: 4,
  },

  statLabel: {
    fontFamily: "ZenDots-Regular",
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.6)",
  },

  chartCard: {
    padding: 24,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
  },

  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 180,
    marginBottom: 24,
  },

  barContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  bar: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    position: "relative",
  },

  barTooltip: {
    position: "absolute",
    top: -24,
    left: 0,
    right: 0,
    fontFamily: "ZenDots-Regular",
    fontSize: 8,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },

  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  chartLabel: {
    flex: 1,
    fontFamily: "ZenDots-Regular",
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },

  scoreCard: {
    padding: 24,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
  },

  scoreMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  scoreValue: {
    fontFamily: "ZenDots-Regular",
    fontSize: 48,
    color: "#FFFFFF",
    marginBottom: 8,
  },

  scoreSubtitle: {
    fontFamily: "ZenDots-Regular",
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },

  scoreChange: {
    alignItems: "flex-end",
  },

  scoreChangeValue: {
    fontFamily: "ZenDots-Regular",
    fontSize: 24,
    color: "#4ADE80",
    marginBottom: 8,
  },

  scoreChangeLabel: {
    fontFamily: "ZenDots-Regular",
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.6)",
  },

  scoreProgress: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 24,
  },

  scoreProgressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },

  breakdown: {
    gap: 12,
  },

  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },

  breakdownLabel: {
    flex: 1,
    fontFamily: "ZenDots-Regular",
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },

  breakdownValue: {
    fontFamily: "ZenDots-Regular",
    fontSize: 12,
    color: "#FFFFFF",
  },
});
