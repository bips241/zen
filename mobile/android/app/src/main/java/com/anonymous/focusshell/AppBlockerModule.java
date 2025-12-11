package com.anonymous.focusshell;

import android.app.ActivityManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
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

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;

/**
 * AppBlockerModule - Block and track app usage
 * 
 * Provides:
 * - Block specific apps
 * - Unblock apps
 * - Check if app is blocked
 * - Get foreground app
 * - Request usage stats permission
 */
public class AppBlockerModule extends ReactContextBaseJavaModule {
    private static final String TAG = "AppBlockerModule";
    private final ReactApplicationContext reactContext;
    private final Set<String> blockedApps = new HashSet<>();

    public AppBlockerModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "AppBlocker";
    }

    /**
     * Block a list of apps
     */
    @ReactMethod
    public void blockApps(ReadableArray packageNames, Promise promise) {
        try {
            for (int i = 0; i < packageNames.size(); i++) {
                String packageName = packageNames.getString(i);
                if (packageName != null && !packageName.isEmpty()) {
                    blockedApps.add(packageName);
                    Log.d(TAG, "Blocked app: " + packageName);
                }
            }
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putInt("blockedCount", packageNames.size());
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error blocking apps", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Unblock a list of apps
     */
    @ReactMethod
    public void unblockApps(ReadableArray packageNames, Promise promise) {
        try {
            for (int i = 0; i < packageNames.size(); i++) {
                String packageName = packageNames.getString(i);
                if (packageName != null) {
                    blockedApps.remove(packageName);
                    Log.d(TAG, "Unblocked app: " + packageName);
                }
            }
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putInt("unblockedCount", packageNames.size());
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error unblocking apps", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Unblock all apps
     */
    @ReactMethod
    public void unblockAllApps(Promise promise) {
        try {
            int count = blockedApps.size();
            blockedApps.clear();
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putInt("unblockedCount", count);
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error unblocking all apps", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Check if an app is blocked
     */
    @ReactMethod
    public void isAppBlocked(String packageName, Promise promise) {
        try {
            boolean isBlocked = blockedApps.contains(packageName);
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("isBlocked", isBlocked);
            result.putString("packageName", packageName);
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error checking if app is blocked", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Get the currently foreground app
     */
    @ReactMethod
    public void getForegroundApp(Promise promise) {
        try {
            String foregroundApp = getCurrentForegroundApp();
            
            WritableMap result = Arguments.createMap();
            result.putString("packageName", foregroundApp != null ? foregroundApp : "");
            result.putBoolean("isBlocked", foregroundApp != null && blockedApps.contains(foregroundApp));
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error getting foreground app", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Check if app has usage stats permission
     */
    @ReactMethod
    public void hasUsageStatsPermission(Promise promise) {
        try {
            UsageStatsManager usageStatsManager = (UsageStatsManager) reactContext
                .getSystemService(Context.USAGE_STATS_SERVICE);
            
            long currentTime = System.currentTimeMillis();
            List<UsageStats> stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                currentTime - 1000 * 60,
                currentTime
            );
            
            boolean hasPermission = stats != null && !stats.isEmpty();
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("hasPermission", hasPermission);
            
            promise.resolve(result);
        } catch (Exception e) {
            WritableMap result = Arguments.createMap();
            result.putBoolean("hasPermission", false);
            promise.resolve(result);
        }
    }

    /**
     * Request usage stats permission
     */
    @ReactMethod
    public void requestUsageStatsPermission(Promise promise) {
        try {
            Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putString("message", "Usage stats settings opened");
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error requesting usage stats permission", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Bring Zen Mobile launcher to foreground (to block app)
     */
    @ReactMethod
    public void bringLauncherToForeground(Promise promise) {
        try {
            Intent intent = reactContext.getPackageManager()
                .getLaunchIntentForPackage(reactContext.getPackageName());
            
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                reactContext.startActivity(intent);
                
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", true);
                
                promise.resolve(result);
            } else {
                promise.reject("ERROR", "Could not create launcher intent");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error bringing launcher to foreground", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Get current foreground app package name
     */
    private String getCurrentForegroundApp() {
        try {
            UsageStatsManager usageStatsManager = (UsageStatsManager) reactContext
                .getSystemService(Context.USAGE_STATS_SERVICE);
            
            long currentTime = System.currentTimeMillis();
            
            // Query usage stats for last 1 minute
            List<UsageStats> stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                currentTime - 1000 * 60,
                currentTime
            );
            
            if (stats != null && !stats.isEmpty()) {
                SortedMap<Long, UsageStats> sortedStats = new TreeMap<>();
                for (UsageStats usageStats : stats) {
                    sortedStats.put(usageStats.getLastTimeUsed(), usageStats);
                }
                
                if (!sortedStats.isEmpty()) {
                    return sortedStats.get(sortedStats.lastKey()).getPackageName();
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Error getting foreground app", e);
        }
        
        return null;
    }

    /**
     * Check if blocked app is being launched and intercept
     */
    public boolean shouldBlockApp(String packageName) {
        return blockedApps.contains(packageName);
    }
}
