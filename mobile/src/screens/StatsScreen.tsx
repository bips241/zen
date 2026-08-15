/**
 * Stats Screen - Ultimate Digital Wellbeing Analytics
 *
 * Features:
 * - Animated bar charts for weekly trends
 * - Interactive heatmap for hourly patterns
 * - Progress rings for wellbeing score
 * - Pie chart for category breakdown
 * - Top apps ranking with visual bars
 * - Data-driven insights with actionable tips
 * - 100% real data from native Android modules
 * - Pure black & white OLED-optimized theme
 */

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  Text,
  BarChart,
  HeatmapChart,
  ProgressRing,
  PieChart,
} from "../components/atoms";
import { colors } from "../theme";
import { useSystemInsets } from "../hooks/useSystemInsets";
import { useFocusEffect } from "@react-navigation/native";
import BottomNavBar from "../components/molecules/BottomNavBar";
import { usage } from "../services/nativeBridge";
import type { AppUsageStats } from "../native-android/nativeModules";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// App category classification for wellbeing insights
const APP_CATEGORIES = {
  PRODUCTIVE: [
    "docs",
    "sheets",
    "slides",
    "notion",
    "obsidian",
    "calendar",
    "gmail",
    "outlook",
    "slack",
    "teams",
    "zoom",
    "meet",
    "github",
    "gitlab",
    "vscode",
    "termux",
    "kindle",
    "audible",
    "evernote",
  ],
  LEARNING: [
    "coursera",
    "udemy",
    "khan",
    "duolingo",
    "brilliant",
    "skillshare",
    "ted",
    "youtube",
    "podcast",
    "medium",
    "pocket",
    "wikipedia",
    "quora",
  ],
  SOCIAL: [
    "whatsapp",
    "telegram",
    "signal",
    "messenger",
    "instagram",
    "facebook",
    "twitter",
    "snapchat",
    "tiktok",
    "reddit",
    "discord",
    "wechat",
  ],
  ENTERTAINMENT: [
    "netflix",
    "prime",
    "hotstar",
    "hulu",
    "spotify",
    "apple.music",
    "youtube",
    "twitch",
    "gaming",
    "game",
    "play.games",
    "disney",
  ],
  SHOPPING: [
    "amazon",
    "flipkart",
    "myntra",
    "ajio",
    "swiggy",
    "zomato",
    "uber",
    "ola",
    "paytm",
    "phonepe",
    "gpay",
    "paypal",
  ],
};

interface WellbeingInsight {
  title: string;
  message: string;
  tip: string;
}

interface UsageBreakdown {
  productive: number;
  learning: number;
  social: number;
  entertainment: number;
  shopping: number;
  other: number;
}

interface HourlyData {
  hour: number;
  minutes: number;
}

interface DailyData {
  day: string;
  hours: number;
  date: Date;
}

interface CategoryData {
  label: string;
  value: number;
  percentage: number;
}

interface StatsScreenProps {
  navigation: any;
}

export default function StatsScreen({ navigation }: StatsScreenProps) {
  const [activeTab, setActiveTab] = useState("stats");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usageData, setUsageData] = useState<AppUsageStats[]>([]);
  const [totalScreenTime, setTotalScreenTime] = useState(0);
  const [wellbeingScore, setWellbeingScore] = useState(0);
  const [usageBreakdown, setUsageBreakdown] = useState<UsageBreakdown>({
    productive: 0,
    learning: 0,
    social: 0,
    entertainment: 0,
    shopping: 0,
    other: 0,
  });
  const [topApps, setTopApps] = useState<AppUsageStats[]>([]);
  const [insights, setInsights] = useState<WellbeingInsight[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [weeklyData, setWeeklyData] = useState<DailyData[]>([]);
  const [categoryChartData, setCategoryChartData] = useState<CategoryData[]>(
    [],
  );
  const [peakHour, setPeakHour] = useState<string>("");
  const [avgDailyScreenTime, setAvgDailyScreenTime] = useState(0);
  const [totalAppsUsed, setTotalAppsUsed] = useState(0);
  const [screenUnlocks, setScreenUnlocks] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(6); // 0=6 days ago, 6=today
  const [dailyHourlyData, setDailyHourlyData] = useState<HourlyData[][]>([]); // Hourly data for each day
  const [addictiveApps, setAddictiveApps] = useState<AppUsageStats[]>([]);

  const { navBarHeight } = useSystemInsets();
  const safeNavBarHeight = navBarHeight || 0;
  const TAB_BAR_HEIGHT = 60;
  const bottomSpacing = TAB_BAR_HEIGHT + safeNavBarHeight + 32; // Increased from 16 to 32

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  // Update active tab when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setActiveTab("stats");
      loadUsageData();
    }, []),
  );

  // Classify app into category
  const classifyApp = (packageName: string): keyof UsageBreakdown => {
    const lowerPackage = packageName.toLowerCase();

    for (const [category, keywords] of Object.entries(APP_CATEGORIES)) {
      if (keywords.some((keyword) => lowerPackage.includes(keyword))) {
        return category.toLowerCase() as keyof UsageBreakdown;
      }
    }

    return "other";
  };

  // Calculate wellbeing score (0-100)
  const calculateWellbeingScore = (
    breakdown: UsageBreakdown,
    totalTime: number,
  ): number => {
    if (totalTime === 0) return 100;

    const productiveWeight = 1.0;
    const learningWeight = 0.9;
    const socialWeight = 0.4;
    const entertainmentWeight = 0.2;
    const shoppingWeight = 0.3;
    const otherWeight = 0.5;

    const totalWeight =
      breakdown.productive * productiveWeight +
      breakdown.learning * learningWeight +
      breakdown.social * socialWeight +
      breakdown.entertainment * entertainmentWeight +
      breakdown.shopping * shoppingWeight +
      breakdown.other * otherWeight;

    const score = Math.min(100, Math.round((totalWeight / totalTime) * 100));

    // Penalty for excessive screen time (over 5 hours)
    const hoursUsed = totalTime / 60;
    if (hoursUsed > 5) {
      const penalty = Math.min(25, (hoursUsed - 5) * 3);
      return Math.max(0, score - penalty);
    }

    return score;
  };

  // Generate insights based on usage patterns
  const generateInsights = (
    breakdown: UsageBreakdown,
    totalTime: number,
    topApps: AppUsageStats[],
    score: number,
    hourlyData: HourlyData[],
    weeklyData: DailyData[],
  ): WellbeingInsight[] => {
    const insights: WellbeingInsight[] = [];
    const hoursUsed = totalTime / 60;

    // 1. Peak hour analysis
    if (hourlyData.length > 0) {
      const peakHourData = [...hourlyData].sort(
        (a, b) => b.minutes - a.minutes,
      )[0];
      if (peakHourData && peakHourData.minutes > 20) {
        const hourStr = formatHour(peakHourData.hour);
        insights.push({
          title: `Peak Usage: ${hourStr}`,
          message: `You used your phone most at ${hourStr} (${Math.round(
            peakHourData.minutes,
          )}min)`,
          tip: "Schedule focus blocks during peak hours to maximize productivity",
        });
      }
    }

    // 2. Weekly trend analysis
    if (weeklyData.length >= 2) {
      const today = weeklyData[weeklyData.length - 1];
      const yesterday = weeklyData[weeklyData.length - 2];
      const change =
        yesterday.hours > 0
          ? ((today.hours - yesterday.hours) / yesterday.hours) * 100
          : 0;

      if (Math.abs(change) > 15) {
        insights.push({
          title: change > 0 ? "Usage Increased" : "Usage Decreased",
          message: `${Math.abs(Math.round(change))}% ${
            change > 0 ? "more" : "less"
          } screen time than yesterday`,
          tip:
            change > 0
              ? "Review what caused the increase and set app limits"
              : "Great progress! Keep maintaining this trend",
        });
      }
    }

    // 3. Productivity vs distraction balance
    const productiveTime = breakdown.productive + breakdown.learning;
    const distractingTime = breakdown.social + breakdown.entertainment;

    if (totalTime > 60) {
      const ratio = distractingTime > 0 ? productiveTime / distractingTime : 10;
      if (ratio > 2) {
        insights.push({
          title: "Highly Focused Day",
          message: `${Math.round(
            (productiveTime / totalTime) * 100,
          )}% productive app usage`,
          tip: "Excellent focus! Consider sharing your productivity methods",
        });
      } else if (ratio < 0.5) {
        insights.push({
          title: "Focus Opportunity",
          message: `${Math.round(
            (distractingTime / totalTime) * 100,
          )}% spent on distracting apps`,
          tip: "Use Focus Timer to block distractions during work hours",
        });
      }
    }

    // 4. Screen time health check
    if (hoursUsed > 6) {
      insights.push({
        title: "High Screen Time",
        message: `${hoursUsed.toFixed(1)}h total usage today`,
        tip: "Follow the 20-20-20 rule: Every 20min, look 20ft away for 20sec",
      });
    } else if (hoursUsed > 0 && hoursUsed < 3) {
      insights.push({
        title: "Balanced Usage",
        message: `${hoursUsed.toFixed(1)}h screen time - well managed`,
        tip: "You're maintaining excellent digital wellness",
      });
    }

    // 5. Top app dependency check
    if (topApps.length > 0 && totalTime > 0) {
      const topAppPercent = (topApps[0].totalTimeMinutes / totalTime) * 100;
      if (topAppPercent > 40) {
        insights.push({
          title: "App Dependency Alert",
          message: `${topApps[0].appName} is ${Math.round(
            topAppPercent,
          )}% of your usage`,
          tip: "Diversify your activities or set time limits for this app",
        });
      }
    }

    // 6. Late night usage warning
    if (hourlyData.length > 0) {
      const lateNightUsage = hourlyData
        .filter((h) => h.hour >= 23 || h.hour < 6)
        .reduce((sum, h) => sum + h.minutes, 0);
      if (lateNightUsage > 30) {
        insights.push({
          title: "Late Night Usage",
          message: `${Math.round(lateNightUsage)}min used between 11pm-6am`,
          tip: "Blue light at night disrupts sleep. Enable DND mode after 10pm",
        });
      }
    }

    return insights.slice(0, 4); // Show top 4 most relevant
  };

  const formatHour = (hour: number): string => {
    if (hour === 0) return "12am";
    if (hour < 12) return `${hour}am`;
    if (hour === 12) return "12pm";
    return `${hour - 12}pm`;
  };

  // Load usage data from native module
  const loadUsageData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Get today's usage stats
      const stats = await usage.getTodayUsage();

      if (stats && stats.length > 0) {
        setUsageData(stats);
        setTotalAppsUsed(stats.length);

        // Calculate total screen time
        const total = stats.reduce((sum, app) => sum + app.totalTimeMinutes, 0);
        setTotalScreenTime(total);

        // Classify apps and calculate breakdown
        const breakdown: UsageBreakdown = {
          productive: 0,
          learning: 0,
          social: 0,
          entertainment: 0,
          shopping: 0,
          other: 0,
        };

        stats.forEach((app) => {
          const category = classifyApp(app.packageName);
          breakdown[category] += app.totalTimeMinutes;
        });

        setUsageBreakdown(breakdown);

        // Prepare category chart data (top categories only)
        const categoryArray = Object.entries(breakdown)
          .map(([key, value]) => ({
            label: key.charAt(0).toUpperCase() + key.slice(1),
            value: value / 60, // Convert to hours
            percentage: total > 0 ? (value / total) * 100 : 0,
          }))
          .filter((cat) => cat.value > 0)
          .sort((a, b) => b.value - a.value)
          .slice(0, 5); // Top 5 categories

        setCategoryChartData(categoryArray);

        // Get top 5 apps
        const sorted = [...stats].sort(
          (a, b) => b.totalTimeMinutes - a.totalTimeMinutes,
        );
        setTopApps(sorted.slice(0, 5));

        // Calculate wellbeing score
        const score = calculateWellbeingScore(breakdown, total);
        setWellbeingScore(score);

        // Get hourly breakdown for today
        try {
          // @ts-ignore - Optional method that may not exist in native module yet
          const hourlyBreakdown = await usage.getHourlyBreakdown?.();
          if (hourlyBreakdown && Array.isArray(hourlyBreakdown)) {
            const hourlyData: HourlyData[] = hourlyBreakdown.map(
              (item: any) => ({
                hour: item.hour || 0,
                minutes: item.usageMinutes || item.minutes || 0,
              }),
            );
            setHourlyData(hourlyData);

            // Find peak hour
            const peak = hourlyData.reduce(
              (max, curr) => (curr.minutes > max.minutes ? curr : max),
              hourlyData[0],
            );
            if (peak) {
              setPeakHour(formatHour(peak.hour));
            }
          }
        } catch (err) {
          console.log("[Stats] Hourly breakdown not available:", err);
          setHourlyData([]);
        }

        // Get weekly screen time
        try {
          // @ts-ignore - Optional method that may not exist in native module yet
          const weeklyStats = await usage.getWeeklyScreenTime?.();
          if (weeklyStats && Array.isArray(weeklyStats)) {
            const weekData: DailyData[] = weeklyStats.map(
              (item: any, index: number) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - index));
                const totalMinutes = item.totalTimeMinutes || 0;
                return {
                  day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                    date.getDay()
                  ],
                  hours: totalMinutes / 60,
                  date,
                };
              },
            );
            setWeeklyData(weekData);

            // Calculate average
            const avgMinutes =
              weeklyStats.reduce(
                (sum: number, day: any) => sum + (day.totalTimeMinutes || 0),
                0,
              ) / weeklyStats.length;
            setAvgDailyScreenTime(avgMinutes);
          }
        } catch (err) {
          console.log("[Stats] Weekly data not available:", err);
          setWeeklyData([]);
        }

        // Get screen unlocks
        try {
          // @ts-ignore - Optional method that may not exist in native module yet
          const unlockData = await usage.getScreenUnlocksToday?.();
          if (unlockData && typeof unlockData.unlockCount === "number") {
            setScreenUnlocks(unlockData.unlockCount);
          }
        } catch (err) {
          console.log("[Stats] Screen unlocks not available:", err);
        }

        // Generate insights with all data
        const generatedInsights = generateInsights(
          breakdown,
          total,
          sorted,
          score,
          hourlyData,
          weeklyData,
        );
        setInsights(generatedInsights);

        // Identify addictive apps (>30min OR >15% of total time)
        const addictiveThreshold = Math.max(30, total * 0.15);
        const addictive = sorted
          .filter(
            (app) =>
              app.totalTimeMinutes >= addictiveThreshold &&
              !classifyApp(app.packageName).match(/productive|learning/),
          )
          .slice(0, 5);
        setAddictiveApps(addictive);
      } else {
        // No data available
        setTotalScreenTime(0);
        setWellbeingScore(100);
        setHourlyData([]);
        setWeeklyData([]);
        setCategoryChartData([]);
        setTopApps([]);
        setTotalAppsUsed(0);
        setScreenUnlocks(0);
        setInsights([
          {
            title: "Fresh Start",
            message: "No usage data recorded yet for today",
            tip: "Start using your device and return to see insights",
          },
        ]);
      }
    } catch (error) {
      console.error("[Stats] Error loading usage data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const animations = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animations.start();

    return () => {
      animations.stop();
      fadeAnim.setValue(0);
      slideUpAnim.setValue(30);
    };
  }, []);

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Analyzing usage patterns...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.headerTitle}>Digital Wellbeing</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => loadUsageData(true)}
          activeOpacity={0.7}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.refreshIcon}>↻</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomSpacing + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Stats */}
        <Animated.View
          style={[
            styles.heroSection,
            { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
          ]}
        >
          <View style={styles.heroGrid}>
            <View style={styles.heroCard}>
              <Text style={styles.heroValue}>
                {formatTime(totalScreenTime)}
              </Text>
              <Text style={styles.heroLabel}>Screen Time Today</Text>
            </View>
          </View>

          <View style={styles.miniStatsGrid}>
            <View style={styles.miniStatCard}>
              <Text style={styles.miniStatValue}>{totalAppsUsed}</Text>
              <Text style={styles.miniStatLabel}>Apps Used</Text>
            </View>
            <View style={styles.miniStatCard}>
              <Text style={styles.miniStatValue}>{screenUnlocks}</Text>
              <Text style={styles.miniStatLabel}>Unlocks</Text>
            </View>
            <View style={styles.miniStatCard}>
              <Text style={styles.miniStatValue}>
                {formatTime(avgDailyScreenTime)}
              </Text>
              <Text style={styles.miniStatLabel}>Daily Avg</Text>
            </View>
          </View>
        </Animated.View>

        {/* Wellbeing Score */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
          ]}
        >
          <Text style={styles.sectionTitle}>WELLBEING SCORE</Text>
          <View style={styles.scoreCard}>
            <ProgressRing
              value={wellbeingScore}
              maxValue={100}
              size={140}
              strokeWidth={10}
              showPercentage={false}
            />
            <View style={styles.scoreDescription}>
              <Text style={styles.scoreText}>
                {wellbeingScore >= 80
                  ? "Excellent"
                  : wellbeingScore >= 60
                  ? "Good"
                  : wellbeingScore >= 40
                  ? "Fair"
                  : "Needs Improvement"}
              </Text>
              <Text style={styles.scoreSubtext}>
                {wellbeingScore >= 80
                  ? "Highly productive usage patterns"
                  : wellbeingScore >= 60
                  ? "Balanced digital lifestyle"
                  : wellbeingScore >= 40
                  ? "Room for improvement"
                  : "Focus on productive apps"}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Weekly Trend Chart */}
        {weeklyData.length > 0 && (
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
            ]}
          >
            <Text style={styles.sectionTitle}>7-DAY SCREEN TIME TREND</Text>
            <View style={styles.chartCard}>
              <BarChart
                data={weeklyData.map((day, index) => ({
                  label: day.day,
                  value: day.hours,
                  highlighted: index === weeklyData.length - 1, // Highlight today
                }))}
                height={220}
                width={SCREEN_WIDTH - 64}
                showValues={true}
                showGrid={true}
              />
            </View>
          </Animated.View>
        )}

        {/* Day-wise Hourly Heatmap */}
        {weeklyData.length > 0 && (
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
            ]}
          >
            <Text style={styles.sectionTitle}>HOURLY USAGE PATTERN</Text>

            {/* Day Selector Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.dayTabsContainer}
              contentContainerStyle={styles.dayTabsContent}
            >
              {weeklyData.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayTab,
                    selectedDayIndex === index && styles.dayTabActive,
                  ]}
                  onPress={() => setSelectedDayIndex(index)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayTabText,
                      selectedDayIndex === index && styles.dayTabTextActive,
                    ]}
                  >
                    {day.day}
                  </Text>
                  <Text
                    style={[
                      styles.dayTabDate,
                      selectedDayIndex === index && styles.dayTabDateActive,
                    ]}
                  >
                    {day.date.getDate()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.chartCard}>
              {(selectedDayIndex === 6
                ? hourlyData
                : dailyHourlyData[selectedDayIndex] || []
              ).length > 0 ? (
                <>
                  <HeatmapChart
                    data={
                      selectedDayIndex === 6
                        ? hourlyData
                        : dailyHourlyData[selectedDayIndex] || []
                    }
                    width={SCREEN_WIDTH - 64}
                  />
                  {selectedDayIndex === 6 && peakHour && (
                    <View style={styles.peakHourBadge}>
                      <Text style={styles.peakHourText}>
                        Peak Hour: {peakHour}
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>
                    No hourly data available for{" "}
                    {weeklyData[selectedDayIndex]?.day}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Category Breakdown */}
        {categoryChartData.length > 0 && (
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
            ]}
          >
            <Text style={styles.sectionTitle}>USAGE BY CATEGORY</Text>
            <View style={styles.chartCard}>
              <PieChart
                data={categoryChartData}
                size={200}
                innerRadius={0.55}
                showLegend={true}
              />
            </View>
          </Animated.View>
        )}

        {/* Addictive Apps Alert */}
        {addictiveApps.length > 0 && (
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
            ]}
          >
            <Text style={styles.sectionTitle}>⚠️ ADDICTIVE APPS DETECTED</Text>
            <View style={styles.addictiveAppsCard}>
              <Text style={styles.addictiveWarning}>
                These apps are consuming excessive screen time
              </Text>
              {addictiveApps.map((app, index) => {
                const percentage =
                  totalScreenTime > 0
                    ? (app.totalTimeMinutes / totalScreenTime) * 100
                    : 0;
                const isDistracting = classifyApp(app.packageName).match(
                  /social|entertainment/,
                );

                return (
                  <View key={app.packageName} style={styles.addictiveAppItem}>
                    <View style={styles.addictiveAppLeft}>
                      <View style={styles.addictiveAppRank}>
                        <Text style={styles.addictiveAppRankText}>
                          {index + 1}
                        </Text>
                      </View>
                      <View style={styles.addictiveAppInfo}>
                        <Text style={styles.addictiveAppName} numberOfLines={1}>
                          {app.appName}
                        </Text>
                        <View style={styles.addictiveAppMeta}>
                          <Text style={styles.addictiveAppTime}>
                            {formatTime(app.totalTimeMinutes)}
                          </Text>
                          <Text style={styles.addictiveAppDot}>•</Text>
                          <Text style={styles.addictiveAppPercentage}>
                            {percentage.toFixed(0)}% of total
                          </Text>
                          {isDistracting && (
                            <>
                              <Text style={styles.addictiveAppDot}>•</Text>
                              <Text style={styles.addictiveAppTag}>
                                Distracting
                              </Text>
                            </>
                          )}
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.addToFrictionButton}
                      onPress={() => {
                        navigation.navigate("FrictionSettings", {
                          preselectedApp: app.packageName,
                          appName: app.appName,
                        });
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.addToFrictionText}>Add Friction</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
              <View style={styles.addictiveTip}>
                <Text style={styles.addictiveTipIcon}>💡</Text>
                <Text style={styles.addictiveTipText}>
                  Tap "Add Friction" to require breathing exercises before
                  opening these apps
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Top Apps */}
        {topApps.length > 0 && (
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
            ]}
          >
            <Text style={styles.sectionTitle}>MOST USED APPS</Text>
            <View style={styles.topAppsCard}>
              {topApps.map((app, index) => {
                const percentage =
                  totalScreenTime > 0
                    ? (app.totalTimeMinutes / totalScreenTime) * 100
                    : 0;

                return (
                  <View key={app.packageName} style={styles.appItem}>
                    <View style={styles.appRank}>
                      <Text style={styles.appRankText}>{index + 1}</Text>
                    </View>
                    <View style={styles.appInfo}>
                      <Text style={styles.appName} numberOfLines={1}>
                        {app.appName}
                      </Text>
                      <View style={styles.appBarContainer}>
                        <View
                          style={[styles.appBar, { width: `${percentage}%` }]}
                        />
                      </View>
                    </View>
                    <View style={styles.appStats}>
                      <Text style={styles.appTime}>
                        {formatTime(app.totalTimeMinutes)}
                      </Text>
                      <Text style={styles.appPercentage}>
                        {percentage.toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
            ]}
          >
            <Text style={styles.sectionTitle}>INSIGHTS & TIPS</Text>
            <View style={styles.insightsContainer}>
              {insights.map((insight, index) => (
                <View key={index} style={styles.insightCard}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightMessage}>{insight.message}</Text>
                  <View style={styles.insightTipContainer}>
                    <Text style={styles.insightTipIcon}>💡</Text>
                    <Text style={styles.insightTip}>{insight.tip}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Summary Card */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
          ]}
        >
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Today's Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Screen Time</Text>
                <Text style={styles.summaryValue}>
                  {formatTime(totalScreenTime)}
                </Text>
              </View>
              {peakHour && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Peak Hour</Text>
                  <Text style={styles.summaryValue}>{peakHour}</Text>
                </View>
              )}
              {topApps.length > 0 && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Top App</Text>
                  <Text style={styles.summaryValue} numberOfLines={1}>
                    {topApps[0].appName}
                  </Text>
                </View>
              )}
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Wellbeing</Text>
                <Text style={styles.summaryValue}>{wellbeingScore}/100</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <BottomNavBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "home") navigation.navigate("Home");
          else if (tab === "tasks") navigation.navigate("Tasks");
          else if (tab === "focus") navigation.navigate("FocusTimer");
        }}
        themeColors={{
          textPrimary: "#FFFFFF",
          textTertiary: "rgba(255, 255, 255, 0.5)",
          navBackground: "rgba(255, 255, 255, 0.05)",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "300",
    lineHeight: 30,
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  refreshIcon: {
    fontSize: 24,
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  heroSection: {
    marginBottom: 32,
  },
  heroGrid: {
    marginBottom: 16,
  },
  heroCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  heroValue: {
    fontSize: 40,
    fontWeight: "200",
    color: "#ffffffff",
    letterSpacing: -2,
    marginBottom: 8,
    lineHeight: 44,
  },
  heroLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.5)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  miniStatsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  miniStatCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  miniStatValue: {
    fontSize: 24,
    fontWeight: "300",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  miniStatLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    textTransform: "uppercase",
  },
  section: {
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.5)",
    letterSpacing: 1.5,
    marginBottom: 18,
    lineHeight: 16,
  },
  scoreCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  scoreDescription: {
    marginTop: 24,
    alignItems: "center",
  },
  scoreText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 4,
    lineHeight: 30,
  },
  scoreSubtext: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },
  chartCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  dayTabsContainer: {
    marginBottom: 16,
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  dayTabsContent: {
    gap: 8,
  },
  dayTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    minWidth: 60,
    alignItems: "center",
  },
  dayTabActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  dayTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 2,
  },
  dayTabTextActive: {
    color: "#000000",
  },
  dayTabDate: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.8)",
  },
  dayTabDateActive: {
    color: "#000000",
  },
  noDataContainer: {
    padding: 40,
    alignItems: "center",
  },
  noDataText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
  },
  addictiveAppsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  addictiveWarning: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 18,
  },
  addictiveAppItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    minHeight: 70,
  },
  addictiveAppLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 16,
  },
  addictiveAppRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  addictiveAppRankText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
  },
  addictiveAppInfo: {
    flex: 1,
    minHeight: 50,
    justifyContent: "center",
  },
  addictiveAppName: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 6,
    lineHeight: 20,
  },
  addictiveAppMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    rowGap: 4,
  },
  addictiveAppTime: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  addictiveAppDot: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 6,
  },
  addictiveAppPercentage: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  addictiveAppTag: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  addToFrictionButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  addToFrictionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000000",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    lineHeight: 16,
  },
  addictiveTip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addictiveTipIcon: {
    fontSize: 14,
  },
  addictiveTipText: {
    flex: 1,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 17,
  },
  peakHourBadge: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    alignSelf: "center",
  },
  peakHourText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  topAppsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    gap: 16,
  },
  appItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
    minHeight: 60,
  },
  appRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  appRankText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  appInfo: {
    flex: 1,
    minHeight: 50,
    justifyContent: "center",
  },
  appName: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    marginBottom: 8,
    lineHeight: 18,
  },
  appBarContainer: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  appBar: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  appStats: {
    alignItems: "flex-end",
  },
  appTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  appPercentage: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
  },
  insightsContainer: {
    gap: 12,
  },
  insightCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    minHeight: 100,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 10,
    lineHeight: 20,
  },
  insightMessage: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 14,
    lineHeight: 20,
  },
  insightTipContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 14,
    borderRadius: 8,
  },
  insightTipIcon: {
    fontSize: 14,
  },
  insightTip: {
    flex: 1,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 17,
  },
  summaryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  summaryItem: {
    width: "47%",
    minHeight: 60,
  },
  summaryLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    textTransform: "uppercase",
    marginBottom: 8,
    lineHeight: 14,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    lineHeight: 22,
  },
});
