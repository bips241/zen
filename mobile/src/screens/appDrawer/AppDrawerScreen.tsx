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
  Image,
  ActivityIndicator,
  Animated,
  ScrollView,
} from "react-native";
import { Text, Container, Spacer } from "../../components/atoms";
import { colors, spacing } from "../../theme";
import { launcher } from "../../services/nativeBridge";
import type { InstalledApp } from "../../native-android/nativeModules";

type ViewMode = "grid" | "list";

export default function AppDrawerScreen() {
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [filteredApps, setFilteredApps] = useState<InstalledApp[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

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

  const renderApp = ({ item, index }: { item: InstalledApp; index: number }) => {
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
            {item.icon ? (
              <Image source={{ uri: item.icon }} style={styles.appIconGrid} />
            ) : (
              <View style={[styles.appIconGrid, styles.appIconPlaceholder]}>
                <Text variant="heading">{item.appName[0]?.toUpperCase()}</Text>
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
            transform: [{ translateX: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-30, 0],
            }) }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleLaunchApp(item)}
          activeOpacity={0.7}
          style={styles.appItemListContent}
        >
          {item.icon ? (
            <Image source={{ uri: item.icon }} style={styles.appIconList} />
          ) : (
            <View style={[styles.appIconList, styles.appIconPlaceholder]}>
              <Text variant="body">{item.appName[0]?.toUpperCase()}</Text>
            </View>
          )}
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
          <Text variant="title" style={styles.headerTitle}>
            All Apps
          </Text>
          <TouchableOpacity
            onPress={toggleViewMode}
            style={styles.viewToggle}
            activeOpacity={0.7}
          >
            <Text style={styles.viewToggleIcon}>
              {viewMode === "grid" ? "☰" : "⊞"}
            </Text>
          </TouchableOpacity>
        </View>
        <Spacer size="md" />
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
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
                transform: [{ translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }) }],
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
  headerTitle: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "400",
  },
  viewToggle: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
  },
  viewToggleIcon: {
    fontSize: 20,
    color: "#FFFFFF",
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
    fontSize: 20,
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
  appIconList: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  appNameList: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
  },
  appIconPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
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
