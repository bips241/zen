import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

interface App {
  id: string;
  name: string;
  packageName: string;
  isBlocked: boolean;
  category: "social" | "entertainment" | "productivity" | "games" | "other";
}

const categories = [
  "all",
  "social",
  "entertainment",
  "productivity",
  "games",
  "other",
] as const;

export default function AppBlockerScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [apps, setApps] = useState<App[]>([
    {
      id: "1",
      name: "Instagram",
      packageName: "com.instagram.android",
      isBlocked: true,
      category: "social",
    },
    {
      id: "2",
      name: "Twitter",
      packageName: "com.twitter.android",
      isBlocked: true,
      category: "social",
    },
    {
      id: "3",
      name: "Facebook",
      packageName: "com.facebook.katana",
      isBlocked: true,
      category: "social",
    },
    {
      id: "4",
      name: "TikTok",
      packageName: "com.zhiliaoapp.musically",
      isBlocked: true,
      category: "social",
    },
    {
      id: "5",
      name: "YouTube",
      packageName: "com.google.android.youtube",
      isBlocked: false,
      category: "entertainment",
    },
    {
      id: "6",
      name: "Netflix",
      packageName: "com.netflix.mediaclient",
      isBlocked: false,
      category: "entertainment",
    },
    {
      id: "7",
      name: "Spotify",
      packageName: "com.spotify.music",
      isBlocked: false,
      category: "entertainment",
    },
    {
      id: "8",
      name: "Reddit",
      packageName: "com.reddit.frontpage",
      isBlocked: true,
      category: "social",
    },
    {
      id: "9",
      name: "Slack",
      packageName: "com.slack",
      isBlocked: false,
      category: "productivity",
    },
    {
      id: "10",
      name: "Gmail",
      packageName: "com.google.android.gm",
      isBlocked: false,
      category: "productivity",
    },
  ]);

  const [blockMode, setBlockMode] = useState<"focus" | "scheduled" | "manual">(
    "focus"
  );
  const [selectedCategory, setSelectedCategory] = useState<
    (typeof categories)[number]
  >("all");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleBlock = (appId: string) => {
    setApps(
      apps.map((app) =>
        app.id === appId ? { ...app, isBlocked: !app.isBlocked } : app
      )
    );
  };

  const filteredApps = apps.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.packageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayApps =
    selectedCategory === "all"
      ? filteredApps
      : filteredApps.filter((app) => app.category === selectedCategory);

  const blockedCount = apps.filter((app) => app.isBlocked).length;

  const blockModes = [
    { id: "focus" as const, label: "During Focus", icon: "🛡️" },
    { id: "scheduled" as const, label: "Scheduled", icon: "⏰" },
    { id: "manual" as const, label: "Manual", icon: "🚫" },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View>
          <Text style={styles.headerTitle}>App Blocker</Text>
          <Text style={styles.headerSubtitle}>{blockedCount} apps blocked</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search apps..."
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
        />
      </View>

      {/* Block Mode Selector */}
      <View style={styles.modeContainer}>
        <Text style={styles.modeLabel}>BLOCK MODE</Text>
        <View style={styles.modeButtons}>
          {blockModes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              onPress={() => setBlockMode(mode.id)}
              style={[
                styles.modeButton,
                blockMode === mode.id && styles.modeButtonActive,
              ]}
            >
              <Text style={styles.modeIcon}>{mode.icon}</Text>
              <Text
                style={[
                  styles.modeText,
                  blockMode === mode.id && styles.modeTextActive,
                ]}
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Apps List */}
      <ScrollView
        style={styles.appsList}
        contentContainerStyle={styles.appsListContent}
        showsVerticalScrollIndicator={false}
      >
        {displayApps.map((app) => (
          <TouchableOpacity
            key={app.id}
            onPress={() => toggleBlock(app.id)}
            style={styles.appItem}
            activeOpacity={0.8}
          >
            <View style={styles.appLeft}>
              <View
                style={[
                  styles.appIcon,
                  app.isBlocked && styles.appIconBlocked,
                ]}
              >
                <Text style={styles.appIconText}>
                  {app.isBlocked ? "🛡️" : "✓"}
                </Text>
              </View>
              <View style={styles.appInfo}>
                <Text style={styles.appName}>{app.name}</Text>
                <Text style={styles.appPackage}>{app.packageName}</Text>
              </View>
            </View>

            <View style={styles.appRight}>
              <View
                style={[
                  styles.appBadge,
                  app.isBlocked && styles.appBadgeBlocked,
                ]}
              >
                <Text
                  style={[
                    styles.appBadgeText,
                    app.isBlocked && styles.appBadgeTextBlocked,
                  ]}
                >
                  {app.isBlocked ? "Blocked" : "Allowed"}
                </Text>
              </View>
              <View
                style={[
                  styles.checkbox,
                  app.isBlocked && styles.checkboxActive,
                ]}
              >
                {app.isBlocked && <View style={styles.checkboxInner} />}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {displayApps.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No apps found</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          onPress={() =>
            setApps(apps.map((app) => ({ ...app, isBlocked: true })))
          }
          style={styles.actionButton}
        >
          <Text style={styles.actionText}>Block All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            setApps(apps.map((app) => ({ ...app, isBlocked: false })))
          }
          style={styles.actionButton}
        >
          <Text style={styles.actionText}>Unblock All</Text>
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
    paddingTop: 48,
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 32,
    color: "#FFFFFF",
    lineHeight: 32,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    fontSize: 20,
    position: "absolute",
    left: 40,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingLeft: 48,
    paddingRight: 16,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 16,
  },
  modeContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modeLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    letterSpacing: 2,
    marginBottom: 12,
  },
  modeButtons: {
    flexDirection: "row",
    gap: 8,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
  },
  modeButtonActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  modeIcon: {
    fontSize: 16,
  },
  modeText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  modeTextActive: {
    color: "#000000",
    fontWeight: "600",
  },
  categoryContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  categoryContent: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "transparent",
  },
  categoryButtonActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  categoryText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  categoryTextActive: {
    color: "#000000",
    fontWeight: "600",
  },
  appsList: {
    flex: 1,
  },
  appsListContent: {
    padding: 24,
  },
  appItem: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 16,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  appIconBlocked: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  appIconText: {
    fontSize: 24,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  appPackage: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.4)",
  },
  appRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  appBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "transparent",
  },
  appBadgeBlocked: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  appBadgeText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.4)",
  },
  appBadgeTextBlocked: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#000000",
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.4)",
  },
  bottomActions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    alignItems: "center",
  },
  actionText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
});
