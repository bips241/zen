/**
 * Native Bridge Service
 *
 * TypeScript wrappers for native Android functionality
 * Provides type-safe access to all native modules
 */

import { Platform } from "react-native";
import {
  zenLauncher,
  appBlocker,
  usageStats,
  zenNotification,
  dndModule,
  focusEnforcement,
  focusNotification,
  powerModule,
  wallpaperModule,
  backupModule,
  gestureModule,
  accessibilityModule,
  isNativeModuleAvailable,
  InstalledApp,
  AppUsageStats,
  SuppressedNotification,
  BatteryInfo,
  PowerStatus,
  BackupInfo,
  ExportResult,
} from "@/native-android/nativeModules";

export type {
  SuppressedNotification,
  BatteryInfo,
  PowerStatus,
  BackupInfo,
  ExportResult,
};

// ============================================================================
// Launcher Module
// ============================================================================

export const launcher = {
  /**
   * Check if this app is the default launcher
   */
  async isDefault(): Promise<boolean> {
    if (Platform.OS !== "android") return false;
    if (!isNativeModuleAvailable("ZenLauncher")) return false;

    try {
      const result = await zenLauncher.isDefaultLauncher();
      return result.isDefault;
    } catch (error) {
      console.error("[launcher] Error checking default status:", error);
      return false;
    }
  },

  /**
   * Request to set this app as default launcher
   */
  async setAsDefault(): Promise<{ success: boolean; error?: string }> {
    if (Platform.OS !== "android") {
      return { success: false, error: "Only available on Android" };
    }

    if (!isNativeModuleAvailable("ZenLauncher")) {
      return { success: false, error: "Native module not available" };
    }

    try {
      const result = await zenLauncher.requestSetAsDefaultLauncher();
      return { success: result.success, error: result.message };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  /**
   * Hide system UI (status bar and navigation buttons)
   */
  async hideSystemUI(): Promise<boolean> {
    if (Platform.OS !== "android") return false;
    if (!isNativeModuleAvailable("ZenLauncher")) return false;

    try {
      await zenLauncher.hideSystemUI();
      return true;
    } catch (error) {
      console.error("[launcher] Error hiding system UI:", error);
      return false;
    }
  },

  /**
   * Show system UI (status bar and navigation buttons)
   */
  async showSystemUI(): Promise<boolean> {
    if (Platform.OS !== "android") return false;
    if (!isNativeModuleAvailable("ZenLauncher")) return false;

    try {
      await zenLauncher.showSystemUI();
      return true;
    } catch (error) {
      console.error("[launcher] Error showing system UI:", error);
      return false;
    }
  },

  /**
   * Open Android home settings
   */
  async openHomeSettings(): Promise<{ success: boolean }> {
    if (Platform.OS !== "android") return { success: false };

    try {
      await zenLauncher.openHomeSettings();
      return { success: true };
    } catch (error) {
      console.error("[launcher] Error opening home settings:", error);
      return { success: false };
    }
  },

  /**
   * Get all installed apps - OPTIMIZED (without icons)
   * Icons loaded separately for instant performance
   */
  async getInstalledApps(): Promise<InstalledApp[]> {
    if (Platform.OS !== "android") return [];
    if (!isNativeModuleAvailable("ZenLauncher")) return [];

    try {
      return await zenLauncher.getInstalledApps();
    } catch (error) {
      console.error("[launcher] Error getting installed apps:", error);
      return [];
    }
  },

  /**
   * Get app icons in batch - OPTIMIZED with native caching
   * Fetches icons only when needed
   */
  async getAppIconsBatch(
    packageNames: string[],
  ): Promise<Record<string, string>> {
    if (Platform.OS !== "android") return {};
    if (!isNativeModuleAvailable("ZenLauncher")) return {};

    try {
      return await zenLauncher.getAppIconsBatch(packageNames);
    } catch (error) {
      console.error("[launcher] Error getting app icons batch:", error);
      return {};
    }
  },

  /**
   * Clear native icon cache to free memory
   */
  async clearIconCache(): Promise<boolean> {
    if (Platform.OS !== "android") return false;
    if (!isNativeModuleAvailable("ZenLauncher")) return false;

    try {
      return await zenLauncher.clearIconCache();
    } catch (error) {
      console.error("[launcher] Error clearing icon cache:", error);
      return false;
    }
  },

  /**
   * Launch an app by package name or intent URI
   */
  async launchApp(packageName: string): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      // Handle intent URIs (tel:, sms:, phone:, etc.)
      if (packageName.startsWith("intent:")) {
        const { Linking } = await import("react-native");
        const intentType = packageName.replace("intent:", "");
        const intentUrl = `${intentType}:`;
        const canOpen = await Linking.canOpenURL(intentUrl);
        if (canOpen) {
          await Linking.openURL(intentUrl);
          return true;
        }
        return false;
      }

      // Standard package name launch
      const result = await zenLauncher.launchApp(packageName);
      return result.success;
    } catch (error) {
      console.error("[launcher] Error launching app:", error);
      return false;
    }
  },

  /**
   * Check if an app is installed by package name
   */
  async isAppInstalled(packageName: string): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      const installed = await zenLauncher.isAppInstalled(packageName);
      return installed;
    } catch (error) {
      console.error("[launcher] Error checking app installation:", error);
      return false;
    }
  },

  /**
   * Check if an app is running
   */
  async isAppRunning(packageName: string): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      const result = await zenLauncher.isAppRunning(packageName);
      return result.isRunning;
    } catch (error) {
      console.error("[launcher] Error checking app running:", error);
      return false;
    }
  },

  /**
   * Start listening for screen on/off events
   */
  async startScreenListener(): Promise<boolean> {
    if (Platform.OS !== "android") return false;
    if (!isNativeModuleAvailable("ZenLauncher")) return false;

    try {
      return await zenLauncher.startScreenListener();
    } catch (error) {
      console.error("[launcher] Error starting screen listener:", error);
      return false;
    }
  },

  /**
   * Stop listening for screen on/off events
   */
  async stopScreenListener(): Promise<boolean> {
    if (Platform.OS !== "android") return false;
    if (!isNativeModuleAvailable("ZenLauncher")) return false;

    try {
      return await zenLauncher.stopScreenListener();
    } catch (error) {
      console.error("[launcher] Error stopping screen listener:", error);
      return false;
    }
  },
};

// ============================================================================
// App Blocker Module
// ============================================================================

export const blocker = {
  /**
   * Block specific apps from launching
   */
  async blockApps(packageNames: string[]): Promise<boolean> {
    if (Platform.OS !== "android") return false;
    if (!isNativeModuleAvailable("AppBlocker")) return false;

    try {
      const result = await appBlocker.blockApps(packageNames);
      return result.success;
    } catch (error) {
      console.error("[blocker] Error blocking apps:", error);
      return false;
    }
  },

  /**
   * Unblock specific apps
   */
  async unblockApps(packageNames: string[]): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      const result = await appBlocker.unblockApps(packageNames);
      return result.success;
    } catch (error) {
      console.error("[blocker] Error unblocking apps:", error);
      return false;
    }
  },

  /**
   * Unblock all apps
   */
  async unblockAll(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      const result = await appBlocker.unblockAllApps();
      return result.success;
    } catch (error) {
      console.error("[blocker] Error unblocking all apps:", error);
      return false;
    }
  },

  /**
   * Check if an app is blocked
   */
  async isBlocked(packageName: string): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      const result = await appBlocker.isAppBlocked(packageName);
      return result.isBlocked;
    } catch (error) {
      console.error("[blocker] Error checking if app is blocked:", error);
      return false;
    }
  },

  /**
   * Get currently foreground app
   */
  async getForegroundApp(): Promise<string | null> {
    if (Platform.OS !== "android") return null;

    try {
      const result = await appBlocker.getForegroundApp();
      return result.packageName || null;
    } catch (error) {
      console.error("[blocker] Error getting foreground app:", error);
      return null;
    }
  },

  /**
   * Check if has usage stats permission
   */
  async hasUsageStatsPermission(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      const result = await appBlocker.hasUsageStatsPermission();
      return result.hasPermission;
    } catch (error) {
      console.error("[blocker] Error checking usage stats permission:", error);
      return false;
    }
  },

  /**
   * Request usage stats permission
   */
  async requestUsageStatsPermission(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      const result = await appBlocker.requestUsageStatsPermission();
      return result.success;
    } catch (error) {
      console.error(
        "[blocker] Error requesting usage stats permission:",
        error,
      );
      return false;
    }
  },
};

// ============================================================================
// Usage Stats Module
// ============================================================================

export const usage = {
  /**
   * Get app usage stats for today
   */
  async getTodayUsage(): Promise<AppUsageStats[]> {
    if (Platform.OS !== "android") return [];
    if (!isNativeModuleAvailable("UsageStats")) return [];
    if (!usageStats) return [];

    try {
      return await usageStats.getAppUsageToday();
    } catch (error) {
      console.error("[usage] Error getting today usage:", error);
      return [];
    }
  },

  /**
   * Get app usage stats for date range
   */
  async getUsageInRange(
    startTime: Date,
    endTime: Date,
  ): Promise<AppUsageStats[]> {
    if (Platform.OS !== "android") return [];

    try {
      return await usageStats.getAppUsageForRange(
        startTime.getTime(),
        endTime.getTime(),
      );
    } catch (error) {
      console.error("[usage] Error getting usage in range:", error);
      return [];
    }
  },

  /**
   * Get most used apps
   */
  async getMostUsedApps(limit: number = 10): Promise<AppUsageStats[]> {
    if (Platform.OS !== "android") return [];

    try {
      return await usageStats.getMostUsedApps(limit);
    } catch (error) {
      console.error("[usage] Error getting most used apps:", error);
      return [];
    }
  },

  /**
   * Get total screen time for today
   */
  async getTotalScreenTime(): Promise<number> {
    if (Platform.OS !== "android") return 0;

    try {
      const result = await usageStats.getScreenTimeToday();
      return result.totalTimeMinutes;
    } catch (error) {
      console.error("[usage] Error getting total screen time:", error);
      return 0;
    }
  },
};

// ============================================================================
// Notification Module
// ============================================================================

export const notifications = {
  /**
   * Enable notification blocking
   */
  async enable(): Promise<boolean> {
    if (Platform.OS !== "android") return false;
    if (!isNativeModuleAvailable("ZenNotification")) return false;

    try {
      const result = await zenNotification.enableNotificationBlocking();
      return result.success;
    } catch (error) {
      console.error("[notifications] Error enabling blocking:", error);
      return false;
    }
  },

  /**
   * Disable notification blocking
   */
  async disable(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      const result = await zenNotification.disableNotificationBlocking();
      return result.success;
    } catch (error) {
      console.error("[notifications] Error disabling blocking:", error);
      return false;
    }
  },

  /**
   * Block notifications from specific apps
   */
  async blockFromApps(packageNames: string[]): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      const result = await zenNotification.blockNotificationsFromApps(
        packageNames,
      );
      return result.success;
    } catch (error) {
      console.error("[notifications] Error blocking notifications:", error);
      return false;
    }
  },

  /**
   * Unblock notifications from specific apps
   */
  async unblockFromApps(packageNames: string[]): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      const result = await zenNotification.unblockNotificationsFromApps(
        packageNames,
      );
      return result.success;
    } catch (error) {
      console.error("[notifications] Error unblocking notifications:", error);
      return false;
    }
  },

  /**
   * Check if notification listener permission is granted
   */
  async hasPermission(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      const result = await zenNotification.hasNotificationListenerPermission();
      return result.hasPermission;
    } catch (error) {
      console.error("[notifications] Error checking permission:", error);
      return false;
    }
  },

  /**
   * Request notification listener permission
   */
  async requestPermission(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      const result =
        await zenNotification.requestNotificationListenerPermission();
      return result.success;
    } catch (error) {
      console.error("[notifications] Error requesting permission:", error);
      return false;
    }
  },

  /**
   * Check if notification blocking is enabled
   */
  async isEnabled(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      const result = await zenNotification.isNotificationBlockingEnabled();
      return result.enabled;
    } catch (error) {
      console.error("[notifications] Error checking if enabled:", error);
      return false;
    }
  },
};

/**
 * ================================================
 * DND (Do Not Disturb) Control
 * ================================================
 * System-level DND mode management
 */
export const dnd = {
  /**
   * Toggle DND mode on/off
   * @returns true if DND is now enabled
   */
  async toggle(): Promise<boolean> {
    if (Platform.OS !== "android") {
      console.warn("[dnd] DND control only available on Android");
      return false;
    }

    try {
      const result = await dndModule.toggleDND();
      console.log(
        `[dnd] Toggle successful - DND is now ${result.enabled ? "ON" : "OFF"}`,
      );
      return result.enabled ?? false;
    } catch (error) {
      console.error("[dnd] Error toggling DND:", error);
      return false;
    }
  },

  /**
   * Enable DND mode
   */
  async enable(): Promise<boolean> {
    if (Platform.OS !== "android") {
      console.warn("[dnd] DND control only available on Android");
      return false;
    }

    try {
      const success = await dndModule.enableDND();
      if (success) {
        console.log("[dnd] DND enabled successfully");
      }
      return success;
    } catch (error) {
      console.error("[dnd] Error enabling DND:", error);
      return false;
    }
  },

  /**
   * Disable DND mode
   */
  async disable(): Promise<boolean> {
    if (Platform.OS !== "android") {
      console.warn("[dnd] DND control only available on Android");
      return false;
    }

    try {
      const success = await dndModule.disableDND();
      if (success) {
        console.log("[dnd] DND disabled successfully");
      }
      return success;
    } catch (error) {
      console.error("[dnd] Error disabling DND:", error);
      return false;
    }
  },

  /**
   * Check if DND is currently enabled
   */
  async checkStatus(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      return await dndModule.isDNDEnabled();
    } catch (error) {
      console.error("[dnd] Error checking DND status:", error);
      return false;
    }
  },

  /**
   * Check if app has DND permission
   */
  async hasPermission(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      return await dndModule.hasDNDPermission();
    } catch (error) {
      console.error("[dnd] Error checking DND permission:", error);
      return false;
    }
  },

  /**
   * Request DND permission from user
   * Opens system settings for DND access
   */
  async requestPermission(): Promise<boolean> {
    if (Platform.OS !== "android") {
      console.warn("[dnd] DND permission only available on Android");
      return false;
    }

    try {
      return await dndModule.requestDNDPermission();
    } catch (error) {
      console.error("[dnd] Error requesting DND permission:", error);
      return false;
    }
  },
};

/**
 * ================================================
 * Focus Session Enforcement
 * ================================================
 * Foreground service that actively blocks apps during focus sessions
 */
export const focusSession = {
  /**
   * Start focus session with app blocking enforcement
   * @param blockedApps Array of package names to block (e.g., ["com.instagram.android"])
   * @param goalMinutes Duration of focus session in minutes
   */
  async start(blockedApps: string[], goalMinutes: number): Promise<boolean> {
    if (Platform.OS !== "android") {
      console.warn("[focusSession] Only available on Android");
      return false;
    }

    try {
      // Set focus mode in notification listener
      await focusNotification.setFocusMode(true, blockedApps);

      // Enable DND mode for system-level silence
      await dnd.enable();

      // Start foreground enforcement service
      await focusEnforcement.startEnforcement(blockedApps, goalMinutes);

      console.log(
        `[focusSession] Started ${goalMinutes}min focus session, blocking ${blockedApps.length} apps`,
      );
      return true;
    } catch (error) {
      console.error("[focusSession] Error starting focus session:", error);
      return false;
    }
  },

  /**
   * Stop active focus session
   */
  async stop(): Promise<boolean> {
    if (Platform.OS !== "android") {
      console.warn("[focusSession] Only available on Android");
      return false;
    }

    try {
      // Stop foreground enforcement service
      await focusEnforcement.stopEnforcement();

      // Disable focus mode in notification listener
      await focusNotification.setFocusMode(false, []);

      // Disable DND mode
      await dnd.disable();

      console.log("[focusSession] Focus session stopped");
      return true;
    } catch (error) {
      console.error("[focusSession] Error stopping focus session:", error);
      return false;
    }
  },

  /**
   * Check if focus session is currently active
   */
  async isActive(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      return await focusEnforcement.isEnforcementActive();
    } catch (error) {
      console.error("[focusSession] Error checking session status:", error);
      return false;
    }
  },

  /**
   * Get list of currently blocked packages
   */
  async getBlockedApps(): Promise<string[]> {
    if (Platform.OS !== "android") return [];

    try {
      return await focusEnforcement.getBlockedPackages();
    } catch (error) {
      console.error("[focusSession] Error getting blocked apps:", error);
      return [];
    }
  },
};

/**
 * ================================================
 * Notification Listener Control
 * ================================================
 * Controls for FocusNotificationListenerService
 */
export const notificationListener = {
  /**
   * Set focus mode for notification filtering
   * @param enabled Enable/disable focus mode
   * @param blockedPackages Array of package names to suppress notifications from
   */
  async setFocusMode(
    enabled: boolean,
    blockedPackages: string[],
  ): Promise<boolean> {
    if (Platform.OS !== "android") {
      console.warn("[notificationListener] Only available on Android");
      return false;
    }

    try {
      await focusNotification.setFocusMode(enabled, blockedPackages);
      console.log(
        `[notificationListener] Focus mode ${
          enabled ? "enabled" : "disabled"
        }, blocking ${blockedPackages.length} packages`,
      );
      return true;
    } catch (error) {
      console.error("[notificationListener] Error setting focus mode:", error);
      return false;
    }
  },

  /**
   * Get list of suppressed notifications during focus session
   */
  async getSuppressedNotifications(): Promise<SuppressedNotification[]> {
    if (Platform.OS !== "android") {
      console.warn("[notificationListener] Only available on Android");
      return [];
    }

    try {
      return await focusNotification.getSuppressedNotifications();
    } catch (error) {
      console.error(
        "[notificationListener] Error getting suppressed notifications:",
        error,
      );
      return [];
    }
  },

  /**
   * Clear suppressed notifications history
   */
  async clearSuppressedNotifications(): Promise<boolean> {
    if (Platform.OS !== "android") {
      console.warn("[notificationListener] Only available on Android");
      return false;
    }

    try {
      return await focusNotification.clearSuppressedNotifications();
    } catch (error) {
      console.error(
        "[notificationListener] Error clearing suppressed notifications:",
        error,
      );
      return false;
    }
  },

  /**
   * Get count of suppressed notifications
   */
  async getSuppressedCount(): Promise<number> {
    if (Platform.OS !== "android") return 0;

    try {
      return await focusNotification.getSuppressedCount();
    } catch (error) {
      console.error(
        "[notificationListener] Error getting suppressed count:",
        error,
      );
      return 0;
    }
  },

  /**
   * Check if focus mode is currently active
   */
  async isActive(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      return await focusNotification.isFocusModeActive();
    } catch (error) {
      console.error("[notificationListener] Error checking focus mode:", error);
      return false;
    }
  },
};

/**
 * ================================================
 * Power & Battery Management
 * ================================================
 * Battery info, optimization, and power saving features
 */
export const power = {
  /**
   * Get current battery information
   */
  async getBatteryInfo() {
    if (Platform.OS !== "android") {
      return { level: 100, isCharging: false };
    }

    try {
      return await powerModule.getBatteryInfo();
    } catch (error) {
      console.error("[power] Error getting battery info:", error);
      return { level: 100, isCharging: false };
    }
  },

  /**
   * Check if battery optimization is disabled for reliable service
   */
  async isIgnoringBatteryOptimizations(): Promise<boolean> {
    if (Platform.OS !== "android") return true;

    try {
      return await powerModule.isIgnoringBatteryOptimizations();
    } catch (error) {
      console.error("[power] Error checking battery optimization:", error);
      return false;
    }
  },

  /**
   * Request battery optimization exemption
   */
  async requestIgnoreBatteryOptimizations(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      return await powerModule.requestIgnoreBatteryOptimizations();
    } catch (error) {
      console.error("[power] Error requesting battery optimization:", error);
      return false;
    }
  },

  /**
   * Check if device is in power saving mode
   */
  async isPowerSaveMode(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      return await powerModule.isPowerSaveMode();
    } catch (error) {
      console.error("[power] Error checking power save mode:", error);
      return false;
    }
  },

  /**
   * Get comprehensive power status
   */
  async getPowerStatus() {
    if (Platform.OS !== "android") {
      return {
        batteryLevel: 100,
        isCharging: false,
        isScreenOn: true,
      };
    }

    try {
      return await powerModule.getPowerStatus();
    } catch (error) {
      console.error("[power] Error getting power status:", error);
      return {
        batteryLevel: 100,
        isCharging: false,
        isScreenOn: true,
      };
    }
  },
};

/**
 * ================================================
 * Wallpaper Management
 * ================================================
 * OLED-optimized wallpaper control
 */
export const wallpaper = {
  /**
   * Set solid color wallpaper (OLED-optimized)
   * @param colorHex Hex color (e.g., "#000000" for true black)
   */
  async setSolidColor(colorHex: string): Promise<boolean> {
    if (Platform.OS !== "android") {
      console.warn("[wallpaper] Only available on Android");
      return false;
    }

    try {
      return await wallpaperModule.setSolidColor(colorHex);
    } catch (error) {
      console.error("[wallpaper] Error setting solid color:", error);
      return false;
    }
  },

  /**
   * Set true black wallpaper (maximum battery saving for OLED)
   */
  async setBlack(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      return await wallpaperModule.setBlackWallpaper();
    } catch (error) {
      console.error("[wallpaper] Error setting black wallpaper:", error);
      return false;
    }
  },

  /**
   * Set wallpaper from image URI
   */
  async setFromUri(imageUri: string): Promise<boolean> {
    if (Platform.OS !== "android") {
      console.warn("[wallpaper] Only available on Android");
      return false;
    }

    try {
      return await wallpaperModule.setWallpaperFromUri(imageUri);
    } catch (error) {
      console.error("[wallpaper] Error setting wallpaper from URI:", error);
      return false;
    }
  },

  /**
   * Clear wallpaper (reset to system default)
   */
  async clear(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      return await wallpaperModule.clearWallpaper();
    } catch (error) {
      console.error("[wallpaper] Error clearing wallpaper:", error);
      return false;
    }
  },
};

/**
 * ================================================
 * Backup & Restore
 * ================================================
 * Settings backup and restore functionality
 */
export const backup = {
  /**
   * Export current settings to backup file
   */
  async exportSettings(settings: any, backupName?: string) {
    if (Platform.OS !== "android") {
      console.warn("[backup] Only available on Android");
      return null;
    }

    try {
      return await backupModule.exportSettings(settings, backupName);
    } catch (error) {
      console.error("[backup] Error exporting settings:", error);
      return null;
    }
  },

  /**
   * Import settings from backup file
   */
  async importSettings(filePath: string) {
    if (Platform.OS !== "android") {
      console.warn("[backup] Only available on Android");
      return null;
    }

    try {
      return await backupModule.importSettings(filePath);
    } catch (error) {
      console.error("[backup] Error importing settings:", error);
      return null;
    }
  },

  /**
   * List all available backup files
   */
  async listBackups() {
    if (Platform.OS !== "android") return [];

    try {
      return await backupModule.listBackups();
    } catch (error) {
      console.error("[backup] Error listing backups:", error);
      return [];
    }
  },

  /**
   * Delete a backup file
   */
  async deleteBackup(filePath: string): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      return await backupModule.deleteBackup(filePath);
    } catch (error) {
      console.error("[backup] Error deleting backup:", error);
      return false;
    }
  },

  /**
   * Get backup directory path
   */
  async getBackupDirectory(): Promise<string> {
    if (Platform.OS !== "android") return "";

    try {
      return await backupModule.getBackupDirectory();
    } catch (error) {
      console.error("[backup] Error getting backup directory:", error);
      return "";
    }
  },
};

/**
 * ================================================
 * Gesture Detection
 * ================================================
 * Swipe, tap, and fling gesture handling
 */
export const gestures = {
  /**
   * Initialize gesture detection
   */
  async initialize(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      return await gestureModule.initialize();
    } catch (error) {
      console.error("[gestures] Error initializing:", error);
      return false;
    }
  },

  /**
   * Configure gesture thresholds
   */
  async configure(
    swipeThreshold: number = 100,
    velocityThreshold: number = 100,
  ): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      return await gestureModule.configure(swipeThreshold, velocityThreshold);
    } catch (error) {
      console.error("[gestures] Error configuring:", error);
      return false;
    }
  },

  /**
   * Enable gesture detection
   */
  async enable(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      return await gestureModule.enableGestures();
    } catch (error) {
      console.error("[gestures] Error enabling:", error);
      return false;
    }
  },

  /**
   * Disable gesture detection
   */
  async disable(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      return await gestureModule.disableGestures();
    } catch (error) {
      console.error("[gestures] Error disabling:", error);
      return false;
    }
  },

  /**
   * Check if gestures are enabled
   */
  async isEnabled(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      return await gestureModule.isEnabled();
    } catch (error) {
      console.error("[gestures] Error checking status:", error);
      return false;
    }
  },
};

/**
 * ================================================
 * Accessibility Service (Advanced Blocking)
 * ================================================
 * System-level app blocking using Accessibility Service
 */
export const accessibility = {
  /**
   * Check if accessibility service is enabled
   */
  async isServiceEnabled(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      return await accessibilityModule.isAccessibilityServiceEnabled();
    } catch (error) {
      console.error("[accessibility] Error checking service:", error);
      return false;
    }
  },

  /**
   * Request accessibility permission (opens settings)
   */
  async requestPermission(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      return await accessibilityModule.requestAccessibilityPermission();
    } catch (error) {
      console.error("[accessibility] Error requesting permission:", error);
      return false;
    }
  },

  /**
   * Set focus mode for accessibility-based blocking
   */
  async setFocusMode(
    enabled: boolean,
    blockedPackages: string[],
  ): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      return await accessibilityModule.setFocusMode(enabled, blockedPackages);
    } catch (error) {
      console.error("[accessibility] Error setting focus mode:", error);
      return false;
    }
  },

  /**
   * Check if focus mode is active
   */
  async isFocusModeActive(): Promise<boolean> {
    if (Platform.OS !== "android") return false;

    try {
      return await accessibilityModule.isFocusModeActive();
    } catch (error) {
      console.error("[accessibility] Error checking focus mode:", error);
      return false;
    }
  },

  /**
   * Get list of blocked packages
   */
  async getBlockedPackages(): Promise<string[]> {
    if (Platform.OS !== "android") return [];

    try {
      return await accessibilityModule.getBlockedPackages();
    } catch (error) {
      console.error("[accessibility] Error getting blocked packages:", error);
      return [];
    }
  },
};

// ============================================================================
// Overlay & Friction Moments Module
// ============================================================================

export { overlay } from "./overlayBridge";

// All modules are already exported with 'export const' above
// Additional re-exports for clarity (these are already exported)
// export { launcher, blocker, usage, notifications, dnd, focusSession, notificationListener, power, wallpaper, backup, gestures, accessibility };

// Legacy export for backward compatibility
const NativeBridge = {
  requestUsageAccess: () => blocker.requestUsageStatsPermission(),
  requestNotificationAccess: () => notifications.requestPermission(),
  setAsLauncher: () => launcher.setAsDefault(),
};

export default NativeBridge;
