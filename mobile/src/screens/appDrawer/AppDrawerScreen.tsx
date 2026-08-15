/**
 * App Drawer Screen - ULTRA-OPTIMIZED
 *
 * Displays all installed apps with INSTANT loading
 * Features:
 * - Lazy icon loading (icons loaded on-demand as user scrolls)
 * - Priority-based rendering (visible items first)
 * - Native-side caching for repeat views
 * - Zero blocking on initial load
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  ViewToken,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { Text, Container, Spacer } from "../../components/atoms";
import CachedAppIcon from "../../components/molecules/CachedAppIcon";
import { colors, spacing } from "../../theme";
import { launcher } from "../../services/nativeBridge";
import { iconCacheService } from "../../services/iconCacheService";
import { useIconCache } from "../../hooks/useIconCache";
import type { InstalledApp } from "../../native-android/nativeModules";

type ViewMode = "grid" | "list";

interface AppDrawerScreenProps {
  navigation: any;
}

interface AppWithIcon extends InstalledApp {
  iconLoaded?: boolean;
}

export default function AppDrawerScreen({ navigation }: AppDrawerScreenProps) {
  const [apps, setApps] = useState<AppWithIcon[]>([]);
  const [filteredApps, setFilteredApps] = useState<AppWithIcon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [loadingIcons, setLoadingIcons] = useState(false);

  // Track which icons have been requested and loaded
  const iconLoadQueue = useRef(new Set<string>());
  const loadedIcons = useRef(new Set<string>()); // Prevent re-loading same icons
  const isLoadingBatch = useRef(false);
  const batchTimeout = useRef<NodeJS.Timeout>();
  const abortController = useRef<AbortController | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    loadApps();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: 50,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Cleanup - prevent memory leaks
    return () => {
      if (batchTimeout.current) {
        clearTimeout(batchTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    filterApps();
  }, [searchQuery, apps]);

  /**
   * OPTIMIZATION 1: Load apps WITH cached icons for instant display
   */
  const loadApps = async () => {
    try {
      const installedApps = await launcher.getInstalledApps();

      // Sort alphabetically
      const sortedApps = installedApps.sort((a, b) =>
        a.appName.localeCompare(b.appName),
      );

      // 🚀 CHECK CACHE FIRST - Load cached icons instantly!
      const appsWithCachedIcons = sortedApps.map((app) => {
        const cachedIcon = iconCacheService.getCachedIcon(app.packageName);
        const hasIcon = !!cachedIcon;
        if (hasIcon) {
          // Mark cached icons as loaded to prevent re-loading
          loadedIcons.current.add(app.packageName);
        }
        return {
          ...app,
          icon: cachedIcon || app.icon,
          iconLoaded: hasIcon,
        };
      });

      setApps(appsWithCachedIcons);
      setFilteredApps(appsWithCachedIcons);
      setLoading(false);

      const cachedCount = appsWithCachedIcons.filter(
        (a) => a.iconLoaded,
      ).length;
      console.log(
        `[AppDrawer] ✅ Loaded ${sortedApps.length} apps instantly! (${cachedCount} icons from cache)`,
      );
    } catch (error) {
      console.error("[AppDrawer] Error loading apps:", error);
      setLoading(false);
    }
  };

  /**
   * OPTIMIZATION 2: Lazy load icons in batches as user scrolls
   */
  const loadIconsForApps = useCallback(
    async (packageNames: string[]) => {
      if (packageNames.length === 0) return;

      // Filter out already loaded icons (deduplication)
      const newPackages = packageNames.filter(
        (pkg) => !loadedIcons.current.has(pkg),
      );
      if (newPackages.length === 0) return;

      // Add to queue
      newPackages.forEach((pkg) => iconLoadQueue.current.add(pkg));

      // Clear existing timeout
      if (batchTimeout.current) {
        clearTimeout(batchTimeout.current);
      }

      // Load icons immediately (no debounce for instant display)
      batchTimeout.current = setTimeout(async () => {
        if (isLoadingBatch.current || iconLoadQueue.current.size === 0) return;

        isLoadingBatch.current = true;
        setLoadingIcons(true);

        try {
          const packagesToLoad = Array.from(iconLoadQueue.current);
          iconLoadQueue.current.clear();

          console.log(
            `[AppDrawer] 🎨 Loading ${packagesToLoad.length} icons...`,
          );

          // Fetch icons from native in batch (already grayscale from native)
          const iconsBatch = await launcher.getAppIconsBatch(packagesToLoad);

          // 🚀 CACHE IMMEDIATELY - Icons are already grayscale from native!
          const iconsToCache = Object.entries(iconsBatch)
            .filter(([_, icon]) => icon && icon.length > 0)
            .map(([packageName, icon]) => {
              const app = apps.find((a) => a.packageName === packageName);
              return {
                packageName,
                appName: app?.appName || packageName,
                processedIcon: icon, // Already grayscale!
              };
            });

          if (iconsToCache.length > 0) {
            iconCacheService.cacheIcons(iconsToCache).catch((err) => {
              console.warn("[AppDrawer] Failed to cache icons:", err);
            });
          }

          // Update apps with loaded icons
          setApps((prevApps) =>
            prevApps.map((app) => {
              if (iconsBatch[app.packageName]) {
                // Mark as loaded
                loadedIcons.current.add(app.packageName);
                return {
                  ...app,
                  icon: iconsBatch[app.packageName],
                  iconLoaded: true,
                };
              }
              return app;
            }),
          );

          console.log(
            `[AppDrawer] ✅ Loaded ${Object.keys(iconsBatch).length} icons`,
          );
        } catch (error) {
          console.error("[AppDrawer] Error loading icon batch:", error);
        } finally {
          isLoadingBatch.current = false;
          setLoadingIcons(false);
        }
      }, 1); // 1ms = instant (allows batching within single frame)
    },
    [apps],
  );

  /**
   * OPTIMIZATION 3: Load icons for visible items only
   * Use useRef to keep callback stable (FlatList requirement)
   */
  const onViewableItemsChangedRef = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      // Get packages that are visible but don't have icons loaded
      const visiblePackages = viewableItems
        .map((item) => (item.item as AppWithIcon).packageName)
        .filter((pkg) => {
          // Check if already loaded
          return !loadedIcons.current.has(pkg);
        });

      if (visiblePackages.length > 0) {
        loadIconsForApps(visiblePackages);
      }
    },
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 10,
    minimumViewTime: 100,
  }).current;

  const filterApps = useCallback(() => {
    if (!searchQuery.trim()) {
      setFilteredApps(apps);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = apps.filter(
      (app) =>
        app.appName.toLowerCase().includes(query) ||
        app.packageName.toLowerCase().includes(query),
    );
    setFilteredApps(filtered);
  }, [searchQuery, apps]);

  const handleLaunchApp = useCallback(async (app: InstalledApp) => {
    try {
      const success = await launcher.launchApp(app.packageName);
      if (!success) {
        console.error("[AppDrawer] Failed to launch app:", app.packageName);
      }
    } catch (error) {
      console.error("[AppDrawer] Error launching app:", error);
    }
  }, []);

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  const renderApp = useCallback(
    ({ item, index }: { item: AppWithIcon; index: number }) => {
      if (viewMode === "grid") {
        return (
          <Animated.View
            style={[
              styles.appItemGrid,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => handleLaunchApp(item)}
              activeOpacity={0.7}
              style={styles.appItemContent}
            >
              {item.iconLoaded && item.icon ? (
                <CachedAppIcon
                  packageName={item.packageName}
                  appName={item.appName}
                  icon={item.icon}
                  size={64}
                  grayscale={true}
                />
              ) : (
                <View style={styles.iconPlaceholder}>
                  <Text variant="caption" style={styles.iconPlaceholderText}>
                    {item.appName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text variant="body" style={styles.appNameGrid} numberOfLines={1}>
                {item.appName}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      }

      // List view
      return (
        <Animated.View
          style={[
            styles.appItemList,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateX: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => handleLaunchApp(item)}
            activeOpacity={0.7}
            style={styles.appItemListContent}
          >
            {item.iconLoaded && item.icon ? (
              <CachedAppIcon
                packageName={item.packageName}
                appName={item.appName}
                icon={item.icon}
                size={48}
                grayscale={true}
              />
            ) : (
              <View style={[styles.iconPlaceholder, { width: 48, height: 48 }]}>
                <Text variant="caption" style={styles.iconPlaceholderText}>
                  {item.appName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text variant="body" style={styles.appNameList} numberOfLines={1}>
              {item.appName}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [viewMode, fadeAnim, scaleAnim, handleLaunchApp],
  );

  if (loading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Spacer size="md" />
          <Text variant="body" color={colors.gray[500]}>
            Loading apps...
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container padding="none">
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text variant="title" style={styles.headerTitle}>
            All Apps ({filteredApps.length})
          </Text>
          <TouchableOpacity
            onPress={toggleViewMode}
            style={styles.viewToggle}
            activeOpacity={0.7}
          >
            {viewMode === "grid" ? (
              <Ionicons name="list" size={24} color="#FFFFFF" />
            ) : (
              <Ionicons name="grid" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
        <Spacer size="md" />
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="rgba(255, 255, 255, 0.6)"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search apps..."
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </Animated.View>

      <FlatList
        data={filteredApps}
        renderItem={renderApp}
        keyExtractor={(item) => `${item.packageName}-${viewMode}`}
        numColumns={viewMode === "grid" ? 4 : 1}
        contentContainerStyle={styles.appList}
        showsVerticalScrollIndicator={false}
        // OPTIMIZATION 4: Viewport tracking for lazy icon loading
        onViewableItemsChanged={onViewableItemsChangedRef.current}
        viewabilityConfig={viewabilityConfig}
        // Performance optimizations
        initialNumToRender={24} // Render first screen immediately (6 rows × 4 cols)
        maxToRenderPerBatch={16} // Render full screen per batch
        updateCellsBatchingPeriod={16} // Update every frame (60fps)
        windowSize={5} // Keep 5 screens worth (sufficient for smooth scroll)
        removeClippedSubviews={true} // Remove offscreen views (Android optimization)
        getItemLayout={
          viewMode === "grid"
            ? (data, index) => ({
                length: 110, // Height of grid item
                offset: 110 * Math.floor(index / 4),
                index,
              })
            : undefined
        }
        ListEmptyComponent={
          <Animated.View
            style={[
              styles.emptyContainer,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.emptyText}>
              {searchQuery ? "No apps found" : "No apps installed"}
            </Text>
          </Animated.View>
        }
      />

      {loadingIcons && (
        <View style={styles.loadingIconsIndicator}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "400",
    textAlign: "center",
    marginHorizontal: 16,
  },
  viewToggle: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    padding: 0,
  },
  appList: {
    padding: 16,
  },
  // Grid view styles
  appItemGrid: {
    flex: 1,
    alignItems: "center",
    maxWidth: "25%",
    padding: 8,
  },
  appItemContent: {
    alignItems: "center",
    width: "100%",
  },
  iconPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconPlaceholderText: {
    fontSize: 24,
    color: "rgba(255, 255, 255, 0.3)",
    fontWeight: "600",
  },
  appNameGrid: {
    textAlign: "center",
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  // List view styles
  appItemList: {
    width: "100%",
    marginBottom: 8,
  },
  appItemListContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  appNameList: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  loadingIconsIndicator: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 48,
  },
  emptyText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.4)",
  },
});
