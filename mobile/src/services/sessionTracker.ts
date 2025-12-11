/**
 * Session Tracker Service - Offline-first with WatermelonDB
 * 
 * Manages focus session lifecycle with database persistence
 */

import { SessionConfig, SessionStatus } from '@/types';
import { useStore } from '@/store';
import { database, collections, getTodayStats } from '@/database';
import Session from '@/database/models/Session';
import { Q } from '@nozbe/watermelondb';

class SessionTrackerService {
  private timer: NodeJS.Timeout | null = null;
  private currentSessionId: string | null = null;
  private sessionStartTime: number | null = null;

  /**
   * Start a new focus session
   */
  async startSession(config: SessionConfig): Promise<Session> {
    if (!config.goalMinutes || config.goalMinutes < 1) {
      throw new Error('Invalid goal minutes');
    }

    // Create session in database
    const session = await database.write(async () => {
      const newSession = await collections.sessions.create((s) => {
        s.goalMinutes = config.goalMinutes;
        s.elapsedSeconds = 0;
        s.status = 'active';
        s.startedAt = Date.now();
        s.interruptedCount = 0;
        s.blockedAppsRaw = JSON.stringify(config.blockApps || []);
      });

      // Create start event
      await collections.sessionEvents.create((event) => {
        event.sessionId = newSession.id;
        event.eventType = 'start';
        event.timestamp = Date.now();
      });

      return newSession;
    });

    this.currentSessionId = session.id;
    this.sessionStartTime = session.startedAt;
    
    // Update store
    useStore.getState().setCurrentSession({
      id: session.id,
      status: 'running',
      startTime: new Date(session.startedAt),
      goalMinutes: session.goalMinutes,
      actualMinutes: 0,
      unlockCount: 0,
      appSwitchCount: 0,
      focusScore: 100,
      blockedApps: session.blockedApps,
      allowBreaks: false,
    });

    this.startTimer(session);

    console.log('[SessionTracker] Session started:', session.id);
    return session;
  }

  /**
   * Pause current session
   */
  async pauseSession(): Promise<void> {
    if (!this.currentSessionId) {
      throw new Error('No active session to pause');
    }

    const session = await collections.sessions.find(this.currentSessionId);

    await database.write(async () => {
      await session.update((s) => {
        s.status = 'paused';
        s.pausedAt = Date.now();
      });

      // Create pause event
      await collections.sessionEvents.create((event) => {
        event.sessionId = session.id;
        event.eventType = 'pause';
        event.timestamp = Date.now();
      });
    });

    this.stopTimer();
    useStore.getState().updateSessionStatus('paused');
  }

  /**
   * Resume paused session
   */
  async resumeSession(): Promise<void> {
    if (!this.currentSessionId) {
      throw new Error('No session to resume');
    }

    const session = await collections.sessions.find(this.currentSessionId);

    await database.write(async () => {
      await session.update((s) => {
        s.status = 'active';
        s.resumedAt = Date.now();
      });

      // Create resume event
      await collections.sessionEvents.create((event) => {
        event.sessionId = session.id;
        event.eventType = 'resume';
        event.timestamp = Date.now();
      });
    });

    useStore.getState().updateSessionStatus('running');
    this.startTimer(session);
  }

  /**
   * End current session
   */
  async endSession(completed: boolean = true): Promise<Session> {
    if (!this.currentSessionId) {
      throw new Error('No active session to end');
    }

    const session = await collections.sessions.find(this.currentSessionId);
    this.stopTimer();

    await database.write(async () => {
      await session.update((s) => {
        s.status = completed ? 'completed' : 'abandoned';
        s.completedAt = Date.now();
      });

      // Create complete/abandon event
      await collections.sessionEvents.create((event) => {
        event.sessionId = session.id;
        event.eventType = completed ? 'complete' : 'abandon';
        event.timestamp = Date.now();
      });
    });

    // Update daily stats
    await this.updateDailyStats(session, completed);

    // Clear current session
    this.currentSessionId = null;
    this.sessionStartTime = null;
    useStore.getState().setCurrentSession(null);

    console.log('[SessionTracker] Session ended:', session.id, 'completed:', completed);
    return session;
  }

  /**
   * Record an interruption
   */
  async recordInterruption(metadata?: Record<string, any>): Promise<void> {
    if (!this.currentSessionId) return;

    const session = await collections.sessions.find(this.currentSessionId);

    await database.write(async () => {
      await session.update((s) => {
        s.interruptedCount += 1;
      });

      await collections.sessionEvents.create((event) => {
        event.sessionId = session.id;
        event.eventType = 'interrupt';
        event.timestamp = Date.now();
        event.metadataRaw = metadata ? JSON.stringify(metadata) : undefined;
      });
    });

    // Update store
    const storeSession = useStore.getState().currentSession;
    if (storeSession) {
      useStore.getState().setCurrentSession({
        ...storeSession,
        unlockCount: session.interruptedCount,
      });
    }
  }

  /**
   * Get active session if exists
   */
  async getActiveSession(): Promise<Session | null> {
    const activeSessions = await collections.sessions
      .query(
        Q.where('status', 'active'),
        Q.sortBy('created_at', Q.desc),
        Q.take(1)
      )
      .fetch();

    return activeSessions.length > 0 ? activeSessions[0] : null;
  }

  /**
   * Get recent sessions
   */
  async getRecentSessions(limit: number = 10): Promise<Session[]> {
    return await collections.sessions
      .query(Q.sortBy('created_at', Q.desc), Q.take(limit))
      .fetch();
  }

  private startTimer(session: Session): void {
    this.timer = setInterval(async () => {
      if (!this.currentSessionId || !this.sessionStartTime) return;

      const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);

      // Update database every second
      await database.write(async () => {
        await session.update((s) => {
          s.elapsedSeconds = elapsed;
        });
      });

      // Update store
      const storeSession = useStore.getState().currentSession;
      if (storeSession) {
        useStore.getState().setCurrentSession({
          ...storeSession,
          actualMinutes: Math.floor(elapsed / 60),
        });
      }

      // Auto-complete if goal reached
      if (elapsed >= session.goalMinutes * 60) {
        await this.endSession(true);
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async updateDailyStats(
    session: Session,
    completed: boolean
  ): Promise<void> {
    const todayStats = await getTodayStats();

    await database.write(async () => {
      await todayStats.update((stats) => {
        stats.totalFocusSeconds += session.elapsedSeconds;
        
        if (completed) {
          stats.sessionsCompleted += 1;
        } else {
          stats.sessionsAbandoned += 1;
        }

        stats.totalInterruptions += session.interruptedCount;

        // Update longest streak
        if (session.elapsedSeconds > stats.longestStreakSeconds) {
          stats.longestStreakSeconds = session.elapsedSeconds;
        }
      });
    });
  }
}

export const sessionTracker = new SessionTrackerService();
export default sessionTracker;
