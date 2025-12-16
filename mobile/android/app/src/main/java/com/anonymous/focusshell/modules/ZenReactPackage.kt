package com.anonymous.focusshell.modules

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class ZenReactPackage : ReactPackage {
    
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(
            ZenLauncherModule(reactContext),
            AppBlockerModule(reactContext),
            UsageStatsModule(reactContext),
            ZenNotificationModule(reactContext),
            DNDModule(reactContext),
            FocusEnforcementModule(reactContext),
            FocusNotificationModule(reactContext),
            PowerModule(reactContext),
            WallpaperModule(reactContext),
            BackupModule(reactContext),
            GestureModule(reactContext),
            AccessibilityModule(reactContext)
        )
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
