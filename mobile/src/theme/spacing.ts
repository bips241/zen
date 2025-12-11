/**
 * Spacing System - 8pt Grid
 * 
 * All spacing uses multiples of 8
 */

export const spacing = {
  none: 0,
  xs: 4,    // 0.5 * 8
  sm: 8,    // 1 * 8
  md: 16,   // 2 * 8
  lg: 24,   // 3 * 8
  xl: 32,   // 4 * 8
  xxl: 48,  // 6 * 8
  xxxl: 64, // 8 * 8
} as const;

export type SpacingKey = keyof typeof spacing;

// Helper function
export const sp = (key: SpacingKey): number => spacing[key];
