import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { schema } from "./schema";
import migrations from "./migrations";
import {
  Session,
  SessionEvent,
  DailyStats,
  AppUsage,
  BlockedApp,
  Setting,
  Task,
} from "./models";

/**
 * Database Configuration - Offline-first database instance
 * @see https://nozbe.github.io/WatermelonDB/Installation.html
 */

// Create adapter for SQLite with expo-sqlite driver
const adapter = new SQLiteAdapter({
  schema,
  migrations,
  // JSI disabled for compatibility with release builds on Samsung devices
  jsi: false,
  // Use expo-sqlite as the native driver for Expo apps
  dbName: "zen_mobile.db",
  onSetUpError: (error) => {
    console.error("WatermelonDB setup error:", error);
  },
});

// Create database instance
export const database = new Database({
  adapter,
  modelClasses: [
    Session,
    SessionEvent,
    DailyStats,
    AppUsage,
    BlockedApp,
    Setting,
    Task,
  ],
});

// Export collections for easy access
export const collections = {
  sessions: database.get<Session>("sessions"),
  sessionEvents: database.get<SessionEvent>("session_events"),
  dailyStats: database.get<DailyStats>("daily_stats"),
  appUsage: database.get<AppUsage>("app_usage"),
  blockedApps: database.get<BlockedApp>("blocked_apps"),
  settings: database.get<Setting>("settings"),
  tasks: database.get<Task>("tasks"),
};

/**
 * Helper to get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  const now = new Date();
  return now.toISOString().split("T")[0];
};

/**
 * Helper to get or create today's stats
 */
export const getTodayStats = async (): Promise<DailyStats> => {
  const today = getTodayDate();
  const { Q } = require("@nozbe/watermelondb");

  const existing = await collections.dailyStats
    .query(Q.where("date", today))
    .fetch();

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new daily stats for today
  return await database.write(async () => {
    return await collections.dailyStats.create((stats) => {
      stats.date = today;
      stats.totalFocusSeconds = 0;
      stats.sessionsCompleted = 0;
      stats.sessionsAbandoned = 0;
      stats.totalInterruptions = 0;
      stats.longestStreakSeconds = 0;
      stats.appsOpenedCount = 0;
      stats.mostUsedAppsRaw = JSON.stringify([]);
    });
  });
};

export default database;
