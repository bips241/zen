package com.anonymous.focusshell.modules

import android.app.AppOpsManager
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.*
import java.util.*

class AppBlockerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val blockedApps = mutableSetOf<String>()

    override fun getName(): String {
        return "AppBlocker"
    }

    /**
     * Block apps during focus sessions
     */
    @ReactMethod
    fun blockApps(packageNames: ReadableArray, promise: Promise) {
        try {
            var blockedCount = 0
            for (i in 0 until packageNames.size()) {
                val packageName = packageNames.getString(i)
                if (packageName != null) {
                    blockedApps.add(packageName)
                    blockedCount++
                }
            }

            val result = WritableNativeMap()
            result.putBoolean("success", true)
            result.putInt("blockedCount", blockedCount)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to block apps: ${e.message}")
        }
    }

    /**
     * Unblock apps
     */
    @ReactMethod
    fun unblockApps(packageNames: ReadableArray, promise: Promise) {
        try {
            var unblockedCount = 0
            for (i in 0 until packageNames.size()) {
                val packageName = packageNames.getString(i)
                if (packageName != null && blockedApps.remove(packageName)) {
                    unblockedCount++
                }
            }

            val result = WritableNativeMap()
            result.putBoolean("success", true)
            result.putInt("unblockedCount", unblockedCount)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to unblock apps: ${e.message}")
        }
    }

    /**
     * Unblock all apps
     */
    @ReactMethod
    fun unblockAllApps(promise: Promise) {
        try {
            val count = blockedApps.size
            blockedApps.clear()

            val result = WritableNativeMap()
            result.putBoolean("success", true)
            result.putInt("unblockedCount", count)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to unblock all apps: ${e.message}")
        }
    }

    /**
     * Check if app is blocked
     */
    @ReactMethod
    fun isAppBlocked(packageName: String, promise: Promise) {
        try {
            val result = WritableNativeMap()
            result.putBoolean("isBlocked", blockedApps.contains(packageName))
            result.putString("packageName", packageName)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check if app is blocked: ${e.message}")
        }
    }

    /**
     * Get foreground app
     */
    @ReactMethod
    fun getForegroundApp(promise: Promise) {
        try {
            // This requires usage stats permission
            if (!hasUsageStatsPermissionInternal()) {
                val result = WritableNativeMap()
                result.putString("packageName", "unknown")
                result.putBoolean("isBlocked", false)
                promise.resolve(result)
                return
            }

            val usageStatsManager = reactApplicationContext
                .getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

            val time = System.currentTimeMillis()
            val stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                time - 1000 * 10,
                time
            )

            var foregroundApp = "unknown"
            if (stats != null && stats.isNotEmpty()) {
                val sortedStats = stats.sortedByDescending { it.lastTimeUsed }
                foregroundApp = sortedStats.firstOrNull()?.packageName ?: "unknown"
            }

            val result = WritableNativeMap()
            result.putString("packageName", foregroundApp)
            result.putBoolean("isBlocked", blockedApps.contains(foregroundApp))
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get foreground app: ${e.message}")
        }
    }

    /**
     * Check if has usage stats permission
     */
    @ReactMethod
    fun hasUsageStatsPermission(promise: Promise) {
        try {
            val hasPermission = hasUsageStatsPermissionInternal()
            val result = WritableNativeMap()
            result.putBoolean("hasPermission", hasPermission)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check usage stats permission: ${e.message}")
        }
    }

    /**
     * Request usage stats permission
     */
    @ReactMethod
    fun requestUsageStatsPermission(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactApplicationContext.startActivity(intent)

            val result = WritableNativeMap()
            result.putBoolean("success", true)
            result.putString("message", "Usage stats settings opened")
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to open usage stats settings: ${e.message}")
        }
    }

    /**
     * Bring launcher to foreground
     */
    @ReactMethod
    fun bringLauncherToForeground(promise: Promise) {
        try {
            val intent = reactApplicationContext.packageManager
                .getLaunchIntentForPackage(reactApplicationContext.packageName)
            
            if (intent != null) {
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                reactApplicationContext.startActivity(intent)
                
                val result = WritableNativeMap()
                result.putBoolean("success", true)
                result.putString("message", "Launcher brought to foreground")
                promise.resolve(result)
            } else {
                promise.reject("ERROR", "Failed to get launcher intent")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to bring launcher to foreground: ${e.message}")
        }
    }

    private fun hasUsageStatsPermissionInternal(): Boolean {
        return try {
            val appOps = reactApplicationContext
                .getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            
            val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                appOps.unsafeCheckOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    android.os.Process.myUid(),
                    reactApplicationContext.packageName
                )
            } else {
                @Suppress("DEPRECATION")
                appOps.checkOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    android.os.Process.myUid(),
                    reactApplicationContext.packageName
                )
            }
            
            mode == AppOpsManager.MODE_ALLOWED
        } catch (e: Exception) {
            false
        }
    }
}
