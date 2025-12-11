# Services Layer - Zen Mobile

## 🎯 Purpose

The service layer contains **all business logic** for the app. Services are:

- Framework-agnostic (no React/UI code)
- Testable in isolation
- Reusable across screens
- Single responsibility

## 📁 Service Categories

### Session Management

- `sessionTracker.ts` - Start/pause/stop sessions
- `goalEngine.ts` - Goal tracking and recommendations
- `focusScoreCalculator.ts` - Calculate focus quality

### App Control

- `appBlocker.ts` - Block/unblock apps
- `frictionEngine.ts` - Implement delay before opening apps
- `usageAnalyzer.ts` - Analyze app usage patterns

### System Integration

- `nativeBridge.ts` - TypeScript ↔ Native Kotlin bridge
- `permissionManager.ts` - Android permission flow
- `notificationFilter.ts` - Filter notifications
- `backgroundWorker.ts` - Background tasks

### Gamification

- `gamificationEngine.ts` - Achievements, streaks, rewards
- `achievementTracker.ts` - Track and unlock achievements
- `rewardSystem.ts` - Virtual currency and rewards

### Analytics

- `analyticsService.ts` - Track events
- `insightGenerator.ts` - Generate insights from data
- `reportGenerator.ts` - Create reports

### External Services

- `syncService.ts` - Cloud sync (optional)
- `crashReporter.ts` - Error reporting
- `feedbackService.ts` - User feedback

## 📝 Service Template

```typescript
/**
 * SessionTrackerService
 *
 * Manages the lifecycle of focus sessions including:
 * - Starting, pausing, resuming, and ending sessions
 * - Tracking time and interruptions
 * - Calculating focus scores
 * - Persisting session data
 *
 * @example
 * const tracker = new SessionTrackerService();
 * const session = await tracker.startSession({
 *   goalMinutes: 25,
 *   blockApps: ['com.instagram.android'],
 *   allowBreaks: true
 * });
 */

import { database } from "@/database";
import { Session, SessionConfig, SessionStatus } from "@/types/session";
import { EventEmitter } from "@/utils/eventEmitter";
import { nativeBridge } from "./nativeBridge";

export class SessionTrackerService extends EventEmitter {
  private currentSession: Session | null = null;
  private timer: NodeJS.Timeout | null = null;
  private startTime: Date | null = null;
  private pausedDurations: number[] = [];

  /**
   * Start a new focus session
   *
   * @param config - Session configuration
   * @returns Promise<Session> - Created session
   * @throws Error if session already running
   */
  async startSession(config: SessionConfig): Promise<Session> {
    // Validation
    if (this.currentSession?.status === "running") {
      throw new Error("Session already running");
    }

    if (!config.goalMinutes || config.goalMinutes < 1) {
      throw new Error("Invalid goal minutes");
    }

    // Create session
    this.startTime = new Date();
    this.currentSession = {
      id: this.generateId(),
      status: "running",
      startTime: this.startTime,
      goalMinutes: config.goalMinutes,
      actualMinutes: 0,
      unlockCount: 0,
      appSwitchCount: 0,
      focusScore: 100,
      blockedApps: config.blockApps || [],
      allowBreaks: config.allowBreaks || false,
    };

    // Save to database
    await database.sessions.create(this.currentSession);

    // Start timer
    this.startTimer();

    // Enable app blocking
    if (config.blockApps && config.blockApps.length > 0) {
      await nativeBridge.blocking.blockApps(config.blockApps);
    }

    // Emit event
    this.emit("session:started", this.currentSession);

    // Track analytics
    this.trackEvent("session_started", {
      goalMinutes: config.goalMinutes,
      blockedAppsCount: config.blockApps?.length || 0,
    });

    return this.currentSession;
  }

  /**
   * Pause the current session
   *
   * @param reason - Reason for pause (optional)
   */
  async pauseSession(reason?: string): Promise<void> {
    if (!this.currentSession || this.currentSession.status !== "running") {
      throw new Error("No active session to pause");
    }

    // Stop timer
    this.stopTimer();

    // Update status
    this.currentSession.status = "paused";
    this.currentSession.pauseTime = new Date();

    // Save
    await database.sessions.update(this.currentSession.id, this.currentSession);

    // Emit
    this.emit("session:paused", { session: this.currentSession, reason });
  }

  /**
   * Resume paused session
   */
  async resumeSession(): Promise<void> {
    if (!this.currentSession || this.currentSession.status !== "paused") {
      throw new Error("No paused session to resume");
    }

    // Calculate paused duration
    if (this.currentSession.pauseTime) {
      const pausedMs = Date.now() - this.currentSession.pauseTime.getTime();
      this.pausedDurations.push(pausedMs);
    }

    // Update status
    this.currentSession.status = "running";
    delete this.currentSession.pauseTime;

    // Restart timer
    this.startTimer();

    // Save
    await database.sessions.update(this.currentSession.id, this.currentSession);

    // Emit
    this.emit("session:resumed", this.currentSession);
  }

  /**
   * End the current session
   *
   * @param rating - User rating (1-5) optional
   */
  async endSession(rating?: number): Promise<Session> {
    if (!this.currentSession) {
      throw new Error("No active session to end");
    }

    // Stop timer
    this.stopTimer();

    // Calculate final stats
    const endTime = new Date();
    const totalMs = endTime.getTime() - this.currentSession.startTime.getTime();
    const pausedMs = this.pausedDurations.reduce((a, b) => a + b, 0);
    const activeMs = totalMs - pausedMs;

    this.currentSession.status = "completed";
    this.currentSession.endTime = endTime;
    this.currentSession.actualMinutes = Math.floor(activeMs / 60000);
    this.currentSession.rating = rating;

    // Calculate focus score
    this.currentSession.focusScore = this.calculateFocusScore(
      this.currentSession
    );

    // Disable app blocking
    if (this.currentSession.blockedApps.length > 0) {
      await nativeBridge.blocking.unblockApps(this.currentSession.blockedApps);
    }

    // Save
    await database.sessions.update(this.currentSession.id, this.currentSession);

    // Check achievements
    await this.checkAchievements(this.currentSession);

    // Emit
    this.emit("session:completed", this.currentSession);

    // Track
    this.trackEvent("session_completed", {
      goalMinutes: this.currentSession.goalMinutes,
      actualMinutes: this.currentSession.actualMinutes,
      focusScore: this.currentSession.focusScore,
      rating,
    });

    const completedSession = { ...this.currentSession };
    this.currentSession = null;
    this.pausedDurations = [];

    return completedSession;
  }

  /**
   * Get current session
   */
  getCurrentSession(): Session | null {
    return this.currentSession;
  }

  /**
   * Private: Start internal timer
   */
  private startTimer(): void {
    this.timer = setInterval(() => {
      if (this.currentSession && this.startTime) {
        const elapsed = Date.now() - this.startTime.getTime();
        const pausedMs = this.pausedDurations.reduce((a, b) => a + b, 0);
        const activeMs = elapsed - pausedMs;
        this.currentSession.actualMinutes = Math.floor(activeMs / 60000);

        // Emit tick
        this.emit("session:tick", {
          elapsed: activeMs,
          remaining: this.currentSession.goalMinutes * 60000 - activeMs,
        });
      }
    }, 1000);
  }

  /**
   * Private: Stop internal timer
   */
  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Private: Calculate focus score
   */
  private calculateFocusScore(session: Session): number {
    // Base score
    let score = 100;

    // Deduct for unlocks (each unlock -2 points)
    score -= session.unlockCount * 2;

    // Deduct for app switches (each switch -1 point)
    score -= session.appSwitchCount;

    // Deduct for pauses (each pause -5 points)
    score -= this.pausedDurations.length * 5;

    // Clamp to 0-100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Private: Generate unique ID
   */
  private generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Private: Track analytics event
   */
  private trackEvent(event: string, data: any): void {
    // Implementation depends on analytics service
    console.log("[Analytics]", event, data);
  }

  /**
   * Private: Check and unlock achievements
   */
  private async checkAchievements(session: Session): Promise<void> {
    // Implementation in gamificationEngine
  }
}

// Export singleton
export const sessionTracker = new SessionTrackerService();
```

## 🧪 Service Testing Template

```typescript
// sessionTracker.test.ts
import { SessionTrackerService } from "./sessionTracker";
import { database } from "@/database";
import { nativeBridge } from "./nativeBridge";

jest.mock("@/database");
jest.mock("./nativeBridge");

describe("SessionTrackerService", () => {
  let service: SessionTrackerService;

  beforeEach(() => {
    service = new SessionTrackerService();
    jest.clearAllMocks();
  });

  describe("startSession", () => {
    it("should start a session with valid config", async () => {
      const config = {
        goalMinutes: 25,
        blockApps: ["com.instagram.android"],
        allowBreaks: true,
      };

      const session = await service.startSession(config);

      expect(session).toBeDefined();
      expect(session.status).toBe("running");
      expect(session.goalMinutes).toBe(25);
      expect(database.sessions.create).toHaveBeenCalledWith(session);
      expect(nativeBridge.blocking.blockApps).toHaveBeenCalledWith(
        config.blockApps
      );
    });

    it("should throw error if session already running", async () => {
      const config = { goalMinutes: 25, blockApps: [] };
      await service.startSession(config);

      await expect(service.startSession(config)).rejects.toThrow(
        "Session already running"
      );
    });

    it("should throw error for invalid goal minutes", async () => {
      const config = { goalMinutes: 0, blockApps: [] };

      await expect(service.startSession(config)).rejects.toThrow(
        "Invalid goal minutes"
      );
    });
  });

  describe("pauseSession", () => {
    it("should pause running session", async () => {
      const config = { goalMinutes: 25, blockApps: [] };
      await service.startSession(config);

      await service.pauseSession("taking a break");

      const session = service.getCurrentSession();
      expect(session?.status).toBe("paused");
    });

    it("should throw error if no active session", async () => {
      await expect(service.pauseSession()).rejects.toThrow(
        "No active session to pause"
      );
    });
  });

  // More tests...
});
```

## 🎯 Service Guidelines

### ✅ DO:

- Keep services pure and testable
- Use dependency injection
- Handle errors gracefully
- Log important events
- Use TypeScript interfaces
- Document with JSDoc
- Emit events for UI updates
- Validate inputs
- Use async/await

### ❌ DON'T:

- Import React or UI components
- Directly manipulate DOM/UI
- Use navigation
- Show alerts/toasts
- Access global state directly
- Mix multiple responsibilities
- Use `any` types
- Ignore error handling

## 📚 Related Files

- Types: `/src/types/`
- Database: `/src/database/`
- Native Bridge: `/src/native-android/`
- Utils: `/src/utils/`
- Tests: `/src/services/__tests__/`
