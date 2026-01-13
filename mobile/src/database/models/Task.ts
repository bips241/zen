import { Model } from "@nozbe/watermelondb";
import { field, date, readonly } from "@nozbe/watermelondb/decorators";

/**
 * Task Model - Represents a user task
 */
export default class Task extends Model {
  static table = "tasks";

  @field("text") text!: string;
  @field("completed") completed!: boolean;
  @field("priority") priority!: string;
  @field("category") category!: string;
  @field("due_date") dueDate?: number;
  @field("task_time") taskTime?: string;
  @field("time_estimate") timeEstimate?: number;
  @field("recurring_type") recurringType?: string;
  @field("recurring_weekdays") recurringWeekdays?: string;
  @field("recurring_end_date") recurringEndDate?: number;
  @field("recurring_interval") recurringInterval?: number;
  @field("subtasks") subtasks?: string;
  @field("notes") notes?: string;

  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;

  // Getter for recurring weekdays array
  get weekdaysArray(): number[] | undefined {
    if (!this.recurringWeekdays) return undefined;
    try {
      return JSON.parse(this.recurringWeekdays);
    } catch {
      return undefined;
    }
  }

  // Getter for subtasks array
  get subtasksArray(): Array<{ id: string; text: string; completed: boolean }> {
    if (!this.subtasks) return [];
    try {
      return JSON.parse(this.subtasks);
    } catch {
      return [];
    }
  }
}
