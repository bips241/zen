/**
 * Typography System
 *
 * Scales from huge (timer) to tiny (captions)
 * Uses system fonts for performance
 */

export const typography = {
  // Display sizes
  huge: {
    fontSize: 60,
    fontWeight: "300" as const,
    lineHeight: 72,
    letterSpacing: -1,
  },

  large: {
    fontSize: 32,
    fontWeight: "400" as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },

  title: {
    fontSize: 24,
    fontWeight: "500" as const,
    lineHeight: 32,
    letterSpacing: 0,
  },

  heading: {
    fontSize: 20,
    fontWeight: "500" as const,
    lineHeight: 28,
    letterSpacing: 0,
  },

  subheading: {
    fontSize: 18,
    fontWeight: "500" as const,
    lineHeight: 24,
    letterSpacing: 0,
  },

  // Body text
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
    letterSpacing: 0,
  },

  bodyBold: {
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 24,
    letterSpacing: 0,
  },

  // Small text
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
    letterSpacing: 0,
  },

  smallBold: {
    fontSize: 14,
    fontWeight: "600" as const,
    lineHeight: 20,
    letterSpacing: 0,
  },

  // Captions
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },

  captionBold: {
    fontSize: 12,
    fontWeight: "600" as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },

  // Tiny labels
  tiny: {
    fontSize: 10,
    fontWeight: "400" as const,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
} as const;

export type TypographyKey = keyof typeof typography;
