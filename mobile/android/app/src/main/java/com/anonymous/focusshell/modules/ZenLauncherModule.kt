package com.anonymous.focusshell.modules

import android.app.role.RoleManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.content.pm.ResolveInfo
import android.os.Build
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class ZenLauncherModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ZenLauncher"
    }

    /**
     * Hide system UI (status bar and navigation buttons)
     * Uses AndroidX WindowInsetsControllerCompat for proper immersive mode
     */
    @ReactMethod
    fun hideSystemUI(promise: Promise) {
        try {
            currentActivity?.runOnUiThread {
                val window = currentActivity?.window
                if (window != null) {
                    // Get the WindowInsetsController using AndroidX compat library
                    val windowInsetsController = WindowCompat.getInsetsController(window, window.decorView)
                    
                    if (windowInsetsController != null) {
                        // Configure behavior: show transient bars on swipe, then auto-hide
                        windowInsetsController.systemBarsBehavior = 
                            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                        
                        // Hide both status bar and navigation bar
                        windowInsetsController.hide(WindowInsetsCompat.Type.systemBars())
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
     */
    @ReactMethod
    fun showSystemUI(promise: Promise) {
        try {
            currentActivity?.runOnUiThread {
                val window = currentActivity?.window
                if (window != null) {
                    // Get the WindowInsetsController using AndroidX compat library
                    val windowInsetsController = WindowCompat.getInsetsController(window, window.decorView)
                    
                    if (windowInsetsController != null) {
                        // Show both status bar and navigation bar
                        windowInsetsController.show(WindowInsetsCompat.Type.systemBars())
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
     * Get all installed apps
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
            
            for (app in apps) {
                val appInfo = WritableNativeMap()
                appInfo.putString("packageName", app.activityInfo.packageName)
                appInfo.putString("appName", app.loadLabel(pm).toString())
                appInfo.putString("activityName", app.activityInfo.name)
                appInfo.putString("icon", "placeholder") // TODO: Convert icon to base64
                
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

    companion object {
        const val NAME = "ZenLauncher"
    }
}
