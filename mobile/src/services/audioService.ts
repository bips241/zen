/**
 * Audio Service
 * Cached audio playback with expo-file-system + expo-av
 */

import { Audio } from "expo-av";
import { getAudioUri } from "./audioCacheService";

/**
 * Download progress listener
 */
type ProgressListener = (progress: number) => void;

/**
 * Audio Player Service
 */
class AudioPlayerService {
  private sound: Audio.Sound | null = null;
  private currentTrackId: string | null = null;
  private isLoaded: boolean = false;

  private onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      // Handle playback status updates
      if (status.didJustFinish && !status.isLooping) {
        console.log("Track finished");
      }
    } else if (status.error) {
      console.error("Playback error:", status.error);
    }
  };

  async loadTrack(
    trackId: string,
    onProgress?: ProgressListener,
  ): Promise<boolean> {
    try {
      // Unload previous track
      if (this.sound && this.isLoaded) {
        await this.sound.unloadAsync();
        this.sound = null;
        this.isLoaded = false;
      }

      console.log(`🎵 Loading track: ${trackId}`);

      // Get cached or download audio file
      const localUri = await getAudioUri(trackId, (progress) => {
        console.log(`Download progress: ${(progress * 100).toFixed(0)}%`);
        onProgress?.(progress);
      });

      console.log(`📂 Local URI: ${localUri}`);

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Load audio from local file
      const { sound } = await Audio.Sound.createAsync(
        { uri: localUri },
        { shouldPlay: false, isLooping: true },
        this.onPlaybackStatusUpdate,
      );

      this.sound = sound;
      this.currentTrackId = trackId;
      this.isLoaded = true;

      console.log(`✅ Loaded track: ${trackId}`);
      return true;
    } catch (error: any) {
      console.error("❌ Failed to load audio:", error);

      // Better error messages
      if (error.message?.includes("Network request failed")) {
        console.error("Network error: Check internet connection");
      } else if (error.message?.includes("DNS error")) {
        console.error(
          "Cannot resolve R2 domain - using cached version if available",
        );
      }

      return false;
    }
  }

  async play(): Promise<boolean> {
    if (!this.sound || !this.isLoaded) {
      console.warn("No track loaded");
      return false;
    }

    try {
      await this.sound.playAsync();
      return true;
    } catch (error) {
      console.error("Failed to play audio:", error);
      return false;
    }
  }

  async pause(): Promise<boolean> {
    if (!this.sound || !this.isLoaded) {
      return false;
    }

    try {
      await this.sound.pauseAsync();
      return true;
    } catch (error) {
      console.error("Failed to pause audio:", error);
      return false;
    }
  }

  async stop(): Promise<void> {
    if (!this.sound || !this.isLoaded) {
      return;
    }

    try {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
      this.currentTrackId = null;
      this.isLoaded = false;
    } catch (error) {
      console.error("Failed to stop audio:", error);
    }
  }

  getCurrentTrackId(): string | null {
    return this.currentTrackId;
  }

  async setVolume(volume: number): Promise<void> {
    if (!this.sound || !this.isLoaded) {
      return;
    }

    try {
      // Volume range: 0.0 to 1.0
      const normalizedVolume = Math.max(0, Math.min(1, volume / 100));
      await this.sound.setVolumeAsync(normalizedVolume);
    } catch (error) {
      console.error("Failed to set volume:", error);
    }
  }

  isPlaying(): boolean {
    return this.isLoaded && this.sound !== null;
  }
}

export const audioPlayer = new AudioPlayerService();
