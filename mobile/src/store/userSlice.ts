/**
 * User Store Slice
 * 
 * Manages user preferences and profile
 */

import { StateCreator } from 'zustand';
import { User, UserPreferences } from '@/types/user';

export interface UserSlice {
  // State
  user: User | null;
  preferences: UserPreferences;
  
  // Actions
  setUser: (user: User) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateDailyGoal: (minutes: number) => void;
  toggleHaptics: () => void;
  toggleSounds: () => void;
  addBlockedApp: (packageName: string) => void;
  removeBlockedApp: (packageName: string) => void;
}

const defaultPreferences: UserPreferences = {
  dailyGoalMinutes: 120, // 2 hours
  theme: 'default',
  enableHaptics: true,
  enableSounds: true,
  breakReminderEnabled: true,
  breakReminderMinutes: 25,
  pomodoroLength: 25,
  shortBreakLength: 5,
  longBreakLength: 15,
  blockListApps: [],
  allowEmergencyApps: ['com.android.phone', 'com.android.contacts'],
  frictionSeconds: 5,
};

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  // Initial State
  user: null,
  preferences: defaultPreferences,
  
  // Actions
  setUser: (user) =>
    set({ user }),
  
  updatePreferences: (newPreferences) =>
    set((state) => ({
      preferences: { ...state.preferences, ...newPreferences },
    })),
  
  updateDailyGoal: (minutes) =>
    set((state) => ({
      preferences: { ...state.preferences, dailyGoalMinutes: minutes },
    })),
  
  toggleHaptics: () =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        enableHaptics: !state.preferences.enableHaptics,
      },
    })),
  
  toggleSounds: () =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        enableSounds: !state.preferences.enableSounds,
      },
    })),
  
  addBlockedApp: (packageName) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        blockListApps: [...state.preferences.blockListApps, packageName],
      },
    })),
  
  removeBlockedApp: (packageName) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        blockListApps: state.preferences.blockListApps.filter(
          (app) => app !== packageName
        ),
      },
    })),
});
