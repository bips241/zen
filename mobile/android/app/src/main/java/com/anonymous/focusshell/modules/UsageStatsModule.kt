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

    /**
     * Get most used apps (top N by screen time)
     */
    @ReactMethod
    fun getMostUsedApps(limit: Int, promise: Promise) {
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
                
                // Sort by total time in foreground, descending
                val sortedStats = stats
                    .filter { it.totalTimeInForeground > 0 }
                    .sortedByDescending { it.totalTimeInForeground }
                    .take(limit)
                
                for (stat in sortedStats) {
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

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get most used apps: ${e.message}")
        }
    }

    /**
     * Get weekly screen time breakdown (last 7 days)
     */
    @ReactMethod
    fun getWeeklyScreenTime(promise: Promise) {
        try {
            val usageStatsManager = reactApplicationContext
                .getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

            val endTime = System.currentTimeMillis()
            val startTime = endTime - TimeUnit.DAYS.toMillis(7)

            val stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            )

            val dailyUsage = mutableMapOf<String, Long>()
            
            if (stats != null) {
                for (stat in stats) {
                    val day = getDayKey(stat.lastTimeUsed)
                    dailyUsage[day] = (dailyUsage[day] ?: 0L) + stat.totalTimeInForeground
                }
            }

            val result = WritableNativeArray()
            
            // Generate last 7 days
            for (i in 0 until 7) {
                val dayTime = endTime - TimeUnit.DAYS.toMillis(i.toLong())
                val dayKey = getDayKey(dayTime)
                val totalMs = dailyUsage[dayKey] ?: 0L
                
                val dayInfo = WritableNativeMap()
                dayInfo.putString("date", dayKey)
                dayInfo.putDouble("totalTimeMs", totalMs.toDouble())
                dayInfo.putDouble("totalTimeMinutes", 
                    TimeUnit.MILLISECONDS.toMinutes(totalMs).toDouble())
                dayInfo.putDouble("totalTimeHours", 
                    TimeUnit.MILLISECONDS.toHours(totalMs).toDouble())
                
                result.pushMap(dayInfo)
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get weekly screen time: ${e.message}")
        }
    }

    /**
     * Get app categories with usage breakdown
     */
    @ReactMethod
    fun getCategorizedUsage(promise: Promise) {
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

            val categoryUsage = mutableMapOf<String, Long>()
            val pm = reactApplicationContext.packageManager
            
            if (stats != null) {
                for (stat in stats) {
                    if (stat.totalTimeInForeground > 0) {
                        try {
                            val appInfo = pm.getApplicationInfo(stat.packageName, 0)
                            val category = when (appInfo.category) {
                                android.content.pm.ApplicationInfo.CATEGORY_GAME -> "Games"
                                android.content.pm.ApplicationInfo.CATEGORY_SOCIAL -> "Social"
                                android.content.pm.ApplicationInfo.CATEGORY_PRODUCTIVITY -> "Productivity"
                                android.content.pm.ApplicationInfo.CATEGORY_NEWS -> "News"
                                android.content.pm.ApplicationInfo.CATEGORY_VIDEO -> "Video"
                                android.content.pm.ApplicationInfo.CATEGORY_AUDIO -> "Audio"
                                android.content.pm.ApplicationInfo.CATEGORY_IMAGE -> "Image"
                                else -> "Other"
                            }
                            categoryUsage[category] = (categoryUsage[category] ?: 0L) + stat.totalTimeInForeground
                        } catch (e: Exception) {
                            categoryUsage["Other"] = (categoryUsage["Other"] ?: 0L) + stat.totalTimeInForeground
                        }
                    }
                }
            }

            val result = WritableNativeArray()
            
            for ((category, totalMs) in categoryUsage.entries.sortedByDescending { it.value }) {
                val categoryInfo = WritableNativeMap()
                categoryInfo.putString("category", category)
                categoryInfo.putDouble("totalTimeMs", totalMs.toDouble())
                categoryInfo.putDouble("totalTimeMinutes", 
                    TimeUnit.MILLISECONDS.toMinutes(totalMs).toDouble())
                categoryInfo.putDouble("totalTimeHours", 
                    TimeUnit.MILLISECONDS.toHours(totalMs).toDouble())
                
                result.pushMap(categoryInfo)
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get categorized usage: ${e.message}")
        }
    }

    /**
     * Get hourly breakdown of screen time for today
     */
    @ReactMethod
    fun getHourlyBreakdown(promise: Promise) {
        try {
            val usageStatsManager = reactApplicationContext
                .getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

            val endTime = System.currentTimeMillis()
            val startTime = getStartOfDay(endTime)

            // Query with hourly interval
            val events = usageStatsManager.queryEvents(startTime, endTime)
            val hourlyUsage = IntArray(24) { 0 }
            
            var lastEvent: android.app.usage.UsageEvents.Event? = null
            var lastTimestamp = startTime
            
            while (events.hasNextEvent()) {
                val event = android.app.usage.UsageEvents.Event()
                events.getNextEvent(event)
                
                if (event.eventType == android.app.usage.UsageEvents.Event.ACTIVITY_RESUMED) {
                    lastEvent = event
                    lastTimestamp = event.timeStamp
                } else if (event.eventType == android.app.usage.UsageEvents.Event.ACTIVITY_PAUSED && lastEvent != null) {
                    val duration = event.timeStamp - lastTimestamp
                    val hour = getHourOfDay(lastTimestamp)
                    hourlyUsage[hour] += (duration / 1000 / 60).toInt() // Convert to minutes
                    lastEvent = null
                }
            }

            val result = WritableNativeArray()
            
            for (hour in 0 until 24) {
                val hourInfo = WritableNativeMap()
                hourInfo.putInt("hour", hour)
                hourInfo.putInt("usageMinutes", hourlyUsage[hour])
                result.pushMap(hourInfo)
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get hourly breakdown: ${e.message}")
        }
    }

    /**
     * Get screen unlocks count for today
     */
    @ReactMethod
    fun getScreenUnlocksToday(promise: Promise) {
        try {
            val usageStatsManager = reactApplicationContext
                .getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

            val endTime = System.currentTimeMillis()
            val startTime = getStartOfDay(endTime)

            val events = usageStatsManager.queryEvents(startTime, endTime)
            var unlockCount = 0
            
            while (events.hasNextEvent()) {
                val event = android.app.usage.UsageEvents.Event()
                events.getNextEvent(event)
                
                if (event.eventType == android.app.usage.UsageEvents.Event.KEYGUARD_HIDDEN) {
                    unlockCount++
                }
            }

            val result = WritableNativeMap()
            result.putInt("unlockCount", unlockCount)
            
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get screen unlocks: ${e.message}")
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

    private fun getDayKey(timeMs: Long): String {
        val calendar = java.util.Calendar.getInstance()
        calendar.timeInMillis = timeMs
        return "${calendar.get(java.util.Calendar.YEAR)}-${calendar.get(java.util.Calendar.MONTH) + 1}-${calendar.get(java.util.Calendar.DAY_OF_MONTH)}"
    }

    private fun getHourOfDay(timeMs: Long): Int {
        val calendar = java.util.Calendar.getInstance()
        calendar.timeInMillis = timeMs
        return calendar.get(java.util.Calendar.HOUR_OF_DAY)
    }
}
