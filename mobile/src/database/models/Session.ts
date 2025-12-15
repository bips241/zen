import { Model } from "@nozbe/watermelondb";
import {
  field,
  date,
  readonly,
  children,
} from "@nozbe/watermelondb/decorators";
import { SessionStatus } from "@/types";

/**
 * Session Model - Focus session data
 */
export default class Session extends Model {
  static table = "sessions";
  static associations = {
    session_events: { type: "has_many", foreignKey: "session_id" },
  } as const;

  @field("goal_minutes") goalMinutes!: number;
  @field("elapsed_seconds") elapsedSeconds!: number;
  @field("status") status!: SessionStatus;
  @field("started_at") startedAt!: number;
  @field("paused_at") pausedAt?: number;
  @field("resumed_at") resumedAt?: number;
  @field("completed_at") completedAt?: number;
  @field("interrupted_count") interruptedCount!: number;
  @field("blocked_apps") blockedAppsRaw!: string; // JSON array
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;

  @children("session_events") events: any;

  // Getters for computed properties
  get blockedApps(): string[] {
    try {
      return JSON.parse(this.blockedAppsRaw);
    } catch {
      return [];
    }
  }

  get duration(): number {
    return this.elapsedSeconds;
  }

  get isActive(): boolean {
    return this.status === "active";
  }

  get isPaused(): boolean {
    return this.status === "paused";
  }

  get isCompleted(): boolean {
    return this.status === "completed";
  }

  get progressPercent(): number {
    const goalSeconds = this.goalMinutes * 60;
    return Math.min((this.elapsedSeconds / goalSeconds) * 100, 100);
  }

  get remainingSeconds(): number {
    return Math.max(this.goalMinutes * 60 - this.elapsedSeconds, 0);
  }
}
