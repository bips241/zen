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
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { database } from "../database";
import Task from "../database/models/Task";
import { Q } from "@nozbe/watermelondb";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface EisenhowerTask {
  id: string;
  text: string;
  quadrant:
    | "urgent-important"
    | "not-urgent-important"
    | "urgent-not-important"
    | "not-urgent-not-important";
  dbTask?: Task;
}

const quadrants = [
  {
    id: "urgent-important" as const,
    title: "Do First",
    subtitle: "Urgent & Important",
    description: "Critical tasks requiring immediate attention",
    color: "#FF4444", // Red
    icon: "flame" as const,
  },
  {
    id: "not-urgent-important" as const,
    title: "Schedule",
    subtitle: "Not Urgent & Important",
    description: "Long-term goals and strategic planning",
    color: "#00FF88", // Green (Zen accent)
    icon: "calendar" as const,
  },
  {
    id: "urgent-not-important" as const,
    title: "Delegate",
    subtitle: "Urgent & Not Important",
    description: "Tasks that can be delegated to others",
    color: "#FFAA00", // Orange
    icon: "people" as const,
  },
  {
    id: "not-urgent-not-important" as const,
    title: "Eliminate",
    subtitle: "Not Urgent & Not Important",
    description: "Time wasters to minimize or remove",
    color: "#888888", // Gray
    icon: "close-circle" as const,
  },
];

// Map database priority to quadrant
const priorityToQuadrant = (
  priority: string,
): EisenhowerTask["quadrant"] | null => {
  switch (priority) {
    case "urgent-important":
      return "urgent-important";
    case "urgent":
      return "urgent-not-important";
    case "important":
      return "not-urgent-important";
    case "low":
      return "not-urgent-not-important";
    default:
      return null;
  }
};

export default function EisenhowerMatrixScreen() {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState<EisenhowerTask[]>([]);
  const [selectedQuadrant, setSelectedQuadrant] = useState<
    EisenhowerTask["quadrant"] | null
  >(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    loadTasksFromDatabase();
  }, []);

  const loadTasksFromDatabase = async () => {
    try {
      const tasksCollection = database.get<Task>("tasks");
      const allTasks = await tasksCollection
        .query(Q.where("completed", false))
        .fetch();

      const eisenhowerTasks = allTasks
        .map((dbTask) => {
          const quadrant = priorityToQuadrant(dbTask.priority);
          if (!quadrant) return null;

          return {
            id: dbTask.id,
            text: dbTask.text,
            quadrant,
            dbTask,
          };
        })
        .filter(
          (task): task is NonNullable<typeof task> => task !== null,
        ) as EisenhowerTask[];

      setTasks(eisenhowerTasks);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getQuadrantTasks = (quadrantId: EisenhowerTask["quadrant"]) => {
    return tasks.filter((task) => task.quadrant === quadrantId);
  };

  const handleAddTask = async (quadrantId: EisenhowerTask["quadrant"]) => {
    if (newTaskText.trim()) {
      try {
        const tasksCollection = database.get<Task>("tasks");

        // Map quadrant to priority
        let priority = "low";
        if (quadrantId === "urgent-important") priority = "urgent-important";
        else if (quadrantId === "urgent-not-important") priority = "urgent";
        else if (quadrantId === "not-urgent-important") priority = "important";

        const newDbTask = await database.write(async () => {
          return await tasksCollection.create((task) => {
            task.text = newTaskText;
            task.completed = false;
            task.priority = priority;
            task.category = "general";
          });
        });

        const newTask: EisenhowerTask = {
          id: newDbTask.id,
          text: newTaskText,
          quadrant: quadrantId,
          dbTask: newDbTask,
        };

        setTasks([...tasks, newTask]);
        setNewTaskText("");
        setSelectedQuadrant(null);
      } catch (error) {
        console.error("Failed to add task:", error);
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (task?.dbTask) {
        await database.write(async () => {
          await task.dbTask!.markAsDeleted();
        });
      }
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (task?.dbTask) {
        await database.write(async () => {
          await task.dbTask!.update((t) => {
            t.completed = true;
          });
        });
        setTasks(tasks.filter((t) => t.id !== taskId));
      }
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View>
          <Text style={styles.headerTitle}>Eisenhower Matrix</Text>
          <Text style={styles.headerSubtitle}>
            Prioritize tasks by urgency & importance
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
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
                    borderColor: quadrant.color,
                  },
                ]}
              >
                {/* Quadrant Header with Color */}
                <View
                  style={[
                    styles.quadrantHeader,
                    { backgroundColor: `${quadrant.color}15` },
                  ]}
                >
                  <View style={styles.quadrantTitleRow}>
                    <Ionicons
                      name={quadrant.icon}
                      size={20}
                      color={quadrant.color}
                    />
                    <Text
                      style={[styles.quadrantTitle, { color: quadrant.color }]}
                    >
                      {quadrant.title}
                    </Text>
                  </View>
                  <Text style={styles.quadrantSubtitle}>
                    {quadrant.subtitle}
                  </Text>
                  <Text style={styles.quadrantDescription}>
                    {quadrant.description}
                  </Text>
                  <View style={styles.taskCount}>
                    <Text
                      style={[styles.taskCountText, { color: quadrant.color }]}
                    >
                      {quadrantTasks.length}{" "}
                      {quadrantTasks.length === 1 ? "task" : "tasks"}
                    </Text>
                  </View>
                </View>

                {/* Tasks List */}
                <ScrollView
                  style={styles.tasksList}
                  showsVerticalScrollIndicator={false}
                >
                  {quadrantTasks.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>No tasks yet</Text>
                    </View>
                  ) : (
                    quadrantTasks.map((task) => (
                      <View
                        key={task.id}
                        style={[
                          styles.taskItem,
                          { borderLeftColor: quadrant.color },
                        ]}
                      >
                        <TouchableOpacity
                          onPress={() => handleToggleComplete(task.id)}
                          style={styles.checkboxButton}
                        >
                          <Ionicons
                            name="checkmark-circle-outline"
                            size={20}
                            color="rgba(255, 255, 255, 0.5)"
                          />
                        </TouchableOpacity>
                        <Text style={styles.taskText} numberOfLines={2}>
                          {task.text}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleDeleteTask(task.id)}
                          style={styles.deleteButton}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color="rgba(255, 255, 255, 0.4)"
                          />
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </ScrollView>

                {/* Add Task Button */}
                <TouchableOpacity
                  onPress={() => setSelectedQuadrant(quadrant.id)}
                  style={[
                    styles.addButton,
                    { borderColor: `${quadrant.color}40` },
                  ]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={18} color={quadrant.color} />
                  <Text style={[styles.addText, { color: quadrant.color }]}>
                    Add Task
                  </Text>
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
            {selectedQuadrant && (
              <Text style={styles.modalQuadrant}>
                {quadrants.find((q) => q.id === selectedQuadrant)?.title}
              </Text>
            )}
            <TextInput
              style={styles.modalInput}
              value={newTaskText}
              onChangeText={setNewTaskText}
              placeholder="Enter task description..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              autoFocus
              multiline
              onSubmitEditing={() =>
                selectedQuadrant && handleAddTask(selectedQuadrant)
              }
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedQuadrant(null);
                  setNewTaskText("");
                }}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  selectedQuadrant && handleAddTask(selectedQuadrant)
                }
                style={[
                  styles.modalAddButton,
                  {
                    backgroundColor: selectedQuadrant
                      ? quadrants.find((q) => q.id === selectedQuadrant)?.color
                      : "#00FF88",
                  },
                ]}
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
    fontFamily: "ZenDots-Regular",
    fontSize: 20,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
  },
  closeButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  quadrantCard: {
    width: (SCREEN_WIDTH - 44) / 2, // (screenWidth - (padding * 2 + gap)) / 2
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 2,
    borderRadius: 20,
    padding: 12,
    minHeight: 340,
  },
  quadrantHeader: {
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
  },
  quadrantTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  quadrantTitle: {
    fontFamily: "ZenDots-Regular",
    fontSize: 14,
    fontWeight: "600",
  },
  quadrantSubtitle: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 4,
    lineHeight: 14,
  },
  quadrantDescription: {
    fontSize: 9,
    color: "rgba(255, 255, 255, 0.4)",
    lineHeight: 12,
  },
  taskCount: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  taskCountText: {
    fontFamily: "ZenDots-Regular",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tasksList: {
    flex: 1,
    marginBottom: 12,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.3)",
    fontStyle: "italic",
  },
  taskItem: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderLeftWidth: 3,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkboxButton: {
    padding: 2,
  },
  taskText: {
    flex: 1,
    fontSize: 12,
    color: "#FFFFFF",
    lineHeight: 16,
  },
  deleteButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 10,
    gap: 6,
  },
  addText: {
    fontFamily: "ZenDots-Regular",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
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
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  modalContent: {
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontFamily: "ZenDots-Regular",
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  modalQuadrant: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
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
    fontSize: 14,
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    alignItems: "center",
  },
  modalCancelText: {
    fontFamily: "ZenDots-Regular",
    color: "#FFFFFF",
    fontSize: 12,
  },
  modalAddButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalAddText: {
    fontFamily: "ZenDots-Regular",
    color: "#000000",
    fontSize: 12,
    fontWeight: "600",
  },
});
