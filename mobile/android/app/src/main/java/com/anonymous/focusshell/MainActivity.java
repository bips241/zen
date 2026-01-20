package com.anonymous.focusshell;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

import expo.modules.ReactActivityDelegateWrapper;

public class MainActivity extends ReactActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // Set the theme to AppTheme BEFORE onCreate to support 
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme);
    
    // Enable AOD/Lock screen support for Pomodoro
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true);
      setTurnScreenOn(true);
    } else {
      Window window = getWindow();
      window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED);
      window.addFlags(WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
    }
    
    super.onCreate(null);
    
    // Enable edge-to-edge mode - app draws behind system bars
    setupEdgeToEdge();
    
    // Initial hide
    hideSystemBars();
  }

  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    // Critical: Re-hide whenever window gains focus
    // This handles screen on/off, app switch, etc.
    if (hasFocus) {
      hideSystemBars();
    }
  }

  @Override
  protected void onResume() {
    super.onResume();
    hideSystemBars();
  }

  @Override
  public void onBackPressed() {
    // Disable back button for launcher (allowed for launchers)
    // User must use gesture navigation or home button
    // Do nothing - no-op
  }

  /**
   * Setup edge-to-edge mode - allows app to draw behind system bars
   * This ensures content isn't overlapped when system bars appear
   */
  private void setupEdgeToEdge() {
    Window window = getWindow();
    
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      // API 30+ (Android 11+)
      window.setDecorFitsSystemWindows(false);
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      // API 21-29
      View decorView = window.getDecorView();
      decorView.setSystemUiVisibility(
        decorView.getSystemUiVisibility() 
        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
      );
    }
  }

  /**
   * Maximum enforcement system bar hiding for launcher
   * - Hides status bar and navigation bar
   * - Shows bars transiently only on edge swipe
   * - Bars auto-hide after brief delay
   */
  private void hideSystemBars() {
    Window window = getWindow();
    
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      // API 30+ (Android 11+): Use WindowInsetsController
      window.setDecorFitsSystemWindows(false);
      
      WindowInsetsController controller = window.getInsetsController();
      if (controller != null) {
        // Hide status bar and navigation bar
        controller.hide(
          WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars()
        );
        
        // CRITICAL: Show bars transiently only on edge swipe
        // BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE:
        // - Bars appear OVER content (transient, semi-transparent)
        // - Only triggered by swiping from screen edge
        // - Auto-hide after a few seconds
        // - Content doesn't resize/reflow when bars appear
        controller.setSystemBarsBehavior(
          WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        );
      }
    } else {
      // API < 30 (Android 10 and below): Use legacy flags
      View decorView = window.getDecorView();
      int flags = View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN;
      decorView.setSystemUiVisibility(flags);
    }
  }

  /**
   * Show system bars (called from React Native via native module)
   * Allows user to access system controls when needed
   */
  public void showSystemBars() {
    Window window = getWindow();
    
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      WindowInsetsController controller = window.getInsetsController();
      if (controller != null) {
        controller.show(
          WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars()
        );
      }
    } else {
      View decorView = window.getDecorView();
      decorView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript.
   * This is used to schedule rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "main";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new ReactActivityDelegateWrapper(this, BuildConfig.IS_NEW_ARCHITECTURE_ENABLED, new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled(), // fabricEnabled
        // If you opted-in for the New Architecture, we enable Concurrent React (i.e. React 18).
        DefaultNewArchitectureEntryPoint.getConcurrentReactEnabled() // concurrentRootEnabled
        ));
  }

  /**
   * Align the back button behavior with Android S
   * where moving root activities to background instead of finishing activities.
   * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
   */
  @Override
  public void invokeDefaultOnBackPressed() {
    if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
      if (!moveTaskToBack(false)) {
        // For non-root activities, use the default implementation to finish them.
        super.invokeDefaultOnBackPressed();
      }
      return;
    }

    // Use the default back button implementation on Android S
    // because it's doing more than {@link Activity#moveTaskToBack} in fact.
    super.invokeDefaultOnBackPressed();
  }
}
