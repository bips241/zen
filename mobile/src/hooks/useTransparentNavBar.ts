/**
 * useTransparentNavBar Hook
 *
 * Makes the Android system navigation bar fully transparent so the
 * app's dock background bleeds seamlessly behind the gesture zone.
 *
 * Called once in App.tsx root. Re-applies on app foreground to survive
 * screen locks and app switches which can reset nav bar color.
 *
 * This implements section 4.5 of expo-android-navbar-overlap-fix.md.
 */
import { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform, AppState, AppStateStatus } from 'react-native';

async function applyTransparentNavBar() {
  if (Platform.OS !== 'android') return;
  try {
    // position: 'absolute' makes the nav bar float over content (not push it up)
    await NavigationBar.setPositionAsync('absolute');
    // Fully transparent background — our dock background shows through
    await NavigationBar.setBackgroundColorAsync('#00000000');
    // Light buttons (white) for dark app backgrounds
    await NavigationBar.setButtonStyleAsync('light');
  } catch (e) {
    // Non-critical — fail silently, styles.xml provides the fallback
    console.warn('[useTransparentNavBar] Could not apply:', e);
  }
}

export function useTransparentNavBar() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    // Apply immediately on mount
    applyTransparentNavBar();

    // Re-apply every time the app comes to foreground.
    // Screen lock / app switch can reset the navigation bar color on some OEMs.
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        applyTransparentNavBar();
      }
    });

    return () => sub.remove();
  }, []);
}
