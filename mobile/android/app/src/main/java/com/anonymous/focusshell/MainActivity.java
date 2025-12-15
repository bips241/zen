package com.anonymous.focusshell;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;

import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

import expo.modules.ReactActivityDelegateWrapper;

public class MainActivity extends ReactActivity {
  private WindowInsetsControllerCompat windowInsetsController;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // Set the theme to AppTheme BEFORE onCreate to support 
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme);
    super.onCreate(null);
    
    // Enable edge-to-edge display
    Window window = getWindow();
    WindowCompat.setDecorFitsSystemWindows(window, false);
    
    // Get the WindowInsetsController
    windowInsetsController = WindowCompat.getInsetsController(window, window.getDecorView());
    
    // Configure behavior: transient bars that auto-hide after swipe
    if (windowInsetsController != null) {
      windowInsetsController.setSystemBarsBehavior(
        WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
      );
    }
    
    // Add listener to keep hiding system bars when they appear
    ViewCompat.setOnApplyWindowInsetsListener(window.getDecorView(), (view, windowInsets) -> {
      // Auto-hide system bars immediately when they become visible
      if (windowInsetsController != null) {
        if (windowInsets.isVisible(WindowInsetsCompat.Type.navigationBars())
            || windowInsets.isVisible(WindowInsetsCompat.Type.statusBars())) {
          view.postDelayed(() -> hideSystemUI(), 100);
        }
      }
      return ViewCompat.onApplyWindowInsets(view, windowInsets);
    });
    
    // Initial hide
    hideSystemUI();
  }

  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    if (hasFocus) {
      hideSystemUI();
    }
  }

  @Override
  protected void onResume() {
    super.onResume();
    hideSystemUI();
  }

  private void hideSystemUI() {
    if (windowInsetsController != null) {
      // Hide both status bar and navigation bar
      windowInsetsController.hide(WindowInsetsCompat.Type.systemBars());
    }
  }

  public void showSystemUI() {
    if (windowInsetsController != null) {
      // Show both status bar and navigation bar
      windowInsetsController.show(WindowInsetsCompat.Type.systemBars());
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
