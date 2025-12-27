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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "../components/atoms";
import { colors, spacing } from "../theme";

interface AmbientTrack {
  id: string;
  title: string;
  icon: string;
  duration: string;
  category: "nature" | "white-noise" | "ambient";
}

// Sample tracks - will be fetched from server
const SAMPLE_TRACKS: AmbientTrack[] = [
  {
    id: "1",
    title: "Rainfall",
    icon: "rainy",
    duration: "60:00",
    category: "nature",
  },
  {
    id: "2",
    title: "Ocean Waves",
    icon: "water",
    duration: "45:00",
    category: "nature",
  },
  {
    id: "3",
    title: "Forest",
    icon: "leaf",
    duration: "30:00",
    category: "nature",
  },
  {
    id: "4",
    title: "Thunder",
    icon: "thunderstorm",
    duration: "40:00",
    category: "nature",
  },
  {
    id: "5",
    title: "White Noise",
    icon: "radio",
    duration: "∞",
    category: "white-noise",
  },
  {
    id: "6",
    title: "Brown Noise",
    icon: "stats-chart",
    duration: "∞",
    category: "white-noise",
  },
  {
    id: "7",
    title: "Campfire",
    icon: "flame",
    duration: "45:00",
    category: "ambient",
  },
  {
    id: "8",
    title: "Cafe Ambience",
    icon: "cafe",
    duration: "60:00",
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
  const [tracks, setTracks] = useState<AmbientTrack[]>(SAMPLE_TRACKS);
  const [currentTrack, setCurrentTrack] = useState<AmbientTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);

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
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying]);

  const handleTrackSelect = (track: AmbientTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    // TODO: Implement actual audio playback
    console.log("Playing track:", track.title);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement play/pause
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTrack(null);
    // TODO: Stop playback
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
            <View style={styles.volumeTrack}>
              <View style={[styles.volumeProgress, { width: `${volume}%` }]} />
            </View>
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
  bottomSpacer: {
    height: spacing.xl,
  },
});
