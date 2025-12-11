package com.anonymous.focusshell;

import android.content.ComponentName;
import android.content.Intent;
import android.provider.Settings;
import android.text.TextUtils;
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
 * NotificationModule - Control notification blocking
 * 
 * Provides:
 * - Enable/disable notification blocking
 * - Check notification listener permission
 * - Request notification listener permission
 * - Block notifications from specific apps
 */
public class NotificationModule extends ReactContextBaseJavaModule {
    private static final String TAG = "NotificationModule";
    private final ReactApplicationContext reactContext;

    public NotificationModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "ZenNotification";
    }

    /**
     * Enable notification blocking
     */
    @ReactMethod
    public void enableNotificationBlocking(Promise promise) {
        try {
            ZenNotificationListenerService.enable();
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putBoolean("enabled", true);
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error enabling notification blocking", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Disable notification blocking
     */
    @ReactMethod
    public void disableNotificationBlocking(Promise promise) {
        try {
            ZenNotificationListenerService.disable();
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putBoolean("enabled", false);
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error disabling notification blocking", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Block notifications from specific apps
     */
    @ReactMethod
    public void blockNotificationsFromApps(ReadableArray packageNames, Promise promise) {
        try {
            for (int i = 0; i < packageNames.size(); i++) {
                String packageName = packageNames.getString(i);
                if (packageName != null && !packageName.isEmpty()) {
                    ZenNotificationListenerService.addBlockedPackage(packageName);
                }
            }
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putInt("blockedCount", packageNames.size());
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error blocking notifications", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Unblock notifications from specific apps
     */
    @ReactMethod
    public void unblockNotificationsFromApps(ReadableArray packageNames, Promise promise) {
        try {
            for (int i = 0; i < packageNames.size(); i++) {
                String packageName = packageNames.getString(i);
                if (packageName != null) {
                    ZenNotificationListenerService.removeBlockedPackage(packageName);
                }
            }
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putInt("unblockedCount", packageNames.size());
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error unblocking notifications", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Clear all blocked notifications
     */
    @ReactMethod
    public void clearBlockedNotifications(Promise promise) {
        try {
            ZenNotificationListenerService.clearBlockedPackages();
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error clearing blocked notifications", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Check if notification listener permission is granted
     */
    @ReactMethod
    public void hasNotificationListenerPermission(Promise promise) {
        try {
            boolean hasPermission = isNotificationServiceEnabled();
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("hasPermission", hasPermission);
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error checking notification listener permission", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Request notification listener permission
     */
    @ReactMethod
    public void requestNotificationListenerPermission(Promise promise) {
        try {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putString("message", "Notification listener settings opened");
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error requesting notification listener permission", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Get notification blocking status
     */
    @ReactMethod
    public void isNotificationBlockingEnabled(Promise promise) {
        try {
            boolean isEnabled = ZenNotificationListenerService.isEnabled();
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("enabled", isEnabled);
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error getting notification blocking status", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Check if notification listener service is enabled
     */
    private boolean isNotificationServiceEnabled() {
        String pkgName = reactContext.getPackageName();
        final String flat = Settings.Secure.getString(
            reactContext.getContentResolver(),
            "enabled_notification_listeners"
        );
        
        if (!TextUtils.isEmpty(flat)) {
            final String[] names = flat.split(":");
            for (String name : names) {
                final ComponentName cn = ComponentName.unflattenFromString(name);
                if (cn != null) {
                    if (TextUtils.equals(pkgName, cn.getPackageName())) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
