/**
 * useSystemInsets Hook
 *
 * Real-time monitoring of Android system UI (navigation bar, status bar)
 * using native WindowInsets API.
 *
 * Features:
 * - Dynamic navigation bar visibility detection
 * - Gesture navigation support (0px bottom inset)
 * - 3-button navigation support (48px+ bottom inset)
 * - Keyboard visibility detection
 * - Event-driven updates
 */

import { useEffect, useState, useCallback } from "react";
import { NativeModules, NativeEventEmitter, Platform } from "react-native";
import { useSafeAreaInsets as useSafeAreaInsetsRN } from "react-native-safe-area-context";

const { SystemUIModule } = NativeModules;

// Debug: Log all available native modules
console.log(
  "[useSystemInsets] Available native modules:",
  Object.keys(NativeModules).sort().join(", ")
);
console.log("[useSystemInsets] SystemUIModule exists?", !!SystemUIModule);

export interface SystemInsets {
  navBarBottom: number;
  navBarTop: number;
  navBarLeft: number;
  navBarRight: number;
  statusBarTop: number;
  systemBarsBottom: number;
  systemBarsTop: number;
  keyboardHeight: number;
  keyboardVisible: boolean;
  navBarVisible: boolean;
  statusBarVisible: boolean;
}

const DEFAULT_INSETS: SystemInsets = {
  navBarBottom: 0,
  navBarTop: 0,
  navBarLeft: 0,
  navBarRight: 0,
  statusBarTop: 0,
  systemBarsBottom: 0,
  systemBarsTop: 0,
  keyboardHeight: 0,
  keyboardVisible: false,
  navBarVisible: false,
  statusBarVisible: false,
};

/**
 * Get initial insets synchronously before monitoring starts
 * This prevents the 0px flash on first render
 */
let cachedInsets: SystemInsets | null = null;

export function useSystemInsets() {
  const [insets, setInsets] = useState<SystemInsets>(DEFAULT_INSETS);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const rnSafeAreaInsets = useSafeAreaInsetsRN(); // Fallback

  useEffect(() => {
    // Fallback to react-native-safe-area-context if SystemUIModule not available
    if (Platform.OS !== "android" || !SystemUIModule) {
      console.warn(
        "[useSystemInsets] SystemUIModule not available - using SafeAreaInsets fallback"
      );

      // Map SafeAreaInsets to SystemInsets format
      setInsets({
        navBarBottom: rnSafeAreaInsets.bottom,
        navBarTop: rnSafeAreaInsets.top,
        navBarLeft: rnSafeAreaInsets.left,
        navBarRight: rnSafeAreaInsets.right,
        statusBarTop: rnSafeAreaInsets.top,
        systemBarsBottom: rnSafeAreaInsets.bottom,
        systemBarsTop: rnSafeAreaInsets.top,
        keyboardHeight: 0,
        keyboardVisible: false,
        navBarVisible: rnSafeAreaInsets.bottom > 0,
        statusBarVisible: rnSafeAreaInsets.top > 0,
      });

      return;
    }

    const eventEmitter = new NativeEventEmitter(SystemUIModule);

    // Listen for insets changes
    const insetsListener = eventEmitter.addListener(
      "onWindowInsetsChanged",
      (data: SystemInsets) => {
        console.log("[useSystemInsets] Insets changed:", data);
        setInsets(data);
        cachedInsets = data; // Update cache
      }
    );

    // Start monitoring
    SystemUIModule.startMonitoring()
      .then(() => {
        console.log("[useSystemInsets] Monitoring started");
        setIsMonitoring(true);

        // Get initial insets
        return SystemUIModule.getCurrentInsets();
      })
      .then((currentInsets: SystemInsets) => {
        console.log("[useSystemInsets] Initial insets:", currentInsets);
        setInsets(currentInsets);
        cachedInsets = currentInsets; // Cache for next render
      })
      .catch((error: Error) => {
        console.error("[useSystemInsets] Failed to start monitoring:", error);
      });

    // Cleanup
    return () => {
      insetsListener.remove();
      SystemUIModule.stopMonitoring()
        .then(() => {
          console.log("[useSystemInsets] Monitoring stopped");
          setIsMonitoring(false);
        })
        .catch((error: Error) => {
          console.error("[useSystemInsets] Failed to stop monitoring:", error);
        });
    };
  }, [rnSafeAreaInsets]); // Re-run when SafeAreaInsets change

  const refresh = useCallback(async () => {
    if (Platform.OS !== "android" || !SystemUIModule) {
      return;
    }

    try {
      const currentInsets = await SystemUIModule.getCurrentInsets();
      setInsets(currentInsets);
    } catch (error) {
      console.error("[useSystemInsets] Failed to refresh:", error);
    }
  }, []);

  return {
    insets,
    isMonitoring,
    refresh,
    // Convenience properties with safe defaults
    navBarHeight: insets.navBarBottom || 0,
    isNavBarVisible: insets.navBarVisible,
    isKeyboardVisible: insets.keyboardVisible,
    isGestureNav: insets.navBarBottom === 0,
  };
}
