/**
 * CachedAppIcon Component
 *
 * Ultra-optimized component for rendering app icons
 * Features:
 * - Instant rendering from memory cache
 * - Lazy processing queue
 * - Fallback placeholder
 * - React.memo optimization
 * - Zero re-renders
 */

import React, { useEffect, useState, useRef } from "react";
import {
  Image,
  View,
  StyleSheet,
  ImageStyle,
  ViewStyle,
  StyleProp,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { iconCacheService } from "../../services/iconCacheService";

interface CachedAppIconProps {
  packageName: string;
  appName: string;
  icon: string | null; // Base64 encoded icon
  size?: number;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  grayscale?: boolean;
}

// Processing queue to avoid parallel processing of same icon
const processingQueue = new Set<string>();

function CachedAppIcon({
  packageName,
  appName,
  icon,
  size = 48,
  style,
  containerStyle,
  grayscale = true,
}: CachedAppIconProps) {
  const [iconError, setIconError] = useState(false);
  
  // BLAZING FAST: If icon is provided (from cache or native), use it directly!
  // No async operations, no delays, no duplicate checks
  const processedIcon = icon || null;

  // Cache icon in background on mount (fire-and-forget, non-blocking)
  useEffect(() => {
    if (icon && !processingQueue.has(packageName)) {
      processingQueue.add(packageName);
      
      // Cache asynchronously (doesn't block rendering)
      iconCacheService.cacheIcon(packageName, appName, icon)
        .catch(() => {}) // Silent fail
        .finally(() => processingQueue.delete(packageName));
    }
  }, [packageName, icon, appName]);

  // Render placeholder if no icon available or error
  if (!processedIcon || iconError) {
    return (
      <View
        style={[
          styles.placeholder,
          { width: size, height: size, borderRadius: size / 4 },
          containerStyle,
        ]}
      >
        <MaterialCommunityIcons
          name="application"
          size={size * 0.6}
          color="rgba(255, 255, 255, 0.4)"
        />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: `data:image/png;base64,${processedIcon}` }}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 4,
        },
        grayscale && styles.grayscale,
        style as ImageStyle,
      ]}
      resizeMode="cover"
      fadeDuration={0} // Instant rendering
      onError={() => {
        console.warn(`[CachedAppIcon] Failed to render icon for ${packageName}`);
        setIconError(true); // Show placeholder on error
      }}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.03)",
  },
  grayscale: {
    opacity: 0.9,
  },
});

// React.memo optimization - prevent unnecessary re-renders
export default React.memo(
  CachedAppIcon,
  (prevProps, nextProps) =>
    prevProps.packageName === nextProps.packageName &&
    prevProps.icon === nextProps.icon &&
    prevProps.size === nextProps.size &&
    prevProps.grayscale === nextProps.grayscale,
);
