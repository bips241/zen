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
import { convertToGrayscale } from "../../utils/iconUtils";

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
  const [processedIcon, setProcessedIcon] = useState<string | null>(() => {
    // OPTIMIZATION: Check cache immediately on mount (synchronous)
    if (icon) {
      const cached = iconCacheService.getCachedIcon(packageName);
      return cached || null;
    }
    return null;
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    loadIconAsync();
  }, [packageName, icon]);

  const loadIconAsync = async () => {
    if (!icon) {
      setProcessedIcon(null);
      return;
    }

    // Check cache again (might have been loaded by another component)
    const cached = iconCacheService.getCachedIcon(packageName);
    if (cached) {
      if (isMountedRef.current) {
        setProcessedIcon(cached);
      }
      return;
    }

    // Avoid processing same icon multiple times
    if (processingQueue.has(packageName)) {
      // Wait for other instance to finish
      await new Promise((resolve) => setTimeout(resolve, 100));
      const nowCached = iconCacheService.getCachedIcon(packageName);
      if (nowCached && isMountedRef.current) {
        setProcessedIcon(nowCached);
      }
      return;
    }

    try {
      processingQueue.add(packageName);

      // Process icon (async, non-blocking)
      const processed = grayscale ? await convertToGrayscale(icon) : icon;

      if (isMountedRef.current) {
        setProcessedIcon(processed);
      }

      // Cache in background (fire-and-forget)
      iconCacheService.cacheIcon(packageName, appName, processed).catch(() => {
        // Silent fail - icon will be reprocessed next time
      });
    } catch (error) {
      // Fallback to original icon
      if (isMountedRef.current) {
        setProcessedIcon(icon);
      }
    } finally {
      processingQueue.delete(packageName);
    }
  };

  // Render placeholder if no icon available
  if (!processedIcon) {
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
        style,
        containerStyle,
      ]}
      resizeMode="cover"
      fadeDuration={0} // Instant rendering
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
