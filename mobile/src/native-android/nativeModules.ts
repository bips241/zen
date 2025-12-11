/**
 * Native Module Type Definitions
 * TypeScript interfaces for Android native modules
 */

import { NativeModules } from 'react-native';

// ============================================================================
// ZenLauncher Module
// ============================================================================

export interface LauncherInfo {
  isDefault: boolean;
  currentLauncher: string;
}

export interface LauncherResult {
  success: boolean;
  message?: string;
}

export interface InstalledApp {
  packageName: string;
  appName: string;
  activityName: string;
  icon: string; // Base64 encoded image
  isSystemApp: boolean;
}

export interface AppLaunchResult {
  success: boolean;
  packageName: string;
}

export interface AppRunningInfo {
  isRunning: boolean;
  packageName: string;
}

interface ZenLauncherModule {
  isDefaultLauncher(): Promise<LauncherInfo>;
  requestSetAsDefaultLauncher(): Promise<LauncherResult>;
  getInstalledApps(): Promise<InstalledApp[]>;
  launchApp(packageName: string): Promise<AppLaunchResult>;
  isAppRunning(packageName: string): Promise<AppRunningInfo>;
  openHomeSettings(): Promise<LauncherResult>;
}

// ============================================================================
// AppBlocker Module
// ============================================================================

export interface BlockResult {
  success: boolean;
  blockedCount?: number;
  unblockedCount?: number;
}

export interface BlockCheckResult {
  isBlocked: boolean;
  packageName: string;
}

export interface ForegroundAppInfo {
  packageName: string;
  isBlocked: boolean;
}

interface AppBlockerModule {
  blockApps(packageNames: string[]): Promise<BlockResult>;
  unblockApps(packageNames: string[]): Promise<BlockResult>;
  unblockAllApps(): Promise<BlockResult>;
  isAppBlocked(packageName: string): Promise<BlockCheckResult>;
  getForegroundApp(): Promise<ForegroundAppInfo>;
  hasUsageStatsPermission(): Promise<{ hasPermission: boolean }>;
  requestUsageStatsPermission(): Promise<LauncherResult>;
  bringLauncherToForeground(): Promise<LauncherResult>;
}

// ============================================================================
// UsageStats Module
// ============================================================================

export interface AppUsageStats {
  packageName: string;
  appName: string;
  totalTimeMs: number;
  totalTimeMinutes: number;
  firstTimeStamp?: number;
  lastTimeUsed: number;
  lastTimeVisible?: number;
  isSystemApp?: boolean;
}

export interface ScreenTimeStats {
  totalTimeMs: number;
  totalTimeMinutes: number;
  totalTimeHours: number;
}

interface UsageStatsModule {
  getTodayUsage(): Promise<AppUsageStats[]>;
  getUsageInRange(startTimeMs: number, endTimeMs: number): Promise<AppUsageStats[]>;
  getMostUsedApps(limit: number): Promise<AppUsageStats[]>;
  getTotalScreenTime(): Promise<ScreenTimeStats>;
}

// ============================================================================
// Notification Module
// ============================================================================

export interface NotificationResult {
  success: boolean;
  enabled?: boolean;
  blockedCount?: number;
  unblockedCount?: number;
  message?: string;
}

export interface PermissionCheckResult {
  hasPermission: boolean;
}

interface ZenNotificationModule {
  enableNotificationBlocking(): Promise<NotificationResult>;
  disableNotificationBlocking(): Promise<NotificationResult>;
  blockNotificationsFromApps(packageNames: string[]): Promise<NotificationResult>;
  unblockNotificationsFromApps(packageNames: string[]): Promise<NotificationResult>;
  clearBlockedNotifications(): Promise<NotificationResult>;
  hasNotificationListenerPermission(): Promise<PermissionCheckResult>;
  requestNotificationListenerPermission(): Promise<NotificationResult>;
  isNotificationBlockingEnabled(): Promise<{ enabled: boolean }>;
}

// ============================================================================
// Exports
// ============================================================================

const { ZenLauncher, AppBlocker, UsageStats, ZenNotification } = NativeModules;

export const zenLauncher = ZenLauncher as ZenLauncherModule;
export const appBlocker = AppBlocker as AppBlockerModule;
export const usageStats = UsageStats as UsageStatsModule;
export const zenNotification = ZenNotification as ZenNotificationModule;

// Type guards
export const isNativeModuleAvailable = (moduleName: string): boolean => {
  return NativeModules[moduleName] !== undefined;
};

export const areAllModulesAvailable = (): boolean => {
  return (
    isNativeModuleAvailable('ZenLauncher') &&
    isNativeModuleAvailable('AppBlocker') &&
    isNativeModuleAvailable('UsageStats') &&
    isNativeModuleAvailable('ZenNotification')
  );
};
