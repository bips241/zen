export interface Theme {
  id: string;
  name: string;
  type: "video" | "static" | "oled-black";
  category: ThemeCategory;
  previewUrl: string; // Thumbnail image URL
  videoUrl?: string; // Video file URL for download
  localPath?: string; // Local cached file path
  fileSize?: number; // Size in bytes
  duration?: number; // Video duration in seconds
  description?: string;
  isPremium?: boolean;
  isDownloaded: boolean;
}

export type ThemeCategory =
  | "nature"
  | "space"
  | "abstract"
  | "minimal"
  | "urban"
  | "default";

export interface ThemeDownloadProgress {
  themeId: string;
  progress: number; // 0-100
  isDownloading: boolean;
}

// Default OLED black theme
export const OLED_BLACK_THEME: Theme = {
  id: "oled-black-default",
  name: "OLED Black",
  type: "oled-black",
  category: "default",
  previewUrl: "",
  isDownloaded: true,
  description: "Pure black background optimized for OLED displays",
};

// Available themes
export const SAMPLE_THEMES: Theme[] = [
  {
    id: "snowy-forest",
    name: "Snowy Forest",
    type: "video",
    category: "nature",
    previewUrl:
      "https://pub-b4670ee8bf2a48bbbc69e4e228d4424d.r2.dev/253308.mp4",
    videoUrl: "https://pub-b4670ee8bf2a48bbbc69e4e228d4424d.r2.dev/253308.mp4",
    fileSize: 10000000,
    duration: 60,
    description: "Peaceful snowy forest scene",
    isPremium: false,
    isDownloaded: false,
  },
];
