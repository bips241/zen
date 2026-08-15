import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Switch,
} from "react-native";
import { Text } from "../components/atoms";
import { useNavigation } from "@react-navigation/native";

interface SettingItem {
  icon: string;
  label: string;
  type: "toggle" | "navigation";
  value?: boolean;
  onChange?: (value: boolean) => void;
  screen?: string;
}

interface SettingsSection {
  title: string;
  items: SettingItem[];
}

export default function EnhancedSettingsScreen({ navigation }: any) {
  const nav = useNavigation();
  const [notifications, setNotifications] = useState(true);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [showViewToggle, setShowViewToggle] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
    };
  }, [fadeAnim, slideAnim]);

  const settingsSections: SettingsSection[] = [
    {
      title: "General",
      items: [
        {
          icon: "🔔",
          label: "Notifications",
          type: "toggle",
          value: notifications,
          onChange: setNotifications,
        },
        {
          icon: "🌙",
          label: "Do Not Disturb",
          type: "navigation",
          screen: "DNDSettings",
        },
        {
          icon: "🔊",
          label: "Sound",
          type: "toggle",
          value: sound,
          onChange: setSound,
        },
        {
          icon: "📳",
          label: "Vibration",
          type: "toggle",
          value: vibration,
          onChange: setVibration,
        },
      ],
    },
    {
      title: "Focus & Productivity",
      items: [
        {
          icon: "⏱️",
          label: "Focus History",
          type: "navigation",
          screen: "FocusHistory",
        },
        {
          icon: "🚫",
          label: "App Blocker",
          type: "navigation",
          screen: "AppBlocker",
        },
      ],
    },
    {
      title: "Data",
      items: [
        {
          icon: "💾",
          label: "Backup & Restore",
          type: "navigation",
          screen: "BackupRestore",
        },
      ],
    },
    {
      title: "Other",
      items: [
        {
          icon: "🛡️",
          label: "Privacy & Security",
          type: "navigation",
        },
        {
          icon: "❓",
          label: "Help & Support",
          type: "navigation",
        },
        {
          icon: "ℹ️",
          label: "About",
          type: "navigation",
        },
      ],
    },
  ];

  const handleNavigation = (screen?: string) => {
    if (screen) {
      nav.navigate(screen as never);
    }
  };

  const slideTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.headerTitle}>Settings</Text>
      </Animated.View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Animated.View
          style={[
            styles.profileCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideTranslateY }],
            },
          ]}
        >
          <TouchableOpacity style={styles.profileContent}>
            <View style={styles.profileIcon}>
              <Text style={styles.profileIconText}>📱</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Productivity Pro</Text>
              <Text style={styles.profileSubtext}>View Profile</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <Animated.View
            key={section.title}
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideTranslateY }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionItems}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.settingItem}>
                  {item.type === "toggle" ? (
                    <View style={styles.settingContent}>
                      <View style={styles.settingLeft}>
                        <View style={styles.settingIconContainer}>
                          <Text style={styles.settingIcon}>{item.icon}</Text>
                        </View>
                        <Text style={styles.settingLabel}>{item.label}</Text>
                      </View>
                      <Switch
                        value={item.value}
                        onValueChange={item.onChange}
                        trackColor={{
                          false: "rgba(255, 255, 255, 0.2)",
                          true: "#FFFFFF",
                        }}
                        thumbColor={item.value ? "#000000" : "#FFFFFF"}
                      />
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.settingContent}
                      onPress={() => handleNavigation(item.screen)}
                    >
                      <View style={styles.settingLeft}>
                        <View style={styles.settingIconContainer}>
                          <Text style={styles.settingIcon}>{item.icon}</Text>
                        </View>
                        <Text style={styles.settingLabel}>{item.label}</Text>
                      </View>
                      <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </Animated.View>
        ))}

        {/* App Info */}
        <Animated.View style={[styles.appInfo, { opacity: fadeAnim }]}>
          <Text style={styles.appInfoText}>Zen Mobile Launcher</Text>
          <Text style={styles.appInfoText}>Version 1.0.0</Text>
        </Animated.View>

        {/* View Mode Toggle Button */}
        <Animated.View style={[{ opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.viewModeButton}
            onPress={() => {
              // Navigate back to standard settings by popping the screen
              // This works through the parent state management
              navigation?.goBack?.();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.viewModeButtonText}>📋 View Standard Settings</Text>
          </TouchableOpacity>
        </Animated.View>
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
  },
  headerTitle: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "400",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 100,
  },
  profileCard: {
    marginBottom: 32,
    padding: 24,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileIconText: {
    fontSize: 32,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  profileSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  chevron: {
    fontSize: 32,
    color: "rgba(255, 255, 255, 0.4)",
    lineHeight: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    letterSpacing: 2,
    marginBottom: 16,
    textTransform: "uppercase",
  },
  sectionItems: {
    gap: 8,
  },
  settingItem: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingIcon: {
    fontSize: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  appInfo: {
    paddingVertical: 24,
    alignItems: "center",
  },
  appInfoText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.4)",
    marginBottom: 8,
  },

  viewModeButton: {
    marginTop: 24,
    marginBottom: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  viewModeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
