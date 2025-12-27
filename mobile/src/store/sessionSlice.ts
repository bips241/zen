/**
 * Session Store Slice
 *
 * Manages session state globally with database persistence
 */

import { StateCreator } from "zustand";
import { Session, SessionStatus } from "../types/session";
import { getTodayDateKey } from "../utils/dailyTracking";
import { DailyStatsService } from "../services/dailyStatsService";

export interface SessionSlice {
  // State
  currentSession: Session | null;
  sessions: Session[];

  // Stats
  todayMinutes: number;
  weekMinutes: number;
  currentStreak: number;
  longestStreak: number;
  lastRefreshDate: string; // ISO date string for tracking day changes
  dailyHistory: Record<string, number>; // date -> minutes map
  isHydrated: boolean; // Tracks if data has been loaded from DB

  // Actions
  setCurrentSession: (session: Session | null) => void;
  updateSessionStatus: (status: SessionStatus) => void;
  updateSessionMinutes: (minutes: number) => void;
  incrementUnlockCount: () => void;
  incrementAppSwitchCount: () => void;
  addSession: (session: Session) => void;
  updateStats: (stats: Partial<SessionSlice>) => void;
  addFocusMinutes: (minutes: number, refreshTime: string) => Promise<void>;
  checkAndResetDaily: (refreshTime: string) => Promise<void>;
  hydrateFromDatabase: (refreshTime: string) => Promise<void>;
}

export const createSessionSlice: StateCreator<SessionSlice> = (set, get) => ({
  // Initial State
  currentSession: null,
  sessions: [],
  todayMinutes: 0,
  weekMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastRefreshDate: getTodayDateKey("00:00"),
  dailyHistory: {},
  isHydrated: false,

  // Actions
  setCurrentSession: (session) => set({ currentSession: session }),

  updateSessionStatus: (status) =>
    set((state) => ({
      currentSession: state.currentSession
        ? { ...state.currentSession, status }
        : null,
    })),

  updateSessionMinutes: (minutes) =>
    set((state) => ({
      currentSession: state.currentSession
        ? { ...state.currentSession, actualMinutes: minutes }
        : null,
    })),

  incrementUnlockCount: () =>
    set((state) => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            unlockCount: state.currentSession.unlockCount + 1,
          }
        : null,
    })),

  incrementAppSwitchCount: () =>
    set((state) => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            appSwitchCount: state.currentSession.appSwitchCount + 1,
          }
        : null,
    })),

  addSession: (session) =>
    set((state) => ({
      sessions: [session, ...state.sessions],
    })),

  updateStats: (stats) =>
    set((state) => ({
      ...state,
      ...stats,
    })),

  /**
   * Hydrate store from database on app start
   */
  hydrateFromDatabase: async (refreshTime) => {
    console.log("[SessionSlice] Starting hydration from database...");
    try {
      const todayKey = getTodayDateKey(refreshTime);
      console.log("[SessionSlice] Today key:", todayKey);

      // Get today's stats
      const todayStats = await DailyStatsService.getTodayStats(refreshTime);
      console.log("[SessionSlice] Today stats:", {
        date: todayStats.date,
        totalFocusSeconds: todayStats.totalFocusSeconds,
        totalFocusMinutes: todayStats.totalFocusMinutes,
      });

      // Get history for past 30 days
      const history = await DailyStatsService.getTotalMinutesForPastDays(
        30,
        refreshTime
      );
      console.log(
        "[SessionSlice] Loaded history for",
        Object.keys(history).length,
        "days"
      );

      // Calculate streaks
      const streaks = await DailyStatsService.calculateStreak(refreshTime);
      console.log("[SessionSlice] Streaks:", streaks);

      // Get weekly total
      const weeklyTotal = await DailyStatsService.getWeeklyTotal(refreshTime);
      console.log("[SessionSlice] Weekly total:", weeklyTotal);

      set({
        todayMinutes: todayStats.totalFocusMinutes,
        weekMinutes: weeklyTotal,
        currentStreak: streaks.current,
        longestStreak: streaks.longest,
        lastRefreshDate: todayKey,
        dailyHistory: history,
        isHydrated: true,
      });

      console.log(
        "[SessionSlice] Hydration complete, store updated with todayMinutes:",
        todayStats.totalFocusMinutes
      );
    } catch (error) {
      console.error("[SessionSlice] Failed to hydrate from database:", error);
      set({ isHydrated: true }); // Mark as hydrated even on error to prevent blocking
    }
  },

  /**
   * Add focus minutes with database persistence
   */
  addFocusMinutes: async (minutes, refreshTime) => {
    const todayKey = getTodayDateKey(refreshTime);
    const state = get();
    const newTodayMinutes = state.todayMinutes + minutes;

    console.log("[SessionSlice] Adding focus minutes:", {
      minutes,
      currentTodayMinutes: state.todayMinutes,
      newTodayMinutes,
      todayKey,
      refreshTime,
    });

    // Update store immediately for responsive UI
    set({
      todayMinutes: newTodayMinutes,
      dailyHistory: {
        ...state.dailyHistory,
        [todayKey]: newTodayMinutes,
      },
    });

    console.log("[SessionSlice] Store updated, now persisting to DB...");

    // Persist to database
    try {
      await DailyStatsService.addFocusMinutes(minutes, refreshTime);
      console.log("[SessionSlice] Successfully persisted to database");
    } catch (error) {
      console.error("[SessionSlice] Failed to persist focus minutes:", error);
    }
  },

  /**
   * Check and reset daily progress with database persistence
   */
  checkAndResetDaily: async (refreshTime) => {
    const state = get();
    const todayKey = getTodayDateKey(refreshTime);

    // If the date has changed, reset today's minutes
    if (todayKey !== state.lastRefreshDate) {
      // Save yesterday's progress to history (already persisted in DB)
      const finalDailyHistory = {
        ...state.dailyHistory,
        [state.lastRefreshDate]: state.todayMinutes,
      };

      // Recalculate streaks from database
      try {
        const streaks = await DailyStatsService.calculateStreak(refreshTime);
        const weeklyTotal = await DailyStatsService.getWeeklyTotal(refreshTime);

        set({
          todayMinutes: 0,
          weekMinutes: weeklyTotal,
          lastRefreshDate: todayKey,
          dailyHistory: finalDailyHistory,
          currentStreak: streaks.current,
          longestStreak: streaks.longest,
        });
      } catch (error) {
        console.error("Failed to reset daily stats:", error);
      }
    }
  },
});
