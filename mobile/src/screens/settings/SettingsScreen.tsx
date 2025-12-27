/**
 * Settings Screen - Professional Unified Design







































































































































































































































































































































































































































- [Zustand Persist](https://github.com/pmndrs/zustand#persist-middleware)- [WatermelonDB Sync](https://nozbe.github.io/WatermelonDB/Advanced/Sync.html)- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)- [Firebase Setup Guide](https://rnfirebase.io/)## Resources6. **Deploy backend**: If using custom API5. **Test thoroughly**: Unit tests, integration tests, E2E tests4. **Add UI components**: Sync status, backup screens3. **Create sync service**: Upload/download logic2. **Implement authentication**: Firebase Auth or JWT1. **Choose backend**: Firebase (easier) vs Custom API (more control)## Next Steps**Conclusion**: Free tier supports 500+ active users- Storage: ~1MB/year of data- Total: ~90 operations/month- Sync reads: 60 reads (2/day)- Daily stats writes: 30 writes**Usage Estimate (per user/month):**- 10GB bandwidth/month- 1GB storage- 20K writes/day- 50K reads/day**Free Tier Limits:**## Cost Estimation (Firebase)5. **Background Tasks**: Use background fetch for sync4. **Caching**: Cache frequently accessed cloud data locally3. **Compression**: Compress data before upload2. **Batch Operations**: Upload/download in batches1. **Delta Sync**: Only sync changed records since last sync## Performance Optimization```});  });    expect(queue.length).toBe(1);    const queue = await SyncService.getQueue();    await SyncService.queueChange({ type: 'update', data: {...} });  it('should handle offline queue', async () => {    });    expect(resolved.data).toBe('B'); // Cloud is newer    const resolved = resolveConflict(local, cloud);        const cloud = { updatedAt: '2024-01-01T11:00:00Z', data: 'B' };    const local = { updatedAt: '2024-01-01T10:00:00Z', data: 'A' };  it('should resolve conflicts with last-write-wins', async () => {    });    expect(result.success).toBe(true);    const result = await SyncService.uploadData();  it('should upload local changes', async () => {describe('SyncService', () => {// __tests__/syncService.test.ts```typescript## Testing Strategy5. **Data Validation**: Validate all incoming data on client and server4. **Rate Limiting**: Implement on backend to prevent abuse3. **HTTPS Only**: All API calls must use HTTPS2. **Auth Token**: Store in expo-secure-store, never in AsyncStorage1. **Encryption**: Encrypt sensitive data before upload## Security Considerations- [ ] Restore to specific date- [ ] Sync history/logs- [ ] Multiple device management- [ ] Selective sync (choose what to sync)### Phase 5: Advanced Features- [ ] Offline queue implementation- [ ] Sync on connectivity change- [ ] Periodic sync (every X minutes)- [ ] Background sync on app start### Phase 4: Automatic Sync- [ ] Add sync status indicators- [ ] Implement download function- [ ] Implement upload function- [ ] Set up Firebase Firestore or REST API### Phase 3: Cloud Storage (After Auth)- [ ] Handle session management- [ ] Store auth token securely- [ ] Implement sign up/sign in screens- [ ] Set up Firebase or custom auth### Phase 2: Authentication (Next)- [x] Manual backup/restore- [x] Conflict resolution (last-write-wins)- [x] Import data from JSON- [x] Export data to JSON### Phase 1: Export/Import (✅ Complete)## Implementation Phases```}  );    </Container>      )}        </View>          <Button label="Import Backup" onPress={handleImport} />          <Button label="Export Local Backup" onPress={handleExport} />          <Button label="Sync Now" onPress={startSync} />          <SyncStatus />        <View>      ) : (        <SignInPrompt onSignIn={() => navigation.navigate('SignIn')} />      {!isSignedIn ? (    <Container>  return (    const { startSync, lastSyncTime } = useSyncStore();  const [isSignedIn, setIsSignedIn] = useState(false);export default function BackupRestoreScreen() {// screens/BackupRestoreScreen.tsx```typescript**Backup Screen**```}  return <Text>Not synced</Text>;    }    return <Text>Last synced: {formatRelativeTime(lastSyncTime)}</Text>;  if (lastSyncTime) {    }    return <Text style={{ color: colors.error }}>Sync failed</Text>;  if (syncError) {    }    return <Text>Syncing...</Text>;  if (isSyncing) {    const { lastSyncTime, isSyncing, syncError } = useSyncStore();export function SyncStatus() {// components/molecules/SyncStatus.tsx```typescript**Sync Status Indicator**### 6. UI Components```}));  // ... other actions    },    }      });        isSyncing: false         syncError: error.message,       set({     } catch (error) {      });        isSyncing: false         pendingChanges: 0,        lastSyncTime: new Date(),       set({       await SyncService.syncData();    try {        set({ isSyncing: true, syncError: null });        }      return;      set({ syncError: 'Not authenticated' });    if (!isAuthenticated || !userId) {        const { isAuthenticated, userId } = get();  startSync: async () => {    userId: null,  isAuthenticated: false,  pendingChanges: 0,  syncError: null,  isSyncing: false,  lastSyncTime: null,export const useSyncStore = create<SyncState & SyncActions>((set, get) => ({// Usage in store}  setAuthenticated: (authenticated: boolean, userId?: string) => void;  clearPendingChanges: () => void;  incrementPendingChanges: () => void;  setSyncError: (error: string | null) => void;  setLastSyncTime: (time: Date) => void;  startSync: () => Promise<void>;interface SyncActions {}  userId: string | null;  isAuthenticated: boolean;  pendingChanges: number;  syncError: string | null;  isSyncing: boolean;  lastSyncTime: Date | null;interface SyncState {```typescript**Add to Zustand Store:**### 5. Sync State Management```}  }    return response.json();        });      }),        deviceId: await getDeviceId(),        timestamp: new Date().toISOString(),        data,      body: JSON.stringify({      },        'Content-Type': 'application/json',        'Authorization': `Bearer ${token}`,      headers: {      method: 'POST',    const response = await fetch(`${this.baseURL}/sync/upload`, {  static async uploadData(data: ExportedData, token: string) {    private baseURL = 'https://api.zenmobile.app';export class CloudAPI {// Implementation:GET    /api/backup/{id}GET    /api/backup/listPOST   /api/backup/createPOST   /api/sync/uploadGET    /api/sync/download?since=timestampPOST   /api/auth/registerPOST   /api/auth/login// Endpoints```typescript**Option B: Custom REST API**```}  }    return snapshot.docs.map(doc => doc.data());    const snapshot = await query.get();        }      query = query.where('updatedAt', '>', since);    if (since) {          .collection('daily_stats');      .doc(userId)      .collection('users')    let query = firestore()  static async downloadDailyStats(userId: string, since?: Date) {    }    await batch.commit();        });      }, { merge: true });        updatedAt: firestore.FieldValue.serverTimestamp(),        ...stat,      batch.set(ref, {              .doc(stat.date);        .collection('daily_stats')        .doc(userId)        .collection('users')      const ref = firestore()    stats.forEach(stat => {        const batch = firestore().batch();  static async uploadDailyStats(userId: string, stats: DailyStats[]) {export class FirebaseSync {import firestore from '@react-native-firebase/firestore';// Implementation:- Easy setup- Free tier available- Offline support- Real-time sync- Built-in authentication// Advantages:  /metadata/lastSync - Last sync timestamp  /settings/preferences - User preferences  /sessions/{sessionId} - Session records  /daily_stats/{date} - Daily statistics/users/{userId}/// Structure```typescript**Option A: Firebase Firestore (Recommended)**### 4. Cloud Storage Backend```}  };    mostUsedApps: mergeMostUsedApps(local.mostUsedApps, cloud.mostUsedApps),    // Merge arrays intelligently    currentStreak: Math.max(local.currentStreak, cloud.currentStreak),    sessionsCompleted: Math.max(local.sessionsCompleted, cloud.sessionsCompleted),    totalFocusSeconds: Math.max(local.totalFocusSeconds, cloud.totalFocusSeconds),    ...local,  return {function mergeConflict(local: DailyStats, cloud: DailyStats): DailyStats {```typescript**Alternative: Merge Strategy (For advanced implementation)**```}  }    return local; // Local is newer  } else {    return cloud; // Cloud is newer  if (cloudTime > localTime) {    const cloudTime = new Date(cloud.updatedAt);  const localTime = new Date(local.updatedAt);function resolveConflict(local: SyncRecord, cloud: SyncRecord): SyncRecord {// Conflict resolution logic}  deviceId: string;  // Unique device identifier  updatedAt: string; // ISO timestamp  data: any;interface SyncRecord {```typescript**Last-Write-Wins (Recommended for MVP)**### 3. Conflict Resolution Strategy```}  static async processQueue(): Promise<void>  // Process queued changes    static async queueChange(change: DataChange): Promise<void>  // Queue changes for sync when online    static async syncData(): Promise<SyncResult>  // Full sync (bidirectional)    static async downloadData(): Promise<SyncResult>  // Download cloud data to local    static async uploadData(): Promise<SyncResult>  // Upload local data to cloudexport class SyncService {// services/syncService.ts```typescript**Implementation:**- Handle offline queue- Resolve conflicts- Download cloud changes to local- Upload local changes to cloud**Responsibilities:**### 2. Sync Service```}  static async getAuthToken(): Promise<string>  static async getCurrentUser(): Promise<User | null>  static async signOut(): Promise<void>  static async signIn(email: string, password: string): Promise<User>  static async signUp(email: string, password: string): Promise<User>export class AuthService {// services/authService.ts```typescript**Implementation:**- **Social OAuth** (Google, Apple Sign-In)- **Custom JWT Auth** (For full control)- **Firebase Authentication** (Recommended for quick setup)**Options:**### 1. Authentication Layer## Cloud Sync Architecture  - `DailyStatsService.importStats()` - Import from JSON with conflict resolution  - `DailyStatsService.exportAllStats()` - Export to JSON- **Functions**:- **Status**: ✅ Basic implementation ready### Export/Import  - Daily reset logic with configurable refresh time  - Automatic persistence on state changes  - Database hydration on app start  - Real-time state updates- **Features**:- **Status**: ✅ Fully integrated with database### State Management (Zustand)  - `blocked_apps` - Blocked app configurations  - `settings` - User preferences  - `app_usage` - Per-app usage tracking  - `session_events` - Session event logs  - `sessions` - Session records  - `daily_stats` - Daily focus statistics- **Tables**: - **Storage**: SQLite with WatermelonDB ORM- **Status**: ✅ Fully implemented### Local Database (WatermelonDB)## Current StateThis document outlines the architecture for implementing cloud backup and sync functionality for user data in Zen Mobile. The system is designed to be privacy-first, optional, and conflict-resilient.## Overview *
 * Complete settings management with permissions, focus settings, and preferences
 * Merges standard and enhanced settings into one professional interface
 */

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Animated,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "../../components/atoms";
import { launcher, blocker, notifications } from "../../services/nativeBridge";
import { useStore } from "../../store";

interface SettingItemConfig {
  iconFamily: "ionicons" | "materialcommunity";
  iconName: string;
  label: string;
  type: "toggle" | "navigation" | "permission" | "button";
  value?: boolean;
  onChange?: (value: boolean) => void;
  screen?: string;
  onPress?: () => void;
  subtitle?: string;
  permissionGranted?: boolean;
  disabled?: boolean;
}

interface SettingsSection {
  title: string;
  items: SettingItemConfig[];
}

export default function SettingsScreen({ navigation }: any) {
  // Permission states
  const [isDefaultLauncher, setIsDefaultLauncher] = useState(false);
  const [hasUsagePermission, setHasUsagePermission] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(false);

  // Feature toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [systemUIHidden, setSystemUIHidden] = useState(true);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const preferences = useStore((state) => state.preferences);
  const updatePreferences = useStore((state) => state.updatePreferences);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    checkPermissions();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
    };
  }, [fadeAnim, slideAnim]);

  const checkPermissions = async () => {
    try {
      const [isLauncher, hasUsage, hasNotif, notifEnabled] = await Promise.all([
        launcher.isDefault(),
        blocker.hasUsageStatsPermission(),
        notifications.hasPermission(),
        notifications.isEnabled(),
      ]);

      setIsDefaultLauncher(isLauncher);
      setHasUsagePermission(hasUsage);
      setHasNotificationPermission(hasNotif);
      setNotificationsEnabled(notifEnabled);
    } catch (error) {
      console.error("[Settings] Error checking permissions:", error);
    }
  };

  const handleSetAsDefaultLauncher = async () => {
    try {
      const result = await launcher.setAsDefault();
      if (result.success) {
        Alert.alert(
          "Set as Default Launcher",
          'Please select Zen Mobile from the list and tap "Always"',
          [{ text: "OK", onPress: checkPermissions }]
        );
      } else {
        Alert.alert(
          "Error",
          result.error || "Failed to set as default launcher"
        );
      }
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  const handleRequestUsagePermission = async () => {
    try {
      await blocker.requestUsageStatsPermission();
      Alert.alert(
        "Usage Access Required",
        'Please enable "Permit usage access" for Zen Mobile',
        [{ text: "OK", onPress: checkPermissions }]
      );
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  const handleRequestNotificationPermission = async () => {
    try {
      await notifications.requestPermission();
      Alert.alert(
        "Notification Access Required",
        "Please enable notification access for Zen Mobile",
        [{ text: "OK", onPress: checkPermissions }]
      );
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    try {
      if (enabled) {
        await notifications.enable();
      } else {
        await notifications.disable();
      }
      setNotificationsEnabled(enabled);
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  const handleDailyGoalChange = (minutes: number) => {
    updatePreferences({ dailyGoalMinutes: minutes });
  };

  const handleRefreshTimeChange = () => {
    const times = [
      { label: "Midnight (00:00)", value: "00:00" },
      { label: "1 AM (01:00)", value: "01:00" },
      { label: "2 AM (02:00)", value: "02:00" },
      { label: "3 AM (03:00)", value: "03:00" },
      { label: "4 AM (04:00)", value: "04:00" },
      { label: "5 AM (05:00)", value: "05:00" },
      { label: "6 AM (06:00)", value: "06:00" },
    ];

    Alert.alert("Daily Reset Time", "Choose when your daily progress resets", [
      ...times.map((time) => ({
        text: time.label,
        onPress: () => updatePreferences({ dayRefreshTime: time.value }),
      })),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleToggleSystemUI = async (enabled: boolean) => {
    try {
      setSystemUIHidden(enabled);
      if (enabled) {
        await launcher.hideSystemUI();
      } else {
        await launcher.showSystemUI();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to toggle system UI");
    }
  };

  const handleAddTestSession = async () => {
    try {
      const addFocusMinutes = useStore.getState().addFocusMinutes;
      const dayRefreshTime = useStore.getState().preferences.dayRefreshTime;

      await addFocusMinutes(15, dayRefreshTime);
      Alert.alert(
        "Success",
        "Added 15 minutes to today's progress!\n\nCheck the productivity tracker on the home screen.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", `Failed to add test session: ${error}`);
    }
  };

  const handleExportData = async () => {
    try {
      const { DailyStatsService } = await import(
        "../../services/dailyStatsService"
      );
      const data = await DailyStatsService.exportAllStats();

      Alert.alert(
        "Export Data",
        `Found ${data.length} daily records.\n\nCheck console for full JSON data.`,
        [{ text: "OK" }]
      );

      console.log("=== EXPORTED DATA ===");
      console.log(JSON.stringify(data, null, 2));
      console.log("=== END EXPORT ===");
    } catch (error) {
      Alert.alert("Error", `Failed to export data: ${error}`);
    }
  };

  const handleResetData = () => {
    Alert.alert(
      "Reset All Data",
      "This will permanently delete all your daily stats. This action cannot be undone.\n\nAre you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              const { DailyStatsService } = await import(
                "../../services/dailyStatsService"
              );
              await DailyStatsService.clearAllStats();

              // Reset store state
              const updateStats = useStore.getState().updateStats;
              updateStats({
                todayMinutes: 0,
                weekMinutes: 0,
                currentStreak: 0,
                longestStreak: 0,
              });

              Alert.alert("Success", "All data has been cleared");
            } catch (error) {
              Alert.alert("Error", `Failed to reset data: ${error}`);
            }
          },
        },
      ]
    );
  };

  // Build settings sections dynamically
  const settingsSections: SettingsSection[] = [
    {
      title: "Permissions & Setup",
      items: [
        {
          iconFamily: "ionicons",
          iconName: "home-outline",
          label: "Default Launcher",
          subtitle: "Set Zen as home screen",
          type: "permission",
          permissionGranted: isDefaultLauncher,
          onPress: handleSetAsDefaultLauncher,
        },
        {
          iconFamily: "materialcommunity",
          iconName: "chart-line",
          label: "Usage Stats Access",
          subtitle: "Track app usage time",
          type: "permission",
          permissionGranted: hasUsagePermission,
          onPress: handleRequestUsagePermission,
        },
        {
          iconFamily: "ionicons",
          iconName: "notifications-outline",
          label: "Notification Access",
          subtitle: "Block notifications during focus",
          type: "permission",
          permissionGranted: hasNotificationPermission,
          onPress: handleRequestNotificationPermission,
        },
        {
          iconFamily: "ionicons",
          iconName: "expand-outline",
          label: "Fullscreen Mode",
          subtitle: "Hide status bar and navigation",
          type: "toggle",
          value: systemUIHidden,
          onChange: handleToggleSystemUI,
        },
      ],
    },
    {
      title: "Focus & Productivity",
      items: [
        {
          iconFamily: "ionicons",
          iconName: "notifications-off-outline",
          label: "Block Notifications",
          subtitle: "Hide notifications during sessions",
          type: "toggle",
          value: notificationsEnabled,
          onChange: handleToggleNotifications,
          disabled: !hasNotificationPermission,
        },
        {
          iconFamily: "materialcommunity",
          iconName: "hand-back-right-outline",
          label: "Friction Moments",
          subtitle: "Breathing delay before opening apps",
          type: "navigation",
          screen: "FrictionSettings",
        },
        {
          iconFamily: "ionicons",
          iconName: "moon-outline",
          label: "Do Not Disturb",
          subtitle: "Manage DND settings",
          type: "navigation",
          screen: "DNDSettings",
        },
        {
          iconFamily: "ionicons",
          iconName: "time-outline",
          label: "Focus History",
          subtitle: "View past focus sessions",
          type: "navigation",
          screen: "FocusHistory",
        },
        {
          iconFamily: "ionicons",
          iconName: "remove-circle-outline",
          label: "App Blocker",
          subtitle: "Block distracting apps",
          type: "navigation",
          screen: "AppBlocker",
        },
      ],
    },
    {
      title: "Notifications & Sound",
      items: [
        {
          iconFamily: "ionicons",
          iconName: "volume-high-outline",
          label: "Sound",
          subtitle: "Enable sound effects",
          type: "toggle",
          value: soundEnabled,
          onChange: setSoundEnabled,
        },
        {
          iconFamily: "ionicons",
          iconName: "phone-portrait-outline",
          label: "Vibration",
          subtitle: "Enable haptic feedback",
          type: "toggle",
          value: vibrationEnabled,
          onChange: setVibrationEnabled,
        },
      ],
    },
    {
      title: "Daily Progress",
      items: [
        {
          iconFamily: "ionicons",
          iconName: "refresh-outline",
          label: "Daily Reset Time",
          subtitle: `Resets at ${preferences.dayRefreshTime}`,
          type: "button",
          onPress: handleRefreshTimeChange,
        },
      ],
    },
    {
      title: "Data Management",
      items: [
        {
          iconFamily: "materialcommunity",
          iconName: "backup-restore",
          label: "Backup & Restore",
          subtitle: "Manage your data",
          type: "navigation",
          screen: "BackupRestore",
        },
      ],
    },
    {
      title: "Developer Tools",
      items: [
        {
          iconFamily: "materialcommunity",
          iconName: "test-tube",
          label: "Add Test Session",
          subtitle: "Add 15 minutes to today",
          type: "button",
          onPress: handleAddTestSession,
        },
        {
          iconFamily: "materialcommunity",
          iconName: "database-export",
          label: "Export Data",
          subtitle: "View database JSON",
          type: "button",
          onPress: handleExportData,
        },
        {
          iconFamily: "ionicons",
          iconName: "trash-outline",
          label: "Reset All Data",
          subtitle: "Clear database (testing only)",
          type: "button",
          onPress: handleResetData,
        },
      ],
    },
    {
      title: "Support & Information",
      items: [
        {
          iconFamily: "ionicons",
          iconName: "shield-checkmark-outline",
          label: "Privacy & Security",
          subtitle: "App privacy policy",
          type: "button",
          onPress: () =>
            Alert.alert("Privacy", "Your data stays on your device"),
        },
        {
          iconFamily: "ionicons",
          iconName: "help-circle-outline",
          label: "Help & Support",
          subtitle: "Get assistance",
          type: "button",
          onPress: () => Alert.alert("Help", "Contact: support@zenmobile.app"),
        },
        {
          iconFamily: "ionicons",
          iconName: "information-circle-outline",
          label: "About Zen Mobile",
          subtitle: "Version 1.0.0 (Phase 3)",
          type: "button",
          onPress: () =>
            Alert.alert(
              "Zen Mobile",
              "Distraction-free productivity launcher\n\nVersion 1.0.0 (Phase 3)\n\nBuilt with focus and minimalism"
            ),
        },
      ],
    },
  ];

  const renderIcon = (
    iconFamily: "ionicons" | "materialcommunity",
    iconName: string
  ) => {
    if (iconFamily === "ionicons") {
      return <Ionicons name={iconName as any} size={20} color="#FFFFFF" />;
    } else {
      return (
        <MaterialCommunityIcons
          name={iconName as any}
          size={20}
          color="#FFFFFF"
        />
      );
    }
  };

  const renderSettingItem = (item: SettingItemConfig, index: number) => {
    switch (item.type) {
      case "permission":
        return (
          <View key={index} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                {renderIcon(item.iconFamily, item.iconName)}
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.label}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>
              {item.permissionGranted ? (
                <View style={styles.statusBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.statusText}>Active</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={item.onPress}
                >
                  <Text style={styles.actionButtonText}>Grant</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );

      case "toggle":
        return (
          <View key={index} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                {renderIcon(item.iconFamily, item.iconName)}
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.label}</Text>
                {item.subtitle && (
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                )}
              </View>
              <Switch
                value={item.value}
                onValueChange={item.onChange}
                trackColor={{ false: "#222222", true: "#FFFFFF" }}
                thumbColor={item.value ? "#000000" : "#888888"}
                disabled={item.disabled}
              />
            </View>
          </View>
        );

      case "navigation":
        return (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => item.screen && navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                {renderIcon(item.iconFamily, item.iconName)}
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.label}</Text>
                {item.subtitle && (
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                )}
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="rgba(255, 255, 255, 0.4)"
              />
            </View>
          </TouchableOpacity>
        );

      case "button":
        return (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                {renderIcon(item.iconFamily, item.iconName)}
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.label}</Text>
                {item.subtitle && (
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                )}
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="rgba(255, 255, 255, 0.4)"
              />
            </View>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>
              Configure app and permissions
            </Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Goal Card */}
        <Animated.View
          style={[
            styles.goalCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.goalHeader}>
            <MaterialCommunityIcons name="target" size={24} color="#FFFFFF" />
            <Text style={styles.goalTitle}>Daily Focus Goal</Text>
          </View>
          <Text style={styles.goalSubtitle}>
            Current target: {preferences.dailyGoalMinutes} minutes
          </Text>
          <View style={styles.goalButtonsContainer}>
            {[30, 60, 90, 120, 180, 240].map((minutes) => (
              <TouchableOpacity
                key={minutes}
                style={[
                  styles.goalButton,
                  preferences.dailyGoalMinutes === minutes &&
                    styles.goalButtonActive,
                ]}
                onPress={() => handleDailyGoalChange(minutes)}
              >
                <Text
                  style={[
                    styles.goalButtonText,
                    preferences.dailyGoalMinutes === minutes &&
                      styles.goalButtonTextActive,
                  ]}
                >
                  {minutes}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <Animated.View
            key={section.title}
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) =>
              renderSettingItem(item, itemIndex)
            )}
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "400",
    color: "#FFFFFF",
    marginBottom: 4,
    lineHeight: 32,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 60,
  },
  goalCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    marginBottom: 32,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  goalSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.5)",
    marginBottom: 16,
  },
  goalButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  goalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    minWidth: 70,
    alignItems: "center",
  },
  goalButtonActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  goalButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  goalButtonTextActive: {
    color: "#000000",
    fontWeight: "600",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.6)",
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.5)",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000000",
  },
});
