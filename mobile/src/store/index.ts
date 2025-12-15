/**
 * Zustand Store
 *
 * Global state management with Zustand
 *
 * Usage:
 * const session = useStore(state => state.currentSession);
 * const startSession = useStore(state => state.setCurrentSession);
 */

import { create } from "zustand";
import { createSessionSlice, SessionSlice } from "./sessionSlice";
import { createUserSlice, UserSlice } from "./userSlice";

type StoreState = SessionSlice & UserSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createSessionSlice(...a),
  ...createUserSlice(...a),
}));

// Selector hooks for performance
export const useCurrentSession = () =>
  useStore((state) => state.currentSession);
export const usePreferences = () => useStore((state) => state.preferences);
export const useTodayMinutes = () => useStore((state) => state.todayMinutes);
export const useCurrentStreak = () => useStore((state) => state.currentStreak);
