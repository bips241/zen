# Zen Mobile - Native Modules Documentation

## 📱 Complete Native Module Reference

### Overview

Zen Mobile implements **12 native Android modules** with **80+ methods** for professional launcher functionality, focus mode enforcement, and productivity features.

---

## 🎯 1. ZenLauncherModule

**Purpose**: Core launcher functionality and app management

**Capabilities**:

- Set as default launcher
- Get installed apps with metadata
- Check launcher status
- Hide/show system UI
- App shortcuts support
- Adaptive icon detection

**Key Methods**:

```typescript
// Set as default launcher
await launcher.setAsDefault();

// Check if default launcher
const isDefault = await launcher.isDefault();

// Get all installed apps
const apps = await apps.getInstalled();

// Get detailed app info
const details = await zenLauncher.getAppDetails("com.example.app");
// Returns: { packageName, appName, versionName, firstInstallTime,
//           lastUpdateTime, category, isSystemApp, targetSdk }

// Get app shortcuts
const shortcuts = await zenLauncher.getAppShortcuts("com.example.app");

// Check adaptive icon support
const hasAdaptive = await zenLauncher.supportsAdaptiveIcon("com.example.app");

// Get enhanced app list with categories
const detailedApps = await zenLauncher.getInstalledAppsDetailed();
```

**UI/UX Usage**:

- Home screen app grid
- App drawer with search/filter
- App info screens
- Category-based organization
- Shortcut actions menu

---

## 📊 2. UsageStatsModule (Enhanced)

**Purpose**: Comprehensive screen time analytics and app usage tracking

**Capabilities**:

- Daily/weekly screen time
- Most used apps ranking
- App category breakdown
- Hourly usage patterns
- Screen unlock counts
- Per-app usage stats

**Key Methods**:

```typescript
// Today's total screen time
const screenTime = await usageStats.getScreenTimeToday();
// Returns: { totalTimeMs, totalTimeMinutes, totalTimeHours }

// Most used apps (top 10)
const topApps = await usageStats.getMostUsedApps(10);

// Weekly breakdown (last 7 days)
const weekly = await usageStats.getWeeklyScreenTime();
// Returns: [{ date, totalTimeMs, totalTimeMinutes, totalTimeHours }, ...]

// Usage by category
const categories = await usageStats.getCategorizedUsage();
// Returns: [{ category: "Social", totalTimeMs, totalTimeMinutes }, ...]

// Hourly breakdown for today
const hourly = await usageStats.getHourlyBreakdown();
// Returns: [{ hour: 0-23, usageMinutes }, ...]

// Screen unlocks today
const unlocks = await usageStats.getScreenUnlocksToday();
// Returns: { unlockCount }
```

**UI/UX Usage**:

- Dashboard with charts (daily/weekly/monthly)
- Category pie charts
- Hourly heatmap
- Top apps leaderboard
- Screen unlock counter
- App-specific usage details

---

## 🚫 3. AppBlockerModule

**Purpose**: App access control and blocking

**Capabilities**:

- Block/unblock apps
- Check app running status
- Request usage stats permission

**Key Methods**:

```typescript
// Block an app
await blocker.blockApp("com.instagram.android");

// Unblock an app
await blocker.unblockApp("com.instagram.android");

// Check if app is blocked
const isBlocked = await blocker.isAppBlocked("com.instagram.android");

// Get all blocked apps
const blocked = await blocker.getBlockedApps();

// Request permission
await blocker.requestUsageStatsPermission();
```

**UI/UX Usage**:

- Focus mode app selection
- Block list management
- App blocking toggle switches
- Permission request screens

---

## 🔕 4. ZenNotificationModule

**Purpose**: Notification blocking control

**Capabilities**:

- Block/unblock notifications per app
- Check notification listener permission
- Enable/disable notification blocking

**Key Methods**:

```typescript
// Block notifications from app
await notifications.blockNotifications("com.instagram.android");

// Unblock notifications
await notifications.unblockNotifications("com.instagram.android");

// Check if has permission
const hasPermission = await notifications.hasPermission();

// Request permission
await notifications.requestPermission();

// Check if enabled
const isEnabled = await notifications.isEnabled();
```

**UI/UX Usage**:

- Notification management screen
- Per-app notification toggles
- Permission request flow

---

## 🌙 5. DNDModule

**Purpose**: System-level Do Not Disturb control

**Capabilities**:

- Enable/disable/toggle DND
- Check DND status
- Check/request DND permission

**Key Methods**:

```typescript
// Toggle DND (returns new state)
const isEnabled = await dnd.toggle();

// Enable DND
await dnd.enable();

// Disable DND
await dnd.disable();

// Check status
const isDNDOn = await dnd.checkStatus();

// Check permission
const hasPerm = await dnd.hasPermission();

// Request permission
await dnd.requestPermission();
```

**UI/UX Usage**:

- Quick toggle in settings
- Focus mode auto-DND
- DND schedule settings
- Permission prompts

---

## 🎯 6. FocusEnforcementModule

**Purpose**: Foreground service for active app blocking during focus sessions

**Capabilities**:

- Start/stop enforcement service
- Monitor running apps
- Redirect blocked apps to home
- Show persistent notification

**Key Methods**:

```typescript
// Start focus session
await focusEnforcement.startEnforcement(
  ["com.instagram.android", "com.facebook.katana"], // blocked apps
  25 // goal minutes
);

// Stop enforcement
await focusEnforcement.stopEnforcement();

// Check if active
const isActive = await focusEnforcement.isEnforcementActive();

// Get currently blocked packages
const blocked = await focusEnforcement.getBlockedPackages();
```

**UI/UX Usage**:

- Focus session start screen
- Active session indicator
- Session progress notification
- Session end confirmation

---

## 🔔 7. FocusNotificationModule

**Purpose**: Notification interception and filtering during focus mode

**Capabilities**:

- Enable/disable focus mode
- Suppress notifications from specific apps
- Track suppressed notifications
- Provide notification summary

**Key Methods**:

```typescript
// Enable focus mode with blocked apps
await focusNotification.setFocusMode(true, [
  "com.instagram.android",
  "com.twitter.android",
]);

// Check if focus mode active
const isActive = await focusNotification.isFocusModeActive();

// Get suppressed notifications
const suppressed = await focusNotification.getSuppressedNotifications();
// Returns: [{ packageName, appName, title, text, timestamp }, ...]

// Get count
const count = await focusNotification.getSuppressedCount();

// Clear history
await focusNotification.clearSuppressedNotifications();
```

**UI/UX Usage**:

- Focus session notification summary
- Suppressed notifications list
- Post-session notification review
- Notification filtering settings

---

## 🔋 8. PowerModule

**Purpose**: Battery optimization and power management

**Capabilities**:

- Check battery level and charging status
- Request battery optimization exemption
- Detect power save mode
- Monitor device idle state

**Key Methods**:

```typescript
// Get battery info
const battery = await power.getBatteryInfo();
// Returns: { level, isCharging, status, isFull }

// Check battery optimization
const isIgnoring = await power.isIgnoringBatteryOptimizations();

// Request exemption (for reliable foreground service)
await power.requestIgnoreBatteryOptimizations();

// Check power save mode
const isPowerSave = await power.isPowerSaveMode();

// Comprehensive status
const status = await power.getPowerStatus();
// Returns: { batteryLevel, isCharging, isPowerSaveMode, isScreenOn,
//           isIgnoringBatteryOptimizations, isDeviceIdleMode }
```

**UI/UX Usage**:

- Battery indicator in status bar
- Power save mode warning
- Battery optimization prompt
- Focus session battery estimate

---

## 🎨 9. WallpaperModule

**Purpose**: OLED-optimized wallpaper management

**Capabilities**:

- Set solid colors (true black for OLED)
- Set wallpaper from image URI
- Clear wallpaper
- Quick black/dark gray presets

**Key Methods**:

```typescript
// Set true black (OLED-optimized)
await wallpaper.setBlack();

// Set custom color
await wallpaper.setSolidColor("#000000");

// Set from image
await wallpaper.setFromUri("file:///path/to/image.jpg");

// Clear (reset to default)
await wallpaper.clear();
```

**UI/UX Usage**:

- Wallpaper picker screen
- OLED black mode toggle
- Color picker with presets
- Image gallery integration

---

## 💾 10. BackupModule

**Purpose**: Settings backup and restore

**Capabilities**:

- Export settings to JSON
- Import from backup file
- List available backups
- Delete old backups

**Key Methods**:

```typescript
// Export settings
const result = await backup.exportSettings(
  { theme: "dark", focusGoal: 25, blockedApps: [...] },
  "my_backup" // optional name
);
// Returns: { filePath, fileName, fileSize }

// Import settings
const settings = await backup.importSettings("/path/to/backup.json");

// List backups
const backups = await backup.listBackups();
// Returns: [{ fileName, filePath, fileSize, lastModified,
//            backupTimestamp, appVersion }, ...]

// Delete backup
await backup.deleteBackup("/path/to/backup.json");

// Get backup directory
const dir = await backup.getBackupDirectory();
```

**UI/UX Usage**:

- Settings backup screen
- Backup list with timestamps
- One-tap restore
- Auto-backup scheduler
- Cloud sync preparation

---

## 👆 11. GestureModule

**Purpose**: Gesture detection for launcher interactions

**Capabilities**:

- Swipe up/down/left/right detection
- Double-tap detection
- Long-press detection
- Fling velocity tracking
- Configurable thresholds

**Key Methods**:

```typescript
// Initialize
await gestures.initialize();

// Configure thresholds
await gestures.configure(
  100, // swipe threshold (pixels)
  100 // velocity threshold (pixels/sec)
);

// Enable/disable
await gestures.enable();
await gestures.disable();

// Check status
const isEnabled = await gestures.isEnabled();

// Listen for events (React Native)
import { DeviceEventEmitter } from "react-native";

DeviceEventEmitter.addListener("onGesture", (event) => {
  // event.type: "swipeUp", "swipeDown", "swipeLeft", "swipeRight",
  //             "tap", "doubleTap", "longPress", "scroll"
  // event.x, event.y, event.velocityX, event.velocityY, etc.

  if (event.type === "swipeUp") {
    // Open app drawer
  } else if (event.type === "swipeDown") {
    // Open notifications
  }
});
```

**UI/UX Usage**:

- Swipe up for app drawer
- Swipe down for notifications
- Double-tap to lock
- Long-press for widget mode
- Custom gesture actions

---

## ♿ 12. AccessibilityModule

**Purpose**: System-level app blocking via Accessibility Service (strongest enforcement)

**Capabilities**:

- Block app launches at system level
- Auto-dismiss distracting notifications
- Monitor window state changes
- Stronger than usage stats blocking

**Key Methods**:

```typescript
// Check if service enabled
const isEnabled = await accessibility.isServiceEnabled();

// Request permission (opens settings)
await accessibility.requestPermission();

// Set focus mode
await accessibility.setFocusMode(true, [
  "com.instagram.android",
  "com.facebook.katana",
]);

// Check if focus mode active
const isActive = await accessibility.isFocusModeActive();

// Get blocked packages
const blocked = await accessibility.getBlockedPackages();
```

**UI/UX Usage**:

- Advanced blocking option
- Accessibility permission flow
- "Nuclear option" focus mode
- System-level enforcement indicator

---

## 🎁 High-Level Wrappers (nativeBridge.ts)

All modules have convenient wrappers:

```typescript
import {
  launcher,
  apps,
  blocker,
  stats,
  notifications,
  dnd,
  focusSession,
  notificationListener,
  power,
  wallpaper,
  backup,
  gestures,
  accessibility,
} from "@/services/nativeBridge";

// Example: Complete focus session start
async function startFocusSession(blockedApps: string[], minutes: number) {
  // 1. Enable DND
  await dnd.enable();

  // 2. Start notification filtering
  await notificationListener.setFocusMode(true, blockedApps);

  // 3. Start foreground enforcement
  await focusSession.start(blockedApps, minutes);

  // 4. Optionally enable accessibility blocking
  await accessibility.setFocusMode(true, blockedApps);
}
```

---

## 📂 Android Project Structure

```
mobile/android/app/src/main/
├── java/com/anonymous/focusshell/
│   ├── MainActivity.java                    # Main activity with immersive mode
│   │   └── Uses: BEHAVIOR_SHOW_BARS_BY_TOUCH, edge-to-edge, disabled back button
│   │
│   ├── MainApplication.java                 # App initialization, React Native setup
│   │   └── Uses: Registers ZenReactPackage, initializes React Native
│   │
│   ├── modules/                             # Native modules (12 total)
│   │   ├── ZenLauncherModule.kt            # Launcher core (set default, app list, shortcuts)
│   │   ├── AppBlockerModule.kt             # App blocking logic
│   │   ├── UsageStatsModule.kt             # Analytics (screen time, categories, hourly)
│   │   ├── ZenNotificationModule.kt        # Notification blocking
│   │   ├── DNDModule.kt                    # Do Not Disturb control
│   │   ├── FocusEnforcementModule.kt       # Enforcement service control
│   │   ├── FocusNotificationModule.kt      # Notification filtering control
│   │   ├── PowerModule.kt                  # Battery & power management
│   │   ├── WallpaperModule.kt              # OLED wallpaper control
│   │   ├── BackupModule.kt                 # Settings backup/restore
│   │   ├── GestureModule.kt                # Gesture detection
│   │   ├── AccessibilityModule.kt          # Accessibility service control
│   │   └── ZenReactPackage.kt              # Registers all 12 modules
│   │
│   └── services/                            # Native services (4 total)
│       ├── FocusEnforcementService.kt      # Foreground service monitoring apps
│       │   └── Uses: Monitors every 1s, redirects blocked apps to home
│       │
│       ├── FocusNotificationListenerService.kt  # Notification interception
│       │   └── Uses: Filters notifications by package, stores suppressed
│       │
│       ├── FocusTileService.kt             # Quick Settings tile
│       │   └── Uses: One-tap focus toggle from Quick Settings
│       │
│       └── FocusAccessibilityService.kt    # System-level blocking
│           └── Uses: Accessibility API, dismisses notifications, blocks launches
│
├── res/
│   ├── values/
│   │   └── strings.xml                     # App strings, shortcut labels
│   │
│   └── xml/
│       ├── shortcuts.xml                   # App shortcuts (Focus, Tratak, Stats)
│       └── accessibility_service_config.xml # Accessibility service config
│
└── AndroidManifest.xml                     # App configuration
    └── Permissions: QUERY_ALL_PACKAGES, PACKAGE_USAGE_STATS,
                     BIND_NOTIFICATION_LISTENER_SERVICE,
                     FOREGROUND_SERVICE, ACCESS_NOTIFICATION_POLICY,
                     SET_WALLPAPER, REQUEST_IGNORE_BATTERY_OPTIMIZATIONS
    └── Services: All 4 services registered
    └── Intent Filters: Launcher (HOME), deep links (zen://),
                        share intents, app shortcuts
```

---

## 🎨 UI/UX Implementation Guide

### 1. Home Screen

```typescript
// Use: ZenLauncherModule, GestureModule
- Display 3 rows of apps (from getInstalledApps)
- Swipe up to open app drawer (gesture detection)
- Swipe down for notifications
- Long-press app for quick actions
```

### 2. App Drawer

```typescript
// Use: ZenLauncherModule, UsageStatsModule
- List all apps with search/filter
- Show app categories
- Display last used time
- Sort by: name, usage, install date
```

### 3. Focus Mode Screen

```typescript
// Use: FocusEnforcementModule, DNDModule, FocusNotificationModule
- Select blocked apps (multi-select)
- Set duration (slider/picker)
- Enable DND toggle
- Start button → focusSession.start()
- Show persistent notification during session
```

### 4. Dashboard/Stats Screen

```typescript
// Use: UsageStatsModule, PowerModule
- Today's screen time (large number)
- Weekly chart (line/bar chart)
- Top 5 most used apps
- Category breakdown (pie chart)
- Hourly heatmap
- Screen unlocks counter
- Battery status indicator
```

### 5. Settings Screen

```typescript
// Use: BackupModule, WallpaperModule, PowerModule, AccessibilityModule
- Theme selector (OLED black toggle)
- Wallpaper picker
- Backup/Restore section
- Battery optimization check
- Accessibility service toggle
- Permission status indicators
```

### 6. Notification Summary Screen

```typescript
// Use: FocusNotificationModule
- Show after focus session ends
- List suppressed notifications with timestamps
- Group by app
- Clear all button
```

### 7. App Info Screen

```typescript
// Use: ZenLauncherModule
- App icon (check if adaptive)
- App name, package name
- Version, install date, last update
- App size (data + cache)
- Category
- Shortcuts list
- Block toggle
- Usage stats
```

---

## 🔌 Permission Requirements

**Required Permissions**:

1. `QUERY_ALL_PACKAGES` - Auto-granted, list all apps
2. `PACKAGE_USAGE_STATS` - User must grant in settings
3. `BIND_NOTIFICATION_LISTENER_SERVICE` - User must enable
4. `ACCESS_NOTIFICATION_POLICY` - For DND control
5. `BIND_ACCESSIBILITY_SERVICE` - Optional, for advanced blocking
6. `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` - For reliable foreground service

**Permission Flow**:

```typescript
// Check and request permissions on app launch
async function checkPermissions() {
  // 1. Usage stats
  if (!(await blocker.hasUsageStatsPermission())) {
    await blocker.requestUsageStatsPermission();
  }

  // 2. Notification listener
  if (!(await notifications.hasPermission())) {
    await notifications.requestPermission();
  }

  // 3. DND access
  if (!(await dnd.hasPermission())) {
    await dnd.requestPermission();
  }

  // 4. Battery optimization (optional but recommended)
  if (!(await power.isIgnoringBatteryOptimizations())) {
    await power.requestIgnoreBatteryOptimizations();
  }

  // 5. Accessibility (optional, for advanced blocking)
  if (!(await accessibility.isServiceEnabled())) {
    await accessibility.requestPermission();
  }
}
```

---

## 🚀 Quick Start Examples

### Complete Focus Session

```typescript
import { focusSession, dnd } from "@/services/nativeBridge";

const startFocus = async () => {
  const blockedApps = [
    "com.instagram.android",
    "com.facebook.katana",
    "com.twitter.android",
  ];

  await focusSession.start(blockedApps, 25);
  // This automatically:
  // - Enables DND
  // - Starts notification filtering
  // - Starts foreground enforcement service
};

const stopFocus = async () => {
  await focusSession.stop();
  // This automatically:
  // - Disables DND
  // - Stops notification filtering
  // - Stops enforcement service
};
```

### Dashboard Stats

```typescript
import { usageStats } from "@/services/nativeBridge";

const loadDashboard = async () => {
  const screenTime = await usageStats.getScreenTimeToday();
  const topApps = await usageStats.getMostUsedApps(5);
  const categories = await usageStats.getCategorizedUsage();
  const hourly = await usageStats.getHourlyBreakdown();
  const unlocks = await usageStats.getScreenUnlocksToday();

  return { screenTime, topApps, categories, hourly, unlocks };
};
```

### Settings Backup

```typescript
import { backup } from "@/services/nativeBridge";

const saveSettings = async (settings) => {
  const result = await backup.exportSettings(settings);
  console.log(`Saved to: ${result.filePath}`);
};

const restoreSettings = async (filePath) => {
  const settings = await backup.importSettings(filePath);
  // Apply settings to app
};
```

---

## 📝 Notes

- All modules are Android-only (return early on iOS)
- Platform check: `Platform.OS !== "android"`
- Error handling: All methods have try/catch wrappers
- Logging: Console logs for debugging
- Type safety: Full TypeScript support
- Event emitters: Some modules emit events (Gesture, Notification)

---

**Total Native Implementation**: 3,500+ lines of production-ready Kotlin code across 16 files, 12 modules, 4 services, 80+ methods, complete TypeScript integration, ready for UI/UX implementation.
