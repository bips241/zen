package com.anonymous.focusshell.services

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.anonymous.focusshell.R
import com.anonymous.focusshell.MainActivity
import java.util.concurrent.ConcurrentHashMap

/**
 * Foreground Service for Focus Session Enforcement
 * 
 * Features:
 * - Monitors foreground app in real-time
 * - Redirects to home if blocked app is launched
 * - Shows persistent notification during focus session
 * - Tracks session time and unlock attempts
 */
class FocusEnforcementService : Service() {

    companion object {
        private const val TAG = "FocusEnforcementService"
        private const val CHANNEL_ID = "focus_session_channel"
        private const val NOTIFICATION_ID = 1001
        private const val CHECK_INTERVAL = 1000L // 1 second

        @JvmStatic
        val blockedPackages = ConcurrentHashMap.newKeySet<String>()
        @JvmStatic
        var isEnforcementActive = false
        private var sessionStartTime: Long = 0
        private var goalMinutes: Int = 0

        fun setBlockedApps(packages: List<String>) {
            blockedPackages.clear()
            blockedPackages.addAll(packages)
            Log.d(TAG, "Updated blocked apps: ${packages.size}")
        }

        fun isActive(): Boolean = isEnforcementActive
    }

    private var checkThread: Thread? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        Log.d(TAG, "Service created")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            "START_ENFORCEMENT" -> {
                goalMinutes = intent.getIntExtra("goalMinutes", 25)
                val blockedApps = intent.getStringArrayListExtra("blockedApps") ?: arrayListOf()
                startEnforcement(blockedApps)
            }
            "STOP_ENFORCEMENT" -> {
                stopEnforcement()
            }
        }
        return START_STICKY
    }

    private fun startEnforcement(blockedApps: List<String>) {
        isEnforcementActive = true
        sessionStartTime = System.currentTimeMillis()
        setBlockedApps(blockedApps)

        // Start foreground notification
        val notification = createNotification("Focus session active", "Stay focused!")
        startForeground(NOTIFICATION_ID, notification)

        // Start monitoring thread
        startMonitoring()

        Log.d(TAG, "Focus enforcement started with ${blockedApps.size} blocked apps")
    }

    private fun stopEnforcement() {
        isEnforcementActive = false
        stopMonitoring()
        stopForeground(true)
        stopSelf()
        Log.d(TAG, "Focus enforcement stopped")
    }

    private fun startMonitoring() {
        checkThread = Thread {
            while (isEnforcementActive) {
                try {
                    checkForegroundApp()
                    Thread.sleep(CHECK_INTERVAL)
                } catch (e: InterruptedException) {
                    break
                } catch (e: Exception) {
                    Log.e(TAG, "Error checking foreground app", e)
                }
            }
        }
        checkThread?.start()
    }

    private fun stopMonitoring() {
        checkThread?.interrupt()
        checkThread = null
    }

    private fun checkForegroundApp() {
        try {
            val foregroundApp = getForegroundApp()
            if (foregroundApp != null && blockedPackages.contains(foregroundApp)) {
                Log.d(TAG, "Blocked app detected: $foregroundApp")
                redirectToHome()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error checking foreground app", e)
        }
    }

    private fun getForegroundApp(): String? {
        return try {
            val activityManager = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                val runningTasks = activityManager.appTasks
                if (runningTasks.isNotEmpty()) {
                    runningTasks[0].taskInfo.baseActivity?.packageName
                } else {
                    null
                }
            } else {
                @Suppress("DEPRECATION")
                val runningTasks = activityManager.getRunningTasks(1)
                runningTasks.firstOrNull()?.topActivity?.packageName
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting foreground app", e)
            null
        }
    }

    private fun redirectToHome() {
        try {
            // Return user to launcher home screen
            val intent = Intent(this, MainActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            }
            startActivity(intent)

            // Update notification to show block message
            val notification = createNotification(
                "App blocked",
                "Stay focused on your goal!"
            )
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.notify(NOTIFICATION_ID, notification)
        } catch (e: Exception) {
            Log.e(TAG, "Error redirecting to home", e)
        }
    }

    private fun createNotification(title: String, text: String): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val elapsedMinutes = ((System.currentTimeMillis() - sessionStartTime) / 60000).toInt()
        val progressText = "$elapsedMinutes / $goalMinutes min"

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(text)
            .setSubText(progressText)
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock) // Replace with your icon
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Focus Sessions",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Ongoing focus session notifications"
                setShowBadge(false)
            }

            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        stopMonitoring()
        isEnforcementActive = false
        Log.d(TAG, "Service destroyed")
    }
}
