package com.anonymous.focusshell;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * ZenModulesPackage - Register all custom native modules
 */
public class ZenModulesPackage implements ReactPackage {

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        
        // Add all custom modules
        modules.add(new ZenLauncherModule(reactContext));
        modules.add(new AppBlockerModule(reactContext));
        modules.add(new UsageStatsModule(reactContext));
        modules.add(new NotificationModule(reactContext));
        modules.add(new OverlayModule(reactContext));
        
        return modules;
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
