FocusShell Execution Plan (Production-Grade, Market-Ready)

## 🎯 VISION

Build the world's most powerful distraction-free productivity launcher combining:

- Forest's gamification + visual progress
- Freedom's app blocking + scheduling
- Opal's AI-powered insights + smart recommendations
- One Sec's friction moments before opening distracting apps
- Minimalist black UI inspired by Nothing Phone

## 🚀 ENHANCED MILESTONES

### Phase 1: MVP - Core Experience (Weeks 1-3)

1. ✅ UI + local session tracking (Expo managed)
2. ✅ Offline-first architecture with WatermelonDB
3. ✅ Basic HomeShell with live timer + minimal UI

### Phase 2: Native Power (Weeks 4-6)

4. 🔧 Custom Android Launcher (replaces home screen)
5. 🔧 App blocking engine + UsageStats integration
6. 🔧 NotificationListener + smart filtering
7. 🔧 Quick Settings Tile for instant focus mode

### Phase 3: Intelligence Layer (Weeks 7-9)

8. 🤖 Pattern recognition (most distracting times/apps)
9. 📊 Advanced analytics with insights
10. 🎯 Smart goals + adaptive recommendations
11. 🔔 Intelligent break reminders (Pomodoro++)

### Phase 4: Gamification & Retention (Weeks 10-12)

12. 🌳 Forest-style virtual rewards system
13. 🏆 Achievement system + streaks
14. 📈 Social accountability (optional friend challenges)
15. 🎨 Theme system (OLED-optimized themes)

### Phase 5: Monetization & Scale (Weeks 13-16)

16. 💰 Freemium model (free core, premium features)
17. 🔐 Cloud sync + backup (Firebase/Supabase)
18. 📱 Widget system (home screen widgets)
19. ⌚ Wear OS companion (future)

### Phase 6: Launch & Growth (Weeks 17-20)

20. 🎬 App Store Optimization (screenshots, video)
21. 📝 Privacy policy + compliance (GDPR, CCPA)
22. 🚀 Beta launch on Play Store
23. 📊 Analytics + crash reporting (Sentry, Mixpanel)
24. 🎯 Growth loops + referral system

# ZEN MOBILE — COMPLETE ARCHITECTURE BLUEPRINT FOR COPILOT

### Senior Architect System Prompt (Full Project Context)

---

## 1. Project Overview

Zen Mobile is a **revolutionary distraction-free productivity launcher** built with **Expo + React Native (TypeScript)**.

### 🎯 Core Value Proposition

**"Your phone, but better. Focus mode that actually works."**

### ✨ Unique Selling Points (USP)

1. **Custom Android Launcher** - Replaces home screen entirely (not just an app)
2. **Intelligent App Blocking** - ML-powered detection of distraction patterns
3. **Friction Moments** - 5-second breathing exercise before opening blocked apps
4. **Zero-UI Philosophy** - Pure black OLED screen saves battery, reduces eye strain
5. **Offline-First** - Works completely offline, no account required
6. **Privacy-Focused** - All data stays on device, optional cloud backup

### 🏆 Feature Set (Competitive Analysis)

| Feature          | Zen | Forest | Freedom | Opal | One Sec |
| ---------------- | --- | ------ | ------- | ---- | ------- |
| Custom Launcher  | ✅  | ❌     | ❌      | ❌   | ❌      |
| App Blocking     | ✅  | ❌     | ✅      | ✅   | ✅      |
| Usage Insights   | ✅  | ❌     | ✅      | ✅   | ✅      |
| Gamification     | ✅  | ✅     | ❌      | ❌   | ❌      |
| Offline First    | ✅  | ✅     | ❌      | ❌   | ✅      |
| Open Source      | ✅  | ❌     | ❌      | ❌   | ❌      |
| Friction Moments | ✅  | ❌     | ❌      | ✅   | ✅      |

### 🎨 Design Philosophy

- **Brutalist Minimalism** - Inspired by Nothing Phone, Teenage Engineering
- **OLED Optimization** - True black backgrounds, minimal white pixels
- **Haptic Feedback** - Subtle vibrations for important interactions
- **Micro-interactions** - Smooth 60fps animations, delightful UX

This document configures Copilot to behave as the **Senior Mobile Architect & Product Designer**, maintaining world-class engineering and UX standards.

---

## 2. Mandatory File Structure (Production-Grade)

Copilot must use this enhanced structure with clear separation of concerns:

```
/mobile
  /src
    /api                      # Backend communication layer
      auth.ts                 # Firebase/Supabase auth
      sessions.ts             # Session CRUD operations
      sync.ts                 # Cloud sync logic
      analytics.ts            # Analytics events

    /components               # Atomic design system
      /atoms                  # Basic building blocks
        Button.tsx
        Text.tsx
        Icon.tsx
        Haptic.tsx
      /molecules              # Composed components
        Card.tsx
        StatCard.tsx
        ProgressRing.tsx
        AppIcon.tsx
      /organisms              # Complex components
        SessionTimer.tsx
        AppBlockList.tsx
        InsightCard.tsx
        GoalTracker.tsx

    /screens                  # Feature screens
      /auth
        LoginScreen.tsx
        OnboardingScreen.tsx
      /home
        HomeShell.tsx         # Main launcher screen
        QuickActions.tsx      # Emergency actions
      /dashboard
        DashboardScreen.tsx   # Analytics hub
        InsightsScreen.tsx    # AI-powered insights
        CalendarView.tsx      # Historical data
      /session
        SessionScreen.tsx     # Active session view
        BreakScreen.tsx       # Break time screen
      /settings
        SettingsScreen.tsx    # App settings
        ProfileEditor.tsx     # User profile
        BlockListEditor.tsx   # App blocking rules
        ThemeSelector.tsx     # Theme customization

    /services                 # Business logic layer
      sessionTracker.ts       # Session lifecycle management
      appBlocker.ts           # App blocking engine
      permissionManager.ts    # Android permissions flow
      notificationFilter.ts   # Smart notification handling
      usageAnalyzer.ts        # Usage pattern detection
      goalEngine.ts           # Goal tracking + recommendations
      gamificationEngine.ts   # Achievements, rewards, streaks
      nativeBridge.ts         # Native module wrappers
      hapticService.ts        # Haptic feedback patterns
      backgroundWorker.ts     # Background tasks handler

    /store                    # State management (Zustand)
      index.ts                # Store configuration
      sessionSlice.ts         # Session state
      userSlice.ts            # User preferences
      appsSlice.ts            # App list + block rules
      statsSlice.ts           # Analytics data
      gamificationSlice.ts    # Achievements, streaks

    /hooks                    # Custom React hooks
      useSession.ts           # Session management
      useAppUsage.ts          # Usage stats
      usePermissions.ts       # Permission checks
      useHaptic.ts            # Haptic feedback
      useTheme.ts             # Theme management

    /utils                    # Utility functions
      time.ts                 # Time formatting
      storage.ts              # AsyncStorage wrappers
      constants.ts            # App constants
      validators.ts           # Input validation
      logger.ts               # Debug logging

    /types                    # TypeScript definitions
      session.ts
      user.ts
      analytics.ts
      navigation.ts

    /native-android           # Native Android modules
      /launcher               # Custom launcher implementation
        MainActivity.kt
        LauncherActivity.kt
        AppDrawerAdapter.kt
      /services               # Android services
        NotificationListener.kt
        UsageStatsService.kt
        BlockingService.kt
      /utils
        PermissionHelper.kt
        AppListProvider.kt

    /theme                    # Design system
      colors.ts               # Color palette
      typography.ts           # Font system
      spacing.ts              # Spacing scale
      animations.ts           # Animation configs

    /navigation               # Navigation structure
      RootNavigator.tsx       # Main navigation
      types.ts                # Navigation types

    App.tsx                   # Root component
    index.tsx                 # Entry point

  app.json
  eas.json
  package.json
  tsconfig.json
  .eslintrc.js
  .prettierrc
  jest.config.js

/server (optional backend)
  /functions
    syncHandler.ts
    analyticsAggregator.ts
  /models
    User.ts
    Session.ts
  /scripts
    migration.ts

/docs                         # Documentation
  ARCHITECTURE.md
  API.md
  NATIVE_MODULES.md
  DEPLOYMENT.md

README.md
LICENSE
.github/
  workflows/
    ci.yml
    release.yml
```

**Key Principles:**

- **Atomic Design** for components
- **Feature-based** screen organization
- **Single Responsibility** for services
- **Type-safe** with comprehensive TypeScript
- **Testable** architecture with clear boundaries

---

## 3. Core Architectural Principles

### 3.1 Screen Layer

- Screens orchestrate services + state.
- No API calls directly in screens.
- Use hooks for data-loading and UI-state binding.

### 3.2 Component Layer

- Pure UI components only.
- No business logic.
- No state except internal UI state.

### 3.3 Service Layer

- All business logic lives here.
- Handles timers, OS permissions, background tasks, notifications.
- Communicates with native modules.
- MUST remain UI-agnostic.

### 3.4 Store Layer (Zustand)

- Holds global reactive state.
- Minimal logic; only reducers and actions.
- Uses selectors for performance.

### 3.5 API Layer

- All backend communication is isolated here.
- Exposes simple async functions like `createSession()`, `fetchTodaySummary()`.

### 3.6 Native Layer

- Contains Kotlin/Java Android modules.
- Exposed to JS via `nativeBridge.ts`.

---

## 4. Development Plan (Phase-by-Phase, Highly Granular)

Copilot must follow these phases strictly.

---

### **Phase 1 — Project Foundation & Architecture Skeleton**

**Goals:**

- Initialize Expo project
- Implement file structure
- Set up TypeScript strict mode
- Initiate navigation architecture
- Create basic screens with layout placeholders

**Tasks:**

1. Initialize project (`expo init`, TypeScript).
2. Create directory structure exactly as defined.
3. Install navigation (`@react-navigation/native`, stack & tabs).
4. Create `App.tsx`:
   - Load navigation root
   - Wrap with providers (Zustand, theme)
5. Add placeholder screens:
   - HomeShell.tsx
   - Dashboard.tsx
   - SessionScreen.tsx
   - ProfileEditor.tsx
   - Onboarding.tsx
6. Create `/components/Button.tsx`, `/components/Container.tsx`.
7. Add dark minimalist global theme.

---

### **Phase 2 — Authentication & Onboarding (Optional)**

If using Firebase/Supabase:

**Tasks:**

1. Add API wrappers (`/src/api/auth.ts`).
2. Add auth slice in `/store/authSlice.ts`.
3. Build onboarding flow (permissions intro, productivity goals).
4. Lock screens behind Auth (if required).
5. Store tokens in secure storage.

**Deliverables:**

- Onboarding UI
- Auth + secure storage
- Navigation guards

---

### **Phase 3 — Core Feature: Advanced Session Engine**

**Enhanced Logic in `/src/services/sessionTracker.ts`:**

```typescript
// Session Lifecycle
- startSession(config: SessionConfig)     // Start with custom goals, block rules
- pauseSession(reason: PauseReason)       // Track pause reasons
- resumeSession()
- endSession(rating?: number)             // Allow user feedback
- calculateDuration()
- getSessionInsights()                    // AI-powered session analysis

// Advanced Features
- autoSave(interval: 10s)                 // Persist every 10 seconds
- backgroundPersistence()                 // Handle app minimize/crash
- detectUnlockEvents()                    // Count phone unlocks during session
- detectAppSwitches()                     // Track focus breaks
- calculateFocusScore()                   // 0-100 score based on distractions
- predictProductiveHours()                // ML-based time recommendations
- adaptiveBreakReminders()                // Smart break timing

// Gamification Integration
- trackStreak()                           // Daily/weekly streaks
- unlockAchievements()                    // Milestone achievements
- awardVirtualCoins()                     // Currency for themes/features
- updateLeaderboard()                     // Optional social features
```

**Enhanced Store (`sessionSlice.ts`):**

```typescript
interface SessionState {
  // Core State
  status: "idle" | "running" | "paused" | "break" | "completed";
  currentSession: Session | null;

  // Tracking
  startTime: Date;
  pausedDurations: Duration[];
  totalFocusTime: number;
  unlockCount: number;
  appSwitchCount: number;

  // Goals
  dailyGoalMinutes: number;
  todayProgress: number;
  currentStreak: number;
  longestStreak: number;

  // Insights
  focusScore: number; // 0-100
  productivityTrend: "up" | "down" | "stable";
  bestTimeOfDay: string; // e.g., "9:00 AM - 11:00 AM"
  mostDistractivingApps: App[];

  // Gamification
  totalCoins: number;
  level: number;
  achievements: Achievement[];
  weeklyGoalProgress: number;
}
```

**Enhanced UI (`SessionScreen.tsx`):**

- **Live Components:**
  - Circular progress timer (animated)
  - Real-time focus score indicator
  - Unlock counter (gamified)
  - Current streak display
- **Interactions:**
  - Long-press to pause (prevent accidental taps)
  - Swipe up for break
  - Haptic feedback on every minute
  - Ambient sound options (white noise, nature)
- **Visual Design:**
  - Gradient progress ring (changes color based on focus)
  - Particle effects on milestones (15min, 30min, 1h)
  - Smooth 60fps animations
  - True black OLED background
- **Smart Features:**
  - Auto-pause when phone locked (optional)
  - Break recommendations every 25/50/90 minutes
  - Achievement popups
  - Daily goal celebration animation

---

### **Phase 4 — Analytics Dashboard & Profile Editor**

**Dashboard (`Dashboard.tsx`):**

- Today’s total productive hours
- Week graph
- Goal completion percentage
- Streak tracking

**Profile Editor (`ProfileEditor.tsx`):**

- User name, avatar
- Productivity goals (daily target hours)
- Notification settings

**API (`/src/api/sessions.ts`, `/src/api/user.ts`):**

- fetchSessions()
- fetchSummary()
- updateUserPreferences()

---

### **Phase 5 — Advanced Native Integrations (Android)**

**/services/permissionManager.ts** - Smart Permission Flow

```typescript
// Required Permissions (with user education)
- NOTIFICATION_ACCESS          // Block/filter notifications
- USAGE_STATS                  // Track app usage
- PACKAGE_USAGE_STATS          // Detailed app analytics
- REQUEST_IGNORE_BATTERY_OPTIMIZATIONS  // Background tasks
- SYSTEM_ALERT_WINDOW          // Overlay for friction moments
- BIND_NOTIFICATION_LISTENER   // Listen to notifications

// Permission Flow Strategy
1. Show benefit before asking ("Block distracting apps")
2. Progressive disclosure (ask when feature is used)
3. Fallback gracefully if denied
4. In-app settings to retry permissions
5. Visual indicators for missing permissions
```

**/native-android/launcher** - Custom Launcher Implementation

```kotlin
// LauncherActivity.kt - Replace Android home screen
- setAsDefaultLauncher()          // Make Zen the home screen
- showMinimalAppDrawer()          // Only essential apps visible
- hideStatusBar()                 // Fullscreen mode
- interceptHomeButton()           // Custom behavior
- customBackBehavior()            // Prevent escape to distracting apps

// App Drawer Features
- Alphabetical + frequency sorting
- Search with fuzzy matching
- Hide apps completely (not just block)
- Custom app icons (monochrome for minimalism)
- Quick launch shortcuts (contacts, camera)
```

**/native-android/services** - Background Services

```kotlin
// NotificationListenerService.kt
- filterNotifications()           // Block by app/keyword/time
- priorityNotifications()         // Allow important ones (calls, alarms)
- batchNotifications()            // Group non-urgent notifications
- readAloud()                     // Voice notifications (optional)
- smartReply()                    // Quick reply without opening app

// UsageStatsService.kt
- trackAppUsage()                 // Foreground time per app
- detectSessionBreaks()           // When user opens blocked app
- calculateProductivity()         // Productive vs distracting time
- exportUsageData()               // For dashboard analytics

// BlockingService.kt (Foreground Service)
- blockApp()                      // Show overlay before opening
- frictionMoment()                // 5s breathing exercise
- immediateBlock()                // Instantly close app
- scheduleBlock()                 // Time-based blocking rules
- allowEmergency()                // Always allow calls, emergency apps
```

**/services/nativeBridge.ts** - TypeScript ↔ Native Bridge

```typescript
// Launcher Control
export const LauncherBridge = {
  setAsDefaultLauncher: () => NativeModules.ZenLauncher.setDefault(),
  showAppDrawer: () => NativeModules.ZenLauncher.showDrawer(),
  hideApp: (packageName: string) =>
    NativeModules.ZenLauncher.hideApp(packageName),
  resetLauncher: () => NativeModules.ZenLauncher.reset(),
};

// App Blocking
export const BlockingBridge = {
  blockApp: (packageName: string, config: BlockConfig) =>
    NativeModules.ZenBlocking.block(packageName, config),
  unblockApp: (packageName: string) =>
    NativeModules.ZenBlocking.unblock(packageName),
  isAppBlocked: (packageName: string) =>
    NativeModules.ZenBlocking.isBlocked(packageName),
  setFrictionMoment: (
    seconds: number,
    type: "breathe" | "reflect" | "countdown"
  ) => NativeModules.ZenBlocking.setFriction(seconds, type),
};

// Usage Tracking
export const UsageBridge = {
  getAppUsageStats: (startTime: Date, endTime: Date) =>
    NativeModules.ZenUsage.getStats(startTime, endTime),
  getInstalledApps: () => NativeModules.ZenUsage.getApps(),
  getMostUsedApps: (limit: number) => NativeModules.ZenUsage.getMostUsed(limit),
};

// System Control
export const SystemBridge = {
  setBlackWallpaper: () => NativeModules.ZenSystem.setWallpaper("#000000"),
  enableDND: (until: Date) => NativeModules.ZenSystem.enableDND(until),
  disableDND: () => NativeModules.ZenSystem.disableDND(),
  lockScreen: () => NativeModules.ZenSystem.lock(),
  getScreenOnTime: () => NativeModules.ZenSystem.getScreenOnTime(),
};
```

**Onboarding Flow** - Permission Education

```
Step 1: Welcome + Value Prop
Step 2: Choose your biggest distraction (Instagram, TikTok, etc.)
Step 3: Set daily focus goal (2 hours)
Step 4: Permissions (explain each one visually)
  ├── Usage Access: "See which apps waste your time"
  ├── Notification Access: "Block distracting notifications"
  ├── Set as Launcher: "Replace your home screen"
  └── Battery: "Keep Zen running in background"
Step 5: Quick win: Start first session immediately
```

**Unique Features:**

1. **Friction Moments** - 5-second breathing animation before opening blocked apps
2. **Emergency Exit** - Long-press power button 3x to disable blocking
3. **Location-Based Rules** - Auto-enable focus at work/library
4. **Sleep Mode** - Auto-enable DND based on sleep schedule
5. **Smart Unlocking** - Increase friction after multiple unlocks

---

### **Phase 6 — Performance, Stability & Release**

**Tasks:**

1. Memoize components + selectors.
2. Enable Hermes.
3. Add background timer fallback.
4. Add Sentry crash reporting.
5. Optimize bundle size:
   - code splitting
   - lazy imports
6. Add EAS build config:
   - release channels
   - auto versioning
7. Generate app icons + splash screens.
8. Run Detox / Jest tests.
9. Generate Play Store bundle:

---

## 5. Copilot Behavioral Rules

Copilot must:

- Follow this exact structure for all code generation.
- Do not produce pseudocode.
- Always produce complete, real implementation.
- Inform if a feature requires Android permissions or native modules.
- Keep UI clean, minimalist, black-dominant.
- Never mix business logic with screens.
- Always separate concerns into:
- **screens**
- **components**
- **services**
- **store**
- **api**
- **native**
- Suggest refactors when required.
- Generate TypeScript with strict types.
- Use functional, composable patterns.
- Implement side effects using services, not React components.

---

## 6. Making GitHub Copilot Always Context-Aware 🧠

### **Strategy 1: Context Files (Recommended)**

Create these files in your project root to maintain persistent context:

**`.github/copilot-instructions.md`** (GitHub recognizes this automatically)

```markdown
# Zen Mobile - Copilot Context

You are the Senior Architect for Zen Mobile, a distraction-free productivity launcher.

## Core Principles

- TypeScript strict mode always
- Atomic design for components
- Services for all business logic
- Offline-first with WatermelonDB
- True black (#000000) for OLED
- 60fps animations minimum
- Haptic feedback for key interactions

## File Structure

- Screens: /src/screens
- Components: /src/components (atoms/molecules/organisms)
- Services: /src/services
- Store: /src/store (Zustand)
- Native: /src/native-android

## When generating code:

1. Always add TypeScript types
2. Extract business logic to services
3. Use functional components with hooks
4. Add error boundaries
5. Include accessibility labels
6. Optimize for performance
7. Follow atomic design patterns

Refer to TODO_PLAN.md for complete architecture.
```

**`.copilot/context.json`** (Custom context file)

```json
{
  "projectName": "Zen Mobile",
  "type": "productivity-launcher",
  "stack": ["React Native", "TypeScript", "Expo", "Zustand", "WatermelonDB"],
  "architecture": "feature-based-modular",
  "designSystem": "atomic-design",
  "platform": "Android",
  "references": {
    "architecture": "TODO_PLAN.md",
    "components": "src/components/README.md",
    "services": "src/services/README.md"
  }
}
```

### **Strategy 2: Inline Context Comments**

Add context comments at the top of key files:

```typescript
/**
 * @copilot-context
 * This is a service layer file. It should:
 * - Contain only business logic (no UI)
 * - Be framework-agnostic
 * - Have comprehensive error handling
 * - Include unit tests
 * - Use TypeScript strict mode
 *
 * Related files:
 * - Store: /src/store/sessionSlice.ts
 * - Native bridge: /src/services/nativeBridge.ts
 * - Tests: /src/services/__tests__/sessionTracker.test.ts
 */
```

### **Strategy 3: README Files in Each Directory**

Create `README.md` in major directories:

**`/src/components/README.md`**

```markdown
# Component Library

## Atomic Design Structure

- **Atoms**: Basic building blocks (Button, Text, Icon)
- **Molecules**: Simple compositions (Card, Input with label)
- **Organisms**: Complex UI sections (SessionTimer, AppBlockList)

## Guidelines

- All components must be pure (no side effects)
- Props must be typed with TypeScript interfaces
- Export a default component and its prop types
- Include JSDoc comments for complex props
- Use StyleSheet.create for styles
- Add displayName for debugging

## Example

\`\`\`typescript
interface ButtonProps {
onPress: () => void;
label: string;
variant?: 'primary' | 'secondary';
}

export default function Button({ onPress, label, variant = 'primary' }: ButtonProps) {
// Implementation
}
\`\`\`
```

### **Strategy 4: Smart File Naming**

Use descriptive names that give Copilot context:

```
❌ Bad:  utils.ts, helpers.ts, index.ts
✅ Good: timeFormatters.ts, sessionHelpers.ts, sessionSlice.ts
```

### **Strategy 5: TypeScript Interfaces as Documentation**

```typescript
/**
 * Session configuration for starting a new focus session.
 * Used by sessionTracker.startSession()
 *
 * @example
 * const config: SessionConfig = {
 *   goalMinutes: 25,
 *   blockApps: ['com.instagram.android'],
 *   allowBreaks: true
 * }
 */
interface SessionConfig {
  goalMinutes: number;
  blockApps: string[];
  allowBreaks: boolean;
  frictionSeconds?: number;
  theme?: "default" | "nature" | "space";
}
```

### **Strategy 6: Git Commit Messages**

Write descriptive commits that become part of the context:

```bash
git commit -m "feat(session): Add intelligent break recommendations

- Implement adaptive break timing based on session length
- Add Pomodoro-style intervals (25/50/90 min)
- Integrate with haptic feedback service
- Update SessionScreen UI with break countdown

Relates to: Phase 3 - Session Engine
```

### **Strategy 7: Use Copilot Chat with @workspace**

In Copilot Chat, always use:

```
@workspace Generate a service for tracking app usage statistics

Context:
- Follow atomic design patterns
- Use TypeScript strict mode
- Integrate with UsageBridge from nativeBridge.ts
- Store data in WatermelonDB
- Export functions for dashboard consumption
```

### **Strategy 8: Maintain Architecture Decision Records (ADR)**

Create `/docs/adr/` directory:

**`/docs/adr/001-why-zustand-over-redux.md`**

```markdown
# ADR 001: Use Zustand Instead of Redux

## Status

Accepted

## Context

Need lightweight state management for session tracking and app state.

## Decision

Use Zustand because:

- Simpler API (less boilerplate)
- Better TypeScript support
- Smaller bundle size
- Hooks-first design
- Easier to test

## Consequences

- All state slices in /src/store
- Use selectors for performance
- No middleware complexity
```

### **Strategy 9: Update TODO_PLAN.md Regularly**

Always keep this file updated with:

- Current phase and progress
- New architectural decisions
- API changes
- New dependencies
- Performance optimizations

### **Strategy 10: VS Code Settings**

Add to `.vscode/settings.json`:

```json
{
  "github.copilot.enable": {
    "*": true,
    "yaml": true,
    "plaintext": true,
    "markdown": true
  },
  "github.copilot.advanced": {
    "contextSize": 8000,
    "enableCopilotChat": true
  },
  "files.associations": {
    "*.copilot.md": "markdown"
  }
}
```

---

## 7. Final Instructions to Copilot

**You are now the Lead Architect of Zen Mobile.**

From this moment forward:

### ✅ ALWAYS DO:

1. Read TODO_PLAN.md before generating any code
2. Follow the exact file structure specified
3. Use TypeScript strict mode with comprehensive types
4. Separate concerns (UI → Components, Logic → Services, State → Store)
5. Add JSDoc comments for complex functions
6. Include error handling and edge cases
7. Think about performance (memoization, lazy loading)
8. Consider accessibility (screen readers, haptics)
9. Design for OLED (true black backgrounds)
10. Add unit tests for services
11. Use atomic design for components
12. Implement offline-first patterns
13. Add meaningful variable names
14. Extract constants and magic numbers
15. Handle Android lifecycle events

### ❌ NEVER DO:

1. Mix business logic with UI components
2. Use `any` type in TypeScript
3. Create files outside the defined structure
4. Generate pseudocode or incomplete implementations
5. Skip error handling
6. Ignore performance implications
7. Use inline styles (always use StyleSheet)
8. Forget to export TypeScript interfaces
9. Create God objects/functions
10. Ignore React Native best practices

### 🎯 CODE QUALITY STANDARDS:

- **Complexity**: Max cyclomatic complexity of 10
- **Function Length**: Max 50 lines per function
- **File Length**: Max 300 lines per file
- **Test Coverage**: Minimum 80% for services
- **Performance**: 60fps animations, <100ms response time
- **Bundle Size**: Monitor and optimize

### 🚀 WHEN USER ASKS TO BUILD A FEATURE:

1. **Understand**: Ask clarifying questions if needed
2. **Plan**: Explain which files will be created/modified
3. **Structure**: Follow atomic design and service patterns
4. **Implement**: Generate production-ready code
5. **Test**: Include test cases
6. **Document**: Add inline comments and README updates

### 🧪 TESTING STRATEGY:

```typescript
// Unit Tests (Jest)
- Services: 100% coverage
- Utils: 100% coverage
- Hooks: Integration tests

// Component Tests (React Native Testing Library)
- Render tests
- Interaction tests
- Snapshot tests

// E2E Tests (Detox)
- Critical user flows
- Session start/stop
- App blocking
- Onboarding flow
```

---

## 8. Product Differentiation Strategy

### What Makes Zen Unique:

1. **Custom Launcher** - Not just an app, replaces your entire home screen
2. **Intelligent Friction** - Smart delays that make distracting apps less appealing
3. **True Privacy** - Offline-first, no account required, data stays on device
4. **Open Source** - Community-driven, transparent
5. **OLED Optimized** - Save battery, reduce eye strain
6. **Gamification Done Right** - Meaningful rewards, not just badges
7. **ML-Powered Insights** - Learn your patterns, suggest improvements
8. **Zero Dark Patterns** - No manipulation, respect user autonomy

### Target Audience:

- **Primary**: Students, knowledge workers, developers (18-35)
- **Secondary**: Professionals with ADHD, chronic procrastinators
- **Tertiary**: Digital minimalists, productivity enthusiasts

### Monetization:

- **Free Tier**: Core features (unlimited sessions, basic blocking)
- **Premium ($4.99/month or $39.99/year)**:
  - Advanced analytics & insights
  - Cloud sync across devices
  - Custom themes
  - Wear OS integration
  - Priority support
  - No ads (if we add any)

### Growth Strategy:

1. Product Hunt launch
2. Reddit (r/productivity, r/getdisciplined, r/ADHD)
3. YouTube reviews (productivity YouTubers)
4. App Store optimization
5. Referral program (free month for referrals)
6. Open source community

---

**You are now fully aware of the Zen Mobile product vision, architecture, implementation blueprint, and context management strategies.**

**Let's build the world's best distraction-free productivity launcher. 🚀**
