import { Model } from "@nozbe/watermelondb";
import { field, date, readonly } from "@nozbe/watermelondb/decorators";

/**
 * DailyStats Model - Aggregated daily statistics
 */
export default class DailyStats extends Model {
  static table = "daily_stats";

  @field("date") date!: string; // YYYY-MM-DD
  @field("total_focus_seconds") totalFocusSeconds!: number;
  @field("sessions_completed") sessionsCompleted!: number;
  @field("sessions_abandoned") sessionsAbandoned!: number;
  @field("total_interruptions") totalInterruptions!: number;
  @field("longest_streak_seconds") longestStreakSeconds!: number;
  @field("apps_opened_count") appsOpenedCount!: number;
  @field("most_used_apps") mostUsedAppsRaw!: string; // JSON array
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;

  get mostUsedApps(): string[] {
    try {
      return JSON.parse(this.mostUsedAppsRaw);
    } catch {
      return [];
    }
  }

  get totalFocusMinutes(): number {
    return Math.floor(this.totalFocusSeconds / 60);
  }

  get totalFocusHours(): number {
    return Math.floor(this.totalFocusSeconds / 3600);
  }

  get averageSessionMinutes(): number {
    const totalSessions = this.sessionsCompleted + this.sessionsAbandoned;
    if (totalSessions === 0) return 0;
    return Math.floor(this.totalFocusSeconds / 60 / totalSessions);
  }

  get completionRate(): number {
    const totalSessions = this.sessionsCompleted + this.sessionsAbandoned;
    if (totalSessions === 0) return 0;
    return (this.sessionsCompleted / totalSessions) * 100;
  }
}
