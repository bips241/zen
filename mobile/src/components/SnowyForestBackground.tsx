import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Dimensions,
  StyleSheet,
  AppState,
  AppStateStatus,
} from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import * as FileSystem from "expo-file-system";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Theme } from "../types/theme";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");

// Timing constants
const CROSSFADE_DURATION = 1000;
const RESUME_FADE_DURATION = 400;
const VIDEO_POSITION_UPDATE_INTERVAL = 250;
const AUTO_PAUSE_DELAY = 5000;
const VIDEO_VALIDATION_TIMEOUT = 3000;
const MAX_RETRY_ATTEMPTS = 2;

interface SnowyForestBackgroundProps {
  theme: Theme; // Theme object with localPath (cached video from CDN)
}

export default function SnowyForestBackground({
  theme,
}: SnowyForestBackgroundProps) {
  // ═══════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isPreloading, setIsPreloading] = useState(true);
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );
  const [retryCount, setRetryCount] = useState(0);

  // Refs
  const lastKnownPosition = useRef<number>(0);
  const isResuming = useRef(false);
  const videoRef = useRef<Video>(null);
  const autoPauseTimeoutRef = useRef<NodeJS.Timeout>();
  const loadTimeoutRef = useRef<NodeJS.Timeout>();
  const isMounted = useRef(true);
  const isUnloading = useRef(false);
  const autoPauseScheduled = useRef(false);
  const lastPlayingState = useRef(false);
  const hasLoadedOnce = useRef(false); // Prevent duplicate load logs

  // Reanimated values
  const crossfadeOpacity = useSharedValue(0);
  const resumeFadeOpacity = useSharedValue(0);

  // ═══════════════════════════════════════════════════════════════
  // ANIMATED STYLES
  // ═══════════════════════════════════════════════════════════════

  const firstFrameStyle = useAnimatedStyle(() => ({
    opacity: 1 - crossfadeOpacity.value,
  }));

  const videoContainerStyle = useAnimatedStyle(() => ({
    opacity: crossfadeOpacity.value,
  }));

  const lastFrameStyle = useAnimatedStyle(() => ({
    opacity: 1 - resumeFadeOpacity.value,
  }));

  // ═══════════════════════════════════════════════════════════════
  // VIDEO VALIDATION
  // ═══════════════════════════════════════════════════════════════

  const validateVideoFile = useCallback(async (localPath: string) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(localPath);

      if (!fileInfo.exists) {
        console.error("[SnowyForest] Video file does not exist:", localPath);
        return false;
      }

      if (fileInfo.size === 0) {
        console.error("[SnowyForest] Video file is empty:", localPath);
        return false;
      }

      console.log(
        `[SnowyForest] Video validated: ${(fileInfo.size / 1024 / 1024).toFixed(
          2,
        )}MB`,
      );
      return true;
    } catch (error) {
      console.error("[SnowyForest] Video validation error:", error);
      return false;
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // PLAYBACK HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const scheduleAutoPause = useCallback(() => {
    // Prevent duplicate scheduling
    if (autoPauseScheduled.current) {
      return;
    }

    // Clear any existing timer
    if (autoPauseTimeoutRef.current) {
      clearTimeout(autoPauseTimeoutRef.current);
      autoPauseTimeoutRef.current = undefined;
    }

    console.log("[SnowyForest] Scheduling auto-pause in 5s");
    autoPauseScheduled.current = true;

    autoPauseTimeoutRef.current = setTimeout(async () => {
      if (videoRef.current && isMounted.current) {
        try {
          console.log("[SnowyForest] Auto-pausing video");
          await videoRef.current.pauseAsync();
          autoPauseScheduled.current = false;
          lastPlayingState.current = false; // Reset so next play triggers auto-pause
        } catch (err) {
          console.error("[SnowyForest] Auto-pause error:", err);
        }
      }
    }, AUTO_PAUSE_DELAY);
  }, []);

  const handlePlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        if (status.error) {
          console.error("[SnowyForest] Playback error:", status.error);
          setVideoError(true);
        }
        return;
      }

      // Track position
      if (status.positionMillis !== undefined) {
        lastKnownPosition.current = status.positionMillis;
      }

      // Clear error state if playing successfully
      if (status.isPlaying && videoError) {
        setVideoError(false);
      }

      // Schedule auto-pause only when video transitions from NOT playing to playing
      const wasPlaying = lastPlayingState.current;
      const isPlaying = status.isPlaying;

      if (!wasPlaying && isPlaying) {
        console.log(
          "[SnowyForest] Video started playing, scheduling auto-pause",
        );
        lastPlayingState.current = true;
        scheduleAutoPause();
      } else if (wasPlaying && !isPlaying) {
        // Video was paused/stopped
        lastPlayingState.current = false;
        autoPauseScheduled.current = false;
        // Clear auto-pause timer when video stops
        if (autoPauseTimeoutRef.current) {
          clearTimeout(autoPauseTimeoutRef.current);
          autoPauseTimeoutRef.current = undefined;
        }
      }
    },
    [videoError, scheduleAutoPause],
  );

  const handleVideoLoad = useCallback(() => {
    if (!isMounted.current || hasLoadedOnce.current) return;

    hasLoadedOnce.current = true; // Mark as loaded to prevent duplicate logs
    console.log("[SnowyForest] Video loaded successfully");

    // Clear load timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }

    // INSTANT transition - no hazy intermediate state
    setVideoLoaded(true);
    setVideoError(false);
    setRetryCount(0);
    setIsPreloading(false);

    // Immediate opacity change for clean transition
    crossfadeOpacity.value = withTiming(1, {
      duration: 300, // Faster, cleaner transition
      easing: Easing.inOut(Easing.ease),
    });
  }, []);

  const handleVideoError = useCallback(
    (error: string) => {
      if (!isMounted.current) return;

      console.error("[SnowyForest] Video error:", error);
      setVideoError(true);

      // Clear load timeout
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }

      // Retry logic
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        console.log(
          `[SnowyForest] Retrying... (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`,
        );
        setTimeout(() => {
          if (isMounted.current) {
            setRetryCount((prev) => prev + 1);
          }
        }, 1000);
      }
    },
    [retryCount],
  );

  // ═══════════════════════════════════════════════════════════════
  // VIDEO LOADING EFFECT
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    isMounted.current = true;
    isUnloading.current = false;
    hasLoadedOnce.current = false; // Reset load flag

    // Reset state
    setVideoLoaded(false);
    setVideoError(false);
    setIsPreloading(true);
    crossfadeOpacity.value = 0;
    resumeFadeOpacity.value = 0;
    lastKnownPosition.current = 0;
    autoPauseScheduled.current = false;
    lastPlayingState.current = false;

    const loadVideo = async () => {
      if (!videoRef.current || !theme.localPath || !isMounted.current) return;

      try {
        // Validate file first
        const isValid = await validateVideoFile(theme.localPath);
        if (!isValid) {
          handleVideoError("Video file validation failed");
          return;
        }

        // Set load timeout
        loadTimeoutRef.current = setTimeout(() => {
          if (!videoLoaded && isMounted.current) {
            console.warn("[SnowyForest] Video load timeout");
            handleVideoError("Video load timeout");
          }
        }, VIDEO_VALIDATION_TIMEOUT);

        // Unload previous video if any
        if (videoRef.current) {
          await videoRef.current.unloadAsync().catch(() => {});
        }

        // Load new video
        await videoRef.current.loadAsync(
          { uri: theme.localPath },
          {
            isMuted: true,
            isLooping: true,
            shouldPlay: true,
            progressUpdateIntervalMillis: VIDEO_POSITION_UPDATE_INTERVAL,
          },
          false,
        );
      } catch (error) {
        console.error("[SnowyForest] Load error:", error);
        handleVideoError(String(error));
      }
    };

    if (theme.localPath && !isUnloading.current) {
      loadVideo();
    }

    // Cleanup
    return () => {
      isMounted.current = false;
      isUnloading.current = true;

      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      if (autoPauseTimeoutRef.current) {
        clearTimeout(autoPauseTimeoutRef.current);
      }

      // Unload video
      videoRef.current?.unloadAsync().catch(() => {});
    };
  }, [theme.localPath, retryCount]);

  // ═══════════════════════════════════════════════════════════════
  // APP STATE LIFECYCLE
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (!isMounted.current) return;

      const previousState = appState;
      setAppState(nextAppState);

      // Going to background
      if (
        previousState === "active" &&
        (nextAppState === "background" || nextAppState === "inactive")
      ) {
        if (videoRef.current && videoLoaded && !videoError) {
          try {
            // Clear auto-pause timer when going to background
            if (autoPauseTimeoutRef.current) {
              clearTimeout(autoPauseTimeoutRef.current);
              autoPauseTimeoutRef.current = undefined;
            }

            await videoRef.current.pauseAsync();
            lastPlayingState.current = false;
            autoPauseScheduled.current = false;
          } catch (error) {
            console.error("[SnowyForest] Pause error:", error);
          }
        }
      }

      // Coming to foreground - seamless resume without overlay
      else if (
        (previousState === "background" || previousState === "inactive") &&
        nextAppState === "active"
      ) {
        if (videoRef.current && videoLoaded && !videoError) {
          try {
            console.log("[SnowyForest] Resuming video from background");
            lastPlayingState.current = false;
            autoPauseScheduled.current = false;

            // Resume from last position seamlessly
            if (lastKnownPosition.current > 0) {
              await videoRef.current.setPositionAsync(
                lastKnownPosition.current,
              );
            }
            await videoRef.current.playAsync();
          } catch (error) {
            console.error("[SnowyForest] Resume error:", error);
          }
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => subscription?.remove();
  }, [appState, videoLoaded, videoError, scheduleAutoPause]);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  // Fallback: No video or error
  if (!theme.localPath || videoError) {
    return (
      <View style={styles.container}>
        <Animated.Image
          source={require("../assets/firstFrame_snowyForest.png")}
          style={styles.backgroundLayer}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* First Frame (loading state) - Only shown while preloading */}
      {isPreloading && (
        <Animated.Image
          source={require("../assets/firstFrame_snowyForest.png")}
          style={[styles.backgroundLayer, firstFrameStyle]}
          resizeMode="cover"
          fadeDuration={0}
        />
      )}

      {/* Video Player - Clean playback without overlays */}
      <Animated.View style={[styles.backgroundLayer, videoContainerStyle]}>
        <Video
          ref={videoRef}
          source={{ uri: theme.localPath }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          isMuted={true}
          isLooping={true}
          shouldPlay={true}
          useNativeControls={false}
          progressUpdateIntervalMillis={VIDEO_POSITION_UPDATE_INTERVAL}
          onLoad={handleVideoLoad}
          onError={handleVideoError}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
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
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
});
