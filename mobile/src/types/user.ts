/**
 * User Types
 *
 * Type definitions for user data and preferences
 */

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  createdAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  dailyGoalMinutes: number;
  theme: "default" | "nature" | "space";
  enableHaptics: boolean;
  enableSounds: boolean;
  breakReminderEnabled: boolean;
  breakReminderMinutes: number;
  pomodoroLength: number;
  shortBreakLength: number;
  longBreakLength: number;
  blockListApps: string[];
  allowEmergencyApps: string[];
  frictionSeconds: number;
  dayRefreshTime: string; // "HH:MM" format, e.g., "00:00" for midnight
}

export interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  averageFocusScore: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  totalCoins: number;
  achievements: string[];
}
