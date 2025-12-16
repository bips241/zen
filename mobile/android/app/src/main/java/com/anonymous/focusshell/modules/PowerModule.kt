package com.anonymous.focusshell.modules

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.BatteryManager
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeMap

/**
 * PowerModule
 * 
 * Provides battery and power management functionality:
 * - Battery level and charging status
 * - Battery optimization exemption management
 * - Power saving mode detection
 * - Doze mode status
 */
class PowerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "PowerModule"

    /**
     * Get current battery information
     */
    @ReactMethod
    fun getBatteryInfo(promise: Promise) {
        try {
            val batteryManager = reactContext.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
            
            val level = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
            val isCharging = batteryManager.isCharging
            
            val result = WritableNativeMap().apply {
                putInt("level", level)
                putBoolean("isCharging", isCharging)
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    val status = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_STATUS)
                    putInt("status", status)
                    putBoolean("isFull", status == BatteryManager.BATTERY_STATUS_FULL)
                }
            }
            
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("GET_BATTERY_ERROR", "Failed to get battery info: ${e.message}", e)
        }
    }

    /**
     * Check if battery optimization is ignored for this app
     * (Required for reliable foreground service operation)
     */
    @ReactMethod
    fun isIgnoringBatteryOptimizations(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val powerManager = reactContext.getSystemService(Context.POWER_SERVICE) as PowerManager
                val packageName = reactContext.packageName
                val isIgnoring = powerManager.isIgnoringBatteryOptimizations(packageName)
                promise.resolve(isIgnoring)
            } else {
                // Battery optimization not available before Android M
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("CHECK_BATTERY_OPT_ERROR", "Failed to check battery optimization: ${e.message}", e)
        }
    }

    /**
     * Request battery optimization exemption
     * Opens system settings for user to grant exemption
     */
    @ReactMethod
    fun requestIgnoreBatteryOptimizations(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                    data = Uri.parse("package:${reactContext.packageName}")
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                reactContext.startActivity(intent)
                promise.resolve(true)
            } else {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.reject("REQUEST_BATTERY_OPT_ERROR", "Failed to request battery optimization exemption: ${e.message}", e)
        }
    }

    /**
     * Check if device is in power saving mode
     */
    @ReactMethod
    fun isPowerSaveMode(promise: Promise) {
        try {
            val powerManager = reactContext.getSystemService(Context.POWER_SERVICE) as PowerManager
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                promise.resolve(powerManager.isPowerSaveMode)
            } else {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.reject("CHECK_POWER_SAVE_ERROR", "Failed to check power save mode: ${e.message}", e)
        }
    }

    /**
     * Check if device is in Doze mode (idle state)
     */
    @ReactMethod
    fun isDeviceIdleMode(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val powerManager = reactContext.getSystemService(Context.POWER_SERVICE) as PowerManager
                promise.resolve(powerManager.isDeviceIdleMode)
            } else {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.reject("CHECK_IDLE_ERROR", "Failed to check idle mode: ${e.message}", e)
        }
    }

    /**
     * Check if screen is on
     */
    @ReactMethod
    fun isScreenOn(promise: Promise) {
        try {
            val powerManager = reactContext.getSystemService(Context.POWER_SERVICE) as PowerManager
            
            val isScreenOn = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT_WATCH) {
                powerManager.isInteractive
            } else {
                @Suppress("DEPRECATION")
                powerManager.isScreenOn
            }
            
            promise.resolve(isScreenOn)
        } catch (e: Exception) {
            promise.reject("CHECK_SCREEN_ERROR", "Failed to check screen status: ${e.message}", e)
        }
    }

    /**
     * Get comprehensive power status
     */
    @ReactMethod
    fun getPowerStatus(promise: Promise) {
        try {
            val powerManager = reactContext.getSystemService(Context.POWER_SERVICE) as PowerManager
            val batteryManager = reactContext.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
            
            val result = WritableNativeMap().apply {
                // Battery info
                putInt("batteryLevel", batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY))
                putBoolean("isCharging", batteryManager.isCharging)
                
                // Power save mode
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    putBoolean("isPowerSaveMode", powerManager.isPowerSaveMode)
                }
                
                // Screen state
                val isScreenOn = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT_WATCH) {
                    powerManager.isInteractive
                } else {
                    @Suppress("DEPRECATION")
                    powerManager.isScreenOn
                }
                putBoolean("isScreenOn", isScreenOn)
                
                // Battery optimization
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    val packageName = reactContext.packageName
                    putBoolean("isIgnoringBatteryOptimizations", 
                        powerManager.isIgnoringBatteryOptimizations(packageName))
                    putBoolean("isDeviceIdleMode", powerManager.isDeviceIdleMode)
                }
            }
            
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("GET_POWER_STATUS_ERROR", "Failed to get power status: ${e.message}", e)
        }
    }
}
