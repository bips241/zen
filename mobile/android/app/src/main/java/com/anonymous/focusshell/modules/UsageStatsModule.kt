package com.anonymous.focusshell.modules

import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import com.facebook.react.bridge.*
import java.util.concurrent.TimeUnit

class UsageStatsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "UsageStats"
    }

    /**
     * Get app usage for today
     */
    @ReactMethod
    fun getAppUsageToday(promise: Promise) {
        try {
            val usageStatsManager = reactApplicationContext
                .getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

            val endTime = System.currentTimeMillis()
            val startTime = getStartOfDay(endTime)

            val stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            )

            val result = WritableNativeArray()
            
            if (stats != null) {
                val pm = reactApplicationContext.packageManager
                
                for (stat in stats) {
                    if (stat.totalTimeInForeground > 0) {
                        val appInfo = WritableNativeMap()
                        appInfo.putString("packageName", stat.packageName)
                        
                        try {
                            val appName = pm.getApplicationLabel(
                                pm.getApplicationInfo(stat.packageName, 0)
                            ).toString()
                            appInfo.putString("appName", appName)
                        } catch (e: Exception) {
                            appInfo.putString("appName", stat.packageName)
                        }
                        
                        appInfo.putDouble("totalTimeMs", stat.totalTimeInForeground.toDouble())
                        appInfo.putDouble("totalTimeMinutes", 
                            TimeUnit.MILLISECONDS.toMinutes(stat.totalTimeInForeground).toDouble())
                        appInfo.putDouble("lastTimeUsed", stat.lastTimeUsed.toDouble())
                        
                        result.pushMap(appInfo)
                    }
                }
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get app usage: ${e.message}")
        }
    }

    /**
     * Get app usage for date range
     */
    @ReactMethod
    fun getAppUsageForRange(startTimeMs: Double, endTimeMs: Double, promise: Promise) {
        try {
            val usageStatsManager = reactApplicationContext
                .getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

            val stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTimeMs.toLong(),
                endTimeMs.toLong()
            )

            val result = WritableNativeArray()
            
            if (stats != null) {
                val pm = reactApplicationContext.packageManager
                
                for (stat in stats) {
                    if (stat.totalTimeInForeground > 0) {
                        val appInfo = WritableNativeMap()
                        appInfo.putString("packageName", stat.packageName)
                        
                        try {
                            val appName = pm.getApplicationLabel(
                                pm.getApplicationInfo(stat.packageName, 0)
                            ).toString()
                            appInfo.putString("appName", appName)
                        } catch (e: Exception) {
                            appInfo.putString("appName", stat.packageName)
                        }
                        
                        appInfo.putDouble("totalTimeMs", stat.totalTimeInForeground.toDouble())
                        appInfo.putDouble("totalTimeMinutes", 
                            TimeUnit.MILLISECONDS.toMinutes(stat.totalTimeInForeground).toDouble())
                        appInfo.putDouble("lastTimeUsed", stat.lastTimeUsed.toDouble())
                        
                        result.pushMap(appInfo)
                    }
                }
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get app usage for range: ${e.message}")
        }
    }

    /**
     * Get total screen time for today
     */
    @ReactMethod
    fun getScreenTimeToday(promise: Promise) {
        try {
            val usageStatsManager = reactApplicationContext
                .getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

            val endTime = System.currentTimeMillis()
            val startTime = getStartOfDay(endTime)

            val stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            )

            var totalTimeMs = 0L
            
            if (stats != null) {
                for (stat in stats) {
                    totalTimeMs += stat.totalTimeInForeground
                }
            }

            val result = WritableNativeMap()
            result.putDouble("totalTimeMs", totalTimeMs.toDouble())
            result.putDouble("totalTimeMinutes", 
                TimeUnit.MILLISECONDS.toMinutes(totalTimeMs).toDouble())
            result.putDouble("totalTimeHours", 
                TimeUnit.MILLISECONDS.toHours(totalTimeMs).toDouble())
            
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get screen time: ${e.message}")
        }
    }

    /**
     * Get usage for specific app
     */
    @ReactMethod
    fun getAppUsageForPackage(packageName: String, promise: Promise) {
        try {
            val usageStatsManager = reactApplicationContext
                .getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

            val endTime = System.currentTimeMillis()
            val startTime = getStartOfDay(endTime)

            val stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            )

            var appStat: UsageStats? = null
            
            if (stats != null) {
                appStat = stats.find { it.packageName == packageName }
            }

            val result = WritableNativeMap()
            
            if (appStat != null) {
                result.putString("packageName", appStat.packageName)
                result.putDouble("totalTimeMs", appStat.totalTimeInForeground.toDouble())
                result.putDouble("totalTimeMinutes", 
                    TimeUnit.MILLISECONDS.toMinutes(appStat.totalTimeInForeground).toDouble())
                result.putDouble("lastTimeUsed", appStat.lastTimeUsed.toDouble())
            } else {
                result.putString("packageName", packageName)
                result.putDouble("totalTimeMs", 0.0)
                result.putDouble("totalTimeMinutes", 0.0)
                result.putDouble("lastTimeUsed", 0.0)
            }
            
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get app usage for package: ${e.message}")
        }
    }

    private fun getStartOfDay(timeMs: Long): Long {
        val calendar = java.util.Calendar.getInstance()
        calendar.timeInMillis = timeMs
        calendar.set(java.util.Calendar.HOUR_OF_DAY, 0)
        calendar.set(java.util.Calendar.MINUTE, 0)
        calendar.set(java.util.Calendar.SECOND, 0)
        calendar.set(java.util.Calendar.MILLISECOND, 0)
        return calendar.timeInMillis
    }
}
