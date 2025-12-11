import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

/**
 * AppUsage Model - Tracks individual app usage per day
 */
export default class AppUsage extends Model {
  static table = 'app_usage';

  @field('package_name') packageName!: string;
  @field('app_name') appName!: string;
  @field('date') date!: string; // YYYY-MM-DD
  @field('total_time_seconds') totalTimeSeconds!: number;
  @field('open_count') openCount!: number;
  @field('last_opened_at') lastOpenedAt!: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  get totalTimeMinutes(): number {
    return Math.floor(this.totalTimeSeconds / 60);
  }

  get totalTimeHours(): number {
    return Math.floor(this.totalTimeSeconds / 3600);
  }

  get formattedDuration(): string {
    const hours = this.totalTimeHours;
    const minutes = this.totalTimeMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}
