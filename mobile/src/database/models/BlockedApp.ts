import { Model } from "@nozbe/watermelondb";
import { field, date, readonly } from "@nozbe/watermelondb/decorators";

export type BlockMode = "always" | "during_session" | "scheduled";

/**
 * BlockedApp Model - Apps blocked from launching
 */
export default class BlockedApp extends Model {
  static table = "blocked_apps";

  @field("package_name") packageName!: string;
  @field("app_name") appName!: string;
  @field("icon_uri") iconUri?: string;
  @field("is_blocked") isBlocked!: boolean;
  @field("block_mode") blockMode!: BlockMode;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;

  get isAlwaysBlocked(): boolean {
    return this.isBlocked && this.blockMode === "always";
  }

  get isSessionBlocked(): boolean {
    return this.isBlocked && this.blockMode === "during_session";
  }

  get isScheduledBlocked(): boolean {
    return this.isBlocked && this.blockMode === "scheduled";
  }
}
