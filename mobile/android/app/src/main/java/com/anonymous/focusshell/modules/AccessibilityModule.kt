package com.anonymous.focusshell.modules

import android.content.Context
import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.anonymous.focusshell.services.FocusAccessibilityService

/**
 * AccessibilityModule
 * 
 * Controls the FocusAccessibilityService for advanced app blocking.
 * Provides system-level enforcement stronger than usage stats monitoring.
 */
class AccessibilityModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "AccessibilityModule"

    /**
     * Check if accessibility service is enabled
     */
    @ReactMethod
    fun isAccessibilityServiceEnabled(promise: Promise) {
        try {
            promise.resolve(FocusAccessibilityService.isServiceEnabled)
        } catch (e: Exception) {
            promise.reject("CHECK_ERROR", "Failed to check accessibility service: ${e.message}", e)
        }
    }

    /**
     * Request accessibility service permission
     * Opens system settings for user to enable
     */
    @ReactMethod
    fun requestAccessibilityPermission(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("REQUEST_ERROR", "Failed to open accessibility settings: ${e.message}", e)
        }
    }

    /**
     * Set focus mode for accessibility service
     */
    @ReactMethod
    fun setFocusMode(enabled: Boolean, blockedPackages: ReadableArray, promise: Promise) {
        try {
            FocusAccessibilityService.isFocusModeActive = enabled
            
            // Update blocked packages
            FocusAccessibilityService.blockedPackages.clear()
            for (i in 0 until blockedPackages.size()) {
                blockedPackages.getString(i)?.let { pkg ->
                    FocusAccessibilityService.blockedPackages[pkg] = true
                }
            }
            
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SET_FOCUS_ERROR", "Failed to set focus mode: ${e.message}", e)
        }
    }

    /**
     * Check if focus mode is active
     */
    @ReactMethod
    fun isFocusModeActive(promise: Promise) {
        try {
            promise.resolve(FocusAccessibilityService.isFocusModeActive)
        } catch (e: Exception) {
            promise.reject("CHECK_FOCUS_ERROR", "Failed to check focus mode: ${e.message}", e)
        }
    }

    /**
     * Get list of blocked packages
     */
    @ReactMethod
    fun getBlockedPackages(promise: Promise) {
        try {
            val packages = com.facebook.react.bridge.WritableNativeArray()
            FocusAccessibilityService.blockedPackages.keys.forEach { pkg ->
                packages.pushString(pkg)
            }
            promise.resolve(packages)
        } catch (e: Exception) {
            promise.reject("GET_BLOCKED_ERROR", "Failed to get blocked packages: ${e.message}", e)
        }
    }
}
