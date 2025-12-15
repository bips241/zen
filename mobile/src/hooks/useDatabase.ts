/**
 * Custom Hooks - Database integration with React
 */

import { useEffect, useState } from "react";
import { Q } from "@nozbe/watermelondb";
import withObservables from "@nozbe/with-observables";
import { collections } from "@/database";
import Session from "@/database/models/Session";
import DailyStats from "@/database/models/DailyStats";
import {
  getCompletedSessions,
  getSessionsForDate,
  getStatsForLastDays,
  getCurrentStreak,
  getAverageSessionDuration,
  getCompletionRate,
} from "@/database/utils";

/**
 * Hook to observe active session
 */
export const useActiveSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const activeSessions = await collections.sessions
          .query(
            Q.where("status", "active"),
            Q.sortBy("created_at", Q.desc),
            Q.take(1)
          )
          .fetch();

        setSession(activeSessions.length > 0 ? activeSessions[0] : null);
      } catch (error) {
        console.error("[useActiveSession] Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActive();

    // Subscribe to changes
    const subscription = collections.sessions
      .query(Q.where("status", "active"))
      .observe()
      .subscribe((sessions) => {
        setSession(sessions.length > 0 ? sessions[0] : null);
      });

    return () => subscription.unsubscribe();
  }, []);

  return { session, loading };
};

/**
 * Hook to get recent sessions
 */
export const useRecentSessions = (limit: number = 10) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const recent = await collections.sessions
          .query(Q.sortBy("created_at", Q.desc), Q.take(limit))
          .fetch();

        setSessions(recent);
      } catch (error) {
        console.error("[useRecentSessions] Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();

    // Subscribe to changes
    const subscription = collections.sessions
      .query(Q.sortBy("created_at", Q.desc), Q.take(limit))
      .observe()
      .subscribe((sessions) => {
        setSessions(sessions);
      });

    return () => subscription.unsubscribe();
  }, [limit]);

  return { sessions, loading };
};

/**
 * Hook to get today's stats
 */
export const useTodayStats = () => {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    const fetchToday = async () => {
      try {
        const todayStats = await collections.dailyStats
          .query(Q.where("date", today))
          .fetch();

        setStats(todayStats.length > 0 ? todayStats[0] : null);
      } catch (error) {
        console.error("[useTodayStats] Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchToday();

    // Subscribe to changes
    const subscription = collections.dailyStats
      .query(Q.where("date", today))
      .observe()
      .subscribe((stats) => {
        setStats(stats.length > 0 ? stats[0] : null);
      });

    return () => subscription.unsubscribe();
  }, []);

  return { stats, loading };
};

/**
 * Hook to get weekly stats
 */
export const useWeeklyStats = () => {
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeekly = async () => {
      try {
        const weeklyStats = await getStatsForLastDays(7);
        setStats(weeklyStats);
      } catch (error) {
        console.error("[useWeeklyStats] Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeekly();
  }, []);

  const totalMinutes = Math.floor(
    stats.reduce((sum, stat) => sum + stat.totalFocusSeconds, 0) / 60
  );

  const totalSessions = stats.reduce(
    (sum, stat) => sum + stat.sessionsCompleted,
    0
  );

  return { stats, totalMinutes, totalSessions, loading };
};

/**
 * Hook to get completion statistics
 */
export const useCompletionStats = () => {
  const [stats, setStats] = useState({
    completionRate: 0,
    averageDuration: 0,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [rate, avgDuration, streak] = await Promise.all([
          getCompletionRate(),
          getAverageSessionDuration(),
          getCurrentStreak(),
        ]);

        setStats({
          completionRate: rate,
          averageDuration: avgDuration,
          currentStreak: streak,
        });
      } catch (error) {
        console.error("[useCompletionStats] Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { ...stats, loading };
};

/**
 * Hook to observe a specific session
 */
export const useSession = (sessionId: string | null) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setSession(null);
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const s = await collections.sessions.find(sessionId);
        setSession(s);
      } catch (error) {
        console.error("[useSession] Error:", error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  return { session, loading };
};

/**
 * Hook to get sessions for a specific date
 */
export const useSessionsForDate = (date: string) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const dateSessions = await getSessionsForDate(date);
        setSessions(dateSessions);
      } catch (error) {
        console.error("[useSessionsForDate] Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [date]);

  return { sessions, loading };
};
