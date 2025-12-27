/**
 * Daily Stats Service
 *
 * Handles persistence and retrieval of daily statistics
 */

import { Q } from "@nozbe/watermelondb";
import { database } from "../database";
import DailyStats from "../database/models/DailyStats";
import {
  getTodayDateKey,
  getDateKeysForPastDays,
} from "../utils/dailyTracking";

export class DailyStatsService {
  /**
   * Get or create today's stats record
   */
  static async getTodayStats(refreshTime: string): Promise<DailyStats> {
    const dateKey = getTodayDateKey(refreshTime);
    const collection = database.collections.get<DailyStats>("daily_stats");

    const existing = await collection.query(Q.where("date", dateKey)).fetch();

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new record for today
    return await database.write(async () => {
      return await collection.create((stats) => {
        stats.date = dateKey;
        stats.totalFocusSeconds = 0;
        stats.sessionsCompleted = 0;
        stats.sessionsAbandoned = 0;
        stats.totalInterruptions = 0;
        stats.longestStreakSeconds = 0;
        stats.appsOpenedCount = 0;
        stats.mostUsedAppsRaw = JSON.stringify([]);
      });
    });
  }

  /**
   * Add focus minutes to today's stats
   */
  static async addFocusMinutes(
    minutes: number,
    refreshTime: string
  ): Promise<void> {
    console.log("[DailyStatsService] addFocusMinutes called:", {
      minutes,
      refreshTime,
    });

    const stats = await this.getTodayStats(refreshTime);
    console.log("[DailyStatsService] Current stats:", {
      date: stats.date,
      currentSeconds: stats.totalFocusSeconds,
      currentMinutes: stats.totalFocusMinutes,
    });

    await database.write(async () => {
      await stats.update((record) => {
        const newSeconds = record.totalFocusSeconds + minutes * 60;
        console.log("[DailyStatsService] Updating DB:", {
          oldSeconds: record.totalFocusSeconds,
          addingSeconds: minutes * 60,
          newSeconds,
        });
        record.totalFocusSeconds = newSeconds;
      });
    });

    console.log("[DailyStatsService] Successfully updated database");
  }

  /**
   * Increment session count
   */
  static async incrementSessionCount(
    completed: boolean,
    refreshTime: string
  ): Promise<void> {
    const stats = await this.getTodayStats(refreshTime);

    await database.write(async () => {
      await stats.update((record) => {
        if (completed) {
          record.sessionsCompleted += 1;
        } else {
          record.sessionsAbandoned += 1;
        }
      });
    });
  }

  /**
   * Get stats for a specific date
   */
  static async getStatsByDate(dateKey: string): Promise<DailyStats | null> {
    const collection = database.collections.get<DailyStats>("daily_stats");
    const results = await collection.query(Q.where("date", dateKey)).fetch();
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get stats for the past N days
   */
  static async getStatsForPastDays(
    days: number,
    refreshTime: string
  ): Promise<DailyStats[]> {
    const dateKeys = getDateKeysForPastDays(days, refreshTime);
    const collection = database.collections.get<DailyStats>("daily_stats");

    const stats = await Promise.all(
      dateKeys.map(async (date) => {
        const results = await collection.query(Q.where("date", date)).fetch();
        return results.length > 0 ? results[0] : null;
      })
    );

    return stats.filter((s: DailyStats | null): s is DailyStats => s !== null);
  }

  /**
   * Get total minutes for the past N days
   */
  static async getTotalMinutesForPastDays(
    days: number,
    refreshTime: string
  ): Promise<Record<string, number>> {
    const stats = await this.getStatsForPastDays(days, refreshTime);
    const result: Record<string, number> = {};

    stats.forEach((stat) => {
      result[stat.date] = stat.totalFocusMinutes;
    });

    return result;
  }

  /**
   * Calculate current streak
   */
  static async calculateStreak(
    refreshTime: string
  ): Promise<{ current: number; longest: number }> {
    const dateKeys = getDateKeysForPastDays(365, refreshTime); // Check last year
    const collection = database.collections.get<DailyStats>("daily_stats");

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Start from today and go backwards
    for (const dateKey of dateKeys) {
      const results = await collection.query(Q.where("date", dateKey)).fetch();

      if (results.length > 0 && results[0].totalFocusSeconds > 0) {
        tempStreak += 1;
        if (dateKey === dateKeys[0]) {
          // This is today or the current "day" based on refresh time
          currentStreak = tempStreak;
        }
      } else {
        // Streak broken
        if (dateKey === dateKeys[0]) {
          currentStreak = 0;
        }
        tempStreak = 0;
      }

      longestStreak = Math.max(longestStreak, tempStreak);
    }

    return { current: currentStreak, longest: longestStreak };
  }

  /**
   * Get weekly total minutes
   */
  static async getWeeklyTotal(refreshTime: string): Promise<number> {
    const stats = await this.getStatsForPastDays(7, refreshTime);
    return stats.reduce((sum, stat) => sum + stat.totalFocusMinutes, 0);
  }

  /**
   * Export all stats for backup (cloud sync compatible)
   */
  static async exportAllStats(): Promise<any[]> {
    const collection = database.collections.get<DailyStats>("daily_stats");
    const allStats = await collection.query().fetch();

    return allStats.map((stat) => ({
      date: stat.date,
      totalFocusSeconds: stat.totalFocusSeconds,
      sessionsCompleted: stat.sessionsCompleted,
      sessionsAbandoned: stat.sessionsAbandoned,
      totalInterruptions: stat.totalInterruptions,
      longestStreakSeconds: stat.longestStreakSeconds,
      appsOpenedCount: stat.appsOpenedCount,
      mostUsedApps: stat.mostUsedApps,
      createdAt: stat.createdAt.toISOString(),
      updatedAt: stat.updatedAt.toISOString(),
    }));
  }

  /**
   * Import stats from backup (cloud sync compatible)
   */
  static async importStats(statsData: any[]): Promise<void> {
    const collection = database.collections.get<DailyStats>("daily_stats");

    await database.write(async () => {
      for (const data of statsData) {
        // Check if already exists
        const existing = await collection
          .query(Q.where("date", data.date))
          .fetch();

        if (existing.length > 0) {
          // Update if cloud data is newer
          const cloudUpdated = new Date(data.updatedAt);
          if (cloudUpdated > existing[0].updatedAt) {
            await existing[0].update((record: DailyStats) => {
              record.totalFocusSeconds = data.totalFocusSeconds;
              record.sessionsCompleted = data.sessionsCompleted;
              record.sessionsAbandoned = data.sessionsAbandoned;
              record.totalInterruptions = data.totalInterruptions;
              record.longestStreakSeconds = data.longestStreakSeconds;
              record.appsOpenedCount = data.appsOpenedCount;
              record.mostUsedAppsRaw = JSON.stringify(data.mostUsedApps);
            });
          }
        } else {
          // Create new record
          await collection.create((record) => {
            record.date = data.date;
            record.totalFocusSeconds = data.totalFocusSeconds;
            record.sessionsCompleted = data.sessionsCompleted;
            record.sessionsAbandoned = data.sessionsAbandoned;
            record.totalInterruptions = data.totalInterruptions;
            record.longestStreakSeconds = data.longestStreakSeconds;
            record.appsOpenedCount = data.appsOpenedCount;
            record.mostUsedAppsRaw = JSON.stringify(data.mostUsedApps);
          });
        }
      }
    });
  }

  /**
   * Clear all stats (for testing or reset)
   */
  static async clearAllStats(): Promise<void> {
    const collection = database.collections.get<DailyStats>("daily_stats");
    const allStats = await collection.query().fetch();

    await database.write(async () => {
      await Promise.all(allStats.map((stat) => stat.markAsDeleted()));
    });
  }
}
