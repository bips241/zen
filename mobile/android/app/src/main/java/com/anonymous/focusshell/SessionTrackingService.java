package com.anonymous.focusshell;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

/**
 * SessionTrackingService - Foreground service for tracking focus sessions
 * 
 * Keeps the app alive during focus sessions to:
 * - Monitor app launches
 * - Block restricted apps
 * - Track session progress
 */
public class SessionTrackingService extends Service {
    private static final String TAG = "SessionTrackingService";
    private static final String CHANNEL_ID = "zen_session_channel";
    private static final int NOTIFICATION_ID = 1001;

    private boolean isSessionActive = false;
    private long sessionStartTime = 0;
    private int goalMinutes = 25;

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "Session Tracking Service created");
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            
            if ("START_SESSION".equals(action)) {
                goalMinutes = intent.getIntExtra("goalMinutes", 25);
                startSession();
            } else if ("STOP_SESSION".equals(action)) {
                stopSession();
            } else if ("UPDATE_PROGRESS".equals(action)) {
                int elapsedMinutes = intent.getIntExtra("elapsedMinutes", 0);
                updateNotification(elapsedMinutes);
            }
        }
        
        return START_STICKY;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "Session Tracking Service destroyed");
    }

    /**
     * Start focus session
     */
    private void startSession() {
        isSessionActive = true;
        sessionStartTime = System.currentTimeMillis();
        
        Notification notification = createNotification(0);
        startForeground(NOTIFICATION_ID, notification);
        
        Log.d(TAG, "Focus session started: " + goalMinutes + " minutes");
    }

    /**
     * Stop focus session
     */
    private void stopSession() {
        isSessionActive = false;
        stopForeground(true);
        stopSelf();
        
        Log.d(TAG, "Focus session stopped");
    }

    /**
     * Update notification with progress
     */
    private void updateNotification(int elapsedMinutes) {
        if (!isSessionActive) return;
        
        Notification notification = createNotification(elapsedMinutes);
        NotificationManager notificationManager = 
            (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        notificationManager.notify(NOTIFICATION_ID, notification);
    }

    /**
     * Create notification channel (Android O+)
     */
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Focus Session",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Ongoing focus session tracking");
            channel.setShowBadge(false);
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    /**
     * Create notification
     */
    private Notification createNotification(int elapsedMinutes) {
        Intent intent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_IMMUTABLE
        );

        int remainingMinutes = Math.max(0, goalMinutes - elapsedMinutes);
        String contentText = remainingMinutes > 0 
            ? remainingMinutes + " minutes remaining"
            : "Session completed!";
        
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("🎯 Focus Session Active")
            .setContentText(contentText)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setProgress(goalMinutes, elapsedMinutes, false)
            .build();
    }

    /**
     * Static helpers to start/stop service
     */
    public static void startSessionTracking(Service context, int goalMinutes) {
        Intent intent = new Intent(context, SessionTrackingService.class);
        intent.setAction("START_SESSION");
        intent.putExtra("goalMinutes", goalMinutes);
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent);
        } else {
            context.startService(intent);
        }
    }

    public static void stopSessionTracking(Service context) {
        Intent intent = new Intent(context, SessionTrackingService.class);
        intent.setAction("STOP_SESSION");
        context.startService(intent);
    }

    public static void updateSessionProgress(Service context, int elapsedMinutes) {
        Intent intent = new Intent(context, SessionTrackingService.class);
        intent.setAction("UPDATE_PROGRESS");
        intent.putExtra("elapsedMinutes", elapsedMinutes);
        context.startService(intent);
    }
}
