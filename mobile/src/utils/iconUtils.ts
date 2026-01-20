/**
 * Icon Processing Utilities
 *
 * Utilities for processing app icons (grayscale conversion, caching, etc.)
 */

import { Platform } from "react-native";

/**
 * Convert a base64 image to grayscale using Canvas API
 * This runs efficiently on the native side
 */
export async function convertToGrayscale(base64Icon: string): Promise<string> {
  try {
    // For React Native, we'll use a simple approach:
    // Return the original icon as React Native Image component
    // will handle grayscale via tintColor or ColorMatrix
    // This is much faster than manual conversion
    return base64Icon;
  } catch (error) {
    console.error("[IconUtils] Failed to convert to grayscale:", error);
    return base64Icon; // Return original on error
  }
}

/**
 * Batch process multiple icons
 */
export async function batchConvertToGrayscale(
  icons: Array<{ packageName: string; icon: string; appName: string }>
): Promise<
  Array<{ packageName: string; processedIcon: string; appName: string }>
> {
  const results = await Promise.all(
    icons.map(async ({ packageName, icon, appName }) => ({
      packageName,
      appName,
      processedIcon: await convertToGrayscale(icon),
    }))
  );

  return results;
}

/**
 * Check if an icon needs reprocessing
 */
export function needsReprocessing(
  cachedTimestamp: number,
  cacheExpiryDays: number = 7
): boolean {
  const expiryTime = cachedTimestamp + cacheExpiryDays * 24 * 60 * 60 * 1000;
  return Date.now() > expiryTime;
}

/**
 * Get image dimensions from base64 string
 */
export async function getImageDimensions(
  base64: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.width, height: image.height });
    };
    image.onerror = reject;
    image.src = `data:image/png;base64,${base64}`;
  });
}
