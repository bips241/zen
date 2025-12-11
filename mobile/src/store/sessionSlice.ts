/**
 * Session Store Slice
 * 
 * Manages session state globally
 */

import { StateCreator } from 'zustand';
import { Session, SessionStatus } from '../types/session';

export interface SessionSlice {
  // State
  currentSession: Session | null;
  sessions: Session[];
  
  // Stats
  todayMinutes: number;
  weekMinutes: number;
  currentStreak: number;
  longestStreak: number;
  
  // Actions
  setCurrentSession: (session: Session | null) => void;
  updateSessionStatus: (status: SessionStatus) => void;
  updateSessionMinutes: (minutes: number) => void;
  incrementUnlockCount: () => void;
  incrementAppSwitchCount: () => void;
  addSession: (session: Session) => void;
  updateStats: (stats: Partial<SessionSlice>) => void;
}

export const createSessionSlice: StateCreator<SessionSlice> = (set) => ({
  // Initial State
  currentSession: null,
  sessions: [],
  todayMinutes: 0,
  weekMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  
  // Actions
  setCurrentSession: (session) =>
    set({ currentSession: session }),
  
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
});
