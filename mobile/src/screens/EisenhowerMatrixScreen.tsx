import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  TextInput,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

interface Task {
  id: string;
  text: string;
  quadrant:
    | "urgent-important"
    | "not-urgent-important"
    | "urgent-not-important"
    | "not-urgent-not-important";
}

const quadrants = [
  {
    id: "urgent-important" as const,
    title: "Do First",
    subtitle: "Urgent & Important",
    description: "Critical deadlines and emergencies",
  },
  {
    id: "not-urgent-important" as const,
    title: "Schedule",
    subtitle: "Not Urgent & Important",
    description: "Long-term development and planning",
  },
  {
    id: "urgent-not-important" as const,
    title: "Delegate",
    subtitle: "Urgent & Not Important",
    description: "Interruptions and some meetings",
  },
  {
    id: "not-urgent-not-important" as const,
    title: "Eliminate",
    subtitle: "Not Urgent & Not Important",
    description: "Time wasters and distractions",
  },
];

export default function EisenhowerMatrixScreen() {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      text: "Client presentation deadline",
      quadrant: "urgent-important",
    },
    {
      id: "2",
      text: "Weekly planning session",
      quadrant: "not-urgent-important",
    },
    {
      id: "3",
      text: "Respond to non-critical emails",
      quadrant: "urgent-not-important",
    },
    {
      id: "4",
      text: "Browse social media",
      quadrant: "not-urgent-not-important",
    },
  ]);
  const [selectedQuadrant, setSelectedQuadrant] = useState<
    Task["quadrant"] | null
  >(null);
  const [newTaskText, setNewTaskText] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const getQuadrantTasks = (quadrantId: Task["quadrant"]) => {
    return tasks.filter((task) => task.quadrant === quadrantId);
  };

  const handleAddTask = (quadrantId: Task["quadrant"]) => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: newTaskText,
        quadrant: quadrantId,
      };
      setTasks([...tasks, newTask]);
      setNewTaskText("");
      setSelectedQuadrant(null);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View>
          <Text style={styles.headerTitle}>Eisenhower Matrix</Text>
          <Text style={styles.headerSubtitle}>
            Prioritize by urgency and importance
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Matrix Grid */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {quadrants.map((quadrant, index) => {
            const quadrantTasks = getQuadrantTasks(quadrant.id);

            return (
              <Animated.View
                key={quadrant.id}
                style={[
                  styles.quadrantCard,
                  {
                    opacity: fadeAnim,
                  },
                ]}
              >
                {/* Quadrant Header */}
                <View style={styles.quadrantHeader}>
                  <Text style={styles.quadrantTitle}>{quadrant.title}</Text>
                  <Text style={styles.quadrantSubtitle}>
                    {quadrant.subtitle}
                  </Text>
                  <Text style={styles.quadrantDescription}>
                    {quadrant.description}
                  </Text>
                </View>

                {/* Tasks List */}
                <ScrollView
                  style={styles.tasksList}
                  showsVerticalScrollIndicator={false}
                >
                  {quadrantTasks.map((task) => (
                    <View key={task.id} style={styles.taskItem}>
                      <Text style={styles.taskGrip}>⋮⋮</Text>
                      <Text style={styles.taskText}>{task.text}</Text>
                      <TouchableOpacity
                        onPress={() => handleDeleteTask(task.id)}
                        style={styles.deleteButton}
                      >
                        <Text style={styles.deleteIcon}>🗑</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>

                {/* Add Task Button */}
                <TouchableOpacity
                  onPress={() => setSelectedQuadrant(quadrant.id)}
                  style={styles.addButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addIcon}>+</Text>
                  <Text style={styles.addText}>Add Task</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      {/* Add Task Modal */}
      <Modal
        visible={selectedQuadrant !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedQuadrant(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setSelectedQuadrant(null)}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            <TextInput
              style={styles.modalInput}
              value={newTaskText}
              onChangeText={setNewTaskText}
              placeholder="Enter task description..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              autoFocus
              onSubmitEditing={() =>
                selectedQuadrant && handleAddTask(selectedQuadrant)
              }
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setSelectedQuadrant(null)}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  selectedQuadrant && handleAddTask(selectedQuadrant)
                }
                style={styles.modalAddButton}
              >
                <Text style={styles.modalAddText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  quadrantCard: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 24,
    padding: 16,
    minHeight: 300,
  },
  quadrantHeader: {
    marginBottom: 16,
  },
  quadrantTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  quadrantSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    marginBottom: 4,
  },
  quadrantDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.3)",
  },
  tasksList: {
    flex: 1,
    marginBottom: 12,
  },
  taskItem: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  taskGrip: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.3)",
    lineHeight: 20,
  },
  taskText: {
    flex: 1,
    fontSize: 14,
    color: "#FFFFFF",
    lineHeight: 20,
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    gap: 8,
  },
  addIcon: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  addText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    alignItems: "center",
  },
  modalCancelText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  modalAddButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
  },
  modalAddText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
});
