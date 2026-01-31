import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Theme,
  ThemeDownloadProgress,
  OLED_BLACK_THEME,
  SAMPLE_THEMES,
} from "../types/theme";

interface ThemeState {
  // Active theme
  activeTheme: Theme;

  // Available themes (includes OLED black + sample themes)
  availableThemes: Theme[];

  // Downloaded themes
  downloadedThemes: Theme[];

  // Download progress tracking
  downloadProgress: Record<string, ThemeDownloadProgress>;

  // Screensaver settings
  screensaverEnabled: boolean;
  screensaverTimeout: number; // Seconds before pausing video

  // Actions
  setActiveTheme: (theme: Theme) => void;
  addDownloadedTheme: (theme: Theme) => void;
  removeTheme: (themeId: string) => void;
  updateDownloadProgress: (themeId: string, progress: number) => void;
  setDownloadComplete: (themeId: string, localPath: string) => void;
  resetToOLEDBlack: () => void;
  setScreensaverEnabled: (enabled: boolean) => void;
  setScreensaverTimeout: (timeout: number) => void;
  initializeThemes: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeTheme: OLED_BLACK_THEME,
      availableThemes: [OLED_BLACK_THEME, ...SAMPLE_THEMES],
      downloadedThemes: [OLED_BLACK_THEME],
      downloadProgress: {},
      screensaverEnabled: true,
      screensaverTimeout: 30, // 30 seconds default

      // Actions
      setActiveTheme: (theme: Theme) => {
        set({ activeTheme: theme });
      },

      addDownloadedTheme: (theme: Theme) => {
        set((state) => ({
          downloadedThemes: [...state.downloadedThemes, theme],
        }));
      },

      removeTheme: (themeId: string) => {
        set((state) => {
          const updatedDownloaded = state.downloadedThemes.filter(
            (t) => t.id !== themeId,
          );
          const updatedAvailable = state.availableThemes.map((t) =>
            t.id === themeId
              ? { ...t, isDownloaded: false, localPath: undefined }
              : t,
          );

          // If removed theme was active, revert to OLED black
          const newActiveTheme =
            state.activeTheme.id === themeId
              ? OLED_BLACK_THEME
              : state.activeTheme;

          return {
            downloadedThemes: updatedDownloaded,
            availableThemes: updatedAvailable,
            activeTheme: newActiveTheme,
          };
        });
      },

      updateDownloadProgress: (themeId: string, progress: number) => {
        set((state) => ({
          downloadProgress: {
            ...state.downloadProgress,
            [themeId]: {
              themeId,
              progress,
              isDownloading: true,
            },
          },
        }));
      },

      setDownloadComplete: (themeId: string, localPath: string) => {
        set((state) => {
          const updatedAvailable = state.availableThemes.map((t) =>
            t.id === themeId ? { ...t, isDownloaded: true, localPath } : t,
          );

          const downloadedTheme = updatedAvailable.find(
            (t) => t.id === themeId,
          );

          const updatedDownloaded = downloadedTheme
            ? [...state.downloadedThemes, downloadedTheme]
            : state.downloadedThemes;

          const updatedProgress = { ...state.downloadProgress };
          delete updatedProgress[themeId];

          return {
            availableThemes: updatedAvailable,
            downloadedThemes: updatedDownloaded,
            downloadProgress: updatedProgress,
          };
        });
      },

      resetToOLEDBlack: () => {
        set({ activeTheme: OLED_BLACK_THEME });
      },

      setScreensaverEnabled: (enabled: boolean) => {
        set({ screensaverEnabled: enabled });
      },

      setScreensaverTimeout: (timeout: number) => {
        set({ screensaverTimeout: timeout });
      },

      initializeThemes: () => {
        // Refresh available themes list
        set({ availableThemes: [OLED_BLACK_THEME, ...SAMPLE_THEMES] });
      },
    }),
    {
      name: "zen-theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
