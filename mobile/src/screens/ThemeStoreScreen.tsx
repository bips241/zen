import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Text } from "../components/atoms";
import { useNavigation } from "@react-navigation/native";
import { useThemeStore } from "../store/themeStore";
import { Theme } from "../types/theme";
import themeCache from "../services/themeCache";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ThemeStoreScreen() {
  const navigation = useNavigation();
  const {
    availableThemes,
    activeTheme,
    downloadProgress,
    setActiveTheme,
    updateDownloadProgress,
    setDownloadComplete,
    removeTheme,
    resetToOLEDBlack,
    initializeThemes,
  } = useThemeStore();

  const [cacheSize, setCacheSize] = useState<string>("0 B");
  const [pausedDownloads, setPausedDownloads] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    initializeThemes();
    loadCacheSize();
  }, []);

  const loadCacheSize = async () => {
    const size = await themeCache.getCacheSize();
    setCacheSize(themeCache.formatSize(size));
  };

  const handleActivate = async (theme: Theme) => {
    if (theme.type === "oled-black") {
      setActiveTheme(theme);
      return;
    }

    if (theme.isDownloaded && theme.localPath) {
      setActiveTheme(theme);
    }
  };

  const handleDownload = async (theme: Theme) => {
    try {
      updateDownloadProgress(theme.id, 0);

      const localPath = await themeCache.downloadTheme(theme, (progress) => {
        updateDownloadProgress(theme.id, progress);
      });

      setDownloadComplete(theme.id, localPath);
      await loadCacheSize();

      Alert.alert(
        "Downloaded",
        `${theme.name} is ready. Tap "Activate" to apply.`,
        [{ text: "OK" }],
      );
    } catch (error) {
      updateDownloadProgress(theme.id, 0);
      Alert.alert(
        "Download Failed",
        "Could not download theme. Check your connection.",
      );
      console.error("Theme download error:", error);
    }
  };

  const handleCancelDownload = (themeId: string) => {
    // Clear download progress
    const currentProgress = { ...downloadProgress };
    delete currentProgress[themeId];
    useThemeStore.setState({ downloadProgress: currentProgress });
  };

  const handleDelete = async (theme: Theme) => {
    Alert.alert(
      "Delete Theme",
      `Are you sure you want to delete "${theme.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await themeCache.deleteTheme(theme.id);
              removeTheme(theme.id);
              await loadCacheSize();
              Alert.alert("Deleted", `${theme.name} has been removed`);
            } catch (error) {
              Alert.alert("Error", "Failed to delete theme");
            }
          },
        },
      ],
    );
  };

  const handleClearCache = async () => {
    Alert.alert(
      "Clear All Themes",
      "This will delete all downloaded themes. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await themeCache.clearCache();
              resetToOLEDBlack();
              await loadCacheSize();
              Alert.alert("Success", "All themes cleared");
            } catch (error) {
              Alert.alert("Error", "Failed to clear cache");
            }
          },
        },
      ],
    );
  };

  const renderThemeCard = (theme: Theme) => {
    const isActive = activeTheme.id === theme.id;
    const progress = downloadProgress[theme.id];
    const isDownloading = progress?.isDownloading;

    return (
      <View key={theme.id} style={styles.themeCard}>
        {/* Preview Image */}
        <View style={styles.previewContainer}>
          {theme.type === "oled-black" ? (
            <View style={styles.oledPreview}>
              <Text style={styles.oledText}>●</Text>
            </View>
          ) : (
            <Image
              source={{ uri: theme.previewUrl }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          )}
          {isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>ACTIVE</Text>
            </View>
          )}
        </View>

        {/* Theme Info */}
        <View style={styles.themeInfo}>
          <Text style={styles.themeName}>{theme.name}</Text>
          <Text style={styles.themeCategory}>
            {theme.category.toUpperCase()}
          </Text>
          {theme.description && (
            <Text style={styles.themeDescription} numberOfLines={2}>
              {theme.description}
            </Text>
          )}

          {theme.fileSize && (
            <Text style={styles.themeSize}>
              {themeCache.formatSize(theme.fileSize)}
              {theme.duration && ` • ${theme.duration}s`}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.themeActions}>
          {isDownloading ? (
            <>
              <View style={styles.downloadProgressContainer}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.round(progress.progress)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.downloadProgressText}>
                  {Math.round(progress.progress)}%
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleCancelDownload(theme.id)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>✕</Text>
              </TouchableOpacity>
            </>
          ) : theme.isDownloaded ? (
            <>
              {!isActive ? (
                <>
                  <TouchableOpacity
                    onPress={() => handleActivate(theme)}
                    style={styles.activateButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.activateButtonText}>Activate</Text>
                  </TouchableOpacity>
                  {theme.type !== "oled-black" && (
                    <TouchableOpacity
                      onPress={() => handleDelete(theme)}
                      style={styles.deleteButton}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <View style={styles.activeIndicator}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeText}>Currently Active</Text>
                </View>
              )}
            </>
          ) : (
            <TouchableOpacity
              onPress={() => handleDownload(theme)}
              style={styles.downloadButton}
              activeOpacity={0.8}
            >
              <Text style={styles.downloadButtonText}>Download</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Theme Store</Text>
          <Text style={styles.headerSubtitle}>Customize your homescreen</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Cache Info */}
      <View style={styles.cacheInfo}>
        <Text style={styles.cacheText}>Cache: {cacheSize}</Text>
        <TouchableOpacity onPress={handleClearCache}>
          <Text style={styles.clearCacheButton}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Theme Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.themeGrid}
      >
        {availableThemes.map((theme) => renderThemeCard(theme))}
      </ScrollView>

      {/* Reset Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => {
            resetToOLEDBlack();
            Alert.alert("Reset", "Theme reset to OLED Black");
          }}
          style={styles.resetButton}
        >
          <Text style={styles.resetButtonText}>Reset to OLED Black</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: SCREEN_HEIGHT > 700 ? 48 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "400",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 32,
    color: "#FFFFFF",
    lineHeight: 32,
  },
  cacheInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  cacheText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  clearCacheButton: {
    fontSize: 12,
    color: "#FF4444",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  themeGrid: {
    padding: 16,
    gap: 16,
  },
  themeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  previewContainer: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  oledPreview: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  oledText: {
    fontSize: 80,
    color: "#FFFFFF",
  },
  activeBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 10,
    color: "#000000",
    fontWeight: "600",
  },
  themeInfo: {
    padding: 16,
  },
  themeName: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "500",
    marginBottom: 4,
  },
  themeCategory: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.4)",
    marginBottom: 8,
    letterSpacing: 1,
  },
  themeDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    lineHeight: 18,
    marginBottom: 8,
  },
  themeSize: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
  },
  themeActions: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
    paddingTop: 0,
    alignItems: "center",
  },
  activateButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activateButtonText: {
    fontSize: 15,
    color: "#000000",
    fontWeight: "600",
  },
  downloadButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  downloadButtonText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  deleteButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 68, 68, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 14,
    color: "#FF6666",
    fontWeight: "600",
  },
  activeIndicator: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    gap: 8,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  activeText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  downloadProgressContainer: {
    flex: 1,
    gap: 8,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  downloadProgressText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    textAlign: "center",
  },
  cancelButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 68, 68, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 20,
    color: "#FF6666",
    fontWeight: "600",
  },
  footer: {
    padding: 16,
    paddingBottom: SCREEN_HEIGHT > 700 ? 32 : 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  resetButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  resetButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
});
