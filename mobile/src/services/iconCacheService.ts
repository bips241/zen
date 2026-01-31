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
const CURRENT_CACHE_VERSION = "1.1";
const CACHE_EXPIRY_DAYS = 30; // Icons expire after 30 days
const MAX_CACHE_SIZE_MB = 50; // Maximum cache size in MB
const MAX_MEMORY_ITEMS = 200; // Max items to keep in memory

class IconCacheService {
  private cache: IconCache = {};
  private memoryCache: Map<string, string> = new Map(); // Fast in-memory lookup
  private isInitialized = false;
  private pendingWrites: NodeJS.Timeout | null = null;

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
          `[IconCache] Loaded ${Object.keys(this.cache).length} cached icons`,
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
   * Get a cached icon if available (memory-first, ultra-fast)
   */
  getCachedIcon(packageName: string): string | null {
    // Check memory cache first (instant)
    const memoryCached = this.memoryCache.get(packageName);
    if (memoryCached) {
      return memoryCached;
    }

    // Check persistent cache
    const cached = this.cache[packageName];
    if (!cached) return null;

    // Check if expired
    const expiryTime =
      cached.timestamp + CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    if (Date.now() > expiryTime) {
      delete this.cache[packageName];
      return null;
    }

    // Add to memory cache for next access
    this.addToMemoryCache(packageName, cached.processedIcon);
    return cached.processedIcon;
  }

  /**
   * Cache an icon (with debounced writes)
   */
  async cacheIcon(
    packageName: string,
    appName: string,
    processedIcon: string,
  ): Promise<void> {
    try {
      // Add to memory cache immediately (instant access)
      this.addToMemoryCache(packageName, processedIcon);

      // Add to persistent cache
      this.cache[packageName] = {
        packageName,
        processedIcon,
        timestamp: Date.now(),
        appName,
      };

      // Debounce disk writes (batch multiple icon saves)
      this.debouncedSave();
    } catch (error) {
      console.error(
        `[IconCache] Failed to cache icon for ${packageName}:`,
        error,
      );
    }
  }

  /**
   * Cache multiple icons at once (batch operation)
   */
  async cacheIcons(
    icons: Array<{
      packageName: string;
      appName: string;
      processedIcon: string;
    }>,
  ): Promise<void> {
    try {
      const timestamp = Date.now();
      icons.forEach(({ packageName, appName, processedIcon }) => {
        // Add to memory cache first
        this.addToMemoryCache(packageName, processedIcon);

        // Add to persistent cache
        this.cache[packageName] = {
          packageName,
          processedIcon,
          timestamp,
          appName,
        };
      });

      // Immediate save for batch operations (already batched)
      await this.saveCache();
      console.log(`[IconCache] ✅ Cached ${icons.length} icons`);
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
   * Add item to memory cache with LRU eviction
   */
  private addToMemoryCache(packageName: string, icon: string): void {
    // Evict oldest if cache full
    if (this.memoryCache.size >= MAX_MEMORY_ITEMS) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }
    this.memoryCache.set(packageName, icon);
  }

  /**
   * Debounced save to batch writes (performance optimization)
   */
  private debouncedSave(): void {
    if (this.pendingWrites) {
      clearTimeout(this.pendingWrites);
    }
    this.pendingWrites = setTimeout(() => {
      this.saveCache();
      this.pendingWrites = null;
    }, 500); // Batch writes within 500ms
  }

  /**
   * Save cache to AsyncStorage
   */
  private async saveCache(): Promise<void> {
    try {
      // Check cache size
      const cacheString = JSON.stringify(this.cache);
      const cacheSizeMB = cacheString.length / (1024 * 1024);

      if (cacheSizeMB > MAX_CACHE_SIZE_MB) {
        console.warn(
          `[IconCache] Cache size (${cacheSizeMB.toFixed(
            1,
          )}MB) exceeds limit, pruning...`,
        );
        await this.pruneCache();
      }

      await AsyncStorage.setItem(CACHE_KEY, cacheString);
    } catch (error) {
      console.error("[IconCache] Failed to save cache:", error);
    }
  }

  /**
   * Prune cache to reduce size (keep most recent)
   */
  private async pruneCache(): Promise<void> {
    const entries = Object.values(this.cache);
    entries.sort((a, b) => b.timestamp - a.timestamp);

    // Keep only most recent 50%
    const keepCount = Math.floor(entries.length / 2);
    const newCache: IconCache = {};

    for (let i = 0; i < keepCount; i++) {
      const entry = entries[i];
      newCache[entry.packageName] = entry;
    }

    this.cache = newCache;
    console.log(
      `[IconCache] Pruned cache: kept ${keepCount}/${entries.length} icons`,
    );
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
      this.memoryCache.clear();
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
      this.memoryCache.delete(packageName);
      this.debouncedSave();
      console.log(`[IconCache] Removed cache for ${packageName}`);
    } catch (error) {
      console.error(
        `[IconCache] Failed to remove cache for ${packageName}:`,
        error,
      );
    }
  }
}

// Singleton instance
export const iconCacheService = new IconCacheService();
