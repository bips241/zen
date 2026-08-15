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

import { useEffect, useRef, useState, useCallback } from "react";
import { NativeModules, NativeEventEmitter, Platform } from "react-native";
import { useSafeAreaInsets as useSafeAreaInsetsRN } from "react-native-safe-area-context";

const { SystemUIModule } = NativeModules;

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
  // ✅ Use cachedInsets as initial value — after first session, this is already correct
  // so the component renders with the right navBarHeight from frame 1 on unlock
  const [insets, setInsets] = useState<SystemInsets>(cachedInsets ?? DEFAULT_INSETS);
  const rnSafeAreaInsets = useSafeAreaInsetsRN(); // Fallback
  // Ref so the fallback branch can read the latest safe-area values without
  // re-registering the native emitter every time they change
  const rnInsetsRef = useRef(rnSafeAreaInsets);
  rnInsetsRef.current = rnSafeAreaInsets;

  useEffect(() => {
    // Fallback to react-native-safe-area-context if SystemUIModule not available
    if (Platform.OS !== "android" || !SystemUIModule) {
      const sa = rnInsetsRef.current;
      setInsets({
        navBarBottom: sa.bottom,
        navBarTop: sa.top,
        navBarLeft: sa.left,
        navBarRight: sa.right,
        statusBarTop: sa.top,
        systemBarsBottom: sa.bottom,
        systemBarsTop: sa.top,
        keyboardHeight: 0,
        keyboardVisible: false,
        navBarVisible: sa.bottom > 0,
        statusBarVisible: sa.top > 0,
      });
      return;
    }

    const eventEmitter = new NativeEventEmitter(SystemUIModule);

    // Listen for insets changes
    const insetsListener = eventEmitter.addListener(
      "onWindowInsetsChanged",
      (data: SystemInsets) => {
        setInsets(data);
        cachedInsets = data;
      },
    );

    // Start monitoring
    SystemUIModule.startMonitoring()
      .then(() => SystemUIModule.getCurrentInsets())
      .then((currentInsets: SystemInsets) => {
        setInsets(currentInsets);
        cachedInsets = currentInsets;
      })
      .catch((error: Error) => {
        console.error("[useSystemInsets] Failed to start monitoring:", error);
      });

    // Cleanup
    return () => {
      insetsListener.remove();
      SystemUIModule.stopMonitoring().catch((error: Error) => {
        console.error("[useSystemInsets] Failed to stop monitoring:", error);
      });
    };
  }, []); // ✅ Empty deps: native emitter registered once, never torn down on safe-area changes

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
    refresh,
    // Convenience properties with safe defaults
    navBarHeight: insets.navBarBottom || 0,
    isNavBarVisible: insets.navBarVisible,
    isKeyboardVisible: insets.keyboardVisible,
    isGestureNav: insets.navBarBottom === 0,
  };
}
