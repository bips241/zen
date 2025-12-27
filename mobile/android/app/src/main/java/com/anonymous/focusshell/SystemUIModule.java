package com.anonymous.focusshell;

import android.app.Activity;
import android.os.Build;
import android.util.Log;
import android.view.View;
import android.view.ViewTreeObserver;
import android.view.WindowInsets;

import androidx.annotation.NonNull;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

/**
 * SystemUIModule - Dynamic System UI Monitoring
 * 
 * Monitors system navigation bar visibility changes and communicates
 * WindowInsets to React Native for dynamic layout adjustments.
 * 
 * Features:
 * - Real-time system UI visibility detection
 * - WindowInsets reporting (navigation bar, status bar, keyboard)
 * - Gesture navigation support
 * - Event-driven updates to React Native
 */
public class SystemUIModule extends ReactContextBaseJavaModule {
    private static final String TAG = "SystemUIModule";
    private static final String EVENT_SYSTEM_UI_CHANGED = "onSystemUIVisibilityChanged";
    private static final String EVENT_INSETS_CHANGED = "onWindowInsetsChanged";
    
    private final ReactApplicationContext reactContext;
    private ViewTreeObserver.OnGlobalLayoutListener layoutListener;
    private View.OnApplyWindowInsetsListener insetsListener;
    
    // Cache last known insets to detect changes
    private int lastNavBarHeight = 0;
    private int lastStatusBarHeight = 0;
    private boolean lastNavBarVisible = false;

    public SystemUIModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
        Log.d(TAG, "SystemUIModule initialized");
    }

    @NonNull
    @Override
    public String getName() {
        Log.d(TAG, "getName() called, returning: SystemUIModule");
        return "SystemUIModule";
    }

    /**
     * Required for NativeEventEmitter - remove all listeners
     */
    @ReactMethod
    public void removeListeners(Integer count) {
        // Required for NativeEventEmitter compatibility
        // Actual cleanup is handled in stopMonitoring()
        Log.d(TAG, "removeListeners called with count: " + count);
    }

    /**
     * Required for NativeEventEmitter - add a listener
     */
    @ReactMethod
    public void addListener(String eventName) {
        // Required for NativeEventEmitter compatibility
        // Actual listener setup is handled by startMonitoring()
        Log.d(TAG, "addListener called for event: " + eventName);
    }

    /**
     * Start monitoring system UI visibility changes
     * Sets up listeners for WindowInsets and layout changes
     */
    @ReactMethod
    public void startMonitoring(Promise promise) {
        try {
            Activity activity = getCurrentActivity();
            if (activity == null) {
                promise.reject("ERROR", "Activity not available");
                return;
            }

            activity.runOnUiThread(() -> {
                View rootView = activity.getWindow().getDecorView();
                
                // Set up WindowInsets listener (API 21+)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    setupWindowInsetsListener(rootView);
                }
                
                // Set up legacy system UI visibility listener (API < 30)
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
                    setupLegacyVisibilityListener(rootView);
                }
                
                // Request insets to be applied immediately
                ViewCompat.requestApplyInsets(rootView);
                
                // Initial report after a short delay to ensure insets are available
                rootView.postDelayed(() -> {
                    reportCurrentInsets();
                }, 100);
            });

            promise.resolve(true);
            Log.d(TAG, "System UI monitoring started");
        } catch (Exception e) {
            Log.e(TAG, "Error starting monitoring", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Stop monitoring system UI changes
     */
    @ReactMethod
    public void stopMonitoring(Promise promise) {
        try {
            Activity activity = getCurrentActivity();
            if (activity == null) {
                promise.resolve(true);
                return;
            }

            activity.runOnUiThread(() -> {
                View rootView = activity.getWindow().getDecorView();
                
                if (layoutListener != null) {
                    rootView.getViewTreeObserver().removeOnGlobalLayoutListener(layoutListener);
                    layoutListener = null;
                }
                
                if (insetsListener != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    rootView.setOnApplyWindowInsetsListener(null);
                    insetsListener = null;
                }
            });

            promise.resolve(true);
            Log.d(TAG, "System UI monitoring stopped");
        } catch (Exception e) {
            Log.e(TAG, "Error stopping monitoring", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Get current window insets immediately
     */
    @ReactMethod
    public void getCurrentInsets(Promise promise) {
        try {
            Activity activity = getCurrentActivity();
            if (activity == null) {
                promise.reject("ERROR", "Activity not available");
                return;
            }

            activity.runOnUiThread(() -> {
                WritableMap insets = getWindowInsets();
                promise.resolve(insets);
            });
        } catch (Exception e) {
            Log.e(TAG, "Error getting current insets", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Setup WindowInsets listener (Modern API)
     */
    private void setupWindowInsetsListener(View rootView) {
        ViewCompat.setOnApplyWindowInsetsListener(rootView, (v, insets) -> {
            // Get system bar insets
            Insets systemBarsInsets = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            Insets navBarInsets = insets.getInsets(WindowInsetsCompat.Type.navigationBars());
            Insets statusBarInsets = insets.getInsets(WindowInsetsCompat.Type.statusBars());
            Insets imeInsets = insets.getInsets(WindowInsetsCompat.Type.ime());
            
            int navBarHeight = navBarInsets.bottom;
            int statusBarHeight = statusBarInsets.top;
            boolean navBarVisible = navBarHeight > 0;
            boolean keyboardVisible = imeInsets.bottom > 0;
            
            Log.d(TAG, String.format("WindowInsets received - NavBar: %dpx, StatusBar: %dpx, IME: %dpx",
                navBarHeight, statusBarHeight, imeInsets.bottom));
            
            // Only send event if values changed
            if (navBarHeight != lastNavBarHeight || 
                statusBarHeight != lastStatusBarHeight || 
                navBarVisible != lastNavBarVisible) {
                
                lastNavBarHeight = navBarHeight;
                lastStatusBarHeight = statusBarHeight;
                lastNavBarVisible = navBarVisible;
                
                // Send full insets data
                reportCurrentInsets();
                
                Log.d(TAG, String.format("Insets changed - NavBar: %dpx, StatusBar: %dpx, Visible: %b",
                    navBarHeight, statusBarHeight, navBarVisible));
            }
            
            // Return insets to continue propagation
            return WindowInsetsCompat.CONSUMED;
        });
        
        // Request immediate application of insets
        ViewCompat.requestApplyInsets(rootView);
    }

    /**
     * Setup legacy system UI visibility listener (API < 30)
     */
    private void setupLegacyVisibilityListener(View rootView) {
        rootView.setOnSystemUiVisibilityChangeListener(visibility -> {
            boolean navBarVisible = (visibility & View.SYSTEM_UI_FLAG_HIDE_NAVIGATION) == 0;
            boolean statusBarVisible = (visibility & View.SYSTEM_UI_FLAG_FULLSCREEN) == 0;
            
            WritableMap event = Arguments.createMap();
            event.putBoolean("navigationBarVisible", navBarVisible);
            event.putBoolean("statusBarVisible", statusBarVisible);
            event.putInt("visibility", visibility);
            
            sendEvent(EVENT_SYSTEM_UI_CHANGED, event);
            
            Log.d(TAG, String.format("System UI visibility changed - NavBar: %b, StatusBar: %b",
                navBarVisible, statusBarVisible));
        });
    }

    /**
     * Get current WindowInsets as a map
     */
    private WritableMap getWindowInsets() {
        Activity activity = getCurrentActivity();
        if (activity == null) {
            return createEmptyInsets();
        }

        View rootView = activity.getWindow().getDecorView();
        WritableMap result = Arguments.createMap();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // API 30+ (Android 11+)
            WindowInsets insets = rootView.getRootWindowInsets();
            if (insets != null) {
                android.graphics.Insets navBar = insets.getInsets(WindowInsets.Type.navigationBars());
                android.graphics.Insets statusBar = insets.getInsets(WindowInsets.Type.statusBars());
                android.graphics.Insets systemBars = insets.getInsets(WindowInsets.Type.systemBars());
                android.graphics.Insets ime = insets.getInsets(WindowInsets.Type.ime());
                
                result.putInt("navBarBottom", navBar.bottom);
                result.putInt("navBarTop", navBar.top);
                result.putInt("navBarLeft", navBar.left);
                result.putInt("navBarRight", navBar.right);
                
                result.putInt("statusBarTop", statusBar.top);
                
                result.putInt("systemBarsBottom", systemBars.bottom);
                result.putInt("systemBarsTop", systemBars.top);
                
                result.putInt("keyboardHeight", ime.bottom);
                result.putBoolean("keyboardVisible", ime.bottom > 0);
                
                result.putBoolean("navBarVisible", navBar.bottom > 0);
                result.putBoolean("statusBarVisible", statusBar.top > 0);
            } else {
                return createEmptyInsets();
            }
        } else {
            // API < 30: Use AndroidX compat
            WindowInsetsCompat insets = ViewCompat.getRootWindowInsets(rootView);
            if (insets != null) {
                Insets navBar = insets.getInsets(WindowInsetsCompat.Type.navigationBars());
                Insets statusBar = insets.getInsets(WindowInsetsCompat.Type.statusBars());
                Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
                Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
                
                result.putInt("navBarBottom", navBar.bottom);
                result.putInt("navBarTop", navBar.top);
                result.putInt("navBarLeft", navBar.left);
                result.putInt("navBarRight", navBar.right);
                
                result.putInt("statusBarTop", statusBar.top);
                
                result.putInt("systemBarsBottom", systemBars.bottom);
                result.putInt("systemBarsTop", systemBars.top);
                
                result.putInt("keyboardHeight", ime.bottom);
                result.putBoolean("keyboardVisible", ime.bottom > 0);
                
                result.putBoolean("navBarVisible", navBar.bottom > 0);
                result.putBoolean("statusBarVisible", statusBar.top > 0);
            } else {
                return createEmptyInsets();
            }
        }

        return result;
    }

    /**
     * Create empty insets map (fallback)
     */
    private WritableMap createEmptyInsets() {
        WritableMap result = Arguments.createMap();
        result.putInt("navBarBottom", 0);
        result.putInt("navBarTop", 0);
        result.putInt("navBarLeft", 0);
        result.putInt("navBarRight", 0);
        result.putInt("statusBarTop", 0);
        result.putInt("systemBarsBottom", 0);
        result.putInt("systemBarsTop", 0);
        result.putInt("keyboardHeight", 0);
        result.putBoolean("keyboardVisible", false);
        result.putBoolean("navBarVisible", false);
        result.putBoolean("statusBarVisible", false);
        return result;
    }

    /**
     * Report current insets to React Native
     */
    private void reportCurrentInsets() {
        WritableMap insets = getWindowInsets();
        sendEvent(EVENT_INSETS_CHANGED, insets);
    }

    /**
     * Send insets changed event
     */
    private void sendInsetsChangedEvent(int navBarHeight, int statusBarHeight, boolean navBarVisible) {
        WritableMap event = Arguments.createMap();
        event.putInt("navBarHeight", navBarHeight);
        event.putInt("statusBarHeight", statusBarHeight);
        event.putBoolean("navBarVisible", navBarVisible);
        event.putDouble("timestamp", (double) System.currentTimeMillis());
        
        sendEvent(EVENT_INSETS_CHANGED, event);
    }

    /**
     * Send event to React Native
     */
    private void sendEvent(String eventName, WritableMap params) {
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
        }
    }
}
