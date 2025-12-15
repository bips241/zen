/**
 * Navigation Types
 *
 * Type-safe navigation parameters
 */

export type RootStackParamList = {
  Home: undefined;
  Dashboard: undefined;
  Settings: undefined;
  Session: {
    goalMinutes?: number;
  };
  SessionActive: {
    sessionId: string;
  };
  Profile: undefined;
  BlockList: undefined;
  Achievements: undefined;
};

export type NavigationScreen = keyof RootStackParamList;
