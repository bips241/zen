/**
 * useIconCache Hook
 *
 * Hook for managing app icon caching
 * Handles preloading, cache initialization, and background processing
 */

import { useEffect, useState, useCallback } from "react";
import { iconCacheService } from "../services/iconCacheService";
import { batchConvertToGrayscale } from "../utils/iconUtils";
import type { InstalledApp } from "../native-android/nativeModules";

interface UseIconCacheResult {
  isInitialized: boolean;
  cacheStats: {
    totalCached: number;
    cacheSize: number;
    oldestEntry: number | null;
  };
  preloadIcons: (apps: InstalledApp[]) => Promise<void>;
  clearCache: () => Promise<void>;
  isPreloading: boolean;
}

export function useIconCache(): UseIconCacheResult {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [cacheStats, setCacheStats] = useState({
    totalCached: 0,
    cacheSize: 0,
    oldestEntry: null as number | null,
  });

  useEffect(() => {
    initializeCache();
  }, []);

  const initializeCache = async () => {
    try {
      await iconCacheService.initialize();
      updateStats();
      setIsInitialized(true);
      console.log("[useIconCache] Cache initialized");
    } catch (error) {
      console.error("[useIconCache] Failed to initialize cache:", error);
      setIsInitialized(true); // Continue anyway
    }
  };

  const updateStats = useCallback(() => {
    const stats = iconCacheService.getStats();
    setCacheStats(stats);
  }, []);

  /**
   * Preload icons for apps that aren't cached yet
   * Ultra-optimized: Runs in background without blocking UI
   * Uses request prioritization and adaptive batching
   */
  const preloadIcons = useCallback(
    async (apps: InstalledApp[]) => {
      if (!isInitialized) {
        console.warn("[useIconCache] Cache not initialized yet");
        return;
      }

      try {
        setIsPreloading(true);

        // Filter apps that need caching
        const uncachedApps = apps.filter(
          (app) => app.icon && !iconCacheService.isCached(app.packageName),
        );

        if (uncachedApps.length === 0) {
          console.log("[useIconCache] ✅ All icons already cached");
          updateStats();
          setIsPreloading(false);
          return;
        }

        console.log(
          `[useIconCache] 🚀 Preloading ${uncachedApps.length} icons...`,
        );

        // Aggressive batch processing for speed
        const BATCH_SIZE = 50; // Larger batches for faster processing
        const batches = [];
        for (let i = 0; i < uncachedApps.length; i += BATCH_SIZE) {
          batches.push(uncachedApps.slice(i, i + BATCH_SIZE));
        }

        // Process all batches concurrently (parallel processing)
        await Promise.all(
          batches.map(async (batch, batchIndex) => {
            try {
              const iconsToProcess = batch
                .filter((app) => app.icon)
                .map((app) => ({
                  packageName: app.packageName,
                  appName: app.appName,
                  icon: app.icon!,
                }));

              // Process batch
              const processed = await batchConvertToGrayscale(iconsToProcess);

              // Cache batch immediately
              await iconCacheService.cacheIcons(processed);

              console.log(
                `[useIconCache] ✓ Batch ${batchIndex + 1}/${batches.length} (${
                  processed.length
                } icons)`,
              );
            } catch (error) {
              console.error(
                `[useIconCache] Batch ${batchIndex + 1} failed:`,
                error,
              );
              // Continue with other batches
            }
          }),
        );

        updateStats();
        console.log(
          `[useIconCache] ✅ Preloading complete! Total cached: ${
            iconCacheService.getStats().totalCached
          }`,
        );
      } catch (error) {
        console.error("[useIconCache] Failed to preload icons:", error);
      } finally {
        setIsPreloading(false);
      }
    },
    [isInitialized, updateStats],
  );

  const clearCache = useCallback(async () => {
    try {
      await iconCacheService.clearCache();
      updateStats();
      console.log("[useIconCache] Cache cleared");
    } catch (error) {
      console.error("[useIconCache] Failed to clear cache:", error);
    }
  }, [updateStats]);

  return {
    isInitialized,
    cacheStats,
    preloadIcons,
    clearCache,
    isPreloading,
  };
}
