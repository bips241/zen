package com.anonymous.focusshell.modules

import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.anonymous.focusshell.services.FocusEnforcementService

/**
 * FocusEnforcementModule
 * 
 * React Native module to control the FocusEnforcementService.
 * Provides methods to start/stop focus session enforcement.
 */
class FocusEnforcementModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "FocusEnforcement"

    /**
     * Start focus session enforcement
     * 
     * Starts the foreground service that monitors and blocks apps
     * 
     * @param blockedApps Array of package names to block
     * @param goalMinutes Duration of focus session in minutes
     * @param promise Resolves with success status
     */
    @ReactMethod
    fun startEnforcement(blockedApps: ReadableArray, goalMinutes: Int, promise: Promise) {
        try {
            // Convert ReadableArray to ArrayList<String>
            val blockedPackages = ArrayList<String>()
            for (i in 0 until blockedApps.size()) {
                blockedApps.getString(i)?.let { blockedPackages.add(it) }
            }

            // Start the foreground service
            val intent = Intent(reactContext, FocusEnforcementService::class.java).apply {
                putStringArrayListExtra("blockedApps", blockedPackages)
                putExtra("goalMinutes", goalMinutes)
            }
            
            reactContext.startForegroundService(intent)
            
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("START_ENFORCEMENT_ERROR", "Failed to start enforcement: ${e.message}", e)
        }
    }

    /**
     * Stop focus session enforcement
     * 
     * Stops the foreground service and allows all apps
     * 
     * @param promise Resolves with success status
     */
    @ReactMethod
    fun stopEnforcement(promise: Promise) {
        try {
            val intent = Intent(reactContext, FocusEnforcementService::class.java)
            reactContext.stopService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STOP_ENFORCEMENT_ERROR", "Failed to stop enforcement: ${e.message}", e)
        }
    }

    /**
     * Check if enforcement is currently active
     * 
     * @param promise Resolves with true if service is running
     */
    @ReactMethod
    fun isEnforcementActive(promise: Promise) {
        try {
            promise.resolve(FocusEnforcementService.isEnforcementActive)
        } catch (e: Exception) {
            promise.reject("CHECK_ENFORCEMENT_ERROR", "Failed to check status: ${e.message}", e)
        }
    }

    /**
     * Get list of currently blocked packages
     * 
     * @param promise Resolves with array of package names
     */
    @ReactMethod
    fun getBlockedPackages(promise: Promise) {
        try {
            promise.resolve(FocusEnforcementService.blockedPackages.toList())
        } catch (e: Exception) {
            promise.reject("GET_BLOCKED_ERROR", "Failed to get blocked packages: ${e.message}", e)
        }
    }
}
