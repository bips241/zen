/**
 * Dashboard Screen
 * 
 * Analytics and statistics view with database integration
 */

import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Container, Spacer } from '../../components/atoms';
import { StatCard, Card } from '../../components/molecules';
import { colors, spacing } from '../../theme';
import {
  useTodayStats,
  useWeeklyStats,
  useRecentSessions,
  useCompletionStats,
} from '../../hooks/useDatabase';

export default function DashboardScreen() {
  const { stats: todayStats, loading: todayLoading } = useTodayStats();
  const { totalMinutes: weekMinutes, loading: weekLoading } = useWeeklyStats();
  const { sessions, loading: sessionsLoading } = useRecentSessions(5);
  const { currentStreak, loading: streakLoading } = useCompletionStats();

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const isLoading = todayLoading || weekLoading || sessionsLoading || streakLoading;

  if (isLoading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </Container>
    );
  }

  const todayMinutes = todayStats?.totalFocusMinutes || 0;
  const longestStreak = todayStats?.longestStreakSeconds 
    ? Math.floor(todayStats.longestStreakSeconds / 86400) 
    : 0;

  return (
    <Container padding="lg">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text variant="title">Dashboard</Text>
        <Text variant="small" color={colors.gray[500]}>
          Your productivity stats
        </Text>

        <Spacer size="xl" />

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Today"
            value={formatMinutes(todayMinutes)}
            subtitle="Focus time"
            color={colors.accent}
          />
          <StatCard
            label="This Week"
            value={formatMinutes(weekMinutes)}
            subtitle="Total minutes"
            color={colors.info}
          />
        </View>

        <Spacer size="md" />

        <View style={styles.statsGrid}>
          <StatCard
            label="Current Streak"
            value={`${currentStreak} days`}
            subtitle="Keep it up!"
            color={colors.success}
          />
          <StatCard
            label="Longest Streak"
            value={`${longestStreak} days`}
            subtitle="Personal best"
            color={colors.warning}
          />
        </View>

        <Spacer size="xl" />

        {/* Recent Sessions */}
        <Text variant="heading">Recent Sessions</Text>
        <Spacer size="md" />

        {sessions.length === 0 ? (
          <Card>
            <Text variant="body" color={colors.gray[500]} style={styles.emptyText}>
              No sessions yet. Start your first focus session!
            </Text>
          </Card>
        ) : (
          sessions.map((session) => (
            <View key={session.id}>
              <Card>
                <View style={styles.sessionRow}>
                  <View style={styles.sessionInfo}>
                    <Text variant="bodyBold">
                      {Math.floor(session.elapsedSeconds / 60)} / {session.goalMinutes} min
                    </Text>
                    <Text variant="small" color={colors.gray[500]}>
                      {new Date(session.startedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.sessionScore}>
                    <Text variant="title" color={session.isCompleted ? colors.accent : colors.gray[500]}>
                      {Math.floor(session.progressPercent)}%
                    </Text>
                    <Text variant="tiny" color={colors.gray[500]}>
                      {session.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </Card>
              <Spacer size="sm" />
            </View>
          ))
        )}

        <Spacer size="xxl" />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  emptyText: {
    textAlign: 'center',
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionScore: {
    alignItems: 'center',
  },
});
