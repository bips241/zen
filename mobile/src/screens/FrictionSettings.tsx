/**
 * FrictionSettings Screen - Configure friction moments and usage limits
 *
 * Main screen for managing:
 * - Enable/disable friction feature
 * - Set delay duration
 * - Select apps for friction
 * - Set usage limits per app
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Text } from "../components/atoms";
import { colors, spacing } from "../theme";
import { overlay, launcher } from "../services/nativeBridge";
import { database } from "@/database";
import { Q } from "@nozbe/watermelondb";

interface FrictionSettingsProps {
  navigation: any;
  route?: {
    params?: {
      selectedApps?: string[];
    };
  };
}

export default function FrictionSettings({
  navigation,
  route,
}: FrictionSettingsProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [delaySeconds, setDelaySeconds] = useState(5);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Log whenever selectedApps changes
  useEffect(() => {
    console.log("FrictionSettings: selectedApps state changed to:", selectedApps);
  }, [selectedApps]);

  // Re-check permissions when screen comes into focus (e.g., returning from settings)
  useFocusEffect(
    useCallback(() => {
      checkPermissions();
    }, [])
  );

  useEffect(() => {
    checkPermissions();
  }, []);

  useEffect(() => {
    // Update selected apps from navigation params and save to database
    const saveBlockedApps = async () => {
      if (route?.params?.selectedApps !== undefined) {
        console.log("Received selected apps:", route.params.selectedApps);
        
        try {
          const blockedAppsCollection = database.get("blocked_apps");
          
          await database.write(async () => {
            // Clear all existing blocked apps
            const existingApps = await blockedAppsCollection.query().fetch();
            for (const app of existingApps) {
              await app.destroyPermanently();
            }
            
            // Create new blocked app records
            for (const packageName of route.params.selectedApps) {
              await blockedAppsCollection.create((record: any) => {
                record.packageName = packageName;
                record.appName = packageName; // We'll update with real name later
                record.isBlocked = true;
                record.blockMode = "always";
              });
            }
          });
          
          console.log("Saved blocked apps to database:", route.params.selectedApps);
          setSelectedApps(route.params.selectedApps);
        } catch (error) {
          console.error("Error saving blocked apps:", error);
        }
      }
    };
    
    saveBlockedApps();
  }, [route?.params?.selectedApps, database]);

  // Separate effect to configure overlay when apps or settings change
  useEffect(() => {
    if (isEnabled && selectedApps.length > 0) {
      console.log("Configuring overlay with apps:", selectedApps);
      overlay.configure(delaySeconds, selectedApps);
    }
  }, [isEnabled, delaySeconds, selectedApps]);

  const loadBlockedApps = async () => {
    try {
      const blockedAppsCollection = database.get("blocked_apps");
      const blockedApps = await blockedAppsCollection
        .query(Q.where("is_blocked", true))
        .fetch();
      
      const packageNames = blockedApps.map((app: any) => app.packageName);
      console.log("Loaded blocked apps from DB:", packageNames);
      setSelectedApps(packageNames);
      return packageNames;
    } catch (error) {
      console.error("Error loading blocked apps:", error);
      return [];
    }
  };

  const checkPermissions = async () => {
    try {
      setLoading(true);
      const permission = await overlay.hasPermission();
      const enabled = await overlay.isEnabled();

      setHasPermission(permission);
      setIsEnabled(enabled);
      
      // Load blocked apps from database
      await loadBlockedApps();
    } catch (error) {
      console.error("Error checking permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPermission = async () => {
    try {
      await overlay.requestPermission();
      // Alert removed - permission check will happen automatically when user returns
    } catch (error) {
      Alert.alert("Error", "Failed to open permission settings");
    }
  };

  const handleToggleFriction = async (value: boolean) => {
    if (!hasPermission) {
      Alert.alert(
        "Permission Required",
        "Overlay permission is needed for friction moments",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Grant", onPress: handleRequestPermission },
        ]
      );
      return;
    }

    try {
      if (value) {
        // Configure before enabling
        console.log("Configuring friction with:", { delaySeconds, selectedApps });
        await overlay.configure(delaySeconds, selectedApps);
        
        console.log("Enabling friction moments...");
        const success = await overlay.enable();
        console.log("Enable result:", success);
        setIsEnabled(success);

        if (success) {
          Alert.alert(
            "Friction Moments Active",
            `You'll see a ${delaySeconds}s breathing delay when opening ${selectedApps.length} selected app(s)`
          );
        } else {
          Alert.alert("Error", "Failed to enable friction moments");
        }
      } else {
        const success = await overlay.disable();
        setIsEnabled(!success);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to toggle friction moments");
      console.error("Error toggling friction:", error);
    }
  };

  const handleDelayChange = (seconds: number) => {
    setDelaySeconds(seconds);
    if (isEnabled) {
      overlay.configure(seconds, selectedApps);
    }
  };

  const handleSelectApps = async () => {
    // Reload from DB to ensure we have latest
    const currentApps = await loadBlockedApps();
    console.log("Navigating to AppSelection with apps:", currentApps);
    navigation.navigate("AppSelection", { selectedApps: currentApps });
  };

  const handleTestFriction = () => {
    navigation.navigate("FrictionOverlay", {
      appName: "Test App",
      delaySeconds,
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
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
        <Text style={styles.headerTitle}>Friction Moments</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Permission Status */}
        {!hasPermission && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ Permission Required</Text>
            <Text style={styles.warningText}>
              Overlay permission is needed to show friction moments
            </Text>
            <TouchableOpacity
              style={styles.warningButton}
              onPress={handleRequestPermission}
            >
              <Text style={styles.warningButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Enable/Disable */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>Enable Friction Moments</Text>
                <Text style={styles.cardSubtitle}>
                  Show breathing delay before opening apps
                </Text>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={handleToggleFriction}
                trackColor={{ false: colors.gray[800], true: colors.accent }}
                thumbColor={isEnabled ? colors.white : colors.gray[500]}
                disabled={!hasPermission}
              />
            </View>
          </View>
        </View>

        {/* Delay Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delay Duration</Text>
          <View style={styles.delayOptions}>
            {[3, 5, 7, 10].map((seconds) => (
              <TouchableOpacity
                key={seconds}
                style={[
                  styles.delayOption,
                  delaySeconds === seconds && styles.delayOptionSelected,
                ]}
                onPress={() => handleDelayChange(seconds)}
              >
                <Text
                  style={[
                    styles.delayOptionText,
                    delaySeconds === seconds && styles.delayOptionTextSelected,
                  ]}
                >
                  {seconds}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sectionSubtitle}>
            How long to wait before allowing app access
          </Text>
        </View>

        {/* App Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blocked Apps</Text>
          <TouchableOpacity 
            style={styles.selectAppsCard} 
            onPress={handleSelectApps}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>📱</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>
                  {selectedApps.length === 0
                    ? "No apps selected"
                    : `${selectedApps.length} app${
                        selectedApps.length !== 1 ? "s" : ""
                      } selected`}
                </Text>
                <Text style={styles.cardSubtitle}>
                  Tap to select apps for friction moments
                </Text>
              </View>
              <Text style={styles.arrowIcon}>→</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Test Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestFriction}
          >
            <Text style={styles.testButtonText}>Test Friction Delay</Text>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How it works</Text>
          <Text style={styles.infoText}>
            • When you open a selected app, a breathing exercise appears{"\n"}•
            You must wait {delaySeconds} seconds before proceeding{"\n"}• This
            creates a "friction moment" to make you think twice{"\n"}• Helps
            break autopilot app opening habits
          </Text>
        </View>
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

  scrollView: {
    flex: 1,
  },

  content: {
    padding: spacing.lg,
  },

  section: {
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    fontSize: 16,
    color: colors.gray[500],
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: spacing.sm,
  },

  card: {
    backgroundColor: colors.gray[900],
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardInfo: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    color: colors.white,
    marginBottom: spacing.xs,
  },

  cardSubtitle: {
    fontSize: 14,
    color: colors.gray[500],
  },

  arrowIcon: {
    fontSize: 24,
    color: colors.gray[500],
  },

  selectAppsCard: {
    backgroundColor: colors.gray[900],
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent,
  },

  iconContainer: {
    marginRight: spacing.md,
  },

  iconText: {
    fontSize: 32,
  },

  delayOptions: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  delayOption: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.gray[900],
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.gray[800],
  },

  delayOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.gray[800],
  },

  delayOptionText: {
    fontSize: 18,
    color: colors.gray[500],
    fontWeight: "600",
  },

  delayOptionTextSelected: {
    color: colors.accent,
  },

  testButton: {
    backgroundColor: colors.gray[900],
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray[700],
  },

  testButtonText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: "600",
  },

  warningCard: {
    backgroundColor: "rgba(255, 170, 0, 0.1)",
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.warning,
  },

  warningTitle: {
    fontSize: 16,
    color: colors.warning,
    marginBottom: spacing.sm,
    fontWeight: "600",
  },

  warningText: {
    fontSize: 14,
    color: colors.gray[300],
    marginBottom: spacing.md,
  },

  warningButton: {
    backgroundColor: colors.warning,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },

  warningButtonText: {
    fontSize: 14,
    color: colors.black,
    fontWeight: "600",
  },

  infoCard: {
    backgroundColor: colors.gray[900],
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },

  infoTitle: {
    fontSize: 16,
    color: colors.white,
    marginBottom: spacing.sm,
    fontWeight: "600",
  },

  infoText: {
    fontSize: 14,
    color: colors.gray[500],
    lineHeight: 22,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
