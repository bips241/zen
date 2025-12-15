import { appSchema, tableSchema } from "@nozbe/watermelondb";

/**
 * WatermelonDB Schema - Offline-first database structure
 * @see https://nozbe.github.io/WatermelonDB/Schema.html
 */
export const schema = appSchema({
  version: 1,
  tables: [
    // Focus Sessions
    tableSchema({
      name: "sessions",
      columns: [
        { name: "goal_minutes", type: "number" },
        { name: "elapsed_seconds", type: "number" },
        { name: "status", type: "string" }, // 'active', 'paused', 'completed', 'abandoned'
        { name: "started_at", type: "number" }, // Unix timestamp
        { name: "paused_at", type: "number", isOptional: true },
        { name: "resumed_at", type: "number", isOptional: true },
        { name: "completed_at", type: "number", isOptional: true },
        { name: "interrupted_count", type: "number" },
        { name: "blocked_apps", type: "string" }, // JSON array of package names
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),

    // Session Events (for detailed analytics)
    tableSchema({
      name: "session_events",
      columns: [
        { name: "session_id", type: "string", isIndexed: true },
        { name: "event_type", type: "string" }, // 'start', 'pause', 'resume', 'interrupt', 'complete', 'abandon'
        { name: "timestamp", type: "number" },
        { name: "metadata", type: "string", isOptional: true }, // JSON for additional data
        { name: "created_at", type: "number" },
      ],
    }),

    // Daily Statistics (aggregated data)
    tableSchema({
      name: "daily_stats",
      columns: [
        { name: "date", type: "string", isIndexed: true }, // YYYY-MM-DD format
        { name: "total_focus_seconds", type: "number" },
        { name: "sessions_completed", type: "number" },
        { name: "sessions_abandoned", type: "number" },
        { name: "total_interruptions", type: "number" },
        { name: "longest_streak_seconds", type: "number" },
        { name: "apps_opened_count", type: "number" },
        { name: "most_used_apps", type: "string" }, // JSON array
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),

    // App Usage Tracking
    tableSchema({
      name: "app_usage",
      columns: [
        { name: "package_name", type: "string", isIndexed: true },
        { name: "app_name", type: "string" },
        { name: "date", type: "string", isIndexed: true }, // YYYY-MM-DD
        { name: "total_time_seconds", type: "number" },
        { name: "open_count", type: "number" },
        { name: "last_opened_at", type: "number" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),

    // User Settings & Preferences
    tableSchema({
      name: "settings",
      columns: [
        { name: "key", type: "string", isIndexed: true },
        { name: "value", type: "string" }, // JSON serialized value
        { name: "updated_at", type: "number" },
      ],
    }),

    // Blocked Apps Configuration
    tableSchema({
      name: "blocked_apps",
      columns: [
        { name: "package_name", type: "string", isIndexed: true },
        { name: "app_name", type: "string" },
        { name: "icon_uri", type: "string", isOptional: true },
        { name: "is_blocked", type: "boolean" },
        { name: "block_mode", type: "string" }, // 'always', 'during_session', 'scheduled'
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
  ],
});
