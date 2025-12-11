/**
 * Session Types
 * 
 * Type definitions for productivity sessions
 */

export type SessionStatus = 'idle' | 'active' | 'running' | 'paused' | 'break' | 'completed' | 'abandoned';

export interface Session {
  id: string;
  status: SessionStatus;
  startTime: Date;
  endTime?: Date;
  pauseTime?: Date;
  goalMinutes: number;
  actualMinutes: number;
  unlockCount: number;
  appSwitchCount: number;
  focusScore: number;
  blockedApps: string[];
  allowBreaks: boolean;
  rating?: number;
  notes?: string;
}

export interface SessionConfig {
  goalMinutes: number;
  blockApps?: string[];
  allowBreaks?: boolean;
  frictionSeconds?: number;
  theme?: 'default' | 'nature' | 'space';
}

export interface SessionStats {
  totalSessions: number;
  totalMinutes: number;
  averageFocusScore: number;
  currentStreak: number;
  longestStreak: number;
  todayMinutes: number;
  weekMinutes: number;
  monthMinutes: number;
}

export interface SessionEvent {
  type: 'started' | 'paused' | 'resumed' | 'completed' | 'tick';
  session: Session;
  timestamp: Date;
  data?: any;
}
