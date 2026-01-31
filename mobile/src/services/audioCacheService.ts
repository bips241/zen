/**
 * Audio Cache Service
 * Downloads and caches audio files from R2 for offline playback
 */

import * as FileSystem from "expo-file-system";

// R2 CDN endpoint
const R2_CDN_BASE = "https://pub-6e3f78ce1d3d41e19bfe47edbf286e12.r2.dev";

// Cache directory
const CACHE_DIR = FileSystem.documentDirectory + "audio_cache/";

/**
 * Audio file mapping (R2 filenames)
 */
const AUDIO_MAP: Record<string, string> = {
  // Nature sounds
  rainfall: "dark-atmosphere-with-rain-352570.mp3",
  ocean_waves:
    "waves-crashing-on-rocks-spray-cu-storm-at-sea-irving-nature-park-190929-48358.mp3",
  forest: "forest-nature-322637.mp3",
  thunder: "thunder-sound-375727.mp3",

  // White noise
  brown_noise: "warm-soft-brown-pink-noise-ambient-pad-and-loop-446312.mp3",

  // Ambient
  campfire: "crackle-fireplace-campfire-402289.mp3",
  cafe: "casual-cafe-restaurant-noise-73945.mp3",

  // Binaural beats
  deep_focus: "sleeptome-deep-sleep-frequencies-367362.mp3",
};

/**
 * Download progress callback
 */
export type DownloadProgressCallback = (progress: number) => void;

/**
 * Initialize cache directory
 */
async function ensureCacheDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);

  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    console.log("📁 Cache directory created:", CACHE_DIR);
  }
}

/**
 * Get remote URL for track
 */
function getRemoteUrl(trackId: string): string | null {
  const filename = AUDIO_MAP[trackId];

  if (!filename) {
    console.error(`Track not found: ${trackId}`);
    return null;
  }

  return `${R2_CDN_BASE}/${filename}`;
}

/**
 * Get local cache path for track
 */
function getLocalPath(trackId: string): string {
  const filename = AUDIO_MAP[trackId] || `${trackId}.mp3`;
  return `${CACHE_DIR}${filename}`;
}

/**
 * Check if track is cached
 */
export async function isCached(trackId: string): Promise<boolean> {
  const localPath = getLocalPath(trackId);
  const fileInfo = await FileSystem.getInfoAsync(localPath);

  return fileInfo.exists;
}

/**
 * Get cached file size
 */
export async function getCacheSize(trackId: string): Promise<number> {
  const localPath = getLocalPath(trackId);
  const fileInfo = await FileSystem.getInfoAsync(localPath);

  return fileInfo.exists && fileInfo.size ? fileInfo.size : 0;
}

/**
 * Download track and cache it with retry logic
 */
export async function downloadTrack(
  trackId: string,
  onProgress?: DownloadProgressCallback,
  maxRetries: number = 3,
): Promise<string | null> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await ensureCacheDir();

      const remoteUrl = getRemoteUrl(trackId);
      if (!remoteUrl) {
        throw new Error(`Invalid track ID: ${trackId}`);
      }

      const localPath = getLocalPath(trackId);

      console.log(
        `⬇️ Downloading: ${trackId} (Attempt ${attempt}/${maxRetries})`,
      );
      console.log(`From: ${remoteUrl}`);
      console.log(`To: ${localPath}`);

      // Create download resumable for progress tracking
      const downloadResumable = FileSystem.createDownloadResumable(
        remoteUrl,
        localPath,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          onProgress?.(progress);
        },
      );

      const result = await downloadResumable.downloadAsync();

      if (!result) {
        throw new Error("Download failed: No result returned");
      }

      console.log(`✅ Downloaded: ${trackId} (${result.uri})`);
      return result.uri;
    } catch (error: any) {
      lastError = error;
      console.error(
        `❌ Download attempt ${attempt} failed for ${trackId}:`,
        error.message,
      );

      // Don't retry on certain errors
      if (error.message?.includes("Invalid track ID")) {
        throw error;
      }

      // Better error messages with DNS troubleshooting
      if (
        error.message?.includes("No address associated with hostname") ||
        error.message?.includes("UnknownHostException") ||
        error.message?.includes("Unable to resolve host")
      ) {
        console.error("⚠️ DNS Resolution Error:");
        console.error("- R2 domain cannot be resolved");
        console.error("- This might be a DNS propagation issue");
        console.error("- Or network/firewall blocking the domain");
        console.error("- Checking internet connectivity...");

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } else if (error.message?.includes("Network request failed")) {
        console.error("Network error: Check internet connection");
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } else {
        // Unknown error - don't retry
        throw error;
      }
    }
  }

  // All retries failed
  throw new Error(
    `Failed to download ${trackId} after ${maxRetries} attempts. ` +
      `Last error: ${lastError?.message || "Unknown error"}. ` +
      `Please check: 1) Internet connection 2) DNS settings 3) R2 bucket public access`,
  );
}

/**
 * Get audio file URI (cached or download)
 */
export async function getAudioUri(
  trackId: string,
  onProgress?: DownloadProgressCallback,
): Promise<string> {
  await ensureCacheDir();

  const localPath = getLocalPath(trackId);
  const fileInfo = await FileSystem.getInfoAsync(localPath);

  // Return cached file if exists
  if (fileInfo.exists) {
    console.log(`✅ Using cached: ${trackId}`);
    return localPath;
  }

  // Download if not cached
  console.log(`📥 Not cached, downloading: ${trackId}`);
  const downloadedUri = await downloadTrack(trackId, onProgress);

  if (!downloadedUri) {
    throw new Error(`Failed to download ${trackId}`);
  }

  return downloadedUri;
}

/**
 * Clear cache for specific track
 */
export async function clearTrackCache(trackId: string): Promise<void> {
  const localPath = getLocalPath(trackId);
  const fileInfo = await FileSystem.getInfoAsync(localPath);

  if (fileInfo.exists) {
    await FileSystem.deleteAsync(localPath);
    console.log(`🗑️ Cleared cache: ${trackId}`);
  }
}

/**
 * Clear all cached audio
 */
export async function clearAllCache(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);

  if (dirInfo.exists) {
    await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
    console.log("🗑️ Cleared all audio cache");
  }
}

/**
 * Get total cache size
 */
export async function getTotalCacheSize(): Promise<number> {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);

  if (!dirInfo.exists) {
    return 0;
  }

  const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
  let totalSize = 0;

  for (const file of files) {
    const filePath = `${CACHE_DIR}${file}`;
    const fileInfo = await FileSystem.getInfoAsync(filePath);

    if (fileInfo.exists && fileInfo.size) {
      totalSize += fileInfo.size;
    }
  }

  return totalSize;
}

/**
 * Get list of cached tracks
 */
export async function getCachedTracks(): Promise<string[]> {
  await ensureCacheDir();

  const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
  const cachedTracks: string[] = [];

  for (const [trackId, filename] of Object.entries(AUDIO_MAP)) {
    if (files.includes(filename)) {
      cachedTracks.push(trackId);
    }
  }

  return cachedTracks;
}

/**
 * Preload all tracks (background download)
 */
export async function preloadAllTracks(
  onProgress?: (trackId: string, progress: number) => void,
): Promise<void> {
  console.log("📥 Starting bulk download...");

  const trackIds = Object.keys(AUDIO_MAP);

  for (const trackId of trackIds) {
    const cached = await isCached(trackId);

    if (!cached) {
      try {
        await downloadTrack(trackId, (progress) => {
          onProgress?.(trackId, progress);
        });
      } catch (error) {
        console.error(`Failed to preload ${trackId}:`, error);
        // Continue with other tracks
      }
    }
  }

  console.log("✅ Bulk download complete");
}
