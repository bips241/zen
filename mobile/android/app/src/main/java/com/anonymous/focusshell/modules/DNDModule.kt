package com.anonymous.focusshell.modules

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.*

class DNDModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "DNDModule"
    }

    /**
     * Check if DND (Do Not Disturb) is currently enabled
     */
    @ReactMethod
    fun isDNDEnabled(promise: Promise) {
        try {
            val notificationManager = reactApplicationContext
                .getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            val isDNDOn = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val filter = notificationManager.currentInterruptionFilter
                filter != NotificationManager.INTERRUPTION_FILTER_ALL
            } else {
                false
            }

            promise.resolve(isDNDOn)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check DND status: ${e.message}")
        }
    }

    /**
     * Check if app has DND permission
     */
    @ReactMethod
    fun hasDNDPermission(promise: Promise) {
        try {
            val notificationManager = reactApplicationContext
                .getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            val hasPermission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                notificationManager.isNotificationPolicyAccessGranted
            } else {
                true // No permission needed on older Android
            }

            promise.resolve(hasPermission)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check DND permission: ${e.message}")
        }
    }

    /**
     * Request DND permission (opens system settings)
     */
    @ReactMethod
    fun requestDNDPermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val intent = Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS)
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactApplicationContext.startActivity(intent)
                promise.resolve(true)
            } else {
                promise.resolve(false) // Not needed on older Android
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to open DND settings: ${e.message}")
        }
    }

    /**
     * Enable DND mode
     */
    @ReactMethod
    fun enableDND(promise: Promise) {
        try {
            val notificationManager = reactApplicationContext
                .getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!notificationManager.isNotificationPolicyAccessGranted) {
                    promise.reject("PERMISSION_DENIED", "DND permission not granted")
                    return
                }

                notificationManager.setInterruptionFilter(
                    NotificationManager.INTERRUPTION_FILTER_PRIORITY
                )
                promise.resolve(true)
            } else {
                promise.reject("NOT_SUPPORTED", "DND not supported on this Android version")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to enable DND: ${e.message}")
        }
    }

    /**
     * Disable DND mode (return to normal)
     */
    @ReactMethod
    fun disableDND(promise: Promise) {
        try {
            val notificationManager = reactApplicationContext
                .getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!notificationManager.isNotificationPolicyAccessGranted) {
                    promise.reject("PERMISSION_DENIED", "DND permission not granted")
                    return
                }

                notificationManager.setInterruptionFilter(
                    NotificationManager.INTERRUPTION_FILTER_ALL
                )
                promise.resolve(true)
            } else {
                promise.reject("NOT_SUPPORTED", "DND not supported on this Android version")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to disable DND: ${e.message}")
        }
    }

    /**
     * Toggle DND mode
     */
    @ReactMethod
    fun toggleDND(promise: Promise) {
        try {
            val notificationManager = reactApplicationContext
                .getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!notificationManager.isNotificationPolicyAccessGranted) {
                    promise.reject("PERMISSION_DENIED", "DND permission not granted")
                    return
                }

                val currentFilter = notificationManager.currentInterruptionFilter
                val newFilter = if (currentFilter == NotificationManager.INTERRUPTION_FILTER_ALL) {
                    NotificationManager.INTERRUPTION_FILTER_PRIORITY
                } else {
                    NotificationManager.INTERRUPTION_FILTER_ALL
                }

                notificationManager.setInterruptionFilter(newFilter)
                
                val result = WritableNativeMap()
                result.putBoolean("enabled", newFilter != NotificationManager.INTERRUPTION_FILTER_ALL)
                promise.resolve(result)
            } else {
                promise.reject("NOT_SUPPORTED", "DND not supported on this Android version")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to toggle DND: ${e.message}")
        }
    }
}
