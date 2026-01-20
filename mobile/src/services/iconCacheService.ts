/**
 * Icon Cache Service
 *
 * Caches processed app icons (grayscale conversion) to improve performance
 * Stores icons in AsyncStorage and handles cache invalidation
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

interface CachedIcon {
  packageName: string;
  processedIcon: string; // Base64 string
  timestamp: number;
  appName: string;
}

interface IconCache {
  [packageName: string]: CachedIcon;
}

const CACHE_KEY = "@zen_icon_cache";
const CACHE_VERSION_KEY = "@zen_icon_cache_version";
const CURRENT_CACHE_VERSION = "1.0";
const CACHE_EXPIRY_DAYS = 7; // Icons expire after 7 days

class IconCacheService {
  private cache: IconCache = {};
  private isInitialized = false;

  /**
   * Initialize the cache from AsyncStorage
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check cache version
      const cacheVersion = await AsyncStorage.getItem(CACHE_VERSION_KEY);
      if (cacheVersion !== CURRENT_CACHE_VERSION) {
        console.log("[IconCache] Cache version mismatch, clearing cache");
        await this.clearCache();
        await AsyncStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
        this.isInitialized = true;
        return;
      }

      // Load cache
      const cacheData = await AsyncStorage.getItem(CACHE_KEY);
      if (cacheData) {
        this.cache = JSON.parse(cacheData);
        console.log(
          `[IconCache] Loaded ${Object.keys(this.cache).length} cached icons`
        );

        // Clean expired entries
        await this.cleanExpiredEntries();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error("[IconCache] Failed to initialize cache:", error);
      this.cache = {};
      this.isInitialized = true;
    }
  }

  /**
   * Get a cached icon if available
   */
  getCachedIcon(packageName: string): string | null {
    const cached = this.cache[packageName];
    if (!cached) return null;

    // Check if expired
    const expiryTime =
      cached.timestamp + CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    if (Date.now() > expiryTime) {
      console.log(`[IconCache] Icon expired for ${packageName}`);
      delete this.cache[packageName];
      return null;
    }

    return cached.processedIcon;
  }

  /**
   * Cache an icon
   */
  async cacheIcon(
    packageName: string,
    appName: string,
    processedIcon: string
  ): Promise<void> {
    try {
      this.cache[packageName] = {
        packageName,
        processedIcon,
        timestamp: Date.now(),
        appName,
      };

      // Save to AsyncStorage (debounced to avoid excessive writes)
      await this.saveCache();
    } catch (error) {
      console.error(
        `[IconCache] Failed to cache icon for ${packageName}:`,
        error
      );
    }
  }

  /**
   * Cache multiple icons at once
   */
  async cacheIcons(
    icons: Array<{
      packageName: string;
      appName: string;
      processedIcon: string;
    }>
  ): Promise<void> {
    try {
      icons.forEach(({ packageName, appName, processedIcon }) => {
        this.cache[packageName] = {
          packageName,
          processedIcon,
          timestamp: Date.now(),
          appName,
        };
      });

      await this.saveCache();
      console.log(`[IconCache] Cached ${icons.length} icons`);
    } catch (error) {
      console.error("[IconCache] Failed to cache icons:", error);
    }
  }

  /**
   * Check if an icon is cached
   */
  isCached(packageName: string): boolean {
    return this.getCachedIcon(packageName) !== null;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    totalCached: number;
    cacheSize: number;
    oldestEntry: number | null;
  } {
    const entries = Object.values(this.cache);
    const totalCached = entries.length;
    const cacheSize = JSON.stringify(this.cache).length;
    const oldestEntry =
      entries.length > 0 ? Math.min(...entries.map((e) => e.timestamp)) : null;

    return { totalCached, cacheSize, oldestEntry };
  }

  /**
   * Save cache to AsyncStorage
   */
  private async saveCache(): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.error("[IconCache] Failed to save cache:", error);
    }
  }

  /**
   * Clean expired entries from cache
   */
  private async cleanExpiredEntries(): Promise<void> {
    const now = Date.now();
    const expiryThreshold = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    let cleanedCount = 0;

    Object.keys(this.cache).forEach((packageName) => {
      const cached = this.cache[packageName];
      if (now - cached.timestamp > expiryThreshold) {
        delete this.cache[packageName];
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      console.log(`[IconCache] Cleaned ${cleanedCount} expired entries`);
      await this.saveCache();
    }
  }

  /**
   * Clear all cached icons
   */
  async clearCache(): Promise<void> {
    try {
      this.cache = {};
      await AsyncStorage.removeItem(CACHE_KEY);
      console.log("[IconCache] Cache cleared");
    } catch (error) {
      console.error("[IconCache] Failed to clear cache:", error);
    }
  }

  /**
   * Remove specific icon from cache
   */
  async removeCachedIcon(packageName: string): Promise<void> {
    try {
      delete this.cache[packageName];
      await this.saveCache();
      console.log(`[IconCache] Removed cache for ${packageName}`);
    } catch (error) {
      console.error(
        `[IconCache] Failed to remove cache for ${packageName}:`,
        error
      );
    }
  }
}

// Singleton instance
export const iconCacheService = new IconCacheService();
