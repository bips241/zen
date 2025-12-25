package com.anonymous.focusshell;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * OverlayService - Background service for friction moments
 * 
 * Monitors foreground apps and shows overlay when:
 * - User opens a blocked app
 * - User exceeds usage limit
 */
public class OverlayService extends Service {
    private static final String TAG = "OverlayService";
    private static final String CHANNEL_ID = "zen_overlay_service";
    private static final int NOTIFICATION_ID = 3;
    private static final int CHECK_INTERVAL = 1000; // 1 second
    
    private static boolean isRunning = false;
    private static int frictionDelaySeconds = 5;
    private static final Set<String> blockedApps = new HashSet<>();
    private static final Map<String, Integer> usageLimits = new HashMap<>(); // packageName -> minutes
    private static final Map<String, Long> todayUsage = new HashMap<>(); // packageName -> ms
    
    private static FrictionOverlayWindow overlayWindow;
    
    private Handler handler;
    private Runnable checkAppRunnable;
    private String lastForegroundApp = "";
    private long lastCheckTime = 0;

    public static boolean isServiceRunning() {
        return isRunning;
    }

    public static void setFrictionDelay(int seconds) {
        frictionDelaySeconds = seconds;
        Log.d(TAG, "Friction delay set to " + seconds + " seconds");
    }

    public static void addBlockedApp(String packageName) {
        blockedApps.add(packageName);
        Log.d(TAG, "Added blocked app: " + packageName);
    }

    public static void clearBlockedApps() {
        blockedApps.clear();
        Log.d(TAG, "Cleared all blocked apps");
    }

    public static void setUsageLimit(String packageName, int limitMinutes) {
        usageLimits.put(packageName, limitMinutes);
        Log.d(TAG, "Set usage limit for " + packageName + ": " + limitMinutes + " minutes");
    }

    public static int getCurrentUsage(String packageName) {
        Long usageMs = todayUsage.get(packageName);
        if (usageMs == null) return 0;
        return (int) (usageMs / 60000); // Convert ms to minutes
    }

    public static void resetTodayUsage() {
        todayUsage.clear();
        Log.d(TAG, "Reset today's usage stats");
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "OverlayService created");
        
        overlayWindow = new FrictionOverlayWindow(this);
        
        handler = new Handler();
        checkAppRunnable = new Runnable() {
            @Override
            public void run() {
                checkForegroundApp();
                handler.postDelayed(this, CHECK_INTERVAL);
            }
        };
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && "ENABLE_FRICTION".equals(intent.getAction())) {
            startForegroundService();
            startMonitoring();
        }
        
        return START_STICKY;
    }

    private void startForegroundService() {
        createNotificationChannel();
        
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 
            0, 
            notificationIntent,
            PendingIntent.FLAG_IMMUTABLE
        );

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Zen Mobile - Friction Moments Active")
            .setContentText("Monitoring app usage")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build();

        startForeground(NOTIFICATION_ID, notification);
        isRunning = true;
        Log.d(TAG, "Started foreground service");
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Friction Moments Service",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Background service for app monitoring");
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private void startMonitoring() {
        handler.post(checkAppRunnable);
        Log.d(TAG, "Started monitoring foreground apps");
    }

    private void checkForegroundApp() {
        try {
            String currentApp = getCurrentForegroundApp();
            
            if (currentApp != null && !currentApp.isEmpty() && !currentApp.equals(lastForegroundApp)) {
                Log.d(TAG, "Foreground app changed to: " + currentApp);
                
                // Update usage stats
                updateUsageStats(currentApp);
                
                // Check if app should trigger friction
                if (shouldShowFriction(currentApp)) {
                    showFrictionOverlay(currentApp);
                }
                
                lastForegroundApp = currentApp;
            }
        } catch (Exception e) {
            Log.e(TAG, "Error checking foreground app", e);
        }
    }

    private String getCurrentForegroundApp() {
        try {
            UsageStatsManager usageStatsManager = (UsageStatsManager) getSystemService(Context.USAGE_STATS_SERVICE);
            long currentTime = System.currentTimeMillis();
            
            List<UsageStats> stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                currentTime - 1000 * 5, // Last 5 seconds
                currentTime
            );
            
            if (stats != null && !stats.isEmpty()) {
                UsageStats mostRecent = null;
                for (UsageStats usageStat : stats) {
                    if (mostRecent == null || 
                        usageStat.getLastTimeUsed() > mostRecent.getLastTimeUsed()) {
                        mostRecent = usageStat;
                    }
                }
                
                if (mostRecent != null) {
                    return mostRecent.getPackageName();
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting foreground app", e);
        }
        
        return null;
    }

    private void updateUsageStats(String packageName) {
        long currentTime = System.currentTimeMillis();
        
        if (lastCheckTime > 0 && !lastForegroundApp.isEmpty()) {
            long sessionTime = currentTime - lastCheckTime;
            Long currentUsage = todayUsage.get(lastForegroundApp);
            todayUsage.put(lastForegroundApp, 
                (currentUsage != null ? currentUsage : 0) + sessionTime);
        }
        
        lastCheckTime = currentTime;
    }

    private boolean shouldShowFriction(String packageName) {
        // Skip Zen Mobile itself
        if (packageName.equals(getPackageName())) {
            return false;
        }
        
        // Check if app is in blocked list
        if (blockedApps.contains(packageName)) {
            Log.d(TAG, "App is blocked: " + packageName);
            return true;
        }
        
        // Check if usage limit exceeded
        Integer limit = usageLimits.get(packageName);
        if (limit != null) {
            int currentUsage = getCurrentUsage(packageName);
            if (currentUsage >= limit) {
                Log.d(TAG, "Usage limit exceeded for: " + packageName);
                return true;
            }
        }
        
        return false;
    }

    private void showFrictionOverlay(String packageName) {
        try {
            // Don't show if already showing
            if (overlayWindow != null && overlayWindow.isShowing()) {
                Log.d(TAG, "Overlay already showing, skipping");
                return;
            }
            
            // Get app name
            PackageManager pm = getPackageManager();
            String appName = packageName;
            try {
                ApplicationInfo appInfo = pm.getApplicationInfo(packageName, 0);
                appName = pm.getApplicationLabel(appInfo).toString();
            } catch (Exception e) {
                Log.w(TAG, "Could not get app name for: " + packageName);
            }
            
            // Show overlay window
            if (overlayWindow != null) {
                overlayWindow.show(appName, frictionDelaySeconds);
                Log.d(TAG, "Showing friction overlay for: " + appName);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error showing friction overlay", e);
        }
    }
    
    public static void bringLauncherToForeground() {
        // Helper method to go back to home
        Intent intent = new Intent(Intent.ACTION_MAIN);
        intent.addCategory(Intent.CATEGORY_HOME);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        // Start home intent from application context
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        
        if (handler != null && checkAppRunnable != null) {
            handler.removeCallbacks(checkAppRunnable);
        }
        
        // Dismiss and cleanup overlay window
        if (overlayWindow != null) {
            overlayWindow.dismiss();
            overlayWindow = null;
        }
        
        isRunning = false;
        Log.d(TAG, "OverlayService destroyed");
    }

    public static void bringLauncherToForeground(Context context) {
        try {
            Intent intent = new Intent(Intent.ACTION_MAIN);
            intent.addCategory(Intent.CATEGORY_HOME);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
            Log.d(TAG, "Bringing launcher to foreground");
        } catch (Exception e) {
            Log.e(TAG, "Error bringing launcher to foreground", e);
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
