package com.anonymous.focusshell.modules

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import com.anonymous.focusshell.services.FocusNotificationListenerService

/**
 * FocusNotificationModule
 * 
 * React Native module to control the FocusNotificationListenerService.
 * Provides methods to manage notification filtering during focus mode.
 */
class FocusNotificationModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "FocusNotification"

    /**
     * Set focus mode for notification filtering
     * 
     * When enabled, notifications from specified packages will be suppressed
     * 
     * @param enabled Whether focus mode is active
     * @param suppressedPackages Array of package names to suppress
     * @param promise Resolves with success status
     */
    @ReactMethod
    fun setFocusMode(enabled: Boolean, suppressedPackages: ReadableArray, promise: Promise) {
        try {
            FocusNotificationListenerService.isFocusModeActive = enabled
            
            // Update suppressed packages
            FocusNotificationListenerService.suppressedPackages.clear()
            for (i in 0 until suppressedPackages.size()) {
                suppressedPackages.getString(i)?.let { pkg ->
                    FocusNotificationListenerService.suppressedPackages.add(pkg)
                }
            }
            
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SET_FOCUS_MODE_ERROR", "Failed to set focus mode: ${e.message}", e)
        }
    }

    /**
     * Check if focus mode is currently active
     * 
     * @param promise Resolves with true if focus mode is on
     */
    @ReactMethod
    fun isFocusModeActive(promise: Promise) {
        try {
            promise.resolve(FocusNotificationListenerService.isFocusModeActive)
        } catch (e: Exception) {
            promise.reject("CHECK_FOCUS_MODE_ERROR", "Failed to check focus mode: ${e.message}", e)
        }
    }

    /**
     * Get list of suppressed notifications
     * 
     * Returns all notifications that were blocked during focus session
     * 
     * @param promise Resolves with array of notification info objects
     */
    @ReactMethod
    fun getSuppressedNotifications(promise: Promise) {
        try {
            val result = WritableNativeArray()
            
            FocusNotificationListenerService.getSuppressedNotifications().forEach { notif ->
                val map = WritableNativeMap().apply {
                    putString("packageName", notif.packageName)
                    putString("appName", notif.appName)
                    putString("title", notif.title)
                    putString("text", notif.text)
                    putDouble("timestamp", notif.timestamp.toDouble())
                }
                result.pushMap(map)
            }
            
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("GET_SUPPRESSED_ERROR", "Failed to get suppressed notifications: ${e.message}", e)
        }
    }

    /**
     * Clear suppressed notifications history
     * 
     * @param promise Resolves with success status
     */
    @ReactMethod
    fun clearSuppressedNotifications(promise: Promise) {
        try {
            FocusNotificationListenerService.clearSuppressedNotifications()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CLEAR_SUPPRESSED_ERROR", "Failed to clear suppressed notifications: ${e.message}", e)
        }
    }

    /**
     * Get count of suppressed notifications
     * 
     * @param promise Resolves with count number
     */
    @ReactMethod
    fun getSuppressedCount(promise: Promise) {
        try {
            promise.resolve(FocusNotificationListenerService.getSuppressedNotifications().size)
        } catch (e: Exception) {
            promise.reject("GET_COUNT_ERROR", "Failed to get suppressed count: ${e.message}", e)
        }
    }
}
