/**
 * Overlay Bridge - TypeScript wrapper for OverlayModule
 * Provides friction moments and usage limit functionality
 */

import { Platform } from "react-native";
import { overlayModule, isNativeModuleAvailable } from "../native-android/nativeModules";
import type {
  OverlayPermissionResult,
  OverlayResult,
  FrictionConfigResult,
  UsageLimitResult,
  UsageQueryResult,
} from "../native-android/nativeModules";

/**
 * ================================================
 * Overlay & Friction Moments Control
 * ================================================
 * System overlay for app blocking and friction moments
 */
export const overlay = {
  /**
   * Check if overlay permission is granted
   */
  async hasPermission(): Promise<boolean> {
    if (Platform.OS !== "android") return false;
    if (!isNativeModuleAvailable("ZenOverlay") || !overlayModule) {
      console.warn("[overlay] Module not available. Rebuild app after adding native module.");
      return false;
    }

    try {
      const result: OverlayPermissionResult =
        await overlayModule.hasOverlayPermission();
      return result.hasPermission;
    } catch (error) {
      console.error("[overlay] Error checking permission:", error);
      return false;
    }
  },

  /**
   * Request overlay permission
   */
  async requestPermission(): Promise<boolean> {
    if (Platform.OS !== "android") return false;
    if (!isNativeModuleAvailable("ZenOverlay") || !overlayModule) {
      console.warn("[overlay] Module not available. Rebuild app after adding native module.");
      return false;
    }

    try {
      const result: OverlayResult =
        await overlayModule.requestOverlayPermission();
      return result.success;
    } catch (error) {
      console.error("[overlay] Error requesting permission:", error);
      return false;
    }
  },

  /**
   * Enable friction moments (starts overlay service)
   */
  async enable(): Promise<boolean> {
    if (Platform.OS !== "android") return false;
    if (!isNativeModuleAvailable("ZenOverlay") || !overlayModule) {
      console.warn("[overlay] Module not available. Rebuild app after adding native module.");
      return false;
    }

    try {
      console.log("[overlay] Enabling friction moments...");
      const result: OverlayResult =
        await overlayModule.enableFrictionMoments();
      console.log("[overlay] Enable result:", result);
      return result.success && result.enabled === true;
    } catch (error) {
      console.error("[overlay] Error enabling friction moments:", error);
      return false;
    }
  },

  /**
   * Disable friction moments (stops overlay service)
   */
  async disable(): Promise<boolean> {
    if (Platform.OS !== "android") return false;
    if (!isNativeModuleAvailable("ZenOverlay") || !overlayModule) {
      console.warn("[overlay] Module not available. Rebuild app after adding native module.");
      return false;
    }

    try {
      const result: OverlayResult =
        await overlayModule.disableFrictionMoments();
      return result.success;
    } catch (error) {
      console.error("[overlay] Error disabling friction moments:", error);
      return false;
    }
  },

  /**
   * Check if friction moments are currently enabled
   */
  async isEnabled(): Promise<boolean> {
    if (Platform.OS !== "android") return false;
    if (!isNativeModuleAvailable("ZenOverlay") || !overlayModule) {
      console.warn("[overlay] Module not available. Rebuild app after adding native module.");
      return false;
    }

    try {
      const result = await overlayModule.isFrictionEnabled();
      return result.enabled;
    } catch (error) {
      console.error("[overlay] Error checking friction status:", error);
      return false;
    }
  },

  /**
   * Configure friction settings
   * @param delaySeconds - How long to delay before opening app
   * @param blockedApps - List of package names to show friction for
   */
  async configure(
    delaySeconds: number,
    blockedApps: string[]
  ): Promise<boolean> {
    if (Platform.OS !== "android") return false;
    if (!isNativeModuleAvailable("ZenOverlay") || !overlayModule) {
      console.warn("[overlay] Module not available. Rebuild app after adding native module.");
      return false;
    }

    try {
      console.log("[overlay] Configuring friction:", { delaySeconds, blockedApps });
      const result: FrictionConfigResult =
        await overlayModule.configureFriction(delaySeconds, blockedApps);
      console.log("[overlay] Configure result:", result);
      return result.success;
    } catch (error) {
      console.error("[overlay] Error configuring friction:", error);
      return false;
    }
  },

  /**
   * Set usage limit for a specific app
   * @param packageName - App package name
   * @param limitMinutes - Maximum minutes allowed per day
   */
  async setUsageLimit(
    packageName: string,
    limitMinutes: number
  ): Promise<boolean> {
    if (Platform.OS !== "android") return false;
    if (!isNativeModuleAvailable("ZenOverlay") || !overlayModule) {
      console.warn("[overlay] Module not available. Rebuild app after adding native module.");
      return false;
    }

    try {
      const result: UsageLimitResult = await overlayModule.setUsageLimit(
        packageName,
        limitMinutes
      );
      return result.success;
    } catch (error) {
      console.error("[overlay] Error setting usage limit:", error);
      return false;
    }
  },

  /**
   * Get current usage for an app today
   * @param packageName - App package name
   * @returns Usage in minutes
   */
  async getCurrentUsage(packageName: string): Promise<number> {
    if (Platform.OS !== "android") return 0;
    if (!isNativeModuleAvailable("ZenOverlay") || !overlayModule) {
      console.warn("[overlay] Module not available. Rebuild app after adding native module.");
      return 0;
    }

    try {
      const result: UsageQueryResult =
        await overlayModule.getCurrentUsage(packageName);
      return result.usageMinutes;
    } catch (error) {
      console.error("[overlay] Error getting usage:", error);
      return 0;
    }
  },

  /**
   * Reset today's usage stats (useful for testing)
   */
  async resetTodayUsage(): Promise<boolean> {
    if (Platform.OS !== "android") return false;
    if (!isNativeModuleAvailable("ZenOverlay") || !overlayModule) {
      console.warn("[overlay] Module not available. Rebuild app after adding native module.");
      return false;
    }

    try {
      const result: OverlayResult = await overlayModule.resetTodayUsage();
      return result.success;
    } catch (error) {
      console.error("[overlay] Error resetting usage:", error);
      return false;
    }
  },
  /**
   * Check if there's a pending friction trigger from blocked app
   * Returns the app that triggered friction if any
   */
  async getPendingFrictionTrigger(): Promise<{
    hasTrigger: boolean;
    packageName?: string;
    delaySeconds?: number;
    triggerTime?: number;
  }> {
    if (Platform.OS !== "android") return { hasTrigger: false };
    if (!isNativeModuleAvailable("ZenOverlay") || !overlayModule) {
      return { hasTrigger: false };
    }

    try {
      const result = await overlayModule.getPendingFrictionTrigger();
      return result;
    } catch (error) {
      console.error("[overlay] Error getting pending trigger:", error);
      return { hasTrigger: false };
    }
  },};
