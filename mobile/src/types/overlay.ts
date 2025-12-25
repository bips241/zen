/**
 * Overlay & Friction Moments Types
 */

export interface FrictionConfig {
  enabled: boolean;
  delaySeconds: number;
  blockedApps: string[];
}

export interface UsageLimitConfig {
  packageName: string;
  appName: string;
  limitMinutes: number;
  currentUsage: number;
}

export interface OverlayResult {
  success: boolean;
  enabled?: boolean;
  message?: string;
}

export interface PermissionResult {
  hasPermission: boolean;
}

export interface UsageResult {
  usageMinutes: number;
  packageName: string;
}

export interface FrictionConfigResult {
  success: boolean;
  delaySeconds: number;
  blockedAppsCount: number;
}

export interface UsageLimitResult {
  success: boolean;
  packageName: string;
  limitMinutes: number;
}
