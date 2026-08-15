# AI Agent Context: Fixing Bottom Nav/Dock Overlap with Android System Navigation Bar (Expo / React Native)

> Purpose: Feed this file directly to an AI coding agent (Claude Code, Cursor, etc.) as grounding context before it touches any bottom bar / dock / tab bar code in an Expo project. It explains *why* naive fixes fail and gives copy-pasteable correct implementations.

---

## 1. Problem Statement

On Android, a custom bottom bar/dock/tab bar visually overlaps or sits flush against the system navigation bar (gesture pill or 3-button bar), instead of leaving a safe gap above it.

**Symptom in practice:** icons/buttons at the bottom of the screen appear clipped, cramped against, or directly behind the system nav bar. This is worse in gesture-navigation mode (thin, translucent bar) than 3-button mode, and worse on Android 15+ devices.

## 2. Root Cause

Since **Android 15 (API 35)**, edge-to-edge rendering is **enforced by default** once an app's `targetSdk` is 35+. The app window draws full-bleed behind the status bar and navigation bar. If the app doesn't explicitly pad its bottom-most content by the current system nav bar height, that content renders underneath/behind it.

The nav bar height is **not a constant**:

| Mode | Approx. height |
|---|---|
| Gesture navigation | ~24–48px (varies by device/density) |
| 3-button navigation | ~48dp+ |
| No system bar (rare) | 0 |

A hardcoded `paddingBottom: 20` (or similar magic number) is the #1 root cause of AI-agent fixes failing — it doesn't track the actual, live, per-device inset value, and breaks the moment the user switches nav mode or the app runs on a different device.

## 3. The Correct Mental Model (applies to any stack)

1. Let the bar's **background** bleed edge-to-edge behind the system nav bar (visual continuity, no gray "dead zone" strip).
2. Pad only the **interactive/legible content** (icons, labels, buttons) by the **live inset value**, read at render time from the platform API — never a hardcoded constant.
3. Use the platform's official inset/safe-area API — don't reinvent it with `Dimensions` or device sniffing.

---

## 4. Expo / React Native Implementation (primary stack)

### 4.1 Required packages

```bash
npx expo install react-native-safe-area-context expo-navigation-bar expo-build-properties
```

### 4.2 `app.json` — enable edge-to-edge correctly

```json
{
  "expo": {
    "android": {
      "edgeToEdgeEnabled": true,
      "navigationBarColor": "#00000000",
      "predictiveBackGestureEnabled": true
    },
    "plugins": [
      ["expo-navigation-bar", { "position": "absolute" }],
      [
        "expo-build-properties",
        { "android": { "compileSdkVersion": 35, "targetSdkVersion": 35 } }
      ]
    ]
  }
}
```

After adding this to an already-prebuilt project, run:

```bash
npx expo prebuild --clean
```

(If you skip this, native Android files won't pick up the new config and the fix silently does nothing — a common false-negative agents hit.)

### 4.3 Wrap app root in `SafeAreaProvider` (once, at the top)

```tsx
// App.tsx
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <YourNavigator />
    </SafeAreaProvider>
  );
}
```

### 4.4 Custom bottom dock/bar — the actual fix

```tsx
// components/DockBar.tsx
import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

export function DockBar({ icons }: { icons: DockIcon[] }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.dockWrapper,
        { paddingBottom: insets.bottom + 8 }, // live inset, not a constant
      ]}
    >
      <BlurView intensity={40} tint="dark" style={styles.dock}>
        {icons.map((icon) => (
          <Pressable key={icon.id} onPress={icon.onPress} style={styles.iconBtn}>
            {icon.render()}
          </Pressable>
        ))}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  dockWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // NOTE: no paddingBottom here — it's applied dynamically above
  },
  dock: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 28,
    height: 56,
    overflow: 'hidden',
  },
  iconBtn: { padding: 12 },
});
```

**Rule for the agent:** `insets.bottom` is `0` pre-edge-to-edge, ~24px on gesture nav, ~48px on 3-button nav. Never override this with a fixed number "to make it look right on my device" — that's the exact bug being fixed.

### 4.5 Make the system nav bar transparent (removes the visible seam)

```tsx
// hooks/useTransparentNavBar.ts
import { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';

export function useTransparentNavBar() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    NavigationBar.setPositionAsync('absolute');
    NavigationBar.setBackgroundColorAsync('#00000000');
    NavigationBar.setButtonStyleAsync('light'); // or 'dark' depending on bg
  }, []);
}
```

Call once near the root: `useTransparentNavBar();` inside `App.tsx`.

### 4.6 If using `@react-navigation/bottom-tabs`

The built-in `BottomTabBar` already calls `useSafeAreaInsets()` internally and derives its height from it — do not override with a static `height`. If a custom `tabBar` render prop is used, replicate the same pattern:

```tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flexDirection: 'row', paddingBottom: insets.bottom, height: 56 + insets.bottom }}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            {descriptors[route.key].options.tabBarIcon?.({
              focused: isFocused,
              color: isFocused ? '#fff' : '#999',
              size: 24,
            })}
          </Pressable>
        );
      })}
    </View>
  );
}

<Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
  {/* screens */}
</Tab.Navigator>;
```

### 4.7 Scrollable content behind the dock (so the last item isn't hidden)

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function HomeContent() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: insets.bottom + 80 }} // 80 ≈ dock height
      showsVerticalScrollIndicator={false}
    >
      {/* content */}
    </ScrollView>
  );
}
```

---

## 5. Common Agent Mistakes to Avoid

| Mistake | Why it fails |
|---|---|
| `paddingBottom: 20` hardcoded | Doesn't track gesture vs 3-button nav or per-device inset height |
| Wrapping in `<SafeAreaView>` AND manually adding `insets.bottom` padding | Double-insets → huge empty gap, not overlap, but still wrong |
| Adding `edgeToEdgeEnabled: true` to `app.json` without re-running `expo prebuild --clean` | Native Android files never regenerate; fix has zero effect |
| Setting `systemNavigationBarColor` (old API) instead of using insets | Deprecated on Android 15+; controls color only, not layout/overlap |
| Testing only on an old Android Studio emulator image | Emulators before API 35 don't reproduce Android 15 edge-to-edge behavior; test on a real device or API 35 AVD |
| Applying insets to the whole screen instead of just the dock | Over-padding: e.g. content below status bar also gets pushed down unnecessarily |

---

## 6. Debug / Verification Checklist

```
1. Confirm targetSdk/compileSdk = 35 in app.json (via expo-build-properties) and re-run `expo prebuild --clean`.
2. Run on a physical Android 15+ device or an API 35 emulator image.
3. Settings → System → Gestures → toggle Gesture navigation vs 3-button navigation; re-check the dock in both.
4. console.log(useSafeAreaInsets()) at the dock component — confirm insets.bottom is non-zero on gesture/3-button devices.
5. Rotate to landscape — confirm side insets (left/right) are also respected if the dock spans full width.
6. Verify no double-insetting: only ONE place in the tree should add insets.bottom padding for the dock.
7. Confirm the dock's background still extends visually behind the system bar (no gray dead strip), while icons stay above it.
```

---

## 7. Reference Sources

- Expo Docs — Safe areas: https://docs.expo.dev/develop/user-interface/safe-areas/
- Expo Docs — System bars: https://docs.expo.dev/develop/user-interface/system-bars/
- Expo Docs — NavigationBar API: https://docs.expo.dev/versions/latest/sdk/navigation-bar/
- Expo Docs — react-native-safe-area-context: https://docs.expo.dev/versions/latest/sdk/safe-area-context/
- React Navigation — Supporting safe areas: https://reactnavigation.org/docs/handling-safe-area/
- React Native Community — Handling Android 15 edge-to-edge enforcement (discussion): https://github.com/react-native-community/discussions-and-proposals/discussions/827
- Android Developers — Display content edge-to-edge in views: https://developer.android.com/develop/ui/views/layout/edge-to-edge
- Android Developers — About window insets (Compose): https://developer.android.com/develop/ui/compose/system/insets
- Bluesky Social app (open source, Expo/React Native, MIT license) — real production example of `useSafeAreaInsets()` used in its bottom bar: https://github.com/bluesky-social/social-app
- 72Technologies — Android 15 Edge-to-Edge in React Native & Expo Fix Guide: https://www.72technologies.com/blog/android-15-edge-to-edge-react-native-expo

---

## 8. Minimal Instruction Summary (for agent prompt injection)

> When building or fixing any bottom bar/dock/tab bar in this Expo app:
> 1. Never hardcode bottom padding/margin values for system UI clearance.
> 2. Always use `useSafeAreaInsets()` from `react-native-safe-area-context` and apply `insets.bottom` dynamically.
> 3. Ensure `app.json` has `android.edgeToEdgeEnabled: true` and `targetSdkVersion: 35`; re-run `expo prebuild --clean` after changing it.
> 4. Let bar backgrounds bleed edge-to-edge; only pad the interactive content.
> 5. Test in both gesture-navigation and 3-button-navigation modes before considering the fix complete.
