/**
 * Database Utilities - Helper functions for common database operations
 */

import { Q } from "@nozbe/watermelondb";
import { collections, getTodayDate } from "./index";
import Session from "./models/Session";
import DailyStats from "./models/DailyStats";

/**
 * Get all completed sessions
 */
export const getCompletedSessions = async (): Promise<Session[]> => {
  return await collections.sessions
    .query(Q.where("status", "completed"), Q.sortBy("created_at", Q.desc))
    .fetch();
};

/**
 * Get sessions for a specific date
 */
export const getSessionsForDate = async (date: string): Promise<Session[]> => {
  const startOfDay = new Date(date).setHours(0, 0, 0, 0);
  const endOfDay = new Date(date).setHours(23, 59, 59, 999);

  return await collections.sessions
    .query(
      Q.where("started_at", Q.gte(startOfDay)),
      Q.where("started_at", Q.lte(endOfDay)),
      Q.sortBy("started_at", Q.desc)
    )
    .fetch();
};

/**
 * Get stats for last N days
 */
export const getStatsForLastDays = async (
  days: number = 7
): Promise<DailyStats[]> => {
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return await collections.dailyStats
    .query(Q.where("date", Q.oneOf(dates)), Q.sortBy("date", Q.desc))
    .fetch();
};

/**
 * Get total focus time for current week
 */
export const getWeeklyFocusTime = async (): Promise<number> => {
  const stats = await getStatsForLastDays(7);
  return stats.reduce((total, stat) => total + stat.totalFocusSeconds, 0);
};

/**
 * Get total focus time for current month
 */
export const getMonthlyFocusTime = async (): Promise<number> => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const startDate = firstDayOfMonth.toISOString().split("T")[0];
  const endDate = lastDayOfMonth.toISOString().split("T")[0];

  const stats = await collections.dailyStats
    .query(Q.where("date", Q.gte(startDate)), Q.where("date", Q.lte(endDate)))
    .fetch();

  return stats.reduce((total, stat) => total + stat.totalFocusSeconds, 0);
};

/**
 * Calculate current streak (consecutive days with sessions)
 */
export const getCurrentStreak = async (): Promise<number> => {
  const stats = await getStatsForLastDays(365); // Check last year
  let streak = 0;

  for (const stat of stats) {
    if (stat.sessionsCompleted > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Get most productive time of day
 */
export const getMostProductiveHour = async (): Promise<number> => {
  const recentSessions = await collections.sessions
    .query(Q.where("status", "completed"), Q.take(100))
    .fetch();

  const hourCounts: Record<number, number> = {};

  recentSessions.forEach((session) => {
    const hour = new Date(session.startedAt).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  let mostProductiveHour = 9; // Default to 9 AM
  let maxCount = 0;

  Object.entries(hourCounts).forEach(([hour, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostProductiveHour = parseInt(hour);
    }
  });

  return mostProductiveHour;
};

/**
 * Get average session duration in minutes
 */
export const getAverageSessionDuration = async (): Promise<number> => {
  const completedSessions = await getCompletedSessions();

  if (completedSessions.length === 0) return 0;

  const totalSeconds = completedSessions.reduce(
    (sum, session) => sum + session.elapsedSeconds,
    0
  );

  return Math.floor(totalSeconds / completedSessions.length / 60);
};

/**
 * Get completion rate (percentage of completed vs abandoned sessions)
 */
export const getCompletionRate = async (): Promise<number> => {
  const allSessions = await collections.sessions
    .query(Q.or(Q.where("status", "completed"), Q.where("status", "abandoned")))
    .fetch();

  if (allSessions.length === 0) return 0;

  const completedCount = allSessions.filter(
    (s) => s.status === "completed"
  ).length;

  return Math.floor((completedCount / allSessions.length) * 100);
};

/**
 * Delete old sessions (older than X days)
 */
export const cleanupOldSessions = async (
  daysToKeep: number = 90
): Promise<number> => {
  const cutoffDate = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;

  const oldSessions = await collections.sessions
    .query(Q.where("started_at", Q.lt(cutoffDate)))
    .fetch();

  for (const session of oldSessions) {
    await session.markAsDeleted();
  }

  return oldSessions.length;
};
