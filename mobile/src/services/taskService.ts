/**
 * Task Service - Manages tasks with database persistence
 * Uses WatermelonDB for offline-first task storage
 */

import { database } from "../database";
import { Q } from "@nozbe/watermelondb";
import Task from "../database/models/Task";

export type Priority = "urgent-important" | "urgent" | "important" | "low";

export interface TaskData {
  text: string;
  priority: Priority;
  category: string;
  timeEstimate?: number;
  taskTime?: string; // HH:MM format
  dueDate?: Date;
  recurring?: {
    type: "daily" | "weekly" | "monthly" | "custom";
    weekdays?: number[];
    endDate?: Date;
    interval?: number;
  };
  subtasks?: Array<{ id: string; text: string; completed: boolean }>;
  notes?: string;
}

export class TaskService {
  /**
   * Get all tasks
   */
  static async getAllTasks(): Promise<Task[]> {
    try {
      const tasksCollection = database.collections.get<Task>("tasks");
      const tasks = await tasksCollection.query().fetch();
      return tasks;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  }

  /**
   * Get tasks for a specific date (including recurring)
   */
  static async getTasksForDate(date: Date): Promise<Task[]> {
    try {
      const tasksCollection = database.collections.get<Task>("tasks");
      const allTasks = await tasksCollection.query().fetch();

      const targetDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const dayOfWeek = targetDate.getDay();
      const targetTime = targetDate.getTime();

      return allTasks.filter((task) => {
        // Check if task has a due date on this specific date
        if (task.dueDate) {
          const taskDate = new Date(task.dueDate);
          const taskDateOnly = new Date(
            taskDate.getFullYear(),
            taskDate.getMonth(),
            taskDate.getDate()
          );
          if (taskDateOnly.getTime() === targetTime) return true;
        }

        // Check recurring tasks
        if (task.recurringType) {
          const weekdays = task.weekdaysArray;
          const endDate = task.recurringEndDate;

          // Check if recurring has ended
          if (endDate && targetTime > endDate) return false;

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
            return targetDate.getDate() === taskDate.getDate();
          }
        }

        return false;
      });
    } catch (error) {
      console.error("Error fetching tasks for date:", error);
      return [];
    }
  }

  /**
   * Create a new task
   */
  static async createTask(taskData: TaskData): Promise<Task> {
    try {
      const tasksCollection = database.collections.get<Task>("tasks");

      const task = await database.write(async () => {
        return await tasksCollection.create((task) => {
          task.text = taskData.text;
          task.completed = false;
          task.priority = taskData.priority;
          task.category = taskData.category;
          task.timeEstimate = taskData.timeEstimate;
          task.taskTime = taskData.taskTime;
          task.dueDate = taskData.dueDate?.getTime();

          if (taskData.recurring) {
            task.recurringType = taskData.recurring.type;
            if (taskData.recurring.weekdays) {
              task.recurringWeekdays = JSON.stringify(
                taskData.recurring.weekdays
              );
            }
            if (taskData.recurring.endDate) {
              task.recurringEndDate = taskData.recurring.endDate.getTime();
            }
            task.recurringInterval = taskData.recurring.interval;
          }

          if (taskData.subtasks) {
            task.subtasks = JSON.stringify(taskData.subtasks);
          }

          task.notes = taskData.notes;
        });
      });

      return task;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  /**
   * Update a task
   */
  static async updateTask(
    taskId: string,
    updates: Partial<TaskData>
  ): Promise<Task> {
    try {
      const tasksCollection = database.collections.get<Task>("tasks");
      const task = await tasksCollection.find(taskId);

      const updatedTask = await database.write(async () => {
        return await task.update((t) => {
          if (updates.text !== undefined) t.text = updates.text;
          if (updates.priority !== undefined) t.priority = updates.priority;
          if (updates.category !== undefined) t.category = updates.category;
          if (updates.timeEstimate !== undefined)
            t.timeEstimate = updates.timeEstimate;
          if (updates.taskTime !== undefined) t.taskTime = updates.taskTime;
          if (updates.dueDate !== undefined)
            t.dueDate = updates.dueDate?.getTime();

          if (updates.recurring !== undefined) {
            if (updates.recurring) {
              t.recurringType = updates.recurring.type;
              if (updates.recurring.weekdays) {
                t.recurringWeekdays = JSON.stringify(
                  updates.recurring.weekdays
                );
              }
              if (updates.recurring.endDate) {
                t.recurringEndDate = updates.recurring.endDate.getTime();
              }
              t.recurringInterval = updates.recurring.interval;
            } else {
              // Clear recurring fields
              t.recurringType = undefined;
              t.recurringWeekdays = undefined;
              t.recurringEndDate = undefined;
              t.recurringInterval = undefined;
            }
          }

          if (updates.subtasks !== undefined) {
            t.subtasks = JSON.stringify(updates.subtasks);
          }

          if (updates.notes !== undefined) t.notes = updates.notes;
        });
      });

      return updatedTask;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }

  /**
   * Toggle task completion
   */
  static async toggleTask(taskId: string): Promise<Task> {
    try {
      const tasksCollection = database.collections.get<Task>("tasks");
      const task = await tasksCollection.find(taskId);

      const updatedTask = await database.write(async () => {
        return await task.update((t) => {
          t.completed = !t.completed;
        });
      });

      return updatedTask;
    } catch (error) {
      console.error("Error toggling task:", error);
      throw error;
    }
  }

  /**
   * Toggle subtask completion
   */
  static async toggleSubtask(taskId: string, subtaskId: string): Promise<Task> {
    try {
      const tasksCollection = database.collections.get<Task>("tasks");
      const task = await tasksCollection.find(taskId);
      const subtasks = task.subtasksArray;

      const updatedTask = await database.write(async () => {
        return await task.update((t) => {
          const updatedSubtasks = subtasks.map((sub) =>
            sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
          );
          t.subtasks = JSON.stringify(updatedSubtasks);
        });
      });

      return updatedTask;
    } catch (error) {
      console.error("Error toggling subtask:", error);
      throw error;
    }
  }

  /**
   * Delete a task
   */
  static async deleteTask(taskId: string): Promise<void> {
    try {
      const tasksCollection = database.collections.get<Task>("tasks");
      const task = await tasksCollection.find(taskId);

      await database.write(async () => {
        await task.markAsDeleted();
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }

  /**
   * Get active (incomplete) tasks
   */
  static async getActiveTasks(): Promise<Task[]> {
    try {
      const tasksCollection = database.collections.get<Task>("tasks");
      const tasks = await tasksCollection
        .query(Q.where("completed", false))
        .fetch();
      return tasks;
    } catch (error) {
      console.error("Error fetching active tasks:", error);
      return [];
    }
  }

  /**
   * Get completed tasks
   */
  static async getCompletedTasks(): Promise<Task[]> {
    try {
      const tasksCollection = database.collections.get<Task>("tasks");
      const tasks = await tasksCollection
        .query(Q.where("completed", true))
        .fetch();
      return tasks;
    } catch (error) {
      console.error("Error fetching completed tasks:", error);
      return [];
    }
  }

  /**
   * Delete all recurring tasks
   */
  static async deleteAllRecurringTasks(): Promise<void> {
    try {
      const tasksCollection = database.collections.get<Task>("tasks");
      const recurringTasks = await tasksCollection
        .query(Q.where("recurring_type", Q.notEq(null)))
        .fetch();

      await database.write(async () => {
        await Promise.all(recurringTasks.map((task) => task.markAsDeleted()));
      });
    } catch (error) {
      console.error("Error deleting recurring tasks:", error);
      throw error;
    }
  }

  /**
   * Delete all tasks for a specific date
   */
  static async deleteTasksForDate(date: Date): Promise<void> {
    try {
      const tasksForDate = await this.getTasksForDate(date);

      await database.write(async () => {
        await Promise.all(tasksForDate.map((task) => task.markAsDeleted()));
      });
    } catch (error) {
      console.error("Error deleting tasks for date:", error);
      throw error;
    }
  }

  /**
   * Delete all tasks
   */
  static async deleteAllTasks(): Promise<void> {
    try {
      const tasksCollection = database.collections.get<Task>("tasks");
      const allTasks = await tasksCollection.query().fetch();

      await database.write(async () => {
        await Promise.all(allTasks.map((task) => task.markAsDeleted()));
      });
    } catch (error) {
      console.error("Error deleting all tasks:", error);
      throw error;
    }
  }
}
