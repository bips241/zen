import * as FileSystem from "expo-file-system";
import { Theme } from "../types/theme";

const THEME_CACHE_DIR = `${FileSystem.documentDirectory}themes/`;

class ThemeCacheService {
  /**
   * Initialize theme cache directory
   */
  async initialize(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(THEME_CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(THEME_CACHE_DIR, {
          intermediates: true,
        });
        console.log("Theme cache directory created");
      }
    } catch (error) {
      console.error("Failed to initialize theme cache:", error);
      throw error;
    }
  }

  /**
   * Download a theme video and save to cache
   */
  async downloadTheme(
    theme: Theme,
    onProgress?: (progress: number) => void,
  ): Promise<string> {
    if (!theme.videoUrl) {
      throw new Error("Theme has no video URL");
    }

    try {
      await this.initialize();

      const fileName = `${theme.id}.mp4`;
      const localPath = `${THEME_CACHE_DIR}${fileName}`;

      // Check if already downloaded
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (fileInfo.exists) {
        console.log(`Theme ${theme.id} already cached at ${localPath}`);
        return localPath;
      }

      // Download with progress tracking
      const downloadResumable = FileSystem.createDownloadResumable(
        theme.videoUrl,
        localPath,
        {},
        (downloadProgress) => {
          const progress =
            (downloadProgress.totalBytesWritten /
              downloadProgress.totalBytesExpectedToWrite) *
            100;
          onProgress?.(progress);
        },
      );

      const result = await downloadResumable.downloadAsync();

      if (!result) {
        throw new Error("Download failed");
      }

      console.log(`Theme ${theme.id} downloaded to ${result.uri}`);
      return result.uri;
    } catch (error) {
      console.error(`Failed to download theme ${theme.id}:`, error);
      throw error;
    }
  }

  /**
   * Get local path for a downloaded theme
   */
  getThemePath(themeId: string): string {
    return `${THEME_CACHE_DIR}${themeId}.mp4`;
  }

  /**
   * Check if theme is downloaded
   */
  async isThemeDownloaded(themeId: string): Promise<boolean> {
    try {
      const localPath = this.getThemePath(themeId);
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      return fileInfo.exists;
    } catch (error) {
      console.error(
        `Failed to check if theme ${themeId} is downloaded:`,
        error,
      );
      return false;
    }
  }

  /**
   * Delete a specific theme from cache
   */
  async deleteTheme(themeId: string): Promise<void> {
    try {
      const localPath = this.getThemePath(themeId);
      const fileInfo = await FileSystem.getInfoAsync(localPath);

      if (fileInfo.exists) {
        await FileSystem.deleteAsync(localPath);
        console.log(`Theme ${themeId} deleted from cache`);
      }
    } catch (error) {
      console.error(`Failed to delete theme ${themeId}:`, error);
      throw error;
    }
  }

  /**
   * Clear entire theme cache
   */
  async clearCache(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(THEME_CACHE_DIR);

      if (dirInfo.exists) {
        await FileSystem.deleteAsync(THEME_CACHE_DIR, { idempotent: true });
        console.log("Theme cache cleared");

        // Recreate directory
        await this.initialize();
      }
    } catch (error) {
      console.error("Failed to clear theme cache:", error);
      throw error;
    }
  }

  /**
   * Get cache size in bytes
   */
  async getCacheSize(): Promise<number> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(THEME_CACHE_DIR);

      if (!dirInfo.exists) {
        return 0;
      }

      const files = await FileSystem.readDirectoryAsync(THEME_CACHE_DIR);
      let totalSize = 0;

      for (const file of files) {
        const filePath = `${THEME_CACHE_DIR}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.exists && !fileInfo.isDirectory) {
          totalSize += fileInfo.size || 0;
        }
      }

      return totalSize;
    } catch (error) {
      console.error("Failed to get cache size:", error);
      return 0;
    }
  }

  /**
   * Format bytes to human-readable size
   */
  formatSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
}

export default new ThemeCacheService();
