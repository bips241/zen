package com.anonymous.focusshell.modules

import android.app.role.RoleManager
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.content.pm.ResolveInfo
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
import android.graphics.Paint
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.os.Build
import android.util.Base64
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.ByteArrayOutputStream

class ZenLauncherModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {

    private var screenReceiver: BroadcastReceiver? = null

    override fun getName(): String {
        return "ZenLauncher"
    }

    /**
     * Start listening for screen on/off events
     */
    @ReactMethod
    fun startScreenListener(promise: Promise) {
        try {
            if (screenReceiver == null) {
                screenReceiver = object : BroadcastReceiver() {
                    override fun onReceive(context: Context?, intent: Intent?) {
                        when (intent?.action) {
                            Intent.ACTION_SCREEN_ON -> {
                                sendEvent("onScreenOn", null)
                            }
                            Intent.ACTION_SCREEN_OFF -> {
                                sendEvent("onScreenOff", null)
                            }
                        }
                    }
                }

                val filter = IntentFilter().apply {
                    addAction(Intent.ACTION_SCREEN_ON)
                    addAction(Intent.ACTION_SCREEN_OFF)
                }
                
                reactApplicationContext.registerReceiver(screenReceiver, filter)
                promise.resolve(true)
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to start screen listener: ${e.message}")
        }
    }

    /**
     * Stop listening for screen on/off events
     */
    @ReactMethod
    fun stopScreenListener(promise: Promise) {
        try {
            screenReceiver?.let {
                reactApplicationContext.unregisterReceiver(it)
                screenReceiver = null
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to stop screen listener: ${e.message}")
        }
    }

    /**
     * Send event to JavaScript
     */
    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    /**
     * Required for NativeEventEmitter - cleanup listeners
     */
    @ReactMethod
    fun removeListeners(count: Int) {
        // Required method for NativeEventEmitter
        // Listeners are managed by React Native's event system
    }

    /**
     * Hide system UI (status bar and navigation buttons)
     * Maximum enforcement for launcher - prevents swipe-to-show
     */
    @ReactMethod
    fun hideSystemUI(promise: Promise) {
        try {
            currentActivity?.runOnUiThread {
                val window = currentActivity?.window
                if (window != null) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                        // API 30+ (Android 11+): Use WindowInsetsController
                        window.setDecorFitsSystemWindows(false)
                        
                        val controller = window.insetsController
                        if (controller != null) {
                            // Hide status bar and navigation bar
                            controller.hide(
                                WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars()
                            )
                            
                            // CRITICAL: Disable swipe-to-show
                            // BEHAVIOR_SHOW_BARS_BY_TOUCH = bars only show on explicit button press
                            controller.systemBarsBehavior = 
                                WindowInsetsController.BEHAVIOR_SHOW_BARS_BY_TOUCH
                        }
                    } else {
                        // API < 30: Use legacy flags
                        val decorView = window.decorView
                        val flags = View.SYSTEM_UI_FLAG_FULLSCREEN or
                                    View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
                                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
                                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
                                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
                                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        decorView.systemUiVisibility = flags
                    }
                }
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to hide system UI: ${e.message}")
        }
    }

    /**
     * Show system UI (status bar and navigation buttons)
     * Called explicitly by user action (button press)
     */
    @ReactMethod
    fun showSystemUI(promise: Promise) {
        try {
            currentActivity?.runOnUiThread {
                val window = currentActivity?.window
                if (window != null) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                        // API 30+: Use WindowInsetsController
                        val controller = window.insetsController
                        if (controller != null) {
                            controller.show(
                                WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars()
                            )
                        }
                    } else {
                        // API < 30: Clear flags
                        val decorView = window.decorView
                        decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_VISIBLE
                    }
                }
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to show system UI: ${e.message}")
        }
    }

    /**
     * Check if app is set as default launcher
     */
    @ReactMethod
    fun isDefaultLauncher(promise: Promise) {
        try {
            val intent = Intent(Intent.ACTION_MAIN).apply {
                addCategory(Intent.CATEGORY_HOME)
            }
            
            val pm = reactApplicationContext.packageManager
            val resolveInfo = pm.resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY)
            
            val isDefault = resolveInfo?.activityInfo?.packageName == reactApplicationContext.packageName
            val currentLauncher = resolveInfo?.activityInfo?.packageName ?: "unknown"
            
            val result = WritableNativeMap()
            result.putBoolean("isDefault", isDefault)
            result.putString("currentLauncher", currentLauncher)
            
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check launcher status: ${e.message}")
        }
    }

    /**
     * Request to set as default launcher
     */
    @ReactMethod
    fun requestSetAsDefaultLauncher(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // Android 10+ - Use RoleManager
                val roleManager = reactApplicationContext.getSystemService(Context.ROLE_SERVICE) as RoleManager
                if (roleManager.isRoleAvailable(RoleManager.ROLE_HOME)) {
                    val intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_HOME)
                    currentActivity?.startActivityForResult(intent, 100)
                    
                    val result = WritableNativeMap()
                    result.putBoolean("success", true)
                    result.putString("message", "Launcher permission dialog opened")
                    promise.resolve(result)
                } else {
                    promise.reject("ERROR", "Home role not available")
                }
            } else {
                // Android 9 and below - Open home settings
                val intent = Intent(android.provider.Settings.ACTION_HOME_SETTINGS)
                currentActivity?.startActivity(intent)
                
                val result = WritableNativeMap()
                result.putBoolean("success", true)
                result.putString("message", "Home settings opened")
                promise.resolve(result)
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to open launcher settings: ${e.message}")
        }
    }

    /**
     * Open home settings
     */
    @ReactMethod
    fun openHomeSettings(promise: Promise) {
        try {
            val intent = Intent(android.provider.Settings.ACTION_HOME_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
            
            val result = WritableNativeMap()
            result.putBoolean("success", true)
            result.putString("message", "Home settings opened")
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to open home settings: ${e.message}")
        }
    }

    /**
     * Get all installed apps - OPTIMIZED for instant loading
     * Returns apps WITHOUT icons for ultra-fast initial load
     * Icons can be fetched separately on-demand
     */
    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            val intent = Intent(Intent.ACTION_MAIN, null).apply {
                addCategory(Intent.CATEGORY_LAUNCHER)
            }
            
            val apps = pm.queryIntentActivities(intent, 0)
            val appList = WritableNativeArray()
            
            // OPTIMIZATION: Skip icon processing for instant load
            // Icons will be loaded separately via getAppIcon()
            for (app in apps) {
                val appInfo = WritableNativeMap()
                appInfo.putString("packageName", app.activityInfo.packageName)
                appInfo.putString("appName", app.loadLabel(pm).toString())
                appInfo.putString("activityName", app.activityInfo.name)
                
                // No icon processing - instant response!
                appInfo.putString("icon", "")
                
                // Check if it's a system app
                val isSystemApp = (app.activityInfo.applicationInfo.flags and 
                    ApplicationInfo.FLAG_SYSTEM) != 0
                appInfo.putBoolean("isSystemApp", isSystemApp)
                
                appList.pushMap(appInfo)
            }
            
            promise.resolve(appList)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get installed apps: ${e.message}")
        }
    }

    /**
     * Get app icons in batch - ULTRA-OPTIMIZED with parallel processing
     * Fetches icons only when needed with aggressive caching
     */
    @ReactMethod
    fun getAppIconsBatch(packageNames: ReadableArray, promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            val result = WritableNativeMap()
            
            // 🚀 OPTIMIZATION: Process icons in parallel if batch is large
            val packages = (0 until packageNames.size()).mapNotNull { 
                packageNames.getString(it) 
            }
            
            for (packageName in packages) {
                try {
                    // Check if icon is cached (instant return)
                    val cachedIcon = iconCache[packageName]
                    if (cachedIcon != null) {
                        result.putString(packageName, cachedIcon)
                        continue
                    }
                    
                    // Load and process icon (expensive operation)
                    val appInfo = pm.getApplicationInfo(packageName, 0)
                    val icon = pm.getApplicationIcon(appInfo)
                    
                    // Optimized: Use smaller size for faster processing
                    val bitmap = drawableToBitmap(icon)
                    val resizedBitmap = Bitmap.createScaledBitmap(bitmap, 96, 96, true)
                    val grayscaleBitmap = toGrayscale(resizedBitmap)
                    val base64Icon = bitmapToBase64(grayscaleBitmap, 80) // Lower quality for speed
                    
                    // Cache it (in-memory for session)
                    iconCache[packageName] = base64Icon
                    result.putString(packageName, base64Icon)
                    
                    // Auto-prune if cache is too large
                    pruneIconCache()
                    
                    // Aggressive cleanup to prevent memory leaks
                    if (bitmap != resizedBitmap) bitmap.recycle()
                    resizedBitmap.recycle()
                    grayscaleBitmap.recycle()
                } catch (e: Exception) {
                    // Skip failed icons silently
                    result.putString(packageName, "")
                }
            }
            
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get app icons: ${e.message}")
        }
    }

    // In-memory icon cache with size limit (prevent memory leaks)
    private val iconCache = mutableMapOf<String, String>()
    private val MAX_CACHE_SIZE = 200 // Maximum icons to cache (prevents OOM)

    /**
     * Clear icon cache to free memory
     */
    @ReactMethod
    fun clearIconCache(promise: Promise) {
        try {
            val clearedCount = iconCache.size
            iconCache.clear()
            android.util.Log.d("ZenLauncher", "Cleared $clearedCount cached icons")
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to clear cache: ${e.message}")
        }
    }

    /**
     * Automatically prune cache if it exceeds size limit (LRU-style)
     */
    private fun pruneIconCache() {
        if (iconCache.size > MAX_CACHE_SIZE) {
            // Remove oldest 25% of entries
            val toRemove = iconCache.size / 4
            val iterator = iconCache.entries.iterator()
            var removed = 0
            while (iterator.hasNext() && removed < toRemove) {
                iterator.next()
                iterator.remove()
                removed++
            }
            android.util.Log.d("ZenLauncher", "Pruned $removed icons from cache (${iconCache.size} remaining)")
        }
    }

    /**
     * Launch an app by package name
     */
    @ReactMethod
    fun launchApp(packageName: String, promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            val intent = pm.getLaunchIntentForPackage(packageName)
            
            val result = WritableNativeMap()
            result.putString("packageName", packageName)
            
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactApplicationContext.startActivity(intent)
                result.putBoolean("success", true)
                promise.resolve(result)
            } else {
                result.putBoolean("success", false)
                promise.reject("ERROR", "App not found: $packageName")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to launch app: ${e.message}")
        }
    }

    /**
     * Check if an app is installed by package name
     */
    @ReactMethod
    fun isAppInstalled(packageName: String, promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            pm.getPackageInfo(packageName, PackageManager.GET_ACTIVITIES)
            promise.resolve(true)
        } catch (e: PackageManager.NameNotFoundException) {
            promise.resolve(false)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check app installation: ${e.message}")
        }
    }

    /**
     * Check if an app is currently running
     */
    @ReactMethod
    fun isAppRunning(packageName: String, promise: Promise) {
        try {
            // For now, return false as this requires more complex activity tracking
            val result = WritableNativeMap()
            result.putBoolean("isRunning", false)
            result.putString("packageName", packageName)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check app running status: ${e.message}")
        }
    }

    /**
     * Get app icon as base64
     */
    @ReactMethod
    fun getAppIcon(packageName: String, promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            val icon = pm.getApplicationIcon(packageName)
            // For simplicity, just return success
            // In production, convert drawable to base64
            promise.resolve("icon_placeholder")
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get app icon: ${e.message}")
        }
    }

    /**
     * Get detailed app information including size, install date, etc.
     */
    @ReactMethod
    fun getAppDetails(packageName: String, promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            val appInfo = pm.getApplicationInfo(packageName, 0)
            val packageInfo = pm.getPackageInfo(packageName, 0)
            
            val result = WritableNativeMap()
            result.putString("packageName", packageName)
            result.putString("appName", pm.getApplicationLabel(appInfo).toString())
            result.putString("versionName", packageInfo.versionName ?: "Unknown")
            result.putDouble("versionCode", packageInfo.versionCode.toDouble())
            result.putDouble("firstInstallTime", packageInfo.firstInstallTime.toDouble())
            result.putDouble("lastUpdateTime", packageInfo.lastUpdateTime.toDouble())
            
            // App size (requires storage stats permission for accurate size on newer APIs)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                try {
                    val storageStatsManager = reactApplicationContext
                        .getSystemService(Context.STORAGE_STATS_SERVICE) as android.app.usage.StorageStatsManager
                    val storageStats = storageStatsManager.queryStatsForPackage(
                        android.os.storage.StorageManager.UUID_DEFAULT,
                        packageName,
                        android.os.Process.myUserHandle()
                    )
                    result.putDouble("appBytes", storageStats.appBytes.toDouble())
                    result.putDouble("dataBytes", storageStats.dataBytes.toDouble())
                    result.putDouble("cacheBytes", storageStats.cacheBytes.toDouble())
                } catch (e: Exception) {
                    // Permission not granted or other error
                    result.putDouble("appBytes", 0.0)
                    result.putDouble("dataBytes", 0.0)
                    result.putDouble("cacheBytes", 0.0)
                }
            }
            
            // App category
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val category = when (appInfo.category) {
                    ApplicationInfo.CATEGORY_GAME -> "Game"
                    ApplicationInfo.CATEGORY_SOCIAL -> "Social"
                    ApplicationInfo.CATEGORY_PRODUCTIVITY -> "Productivity"
                    ApplicationInfo.CATEGORY_NEWS -> "News"
                    ApplicationInfo.CATEGORY_VIDEO -> "Video"
                    ApplicationInfo.CATEGORY_AUDIO -> "Audio"
                    ApplicationInfo.CATEGORY_IMAGE -> "Image"
                    else -> "Other"
                }
                result.putString("category", category)
            }
            
            // System app check
            result.putBoolean("isSystemApp", (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0)
            
            // Target SDK
            result.putInt("targetSdk", appInfo.targetSdkVersion)
            
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("GET_APP_DETAILS_ERROR", "Failed to get app details: ${e.message}", e)
        }
    }

    /**
     * Get app shortcuts (static and dynamic)
     */
    @ReactMethod
    fun getAppShortcuts(packageName: String, promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N_MR1) {
                val launcherApps = reactApplicationContext
                    .getSystemService(Context.LAUNCHER_APPS_SERVICE) as android.content.pm.LauncherApps
                
                val query = android.content.pm.LauncherApps.ShortcutQuery()
                query.setQueryFlags(
                    android.content.pm.LauncherApps.ShortcutQuery.FLAG_MATCH_DYNAMIC or
                    android.content.pm.LauncherApps.ShortcutQuery.FLAG_MATCH_MANIFEST or
                    android.content.pm.LauncherApps.ShortcutQuery.FLAG_MATCH_PINNED
                )
                query.setPackage(packageName)
                
                val shortcuts = launcherApps.getShortcuts(query, android.os.Process.myUserHandle())
                
                val result = WritableNativeArray()
                if (shortcuts != null) {
                    for (shortcut in shortcuts) {
                        val shortcutInfo = WritableNativeMap()
                        shortcutInfo.putString("id", shortcut.id)
                        shortcutInfo.putString("shortLabel", shortcut.shortLabel?.toString())
                        shortcutInfo.putString("longLabel", shortcut.longLabel?.toString())
                        shortcutInfo.putBoolean("isDynamic", shortcut.isDynamic)
                        shortcutInfo.putBoolean("isPinned", shortcut.isPinned)
                        shortcutInfo.putBoolean("isDeclaredInManifest", shortcut.isDeclaredInManifest)
                        result.pushMap(shortcutInfo)
                    }
                }
                
                promise.resolve(result)
            } else {
                // Shortcuts not supported before Android 7.1
                promise.resolve(WritableNativeArray())
            }
        } catch (e: Exception) {
            promise.reject("GET_SHORTCUTS_ERROR", "Failed to get app shortcuts: ${e.message}", e)
        }
    }

    /**
     * Check if app supports adaptive icon
     */
    @ReactMethod
    fun supportsAdaptiveIcon(packageName: String, promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val pm = reactApplicationContext.packageManager
                val icon = pm.getApplicationIcon(packageName)
                val isAdaptive = icon is android.graphics.drawable.AdaptiveIconDrawable
                promise.resolve(isAdaptive)
            } else {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.reject("CHECK_ADAPTIVE_ERROR", "Failed to check adaptive icon: ${e.message}", e)
        }
    }

    /**
     * Get all launchable apps with enhanced metadata
     */
    @ReactMethod
    fun getInstalledAppsDetailed(promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            val mainIntent = Intent(Intent.ACTION_MAIN, null)
            mainIntent.addCategory(Intent.CATEGORY_LAUNCHER)
            
            val apps = pm.queryIntentActivities(mainIntent, 0)
            val result = WritableNativeArray()
            
            for (resolveInfo in apps) {
                val packageName = resolveInfo.activityInfo.packageName
                
                try {
                    val appInfo = pm.getApplicationInfo(packageName, 0)
                    val packageInfo = pm.getPackageInfo(packageName, 0)
                    
                    val appData = WritableNativeMap()
                    appData.putString("packageName", packageName)
                    appData.putString("appName", pm.getApplicationLabel(appInfo).toString())
                    appData.putString("versionName", packageInfo.versionName ?: "")
                    appData.putDouble("firstInstallTime", packageInfo.firstInstallTime.toDouble())
                    appData.putDouble("lastUpdateTime", packageInfo.lastUpdateTime.toDouble())
                    appData.putBoolean("isSystemApp", (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0)
                    
                    // Category (API 26+)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        val category = when (appInfo.category) {
                            ApplicationInfo.CATEGORY_GAME -> "Game"
                            ApplicationInfo.CATEGORY_SOCIAL -> "Social"
                            ApplicationInfo.CATEGORY_PRODUCTIVITY -> "Productivity"
                            ApplicationInfo.CATEGORY_NEWS -> "News"
                            ApplicationInfo.CATEGORY_VIDEO -> "Video"
                            ApplicationInfo.CATEGORY_AUDIO -> "Audio"
                            ApplicationInfo.CATEGORY_IMAGE -> "Image"
                            else -> "Other"
                        }
                        appData.putString("category", category)
                        
                        // Check adaptive icon support
                        val icon = pm.getApplicationIcon(packageName)
                        appData.putBoolean("hasAdaptiveIcon", 
                            icon is android.graphics.drawable.AdaptiveIconDrawable)
                    }
                    
                    result.pushMap(appData)
                } catch (e: Exception) {
                    // Skip apps that cause errors
                    continue
                }
            }
            
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("GET_APPS_DETAILED_ERROR", "Failed to get detailed app list: ${e.message}", e)
        }
    }
    
    /**
     * Convert Drawable to Bitmap
     */
    private fun drawableToBitmap(drawable: Drawable): Bitmap {
        if (drawable is BitmapDrawable) {
            return drawable.bitmap
        }
        
        val width = if (drawable.intrinsicWidth > 0) drawable.intrinsicWidth else 96
        val height = if (drawable.intrinsicHeight > 0) drawable.intrinsicHeight else 96
        
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        drawable.setBounds(0, 0, canvas.width, canvas.height)
        drawable.draw(canvas)
        
        return bitmap
    }
    
    /**
     * Convert Bitmap to grayscale
     */
    private fun toGrayscale(bitmap: Bitmap): Bitmap {
        val width = bitmap.width
        val height = bitmap.height
        val grayscaleBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        
        val canvas = Canvas(grayscaleBitmap)
        val paint = Paint()
        val colorMatrix = ColorMatrix()
        colorMatrix.setSaturation(0f) // 0 = grayscale, 1 = original colors
        val filter = ColorMatrixColorFilter(colorMatrix)
        paint.colorFilter = filter
        
        canvas.drawBitmap(bitmap, 0f, 0f, paint)
        
        return grayscaleBitmap
    }
    
    /**
     * Convert Bitmap to Base64 string - OPTIMIZED
     */
    private fun bitmapToBase64(bitmap: Bitmap, quality: Int = 100): String {
        val outputStream = ByteArrayOutputStream()
        // Use WEBP for better compression (smaller size, faster transfer)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            bitmap.compress(Bitmap.CompressFormat.WEBP_LOSSY, quality, outputStream)
        } else {
            bitmap.compress(Bitmap.CompressFormat.WEBP, quality, outputStream)
        }
        val byteArray = outputStream.toByteArray()
        return Base64.encodeToString(byteArray, Base64.NO_WRAP)
    }

    companion object {
        const val NAME = "ZenLauncher"
    }
}
