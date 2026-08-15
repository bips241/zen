/**
 * TasksScreen - Comprehensive Task Management
 * Features: Day/Week/Month views, Priority matrix (Eisenhower), Time blocking, Recurring tasks
 * Optimized for productivity planning
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  TextInput,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { Text } from "../components/atoms";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSystemInsets } from "../hooks/useSystemInsets";
import { CategoryService } from "../services/categoryService";
import { TaskService, TaskData } from "../services/taskService";
import Task from "../database/models/Task";
import BottomNavBar from "../components/molecules/BottomNavBar";

type ViewMode = "today" | "week" | "month" | "calendar" | "all";
type Priority = "urgent-important" | "urgent" | "important" | "low";

const PRIORITIES = {
  "urgent-important": {
    label: "Do First",
    color: "#FF4444",
    icon: "alert-circle",
  },
  urgent: { label: "Schedule", color: "#FFAA00", icon: "time-outline" },
  important: { label: "Delegate", color: "#00AAFF", icon: "people-outline" },
  low: { label: "Eliminate", color: "#888888", icon: "trash-outline" },
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TasksScreen() {
  const [activeTab, setActiveTab] = useState("tasks");
  const navigation = useNavigation();
  const { navBarHeight, insets, isKeyboardVisible } = useSystemInsets();

  // Dynamic bottom calculation: use keyboard height when visible, otherwise navbar
  const keyboardHeight = insets.keyboardHeight || 0;
  const safeNavBarHeight = navBarHeight || 0;
  const systemBottomOffset = isKeyboardVisible
    ? keyboardHeight
    : safeNavBarHeight;

  // Tab bar height + system navbar height + padding
  const TAB_BAR_HEIGHT = 60;
  const bottomSpacing = TAB_BAR_HEIGHT + safeNavBarHeight + 16;
  const QUICK_ADD_HEIGHT = 70; // Height of the add task button bar
  const quickAddBarBottom = TAB_BAR_HEIGHT + safeNavBarHeight; // Position above navbar

  const [viewMode, setViewMode] = useState<ViewMode>("today");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [categories, setCategories] = useState<string[]>([]);
  const [showManageCategoriesModal, setShowManageCategoriesModal] =
    useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteRecurringConfirm, setShowDeleteRecurringConfirm] =
    useState(false);
  const [selectedRecurringTasks, setSelectedRecurringTasks] = useState<
    string[]
  >([]);
  const [recurringTasks, setRecurringTasks] = useState<Task[]>([]);
  const [resetType, setResetType] = useState<"date" | "all">("date");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    text: "",
    priority: "urgent-important" as Priority,
    category: "Work",
    timeEstimate: 30,
    taskTime: undefined as string | undefined,
    dueDate: new Date(),
    recurring: null as TaskData["recurring"] | null,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Update active tab when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setActiveTab("tasks");
    }, []),
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Load categories and tasks from database
    loadCategories();
    loadTasks();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await CategoryService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadTasks = async () => {
    try {
      setIsLoadingTasks(true);
      const allTasks = await TaskService.getAllTasks();
      setTasks(allTasks);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleAddCategory = async () => {
    const trimmedName = newCategoryName.trim();

    // Validation checks
    if (!trimmedName) {
      alert("Category name cannot be empty");
      return;
    }

    if (trimmedName.length > 50) {
      alert("Category name is too long (max 50 characters)");
      return;
    }

    if (categories.includes(trimmedName)) {
      alert("Category already exists");
      return;
    }

    try {
      const updated = await CategoryService.addCategory(trimmedName);
      setCategories(updated);
      setNewCategoryName("");
    } catch (error: any) {
      alert(error.message || "Failed to add category");
    }
  };

  const handleRemoveCategory = async (categoryName: string) => {
    try {
      const updated = await CategoryService.removeCategory(categoryName);
      setCategories(updated);
    } catch (error) {
      alert("Failed to remove category");
    }
  };

  // Get tasks for specific date (including recurring)
  const getTasksForDate = (date: Date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.error("Invalid date provided to getTasksForDate");
      return [];
    }

    const targetDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const dayOfWeek = targetDate.getDay();

    return tasks.filter((task) => {
      if (!task) return false;

      // Check if task has a due date on this specific date
      if (task.dueDate) {
        const taskDate = new Date(task.dueDate);
        const taskDateOnly = new Date(
          taskDate.getFullYear(),
          taskDate.getMonth(),
          taskDate.getDate(),
        );
        if (taskDateOnly.getTime() === targetDate.getTime()) return true;
      }

      // Check recurring tasks
      if (task.recurringType) {
        const weekdays = task.weekdaysArray;
        const endDate = task.recurringEndDate;

        // Check if recurring has ended
        if (endDate && targetDate.getTime() > endDate) return false;

        if (task.recurringType === "daily") {
          // If weekdays specified, check if target day matches
          if (weekdays && weekdays.length > 0) {
            return weekdays.includes(dayOfWeek);
          }
          return true; // Daily without weekday restriction
        }

        if (task.recurringType === "weekly" && weekdays) {
          return weekdays.includes(dayOfWeek);
        }

        // Monthly recurring (same day of month)
        if (task.recurringType === "monthly" && task.dueDate) {
          const taskDate = new Date(task.dueDate);
          const taskDay = taskDate.getDate();
          const targetDay = targetDate.getDate();

          // Handle end-of-month edge cases (e.g., task on 31st but month has 30 days)
          const lastDayOfTargetMonth = new Date(
            targetDate.getFullYear(),
            targetDate.getMonth() + 1,
            0,
          ).getDate();

          if (taskDay > lastDayOfTargetMonth) {
            // If task day doesn't exist in target month, use last day of month
            return targetDay === lastDayOfTargetMonth;
          }

          return targetDay === taskDay;
        }
      }

      return false;
    });
  };

  // Filter tasks based on view mode
  const getFilteredTasks = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekEnd = new Date(today.getTime() + 7 * 86400000);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    switch (viewMode) {
      case "today":
        return getTasksForDate(today);
      case "week":
        return tasks.filter(
          (t) => !t.dueDate || t.dueDate <= weekEnd.getTime(),
        );
      case "month":
        return tasks.filter(
          (t) => !t.dueDate || t.dueDate <= monthEnd.getTime(),
        );
      case "calendar":
        return getTasksForDate(selectedDate);
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();
  const activeTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  // Group tasks by priority (Eisenhower Matrix)
  const tasksByPriority = activeTasks.reduce((acc, task) => {
    const priority = task.priority as Priority;
    if (!acc[priority]) acc[priority] = [];
    acc[priority].push(task);
    return acc;
  }, {} as Record<Priority, Task[]>);

  // Calculate statistics with safe defaults
  const totalTimeToday = activeTasks.reduce(
    (sum, t) => sum + (t.timeEstimate || 0),
    0,
  );

  // Safe completion rate calculation
  const totalTasksCount = filteredTasks.length;
  const completedCount = completedTasks.length;
  const completionRate =
    totalTasksCount > 0
      ? Math.round((completedCount / totalTasksCount) * 100)
      : 0;

  const toggleTask = async (taskId: string) => {
    if (!taskId || typeof taskId !== "string") {
      console.error("Invalid task ID provided for toggle");
      return;
    }

    try {
      await TaskService.toggleTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error("Failed to toggle task:", error);
      alert("Failed to update task status");
    }
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    if (
      !taskId ||
      typeof taskId !== "string" ||
      !subtaskId ||
      typeof subtaskId !== "string"
    ) {
      console.error("Invalid task or subtask ID provided");
      return;
    }

    try {
      await TaskService.toggleSubtask(taskId, subtaskId);
      await loadTasks();
    } catch (error) {
      console.error("Failed to toggle subtask:", error);
      alert("Failed to update subtask status");
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!taskId || typeof taskId !== "string") {
      console.error("Invalid task ID provided for deletion");
      return;
    }

    try {
      await TaskService.deleteTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete task. It may have already been deleted.");
    }
  };

  const addTask = async () => {
    const trimmedText = newTask.text.trim();

    // Validation checks
    if (!trimmedText) {
      alert("Task description cannot be empty");
      return;
    }

    if (trimmedText.length > 500) {
      alert("Task description is too long (max 500 characters)");
      return;
    }

    // Validate time estimate
    if (
      newTask.timeEstimate &&
      (newTask.timeEstimate < 1 || newTask.timeEstimate > 1440)
    ) {
      alert("Time estimate must be between 1 and 1440 minutes (24 hours)");
      return;
    }

    // Validate due date is not in the past (unless it's today)
    if (newTask.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(newTask.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        alert("Cannot create tasks with past due dates");
        return;
      }
    }

    // Validate recurring task configuration
    if (newTask.recurring) {
      if (
        newTask.recurring.type === "weekly" &&
        (!newTask.recurring.weekdays || newTask.recurring.weekdays.length === 0)
      ) {
        alert("Weekly recurring tasks must have at least one selected day");
        return;
      }

      if (newTask.recurring.endDate) {
        const endDate = new Date(newTask.recurring.endDate);
        const startDate = newTask.dueDate
          ? new Date(newTask.dueDate)
          : new Date();

        if (endDate <= startDate) {
          alert("Recurring end date must be after the start date");
          return;
        }
      }
    }

    try {
      const taskData: TaskData = {
        text: trimmedText,
        priority: newTask.priority,
        category: newTask.category,
        timeEstimate: newTask.timeEstimate,
        taskTime: newTask.taskTime,
        dueDate: newTask.dueDate,
        recurring: newTask.recurring || undefined,
      };

      await TaskService.createTask(taskData);
      await loadTasks();

      setNewTask({
        text: "",
        priority: "urgent-important",
        category: "Work",
        timeEstimate: 30,
        taskTime: undefined,
        dueDate: new Date(),
        recurring: null,
      });
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task");
    }
  };

  const editTask = async () => {
    if (!editingTask) {
      alert("No task selected for editing");
      return;
    }

    const trimmedText = newTask.text.trim();

    if (!trimmedText) {
      alert("Task description cannot be empty");
      return;
    }

    if (trimmedText.length > 500) {
      alert("Task description is too long (max 500 characters)");
      return;
    }

    // Validate time estimate
    if (
      newTask.timeEstimate &&
      (newTask.timeEstimate < 1 || newTask.timeEstimate > 1440)
    ) {
      alert("Time estimate must be between 1 and 1440 minutes (24 hours)");
      return;
    }

    // Validate due date
    if (newTask.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(newTask.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        alert("Cannot set past due dates");
        return;
      }
    }

    // Validate recurring task configuration
    if (newTask.recurring) {
      if (
        newTask.recurring.type === "weekly" &&
        (!newTask.recurring.weekdays || newTask.recurring.weekdays.length === 0)
      ) {
        alert("Weekly recurring tasks must have at least one selected day");
        return;
      }

      if (newTask.recurring.endDate) {
        const endDate = new Date(newTask.recurring.endDate);
        const startDate = newTask.dueDate
          ? new Date(newTask.dueDate)
          : new Date();

        if (endDate <= startDate) {
          alert("Recurring end date must be after the start date");
          return;
        }
      }
    }

    try {
      const taskData: Partial<TaskData> = {
        text: trimmedText,
        priority: newTask.priority,
        category: newTask.category,
        timeEstimate: newTask.timeEstimate,
        taskTime: newTask.taskTime,
        dueDate: newTask.dueDate,
        recurring: newTask.recurring || undefined,
      };

      await TaskService.updateTask(editingTask.id, taskData);
      await loadTasks();

      setEditingTask(null);
      setShowEditModal(false);
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("Failed to update task");
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      text: task.text,
      priority: task.priority as Priority,
      category: task.category,
      timeEstimate: task.timeEstimate || 30,
      taskTime: task.taskTime,
      dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
      recurring: task.recurringType
        ? {
            type: task.recurringType as any,
            weekdays: task.weekdaysArray,
            endDate: task.recurringEndDate
              ? new Date(task.recurringEndDate)
              : undefined,
            interval: task.recurringInterval,
          }
        : null,
    });
    setShowEditModal(true);
  };

  const handleOpenDeleteRecurring = () => {
    const recurring = tasks.filter((t) => t.recurringType);
    setRecurringTasks(recurring);
    setSelectedRecurringTasks([]);
    setShowDeleteRecurringConfirm(true);
  };

  const handleDeleteSelectedRecurring = async () => {
    if (selectedRecurringTasks.length === 0) {
      alert("Please select at least one recurring task to delete");
      return;
    }
    try {
      await Promise.all(
        selectedRecurringTasks.map((taskId) => TaskService.deleteTask(taskId)),
      );
      await loadTasks();
      setShowDeleteRecurringConfirm(false);
      setSelectedRecurringTasks([]);
    } catch (error) {
      console.error("Failed to delete recurring tasks:", error);
      alert("Failed to delete recurring tasks");
    }
  };

  const toggleRecurringTaskSelection = (taskId: string) => {
    setSelectedRecurringTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const handleResetTasks = async () => {
    try {
      if (resetType === "date") {
        await TaskService.deleteTasksForDate(
          viewMode === "calendar" ? selectedDate : new Date(),
        );
      } else {
        await TaskService.deleteAllTasks();
      }
      await loadTasks();
      setShowResetConfirm(false);
    } catch (error) {
      console.error("Failed to reset tasks:", error);
      alert("Failed to reset tasks");
    }
  };

  const formatTaskTime = (time?: string) => {
    if (!time) return "No time set";
    return time;
  };

  // Generate calendar days for current month
  const getCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    // Validate year and month
    if (year < 1900 || year > 2100) {
      console.error("Year out of valid range");
      return [];
    }

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts (max 6)
    for (let i = 0; i < Math.min(startDayOfWeek, 6); i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const formatDate = (date: Date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "Invalid Date";
    }

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    try {
      return `${
        months[date.getMonth()]
      } ${date.getDate()}, ${date.getFullYear()}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const changeMonth = (direction: number) => {
    if (!direction || (direction !== 1 && direction !== -1)) {
      console.error("Invalid direction for month change");
      return;
    }

    const newDate = new Date(selectedDate);
    const currentYear = newDate.getFullYear();
    const currentMonth = newDate.getMonth();
    const targetMonth = currentMonth + direction;

    // Calculate target year after month change
    const targetYear = currentYear + Math.floor(targetMonth / 12);

    // Prevent going too far in past or future
    const futureLimit = new Date().getFullYear() + 5;
    const pastLimit = new Date().getFullYear() - 5;

    if (targetYear > futureLimit || targetYear < pastLimit) {
      alert("Cannot navigate beyond 5 years from current year");
      return;
    }

    newDate.setMonth(targetMonth);

    // Validate the resulting date is valid
    if (isNaN(newDate.getTime())) {
      console.error("Invalid date after month change");
      return;
    }

    setSelectedDate(newDate);
  };

  const formatDuration = (minutes: number) => {
    if (typeof minutes !== "number" || isNaN(minutes) || minutes < 0) {
      return "0m";
    }

    if (minutes === 0) {
      return "0m";
    }

    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);

    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Tasks</Text>
            <Text style={styles.headerSubtitle}>
              {activeTasks.length} active · {formatDuration(totalTimeToday)}{" "}
              today
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={handleOpenDeleteRecurring}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Ionicons name="repeat" size={18} color="#FF4444" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setResetType("date");
                setShowResetConfirm(true);
              }}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={18} color="#FFAA00" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statCardValue}>
              {isLoadingTasks ? "--" : `${completionRate}%`}
            </Text>
            <Text style={styles.statCardLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statCardValue}>
              {isLoadingTasks ? "--" : activeTasks.length}
            </Text>
            <Text style={styles.statCardLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statCardValue}>
              {isLoadingTasks ? "--" : formatDuration(totalTimeToday)}
            </Text>
            <Text style={styles.statCardLabel}>Today</Text>
          </View>
        </View>

        {/* View Mode Selector */}
        <View style={styles.viewSelector}>
          {(["today", "week", "calendar", "all"] as ViewMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => setViewMode(mode)}
              style={[
                styles.viewButton,
                viewMode === mode && styles.viewButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.viewButtonText,
                  viewMode === mode && styles.viewButtonTextActive,
                ]}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: bottomSpacing + QUICK_ADD_HEIGHT + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading State */}
        {isLoadingTasks && (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>Loading tasks...</Text>
          </View>
        )}

        {/* Calendar View */}
        {!isLoadingTasks && viewMode === "calendar" && (
          <View style={styles.calendarSection}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                onPress={() => changeMonth(-1)}
                style={styles.monthButton}
              >
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>
                {selectedDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>
              <TouchableOpacity
                onPress={() => changeMonth(1)}
                style={styles.monthButton}
              >
                <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.weekdayHeader}>
              {WEEKDAYS.map((day) => (
                <Text key={day} style={styles.weekdayLabel}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {getCalendarDays().map((day, index) => {
                if (!day) {
                  return (
                    <View key={`empty-${index}`} style={styles.calendarDay} />
                  );
                }

                const dayTasks = getTasksForDate(day);
                const isToday =
                  day.toDateString() === new Date().toDateString();
                const isSelected =
                  day.toDateString() === selectedDate.toDateString();

                return (
                  <TouchableOpacity
                    key={day.toISOString()}
                    onPress={() => setSelectedDate(day)}
                    style={[
                      styles.calendarDay,
                      isToday && styles.calendarDayToday,
                      isSelected && styles.calendarDaySelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        isToday && styles.calendarDayTextToday,
                        isSelected && styles.calendarDayTextSelected,
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                    {dayTasks.length > 0 && (
                      <View style={styles.taskIndicators}>
                        {dayTasks.slice(0, 3).map((task, i) => (
                          <View
                            key={i}
                            style={[
                              styles.taskDot,
                              {
                                backgroundColor:
                                  PRIORITIES[task.priority as Priority].color,
                              },
                            ]}
                          />
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.selectedDateInfo}>
              <Text style={styles.selectedDateTitle}>
                {formatDate(selectedDate)}
              </Text>
              <Text style={styles.selectedDateSubtitle}>
                {getTasksForDate(selectedDate).length} task(s)
              </Text>
            </View>
          </View>
        )}

        {/* Priority Matrix */}
        {viewMode === "today" && Object.keys(tasksByPriority).length > 0 && (
          <View style={styles.matrixSection}>
            <Text style={styles.sectionTitle}>PRIORITY MATRIX</Text>
            <View style={styles.matrix}>
              {(Object.keys(PRIORITIES) as Priority[]).map((priority) => {
                const tasksInPriority = tasksByPriority[priority] || [];
                if (tasksInPriority.length === 0) return null;

                return (
                  <View key={priority} style={styles.matrixQuadrant}>
                    <View style={styles.matrixHeader}>
                      <Ionicons
                        name={PRIORITIES[priority].icon as any}
                        size={16}
                        color={PRIORITIES[priority].color}
                      />
                      <Text
                        style={[
                          styles.matrixLabel,
                          { color: PRIORITIES[priority].color },
                        ]}
                      >
                        {PRIORITIES[priority].label}
                      </Text>
                      <Text style={styles.matrixCount}>
                        {tasksInPriority.length}
                      </Text>
                    </View>
                    {tasksInPriority.slice(0, 2).map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        onDelete={deleteTask}
                        onEdit={handleEditTask}
                        onToggleSubtask={toggleSubtask}
                        compact
                      />
                    ))}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              ACTIVE ({activeTasks.length})
            </Text>
            {activeTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onEdit={handleEditTask}
                onToggleSubtask={toggleSubtask}
              />
            ))}
          </View>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              COMPLETED ({completedTasks.length})
            </Text>
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onEdit={handleEditTask}
                onToggleSubtask={toggleSubtask}
                completed
              />
            ))}
          </View>
        )}

        {activeTasks.length === 0 && completedTasks.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="checkmark-done-circle-outline"
              size={64}
              color="rgba(255, 255, 255, 0.2)"
            />
            <Text style={styles.emptyText}>No tasks yet</Text>
            <Text style={styles.emptySubtext}>
              Tap + to create your first task
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Add Bar - Above navbar */}
      <View style={[styles.quickAddBar, { bottom: quickAddBarBottom }]}>
        <TouchableOpacity
          onPress={() => {
            // Reset to empty task
            setNewTask({
              text: "",
              priority: "urgent-important",
              category: "Work",
              timeEstimate: 30,
              taskTime: undefined,
              dueDate: viewMode === "calendar" ? selectedDate : new Date(),
              recurring: null,
            });
            setEditingTask(null);
            setShowAddModal(true);
          }}
          style={styles.quickAddButton}
        >
          <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.quickAddText}>Add Task</Text>
        </TouchableOpacity>
      </View>

      {/* Add Task Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setShowAddModal(false)}
          />
          <View style={styles.modalContent}>
            <ScrollView
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Task</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Ionicons name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.modalInput}
                value={newTask.text}
                onChangeText={(text) => setNewTask({ ...newTask, text })}
                placeholder="What needs to be done?"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                autoFocus
                multiline
              />

              {/* Priority Selector */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Priority</Text>
                <View style={styles.priorityGrid}>
                  {(Object.keys(PRIORITIES) as Priority[]).map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      onPress={() => setNewTask({ ...newTask, priority })}
                      style={[
                        styles.priorityOption,
                        newTask.priority === priority &&
                          styles.priorityOptionActive,
                        {
                          borderColor:
                            newTask.priority === priority
                              ? PRIORITIES[priority].color
                              : "rgba(255, 255, 255, 0.1)",
                        },
                      ]}
                    >
                      <Ionicons
                        name={PRIORITIES[priority].icon as any}
                        size={20}
                        color={PRIORITIES[priority].color}
                      />
                      <Text style={styles.priorityLabel}>
                        {PRIORITIES[priority].label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Category Selector */}
              <View style={styles.modalSection}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.modalLabel}>Category</Text>
                  <TouchableOpacity
                    onPress={() => setShowManageCategoriesModal(true)}
                    style={styles.manageCategoriesButton}
                  >
                    <Ionicons
                      name="settings-outline"
                      size={16}
                      color="rgba(255, 255, 255, 0.7)"
                    />
                    <Text style={styles.manageCategoriesText}>Manage</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                >
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setNewTask({ ...newTask, category: cat })}
                      style={[
                        styles.categoryChip,
                        newTask.category === cat && styles.categoryChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          newTask.category === cat &&
                            styles.categoryChipTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Date Picker */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Due Date</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(!showDatePicker)}
                  style={styles.dateButton}
                >
                  <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.dateButtonText}>
                    {formatDate(newTask.dueDate)}
                  </Text>
                  <Ionicons
                    name={showDatePicker ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="rgba(255, 255, 255, 0.5)"
                  />
                </TouchableOpacity>
                {showDatePicker && (
                  <View style={styles.quickDatePicker}>
                    <TouchableOpacity
                      onPress={() => {
                        setNewTask({ ...newTask, dueDate: new Date() });
                        setShowDatePicker(false);
                      }}
                      style={styles.quickDateOption}
                    >
                      <Text style={styles.quickDateText}>Today</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setNewTask({
                          ...newTask,
                          dueDate: new Date(Date.now() + 86400000),
                        });
                        setShowDatePicker(false);
                      }}
                      style={styles.quickDateOption}
                    >
                      <Text style={styles.quickDateText}>Tomorrow</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setShowDatePicker(false);
                        setViewMode("calendar");
                        setShowAddModal(false);
                      }}
                      style={styles.quickDateOption}
                    >
                      <View style={styles.quickDateOptionRow}>
                        <Text style={styles.quickDateText}>
                          Choose from calendar
                        </Text>
                        <Ionicons
                          name="calendar-outline"
                          size={18}
                          color="#FFFFFF"
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Time Picker (Optional) */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Time (Optional)</Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(!showTimePicker)}
                  style={styles.dateButton}
                >
                  <Ionicons name="time" size={20} color="#FFFFFF" />
                  <Text style={styles.dateButtonText}>
                    {formatTaskTime(newTask.taskTime)}
                  </Text>
                  <Ionicons
                    name={showTimePicker ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="rgba(255, 255, 255, 0.5)"
                  />
                </TouchableOpacity>
                {showTimePicker && (
                  <View style={styles.timePicker}>
                    <DateTimePicker
                      value={(() => {
                        const date = new Date();
                        if (newTask.taskTime) {
                          const [hours, minutes] = newTask.taskTime
                            .split(":")
                            .map(Number);
                          date.setHours(hours || 0, minutes || 0, 0, 0);
                        }
                        return date;
                      })()}
                      mode="time"
                      is24Hour={true}
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(event, selectedDate) => {
                        if (event.type === "set" && selectedDate) {
                          const hours = selectedDate.getHours();
                          const minutes = selectedDate.getMinutes();
                          const timeString = `${String(hours).padStart(
                            2,
                            "0",
                          )}:${String(minutes).padStart(2, "0")}`;
                          setNewTask({ ...newTask, taskTime: timeString });
                        }
                        if (Platform.OS === "android") {
                          setShowTimePicker(false);
                        }
                      }}
                      textColor="#FFFFFF"
                      themeVariant="dark"
                      style={{ width: "100%" }}
                    />
                    {newTask.taskTime && (
                      <TouchableOpacity
                        onPress={() => {
                          setNewTask({ ...newTask, taskTime: undefined });
                          setShowTimePicker(false);
                        }}
                        style={styles.clearTimeButton}
                      >
                        <Text style={styles.clearTimeText}>Clear Time</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              {/* Recurring Options */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Recurring</Text>
                <TouchableOpacity
                  onPress={() => setShowRecurringModal(true)}
                  style={styles.recurringButton}
                >
                  <Ionicons name="repeat" size={20} color="#FFFFFF" />
                  <Text style={styles.recurringButtonText}>
                    {newTask.recurring
                      ? newTask.recurring.type === "weekly" &&
                        newTask.recurring.weekdays
                        ? `${newTask.recurring.weekdays
                            .map((d: number) => WEEKDAYS[d])
                            .join(", ")}`
                        : newTask.recurring.type.charAt(0).toUpperCase() +
                          newTask.recurring.type.slice(1)
                      : "None"}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="rgba(255, 255, 255, 0.5)"
                  />
                </TouchableOpacity>
              </View>

              {/* Time Estimate */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Time Estimate</Text>
                <View style={styles.timeSelector}>
                  {[15, 30, 60, 120].map((time) => (
                    <TouchableOpacity
                      key={time}
                      onPress={() =>
                        setNewTask({ ...newTask, timeEstimate: time })
                      }
                      style={[
                        styles.timeButton,
                        newTask.timeEstimate === time &&
                          styles.timeButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.timeButtonText,
                          newTask.timeEstimate === time &&
                            styles.timeButtonTextActive,
                        ]}
                      >
                        {formatDuration(time)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity onPress={addTask} style={styles.modalAddButton}>
                <Text style={styles.modalAddText}>Create Task</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Recurring Task Modal */}
      <Modal
        visible={showRecurringModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRecurringModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setShowRecurringModal(false)}
          />
          <View
            style={[styles.modalContent, { marginBottom: systemBottomOffset }]}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Recurring Settings</Text>
                <TouchableOpacity onPress={() => setShowRecurringModal(false)}>
                  <Ionicons name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Recurring Type */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Repeat</Text>
                <View style={styles.recurringTypes}>
                  {[
                    { type: null, label: "None" },
                    { type: "daily", label: "Daily" },
                    { type: "weekly", label: "Weekly" },
                    { type: "monthly", label: "Monthly" },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.label}
                      onPress={() =>
                        setNewTask({
                          ...newTask,
                          recurring: option.type
                            ? {
                                type: option.type as
                                  | "daily"
                                  | "weekly"
                                  | "monthly",
                                weekdays:
                                  option.type === "weekly"
                                    ? [1, 2, 3, 4, 5]
                                    : undefined,
                              }
                            : null,
                        })
                      }
                      style={[
                        styles.recurringTypeButton,
                        (newTask.recurring?.type === option.type ||
                          (!newTask.recurring && !option.type)) &&
                          styles.recurringTypeButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.recurringTypeText,
                          (newTask.recurring?.type === option.type ||
                            (!newTask.recurring && !option.type)) &&
                            styles.recurringTypeTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Weekday Selector for Weekly */}
              {newTask.recurring?.type === "weekly" && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Repeat On</Text>
                  <View style={styles.weekdaySelector}>
                    {WEEKDAYS.map((day, index) => {
                      const isSelected =
                        newTask.recurring?.weekdays?.includes(index);
                      return (
                        <TouchableOpacity
                          key={day}
                          onPress={() => {
                            const currentWeekdays =
                              newTask.recurring?.weekdays || [];
                            const newWeekdays = isSelected
                              ? currentWeekdays.filter(
                                  (d: number) => d !== index,
                                )
                              : [...currentWeekdays, index].sort();
                            setNewTask({
                              ...newTask,
                              recurring: {
                                ...newTask.recurring!,
                                weekdays: newWeekdays,
                              },
                            });
                          }}
                          style={[
                            styles.weekdayButton,
                            isSelected && styles.weekdayButtonActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.weekdayButtonText,
                              isSelected && styles.weekdayButtonTextActive,
                            ]}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <Text style={styles.weekdayHint}>
                    Select days for your routine (e.g., every Monday, Wednesday,
                    Friday)
                  </Text>
                </View>
              )}

              {/* Daily with Weekday Restriction */}
              {newTask.recurring?.type === "daily" && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>
                    Limit to Specific Days (Optional)
                  </Text>
                  <View style={styles.weekdaySelector}>
                    {WEEKDAYS.map((day, index) => {
                      const isSelected =
                        newTask.recurring?.weekdays?.includes(index);
                      return (
                        <TouchableOpacity
                          key={day}
                          onPress={() => {
                            const currentWeekdays =
                              newTask.recurring?.weekdays || [];
                            const newWeekdays = isSelected
                              ? currentWeekdays.filter(
                                  (d: number) => d !== index,
                                )
                              : [...currentWeekdays, index].sort();
                            setNewTask({
                              ...newTask,
                              recurring: {
                                ...newTask.recurring!,
                                weekdays:
                                  newWeekdays.length > 0
                                    ? newWeekdays
                                    : undefined,
                              },
                            });
                          }}
                          style={[
                            styles.weekdayButton,
                            isSelected && styles.weekdayButtonActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.weekdayButtonText,
                              isSelected && styles.weekdayButtonTextActive,
                            ]}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <Text style={styles.weekdayHint}>
                    Leave empty for every day, or select specific weekdays
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => setShowRecurringModal(false)}
                style={styles.modalAddButton}
              >
                <Text style={styles.modalAddText}>Done</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Manage Categories Modal */}
      <Modal
        visible={showManageCategoriesModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowManageCategoriesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setShowManageCategoriesModal(false)}
          />
          <View
            style={[styles.modalContent, { marginBottom: systemBottomOffset }]}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Manage Categories</Text>
                <TouchableOpacity
                  onPress={() => setShowManageCategoriesModal(false)}
                >
                  <Ionicons name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Add Category */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Add New Category</Text>
                <View style={styles.addCategoryContainer}>
                  <TextInput
                    style={styles.categoryInput}
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    placeholder="Category name..."
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    onSubmitEditing={handleAddCategory}
                  />
                  <TouchableOpacity
                    onPress={handleAddCategory}
                    style={styles.addCategoryButton}
                  >
                    <Ionicons name="add-circle" size={28} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Current Categories */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>
                  Current Categories ({categories.length})
                </Text>
                <View style={styles.categoriesList}>
                  {categories.map((cat) => (
                    <View key={cat} style={styles.categoryItemRow}>
                      <View style={styles.categoryItemLeft}>
                        <Ionicons
                          name="pricetag"
                          size={18}
                          color="rgba(255, 255, 255, 0.7)"
                        />
                        <Text style={styles.categoryItemText}>{cat}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveCategory(cat)}
                        style={styles.deleteCategoryButton}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color="#FF4444"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setShowManageCategoriesModal(false)}
                style={styles.modalAddButton}
              >
                <Text style={styles.modalAddText}>Done</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowEditModal(false);
          setEditingTask(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => {
              setShowEditModal(false);
              setEditingTask(null);
            }}
          />
          <View style={styles.modalContent}>
            <ScrollView
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Task</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowEditModal(false);
                    setEditingTask(null);
                  }}
                >
                  <Ionicons name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.modalInput}
                value={newTask.text}
                onChangeText={(text) => setNewTask({ ...newTask, text })}
                placeholder="What needs to be done?"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                multiline
              />

              {/* Same sections as Add Modal */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Priority</Text>
                <View style={styles.priorityGrid}>
                  {(Object.keys(PRIORITIES) as Priority[]).map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      onPress={() => setNewTask({ ...newTask, priority })}
                      style={[
                        styles.priorityOption,
                        newTask.priority === priority &&
                          styles.priorityOptionActive,
                        {
                          borderColor:
                            newTask.priority === priority
                              ? PRIORITIES[priority].color
                              : "rgba(255, 255, 255, 0.1)",
                        },
                      ]}
                    >
                      <Ionicons
                        name={PRIORITIES[priority].icon as any}
                        size={20}
                        color={PRIORITIES[priority].color}
                      />
                      <Text style={styles.priorityLabel}>
                        {PRIORITIES[priority].label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Category</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                >
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setNewTask({ ...newTask, category: cat })}
                      style={[
                        styles.categoryChip,
                        newTask.category === cat && styles.categoryChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          newTask.category === cat &&
                            styles.categoryChipTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Date Picker */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Due Date</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(!showDatePicker)}
                  style={styles.dateButton}
                >
                  <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.dateButtonText}>
                    {formatDate(newTask.dueDate)}
                  </Text>
                  <Ionicons
                    name={showDatePicker ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="rgba(255, 255, 255, 0.5)"
                  />
                </TouchableOpacity>
                {showDatePicker && (
                  <View style={styles.quickDatePicker}>
                    <TouchableOpacity
                      onPress={() => {
                        setNewTask({ ...newTask, dueDate: new Date() });
                        setShowDatePicker(false);
                      }}
                      style={styles.quickDateOption}
                    >
                      <Text style={styles.quickDateText}>Today</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setNewTask({
                          ...newTask,
                          dueDate: new Date(Date.now() + 86400000),
                        });
                        setShowDatePicker(false);
                      }}
                      style={styles.quickDateOption}
                    >
                      <Text style={styles.quickDateText}>Tomorrow</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Time Picker (Optional) */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Time (Optional)</Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(!showTimePicker)}
                  style={styles.dateButton}
                >
                  <Ionicons name="time" size={20} color="#FFFFFF" />
                  <Text style={styles.dateButtonText}>
                    {formatTaskTime(newTask.taskTime)}
                  </Text>
                  <Ionicons
                    name={showTimePicker ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="rgba(255, 255, 255, 0.5)"
                  />
                </TouchableOpacity>
                {showTimePicker && (
                  <View style={styles.timePicker}>
                    <DateTimePicker
                      value={(() => {
                        const date = new Date();
                        if (newTask.taskTime) {
                          const [hours, minutes] = newTask.taskTime
                            .split(":")
                            .map(Number);
                          date.setHours(hours || 0, minutes || 0, 0, 0);
                        }
                        return date;
                      })()}
                      mode="time"
                      is24Hour={true}
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(event, selectedDate) => {
                        if (event.type === "set" && selectedDate) {
                          const hours = selectedDate.getHours();
                          const minutes = selectedDate.getMinutes();
                          const timeString = `${String(hours).padStart(
                            2,
                            "0",
                          )}:${String(minutes).padStart(2, "0")}`;
                          setNewTask({ ...newTask, taskTime: timeString });
                        }
                        if (Platform.OS === "android") {
                          setShowTimePicker(false);
                        }
                      }}
                      textColor="#FFFFFF"
                      themeVariant="dark"
                      style={{ width: "100%" }}
                    />
                    {newTask.taskTime && (
                      <TouchableOpacity
                        onPress={() => {
                          setNewTask({ ...newTask, taskTime: undefined });
                          setShowTimePicker(false);
                        }}
                        style={styles.clearTimeButton}
                      >
                        <Text style={styles.clearTimeText}>Clear Time</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              {/* Recurring Options */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Recurring</Text>
                <TouchableOpacity
                  onPress={() => setShowRecurringModal(true)}
                  style={styles.recurringButton}
                >
                  <Ionicons name="repeat" size={20} color="#FFFFFF" />
                  <Text style={styles.recurringButtonText}>
                    {newTask.recurring
                      ? newTask.recurring.type === "weekly" &&
                        newTask.recurring.weekdays
                        ? `${newTask.recurring.weekdays
                            .map((d: number) => WEEKDAYS[d])
                            .join(", ")}`
                        : newTask.recurring.type.charAt(0).toUpperCase() +
                          newTask.recurring.type.slice(1)
                      : "None"}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="rgba(255, 255, 255, 0.5)"
                  />
                </TouchableOpacity>
              </View>

              {/* Time Estimate */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Time Estimate</Text>
                <View style={styles.timeSelector}>
                  {[15, 30, 60, 120].map((time) => (
                    <TouchableOpacity
                      key={time}
                      onPress={() =>
                        setNewTask({ ...newTask, timeEstimate: time })
                      }
                      style={[
                        styles.timeButton,
                        newTask.timeEstimate === time &&
                          styles.timeButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.timeButtonText,
                          newTask.timeEstimate === time &&
                            styles.timeButtonTextActive,
                        ]}
                      >
                        {formatDuration(time)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={editTask}
                style={styles.modalAddButton}
              >
                <Text style={styles.modalAddText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Recurring Tasks Selection */}
      <Modal
        visible={showDeleteRecurringConfirm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDeleteRecurringConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setShowDeleteRecurringConfirm(false)}
          />
          <View style={styles.modalContent}>
            <ScrollView
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Delete Recurring Tasks</Text>
                <TouchableOpacity
                  onPress={() => setShowDeleteRecurringConfirm(false)}
                >
                  <Ionicons name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {recurringTasks.length === 0 ? (
                <View style={styles.emptyRecurringState}>
                  <Ionicons
                    name="repeat"
                    size={48}
                    color="rgba(255, 255, 255, 0.3)"
                  />
                  <Text style={styles.emptyRecurringText}>
                    No recurring tasks found
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.recurringHint}>
                    Select the recurring tasks you want to delete:
                  </Text>
                  <View style={styles.recurringTasksList}>
                    {recurringTasks.map((task) => (
                      <TouchableOpacity
                        key={task.id}
                        onPress={() => toggleRecurringTaskSelection(task.id)}
                        style={[
                          styles.recurringTaskItem,
                          selectedRecurringTasks.includes(task.id) &&
                            styles.recurringTaskItemSelected,
                        ]}
                      >
                        <View
                          style={[
                            styles.recurringCheckbox,
                            selectedRecurringTasks.includes(task.id) &&
                              styles.recurringCheckboxChecked,
                          ]}
                        >
                          {selectedRecurringTasks.includes(task.id) && (
                            <Ionicons name="checkmark" size={16} color="#000" />
                          )}
                        </View>
                        <View style={styles.recurringTaskInfo}>
                          <Text style={styles.recurringTaskText}>
                            {task.text}
                          </Text>
                          <View style={styles.recurringTaskMeta}>
                            <Ionicons
                              name="repeat"
                              size={12}
                              color="rgba(255, 255, 255, 0.5)"
                            />
                            <Text style={styles.recurringTaskType}>
                              {task.recurringType
                                ? task.recurringType.charAt(0).toUpperCase() +
                                  task.recurringType.slice(1)
                                : "N/A"}
                            </Text>
                            {task.weekdaysArray &&
                              task.weekdaysArray.length > 0 && (
                                <Text style={styles.recurringTaskDays}>
                                  (
                                  {task.weekdaysArray
                                    .map((d) => WEEKDAYS[d][0])
                                    .join(", ")}
                                  )
                                </Text>
                              )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.recurringActions}>
                    <TouchableOpacity
                      onPress={() => {
                        if (
                          selectedRecurringTasks.length ===
                          recurringTasks.length
                        ) {
                          setSelectedRecurringTasks([]);
                        } else {
                          setSelectedRecurringTasks(
                            recurringTasks.map((t) => t.id),
                          );
                        }
                      }}
                      style={styles.selectAllButton}
                    >
                      <Text style={styles.selectAllText}>
                        {selectedRecurringTasks.length === recurringTasks.length
                          ? "Deselect All"
                          : "Select All"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {recurringTasks.length > 0 && (
                <TouchableOpacity
                  onPress={handleDeleteSelectedRecurring}
                  style={[
                    styles.modalAddButton,
                    { backgroundColor: "#FF4444" },
                  ]}
                >
                  <Text style={styles.modalAddText}>
                    Delete Selected ({selectedRecurringTasks.length})
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Reset Tasks Confirmation */}
      <Modal
        visible={showResetConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResetConfirm(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmDialog}>
            <Ionicons name="refresh" size={48} color="#FFAA00" />
            <Text style={styles.confirmTitle}>Reset Tasks?</Text>
            <Text style={styles.confirmMessage}>
              Choose what you want to reset:
            </Text>
            <View style={styles.resetOptions}>
              <TouchableOpacity
                onPress={() => setResetType("date")}
                style={[
                  styles.resetOption,
                  resetType === "date" && styles.resetOptionActive,
                ]}
              >
                <Ionicons
                  name="calendar"
                  size={20}
                  color={
                    resetType === "date"
                      ? "#FFAA00"
                      : "rgba(255, 255, 255, 0.5)"
                  }
                />
                <Text
                  style={[
                    styles.resetOptionText,
                    resetType === "date" && styles.resetOptionTextActive,
                  ]}
                >
                  {viewMode === "calendar" ? "Selected Date" : "Today"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setResetType("all")}
                style={[
                  styles.resetOption,
                  resetType === "all" && styles.resetOptionActive,
                ]}
              >
                <Ionicons
                  name="trash"
                  size={20}
                  color={
                    resetType === "all" ? "#FF4444" : "rgba(255, 255, 255, 0.5)"
                  }
                />
                <Text
                  style={[
                    styles.resetOptionText,
                    resetType === "all" && styles.resetOptionTextActive,
                  ]}
                >
                  All Tasks
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                onPress={() => setShowResetConfirm(false)}
                style={[styles.confirmButton, styles.confirmButtonCancel]}
              >
                <Text style={styles.confirmButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleResetTasks}
                style={[styles.confirmButton, styles.confirmButtonDelete]}
              >
                <Text style={styles.confirmButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "home") (navigation as any).navigate("Home");
          else if (tab === "focus") (navigation as any).navigate("FocusTimer");
          else if (tab === "stats") (navigation as any).navigate("Stats");
        }}
        themeColors={{
          textPrimary: "#FFFFFF",
          textTertiary: "rgba(255, 255, 255, 0.5)",
          navBackground: "rgba(4, 4, 4, 0.3)",
        }}
      />
    </View>
  );
}

// TaskItem Component
interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  completed?: boolean;
  compact?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onEdit,
  onToggleSubtask,
  completed = false,
  compact = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.taskItem, compact && styles.taskItemCompact]}>
      <TouchableOpacity
        onPress={() => onToggle(task.id)}
        style={styles.taskMain}
        activeOpacity={0.8}
      >
        <View style={styles.taskLeft}>
          <View style={[styles.checkbox, completed && styles.checkboxChecked]}>
            {completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.taskInfo}>
            <Text
              style={[styles.taskText, completed && styles.taskTextCompleted]}
              numberOfLines={compact ? 1 : undefined}
            >
              {task.text}
            </Text>
            <View style={styles.taskMeta}>
              <View
                style={[
                  styles.priorityDot,
                  {
                    backgroundColor:
                      PRIORITIES[task.priority as Priority].color,
                  },
                ]}
              />
              <Text style={styles.taskCategory}>{task.category}</Text>
              {task.taskTime && (
                <>
                  <Text style={styles.metaSeparator}>·</Text>
                  <Ionicons
                    name="time"
                    size={12}
                    color="rgba(255, 255, 255, 0.5)"
                  />
                  <Text style={styles.taskTime}>{task.taskTime}</Text>
                </>
              )}
              {task.timeEstimate && (
                <>
                  <Text style={styles.metaSeparator}>·</Text>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color="rgba(255, 255, 255, 0.5)"
                  />
                  <Text style={styles.taskTime}>
                    {Math.round(task.timeEstimate / 30) * 30}m
                  </Text>
                </>
              )}
              {task.recurringType && (
                <>
                  <Text style={styles.metaSeparator}>·</Text>
                  <Ionicons
                    name="repeat"
                    size={12}
                    color="rgba(255, 255, 255, 0.5)"
                  />
                  {task.weekdaysArray && task.weekdaysArray.length > 0 && (
                    <Text style={styles.taskTime}>
                      {task.weekdaysArray.map((d) => WEEKDAYS[d][0]).join("")}
                    </Text>
                  )}
                </>
              )}
            </View>
          </View>
        </View>
        <View style={styles.taskActions}>
          {onEdit && !compact && (
            <TouchableOpacity
              onPress={() => onEdit(task)}
              style={styles.taskActionButton}
            >
              <Ionicons name="create-outline" size={18} color="#00AAFF" />
            </TouchableOpacity>
          )}
          {!compact && task.subtasksArray && task.subtasksArray.length > 0 && (
            <TouchableOpacity
              onPress={() => setExpanded(!expanded)}
              style={styles.expandButton}
            >
              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="rgba(255, 255, 255, 0.5)"
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* Subtasks */}
      {!compact && expanded && task.subtasksArray && (
        <View style={styles.subtasks}>
          {task.subtasksArray.map((subtask) => (
            <TouchableOpacity
              key={subtask.id}
              onPress={() => onToggleSubtask(task.id, subtask.id)}
              style={styles.subtaskItem}
            >
              <View
                style={[
                  styles.subtaskCheckbox,
                  subtask.completed && styles.subtaskCheckboxChecked,
                ]}
              >
                {subtask.completed && (
                  <Text style={styles.subtaskCheckmark}>✓</Text>
                )}
              </View>
              <Text
                style={[
                  styles.subtaskText,
                  subtask.completed && styles.subtaskTextCompleted,
                ]}
              >
                {subtask.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(0, 0, 0, 0.98)",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontFamily: "ZenDots-Regular",
    fontSize: 36,
    fontWeight: "300",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
  },
  statCardValue: {
    fontFamily: "ZenDots-Regular",
    fontSize: 24,
    color: "#FFFFFF",
    marginBottom: 6,
  },
  statCardLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stats: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statValue: {
    fontFamily: "ZenDots-Regular",
    fontSize: 24,
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
  },
  viewSelector: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  viewButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  viewButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  viewButtonText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  viewButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  matrixSection: {
    marginBottom: 24,
  },
  matrix: {
    gap: 12,
  },
  matrixQuadrant: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  matrixHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  matrixLabel: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  matrixCount: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.6)",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  taskItem: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    marginBottom: 8,
    overflow: "hidden",
  },
  taskItemCompact: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    marginBottom: 6,
  },
  taskMain: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  checkmark: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },
  taskInfo: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 6,
    lineHeight: 22,
  },
  taskTextCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskCategory: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  metaSeparator: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.3)",
  },
  taskTime: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
  },
  expandButton: {
    padding: 4,
  },
  subtasks: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  subtaskItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 36,
  },
  subtaskCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  subtaskCheckboxChecked: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  subtaskCheckmark: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "700",
  },
  subtaskText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  subtaskTextCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 16,
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.4)",
    marginTop: 8,
  },
  loadingState: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "400",
  },
  quickAddBar: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backdropFilter: "blur(20px)",
  },
  quickAddButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    paddingVertical: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  quickAddText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "flex-end",
  },
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: "#111111",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalScrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontFamily: "ZenDots-Regular",
    fontSize: 24,
    color: "#FFFFFF",
  },
  modalInput: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    color: "#FFFFFF",
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 24,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  priorityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  priorityOption: {
    flex: 1,
    minWidth: "45%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
  },
  priorityOptionActive: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  priorityLabel: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  categoryScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  categoryChipText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  timeSelector: {
    flexDirection: "row",
    gap: 10,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
  },
  timeButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  timeButtonText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },
  timeButtonTextActive: {
    color: "#FFFFFF",
  },
  modalAddButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  modalAddText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },
  calendarSection: {
    marginBottom: 24,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  monthButton: {
    padding: 8,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  weekdayHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "600",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  calendarDaySelected: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  calendarDayText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 2,
  },
  calendarDayTextToday: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  calendarDayTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  taskIndicators: {
    flexDirection: "row",
    gap: 2,
  },
  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  selectedDateInfo: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  selectedDateSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 15,
    color: "#FFFFFF",
  },
  quickDatePicker: {
    marginTop: 8,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    overflow: "hidden",
  },
  quickDateOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  quickDateText: {
    fontSize: 15,
    color: "#FFFFFF",
  },
  quickDateOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  recurringButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  recurringButtonText: {
    flex: 1,
    fontSize: 15,
    color: "#FFFFFF",
  },
  recurringTypes: {
    flexDirection: "row",
    gap: 8,
  },
  recurringTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
  },
  recurringTypeButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  recurringTypeText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },
  recurringTypeTextActive: {
    color: "#FFFFFF",
  },
  weekdaySelector: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  weekdayButton: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
  },
  weekdayButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "#FFFFFF",
  },
  weekdayButtonText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "600",
  },
  weekdayButtonTextActive: {
    color: "#FFFFFF",
  },
  weekdayHint: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.4)",
    lineHeight: 18,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  manageCategoriesButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  manageCategoriesText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  addCategoryContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  categoryInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 14,
    color: "#FFFFFF",
    fontSize: 15,
  },
  addCategoryButton: {
    padding: 4,
  },
  categoriesList: {
    gap: 8,
  },
  categoryItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 14,
  },
  categoryItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  categoryItemText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  deleteCategoryButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  taskActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  taskActionButton: {
    padding: 6,
  },
  timePicker: {
    marginTop: 12,
    gap: 12,
  },
  timeInputs: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  timeInput: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    width: 80,
  },
  timeColon: {
    fontSize: 32,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  clearTimeButton: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearTimeText: {
    fontSize: 14,
    color: "#FF4444",
    fontWeight: "500",
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  confirmDialog: {
    backgroundColor: "#111111",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  confirmMessage: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  confirmButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonCancel: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  confirmButtonDelete: {
    backgroundColor: "#FF4444",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  resetOptions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 24,
  },
  resetOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
  },
  resetOptionActive: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "#FFAA00",
  },
  resetOptionText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },
  resetOptionTextActive: {
    color: "#FFFFFF",
  },
  emptyRecurringState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyRecurringText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 16,
  },
  recurringHint: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 16,
    lineHeight: 20,
  },
  recurringTasksList: {
    gap: 8,
    marginBottom: 16,
  },
  recurringTaskItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 14,
  },
  recurringTaskItemSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "#FF4444",
  },
  recurringCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  recurringCheckboxChecked: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  recurringTaskInfo: {
    flex: 1,
  },
  recurringTaskText: {
    fontSize: 15,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  recurringTaskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recurringTaskType: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  recurringTaskDays: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
  },
  recurringActions: {
    marginBottom: 16,
  },
  selectAllButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    alignItems: "center",
  },
  selectAllText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
});
