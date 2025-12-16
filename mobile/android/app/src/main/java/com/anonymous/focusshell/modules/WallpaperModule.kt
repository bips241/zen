package com.anonymous.focusshell.modules

import android.app.WallpaperManager
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.net.Uri
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.IOException

/**
 * WallpaperModule
 * 
 * Manages device wallpaper settings:
 * - Set solid colors (OLED-optimized)
 * - Set wallpaper from URI
 * - Clear wallpaper (reset to system default)
 * - Get current wallpaper info
 */
class WallpaperModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "WallpaperModule"

    /**
     * Set solid color wallpaper (OLED-optimized)
     * @param colorHex Hex color string (e.g., "#000000" for true black)
     */
    @ReactMethod
    fun setSolidColor(colorHex: String, promise: Promise) {
        try {
            val wallpaperManager = WallpaperManager.getInstance(reactContext)
            
            // Parse hex color
            val color = Color.parseColor(colorHex)
            
            // Create 1x1 bitmap with the color
            val bitmap = Bitmap.createBitmap(1, 1, Bitmap.Config.ARGB_8888)
            bitmap.eraseColor(color)
            
            wallpaperManager.setBitmap(bitmap)
            bitmap.recycle()
            
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SET_COLOR_ERROR", "Failed to set solid color wallpaper: ${e.message}", e)
        }
    }

    /**
     * Set wallpaper from image URI
     * @param imageUri URI string to image file (e.g., "file:///path/to/image.jpg")
     */
    @ReactMethod
    fun setWallpaperFromUri(imageUri: String, promise: Promise) {
        try {
            val wallpaperManager = WallpaperManager.getInstance(reactContext)
            val uri = Uri.parse(imageUri)
            
            // Open input stream from URI
            val inputStream = reactContext.contentResolver.openInputStream(uri)
                ?: throw IOException("Cannot open URI: $imageUri")
            
            inputStream.use { stream ->
                val bitmap = BitmapFactory.decodeStream(stream)
                    ?: throw IOException("Cannot decode image from URI")
                
                wallpaperManager.setBitmap(bitmap)
                bitmap.recycle()
            }
            
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SET_WALLPAPER_ERROR", "Failed to set wallpaper: ${e.message}", e)
        }
    }

    /**
     * Clear wallpaper (reset to system default)
     */
    @ReactMethod
    fun clearWallpaper(promise: Promise) {
        try {
            val wallpaperManager = WallpaperManager.getInstance(reactContext)
            wallpaperManager.clear()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CLEAR_WALLPAPER_ERROR", "Failed to clear wallpaper: ${e.message}", e)
        }
    }

    /**
     * Check if wallpaper change is supported
     */
    @ReactMethod
    fun isWallpaperSupported(promise: Promise) {
        try {
            val wallpaperManager = WallpaperManager.getInstance(reactContext)
            promise.resolve(wallpaperManager.isWallpaperSupported)
        } catch (e: Exception) {
            promise.reject("CHECK_SUPPORT_ERROR", "Failed to check wallpaper support: ${e.message}", e)
        }
    }

    /**
     * Check if setting wallpaper is allowed by device policy
     */
    @ReactMethod
    fun isSetWallpaperAllowed(promise: Promise) {
        try {
            val wallpaperManager = WallpaperManager.getInstance(reactContext)
            
            val isAllowed = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                wallpaperManager.isSetWallpaperAllowed
            } else {
                true // Assume allowed on older versions
            }
            
            promise.resolve(isAllowed)
        } catch (e: Exception) {
            promise.reject("CHECK_ALLOWED_ERROR", "Failed to check if wallpaper setting is allowed: ${e.message}", e)
        }
    }

    /**
     * Get desired minimum wallpaper dimensions
     */
    @ReactMethod
    fun getDesiredMinimumWidth(promise: Promise) {
        try {
            val wallpaperManager = WallpaperManager.getInstance(reactContext)
            promise.resolve(wallpaperManager.desiredMinimumWidth)
        } catch (e: Exception) {
            promise.reject("GET_WIDTH_ERROR", "Failed to get desired width: ${e.message}", e)
        }
    }

    /**
     * Get desired minimum wallpaper height
     */
    @ReactMethod
    fun getDesiredMinimumHeight(promise: Promise) {
        try {
            val wallpaperManager = WallpaperManager.getInstance(reactContext)
            promise.resolve(wallpaperManager.desiredMinimumHeight)
        } catch (e: Exception) {
            promise.reject("GET_HEIGHT_ERROR", "Failed to get desired height: ${e.message}", e)
        }
    }

    /**
     * Set black wallpaper (OLED-optimized for battery saving)
     */
    @ReactMethod
    fun setBlackWallpaper(promise: Promise) {
        setSolidColor("#000000", promise)
    }

    /**
     * Set dark gray wallpaper (subtle variant)
     */
    @ReactMethod
    fun setDarkGrayWallpaper(promise: Promise) {
        setSolidColor("#111111", promise)
    }
}
