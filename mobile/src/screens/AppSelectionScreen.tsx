/**
 * AppSelectionScreen - Select apps for friction moments
 *
 * Users can choose which apps should trigger the breathing delay
 * Shows recommendations based on usage data
 */

import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  SectionList,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "../components/atoms";
import { colors, spacing } from "../theme";
import { launcher, overlay, usage } from "../services/nativeBridge";
import type {
  InstalledApp,
  AppUsageStats,
} from "../native-android/nativeModules";

interface AppWithUsage extends InstalledApp {
  usageMinutes?: number;
  isRecommended?: boolean;
}

interface AppSection {
  title: string;
  data: AppWithUsage[];
}

interface AppSelectionScreenProps {
  navigation: any;
  route?: {
    params?: {
      selectedApps?: string[];
    };
  };
}

export default function AppSelectionScreen({
  navigation,
  route,
}: AppSelectionScreenProps) {
  const initialApps = route?.params?.selectedApps || [];
  console.log("AppSelectionScreen initialized with apps:", initialApps);

  const [sections, setSections] = useState<AppSection[]>([]);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(
    new Set(initialApps)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppsWithUsage();
  }, []);

  const loadAppsWithUsage = async () => {
    try {
      setLoading(true);

      // Load installed apps
      const installedApps = await launcher.getInstalledApps();
      console.log("Total installed apps:", installedApps.length);

      // Filter out only Zen Mobile itself (keep all other apps including "system" apps)
      // Many useful apps like Chrome, Gmail are flagged as system apps but should be blockable
      const userApps = installedApps.filter(
        (app) => app.packageName !== "com.anonymous.focusshell"
      );
      console.log("User apps after filtering:", userApps.length);

      // Load usage stats for today
      const usageData = await usage.getTodayUsage();
      console.log("Usage data loaded:", usageData.length, "apps");

      // Create usage map for quick lookup
      const usageMap = new Map<string, number>();
      usageData.forEach((usage) => {
        usageMap.set(usage.packageName, usage.totalTimeMinutes);
      });

      // Merge apps with usage data
      const appsWithUsage: AppWithUsage[] = userApps.map((app) => ({
        ...app,
        usageMinutes: usageMap.get(app.packageName) || 0,
        isRecommended: (usageMap.get(app.packageName) || 0) > 30, // 30+ min = recommended
      }));

      console.log("Apps with usage:", appsWithUsage.length);

      // Separate into recommended and other apps
      const recommended = appsWithUsage
        .filter((app) => app.isRecommended)
        .sort((a, b) => (b.usageMinutes || 0) - (a.usageMinutes || 0)); // Most used first

      const others = appsWithUsage
        .filter((app) => !app.isRecommended)
        .sort((a, b) => a.appName.localeCompare(b.appName)); // Alphabetically

      console.log("Recommended apps:", recommended.length);
      console.log("Other apps:", others.length);

      // Create sections
      const newSections: AppSection[] = [];

      if (recommended.length > 0) {
        newSections.push({
          title: "Recommended (High Usage)",
          data: recommended,
        });
      }

      if (others.length > 0) {
        newSections.push({
          title: "All Apps",
          data: others,
        });
      }

      console.log("Total sections:", newSections.length);
      setSections(newSections);
    } catch (error) {
      Alert.alert("Error", "Failed to load apps");
      console.error("Error loading apps:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleApp = (packageName: string) => {
    setSelectedApps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(packageName)) {
        newSet.delete(packageName);
      } else {
        newSet.add(packageName);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    try {
      const selectedArray = Array.from(selectedApps);
      console.log("Saving selected apps:", selectedArray);

      // Navigate back and pass the selected apps
      // Use setParams to update the previous screen's params
      if (navigation.canGoBack()) {
        navigation.navigate({
          name: "FrictionSettings",
          params: { selectedApps: selectedArray },
          merge: true,
        } as any);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save selection");
      console.error("Error saving selection:", error);
    }
  };

  const renderAppItem = ({ item }: { item: AppWithUsage }) => {
    const isSelected = selectedApps.has(item.packageName);
    const usageHours = item.usageMinutes
      ? Math.floor(item.usageMinutes / 60)
      : 0;
    const usageMins = item.usageMinutes ? item.usageMinutes % 60 : 0;
    const usageText = item.usageMinutes
      ? usageHours > 0
        ? `${usageHours}h ${usageMins}m`
        : `${usageMins}m`
      : "No usage";

    return (
      <TouchableOpacity
        style={[
          styles.appItem,
          item.isRecommended && styles.recommendedAppItem,
        ]}
        onPress={() => toggleApp(item.packageName)}
      >
        <View style={styles.appContent}>
          {item.icon && item.icon !== "" ? (
            <Image
              source={{ uri: `data:image/png;base64,${item.icon}` }}
              style={[styles.appIcon, styles.grayscaleIcon]}
            />
          ) : (
            <View style={[styles.appIcon, styles.placeholderIcon]}>
              <MaterialCommunityIcons
                name="application"
                size={32}
                color="rgba(255, 255, 255, 0.6)"
              />
            </View>
          )}
          <View style={styles.appInfo}>
            <View style={styles.appNameRow}>
              <Text style={styles.appName}>{item.appName}</Text>
              {item.isRecommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>High Usage</Text>
                </View>
              )}
            </View>
            <View style={styles.appMetaRow}>
              <Text style={styles.packageName}>{item.packageName}</Text>
              {item.usageMinutes !== undefined && item.usageMinutes > 0 && (
                <Text style={styles.usageText}>• Today: {usageText}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: AppSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
      <Text style={styles.sectionSubtext}>
        {section.data.length} app{section.data.length !== 1 ? "s" : ""}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading apps...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Apps</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Selected Count */}
      <View style={styles.countCard}>
        <Text style={styles.countText}>
          {selectedApps.size} app{selectedApps.size !== 1 ? "s" : ""} selected
        </Text>
        <Text style={styles.countSubtext}>
          These apps will show a breathing delay when opened
        </Text>
      </View>

      {/* App List */}
      <SectionList
        sections={sections}
        renderItem={renderAppItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.packageName}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={true}
      />
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
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[900],
  },

  backButton: {
    fontSize: 32,
    color: colors.white,
    width: 40,
  },

  headerTitle: {
    fontFamily: "ZenDots-Regular",
    fontSize: 20,
    color: colors.white,
  },

  saveButton: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: "600",
    width: 60,
    textAlign: "right",
  },

  countCard: {
    backgroundColor: colors.gray[900],
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },

  countText: {
    fontSize: 18,
    color: colors.white,
    marginBottom: spacing.xs,
  },

  countSubtext: {
    fontSize: 14,
    color: colors.gray[500],
  },

  listContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },

  appItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.gray[900],
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },

  appContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: spacing.md,
  },

  placeholderIcon: {
    backgroundColor: colors.gray[700],
  },

  appInfo: {
    flex: 1,
  },

  appName: {
    fontSize: 16,
    color: colors.white,
    marginBottom: spacing.xs,
  },

  packageName: {
    fontSize: 12,
    color: colors.gray[500],
  },

  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.gray[700],
    justifyContent: "center",
    alignItems: "center",
  },

  checkboxSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },

  checkmark: {
    fontSize: 18,
    color: colors.black,
    fontWeight: "bold",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.gray[500],
  },

  // Section styles
  sectionHeader: {
    backgroundColor: colors.gray[900],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[800],
  },

  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  sectionSubtext: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: spacing.xs / 2,
  },

  // Enhanced app item styles
  recommendedAppItem: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },

  appNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs / 2,
  },

  recommendedBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: spacing.sm,
  },

  recommendedText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.black,
    textTransform: "uppercase",
  },

  appMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  usageText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: "500",
  },

  grayscaleIcon: {
    opacity: 0.9,
  },
});
