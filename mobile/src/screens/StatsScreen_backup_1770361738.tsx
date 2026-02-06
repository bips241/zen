/**
 * Stats Screen - Digital Wellbeing Analytics (Black & White Theme)
 * 
 * Features:
 * - Real usage data from native Android modules
 * - Weekly hourly usage patterns with heatmap
 * - 7-day screen time comparison
 * - Deep behavioral insights
 * - Peak usage analysis
 * - Actionable wellbeing tips
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
import { Text } from "../components/atoms";
import { colors } from "../theme";
import { useSystemInsets } from "../hooks/useSystemInsets";
import { useFocusEffect } from "@react-navigation/native";
import BottomNavBar from "../components/molecules/BottomNavBar";
import { usage } from "../services/nativeBridge";
import type { AppUsageStats } from "../native-android/nativeModules";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// App category classification for wellbeing insights
const APP_CATEGORIES = {
  PRODUCTIVE: [
    'docs', 'sheets', 'slides', 'notion', 'obsidian', 'calendar', 
    'gmail', 'outlook', 'slack', 'teams', 'zoom', 'meet',
    'github', 'gitlab', 'vscode', 'termux', 'kindle', 'audible'
  ],
  LEARNING: [
    'coursera', 'udemy', 'khan', 'duolingo', 'brilliant', 'skillshare',
    'ted', 'youtube', 'podcast', 'medium', 'pocket'
  ],
  SOCIAL: [
    'whatsapp', 'telegram', 'signal', 'messenger', 'instagram', 
    'facebook', 'twitter', 'snapchat', 'tiktok', 'reddit', 'discord'
  ],
  ENTERTAINMENT: [
    'netflix', 'prime', 'hotstar', 'hulu', 'spotify', 'apple.music',
    'youtube', 'twitch', 'gaming', 'game', 'play.games'
  ],
  SHOPPING: [
    'amazon', 'flipkart', 'myntra', 'ajio', 'swiggy', 'zomato',
    'uber', 'ola', 'paytm', 'phonepe', 'gpay'
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
}refreshing, setRefreshing] = useState(false);
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
  const [peakHour, setPeakHour] = useState<string>('');
  const [avgDailyScreenTime, setAvgDailyScreenTime] = useState(0
    learning: 0,
    social: 0,
    entertainment: 0,
    shopping: 0,
    other: 0,
  });
  const [topApps, setTopApps] = useState<AppUsageStats[]>([]);
  const [insights, setInsights] = useState<WellbeingInsight[]>([]);
  const [peakHour, setPeakHour] = useState<string>('');

  const { navBarHeight } = useSystemInsets();
  const safeNavBarHeight = navBarHeight || 0;
  const TAB_BAR_HEIGHT = 60;
  const bottomSpacing = TAB_BAR_HEIGHT + safeNavBarHeight + 16;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;

  // Update active tab when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setActiveTab("stats");
      loadUsageData();
    }, []),
  );

  // Classify app into category - Pure math, no colors
  const calculateWellbeingScore = (breakdown: UsageBreakdown, totalTime: number): number => {
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
      const penalty = Math.min(25, (hoursUsed - 5) * 3
      breakdown.productive * productiveWeight +
      breakdown.learning * learningWeight +
      breakdown.social * socialWeight +
      breakdown.entertainment * entertainmentWeight +
      breakdown.shopping * shoppingWeight +
      breakdown.other * otherWeight;

    const score = Math.min(100, Math.round((totalWeight / totalTime) * 100));
    
    // Penalty for excessive screen time (over 6 hours)
    const hoursUsed = totalTime / 60;
    if (hoursUsed > 6) {
      const penalty = Math.min(20, (hoursUsed - 6) * 2);
      return Math.max(0, score - penalty);
    }
 - More data-driven
  const generateInsights = (
    breakdown: UsageBreakdown, 
    totalTime: number,
    topApps: AppUsageStats[],
    score: number,
    hourlyData: HourlyData[],
    weeklyData: DailyData[]
  ): WellbeingInsight[] => {
    const insights: WellbeingInsight[] = [];
    const hoursUsed = totalTime / 60;

    // Peak hour analysis
    if (hourlyData.length > 0) {
      const peakHourData = [...hourlyData].sort((a, b) => b.minutes - a.minutes)[0];
      if (peakHourData && peakHourData.minutes > 30) {
        const hourStr = peakHourData.hour === 0 ? '12am' : 
                       peakHourData.hour < 12 ? `${peakHourData.hour}am` :
                       peakHourData.hour === 12 ? '12pm' : `${peakHourData.hour - 12}pm`;
        insights.push({
          title: `Peak Usage: ${hourStr}`,
          message: `You used your phone most at ${hourStr} (${Math.round(peakHourData.minutes)}min)`,
          tip: 'Schedule focus blocks during this time to maximize productivity'
        });
      }
    }

    // Weekly trend analysis
    if (weeklyData.length >= 2) {
      const today = weeklyData[weeklyData.length - 1];
      const yesterday = weeklyData[weeklyData.length - 2];
      const change = ((today.hours - yesterday.hours) / yesterday.hours) * 100;
      
      if (Math.abs(change) > 20) {
        insights.push({
          title: change > 0 ? 'Usage Increased' : 'Usage Decreased',
          message: `${Math.abs(Math.round(change))}% ${change > 0 ? 'more' : 'less'} screen time than yesterday`,
          tip: change > 0 ? 'Review what caused the increase and set app limits' : 'Great progress! Keep maintaining this trend'
        });
      }
    }

    // Productivity vs distraction balance
    const productiveTime = breakdown.productive + breakdown.learning;
    const distractingTime = breakdown.social + breakdown.entertainment;
    
    if (totalTime > 60) {
      const ratio = productiveTime / distractingTime;
      if (ratio > 2) {
        insights.push({
          title: 'Highly Focused',
          message: `${Math.round((productiveTime/totalTime)*100)}% productive usage`,
          tip: 'Excellent focus! Consider teaching others your methods'
        });
      } else if (ratio < 0.5) {
        insights.push({
          title: 'Focus Opportunity',
          message: `${Math.round((distractingTime/totalTime)*100)}% spent on distracting apps`,
          tip: 'Use Focus Timer to block distractions during work hours'
        });
      }
    }

    // Screen time health check
    if (hoursUsed > 5) {
      insights.push({
        title: 'Screen Time Alert',
        message: `${hoursUsed.toFixed(1)}h total usage today`,
        tip: 'Take 20-second breaks every 20 minutes to protect your eyes'
      });
    } else if (hoursUsed < 2 && totalTime > 0) {
      insights.push({
        title: 'Balanced Usage',
        message: `${hoursUsed.toFixed(1)}h screen time - well managed`,
        tip: 'You\'re maintaining excellent digital wellness'
      });
    }

    // Top app dependency check
    if (topApps.length > 0) {
      const topAppPercent = (topApps[0].totalTimeMinutes / totalTime) * 100;
      if (topAppPercent > 40) {
        insights.push({
          title: 'Single App Dominance',
          message: `${topApps[0].appName} accounts for ${Math.round(topAppPercent)}% of usage`,
          tip: 'Diversify your app usage or set specific time limits'
        });
      }
    }

    return insights.slice(0, 4); // Show top 4
      });
    }

    return insights.slice(0, 3); // Show top 3 insights
  };

  // Load usage data from native module
  const loadUsageData = async () => {
    try {
      setLoading(true);
      
      // Get today's usage stats
      const stats = await usage.getTodayUsage();
      
      if (stats && stats.length > 0) {
        // Calculate total screen time
        const total = stats.reduce((sum, app) => sum + app.totalTimeMinutes, 0);
        setTotalScreenTime(total);
        
        // Classify apps and calculate  - Fixed to prevent blank screen
  const loadUsageData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
          social: 0,
          entertainment: 0,
          shopping: 0,
          other: 0,
        };

        stats.forEach(app => {
          const category = classifyApp(app.packageName);
          breakdown[category] += app.totalTimeMinutes;
        });

        setUsageBreakdown(breakdown);
        
        // Get top 5 apps
        const sorted = [...stats].sort((a, b) => b.totalTimeMinutes - a.totalTimeMinutes);
        setTopApps(sorted.slice(0, 5));
        
        // Calculate wellbeing score
        const score = calculateWellbeingScore(breakdown, total);
        setWellbeingScore(score);
        
        // Animate score
        Animated.timing(scoreAnim, {
          toValue: score,
          duration: 1500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();
        
        // Generate insights
        const insights = generateInsights(breakdown, total, sorted, score);
        setInsights(insights);
        
        // Determine peak hour (simplified - using current hour as placeholder)
        const hour = new Date().getHours();
        setPeakHour(`${hour}:00 - ${hour + 1}:00`);
        
        setUsageData(stats);
      } else t hourly breakdown for today
        try {
          const hourlyBreakdown = await usage.getHourlyBreakdown();
          if (hourlyBreakdown && Array.isArray(hourlyBreakdown)) {
            const hourlyData: HourlyData[] = hourlyBreakdown.map((item: any) => ({
              hour: item.hour || 0,
              minutes: item.minutes || 0
            }));
            setHourlyData(hourlyData);
            
            // Find peak hour
            const peak = hourlyData.reduce((max, curr) => 
              curr.minutes > max.minutes ? curr : max, hourlyData[0]);
           HourlyData([]);
        setWeeklyData([]);
        setInsights([{
          title: 'Fresh Start',
          message: 'No usage data yet for today',
          tip: 'Start using your device and come back to see insights'
        }]);
      }
      
    } catch (error) {
      console.error('[Stats] Error loading usage data:', error);
    } finally {
      setLoading(false);
      setRefresht weekly screen time
        try {
          const weeklyStats = await usage.getWeeklyScreenTime();
          if (weeklyStats && Array.isArray(weeklyStats)) {
            const weekData: DailyData[] = weeklyStats.map((item: any, index: number) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - index));
              return {
                day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
                hours: (item.totalTimeMinutes || 0) / 60,
                date
              };
            });
            setWeeklyData(weekData);
            
            // Calculate average
            const avgMinutes = weeklyStats.reduce((sum: number, day: any) => 
              sum + (day.totalTimeMinutes || 0), 0) / weeklyStats.length;
            setAvgDailyScreenTime(avgMinutes);
          }
        } catch (err) {
          console.log('[Stats] Weekly data not available:', err);
          setWeeklyData([]);
        }
        
        // Generate insights with all data
        const insights = generateInsights(breakdown, total, sorted, score, hourlyData, weeklyData);
        setInsights(insights
          message: 'No usage data yet for today',
          tip: 'Start your day mindfully and track your progress',
          icon: '🌅'
        }]);
      }
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animations.start();
usage patterns...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.headerTitle}>Statistics</Text>
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
    if (score >= 80) return '#4ADE80'; // Green
    if (score >= 60) return '#FACC15'; // Yellow
    if (score >= 40) return '#FB923C'; // Orange
    return '#EF4444'; // Red
  };

  const getIOverview Cards */}
        <Animated.View
          style={[
            styles.heroSection,
            { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
          ]}
        >
          <View style={styles.overviewGrid}>
            {/* Today's Screen Time */}
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>{formatTime(totalScreenTime)}</Text>
              <Text style={styles.overviewLabel}>Today</Text>
            </View>
            
            {/* Weekly Average */}
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>{formatTime(avgDailyScreenTime)}</Text>
              <Text style={styles.overviewLabel}>Avg/Day</Text>
            </View>
            
            {/* Wellbeing Score */}
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>{wellbeingScore}</Text>
              <Text style={styles.overviewLabel}>Score</Text>
            </View>
            
            {/* Apps Used */}
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>{usageData.length}</Text>
              <Text style={styles.overviewLabel}>Apps</Text>
            </View>
          </View>
        </Animated.View>

        {/* Weekly Screen Time Trend */}
        {weeklyData.length > 0 && (
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
            ]}
          >
            <Text style={styles.sectionTitle}>WEEKLY TREND</Text>
            <View style={styles.chartCard}>
              <View style={styles.weeklyChart}>
                {weeklyData.map((day, index) => {
                  const maxHours = Math.max(...weeklyData.map(d => d.hours), 1);
                  const heightPercent = (day.hours / maxHours) * 100;
                  const isToday = index === weeklyData.length - 1;
                  
                  return (
                    <View key={index} style={styles.barWrapper}>
                      <View style={styles.barColumn}>
                        <Text style={styles.barValue}>{day.hours.toFixed(1)}h</Text>
                        <View 
                          style={[
                            styles.bar,
                            { 
                              height: `${Math.max(heightPercent, 5)}%`,
                              backgroundColor: isToday ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)'
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>
                        {day.day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Hourly Usage Heatmap */}
        {hourlyData.length > 0 && (
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
            ]}
          >
            <Text style={styles.sectionTitle}>HOURLY PATTERN (TODAY)</Text>
            <View style={styles.heatmapCard}>
              <View style={styles.heatmapGrid}>
                {Array.from({ length: 24 }, (_, hour) => {
                  const data = hourlyData.find(h => h.hour === hour);
                  const minutes = data?.minutes || 0;
                  const maxMinutes = Math.max(...hourlyData.map(h => h.minutes), 1);
                  const intensity = minutes / maxMinutes;
                  
                  return (
                    <View key={hour} style={styles.heatmapCell}>
                      <View 
                        style={[
                          styles.heatmapBlock,
                          { 
                            backgroundColor: intensity > 0 
                              ? `rgba(255, 255, 255, ${0.1 + (intensity * 0.9)})`
                              : 'rgba(255, 255, 255, 0.05)'
                          }
                        ]}
                      >
                        {minutes > 0 && (
                          <Text style={styles.heatmapValue}>{Math.round(minutes)}</Text>
                        )}
                      </View>
                      <Text style={styles.heatmapLabel}>
                        {hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour-12}p`}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </Animated.View>
        )}ection,
            { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
          ]}
        >
          <View style={styles.scoreContainer}>
            <View style={styles.scoreCircle}>
              <Animated.Text 
                style={[
                  styles.scoreValue,
                  { color: getScoreColor(wellbeingScore) }
                ]}
              >
                {Math.round(wellbeingScore)}
              </Animated.Text>
              <Text style={styles.scoreLabel}>Wellbeing Score</Text>
            </View>
            
            {/* Score interpretation */}
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreTitle}>
                {wellbeingScore >= 80 ? 'Excellent!' : 
                 wellbeingScore >= 60 ? 'Good' :
                 wellbeingScore >= 40 ? 'Fair' : 'Needs Attention'}
              </Text>
              <Text style={styles.scoreDescription}>
                {wellbeingScore >= 80 ? 'You\'re maintaining healthy digital habits' : 
                 wellbeingScore >= 60 ? 'Room for improvement in some areas' :
                 wellbeingScore >= 40 ? 'Consider reducing distracting apps' : 
                 'Time to reset your digital wellbeing'}
              </Text>
            </View>
          </View>

          {/* Total Screen Time */}
          <View style={styles.screenTimeCard}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#FFFFFF" />
            <View style={styles.screenTimeInfo}>
              <Text style={styles.screenTimeValue}>{formatTime(totalScreenTime)}</Text>
              <Text style={styles.screenTimeLabel}>Total Screen Time Today</Text>
            </View>
          </View>
        </Animated.View>

        {/* Usage Categories Summary */}
        {totalScreenTime > 0 && (
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
            ]}
          >
            <Text style={styles.sectionTitle}>USAGE CATEGORIES</Text>
            <View style={styles.categoriesCard}>
              {Object.entries(usageBreakdown)
                .filter(([_, minutes]) => minutes > 0)
                .sort(([_, a], [__, b]) => b - a)
                .slice(0, 4)
                .map(([category, minutes]) => {
                  const percentage = (minutes / totalScreenTime) * 100;
                  return (
                    <View key={category} style={styles.categoryRow}>
                      <Text style={styles.categoryName}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Text>
                      <View style={styles.categoryStats}>
                        <Text style={styles.categoryTime}>{formatTime(minutes)}</Text>
                        <View style={styles.categoryBar}>
                          <View style={[styles.categoryBarFill, { width: `${percentage}%` }]} />
                        </View>
                      </View>
                    </View>
                  );
                })}
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
            <Text style={styles.sectionTitle}>TOP APPS TODAY</Text>
            <View style={styles.topAppsCard}>
              {topApps.map((app, index) => {
                const percentage = totalScreenTime > 0
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
                      <View style={styles.appStats}>
                        <Text style={styles.appTime}>{formatTime(app.totalTimeMinutes)}</Text>
                        <View style={styles.appBar}>
                          <View 
                            style={[
                              styles.appBarFill, 
                              { width: `${percentage}%` }
                            ]} 
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Insights & Tips */}
        {insights.length > 0 && (
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
            ]}
          >
            <Text style={styles.sectionTitle}>INSIGHTS</Text>
            {insights.map((insight, index) => (
              <View key={index} style={styles.insightCard}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightMessage}>{insight.message}</Text>
                <View style={styles.tipContainer}>
                  <Text style={styles.tipLabel}>→</Text>
                  <Text style={styles.tipText}>{insight.tip}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Summary Stats */}
        {peakHour && (
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
            ]}
          >
            <Text style={styles.sectionTitle}>SUMMARY</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Peak Hour</Text>
                <Text style={styles.summaryValue}>{peakHour}</Text>
              </View>
              {topApps[0] && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Most Used</Text>
                  <Text style={styles.summaryValue} numberOfLines={1}>{topApps[0].appName}</Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Wellbeing</Text>
                <Text style={styles.summaryValue}>
                  {wellbeingScore >= 80 ? 'Excellent' :
                   wellbeingScore >= 60 ? 'Good' :
                   wellbeingScore >= 40 ? 'Fair' : 'Needs Work'}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
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

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },

  loadingText: {
    fontFamily: "ZenDots-Regular",
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
  },

  // Header
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
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  refreshIcon: {
    fontSize: 24,
    color: "#FFFFFF",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 24,
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontFamily: "ZenDots-Regular",
    fontSize: 9,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 12,
    letterSpacing: 2,
  },

  // Overview Grid
  heroSection: {
    marginBottom: 28,
  },

  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  overviewCard: {
    width: (SCREEN_WIDTH - 60) / 2,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },

  overviewValue: {
    fontFamily: "ZenDots-Regular",
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "700",
    marginBottom: 6,
  },

  overviewLabel: {
    fontFamily: "ZenDots-Regular",
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.5)",
  },

  // Weekly Chart
  chartCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 20,
  },

  weeklyChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 160,
  },

  barWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
  },

  barColumn: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  bar: {
    width: "75%",
    minHeight: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },

  barValue: {
    fontFamily: "ZenDots-Regular",
    fontSize: 8,
    color: "rgba(255, 255, 255, 0.5)",
    marginBottom: 6,
  },

  barLabel: {
    fontFamily: "ZenDots-Regular",
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 8,
  },

  barLabelToday: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Hourly Heatmap
  heatmapCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 16,
  },

  heatmapGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  heatmapCell: {
    width: (SCREEN_WIDTH - 92) / 6,
    alignItems: "center",
  },

  heatmapBlock: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  heatmapValue: {
    fontFamily: "ZenDots-Regular",
    fontSize: 7,
    color: "#000000",
    fontWeight: "700",
  },

  heatmapLabel: {
    fontFamily: "ZenDots-Regular",
    fontSize: 7,
    color: "rgba(255, 255, 255, 0.4)",
    marginTop: 4,
  },

  // Categories
  categoriesCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },

  categoryRow: {
    gap: 10,
  },

  categoryName: {
    fontFamily: "ZenDots-Regular",
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
    marginBottom: 6,
  },

  categoryStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  categoryTime: {
    fontFamily: "ZenDots-Regular",
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    minWidth: 60,
  },

  categoryBar: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },

  categoryBarFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },

  // Top Apps (keeping existing styles)
  topAppsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },

  appItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  appRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  appRankText: {
    fontFamily: "ZenDots-Regular",
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  appInfo: {
    flex: 1,
  },

  appName: {
    fontFamily: "ZenDots-Regular",
    fontSize: 12,
    color: "#FFFFFF",
    marginBottom: 6,
    fontWeight: "500",
  },

  appStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  appTime: {
    fontFamily: "ZenDots-Regular",
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
    minWidth: 50,
  },

  appBar: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },

  appBarFill: {
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 2,
  },

  // Insights
  insightCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderLeftWidth: 3,
    borderLeftColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  insightTitle: {
    fontFamily: "ZenDots-Regular",
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 8,
  },

  insightMessage: {
    fontFamily: "ZenDots-Regular",
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 10,
    lineHeight: 17,
  },

  tipContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 10,
    borderRadius: 8,
  },

  tipLabel: {
    fontFamily: "ZenDots-Regular",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },

  tipText: {
    flex: 1,
    fontFamily: "ZenDots-Regular",
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.6)",
    lineHeight: 15,
  },

  // Summary
  summaryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryLabel: {
    fontFamily: "ZenDots-Regular",
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
  },

  summaryValue: {
    fontFamily: "ZenDots-Regular",
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
});
