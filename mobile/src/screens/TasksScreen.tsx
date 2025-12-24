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
  completed: boolean;
  priority: "high" | "medium" | "low";
  category: string;
}

export default function TasksScreen() {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      text: "Complete project proposal",
      completed: false,
      priority: "high",
      category: "Work",
    },
    {
      id: "2",
      text: "Review pull requests",
      completed: true,
      priority: "medium",
      category: "Work",
    },
    {
      id: "3",
      text: "Morning meditation",
      completed: true,
      priority: "high",
      category: "Personal",
    },
    {
      id: "4",
      text: "Buy groceries",
      completed: false,
      priority: "low",
      category: "Personal",
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: newTaskText,
        completed: false,
        priority: "medium",
        category: "Work",
      };
      setTasks([newTask, ...tasks]);
      setNewTaskText("");
      setShowAddModal(false);
    }
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const getPriorityColor = (priority: Task["priority"]) => {
    const colors = {
      high: "#FF4444",
      medium: "#FFAA00",
      low: "#00FF88",
    };
    return colors[priority];
  };

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
        <View>
          <Text style={styles.headerTitle}>Tasks</Text>
          <Text style={styles.headerSubtitle}>
            {activeTasks.length} active, {completedTasks.length} completed
          </Text>
        </View>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACTIVE</Text>
            {activeTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                onPress={() => toggleTask(task.id)}
                style={styles.taskItem}
                activeOpacity={0.8}
              >
                <View style={styles.taskLeft}>
                  <View style={styles.checkbox}>
                    <View style={styles.checkboxInner} />
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskText}>{task.text}</Text>
                    <View style={styles.taskMeta}>
                      <View
                        style={[
                          styles.priorityDot,
                          { backgroundColor: getPriorityColor(task.priority) },
                        ]}
                      />
                      <Text style={styles.taskCategory}>{task.category}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => deleteTask(task.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteIcon}>🗑</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>COMPLETED</Text>
            {completedTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                onPress={() => toggleTask(task.id)}
                style={[styles.taskItem, styles.taskItemCompleted]}
                activeOpacity={0.8}
              >
                <View style={styles.taskLeft}>
                  <View style={[styles.checkbox, styles.checkboxChecked]}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskText, styles.taskTextCompleted]}>
                      {task.text}
                    </Text>
                    <View style={styles.taskMeta}>
                      <View
                        style={[
                          styles.priorityDot,
                          { backgroundColor: getPriorityColor(task.priority) },
                        ]}
                      />
                      <Text style={styles.taskCategory}>{task.category}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => deleteTask(task.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteIcon}>🗑</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        onPress={() => setShowAddModal(true)}
        style={styles.fab}
        activeOpacity={0.9}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setShowAddModal(false)}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Task</Text>
            <TextInput
              style={styles.modalInput}
              value={newTaskText}
              onChangeText={setNewTaskText}
              placeholder="What needs to be done?"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              autoFocus
              onSubmitEditing={addTask}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addTask} style={styles.modalAddButton}>
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
  },
  placeholder: {
    width: 48,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100,
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
  taskItem: {
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
  taskItemCompleted: {
    opacity: 0.6,
  },
  taskLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: "#00FF88",
    borderColor: "#00FF88",
  },
  checkmark: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "bold",
  },
  taskInfo: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 6,
  },
  taskTextCompleted: {
    textDecorationLine: "line-through",
    color: "rgba(255, 255, 255, 0.5)",
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskCategory: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: "#000000",
    lineHeight: 32,
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
