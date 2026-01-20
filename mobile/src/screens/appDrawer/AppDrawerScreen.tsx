/**
 * App Drawer Screen
 *
 * Displays all installed apps with search and launch functionality
 * Enhanced with grid/list view toggle and categories
 */

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { Text, Container, Spacer } from "../../components/atoms";
import CachedAppIcon from "../../components/molecules/CachedAppIcon";
import { colors, spacing } from "../../theme";
import { launcher } from "../../services/nativeBridge";
import { useIconCache } from "../../hooks/useIconCache";
import type { InstalledApp } from "../../native-android/nativeModules";

type ViewMode = "grid" | "list";

interface AppDrawerScreenProps {
  navigation: any;
}

export default function AppDrawerScreen({ navigation }: AppDrawerScreenProps) {
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [filteredApps, setFilteredApps] = useState<InstalledApp[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Icon caching
  const { isInitialized, preloadIcons, isPreloading } = useIconCache();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    loadApps();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: 100,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    filterApps();
  }, [searchQuery, apps]);

  const loadApps = async () => {
    try {
      const installedApps = await launcher.getInstalledApps();

      // Sort alphabetically
      const sortedApps = installedApps.sort((a, b) =>
        a.appName.localeCompare(b.appName)
      );

      setApps(sortedApps);
      setFilteredApps(sortedApps);

      // Preload icons in background (don't block UI)
      if (isInitialized) {
        preloadIcons(sortedApps).catch((err) =>
          console.error("[AppDrawer] Failed to preload icons:", err)
        );
      }
    } catch (error) {
      console.error("[AppDrawer] Error loading apps:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterApps = () => {
    if (!searchQuery.trim()) {
      setFilteredApps(apps);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = apps.filter(
      (app) =>
        app.appName.toLowerCase().includes(query) ||
        app.packageName.toLowerCase().includes(query)
    );
    setFilteredApps(filtered);
  };

  const handleLaunchApp = async (app: InstalledApp) => {
    try {
      const success = await launcher.launchApp(app.packageName);
      if (!success) {
        console.error("[AppDrawer] Failed to launch app:", app.packageName);
      }
    } catch (error) {
      console.error("[AppDrawer] Error launching app:", error);
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  const renderApp = ({
    item,
    index,
  }: {
    item: InstalledApp;
    index: number;
  }) => {
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
            <CachedAppIcon
              packageName={item.packageName}
              appName={item.appName}
              icon={item.icon}
              size={64}
              grayscale={true}
            />
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
          <CachedAppIcon
            packageName={item.packageName}
            appName={item.appName}
            icon={item.icon}
            size={48}
            grayscale={true}
          />
          <Text variant="body" style={styles.appNameList} numberOfLines={1}>
            {item.appName}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

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
            All Apps
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
        keyExtractor={(item) => item.packageName}
        numColumns={viewMode === "grid" ? 4 : 1}
        key={viewMode} // Force re-render when view mode changes
        contentContainerStyle={styles.appList}
        showsVerticalScrollIndicator={false}
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
  appIconGrid: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
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
