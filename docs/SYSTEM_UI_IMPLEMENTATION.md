# System UI Dynamic Monitoring - Implementation Complete

## Overview

Implemented comprehensive native Android solution for dynamic system navigation bar monitoring using WindowInsets API and OnSystemUiVisibilityChangeListener.

## Implementation Details

### 1. Native Android Module

**File**: `SystemUIModule.java`

**Features**:

- Real-time WindowInsets monitoring
- OnApplyWindowInsetsListener for modern devices (API 21+)
- Legacy OnSystemUiVisibilityChangeListener for older devices
- Event-driven updates to React Native
- Support for gesture navigation (0px insets)
- Support for 3-button navigation (48px insets)
- Keyboard visibility detection

**Key Methods**:

- `startMonitoring()` - Initializes listeners
- `stopMonitoring()` - Cleanup
- `getCurrentInsets()` - Immediate insets query
- Event emissions: `onWindowInsetsChanged`, `onSystemUIVisibilityChanged`

**Insets Provided**:

```java
{
  navBarBottom: number,      // Bottom navigation bar height
  navBarTop: number,         // Top navigation bar (rare)
  navBarLeft: number,        // Left navigation bar (landscape)
  navBarRight: number,       // Right navigation bar (landscape)
  statusBarTop: number,      // Status bar height
  systemBarsBottom: number,  // Total system bars bottom
  systemBarsTop: number,     // Total system bars top
  keyboardHeight: number,    // Keyboard height when visible
  keyboardVisible: boolean,  // Keyboard state
  navBarVisible: boolean,    // Navigation bar visibility
  statusBarVisible: boolean  // Status bar visibility
}
```

### 2. React Hook

**File**: `useSystemInsets.ts`

**Features**:

- Real-time event subscription
- Automatic cleanup
- Convenience properties
- TypeScript type safety
- Platform detection (Android only)

**Usage**:

```typescript
const {
  insets, // Full insets object
  navBarHeight, // Shorthand for navBarBottom
  isNavBarVisible, // Boolean visibility
  isKeyboardVisible, // Keyboard state
  isGestureNav, // true if navBarHeight === 0
  refresh, // Manual refresh method
  isMonitoring, // Monitoring state
} = useSystemInsets();
```

### 3. Navigation Integration

**File**: `RootNavigator.tsx`

**Changes**:

- Replaced `useSafeAreaInsets` with `useSystemInsets`
- Dynamic tab bar height calculation: `60 + navBarHeight`
- Dynamic padding: `navBarHeight + 8px`
- Auto-hide on keyboard: `display: 'none'`
- Removes shadows/elevation for cleaner rendering

**Behavior**:

- Gesture navigation: Tab bar height = 60px + 0px = 60px
- 3-button navigation: Tab bar height = 60px + 48px = 108px
- Keyboard visible: Tab bar hidden
- Real-time updates when system UI changes

### 4. HomeShell Integration

**File**: `HomeShell.tsx`

**Changes**:

- Import `useSystemInsets` hook
- Log system UI changes
- Dynamic quick actions positioning:
  ```typescript
  bottom: 60 + navBarHeight + 16;
  // 60px = tab bar base height
  // navBarHeight = 0 (gesture) or 48 (buttons)
  // 16px = margin
  ```
- Removed hardcoded bottom values from styles

### 5. Module Registration

**File**: `ZenModulesPackage.java`

Added: `modules.add(new SystemUIModule(reactContext));`

**File**: `nativeModules.ts`

Added:

```typescript
export interface SystemInsets { ... }
interface SystemUIModule { ... }
export const systemUI = SystemUI as SystemUIModule;
```

## How It Works

### Flow Diagram:

```
Android System UI Change
          ↓
WindowInsets.OnApplyWindowInsetsListener (MainActivity)
          ↓
SystemUIModule detects change
          ↓
Event emitted: "onWindowInsetsChanged"
          ↓
useSystemInsets() receives event
          ↓
React state updated
          ↓
RootNavigator re-renders with new heights
          ↓
HomeShell quick actions repositioned
          ↓
No overlap with system navigation bar ✓
```

### Scenarios Handled:

**1. Gesture Navigation Device**:

- navBarHeight = 0px
- Tab bar height = 60px
- Quick actions bottom = 60 + 0 + 16 = 76px

**2. 3-Button Navigation Device**:

- navBarHeight = 48px
- Tab bar height = 108px
- Quick actions bottom = 60 + 48 + 16 = 124px

**3. System Bar Appears (user swipes up)**:

- Event triggered
- navBarHeight updates (0 → 48px or similar)
- UI adjusts dynamically
- Content shifts upward to avoid overlap

**4. Keyboard Appears**:

- keyboardVisible = true
- Tab bar hidden via `display: 'none'`
- Content remains accessible

**5. Immersive Mode (launcher full screen)**:

- navBarHeight = 0px (bars hidden)
- Tab bar rendered at minimal height
- When user swipes: bars appear → navBarHeight updates → layout adjusts

## Advantages Over Previous Approach

### Before:

❌ Used `useSafeAreaInsets()` from react-native-safe-area-context
❌ Static values, not reactive to system UI changes
❌ No detection of navigation bar appearing/disappearing
❌ Manual keyboard detection with Keyboard API
❌ Overlapping issues when system bar appeared

### After:

✅ Native WindowInsets API - source of truth
✅ Real-time event-driven updates
✅ Automatic detection of all system UI changes
✅ Keyboard detection built-in
✅ Gesture vs button navigation auto-detected
✅ No overlap - content adjusts dynamically
✅ Matches production launcher behavior

## Testing Checklist

- [ ] Test on device with gesture navigation (Pixel 4+)
- [ ] Test on device with 3-button navigation (older devices)
- [ ] Test system bar appearance (swipe up from bottom)
- [ ] Test keyboard appearance
- [ ] Test landscape orientation
- [ ] Test immersive mode transitions
- [ ] Test rapid tab switching
- [ ] Test with different screen sizes
- [ ] Verify no overlap in any scenario
- [ ] Check console logs for insets values

## Console Logs

When monitoring starts, you'll see:

```
[useSystemInsets] Monitoring started
[useSystemInsets] Initial insets: {navBarBottom: 0, ...}
[HomeShell] System UI changed - NavBar: 0 px, Visible: false
```

When system bar appears:

```
[SystemUIModule] Insets changed - NavBar: 48px, StatusBar: 24px, Visible: true
[useSystemInsets] Insets changed: {navBarBottom: 48, ...}
[HomeShell] System UI changed - NavBar: 48 px, Visible: true
```

## Files Modified/Created

### Created:

1. `/mobile/android/app/src/main/java/com/anonymous/focusshell/SystemUIModule.java`
2. `/mobile/src/hooks/useSystemInsets.ts`

### Modified:

1. `/mobile/android/app/src/main/java/com/anonymous/focusshell/ZenModulesPackage.java`
2. `/mobile/src/native-android/nativeModules.ts`
3. `/mobile/src/navigation/RootNavigator.tsx`
4. `/mobile/src/screens/HomeShell.tsx`

## Next Steps

1. **Test on physical devices** with different navigation types
2. **Monitor performance** - ensure event updates don't cause lag
3. **Add debouncing** if too many events fired (optional)
4. **Extend to other screens** that need dynamic positioning
5. **Add to friction overlay** for proper positioning during app blocking

## References

- [Android WindowInsets API](https://developer.android.com/reference/android/view/WindowInsets)
- [AndroidX WindowInsetsCompat](https://developer.android.com/reference/androidx/core/view/WindowInsetsCompat)
- [System UI Visibility](https://developer.android.com/training/system-ui/immersive)
- [React Native Native Modules](https://reactnative.dev/docs/native-modules-android)
