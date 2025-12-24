import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function DNDSettingsScreen() {
  const navigation = useNavigation();
  const [dndEnabled, setDndEnabled] = useState(false);
  const [allowCalls, setAllowCalls] = useState(true);
  const [allowAlarms, setAllowAlarms] = useState(true);
  const [allowPriority, setAllowPriority] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const schedules = [
    { id: 1, label: "Weekdays", time: "9:00 AM - 5:00 PM", enabled: true },
    { id: 2, label: "Sleep", time: "10:00 PM - 7:00 AM", enabled: true },
    { id: 3, label: "Weekend", time: "All Day", enabled: false },
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
        <Text style={styles.headerTitle}>Do Not Disturb</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Toggle */}
        <Animated.View style={[styles.mainToggle, { opacity: fadeAnim }]}>
          <View style={styles.toggleLeft}>
            <Text style={styles.toggleIcon}>🌙</Text>
            <View>
              <Text style={styles.toggleTitle}>Do Not Disturb</Text>
              <Text style={styles.toggleSubtitle}>
                Block all notifications
              </Text>
            </View>
          </View>
          <Switch
            value={dndEnabled}
            onValueChange={setDndEnabled}
            trackColor={{
              false: "rgba(255, 255, 255, 0.2)",
              true: "#FFFFFF",
            }}
            thumbColor={dndEnabled ? "#000000" : "#FFFFFF"}
          />
        </Animated.View>

        {/* Exceptions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXCEPTIONS</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>📞</Text>
                <Text style={styles.settingLabel}>Allow Calls</Text>
              </View>
              <Switch
                value={allowCalls}
                onValueChange={setAllowCalls}
                trackColor={{
                  false: "rgba(255, 255, 255, 0.2)",
                  true: "#FFFFFF",
                }}
                thumbColor={allowCalls ? "#000000" : "#FFFFFF"}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>⏰</Text>
                <Text style={styles.settingLabel}>Allow Alarms</Text>
              </View>
              <Switch
                value={allowAlarms}
                onValueChange={setAllowAlarms}
                trackColor={{
                  false: "rgba(255, 255, 255, 0.2)",
                  true: "#FFFFFF",
                }}
                thumbColor={allowAlarms ? "#000000" : "#FFFFFF"}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>⭐</Text>
                <Text style={styles.settingLabel}>Priority Contacts</Text>
              </View>
              <Switch
                value={allowPriority}
                onValueChange={setAllowPriority}
                trackColor={{
                  false: "rgba(255, 255, 255, 0.2)",
                  true: "#FFFFFF",
                }}
                thumbColor={allowPriority ? "#000000" : "#FFFFFF"}
              />
            </View>
          </View>
        </View>

        {/* Schedules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SCHEDULES</Text>
          <View style={styles.sectionContent}>
            {schedules.map((schedule) => (
              <View key={schedule.id} style={styles.scheduleItem}>
                <View style={styles.scheduleLeft}>
                  <Text style={styles.scheduleLabel}>{schedule.label}</Text>
                  <Text style={styles.scheduleTime}>{schedule.time}</Text>
                </View>
                <Switch
                  value={schedule.enabled}
                  onValueChange={() => {}}
                  trackColor={{
                    false: "rgba(255, 255, 255, 0.2)",
                    true: "#FFFFFF",
                  }}
                  thumbColor={schedule.enabled ? "#000000" : "#FFFFFF"}
                />
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addIcon}>+</Text>
            <Text style={styles.addText}>Add Schedule</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            DND will silence all notifications except allowed exceptions. Your
            focus sessions will automatically enable DND.
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
  mainToggle: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  toggleIcon: {
    fontSize: 32,
  },
  toggleTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
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
  sectionContent: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingIcon: {
    fontSize: 20,
  },
  settingLabel: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  scheduleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  scheduleLeft: {
    flex: 1,
  },
  scheduleLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    gap: 8,
  },
  addIcon: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  addText: {
    fontSize: 14,
    color: "#FFFFFF",
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
