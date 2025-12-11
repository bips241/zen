package com.anonymous.focusshell;

import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * UsageStatsModule - Track app usage statistics
 * 
 * Provides:
 * - Get app usage for today
 * - Get app usage for date range
 * - Get most used apps
 * - Get total screen time
 */
public class UsageStatsModule extends ReactContextBaseJavaModule {
    private static final String TAG = "UsageStatsModule";
    private final ReactApplicationContext reactContext;

    public UsageStatsModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "UsageStats";
    }

    /**
     * Get app usage stats for today
     */
    @ReactMethod
    public void getTodayUsage(Promise promise) {
        try {
            Calendar calendar = Calendar.getInstance();
            calendar.set(Calendar.HOUR_OF_DAY, 0);
            calendar.set(Calendar.MINUTE, 0);
            calendar.set(Calendar.SECOND, 0);
            calendar.set(Calendar.MILLISECOND, 0);
            
            long startTime = calendar.getTimeInMillis();
            long endTime = System.currentTimeMillis();
            
            getUsageStats(startTime, endTime, promise);
        } catch (Exception e) {
            Log.e(TAG, "Error getting today usage", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Get app usage stats for a date range
     */
    @ReactMethod
    public void getUsageInRange(double startTimeMs, double endTimeMs, Promise promise) {
        try {
            long startTime = (long) startTimeMs;
            long endTime = (long) endTimeMs;
            
            getUsageStats(startTime, endTime, promise);
        } catch (Exception e) {
            Log.e(TAG, "Error getting usage in range", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Get most used apps for today
     */
    @ReactMethod
    public void getMostUsedApps(int limit, Promise promise) {
        try {
            Calendar calendar = Calendar.getInstance();
            calendar.set(Calendar.HOUR_OF_DAY, 0);
            calendar.set(Calendar.MINUTE, 0);
            calendar.set(Calendar.SECOND, 0);
            calendar.set(Calendar.MILLISECOND, 0);
            
            long startTime = calendar.getTimeInMillis();
            long endTime = System.currentTimeMillis();
            
            UsageStatsManager usageStatsManager = (UsageStatsManager) reactContext
                .getSystemService(Context.USAGE_STATS_SERVICE);
            
            List<UsageStats> stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            );
            
            if (stats == null || stats.isEmpty()) {
                promise.reject("NO_PERMISSION", "Usage stats permission not granted");
                return;
            }
            
            // Sort by total time in foreground
            stats.sort((a, b) -> Long.compare(b.getTotalTimeInForeground(), a.getTotalTimeInForeground()));
            
            PackageManager pm = reactContext.getPackageManager();
            WritableArray result = Arguments.createArray();
            
            int count = 0;
            for (UsageStats stat : stats) {
                if (count >= limit) break;
                
                try {
                    String packageName = stat.getPackageName();
                    
                    // Skip system apps and our launcher
                    if (packageName.equals(reactContext.getPackageName())) continue;
                    if (packageName.startsWith("com.android.systemui")) continue;
                    
                    ApplicationInfo appInfo = pm.getApplicationInfo(packageName, 0);
                    if ((appInfo.flags & ApplicationInfo.FLAG_SYSTEM) != 0) continue;
                    
                    WritableMap appUsage = Arguments.createMap();
                    appUsage.putString("packageName", packageName);
                    appUsage.putString("appName", pm.getApplicationLabel(appInfo).toString());
                    appUsage.putDouble("totalTimeMs", stat.getTotalTimeInForeground());
                    appUsage.putDouble("totalTimeMinutes", stat.getTotalTimeInForeground() / 60000.0);
                    appUsage.putDouble("lastTimeUsed", stat.getLastTimeUsed());
                    
                    result.pushMap(appUsage);
                    count++;
                } catch (PackageManager.NameNotFoundException e) {
                    // App might be uninstalled, skip
                    Log.w(TAG, "App not found: " + stat.getPackageName());
                }
            }
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error getting most used apps", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Get total screen time for today in minutes
     */
    @ReactMethod
    public void getTotalScreenTime(Promise promise) {
        try {
            Calendar calendar = Calendar.getInstance();
            calendar.set(Calendar.HOUR_OF_DAY, 0);
            calendar.set(Calendar.MINUTE, 0);
            calendar.set(Calendar.SECOND, 0);
            calendar.set(Calendar.MILLISECOND, 0);
            
            long startTime = calendar.getTimeInMillis();
            long endTime = System.currentTimeMillis();
            
            UsageStatsManager usageStatsManager = (UsageStatsManager) reactContext
                .getSystemService(Context.USAGE_STATS_SERVICE);
            
            List<UsageStats> stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            );
            
            if (stats == null || stats.isEmpty()) {
                promise.reject("NO_PERMISSION", "Usage stats permission not granted");
                return;
            }
            
            long totalTimeMs = 0;
            for (UsageStats stat : stats) {
                totalTimeMs += stat.getTotalTimeInForeground();
            }
            
            WritableMap result = Arguments.createMap();
            result.putDouble("totalTimeMs", totalTimeMs);
            result.putDouble("totalTimeMinutes", totalTimeMs / 60000.0);
            result.putDouble("totalTimeHours", totalTimeMs / 3600000.0);
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error getting total screen time", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Get usage stats for a time range
     */
    private void getUsageStats(long startTime, long endTime, Promise promise) {
        try {
            UsageStatsManager usageStatsManager = (UsageStatsManager) reactContext
                .getSystemService(Context.USAGE_STATS_SERVICE);
            
            List<UsageStats> stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            );
            
            if (stats == null || stats.isEmpty()) {
                promise.reject("NO_PERMISSION", "Usage stats permission not granted");
                return;
            }
            
            PackageManager pm = reactContext.getPackageManager();
            WritableArray result = Arguments.createArray();
            
            for (UsageStats stat : stats) {
                try {
                    String packageName = stat.getPackageName();
                    
                    // Skip our launcher
                    if (packageName.equals(reactContext.getPackageName())) continue;
                    
                    ApplicationInfo appInfo = pm.getApplicationInfo(packageName, 0);
                    
                    WritableMap appUsage = Arguments.createMap();
                    appUsage.putString("packageName", packageName);
                    appUsage.putString("appName", pm.getApplicationLabel(appInfo).toString());
                    appUsage.putDouble("totalTimeMs", stat.getTotalTimeInForeground());
                    appUsage.putDouble("totalTimeMinutes", stat.getTotalTimeInForeground() / 60000.0);
                    appUsage.putDouble("firstTimeStamp", stat.getFirstTimeStamp());
                    appUsage.putDouble("lastTimeUsed", stat.getLastTimeUsed());
                    appUsage.putDouble("lastTimeVisible", stat.getLastTimeVisible());
                    appUsage.putBoolean("isSystemApp", (appInfo.flags & ApplicationInfo.FLAG_SYSTEM) != 0);
                    
                    result.pushMap(appUsage);
                } catch (PackageManager.NameNotFoundException e) {
                    // App might be uninstalled, skip
                    Log.w(TAG, "App not found: " + stat.getPackageName());
                }
            }
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error getting usage stats", e);
            promise.reject("ERROR", e.getMessage());
        }
    }
}
