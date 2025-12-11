/**
 * Theme System - Central Export
 * 
 * Import theme tokens from here:
 * import { colors, typography, spacing } from '@/theme';
 */

export * from './colors';
export * from './typography';
export * from './spacing';

// Theme configuration
export const theme = {
  // Animation timings
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  // Border radius
  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  // Shadows (for elevated cards)
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
  
  // Haptic feedback patterns
  haptic: {
    light: 'impactLight' as const,
    medium: 'impactMedium' as const,
    heavy: 'impactHeavy' as const,
    success: 'notificationSuccess' as const,
    warning: 'notificationWarning' as const,
    error: 'notificationError' as const,
  },
} as const;
