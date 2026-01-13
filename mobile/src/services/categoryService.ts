/**
 * Category Service - Manages task categories
 * Uses Settings table to store categories as JSON
 */

import { database } from "../database";
import { Q } from "@nozbe/watermelondb";

const CATEGORIES_KEY = "task_categories";
const DEFAULT_CATEGORIES = [
  "Work",
  "Personal",
  "Health",
  "Learning",
  "Finance",
];

export class CategoryService {
  /**
   * Get all categories
   */
  static async getCategories(): Promise<string[]> {
    try {
      const settingsCollection = database.collections.get("settings");
      const categoriesSetting = await settingsCollection
        .query(Q.where("key", CATEGORIES_KEY))
        .fetch();

      if (categoriesSetting.length > 0) {
        const value = (categoriesSetting[0] as any).value;
        if (value && value.trim()) {
          return JSON.parse(value);
        }
      }

      // Return defaults if no categories saved
      return DEFAULT_CATEGORIES;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return DEFAULT_CATEGORIES;
    }
  }

  /**
   * Save categories to database
   */
  static async saveCategories(categories: string[]): Promise<void> {
    try {
      const settingsCollection = database.collections.get("settings");
      const existingSettings = await settingsCollection
        .query(Q.where("key", CATEGORIES_KEY))
        .fetch();

      await database.write(async () => {
        if (existingSettings.length > 0) {
          // Update existing
          await existingSettings[0].update((setting: any) => {
            (setting as any).value = JSON.stringify(categories);
            (setting as any).updated_at = Date.now();
          });
        } else {
          // Create new
          await settingsCollection.create((setting: any) => {
            (setting as any).key = CATEGORIES_KEY;
            (setting as any).value = JSON.stringify(categories);
            (setting as any).updated_at = Date.now();
          });
        }
      });
    } catch (error) {
      console.error("Error saving categories:", error);
      throw error;
    }
  }

  /**
   * Add a new category
   */
  static async addCategory(categoryName: string): Promise<string[]> {
    try {
      const categories = await this.getCategories();

      // Check if already exists
      if (categories.includes(categoryName)) {
        throw new Error("Category already exists");
      }

      const updatedCategories = [...categories, categoryName];
      await this.saveCategories(updatedCategories);

      return updatedCategories;
    } catch (error) {
      console.error("Error adding category:", error);
      throw error;
    }
  }

  /**
   * Remove a category
   */
  static async removeCategory(categoryName: string): Promise<string[]> {
    try {
      const categories = await this.getCategories();
      const updatedCategories = categories.filter(
        (cat) => cat !== categoryName
      );

      await this.saveCategories(updatedCategories);

      return updatedCategories;
    } catch (error) {
      console.error("Error removing category:", error);
      throw error;
    }
  }

  /**
   * Reset to default categories
   */
  static async resetToDefaults(): Promise<string[]> {
    try {
      await this.saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    } catch (error) {
      console.error("Error resetting categories:", error);
      throw error;
    }
  }
}
