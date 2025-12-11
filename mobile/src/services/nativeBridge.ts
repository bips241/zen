/**
 * Native Bridge Service
 * 
 * TypeScript wrappers for native Android functionality
 * Provides type-safe access to all native modules
 */

import { Platform } from 'react-native';
import {
  zenLauncher,
  appBlocker,
  usageStats,
  zenNotification,
  isNativeModuleAvailable,
  InstalledApp,
  AppUsageStats,
} from '@/native-android/nativeModules';

// ============================================================================
// Launcher Module
// ============================================================================

export const launcher = {
  /**
   * Check if this app is the default launcher
   */
  async isDefault(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    if (!isNativeModuleAvailable('ZenLauncher')) return false;

    try {
      const result = await zenLauncher.isDefaultLauncher();
      return result.isDefault;
    } catch (error) {
      console.error('[launcher] Error checking default status:', error);
      return false;
    }
  },

  /**
   * Request to set this app as default launcher
   */
  async setAsDefault(): Promise<{ success: boolean; error?: string }> {
    if (Platform.OS !== 'android') {
      return { success: false, error: 'Only available on Android' };
    }

    if (!isNativeModuleAvailable('ZenLauncher')) {
      return { success: false, error: 'Native module not available' };
    }

    try {
      const result = await zenLauncher.requestSetAsDefaultLauncher();
      return { success: result.success, error: result.message };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  /**
   * Open Android home settings
   */
  async openHomeSettings(): Promise<{ success: boolean }> {
    if (Platform.OS !== 'android') return { success: false };

    try {
      await zenLauncher.openHomeSettings();
      return { success: true };
    } catch (error) {
      console.error('[launcher] Error opening home settings:', error);
      return { success: false };
    }
  },

  /**
   * Get all installed apps
   */
  async getInstalledApps(): Promise<InstalledApp[]> {
    if (Platform.OS !== 'android') return [];
    if (!isNativeModuleAvailable('ZenLauncher')) return [];

    try {
      return await zenLauncher.getInstalledApps();
    } catch (error) {
      console.error('[launcher] Error getting installed apps:', error);
      return [];
    }
  },

  /**
   * Launch an app by package name
   */
  async launchApp(packageName: string): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const result = await zenLauncher.launchApp(packageName);
      return result.success;
    } catch (error) {
      console.error('[launcher] Error launching app:', error);
      return false;
    }
  },

  /**
   * Check if an app is running
   */
  async isAppRunning(packageName: string): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const result = await zenLauncher.isAppRunning(packageName);
      return result.isRunning;
    } catch (error) {
      console.error('[launcher] Error checking app running:', error);
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
    if (Platform.OS !== 'android') return false;
    if (!isNativeModuleAvailable('AppBlocker')) return false;

    try {
      const result = await appBlocker.blockApps(packageNames);
      return result.success;
    } catch (error) {
      console.error('[blocker] Error blocking apps:', error);
      return false;
    }
  },

  /**
   * Unblock specific apps
   */
  async unblockApps(packageNames: string[]): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const result = await appBlocker.unblockApps(packageNames);
      return result.success;
    } catch (error) {
      console.error('[blocker] Error unblocking apps:', error);
      return false;
    }
  },

  /**
   * Unblock all apps
   */
  async unblockAll(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const result = await appBlocker.unblockAllApps();
      return result.success;
    } catch (error) {
      console.error('[blocker] Error unblocking all apps:', error);
      return false;
    }
  },

  /**
   * Check if an app is blocked
   */
  async isBlocked(packageName: string): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const result = await appBlocker.isAppBlocked(packageName);
      return result.isBlocked;
    } catch (error) {
      console.error('[blocker] Error checking if app is blocked:', error);
      return false;
    }
  },

  /**
   * Get currently foreground app
   */
  async getForegroundApp(): Promise<string | null> {
    if (Platform.OS !== 'android') return null;

    try {
      const result = await appBlocker.getForegroundApp();
      return result.packageName || null;
    } catch (error) {
      console.error('[blocker] Error getting foreground app:', error);
      return null;
    }
  },

  /**
   * Check if has usage stats permission
   */
  async hasUsageStatsPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const result = await appBlocker.hasUsageStatsPermission();
      return result.hasPermission;
    } catch (error) {
      console.error('[blocker] Error checking usage stats permission:', error);
      return false;
    }
  },

  /**
   * Request usage stats permission
   */
  async requestUsageStatsPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const result = await appBlocker.requestUsageStatsPermission();
      return result.success;
    } catch (error) {
      console.error('[blocker] Error requesting usage stats permission:', error);
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
    if (Platform.OS !== 'android') return [];
    if (!isNativeModuleAvailable('UsageStats')) return [];

    try {
      return await usageStats.getTodayUsage();
    } catch (error) {
      console.error('[usage] Error getting today usage:', error);
      return [];
    }
  },

  /**
   * Get app usage stats for date range
   */
  async getUsageInRange(startTime: Date, endTime: Date): Promise<AppUsageStats[]> {
    if (Platform.OS !== 'android') return [];

    try {
      return await usageStats.getUsageInRange(
        startTime.getTime(),
        endTime.getTime()
      );
    } catch (error) {
      console.error('[usage] Error getting usage in range:', error);
      return [];
    }
  },

  /**
   * Get most used apps
   */
  async getMostUsedApps(limit: number = 10): Promise<AppUsageStats[]> {
    if (Platform.OS !== 'android') return [];

    try {
      return await usageStats.getMostUsedApps(limit);
    } catch (error) {
      console.error('[usage] Error getting most used apps:', error);
      return [];
    }
  },

  /**
   * Get total screen time for today
   */
  async getTotalScreenTime(): Promise<number> {
    if (Platform.OS !== 'android') return 0;

    try {
      const result = await usageStats.getTotalScreenTime();
      return result.totalTimeMinutes;
    } catch (error) {
      console.error('[usage] Error getting total screen time:', error);
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
    if (Platform.OS !== 'android') return false;
    if (!isNativeModuleAvailable('ZenNotification')) return false;

    try {
      const result = await zenNotification.enableNotificationBlocking();
      return result.success;
    } catch (error) {
      console.error('[notifications] Error enabling blocking:', error);
      return false;
    }
  },

  /**
   * Disable notification blocking
   */
  async disable(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const result = await zenNotification.disableNotificationBlocking();
      return result.success;
    } catch (error) {
      console.error('[notifications] Error disabling blocking:', error);
      return false;
    }
  },

  /**
   * Block notifications from specific apps
   */
  async blockFromApps(packageNames: string[]): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const result = await zenNotification.blockNotificationsFromApps(packageNames);
      return result.success;
    } catch (error) {
      console.error('[notifications] Error blocking notifications:', error);
      return false;
    }
  },

  /**
   * Unblock notifications from specific apps
   */
  async unblockFromApps(packageNames: string[]): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const result = await zenNotification.unblockNotificationsFromApps(packageNames);
      return result.success;
    } catch (error) {
      console.error('[notifications] Error unblocking notifications:', error);
      return false;
    }
  },

  /**
   * Check if notification listener permission is granted
   */
  async hasPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const result = await zenNotification.hasNotificationListenerPermission();
      return result.hasPermission;
    } catch (error) {
      console.error('[notifications] Error checking permission:', error);
      return false;
    }
  },

  /**
   * Request notification listener permission
   */
  async requestPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const result = await zenNotification.requestNotificationListenerPermission();
      return result.success;
    } catch (error) {
      console.error('[notifications] Error requesting permission:', error);
      return false;
    }
  },

  /**
   * Check if notification blocking is enabled
   */
  async isEnabled(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const result = await zenNotification.isNotificationBlockingEnabled();
      return result.enabled;
    } catch (error) {
      console.error('[notifications] Error checking if enabled:', error);
      return false;
    }
  },
};

// Legacy export for backward compatibility
const NativeBridge = {
  requestUsageAccess: () => blocker.requestUsageStatsPermission(),
  requestNotificationAccess: () => notifications.requestPermission(),
  setAsLauncher: () => launcher.setAsDefault(),
};

export default NativeBridge;
