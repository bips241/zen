/**
 * Native Module Type Definitions
 * TypeScript interfaces for Android native modules
 */

import { NativeModules } from "react-native";

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
  hideSystemUI(): Promise<boolean>;
  showSystemUI(): Promise<boolean>;
  forceHideSystemBars(): Promise<boolean>;
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
  getAppUsageToday(): Promise<AppUsageStats[]>;
  getAppUsageForRange(
    startTimeMs: number,
    endTimeMs: number
  ): Promise<AppUsageStats[]>;
  getMostUsedApps(limit: number): Promise<AppUsageStats[]>;
  getScreenTimeToday(): Promise<ScreenTimeStats>;
  getAppUsageForPackage(packageName: string): Promise<AppUsageStats>;
  getWeeklyScreenTime(): Promise<any[]>;
  getCategorizedUsage(): Promise<any[]>;
  getHourlyBreakdown(): Promise<any[]>;
  getScreenUnlocksToday(): Promise<{ unlockCount: number }>;
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
  blockNotificationsFromApps(
    packageNames: string[]
  ): Promise<NotificationResult>;
  unblockNotificationsFromApps(
    packageNames: string[]
  ): Promise<NotificationResult>;
  clearBlockedNotifications(): Promise<NotificationResult>;
  hasNotificationListenerPermission(): Promise<PermissionCheckResult>;
  requestNotificationListenerPermission(): Promise<NotificationResult>;
  isNotificationBlockingEnabled(): Promise<{ enabled: boolean }>;
}

// ============================================================================
// DND (Do Not Disturb) Module
// ============================================================================

export interface DNDResult {
  success?: boolean;
  enabled?: boolean;
  message?: string;
}

interface DNDModule {
  isDNDEnabled(): Promise<boolean>;
  hasDNDPermission(): Promise<boolean>;
  requestDNDPermission(): Promise<boolean>;
  enableDND(): Promise<boolean>;
  disableDND(): Promise<boolean>;
  toggleDND(): Promise<DNDResult>;
}

// ============================================================================
// Overlay & Friction Moments Module
// ============================================================================

export interface OverlayPermissionResult {
  hasPermission: boolean;
}

export interface OverlayResult {
  success: boolean;
  enabled?: boolean;
  message?: string;
}

export interface FrictionConfigResult {
  success: boolean;
  delaySeconds: number;
  blockedAppsCount: number;
}

export interface UsageLimitResult {
  success: boolean;
  packageName: string;
  limitMinutes: number;
}

export interface UsageQueryResult {
  usageMinutes: number;
  packageName: string;
}

interface ZenOverlayModule {
  hasOverlayPermission(): Promise<OverlayPermissionResult>;
  requestOverlayPermission(): Promise<OverlayResult>;
  enableFrictionMoments(): Promise<OverlayResult>;
  disableFrictionMoments(): Promise<OverlayResult>;
  isFrictionEnabled(): Promise<{ enabled: boolean }>;
  configureFriction(
    delaySeconds: number,
    blockedApps: string[]
  ): Promise<FrictionConfigResult>;
  setUsageLimit(
    packageName: string,
    limitMinutes: number
  ): Promise<UsageLimitResult>;
  getCurrentUsage(packageName: string): Promise<UsageQueryResult>;
  resetTodayUsage(): Promise<OverlayResult>;
  getPendingFrictionTrigger(): Promise<{
    hasTrigger: boolean;
    packageName?: string;
    delaySeconds?: number;
    triggerTime?: number;
  }>;
}

// ============================================================================
// Focus Enforcement Module
// ============================================================================

interface FocusEnforcementModule {
  startEnforcement(
    blockedApps: string[],
    goalMinutes: number
  ): Promise<boolean>;
  stopEnforcement(): Promise<boolean>;
  isEnforcementActive(): Promise<boolean>;
  getBlockedPackages(): Promise<string[]>;
}

// ============================================================================
// Focus Notification Module
// ============================================================================

interface SuppressedNotification {
  packageName: string;
  appName: string;
  title: string;
  text: string;
  timestamp: number;
}

interface FocusNotificationModule {
  setFocusMode(
    enabled: boolean,
    suppressedPackages: string[]
  ): Promise<boolean>;
  isFocusModeActive(): Promise<boolean>;
  getSuppressedNotifications(): Promise<SuppressedNotification[]>;
  clearSuppressedNotifications(): Promise<boolean>;
  getSuppressedCount(): Promise<number>;
}

// ============================================================================
// Power Module
// ============================================================================

interface BatteryInfo {
  level: number;
  isCharging: boolean;
  status?: number;
  isFull?: boolean;
}

interface PowerStatus {
  batteryLevel: number;
  isCharging: boolean;
  isPowerSaveMode?: boolean;
  isScreenOn: boolean;
  isIgnoringBatteryOptimizations?: boolean;
  isDeviceIdleMode?: boolean;
}

interface PowerModule {
  getBatteryInfo(): Promise<BatteryInfo>;
  isIgnoringBatteryOptimizations(): Promise<boolean>;
  requestIgnoreBatteryOptimizations(): Promise<boolean>;
  isPowerSaveMode(): Promise<boolean>;
  isDeviceIdleMode(): Promise<boolean>;
  isScreenOn(): Promise<boolean>;
  getPowerStatus(): Promise<PowerStatus>;
}

// ============================================================================
// Wallpaper Module
// ============================================================================

interface WallpaperModule {
  setSolidColor(colorHex: string): Promise<boolean>;
  setWallpaperFromUri(imageUri: string): Promise<boolean>;
  clearWallpaper(): Promise<boolean>;
  isWallpaperSupported(): Promise<boolean>;
  isSetWallpaperAllowed(): Promise<boolean>;
  getDesiredMinimumWidth(): Promise<number>;
  getDesiredMinimumHeight(): Promise<number>;
  setBlackWallpaper(): Promise<boolean>;
  setDarkGrayWallpaper(): Promise<boolean>;
}

// ============================================================================
// Backup Module
// ============================================================================

interface BackupInfo {
  fileName: string;
  filePath: string;
  fileSize: number;
  lastModified: number;
  backupTimestamp?: number;
  appVersion?: string;
}

interface ExportResult {
  filePath: string;
  fileName: string;
  fileSize: number;
}

interface BackupModule {
  exportSettings(settings: any, backupName?: string): Promise<ExportResult>;
  importSettings(filePath: string): Promise<any>;
  listBackups(): Promise<BackupInfo[]>;
  deleteBackup(filePath: string): Promise<boolean>;
  getBackupDirectory(): Promise<string>;
  isExternalStorageAvailable(): Promise<boolean>;
}

// ============================================================================
// Gesture Module
// ============================================================================

interface GestureModule {
  initialize(): Promise<boolean>;
  configure(
    swipeThresholdPx: number,
    velocityThresholdPx: number
  ): Promise<boolean>;
  enableGestures(): Promise<boolean>;
  disableGestures(): Promise<boolean>;
  isEnabled(): Promise<boolean>;
  processTouchEvent(x: number, y: number, action: string): Promise<boolean>;
}

// ============================================================================
// Accessibility Module
// ============================================================================

interface AccessibilityModule {
  isAccessibilityServiceEnabled(): Promise<boolean>;
  requestAccessibilityPermission(): Promise<boolean>;
  setFocusMode(enabled: boolean, blockedPackages: string[]): Promise<boolean>;
  isFocusModeActive(): Promise<boolean>;
  getBlockedPackages(): Promise<string[]>;
}

// ============================================================================
// SystemUI Module
// ============================================================================

export interface SystemInsets {
  navBarBottom: number;
  navBarTop: number;
  navBarLeft: number;
  navBarRight: number;
  statusBarTop: number;
  systemBarsBottom: number;
  systemBarsTop: number;
  keyboardHeight: number;
  keyboardVisible: boolean;
  navBarVisible: boolean;
  statusBarVisible: boolean;
}

interface SystemUIModule {
  startMonitoring(): Promise<boolean>;
  stopMonitoring(): Promise<boolean>;
  getCurrentInsets(): Promise<SystemInsets>;
}

// ============================================================================
// Exports
// ============================================================================

const {
  ZenLauncher,
  AppBlocker,
  UsageStats,
  ZenNotification,
  DNDModule: DND,
  FocusEnforcement,
  FocusNotification,
  PowerModule: Power,
  WallpaperModule: Wallpaper,
  BackupModule: Backup,
  GestureModule: Gesture,
  AccessibilityModule: Accessibility,
  SystemUIModule: SystemUI,
} = NativeModules;

export const zenLauncher = ZenLauncher as ZenLauncherModule;
export const appBlocker = AppBlocker as AppBlockerModule;
export const usageStats = UsageStats as UsageStatsModule;
export const zenNotification = ZenNotification as ZenNotificationModule;
export const dndModule = DND as DNDModule;
export const systemUI = SystemUI as SystemUIModule;
export const focusEnforcement = FocusEnforcement as FocusEnforcementModule;
export const focusNotification = FocusNotification as FocusNotificationModule;
export const powerModule = Power as PowerModule;
export const wallpaperModule = Wallpaper as WallpaperModule;
export const backupModule = Backup as BackupModule;
export const gestureModule = Gesture as GestureModule;
export const accessibilityModule = Accessibility as AccessibilityModule;

const ZenOverlay = NativeModules.ZenOverlay || null;
export const overlayModule = ZenOverlay as ZenOverlayModule | null;

// Export types
export type {
  SuppressedNotification,
  BatteryInfo,
  PowerStatus,
  BackupInfo,
  ExportResult,
};

// Type guards
export const isNativeModuleAvailable = (moduleName: string): boolean => {
  return NativeModules[moduleName] !== undefined;
};

export const areAllModulesAvailable = (): boolean => {
  return (
    isNativeModuleAvailable("ZenLauncher") &&
    isNativeModuleAvailable("AppBlocker") &&
    isNativeModuleAvailable("UsageStats") &&
    isNativeModuleAvailable("ZenNotification") &&
    isNativeModuleAvailable("DNDModule") &&
    isNativeModuleAvailable("FocusEnforcement") &&
    isNativeModuleAvailable("FocusNotification") &&
    isNativeModuleAvailable("PowerModule") &&
    isNativeModuleAvailable("WallpaperModule") &&
    isNativeModuleAvailable("BackupModule") &&
    isNativeModuleAvailable("GestureModule") &&
    isNativeModuleAvailable("AccessibilityModule") &&
    isNativeModuleAvailable("ZenOverlay")
  );
};
