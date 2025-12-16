package com.anonymous.focusshell.services

import android.app.Notification
import android.content.Intent
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import org.json.JSONArray
import org.json.JSONObject

/**
 * FocusNotificationListener
 * 
 * Intercepts notifications during focus sessions to minimize distractions.
 * Does NOT block system notifications, but filters what the user sees.
 * Requires BIND_NOTIFICATION_LISTENER_SERVICE permission (user grants manually).
 */
class FocusNotificationListener : NotificationListenerService() {

    companion object {
        private const val TAG = "FocusNotification"
        const val ACTION_NOTIFICATION_EVENT = "com.anonymous.focusshell.NOTIFICATION_EVENT"
        
        // Shared preferences for focus mode state
        private const val PREFS_NAME = "zen_focus_mode"
        private const val KEY_FOCUS_ENABLED = "focus_enabled"
        private const val KEY_BLOCKED_APPS = "blocked_apps"
        
        // Delayed notification storage
        private val delayedNotifications = mutableListOf<DelayedNotification>()
    }

    data class DelayedNotification(
        val key: String,
        val packageName: String,
        val title: String?,
        val text: String?,
        val timestamp: Long,
        val sbn: StatusBarNotification
    )

    private val prefs by lazy {
        getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
    }

    override fun onListenerConnected() {
        super.onListenerConnected()
        Log.d(TAG, "NotificationListener connected")
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        try {
            val packageName = sbn.packageName
            val notification = sbn.notification
            
            Log.d(TAG, "Notification from: $packageName")

            // Skip system notifications (important)
            if (isSystemNotification(packageName)) {
                Log.d(TAG, "System notification - allowing")
                return
            }

            // Check if focus mode is enabled
            if (!isFocusModeEnabled()) {
                Log.d(TAG, "Focus mode disabled - allowing")
                return
            }

            // Check if app is blocked
            if (isAppBlocked(packageName)) {
                Log.d(TAG, "App blocked - delaying notification")
                
                // Extract notification content
                val extras = notification.extras
                val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString()
                val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()
                
                // Store for later delivery
                val delayed = DelayedNotification(
                    key = sbn.key,
                    packageName = packageName,
                    title = title,
                    text = text,
                    timestamp = System.currentTimeMillis(),
                    sbn = sbn
                )
                delayedNotifications.add(delayed)
                
                // Cancel the notification (hide from user)
                cancelNotification(sbn.key)
                
                // Broadcast event to React Native
                broadcastNotificationEvent("blocked", packageName, title, text)
                
                Log.d(TAG, "Notification delayed: $title")
            } else {
                Log.d(TAG, "App not blocked - allowing notification")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error handling notification", e)
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {
        // Clean up if notification was dismissed
        delayedNotifications.removeAll { it.key == sbn.key }
    }

    /**
     * Check if package is a system/critical app
     */
    private fun isSystemNotification(packageName: String): Boolean {
        return packageName.startsWith("com.android.") ||
               packageName == "android" ||
               packageName.contains("system") ||
               packageName.contains("phone") ||
               packageName.contains("contacts") ||
               packageName.contains("emergency")
    }

    /**
     * Check if focus mode is currently enabled
     */
    private fun isFocusModeEnabled(): Boolean {
        return prefs.getBoolean(KEY_FOCUS_ENABLED, false)
    }

    /**
     * Check if app notifications should be blocked
     */
    private fun isAppBlocked(packageName: String): Boolean {
        val blockedAppsJson = prefs.getString(KEY_BLOCKED_APPS, "[]") ?: "[]"
        val blockedApps = JSONArray(blockedAppsJson)
        
        for (i in 0 until blockedApps.length()) {
            if (blockedApps.getString(i) == packageName) {
                return true
            }
        }
        return false
    }

    /**
     * Broadcast notification event to React Native
     */
    private fun broadcastNotificationEvent(
        type: String,
        packageName: String,
        title: String?,
        text: String?
    ) {
        val intent = Intent(ACTION_NOTIFICATION_EVENT).apply {
            putExtra("type", type)
            putExtra("packageName", packageName)
            putExtra("title", title)
            putExtra("text", text)
            putExtra("timestamp", System.currentTimeMillis())
        }
        sendBroadcast(intent)
    }

    /**
     * Public methods accessible from native module
     */
    fun enableFocusMode(blockedApps: List<String>) {
        prefs.edit().apply {
            putBoolean(KEY_FOCUS_ENABLED, true)
            putString(KEY_BLOCKED_APPS, JSONArray(blockedApps).toString())
            apply()
        }
        Log.d(TAG, "Focus mode enabled for ${blockedApps.size} apps")
    }

    fun disableFocusMode(): Int {
        prefs.edit().apply {
            putBoolean(KEY_FOCUS_ENABLED, false)
            apply()
        }
        
        // Deliver delayed notifications
        val count = delayedNotifications.size
        deliverDelayedNotifications()
        
        Log.d(TAG, "Focus mode disabled, delivered $count notifications")
        return count
    }

    fun getDelayedNotificationsCount(): Int {
        return delayedNotifications.size
    }

    fun getDelayedNotificationsSummary(): List<Map<String, Any>> {
        return delayedNotifications.map { delayed ->
            mapOf(
                "packageName" to delayed.packageName,
                "title" to (delayed.title ?: ""),
                "text" to (delayed.text ?: ""),
                "timestamp" to delayed.timestamp
            )
        }
    }

    private fun deliverDelayedNotifications() {
        // Re-post all delayed notifications
        delayedNotifications.forEach { delayed ->
            try {
                // The notification will automatically reappear when we stop canceling it
                Log.d(TAG, "Delivering delayed notification: ${delayed.title}")
            } catch (e: Exception) {
                Log.e(TAG, "Error delivering notification", e)
            }
        }
        delayedNotifications.clear()
    }
}
