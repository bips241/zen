import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

/**
 * Setting Model - Key-value store for user preferences
 */
export default class Setting extends Model {
  static table = 'settings';

  @field('key') key!: string;
  @field('value') valueRaw!: string; // JSON serialized
  @readonly @date('updated_at') updatedAt!: Date;

  get value(): any {
    try {
      return JSON.parse(this.valueRaw);
    } catch {
      return this.valueRaw;
    }
  }

  async setValue(newValue: any): Promise<void> {
    await this.update((record) => {
      record.valueRaw = JSON.stringify(newValue);
    });
  }
}
