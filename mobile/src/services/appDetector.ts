/**
 * App Detector Service
 * Detects vendor-specific system apps (dialer, messages, etc.) for different phone manufacturers
 */

import { NativeModules } from "react-native";

const { ZenLauncher } = NativeModules;

// Common app package names for different vendors
const APP_VARIANTS = {
  DIALER: [
    // Try Android standard intent first
    "intent:tel:",
    // Google
    "com.google.android.dialer",
    // Samsung
    "com.samsung.android.dialer",
    "com.samsung.android.incallui",
    // Xiaomi/MIUI
    "com.android.contacts",
    "com.miui.contacts",
    // OnePlus/OxygenOS
    "com.oneplus.dialer",
    // Huawei/EMUI
    "com.huawei.contacts",
    // Oppo/ColorOS
    "com.coloros.dialer",
    "com.oppo.dialer",
    // Vivo
    "com.android.contacts",
    // Realme
    "com.android.dialer",
    // Generic AOSP
    "com.android.dialer",
  ],
  MESSAGES: [
    // Try Android standard intent first
    "intent:sms:",
    // Google
    "com.google.android.apps.messaging",
    // Samsung
    "com.samsung.android.messaging",
    "com.samsung.android.app.smsreceiver",
    // Xiaomi/MIUI
    "com.android.mms",
    "com.miui.mms",
    // OnePlus/OxygenOS
    "com.oneplus.mms",
    // Huawei/EMUI
    "com.huawei.message",
    // Oppo/ColorOS
    "com.coloros.mcs",
    "com.oppo.mms",
    // Vivo
    "com.vivo.mms",
    // Realme
    "com.android.mms",
    // Generic AOSP
    "com.android.mms",
  ],
  PHONE: [
    // Intent-based approach (most reliable)
    "intent:phone:",
    // Then try package names
    "com.google.android.dialer",
    "com.samsung.android.dialer",
    "com.android.dialer",
    "com.android.contacts",
  ],
};

interface AppDetectorCache {
  dialer?: string;
  messages?: string;
  phone?: string;
}

class AppDetectorService {
  private cache: AppDetectorCache = {};
  private detectionPromises: Map<string, Promise<string>> = new Map();

  /**
   * Check if an app package is installed on the device
   */
  private async isAppInstalled(packageName: string): Promise<boolean> {
    try {
      // Intent URIs don't need installation check
      if (packageName.startsWith("intent:")) {
        return true;
      }

      // Use native module to check if app is installed
      if (ZenLauncher?.isAppInstalled) {
        const installed = await ZenLauncher.isAppInstalled(packageName);
        return installed;
      }

      // Fallback: try to launch and catch error
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Detect the correct dialer app for this device
   */
  async getDialerApp(): Promise<string> {
    if (this.cache.dialer) {
      return this.cache.dialer;
    }

    // Prevent multiple simultaneous detection calls
    if (this.detectionPromises.has("dialer")) {
      return this.detectionPromises.get("dialer")!;
    }

    const detectionPromise = this.detectApp(APP_VARIANTS.DIALER);
    this.detectionPromises.set("dialer", detectionPromise);

    try {
      const dialerApp = await detectionPromise;
      this.cache.dialer = dialerApp;
      return dialerApp;
    } finally {
      this.detectionPromises.delete("dialer");
    }
  }

  /**
   * Detect the correct messages app for this device
   */
  async getMessagesApp(): Promise<string> {
    if (this.cache.messages) {
      return this.cache.messages;
    }

    if (this.detectionPromises.has("messages")) {
      return this.detectionPromises.get("messages")!;
    }

    const detectionPromise = this.detectApp(APP_VARIANTS.MESSAGES);
    this.detectionPromises.set("messages", detectionPromise);

    try {
      const messagesApp = await detectionPromise;
      this.cache.messages = messagesApp;
      return messagesApp;
    } finally {
      this.detectionPromises.delete("messages");
    }
  }

  /**
   * Detect the correct phone app for this device
   */
  async getPhoneApp(): Promise<string> {
    if (this.cache.phone) {
      return this.cache.phone;
    }

    if (this.detectionPromises.has("phone")) {
      return this.detectionPromises.get("phone")!;
    }

    const detectionPromise = this.detectApp(APP_VARIANTS.PHONE);
    this.detectionPromises.set("phone", detectionPromise);

    try {
      const phoneApp = await detectionPromise;
      this.cache.phone = phoneApp;
      return phoneApp;
    } finally {
      this.detectionPromises.delete("phone");
    }
  }

  /**
   * Generic app detection from a list of variants
   */
  private async detectApp(variants: string[]): Promise<string> {
    // Check specific package names first (e.g. Google Dialer, Samsung Dialer)
    for (const packageName of variants) {
      if (!packageName.startsWith("intent:")) {
        const installed = await this.isAppInstalled(packageName);
        if (installed) {
          console.log(`[AppDetector] Detected installed app: ${packageName}`);
          return packageName;
        }
      }
    }

    // Fallback to intent if no specific package is installed
    for (const variant of variants) {
      if (variant.startsWith("intent:")) {
        return variant;
      }
    }

    const fallback = variants.find((v) => !v.startsWith("intent:"));
    return fallback || variants[0];
  }

  /**
   * Clear detection cache (useful for testing or reset)
   */
  clearCache(): void {
    this.cache = {};
    this.detectionPromises.clear();
  }

  /**
   * Pre-detect all system apps (call on app startup)
   */
  async preDetectSystemApps(): Promise<void> {
    try {
      await Promise.all([
        this.getDialerApp(),
        this.getMessagesApp(),
        this.getPhoneApp(),
      ]);
      console.log("[AppDetector] Pre-detection complete:", this.cache);
    } catch (error) {
      console.error("[AppDetector] Pre-detection failed:", error);
    }
  }
}

export const appDetector = new AppDetectorService();
