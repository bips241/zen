import { Model, Relation } from '@nozbe/watermelondb';
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators';
import Session from './Session';

export type SessionEventType =
  | 'start'
  | 'pause'
  | 'resume'
  | 'interrupt'
  | 'complete'
  | 'abandon';

/**
 * SessionEvent Model - Tracks session lifecycle events
 */
export default class SessionEvent extends Model {
  static table = 'session_events';
  static associations = {
    sessions: { type: 'belongs_to', key: 'session_id' },
  } as const;

  @field('session_id') sessionId!: string;
  @field('event_type') eventType!: SessionEventType;
  @field('timestamp') timestamp!: number;
  @field('metadata') metadataRaw?: string; // JSON
  @readonly @date('created_at') createdAt!: Date;

  @relation('sessions', 'session_id') session!: Relation<Session>;

  get metadata(): Record<string, any> | null {
    if (!this.metadataRaw) return null;
    try {
      return JSON.parse(this.metadataRaw);
    } catch {
      return null;
    }
  }
}
