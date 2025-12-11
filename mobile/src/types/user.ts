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
  theme: 'default' | 'nature' | 'space';
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
