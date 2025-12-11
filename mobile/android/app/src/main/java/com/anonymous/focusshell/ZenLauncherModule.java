package com.anonymous.focusshell;

import android.app.ActivityManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.util.Base64;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * ZenLauncherModule - Native Android Launcher functionality
 * 
 * Provides:
 * - Check if app is default launcher
 * - Request to set as default launcher
 * - Get installed apps list
 * - Launch apps
 * - Check if app is running
 */
public class ZenLauncherModule extends ReactContextBaseJavaModule {
    private static final String TAG = "ZenLauncherModule";
    private final ReactApplicationContext reactContext;

    public ZenLauncherModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "ZenLauncher";
    }

    /**
     * Check if this app is the default launcher
     */
    @ReactMethod
    public void isDefaultLauncher(Promise promise) {
        try {
            Intent intent = new Intent(Intent.ACTION_MAIN);
            intent.addCategory(Intent.CATEGORY_HOME);
            
            ResolveInfo resolveInfo = reactContext.getPackageManager()
                .resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY);
            
            if (resolveInfo != null && resolveInfo.activityInfo != null) {
                String currentLauncher = resolveInfo.activityInfo.packageName;
                boolean isDefault = currentLauncher.equals(reactContext.getPackageName());
                
                WritableMap result = Arguments.createMap();
                result.putBoolean("isDefault", isDefault);
                result.putString("currentLauncher", currentLauncher);
                
                promise.resolve(result);
            } else {
                promise.reject("ERROR", "Could not determine default launcher");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error checking default launcher", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Request to set this app as default launcher
     */
    @ReactMethod
    public void requestSetAsDefaultLauncher(Promise promise) {
        try {
            // Reset preferred launcher to show chooser
            PackageManager packageManager = reactContext.getPackageManager();
            ComponentName componentName = new ComponentName(reactContext, MainActivity.class);
            
            // Clear default launcher
            Intent intent = new Intent(Intent.ACTION_MAIN);
            intent.addCategory(Intent.CATEGORY_HOME);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            
            // This will show the launcher chooser
            reactContext.startActivity(intent);
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putString("message", "Launcher chooser shown. Please select Zen Mobile.");
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error requesting default launcher", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Get all installed apps
     */
    @ReactMethod
    public void getInstalledApps(Promise promise) {
        try {
            PackageManager pm = reactContext.getPackageManager();
            
            Intent intent = new Intent(Intent.ACTION_MAIN, null);
            intent.addCategory(Intent.CATEGORY_LAUNCHER);
            
            List<ResolveInfo> apps = pm.queryIntentActivities(intent, 0);
            WritableArray appList = Arguments.createArray();
            
            for (ResolveInfo app : apps) {
                try {
                    String packageName = app.activityInfo.packageName;
                    
                    // Skip system UI and settings
                    if (packageName.equals("com.android.systemui") || 
                        packageName.equals("com.android.settings")) {
                        continue;
                    }
                    
                    WritableMap appInfo = Arguments.createMap();
                    appInfo.putString("packageName", packageName);
                    appInfo.putString("appName", app.loadLabel(pm).toString());
                    appInfo.putString("activityName", app.activityInfo.name);
                    
                    // Get app icon as base64
                    try {
                        Drawable icon = app.loadIcon(pm);
                        String iconBase64 = drawableToBase64(icon);
                        appInfo.putString("icon", iconBase64);
                    } catch (Exception e) {
                        appInfo.putString("icon", "");
                    }
                    
                    // Check if system app
                    ApplicationInfo appInfo2 = pm.getApplicationInfo(packageName, 0);
                    boolean isSystemApp = (appInfo2.flags & ApplicationInfo.FLAG_SYSTEM) != 0;
                    appInfo.putBoolean("isSystemApp", isSystemApp);
                    
                    appList.pushMap(appInfo);
                } catch (Exception e) {
                    Log.w(TAG, "Error processing app: " + app.activityInfo.packageName, e);
                }
            }
            
            promise.resolve(appList);
        } catch (Exception e) {
            Log.e(TAG, "Error getting installed apps", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Launch an app by package name
     */
    @ReactMethod
    public void launchApp(String packageName, Promise promise) {
        try {
            PackageManager pm = reactContext.getPackageManager();
            Intent launchIntent = pm.getLaunchIntentForPackage(packageName);
            
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(launchIntent);
                
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", true);
                result.putString("packageName", packageName);
                
                promise.resolve(result);
            } else {
                promise.reject("ERROR", "Could not find launch intent for package: " + packageName);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error launching app: " + packageName, e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Check if an app is currently running
     */
    @ReactMethod
    public void isAppRunning(String packageName, Promise promise) {
        try {
            ActivityManager activityManager = (ActivityManager) reactContext.getSystemService(Context.ACTIVITY_SERVICE);
            List<ActivityManager.RunningAppProcessInfo> processes = activityManager.getRunningAppProcesses();
            
            boolean isRunning = false;
            if (processes != null) {
                for (ActivityManager.RunningAppProcessInfo process : processes) {
                    if (process.processName.equals(packageName)) {
                        isRunning = true;
                        break;
                    }
                }
            }
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("isRunning", isRunning);
            result.putString("packageName", packageName);
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error checking if app is running: " + packageName, e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Open Android home settings
     */
    @ReactMethod
    public void openHomeSettings(Promise promise) {
        try {
            Intent intent = new Intent(android.provider.Settings.ACTION_HOME_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error opening home settings", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Convert Drawable to Base64 string
     */
    private String drawableToBase64(Drawable drawable) {
        try {
            Bitmap bitmap = Bitmap.createBitmap(
                drawable.getIntrinsicWidth(),
                drawable.getIntrinsicHeight(),
                Bitmap.Config.ARGB_8888
            );
            
            Canvas canvas = new Canvas(bitmap);
            drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
            drawable.draw(canvas);
            
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.PNG, 80, byteArrayOutputStream);
            byte[] byteArray = byteArrayOutputStream.toByteArray();
            
            return "data:image/png;base64," + Base64.encodeToString(byteArray, Base64.NO_WRAP);
        } catch (Exception e) {
            Log.w(TAG, "Error converting drawable to base64", e);
            return "";
        }
    }
}
