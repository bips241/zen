/**
 * App Drawer Screen
 *
 * Displays all installed apps with search and launch functionality
 */

import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { Text, Container, Spacer } from "../../components/atoms";
import { colors, spacing } from "../../theme";
import { launcher } from "../../services/nativeBridge";
import type { InstalledApp } from "../../native-android/nativeModules";

export default function AppDrawerScreen() {
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [filteredApps, setFilteredApps] = useState<InstalledApp[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApps();
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

  const renderApp = ({ item }: { item: InstalledApp }) => (
    <TouchableOpacity
      style={styles.appItem}
      onPress={() => handleLaunchApp(item)}
      activeOpacity={0.7}
    >
      {item.icon ? (
        <Image source={{ uri: item.icon }} style={styles.appIcon} />
      ) : (
        <View style={[styles.appIcon, styles.appIconPlaceholder]}>
          <Text variant="heading">{item.appName[0]?.toUpperCase()}</Text>
        </View>
      )}
      <Text variant="body" style={styles.appName} numberOfLines={1}>
        {item.appName}
      </Text>
    </TouchableOpacity>
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
      <View style={styles.header}>
        <Text variant="title" style={styles.headerTitle}>
          Apps
        </Text>
        <Spacer size="md" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search apps..."
          placeholderTextColor={colors.gray[500]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={filteredApps}
        renderItem={renderApp}
        keyExtractor={(item) => item.packageName}
        numColumns={4}
        contentContainerStyle={styles.appList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="body" color={colors.gray[500]}>
              {searchQuery ? "No apps found" : "No apps installed"}
            </Text>
          </View>
        }
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.black,
  },
  headerTitle: {
    textAlign: "center",
  },
  searchInput: {
    backgroundColor: colors.gray[900],
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.white,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  appList: {
    padding: spacing.md,
  },
  appItem: {
    flex: 1,
    alignItems: "center",
    padding: spacing.sm,
    margin: spacing.xs,
    maxWidth: "25%",
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  appIconPlaceholder: {
    backgroundColor: colors.gray[800],
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    textAlign: "center",
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: spacing.xxl,
  },
});
