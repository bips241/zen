package com.anonymous.focusshell.modules

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.*

class ZenNotificationModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ZenNotification"
    }

    /**
     * Check if has notification listener permission
     */
    @ReactMethod
    fun hasNotificationListenerPermission(promise: Promise) {
        try {
            val hasPermission = isNotificationListenerEnabled()
            val result = WritableNativeMap()
            result.putBoolean("hasPermission", hasPermission)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check notification listener permission: ${e.message}")
        }
    }

    /**
     * Request notification listener permission
     */
    @ReactMethod
    fun requestNotificationListenerPermission(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactApplicationContext.startActivity(intent)

            val result = WritableNativeMap()
            result.putBoolean("success", true)
            result.putString("message", "Notification listener settings opened")
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to open notification listener settings: ${e.message}")
        }
    }

    /**
     * Check if notification blocking is enabled
     */
    @ReactMethod
    fun isNotificationBlockingEnabled(promise: Promise) {
        try {
            // For now, return false as we need to track this in SharedPreferences
            val result = WritableNativeMap()
            result.putBoolean("isEnabled", false)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check notification blocking status: ${e.message}")
        }
    }

    /**
     * Enable notification blocking
     */
    @ReactMethod
    fun enableNotificationBlocking(promise: Promise) {
        try {
            // Store in SharedPreferences
            val prefs = reactApplicationContext.getSharedPreferences(
                "ZenMobilePrefs",
                Context.MODE_PRIVATE
            )
            prefs.edit().putBoolean("notification_blocking_enabled", true).apply()

            val result = WritableNativeMap()
            result.putBoolean("success", true)
            result.putString("message", "Notification blocking enabled")
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to enable notification blocking: ${e.message}")
        }
    }

    /**
     * Disable notification blocking
     */
    @ReactMethod
    fun disableNotificationBlocking(promise: Promise) {
        try {
            val prefs = reactApplicationContext.getSharedPreferences(
                "ZenMobilePrefs",
                Context.MODE_PRIVATE
            )
            prefs.edit().putBoolean("notification_blocking_enabled", false).apply()

            val result = WritableNativeMap()
            result.putBoolean("success", true)
            result.putString("message", "Notification blocking disabled")
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to disable notification blocking: ${e.message}")
        }
    }

    /**
     * Get blocked apps for notifications
     */
    @ReactMethod
    fun getBlockedApps(promise: Promise) {
        try {
            val prefs = reactApplicationContext.getSharedPreferences(
                "ZenMobilePrefs",
                Context.MODE_PRIVATE
            )
            val blockedAppsJson = prefs.getString("blocked_notification_apps", "[]")
            
            val result = WritableNativeArray()
            // Parse JSON and add to result
            // For now, return empty array
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get blocked apps: ${e.message}")
        }
    }

    /**
     * Set blocked apps for notifications
     */
    @ReactMethod
    fun setBlockedApps(packageNames: ReadableArray, promise: Promise) {
        try {
            val prefs = reactApplicationContext.getSharedPreferences(
                "ZenMobilePrefs",
                Context.MODE_PRIVATE
            )
            
            // Convert to JSON and store
            val jsonArray = packageNames.toArrayList().toString()
            prefs.edit().putString("blocked_notification_apps", jsonArray).apply()

            val result = WritableNativeMap()
            result.putBoolean("success", true)
            result.putInt("count", packageNames.size())
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to set blocked apps: ${e.message}")
        }
    }

    /**
     * Check if notification listener service is enabled
     */
    private fun isNotificationListenerEnabled(): Boolean {
        val packageName = reactApplicationContext.packageName
        val flat = Settings.Secure.getString(
            reactApplicationContext.contentResolver,
            "enabled_notification_listeners"
        )
        
        if (flat.isNullOrEmpty()) return false
        
        val names = flat.split(":")
        return names.any { 
            val componentName = ComponentName.unflattenFromString(it)
            componentName?.packageName == packageName
        }
    }
}
