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
import { NativeModules, NativeEventEmitter, Platform, PixelRatio, AppState, AppStateStatus } from "react-native";
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

// Helper to convert physical pixels to DP
const convertToDP = (insets: SystemInsets): SystemInsets => {
  const scale = PixelRatio.get();
  return {
    navBarBottom: Math.round(insets.navBarBottom / scale),
    navBarTop: Math.round(insets.navBarTop / scale),
    navBarLeft: Math.round(insets.navBarLeft / scale),
    navBarRight: Math.round(insets.navBarRight / scale),
    statusBarTop: Math.round(insets.statusBarTop / scale),
    systemBarsBottom: Math.round(insets.systemBarsBottom / scale),
    systemBarsTop: Math.round(insets.systemBarsTop / scale),
    keyboardHeight: Math.round(insets.keyboardHeight / scale),
    keyboardVisible: insets.keyboardVisible,
    navBarVisible: insets.navBarVisible,
    statusBarVisible: insets.statusBarVisible,
  };
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
        const dpData = convertToDP(data);
        setInsets(dpData);
        cachedInsets = dpData;
      },
    );

    // Start monitoring
    SystemUIModule.startMonitoring()
      .then(() => SystemUIModule.getCurrentInsets())
      .then((currentInsets: SystemInsets) => {
        const dpInsets = convertToDP(currentInsets);
        setInsets(dpInsets);
        cachedInsets = dpInsets;
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
      const dpInsets = convertToDP(currentInsets);
      setInsets(dpInsets);
    } catch (error) {
      console.error("[useSystemInsets] Failed to refresh:", error);
    }
  }, []);

  // Refresh on app active state (wake/lock cycle resume)
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") {
        refresh();
      }
    });
    return () => sub.remove();
  }, [refresh]);

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
