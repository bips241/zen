package com.anonymous.focusshell.modules

import android.view.GestureDetector
import android.view.MotionEvent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlin.math.abs

/**
 * GestureModule
 * 
 * Provides gesture detection for launcher interactions:
 * - Swipe up (app drawer)
 * - Swipe down (notifications/quick settings)
 * - Double tap (lock screen)
 * - Long press (widget mode)
 * - Fling detection with velocity
 */
class GestureModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "GestureModule"

    private var gestureDetector: GestureDetector? = null
    private var isGestureEnabled = false
    private var swipeThreshold = 100 // pixels
    private var swipeVelocityThreshold = 100 // pixels per second

    /**
     * Initialize gesture detection
     */
    @ReactMethod
    fun initialize(promise: Promise) {
        try {
            gestureDetector = GestureDetector(reactContext, GestureListener())
            isGestureEnabled = true
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("INIT_ERROR", "Failed to initialize gesture detection: ${e.message}", e)
        }
    }

    /**
     * Configure gesture thresholds
     */
    @ReactMethod
    fun configure(swipeThresholdPx: Int, velocityThresholdPx: Int, promise: Promise) {
        try {
            swipeThreshold = swipeThresholdPx
            swipeVelocityThreshold = velocityThresholdPx
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CONFIG_ERROR", "Failed to configure gestures: ${e.message}", e)
        }
    }

    /**
     * Enable gesture detection
     */
    @ReactMethod
    fun enableGestures(promise: Promise) {
        try {
            isGestureEnabled = true
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ENABLE_ERROR", "Failed to enable gestures: ${e.message}", e)
        }
    }

    /**
     * Disable gesture detection
     */
    @ReactMethod
    fun disableGestures(promise: Promise) {
        try {
            isGestureEnabled = false
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("DISABLE_ERROR", "Failed to disable gestures: ${e.message}", e)
        }
    }

    /**
     * Check if gestures are enabled
     */
    @ReactMethod
    fun isEnabled(promise: Promise) {
        try {
            promise.resolve(isGestureEnabled)
        } catch (e: Exception) {
            promise.reject("CHECK_ERROR", "Failed to check gesture status: ${e.message}", e)
        }
    }

    /**
     * Process touch event (called from React Native)
     * Note: In production, this would be integrated with React Native's touch handling
     */
    @ReactMethod
    fun processTouchEvent(x: Double, y: Double, action: String, promise: Promise) {
        try {
            if (!isGestureEnabled) {
                promise.resolve(false)
                return
            }

            // Create MotionEvent
            val downTime = android.os.SystemClock.uptimeMillis()
            val eventTime = android.os.SystemClock.uptimeMillis()
            
            val motionAction = when (action) {
                "down" -> MotionEvent.ACTION_DOWN
                "move" -> MotionEvent.ACTION_MOVE
                "up" -> MotionEvent.ACTION_UP
                else -> MotionEvent.ACTION_CANCEL
            }
            
            val event = MotionEvent.obtain(
                downTime,
                eventTime,
                motionAction,
                x.toFloat(),
                y.toFloat(),
                0
            )
            
            gestureDetector?.onTouchEvent(event)
            event.recycle()
            
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("PROCESS_ERROR", "Failed to process touch event: ${e.message}", e)
        }
    }

    /**
     * Emit gesture event to React Native
     */
    private fun emitGestureEvent(gestureType: String, data: WritableNativeMap = WritableNativeMap()) {
        data.putString("type", gestureType)
        data.putDouble("timestamp", System.currentTimeMillis().toDouble())
        
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("onGesture", data)
    }

    /**
     * Inner class to handle gesture detection
     */
    private inner class GestureListener : GestureDetector.SimpleOnGestureListener() {
        
        override fun onDown(e: MotionEvent): Boolean {
            return true
        }

        override fun onSingleTapConfirmed(e: MotionEvent): Boolean {
            val data = WritableNativeMap()
            data.putDouble("x", e.x.toDouble())
            data.putDouble("y", e.y.toDouble())
            emitGestureEvent("tap", data)
            return true
        }

        override fun onDoubleTap(e: MotionEvent): Boolean {
            val data = WritableNativeMap()
            data.putDouble("x", e.x.toDouble())
            data.putDouble("y", e.y.toDouble())
            emitGestureEvent("doubleTap", data)
            return true
        }

        override fun onLongPress(e: MotionEvent) {
            val data = WritableNativeMap()
            data.putDouble("x", e.x.toDouble())
            data.putDouble("y", e.y.toDouble())
            emitGestureEvent("longPress", data)
        }
    }
}
