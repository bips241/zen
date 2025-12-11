package com.anonymous.focusshell;

import android.content.Intent;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashSet;
import java.util.Set;

/**
 * ZenNotificationListenerService - Intercept and block notifications during focus sessions
 */
public class ZenNotificationListenerService extends NotificationListenerService {
    private static final String TAG = "ZenNotificationListener";
    private static boolean isEnabled = false;
    private static final Set<String> blockedPackages = new HashSet<>();

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "Notification Listener Service created");
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        String packageName = sbn.getPackageName();
        
        Log.d(TAG, "Notification posted from: " + packageName);
        
        // If notifications are blocked and this package is in the block list, cancel it
        if (isEnabled && blockedPackages.contains(packageName)) {
            Log.d(TAG, "Blocking notification from: " + packageName);
            cancelNotification(sbn.getKey());
        }
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        // Handle notification removal if needed
    }

    @Override
    public void onListenerConnected() {
        super.onListenerConnected();
        Log.d(TAG, "Notification Listener connected");
    }

    @Override
    public void onListenerDisconnected() {
        super.onListenerDisconnected();
        Log.d(TAG, "Notification Listener disconnected");
    }

    /**
     * Enable notification blocking
     */
    public static void enable() {
        isEnabled = true;
        Log.d(TAG, "Notification blocking enabled");
    }

    /**
     * Disable notification blocking
     */
    public static void disable() {
        isEnabled = false;
        Log.d(TAG, "Notification blocking disabled");
    }

    /**
     * Add package to block list
     */
    public static void addBlockedPackage(String packageName) {
        blockedPackages.add(packageName);
        Log.d(TAG, "Added to notification block list: " + packageName);
    }

    /**
     * Remove package from block list
     */
    public static void removeBlockedPackage(String packageName) {
        blockedPackages.remove(packageName);
        Log.d(TAG, "Removed from notification block list: " + packageName);
    }

    /**
     * Clear all blocked packages
     */
    public static void clearBlockedPackages() {
        blockedPackages.clear();
        Log.d(TAG, "Cleared notification block list");
    }

    /**
     * Check if enabled
     */
    public static boolean isEnabled() {
        return isEnabled;
    }
}
