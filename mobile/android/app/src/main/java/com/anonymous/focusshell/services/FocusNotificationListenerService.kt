package com.anonymous.focusshell.services

import android.app.Notification
import android.content.Intent
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.concurrent.ConcurrentHashMap

/**
 * Notification Listener Service for Focus Mode
 * 
 * Capabilities:
 * - Intercepts all incoming notifications
 * - Filters based on app package and focus mode status
 * - Suppresses distracting notifications during focus sessions
 * - Stores suppressed notifications for later summary delivery
 * - Emits events to React Native for UI updates
 */
class FocusNotificationListenerService : NotificationListenerService() {

    companion object {
        private const val TAG = "FocusNotifService"
        @JvmStatic
        val suppressedPackages = ConcurrentHashMap.newKeySet<String>()
        private val suppressedNotifications = mutableListOf<NotificationInfo>()
        @JvmStatic
        var isFocusModeActive = false
        private var reactContext: ReactApplicationContext? = null

        fun setReactContext(context: ReactApplicationContext?) {
            reactContext = context
        }

        fun setFocusMode(active: Boolean) {
            isFocusModeActive = active
            Log.d(TAG, "Focus mode: $active")
        }

        fun setSuppressedApps(packages: List<String>) {
            suppressedPackages.clear()
            suppressedPackages.addAll(packages)
            Log.d(TAG, "Suppressing ${packages.size} apps")
        }

        @JvmStatic
        fun getSuppressedNotifications(): List<NotificationInfo> {
            return suppressedNotifications.toList()
        }

        @JvmStatic
        fun clearSuppressedNotifications() {
            suppressedNotifications.clear()
        }
        
        @JvmStatic
        fun addSuppressedNotification(info: NotificationInfo) {
            suppressedNotifications.add(info)
        }
    }

    data class NotificationInfo(
        val packageName: String,
        val appName: String,
        val title: String?,
        val text: String?,
        val timestamp: Long,
        val key: String
    )

    override fun onListenerConnected() {
        super.onListenerConnected()
        Log.d(TAG, "Notification Listener connected")
        emitEvent("onNotificationListenerConnected", null)
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        Log.d(TAG, "Notification Listener disconnected")
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        try {
            val packageName = sbn.packageName
            val notification = sbn.notification
            
            // Don't intercept our own notifications
            if (packageName == applicationContext.packageName) {
                return
            }

            // Check if we should suppress this notification
            if (isFocusModeActive && suppressedPackages.contains(packageName)) {
                Log.d(TAG, "Suppressing notification from $packageName")
                
                // Store for later summary
                val notifInfo = NotificationInfo(
                    packageName = packageName,
                    appName = getAppName(packageName),
                    title = notification.extras.getString(Notification.EXTRA_TITLE),
                    text = notification.extras.getString(Notification.EXTRA_TEXT),
                    timestamp = sbn.postTime,
                    key = sbn.key
                )
                addSuppressedNotification(notifInfo)
                
                // Cancel the notification to hide it from user
                cancelNotification(sbn.key)
                
                // Emit event to React Native
                val data = Arguments.createMap().apply {
                    putString("packageName", packageName)
                    putString("appName", notifInfo.appName)
                    putString("title", notifInfo.title)
                    putString("text", notifInfo.text)
                    putDouble("timestamp", notifInfo.timestamp.toDouble())
                }
                emitEvent("onNotificationSuppressed", data)
            } else {
                // Allow notification to show
                Log.d(TAG, "Allowing notification from $packageName")
                
                val data = Arguments.createMap().apply {
                    putString("packageName", packageName)
                    putString("appName", getAppName(packageName))
                }
                emitEvent("onNotificationAllowed", data)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error processing notification", e)
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {
        // Clean up if notification was removed
        suppressedNotifications.removeAll { it.key == sbn.key }
    }

    private fun getAppName(packageName: String): String {
        return try {
            val pm = applicationContext.packageManager
            val appInfo = pm.getApplicationInfo(packageName, 0)
            pm.getApplicationLabel(appInfo).toString()
        } catch (e: Exception) {
            packageName
        }
    }

    private fun emitEvent(eventName: String, data: WritableMap?) {
        reactContext?.let { context ->
            try {
                context
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(eventName, data)
            } catch (e: Exception) {
                Log.e(TAG, "Error emitting event $eventName", e)
            }
        }
    }
}
