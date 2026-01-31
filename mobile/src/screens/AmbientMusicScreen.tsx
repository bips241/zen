/**
 * Ambient Music Screen
 * Play background ambient sounds for focus
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "../components/atoms";
import { colors, spacing } from "../theme";
import { audioPlayer } from "../services/audioService";
import { runNetworkDiagnostics } from "../services/networkDiagnostics";

interface AmbientTrack {
  id: string;
  title: string;
  icon: string;
  duration: string;
  category: "nature" | "white-noise" | "ambient" | "binaural";
}

const AVAILABLE_TRACKS: AmbientTrack[] = [
  // Nature Sounds
  {
    id: "rainfall",
    title: "Rain",
    icon: "rainy",
    duration: "13 min",
    category: "nature",
  },
  {
    id: "ocean_waves",
    title: "Ocean Waves",
    icon: "water",
    duration: "3 min",
    category: "nature",
  },
  {
    id: "forest",
    title: "Forest",
    icon: "leaf",
    duration: "1:40",
    category: "nature",
  },
  {
    id: "thunder",
    title: "Thunderstorm",
    icon: "thunderstorm",
    duration: "1:55",
    category: "nature",
  },
  // White Noise
  {
    id: "brown_noise",
    title: "Brown/Pink Noise",
    icon: "stats-chart",
    duration: "5:45",
    category: "white-noise",
  },
  // Ambient
  {
    id: "campfire",
    title: "Campfire",
    icon: "flame",
    duration: "4:20",
    category: "ambient",
  },
  {
    id: "cafe",
    title: "Coffee Shop",
    icon: "cafe",
    duration: "1:15",
    category: "ambient",
  },
  {
    id: "deep_focus",
    title: "Deep Sleep",
    icon: "musical-note",
    duration: "8:20",
    category: "ambient",
  },
];

interface AmbientMusicScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export default function AmbientMusicScreen({
  navigation,
}: AmbientMusicScreenProps) {
  const [tracks, setTracks] = useState<AmbientTrack[]>(AVAILABLE_TRACKS);
  const [currentTrack, setCurrentTrack] = useState<AmbientTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Pulse animation when playing
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying]);

  const handleTrackSelect = async (track: AmbientTrack) => {
    setIsLoading(true);
    setLoadingTrackId(track.id);
    setDownloadProgress(0);

    try {
      // Load and play new track
      const loaded = await audioPlayer.loadTrack(track.id, (progress) => {
        setDownloadProgress(progress);
      });

      if (!loaded) {
        // Run network diagnostics
        console.log("Running network diagnostics...");
        const diagnostics = await runNetworkDiagnostics();

        let errorMessage = "Failed to download or load audio.\n\n";

        if (!diagnostics.internetOk) {
          errorMessage +=
            "No internet connection detected.\nPlease check your WiFi or mobile data.";
        } else if (!diagnostics.r2DnsOk) {
          errorMessage += "Cannot connect to audio server (DNS issue).\n\n";
          errorMessage += "Possible solutions:\n";
          errorMessage += "• Wait a few minutes and try again\n";
          errorMessage += "• Check your DNS settings\n";
          errorMessage += "• Try connecting to a different network\n";
          errorMessage += "• Contact support if issue persists";
        } else {
          errorMessage += diagnostics.recommendations.join("\n");
        }

        Alert.alert("Cannot Play Audio", errorMessage);
        setIsLoading(false);
        setLoadingTrackId(null);
        setDownloadProgress(0);
        return;
      }

      const playing = await audioPlayer.play();

      if (playing) {
        setCurrentTrack(track);
        setIsPlaying(true);
      } else {
        Alert.alert("Error", "Failed to play audio");
      }
    } catch (error: any) {
      console.error("Error playing track:", error);
      Alert.alert(
        "Playback Error",
        error.message ||
          "Unknown error occurred.\n\nPlease check your internet connection and try again.",
      );
    } finally {
      setIsLoading(false);
      setLoadingTrackId(null);
      setDownloadProgress(0);
    }
  };

  const handlePlayPause = async () => {
    if (!currentTrack) return;

    if (isPlaying) {
      await audioPlayer.pause();
      setIsPlaying(false);
    } else {
      const playing = await audioPlayer.play();
      if (playing) {
        setIsPlaying(true);
      }
    }
  };

  const handleStop = async () => {
    await audioPlayer.stop();
    setIsPlaying(false);
    setCurrentTrack(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioPlayer.stop();
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (currentTrack) {
      audioPlayer.setVolume(volume);
    }
  }, [volume]);

  const handleVolumeChange = (event: any) => {
    if (!currentTrack) return;

    const { locationX } = event.nativeEvent;
    const trackWidth = event.nativeEvent.target.measure(
      (x: number, y: number, width: number) => {
        const newVolume = Math.round((locationX / width) * 100);
        setVolume(Math.max(0, Math.min(100, newVolume)));
      },
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "nature":
        return "leaf";
      case "white-noise":
        return "radio";
      case "ambient":
        return "musical-note";
      default:
        return "musical-notes";
    }
  };

  const getTrackIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      rainy: "rainy",
      water: "water",
      leaf: "leaf",
      thunderstorm: "thunderstorm",
      radio: "radio",
      "stats-chart": "stats-chart",
      flame: "flame",
      cafe: "cafe",
    };
    return iconMap[iconName] || "musical-notes";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ambient Sounds</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      {/* Now Playing Card */}
      {currentTrack && (
        <Animated.View
          style={[
            styles.nowPlayingCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <View style={styles.nowPlayingContent}>
            <Animated.View
              style={[
                styles.nowPlayingIcon,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Ionicons
                name={getTrackIcon(currentTrack.icon)}
                size={40}
                color="#FFFFFF"
              />
            </Animated.View>

            <View style={styles.nowPlayingInfo}>
              <Text style={styles.nowPlayingTitle}>{currentTrack.title}</Text>
              <Text style={styles.nowPlayingStatus}>
                {isPlaying ? "Now Playing" : "Paused"}
              </Text>
            </View>

            <View style={styles.playbackControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handlePlayPause}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleStop}
                activeOpacity={0.7}
              >
                <Ionicons name="stop" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Volume Control */}
          <View style={styles.volumeControl}>
            <Ionicons
              name="volume-low"
              size={20}
              color="rgba(255, 255, 255, 0.6)"
            />
            <TouchableOpacity
              style={styles.volumeTrack}
              activeOpacity={0.9}
              onPress={(e) => {
                if (!currentTrack) return;
                const { locationX } = e.nativeEvent;
                // @ts-ignore - measure exists on native event target
                e.nativeEvent.target.measure?.(
                  (
                    x: number,
                    y: number,
                    width: number,
                    height: number,
                    pageX: number,
                    pageY: number,
                  ) => {
                    const clickX = locationX;
                    const newVolume = Math.round((clickX / width) * 100);
                    setVolume(Math.max(0, Math.min(100, newVolume)));
                  },
                );
              }}
            >
              <View style={[styles.volumeProgress, { width: `${volume}%` }]} />
            </TouchableOpacity>
            <Ionicons
              name="volume-high"
              size={20}
              color="rgba(255, 255, 255, 0.6)"
            />
            <Text style={styles.volumeText}>{volume}%</Text>
          </View>
        </Animated.View>
      )}

      {/* Categories & Tracks */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Nature Sounds */}
        <Animated.View
          style={[
            styles.categorySection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <View style={styles.categoryHeader}>
            <Ionicons name="leaf" size={20} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.categoryTitle}>Nature Sounds</Text>
          </View>
          <View style={styles.tracksGrid}>
            {tracks
              .filter((track) => track.category === "nature")
              .map((track) => (
                <TouchableOpacity
                  key={track.id}
                  style={[
                    styles.trackCard,
                    currentTrack?.id === track.id && styles.trackCardActive,
                  ]}
                  onPress={() => handleTrackSelect(track)}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  <View style={styles.trackIconContainer}>
                    <Ionicons
                      name={getTrackIcon(track.icon)}
                      size={32}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text style={styles.trackTitle}>{track.title}</Text>
                  <Text style={styles.trackDuration}>{track.duration}</Text>

                  {/* Download progress */}
                  {isLoading &&
                    loadingTrackId === track.id &&
                    downloadProgress > 0 &&
                    downloadProgress < 1 && (
                      <View style={styles.downloadProgress}>
                        <View
                          style={[
                            styles.downloadProgressBar,
                            { width: `${downloadProgress * 100}%` },
                          ]}
                        />
                      </View>
                    )}
                </TouchableOpacity>
              ))}
          </View>
        </Animated.View>

        {/* White Noise */}
        <Animated.View
          style={[
            styles.categorySection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <View style={styles.categoryHeader}>
            <Ionicons name="radio" size={20} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.categoryTitle}>White Noise</Text>
          </View>
          <View style={styles.tracksGrid}>
            {tracks
              .filter((track) => track.category === "white-noise")
              .map((track) => (
                <TouchableOpacity
                  key={track.id}
                  style={[
                    styles.trackCard,
                    currentTrack?.id === track.id && styles.trackCardActive,
                  ]}
                  onPress={() => handleTrackSelect(track)}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  <View style={styles.trackIconContainer}>
                    <Ionicons
                      name={getTrackIcon(track.icon)}
                      size={32}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text style={styles.trackTitle}>{track.title}</Text>
                  <Text style={styles.trackDuration}>{track.duration}</Text>

                  {/* Download progress */}
                  {isLoading &&
                    loadingTrackId === track.id &&
                    downloadProgress > 0 &&
                    downloadProgress < 1 && (
                      <View style={styles.downloadProgress}>
                        <View
                          style={[
                            styles.downloadProgressBar,
                            { width: `${downloadProgress * 100}%` },
                          ]}
                        />
                      </View>
                    )}
                </TouchableOpacity>
              ))}
          </View>
        </Animated.View>

        {/* Ambient */}
        <Animated.View
          style={[
            styles.categorySection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <View style={styles.categoryHeader}>
            <Ionicons
              name="musical-note"
              size={20}
              color="rgba(255, 255, 255, 0.8)"
            />
            <Text style={styles.categoryTitle}>Ambient</Text>
          </View>
          <View style={styles.tracksGrid}>
            {tracks
              .filter((track) => track.category === "ambient")
              .map((track) => (
                <TouchableOpacity
                  key={track.id}
                  style={[
                    styles.trackCard,
                    currentTrack?.id === track.id && styles.trackCardActive,
                  ]}
                  onPress={() => handleTrackSelect(track)}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  <View style={styles.trackIconContainer}>
                    <Ionicons
                      name={getTrackIcon(track.icon)}
                      size={32}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text style={styles.trackTitle}>{track.title}</Text>
                  <Text style={styles.trackDuration}>{track.duration}</Text>

                  {/* Download progress */}
                  {isLoading &&
                    loadingTrackId === track.id &&
                    downloadProgress > 0 &&
                    downloadProgress < 1 && (
                      <View style={styles.downloadProgress}>
                        <View
                          style={[
                            styles.downloadProgressBar,
                            { width: `${downloadProgress * 100}%` },
                          ]}
                        />
                      </View>
                    )}
                </TouchableOpacity>
              ))}
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.md,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    color: colors.white,
    fontWeight: "400",
  },
  placeholder: {
    width: 40,
  },

  // Now Playing Card
  nowPlayingCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  nowPlayingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  nowPlayingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  nowPlayingInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  nowPlayingTitle: {
    fontSize: 18,
    color: colors.white,
    fontWeight: "500",
  },
  nowPlayingStatus: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  playbackControls: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Volume Control
  volumeControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  volumeTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  volumeProgress: {
    height: "100%",
    backgroundColor: colors.white,
    borderRadius: 2,
  },
  volumeText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    minWidth: 40,
    textAlign: "right",
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },

  // Categories
  categorySection: {
    marginBottom: spacing.xl,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryTitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Tracks Grid
  tracksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  trackCard: {
    width: "47%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.sm,
  },
  trackCardActive: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  trackIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  trackTitle: {
    fontSize: 14,
    color: colors.white,
    fontWeight: "500",
    textAlign: "center",
  },
  trackDuration: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
  },
  downloadProgress: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: "hidden",
  },
  downloadProgressBar: {
    height: "100%",
    backgroundColor: "#00FF88",
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
