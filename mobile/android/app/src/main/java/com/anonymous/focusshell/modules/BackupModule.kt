package com.anonymous.focusshell.modules

import android.content.Context
import android.os.Environment
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeMap
import org.json.JSONObject
import java.io.File
import java.io.FileWriter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * BackupModule
 * 
 * Provides backup and restore functionality for app settings:
 * - Export settings to JSON file
 * - Import settings from JSON file
 * - Auto-backup scheduling
 * - List available backups
 */
class BackupModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "BackupModule"

    private val backupDirectory: File
        get() {
            val dir = File(reactContext.getExternalFilesDir(null), "backups")
            if (!dir.exists()) {
                dir.mkdirs()
            }
            return dir
        }

    /**
     * Export settings to JSON backup file
     * @param settings ReadableMap of settings to backup
     * @param backupName Optional custom backup name
     */
    @ReactMethod
    fun exportSettings(settings: ReadableMap, backupName: String?, promise: Promise) {
        try {
            // Generate backup filename
            val timestamp = SimpleDateFormat("yyyy-MM-dd_HH-mm-ss", Locale.US).format(Date())
            val filename = backupName ?: "zen_backup_$timestamp.json"
            
            val backupFile = File(backupDirectory, filename)
            
            // Convert ReadableMap to JSONObject
            val jsonObject = convertMapToJson(settings)
            
            // Add metadata
            jsonObject.put("backupTimestamp", System.currentTimeMillis())
            jsonObject.put("backupVersion", "1.0")
            jsonObject.put("appVersion", reactContext.packageManager
                .getPackageInfo(reactContext.packageName, 0).versionName)
            
            // Write to file
            FileWriter(backupFile).use { writer ->
                writer.write(jsonObject.toString(2)) // Pretty print with indent
            }
            
            val result = WritableNativeMap().apply {
                putString("filePath", backupFile.absolutePath)
                putString("fileName", filename)
                putDouble("fileSize", backupFile.length().toDouble())
            }
            
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("EXPORT_ERROR", "Failed to export settings: ${e.message}", e)
        }
    }

    /**
     * Import settings from JSON backup file
     * @param filePath Path to backup file
     */
    @ReactMethod
    fun importSettings(filePath: String, promise: Promise) {
        try {
            val backupFile = File(filePath)
            
            if (!backupFile.exists()) {
                throw Exception("Backup file not found: $filePath")
            }
            
            // Read file content
            val jsonString = backupFile.readText()
            val jsonObject = JSONObject(jsonString)
            
            // Convert JSONObject to WritableMap
            val settings = convertJsonToMap(jsonObject)
            
            promise.resolve(settings)
        } catch (e: Exception) {
            promise.reject("IMPORT_ERROR", "Failed to import settings: ${e.message}", e)
        }
    }

    /**
     * List all available backup files
     */
    @ReactMethod
    fun listBackups(promise: Promise) {
        try {
            val backups = backupDirectory.listFiles { file ->
                file.isFile && file.extension == "json"
            }?.sortedByDescending { it.lastModified() } ?: emptyList()
            
            val result = com.facebook.react.bridge.WritableNativeArray()
            
            for (backup in backups) {
                val backupInfo = WritableNativeMap().apply {
                    putString("fileName", backup.name)
                    putString("filePath", backup.absolutePath)
                    putDouble("fileSize", backup.length().toDouble())
                    putDouble("lastModified", backup.lastModified().toDouble())
                    
                    // Try to read metadata
                    try {
                        val jsonString = backup.readText()
                        val jsonObject = JSONObject(jsonString)
                        
                        if (jsonObject.has("backupTimestamp")) {
                            putDouble("backupTimestamp", jsonObject.getDouble("backupTimestamp"))
                        }
                        if (jsonObject.has("appVersion")) {
                            putString("appVersion", jsonObject.getString("appVersion"))
                        }
                    } catch (e: Exception) {
                        // Ignore metadata read errors
                    }
                }
                result.pushMap(backupInfo)
            }
            
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("LIST_ERROR", "Failed to list backups: ${e.message}", e)
        }
    }

    /**
     * Delete a backup file
     * @param filePath Path to backup file to delete
     */
    @ReactMethod
    fun deleteBackup(filePath: String, promise: Promise) {
        try {
            val backupFile = File(filePath)
            
            if (!backupFile.exists()) {
                throw Exception("Backup file not found: $filePath")
            }
            
            val deleted = backupFile.delete()
            promise.resolve(deleted)
        } catch (e: Exception) {
            promise.reject("DELETE_ERROR", "Failed to delete backup: ${e.message}", e)
        }
    }

    /**
     * Get backup directory path
     */
    @ReactMethod
    fun getBackupDirectory(promise: Promise) {
        try {
            promise.resolve(backupDirectory.absolutePath)
        } catch (e: Exception) {
            promise.reject("GET_DIR_ERROR", "Failed to get backup directory: ${e.message}", e)
        }
    }

    /**
     * Check if external storage is available for backup
     */
    @ReactMethod
    fun isExternalStorageAvailable(promise: Promise) {
        try {
            val state = Environment.getExternalStorageState()
            val isAvailable = state == Environment.MEDIA_MOUNTED
            promise.resolve(isAvailable)
        } catch (e: Exception) {
            promise.reject("CHECK_STORAGE_ERROR", "Failed to check storage: ${e.message}", e)
        }
    }

    // Helper functions
    private fun convertMapToJson(readableMap: ReadableMap): JSONObject {
        val jsonObject = JSONObject()
        
        val iterator = readableMap.keySetIterator()
        while (iterator.hasNextKey()) {
            val key = iterator.nextKey()
            
            when (readableMap.getType(key)) {
                com.facebook.react.bridge.ReadableType.Null -> jsonObject.put(key, JSONObject.NULL)
                com.facebook.react.bridge.ReadableType.Boolean -> jsonObject.put(key, readableMap.getBoolean(key))
                com.facebook.react.bridge.ReadableType.Number -> jsonObject.put(key, readableMap.getDouble(key))
                com.facebook.react.bridge.ReadableType.String -> jsonObject.put(key, readableMap.getString(key))
                com.facebook.react.bridge.ReadableType.Map -> {
                    val nestedMap = readableMap.getMap(key)
                    if (nestedMap != null) {
                        jsonObject.put(key, convertMapToJson(nestedMap))
                    }
                }
                com.facebook.react.bridge.ReadableType.Array -> {
                    val array = readableMap.getArray(key)
                    if (array != null) {
                        val jsonArray = org.json.JSONArray()
                        for (i in 0 until array.size()) {
                            when (array.getType(i)) {
                                com.facebook.react.bridge.ReadableType.Boolean -> jsonArray.put(array.getBoolean(i))
                                com.facebook.react.bridge.ReadableType.Number -> jsonArray.put(array.getDouble(i))
                                com.facebook.react.bridge.ReadableType.String -> jsonArray.put(array.getString(i))
                                else -> {}
                            }
                        }
                        jsonObject.put(key, jsonArray)
                    }
                }
            }
        }
        
        return jsonObject
    }

    private fun convertJsonToMap(jsonObject: JSONObject): WritableNativeMap {
        val map = WritableNativeMap()
        
        val iterator = jsonObject.keys()
        while (iterator.hasNext()) {
            val key = iterator.next()
            val value = jsonObject.get(key)
            
            when (value) {
                is JSONObject -> map.putMap(key, convertJsonToMap(value))
                is Boolean -> map.putBoolean(key, value)
                is Int -> map.putInt(key, value)
                is Double -> map.putDouble(key, value)
                is String -> map.putString(key, value)
                is Long -> map.putDouble(key, value.toDouble())
                JSONObject.NULL -> map.putNull(key)
            }
        }
        
        return map
    }
}
