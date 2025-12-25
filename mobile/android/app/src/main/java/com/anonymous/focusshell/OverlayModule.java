package com.anonymous.focusshell;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;

/**
 * OverlayModule - System overlay and friction moments
 * 
 * Provides:
 * - Show/hide system overlay
 * - Check overlay permission
 * - Request overlay permission
 * - Configure friction settings
 * - Monitor app launches
 */
public class OverlayModule extends ReactContextBaseJavaModule {
    private static final String TAG = "OverlayModule";
    private final ReactApplicationContext reactContext;

    public OverlayModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "ZenOverlay";
    }

    /**
     * Check if app has overlay permission
     */
    @ReactMethod
    public void hasOverlayPermission(Promise promise) {
        try {
            boolean hasPermission = false;
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                hasPermission = Settings.canDrawOverlays(reactContext);
            } else {
                // Permission granted by default on older Android versions
                hasPermission = true;
            }
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("hasPermission", hasPermission);
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error checking overlay permission", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Request overlay permission
     */
    @ReactMethod
    public void requestOverlayPermission(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Intent intent = new Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + reactContext.getPackageName())
                );
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", true);
                result.putString("message", "Overlay permission settings opened");
                
                promise.resolve(result);
            } else {
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", true);
                result.putString("message", "Overlay permission granted by default");
                
                promise.resolve(result);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error requesting overlay permission", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Enable friction moments (overlay service)
     */
    @ReactMethod
    public void enableFrictionMoments(Promise promise) {
        try {
            // Start the overlay service
            Intent serviceIntent = new Intent(reactContext, OverlayService.class);
            serviceIntent.setAction("ENABLE_FRICTION");
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(serviceIntent);
            } else {
                reactContext.startService(serviceIntent);
            }
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putBoolean("enabled", true);
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error enabling friction moments", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Disable friction moments
     */
    @ReactMethod
    public void disableFrictionMoments(Promise promise) {
        try {
            // Stop the overlay service
            Intent serviceIntent = new Intent(reactContext, OverlayService.class);
            reactContext.stopService(serviceIntent);
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putBoolean("enabled", false);
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error disabling friction moments", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Check if friction moments are enabled
     */
    @ReactMethod
    public void isFrictionEnabled(Promise promise) {
        try {
            boolean isEnabled = OverlayService.isServiceRunning();
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("enabled", isEnabled);
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error checking friction status", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Configure friction settings
     */
    @ReactMethod
    public void configureFriction(int delaySeconds, ReadableArray blockedApps, Promise promise) {
        try {
            OverlayService.setFrictionDelay(delaySeconds);
            
            // Clear and set blocked apps
            OverlayService.clearBlockedApps();
            for (int i = 0; i < blockedApps.size(); i++) {
                String packageName = blockedApps.getString(i);
                if (packageName != null && !packageName.isEmpty()) {
                    OverlayService.addBlockedApp(packageName);
                }
            }
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putInt("delaySeconds", delaySeconds);
            result.putInt("blockedAppsCount", blockedApps.size());
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error configuring friction", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Set usage limit for specific apps
     */
    @ReactMethod
    public void setUsageLimit(String packageName, int limitMinutes, Promise promise) {
        try {
            OverlayService.setUsageLimit(packageName, limitMinutes);
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putString("packageName", packageName);
            result.putInt("limitMinutes", limitMinutes);
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error setting usage limit", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Get current usage for an app today
     */
    @ReactMethod
    public void getCurrentUsage(String packageName, Promise promise) {
        try {
            int usageMinutes = OverlayService.getCurrentUsage(packageName);
            
            WritableMap result = Arguments.createMap();
            result.putInt("usageMinutes", usageMinutes);
            result.putString("packageName", packageName);
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error getting current usage", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Reset usage stats for today
     */
    @ReactMethod
    public void resetTodayUsage(Promise promise) {
        try {
            OverlayService.resetTodayUsage();
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error resetting usage", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Check if there's a pending friction trigger
     * Returns the app that triggered friction if any
     */
    @ReactMethod
    public void getPendingFrictionTrigger(Promise promise) {
        try {
            android.content.SharedPreferences prefs = reactContext
                .getSharedPreferences("ZenFriction", reactContext.MODE_PRIVATE);
            
            String packageName = prefs.getString("triggeredApp", null);
            long triggerTime = prefs.getLong("triggerTime", 0);
            
            // Clear the trigger after reading
            if (packageName != null) {
                prefs.edit().clear().apply();
                
                WritableMap result = Arguments.createMap();
                result.putBoolean("hasTrigger", true);
                result.putString("packageName", packageName);
                result.putInt("delaySeconds", prefs.getInt("delaySeconds", 5));
                result.putDouble("triggerTime", (double) triggerTime);
                
                promise.resolve(result);
                return;
            }
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("hasTrigger", false);
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error getting pending trigger", e);
            promise.reject("ERROR", e.getMessage());
        }
    }}