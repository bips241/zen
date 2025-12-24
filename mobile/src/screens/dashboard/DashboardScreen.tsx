/**
 * Dashboard Screen
 *
 * Analytics and statistics view with Zen Mobile design
 */

import React, { useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Text, Container, Spacer } from "../../components/atoms";
import { StatCard, Card } from "../../components/molecules";
import { colors, spacing } from "../../theme";
import { useNavigation } from "@react-navigation/native";
import {
  useTodayStats,
  useWeeklyStats,
  useRecentSessions,
  useCompletionStats,
} from "../../hooks/useDatabase";

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { stats: todayStats, loading: todayLoading } = useTodayStats();
  const { totalMinutes: weekMinutes, loading: weekLoading } = useWeeklyStats();
  const { sessions, loading: sessionsLoading } = useRecentSessions(5);
  const { currentStreak, loading: streakLoading } = useCompletionStats();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const isLoading =
    todayLoading || weekLoading || sessionsLoading || streakLoading;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading stats...</Text>
        </View>
      </View>
    );
  }

  const todayMinutes = todayStats?.totalFocusMinutes || 0;
  const longestStreak = todayStats?.longestStreakSeconds
    ? Math.floor(todayStats.longestStreakSeconds / 86400)
    : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Your productivity stats</Text>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.quickActions,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => (navigation as any).navigate("Pomodoro")}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>🍅</Text>
            <Text style={styles.actionLabel}>Pomodoro</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => (navigation as any).navigate("ForestFocus")}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>🌳</Text>
            <Text style={styles.actionLabel}>Forest</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => (navigation as any).navigate("DeepWork")}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>🧠</Text>
            <Text style={styles.actionLabel}>Deep Work</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => (navigation as any).navigate("FocusHistory")}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionLabel}>Stats</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View
          style={[
            styles.statsGrid,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatMinutes(todayMinutes)}</Text>
            <Text style={styles.statLabel}>Today</Text>
            <Text style={styles.statSubtitle}>Focus time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatMinutes(weekMinutes)}</Text>
            <Text style={styles.statLabel}>This Week</Text>
            <Text style={styles.statSubtitle}>Total minutes</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.statsGrid,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
            <Text style={styles.statSubtitle}>Days</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{longestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
            <Text style={styles.statSubtitle}>Personal best</Text>
          </View>
        </Animated.View>

        {/* Recent Sessions */}
        <Animated.View
          style={[
            styles.sessionsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Recent Sessions</Text>

          {sessions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No sessions yet. Start your first focus session!
              </Text>
            </View>
          ) : (
            sessions.map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionRow}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionTime}>
                      {Math.floor(session.elapsedSeconds / 60)} /{" "}
                      {session.goalMinutes} min
                    </Text>
                    <Text style={styles.sessionDate}>
                      {new Date(session.startedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.sessionScore}>
                    <Text
                      style={[
                        styles.sessionPercent,
                        session.isCompleted && styles.sessionPercentComplete,
                      ]}
                    >
                      {Math.floor(session.progressPercent)}%
                    </Text>
                    <Text style={styles.sessionStatus}>
                      {session.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
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
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "300",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
  },
  sessionsSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 16,
    fontWeight: "400",
  },
  sessionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sessionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTime: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
    fontWeight: "500",
  },
  sessionDate: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
  },
  sessionScore: {
    alignItems: "center",
  },
  sessionPercent: {
    fontSize: 24,
    color: "rgba(255, 255, 255, 0.5)",
    marginBottom: 4,
  },
  sessionPercentComplete: {
    color: "#00FF88",
  },
  sessionStatus: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.5)",
  },
  emptyCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.4)",
    textAlign: "center",
  },
});
