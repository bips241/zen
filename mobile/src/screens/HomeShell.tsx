/**
 * HomeShell Screen
 * 
 * Main launcher screen showing time and quick actions with database integration
 */

import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Spacer } from '../components/atoms';
import { ProgressBar } from '../components/molecules';
import { colors, spacing } from '../theme';
import { useCurrentSession, useStore } from '../store';
import { useActiveSession, useTodayStats } from '../hooks/useDatabase';
import sessionTracker from '../services/sessionTracker';

export default function HomeShell() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const storeSession = useCurrentSession();
  const { session: dbSession } = useActiveSession();
  const { stats: todayStats } = useTodayStats();
  const dailyGoal = useStore((state) => state.preferences.dailyGoalMinutes);

  const currentSession = storeSession || dbSession;
  const todayMinutes = todayStats?.totalFocusMinutes || 0;

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleStartSession = async () => {
    try {
      await sessionTracker.startSession({
        goalMinutes: 25,
        allowBreaks: true,
      });
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handleEndSession = async () => {
    try {
      await sessionTracker.endSession();
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const progress = dailyGoal > 0 ? todayMinutes / dailyGoal : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        {/* Current Time */}
        <Text variant="huge" style={styles.time}>
          {formatTime(currentTime)}
        </Text>

        <Spacer size="sm" />

        {/* Session Status */}
        {currentSession ? (
          <>
            <Text variant="subheading" color={colors.accent}>
              Focus Session Active
            </Text>
            <Spacer size="xs" />
            <Text variant="small" color={colors.gray[500]}>
              {'elapsedSeconds' in currentSession
                ? `${Math.floor(currentSession.elapsedSeconds / 60)} / ${currentSession.goalMinutes} min`
                : `${currentSession.actualMinutes} / ${currentSession.goalMinutes} min`}
            </Text>
          </>
        ) : (
          <>
            <Text variant="subheading" color={colors.gray[500]}>
              {todayMinutes} min today
            </Text>
            <Spacer size="xs" />
            <Text variant="small" color={colors.gray[600]}>
              Goal: {dailyGoal} min
            </Text>
          </>
        )}

        <Spacer size="md" />

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} />
        </View>

        <Spacer size="xl" />

        {/* Session Control */}
        {currentSession ? (
          <Button
            label="End Session"
            onPress={handleEndSession}
            variant="secondary"
          />
        ) : (
          <Button
            label="Start Focus"
            onPress={handleStartSession}
            variant="primary"
          />
        )}
      </View>

      {/* Quick Actions Dock */}
      <View style={styles.dock}>
        <TouchableOpacity style={styles.action}>
          <Text variant="small">📞</Text>
          <Spacer size="xs" />
          <Text variant="tiny" color={colors.gray[500]}>
            Call
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action}>
          <Text variant="small">⏱️</Text>
          <Spacer size="xs" />
          <Text variant="tiny" color={colors.gray[500]}>
            Timer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action}>
          <Text variant="small">🚨</Text>
          <Spacer size="xs" />
          <Text variant="tiny" color={colors.gray[500]}>
            SOS
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  time: {
    textAlign: 'center',
  },
  progressContainer: {
    width: '80%',
  },
  dock: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.gray[900],
  },
  action: {
    alignItems: 'center',
    padding: spacing.md,
  },
});
