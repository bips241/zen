/**
 * Color Palette - OLED Optimized
 *
 * True black (#000000) for OLED power saving
 * Minimal white for contrast
 * Zen green for accent
 */

export const colors = {
  // Core Colors
  black: "#000000", // True black (OLED)
  white: "#FFFFFF", // Pure white

  // Grayscale (Subtle variations for depth)
  gray: {
    900: "#111111", // Subtle black
    800: "#222222", // Card backgrounds
    700: "#333333", // Borders
    600: "#444444", // Disabled
    500: "#888888", // Secondary text
    400: "#AAAAAA", // Placeholder
    300: "#CCCCCC", // Tertiary text
    200: "#DDDDDD", // Light borders
    100: "#EEEEEE", // Very light
  },

  // Accent & Semantic Colors
  accent: "#FFFFFF", // Pure white (changed from green)
  accentDark: "#CCCCCC", // Gray white
  accentLight: "#FFFFFF", // Bright white

  error: "#FF4444", // Error red
  errorDark: "#CC0000", // Darker red

  warning: "#FFAA00", // Warning orange
  warningDark: "#CC8800",

  success: "#00CC66", // Success green
  successDark: "#009944",

  info: "#00AAFF", // Info blue
  infoDark: "#0088CC",

  // Transparent overlays
  overlay: {
    light: "rgba(255, 255, 255, 0.1)",
    medium: "rgba(255, 255, 255, 0.2)",
    dark: "rgba(0, 0, 0, 0.5)",
    darker: "rgba(0, 0, 0, 0.8)",
  },
} as const;

export type ColorKey = keyof typeof colors;
export type GrayShade = keyof typeof colors.gray;
