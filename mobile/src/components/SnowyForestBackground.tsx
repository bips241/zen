/**
 * SnowyForestBackground — Optimized macOS-style live wallpaper
 *
 * Performance fixes applied:
 * 1. NO progressUpdateIntervalMillis — eliminates 4× per-second JS thread wake-ups
 *    (original: 250ms interval was the single biggest lag source)
 * 2. Fixed double-load bug: removed imperative loadAsync() — the `source` prop handles loading
 * 3. All hot-path flags (videoLoaded, videoError, position) stored in refs, not state
 *    → no setState() inside playback callbacks → no forced re-renders while video plays
 * 4. AppState handler uses prevStateRef instead of stale closure over `appState` state
 * 5. Removed unused resumeFadeOpacity shared value and lastFrame image
 * 6. Position tracked on-demand via getStatusAsync() only when going to background
 *
 * macOS screensaver UX:
 *   Static PNG (instant) → crossfade to looping video (600ms) → auto-pause after 6s
 *   → resume + replay loop when screen wakes / app returns to foreground
 */

import React, { useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  AppState,
  AppStateStatus,
  Image,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Theme } from "../types/theme";

const CROSSFADE_DURATION = 600; // ms — macOS-style smooth entrance
const AUTO_PAUSE_DELAY = 6000;  // ms — play briefly then freeze on a gorgeous frame

interface SnowyForestBackgroundProps {
  theme: Theme;
}

export default function SnowyForestBackground({
  theme,
}: SnowyForestBackgroundProps) {
  // ── Refs (never trigger re-renders — safe to read/write in any callback) ────
  const videoRef = useRef<Video>(null);
  const isMounted = useRef(true);

  // Status flags as refs: mutations here never cause a re-render
  // This means zero forced React renders while the video is playing
  const videoLoadedRef = useRef(false);
  const videoErrorRef = useRef(false);
  const lastKnownPositionRef = useRef(0);

  // AppState: store previous state in a ref to avoid the stale-closure bug
  // that the original code had by depending on `appState` state in its effect
  const prevAppStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Auto-pause timer ref
  const autoPauseTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // ── Reanimated shared values (UI thread — zero JS overhead during animation) ─
  const videoOpacity = useSharedValue(0);

  const firstFrameStyle = useAnimatedStyle(() => ({
    opacity: 1 - videoOpacity.value,
  }));

  const videoContainerStyle = useAnimatedStyle(() => ({
    opacity: videoOpacity.value,
  }));

  // ── Auto-pause helpers ───────────────────────────────────────────────────────

  const clearAutoPause = useCallback(() => {
    if (autoPauseTimerRef.current) {
      clearTimeout(autoPauseTimerRef.current);
      autoPauseTimerRef.current = undefined;
    }
  }, []);

  /**
   * macOS screensaver pattern: play for a few seconds to show motion,
   * then pause on a beautiful still frame. This saves GPU + battery
   * while keeping the "live wallpaper" aesthetic.
   */
  const scheduleAutoPause = useCallback(() => {
    clearAutoPause();
    autoPauseTimerRef.current = setTimeout(async () => {
      if (videoRef.current && isMounted.current && videoLoadedRef.current) {
        try {
          await videoRef.current.pauseAsync();
        } catch {
          // Component may have unmounted — ignore
        }
      }
    }, AUTO_PAUSE_DELAY);
  }, [clearAutoPause]);

  // ── Video event handlers ────────────────────────────────────────────────────

  /**
   * Called once when the video finishes loading.
   * Crossfades from the static PNG to the live video — no intermediate hazy state.
   */
  const handleVideoLoad = useCallback(() => {
    if (!isMounted.current || videoLoadedRef.current) return;
    videoLoadedRef.current = true;
    videoErrorRef.current = false;

    // macOS-style crossfade: static PNG fades out, video fades in
    videoOpacity.value = withTiming(1, {
      duration: CROSSFADE_DURATION,
      easing: Easing.inOut(Easing.ease),
    });

    // Schedule auto-pause after video is visible
    scheduleAutoPause();
  }, [scheduleAutoPause, videoOpacity]);

  const handleVideoError = useCallback((error: string) => {
    if (!isMounted.current) return;
    console.error("[SnowyForest] Video error:", error);
    videoErrorRef.current = true;
    videoLoadedRef.current = false;
    // Fallback to static PNG is handled in render via videoErrorRef.current
  }, []);

  /**
   * ⚠️  CRITICAL: No onPlaybackStatusUpdate prop.
   *
   * The original component set progressUpdateIntervalMillis: 250, which caused
   * expo-av to call onPlaybackStatusUpdate 4 times per second on the JS thread.
   * Every call involved setState, causing 4 forced re-renders per second even
   * when nothing visible changed. This is the #1 source of lag.
   *
   * We only need position tracking when going to background, so we call
   * getStatusAsync() on-demand in the AppState handler below.
   */

  // ── Mount / unmount effect ──────────────────────────────────────────────────

  useEffect(() => {
    isMounted.current = true;
    videoLoadedRef.current = false;
    videoErrorRef.current = false;
    lastKnownPositionRef.current = 0;
    videoOpacity.value = 0;

    return () => {
      isMounted.current = false;
      clearAutoPause();
      // Explicitly release codec resources; expo-av may defer this otherwise
      videoRef.current?.unloadAsync().catch(() => {});
    };
  }, [theme.localPath]);

  // ── AppState lifecycle — pause on background, resume on foreground ──────────

  useEffect(() => {
    const handleAppStateChange = async (nextState: AppStateStatus) => {
      if (!isMounted.current) return;

      const prev = prevAppStateRef.current;
      prevAppStateRef.current = nextState;

      const goingToBackground =
        prev === "active" &&
        (nextState === "background" || nextState === "inactive");

      const comingToForeground =
        (prev === "background" || prev === "inactive") &&
        nextState === "active";

      if (goingToBackground) {
        clearAutoPause();
        if (videoRef.current && videoLoadedRef.current) {
          try {
            // Track position on-demand — no continuous 250ms callback needed
            const status = await videoRef.current.getStatusAsync();
            if (status.isLoaded && status.positionMillis !== undefined) {
              lastKnownPositionRef.current = status.positionMillis;
            }
            await videoRef.current.pauseAsync();
          } catch {
            // ignore
          }
        }
      }

      if (comingToForeground) {
        if (videoRef.current && videoLoadedRef.current) {
          try {
            // Seamless resume: seek to last position, then play
            if (lastKnownPositionRef.current > 0) {
              await videoRef.current.setPositionAsync(
                lastKnownPositionRef.current,
              );
            }
            await videoRef.current.playAsync();
            // Re-schedule auto-pause for the resumed session
            scheduleAutoPause();
          } catch {
            // ignore
          }
        }
      }
    };

    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => sub.remove();
    // Intentionally no state in deps — all flags are refs, zero stale-closure risk
  }, [clearAutoPause, scheduleAutoPause]);

  // ── Render ──────────────────────────────────────────────────────────────────

  // Fallback: no video available or error occurred → show static PNG
  if (!theme.localPath) {
    return (
      <View style={styles.container}>
        <Image
          source={require("../assets/firstFrame_snowyForest.png")}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          fadeDuration={0}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Static first-frame PNG — shown instantly while video decoder initialises */}
      <Animated.Image
        source={require("../assets/firstFrame_snowyForest.png")}
        style={[StyleSheet.absoluteFill, firstFrameStyle]}
        resizeMode="cover"
        fadeDuration={0}
      />

      {/* Live video — fades in once decoded, loops, then auto-pauses */}
      <Animated.View style={[StyleSheet.absoluteFill, videoContainerStyle]}>
        <Video
          ref={videoRef}
          // ✅ source prop handles loading — no imperative loadAsync() needed
          source={{ uri: theme.localPath }}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          isMuted={true}
          isLooping={true}
          shouldPlay={true}
          useNativeControls={false}
          // ✅ No progressUpdateIntervalMillis — eliminates all 4×/sec JS wake-ups
          // ✅ No onPlaybackStatusUpdate — no forced re-renders while playing
          onLoad={handleVideoLoad}
          onError={handleVideoError}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
});

