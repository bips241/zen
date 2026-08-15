import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import { Text } from "../components/atoms";
import { useNavigation } from "@react-navigation/native";

interface Session {
  id: string;
  type: "pomodoro" | "focus" | "deep-work" | "tratak";
  date: string;
  duration: number;
  completed: boolean;
}

export default function FocusHistoryScreen() {
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "week" | "month"
  >("week");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const sessions: Session[] = [
    {
      id: "1",
      type: "pomodoro",
      date: "Today, 2:30 PM",
      duration: 25,
      completed: true,
    },
    {
      id: "2",
      type: "focus",
      date: "Today, 10:00 AM",
      duration: 45,
      completed: true,
    },
    {
      id: "3",
      type: "deep-work",
      date: "Yesterday, 3:15 PM",
      duration: 90,
      completed: true,
    },
    {
      id: "4",
      type: "pomodoro",
      date: "Yesterday, 9:00 AM",
      duration: 25,
      completed: false,
    },
    {
      id: "5",
      type: "tratak",
      date: "Dec 15, 6:00 PM",
      duration: 10,
      completed: true,
    },
    {
      id: "6",
      type: "focus",
      date: "Dec 15, 2:00 PM",
      duration: 60,
      completed: true,
    },
  ];

  const getSessionIcon = (type: Session["type"]) => {
    const icons = {
      pomodoro: "🍅",
      focus: "🎯",
      "deep-work": "🧠",
      tratak: "🕯️",
    };
    return icons[type];
  };

  const getSessionLabel = (type: Session["type"]) => {
    const labels = {
      pomodoro: "Pomodoro",
      focus: "Focus Timer",
      "deep-work": "Deep Work",
      tratak: "Tratak",
    };
    return labels[type];
  };

  const totalMinutes = sessions
    .filter((s) => s.completed)
    .reduce((acc, s) => acc + s.duration, 0);
  const totalSessions = sessions.filter((s) => s.completed).length;

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
        <Text style={styles.headerTitle}>Focus History</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Animated.View style={[styles.statCard, { opacity: fadeAnim }]}>
            <Text style={styles.statValue}>{totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </Animated.View>
          <Animated.View style={[styles.statCard, { opacity: fadeAnim }]}>
            <Text style={styles.statValue}>{totalMinutes}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </Animated.View>
          <Animated.View style={[styles.statCard, { opacity: fadeAnim }]}>
            <Text style={styles.statValue}>
              {Math.round((totalMinutes / 60) * 10) / 10}h
            </Text>
            <Text style={styles.statLabel}>Total</Text>
          </Animated.View>
        </View>

        {/* Filter */}
        <View style={styles.filterContainer}>
          {(["all", "week", "month"] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sessions List */}
        <View style={styles.sessionsList}>
          {sessions.map((session, index) => (
            <Animated.View
              key={session.id}
              style={[
                styles.sessionItem,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <View style={styles.sessionLeft}>
                <View
                  style={[
                    styles.sessionIcon,
                    !session.completed && styles.sessionIconIncomplete,
                  ]}
                >
                  <Text style={styles.sessionIconText}>
                    {getSessionIcon(session.type)}
                  </Text>
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionType}>
                    {getSessionLabel(session.type)}
                  </Text>
                  <Text style={styles.sessionDate}>{session.date}</Text>
                </View>
              </View>

              <View style={styles.sessionRight}>
                <Text style={styles.sessionDuration}>{session.duration}m</Text>
                {session.completed ? (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedIcon}>✓</Text>
                  </View>
                ) : (
                  <View style={styles.incompleteBadge}>
                    <Text style={styles.incompleteIcon}>×</Text>
                  </View>
                )}
              </View>
            </Animated.View>
          ))}
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
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "300",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "transparent",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  filterText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  filterTextActive: {
    color: "#000000",
    fontWeight: "600",
  },
  sessionsList: {
    gap: 12,
  },
  sessionItem: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  sessionIconIncomplete: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    opacity: 0.5,
  },
  sessionIconText: {
    fontSize: 24,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionType: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.5)",
  },
  sessionRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  sessionDuration: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  completedIcon: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "bold",
  },
  incompleteBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  incompleteIcon: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
  },
});
