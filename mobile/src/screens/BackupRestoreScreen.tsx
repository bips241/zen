import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function BackupRestoreScreen() {
  const navigation = useNavigation();
  const [lastBackup, setLastBackup] = useState("Dec 15, 2025 at 3:42 PM");
  const [autoBackup, setAutoBackup] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBackup = () => {
    Alert.alert(
      "Create Backup",
      "Your settings, focus history, and preferences will be backed up.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Backup Now",
          onPress: () => {
            // TODO: Implement BackupModule.createBackup()
            Alert.alert("Success", "Backup created successfully!");
          },
        },
      ]
    );
  };

  const handleRestore = () => {
    Alert.alert(
      "Restore from Backup",
      "This will replace your current data with the backup. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          style: "destructive",
          onPress: () => {
            // TODO: Implement BackupModule.restoreBackup()
            Alert.alert("Success", "Data restored successfully!");
          },
        },
      ]
    );
  };

  const backupItems = [
    { icon: "⚙️", label: "App Settings", size: "2.4 KB", included: true },
    { icon: "⏱️", label: "Focus History", size: "156 KB", included: true },
    { icon: "✅", label: "Tasks & Goals", size: "42 KB", included: true },
    { icon: "🚫", label: "Blocked Apps", size: "8 KB", included: true },
    { icon: "📊", label: "Statistics", size: "89 KB", included: true },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Backup & Restore</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Last Backup Card */}
        <Animated.View style={[styles.lastBackupCard, { opacity: fadeAnim }]}>
          <View style={styles.backupIcon}>
            <Text style={styles.backupIconText}>💾</Text>
          </View>
          <View style={styles.backupInfo}>
            <Text style={styles.backupLabel}>Last Backup</Text>
            <Text style={styles.backupTime}>{lastBackup}</Text>
          </View>
          <View style={styles.backupStatus}>
            <Text style={styles.statusDot}>●</Text>
            <Text style={styles.statusText}>Ready</Text>
          </View>
        </Animated.View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleBackup}
            style={styles.primaryButton}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryIcon}>☁️</Text>
            <Text style={styles.primaryButtonText}>Create Backup</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRestore}
            style={styles.secondaryButton}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryIcon}>⬇️</Text>
            <Text style={styles.secondaryButtonText}>Restore Backup</Text>
          </TouchableOpacity>
        </View>

        {/* What's Included */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WHAT'S INCLUDED</Text>
          <View style={styles.includeList}>
            {backupItems.map((item, index) => (
              <View key={index} style={styles.includeItem}>
                <View style={styles.includeLeft}>
                  <Text style={styles.includeIcon}>{item.icon}</Text>
                  <View>
                    <Text style={styles.includeLabel}>{item.label}</Text>
                    <Text style={styles.includeSize}>{item.size}</Text>
                  </View>
                </View>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Auto Backup */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AUTO BACKUP</Text>
          <View style={styles.autoBackupCard}>
            <View style={styles.autoBackupLeft}>
              <Text style={styles.autoBackupIcon}>🔄</Text>
              <View>
                <Text style={styles.autoBackupLabel}>Automatic Backup</Text>
                <Text style={styles.autoBackupSubtitle}>Daily at 3:00 AM</Text>
              </View>
            </View>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                onPress={() => setAutoBackup(!autoBackup)}
                style={[styles.toggle, autoBackup && styles.toggleActive]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    autoBackup && styles.toggleThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Backups are stored locally on your device. For cloud backup,
            consider exporting your data regularly.
          </Text>
        </View>
      </ScrollView>
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
    alignItems: "center",
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 32,
    color: "#FFFFFF",
    lineHeight: 32,
  },
  headerTitle: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "400",
  },
  placeholder: {
    width: 48,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  lastBackupCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backupIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  backupIconText: {
    fontSize: 28,
  },
  backupInfo: {
    flex: 1,
  },
  backupLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 4,
  },
  backupTime: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  backupStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  statusText: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  actions: {
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryIcon: {
    fontSize: 20,
  },
  primaryButtonText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryIcon: {
    fontSize: 20,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    letterSpacing: 2,
    marginBottom: 16,
  },
  includeList: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    overflow: "hidden",
  },
  includeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  includeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  includeIcon: {
    fontSize: 24,
  },
  includeLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  includeSize: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
  },
  checkmark: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  autoBackupCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  autoBackupLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  autoBackupIcon: {
    fontSize: 24,
  },
  autoBackupLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  autoBackupSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  toggleContainer: {
    padding: 4,
  },
  toggle: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: "#FFFFFF",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
  },
  toggleThumbActive: {
    backgroundColor: "#000000",
    alignSelf: "flex-end",
  },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    gap: 12,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    lineHeight: 20,
  },
});
