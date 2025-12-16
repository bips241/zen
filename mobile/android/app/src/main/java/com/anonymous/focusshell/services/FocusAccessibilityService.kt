package com.anonymous.focusshell.services

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import java.util.concurrent.ConcurrentHashMap

/**
 * FocusAccessibilityService
 * 
 * Advanced app blocking at system level using Accessibility Service.
 * Provides stronger enforcement than usage stats monitoring.
 * 
 * Features:
 * - Block app launches at system level
 * - Auto-dismiss distracting notifications
 * - Detect screen content for context awareness
 * - Monitor window state changes
 * 
 * Note: Requires user to enable in Settings > Accessibility
 */
class FocusAccessibilityService : AccessibilityService() {

    companion object {
        @Volatile
        var isServiceEnabled = false
            private set

        @Volatile
        var isFocusModeActive = false

        val blockedPackages = ConcurrentHashMap<String, Boolean>()
        
        private var currentForegroundPackage: String? = null
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        
        // Configure accessibility service
        val info = AccessibilityServiceInfo()
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or
                          AccessibilityEvent.TYPE_NOTIFICATION_STATE_CHANGED or
                          AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
        
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
        info.flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS or
                     AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS
        
        info.notificationTimeout = 100
        
        serviceInfo = info
        isServiceEnabled = true
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null || !isFocusModeActive) return
        
        when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> {
                handleWindowStateChanged(event)
            }
            
            AccessibilityEvent.TYPE_NOTIFICATION_STATE_CHANGED -> {
                handleNotificationStateChanged(event)
            }
            
            AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED -> {
                handleWindowContentChanged(event)
            }
        }
    }

    /**
     * Handle window state changes (app launches)
     */
    private fun handleWindowStateChanged(event: AccessibilityEvent) {
        val packageName = event.packageName?.toString() ?: return
        
        // Ignore system UI and our own package
        if (packageName == "com.android.systemui" || 
            packageName == "com.anonymous.focusshell") {
            return
        }
        
        currentForegroundPackage = packageName
        
        // Check if package is blocked
        if (blockedPackages.containsKey(packageName)) {
            blockCurrentApp()
        }
    }

    /**
     * Block the current app by going back to home screen
     */
    private fun blockCurrentApp() {
        // Perform global action to go home
        performGlobalAction(GLOBAL_ACTION_HOME)
        
        // TODO: Show toast notification to user
        // "This app is blocked during focus session"
    }

    /**
     * Handle notification events
     */
    private fun handleNotificationStateChanged(event: AccessibilityEvent) {
        val packageName = event.packageName?.toString() ?: return
        
        // If notification is from blocked package, try to dismiss it
        if (blockedPackages.containsKey(packageName)) {
            // Find and perform dismiss action
            val source = event.source
            dismissNotification(source)
        }
    }

    /**
     * Handle window content changes
     */
    private fun handleWindowContentChanged(event: AccessibilityEvent) {
        // Can be used for context-aware features
        // e.g., detecting if user is viewing distracting content
    }

    /**
     * Attempt to dismiss notification
     */
    private fun dismissNotification(node: AccessibilityNodeInfo?) {
        if (node == null) return
        
        try {
            // Look for dismissal action
            if (node.isDismissable) {
                node.performAction(AccessibilityNodeInfo.ACTION_DISMISS)
                return
            }
            
            // Recursively check children
            for (i in 0 until node.childCount) {
                dismissNotification(node.getChild(i))
            }
        } catch (e: Exception) {
            // Ignore errors in node traversal
        } finally {
            node.recycle()
        }
    }

    override fun onInterrupt() {
        // Service interrupted
    }

    override fun onDestroy() {
        super.onDestroy()
        isServiceEnabled = false
    }

    override fun onUnbind(intent: Intent?): Boolean {
        isServiceEnabled = false
        return super.onUnbind(intent)
    }
}
